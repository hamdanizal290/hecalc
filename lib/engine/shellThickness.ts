// lib/engine/shellThickness.ts

import type { DesignCaseKey } from "../storage/projectDraft";

export type Units = "SI" | "US";
export type Standard = "API_650" | "API_620";

export interface ShellCaseInput {
  key: DesignCaseKey;
  liquidHeight: number; // SI: m, US: ft
}

export interface ShellCalcInput {
  units: Units;
  standard: Standard;

  diameter: number; // SI: m, US: ft
  courses: number[]; // SI: m, US: ft (bottom→top)

  specificGravity: number; // design SG
  corrosionAllowance: number; // SI: mm, US: in

  // design pressure from Step 0
  designPressure: number; // SI: kPa(g), US: psi(g)

  // Materials (Step 3)
  allowableStressDesign: number; // SI: MPa, US: psi
  allowableStressTest: number; // SI: MPa, US: psi
  jointEfficiency: number; // 0..1

  // min nominal thickness EXCLUDING CA (API min thickness, practical min, dll)
  minNominalThickness: number; // SI: mm, US: in

  // adopted thickness NOMINAL (umumnya sudah termasuk CA di dalam nominal plate)
  adoptedThicknesses: number[]; // SI: mm, US: in

  activeCases: ShellCaseInput[];
}

export interface CourseResult {
  courseNo: number;
  courseHeight: number;
  bottomElevation: number;

  // raw calc (tanpa min thickness; tapi sudah +CA sesuai formula/aturan)
  tCalcByCase: Partial<Record<DesignCaseKey, number>>;

  // setelah min thickness diterapkan
  tRequiredByCase: Partial<Record<DesignCaseKey, number>>;

  governingCase: DesignCaseKey;

  // governing raw calc (sebelum min)
  tCalcGoverning: number;

  // governing required (sesudah min), nominal incl CA, min applied
  tRequired: number;

  tAdopted: number;
  utilization: number; // tRequired / tAdopted
  status: "OK" | "NOT OK";

  // true kalau t_required dikontrol minNominalThickness + CA (bukan hasil t_calc)
  isMinControlled: boolean;
}

export interface ShellCalcResult {
  units: Units;
  standard: Standard;
  method: string;

  courseCount: number;
  results: CourseResult[];

  notes: string[];
}

const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);

const isFinitePos = (x: number) => Number.isFinite(x) && x > 0;

