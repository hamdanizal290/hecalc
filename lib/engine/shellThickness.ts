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
  minNominalThickness: number; // SI: mm, US: in (excluding CA)

  // adopted/nominal thickness per course (including CA assumed)
  adoptedThicknesses: number[]; // SI: mm, US: in

  activeCases: ShellCaseInput[];
}

export interface CourseResult {
  courseNo: number;
  courseHeight: number;
  bottomElevation: number;

  // Debug-friendly:
  calcByCase: Partial<Record<DesignCaseKey, number>>; // t_calc (formula + CA, sebelum min)
  requiredByCase: Partial<Record<DesignCaseKey, number>>; // t_required (setelah min)

  governingCase: DesignCaseKey;

  tCalcGoverning: number; // t_calc untuk governing case (before min)
  tRequired: number; // t_required untuk governing case (after min)
  isMinControlled: boolean; // true kalau t_required = minNominal + CA (plateau)

  tAdopted: number;
  utilization: number; // tRequired / tAdopted
  status: "OK" | "NOT OK";
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

export function runShellThickness(input: ShellCalcInput): ShellCalcResult {
  const notes: string[] = [];

  const E = input.jointEfficiency;
  if (!(E > 0 && E <= 1)) {
    throw new Error("Joint efficiency (E) harus berada pada rentang (0, 1].");
  }

  const courseCount = input.courses.length;
  if (input.adoptedThicknesses.length !== courseCount) {
    throw new Error("Jumlah adopted thickness harus sama dengan jumlah courses.");
  }

  // API 650 one-foot method offset
  const offset = input.units === "SI" ? 0.3 : 1.0; // m or ft
  const constantSI = 4.9; // API 650 SI form (mm)
  const constantUS = 2.6; // API 650 US form (inch)

  const ca = input.corrosionAllowance;
  const minWithCA = input.minNominalThickness + ca;

  if (input.standard === "API_650") {
    notes.push(
      "API 650: One-Foot Method (evaluasi head pada 0.3 m / 1 ft di atas seam bawah tiap course)."
    );
    notes.push(
      "Catatan: t_required = max(t_calc, minNominalThickness + CA). Kalau t_calc < minimum, hasil akan 'plateau' (rata/bulet)."
    );
  } else {
    notes.push(
      "API 620: pendekatan hoop stress berbasis thin-walled cylinder (P_total = P_internal + P_hydrostatic)."
    );
    notes.push(
      "Catatan: check external pressure/vacuum buckling belum masuk tahap ini (akan masuk modul stabilitas)."
    );
  }

  const results: CourseResult[] = [];

  for (let i = 0; i < courseCount; i++) {
    const courseNo = i + 1;
    const bottomElevation = sum(input.courses.slice(0, i));
    const courseHeight = input.courses[i];

    const calcByCase: Partial<Record<DesignCaseKey, number>> = {};
    const requiredByCase: Partial<Record<DesignCaseKey, number>> = {};

    let governingCase: DesignCaseKey = input.activeCases[0]?.key ?? "operating";
    let governingReq = -Infinity;
    let governingCalc = 0;

    for (const c of input.activeCases) {
      const liquidHeight = c.liquidHeight;

      // Depth above bottom seam of this course
      const depthAboveSeam = Math.max(0, liquidHeight - bottomElevation);

      // One-foot evaluation point offset
      const H_eff = Math.max(0, depthAboveSeam - offset);

      const isHydrotest = c.key === "hydrotest";
      const G = isHydrotest ? 1.0 : input.specificGravity;
      const S = isHydrotest ? input.allowableStressTest : input.allowableStressDesign;

      let tCalc = 0;

      if (input.standard === "API_650") {
        if (input.units === "SI") {
          // t (mm) = (4.9 * D(m) * (H-0.3)(m) * G) / (S(MPa)*E) + CA(mm)
          tCalc = (constantSI * input.diameter * H_eff * G) / (S * E) + ca;
        } else {
          // t (in) = (2.6 * D(ft) * (H-1)(ft) * G) / (S(psi)*E) + CA(in)
          tCalc = (constantUS * input.diameter * H_eff * G) / (S * E) + ca;
        }
      } else {
        // API 620 (simplified hoop stress basis)
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
          const R_in = input.diameter * 6; // D(ft)*12/2
          const denom = S * E - 0.6 * P_total;
          tCalc = denom <= 0 ? Number.POSITIVE_INFINITY : (P_total * R_in) / denom + ca;
        }
      }

      const tReq = Math.max(tCalc, minWithCA);

      calcByCase[c.key] = tCalc;
      requiredByCase[c.key] = tReq;

      if (tReq >= governingReq) {
        governingReq = tReq;
        governingCalc = tCalc;
        governingCase = c.key;
      }
    }

    const tAdopted = input.adoptedThicknesses[i];
    const utilization = tAdopted > 0 ? governingReq / tAdopted : Number.POSITIVE_INFINITY;
    const status: "OK" | "NOT OK" = tAdopted >= governingReq ? "OK" : "NOT OK";

    const eps = input.units === "SI" ? 1e-6 : 1e-9;
    const isMinControlled = governingReq <= minWithCA + eps && governingCalc < minWithCA - eps;

    results.push({
      courseNo,
      courseHeight,
      bottomElevation,
      calcByCase,
      requiredByCase,
      governingCase,
      tCalcGoverning: governingCalc,
      tRequired: governingReq,
      isMinControlled,
      tAdopted,
      utilization,
      status,
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