export function runShellThickness(input: ShellCalcInput): ShellCalcResult {
  const notes: string[] = [];

  const E = input.jointEfficiency;
  if (!(E > 0 && E <= 1)) {
    throw new Error("Joint efficiency (E) harus berada pada rentang (0, 1].");
  }

  const courseCount = input.courses.length;
  if (courseCount <= 0) {
    throw new Error("Courses kosong. Pastikan geometry sudah terisi.");
  }

  if (input.adoptedThicknesses.length !== courseCount) {
    throw new Error("Jumlah adopted thickness harus sama dengan jumlah courses.");
  }

  if (!isFinitePos(input.diameter)) {
    throw new Error("Diameter tidak valid.");
  }

  if (!isFinitePos(input.specificGravity)) {
    throw new Error("Specific gravity harus > 0.");
  }

  if (!Number.isFinite(input.corrosionAllowance) || input.corrosionAllowance < 0) {
    throw new Error("Corrosion allowance (CA) harus >= 0.");
  }

  if (!isFinitePos(input.allowableStressDesign) || !isFinitePos(input.allowableStressTest)) {
    throw new Error("Allowable stress harus > 0.");
  }

  if (!Number.isFinite(input.minNominalThickness) || input.minNominalThickness < 0) {
    throw new Error("Min nominal thickness harus >= 0.");
  }

  // offsets for API 650 one-foot method
  const offset = input.units === "SI" ? 0.3 : 1.0; // m or ft

  // API 650 constants (sesuai yang sering dipakai di form API 650)
  const constantSI = 4.9; // SI: output mm, D[m], H[m], S[MPa]
  const constantUS = 2.6; // US: output in, D[ft], H[ft], S[psi]

  const ca = input.corrosionAllowance;

  // min thickness rule kita apply pada NOMINAL thickness (excl CA) + CA
  const minWithCA = input.minNominalThickness + ca;

  if (input.standard === "API_650") {
    notes.push("API 650: One-Foot Method (evaluasi head pada 0.3 m / 1 ft di atas seam bawah tiap course).");
    notes.push("Engine menghitung t_calc (rumus + CA) lalu t_required = max(t_calc, minNominal+CA).");
    notes.push("Untuk tahap awal, internal pressure diabaikan (umumnya near-atmospheric).");
  } else {
    notes.push("API 620: pendekatan hoop stress (thin-walled cylinder) P_total = P_internal + P_hydrostatic.");
    notes.push("External pressure/vacuum buckling check belum di-cover pada tahap ini.");
  }

  const results: CourseResult[] = [];

  for (let i = 0; i < courseCount; i++) {
    const courseNo = i + 1;
    const bottomElevation = sum(input.courses.slice(0, i)); // bottom seam elevation course i
    const courseHeight = input.courses[i];

    const tCalcByCase: Partial<Record<DesignCaseKey, number>> = {};
    const tRequiredByCase: Partial<Record<DesignCaseKey, number>> = {};

    // governing ditentukan dari tRequiredByCase (yang udah kena min)
    let governingCase: DesignCaseKey = input.activeCases[0]?.key ?? "operating";
    let governingReq = -Infinity;

    // buat display/debug: governing raw calc
    let governingCalc = -Infinity;

    for (const c of input.activeCases) {
      const liquidHeight = c.liquidHeight;

      // height of liquid ABOVE bottom seam of this course
      // kalau liquidHeight < bottomElevation, berarti course ini di atas liquid line -> head 0
      const H_seam = Math.max(0, liquidHeight - bottomElevation);

      // one-foot evaluation point
      const H_eff = Math.max(0, H_seam - offset);

      const isHydrotest = c.key === "hydrotest";
      const G = isHydrotest ? 1.0 : input.specificGravity;
      const S = isHydrotest ? input.allowableStressTest : input.allowableStressDesign;

      let tCalc = 0;

      if (input.standard === "API_650") {
        // NOTE: internal pressure ignore (per catatan tool tahap awal)
        if (input.units === "SI") {
          // t_calc (mm) = (4.9 * D(m) * (H_eff)(m) * G) / (S(MPa)*E) + CA(mm)
          tCalc = (constantSI * input.diameter * H_eff * G) / (S * E) + ca;
        } else {
          // t_calc (in) = (2.6 * D(ft) * (H_eff)(ft) * G) / (S(psi)*E) + CA(in)
          tCalc = (constantUS * input.diameter * H_eff * G) / (S * E) + ca;
        }
      } else {
        // API 620 simplified hoop
        const P_hydro =
          input.units === "SI"
            ? 9.80665 * G * H_eff // kPa
            : 0.433 * G * H_eff; // psi

        const isEmptyCase = c.key === "empty_wind" || c.key === "empty_seismic";
        const P_int = isHydrotest || isEmptyCase ? 0 : Math.max(0, input.designPressure);
        const P_total = P_int + P_hydro;

        if (input.units === "SI") {
          const P_MPa = P_total / 1000; // kPa -> MPa
          const R_mm = (input.diameter * 1000) / 2; // m -> mm

          const denom = S * E - 0.6 * P_MPa;
          tCalc = denom <= 0 ? Number.POSITIVE_INFINITY : (P_MPa * R_mm) / denom + ca;
        } else {
          const R_in = input.diameter * 6; // D(ft)*12/2 = D*6
          const denom = S * E - 0.6 * P_total;
          tCalc = denom <= 0 ? Number.POSITIVE_INFINITY : (P_total * R_in) / denom + ca;
        }
      }

      // Guard: jangan biarin NaN
      if (!Number.isFinite(tCalc)) tCalc = Number.POSITIVE_INFINITY;

      // apply minimum rule
      const tReq = Math.max(tCalc, minWithCA);

      tCalcByCase[c.key] = tCalc;
      tRequiredByCase[c.key] = tReq;

      // governing by required
      if (tReq > governingReq) {
        governingReq = tReq;
        governingCase = c.key;
        governingCalc = tCalc;
      }
    }

    const tAdopted = input.adoptedThicknesses[i];
    const utilization = tAdopted > 0 ? governingReq / tAdopted : Number.POSITIVE_INFINITY;
    const status: "OK" | "NOT OK" = tAdopted >= governingReq ? "OK" : "NOT OK";

    const isMinControlled =
      Number.isFinite(governingCalc) && Number.isFinite(governingReq)
        ? governingReq <= minWithCA + 1e-12
        : false;

    results.push({
      courseNo,
      courseHeight,
      bottomElevation,

      tCalcByCase,
      tRequiredByCase,

      governingCase,
      tCalcGoverning: governingCalc,
      tRequired: governingReq,

      tAdopted,
      utilization,
      status,
      isMinControlled,
    });
  }

  return {
    units: input.units,
    standard: input.standard,
    method: input.standard === "API_650" ? "API 650 One-Foot Method" : "API 620 Hoop Stress Basis",
    courseCount,
    results,
    notes,
  };
}
