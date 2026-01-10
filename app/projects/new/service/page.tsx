"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  loadProjectDraft,
  updateProjectDraft,
  type ProjectDraft,
  type DesignCaseKey,
  type ServiceDraft,
  type GeometryDraft,
} from "../../../../lib/storage/projectDraft";

function StepPill({
  label,
  state,
}: {
  label: string;
  state: "done" | "active" | "next";
}) {
  const cls =
    state === "done"
      ? "bg-white/85 text-[rgb(var(--re-green))]"
      : state === "active"
        ? "bg-white shadow-sm text-[rgb(var(--re-blue))]"
        : "bg-white/60 re-muted";

  return (
    <span className={`px-3 py-1.5 rounded-2xl text-xs font-semibold border border-black/10 ${cls}`}>
      {label}
    </span>
  );
}

const toNumberOrNaN = (s: string) => {
  if (s.trim() === "") return NaN;
  const n = Number(s);
  return Number.isFinite(n) ? n : NaN;
};

const CASE_LABEL: Record<DesignCaseKey, { title: string; hint: string }> = {
  operating: { title: "Operating", hint: "Kondisi operasi normal." },
  hydrotest: { title: "Hydrotest", hint: "Uji hidrostatik (umumnya lebih tinggi dari operating)." },
  empty_wind: { title: "Empty + Wind", hint: "Empty/minimum level terhadap angin (stabilitas)." },
  empty_seismic: { title: "Empty + Seismic", hint: "Empty/minimum level terhadap gempa (uplift/overturning)." },
  vacuum: { title: "Vacuum / External", hint: "Case khusus vacuum/external pressure (stability check)." },
  steamout: { title: "Steam-out / Cleaning", hint: "Case khusus operasi abnormal/pembersihan." },
};

function getActiveCases(draft: ProjectDraft): DesignCaseKey[] {
  const dc = draft.designCases;
  if (!dc) return ["operating"];
  return (Object.keys(dc) as DesignCaseKey[]).filter((k) => dc[k]);
}

export default function NewProjectServicePage() {
  const router = useRouter();

  const [draft, setDraft] = useState<ProjectDraft | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Service
  const [storedProduct, setStoredProduct] = useState("");
  const [sg, setSg] = useState<string>("1");
  const [ca, setCa] = useState<string>("2"); // default SI
  const [liquidHeights, setLiquidHeights] = useState<Record<DesignCaseKey, string>>({
    operating: "",
    hydrotest: "",
    empty_wind: "0",
    empty_seismic: "0",
    vacuum: "0",
    steamout: "0",
  });

  // Geometry
  const [diameter, setDiameter] = useState<string>("");
  const [shellHeight, setShellHeight] = useState<string>("");
  const [numCourses, setNumCourses] = useState<string>("6");
  const [typicalCourseHeight, setTypicalCourseHeight] = useState<string>("2.5");
  const [courseHeights, setCourseHeights] = useState<string[]>([]);

  useEffect(() => {
    const d = loadProjectDraft();
    setDraft(d);

    if (d) {
      // defaults by unit
      if (d.units === "US") {
        setCa("0.125");
        setTypicalCourseHeight("8");
        setNumCourses("6");
      } else {
        setCa("2");
        setTypicalCourseHeight("2.5");
        setNumCourses("6");
      }

      // hydrate from saved
      if (d.service) {
        setStoredProduct(d.service.storedProduct ?? "");
        setSg(String(d.service.specificGravity ?? 1));
        setCa(String(d.service.corrosionAllowance ?? (d.units === "SI" ? 2 : 0.125)));

        setLiquidHeights((prev) => {
          const next = { ...prev };
          const lh = d.service?.liquidHeights ?? {};
          (Object.keys(next) as DesignCaseKey[]).forEach((k) => {
            if (lh[k] !== undefined) next[k] = String(lh[k]);
          });
          return next;
        });
      }

      if (d.geometry) {
        setDiameter(String(d.geometry.diameter ?? ""));
        setShellHeight(String(d.geometry.shellHeight ?? ""));
        setCourseHeights((d.geometry.courses ?? []).map((x) => String(x)));
      }
    }

    setHydrated(true);
  }, []);

  const activeCases = useMemo(() => (draft ? getActiveCases(draft) : []), [draft]);

  const lengthUnit = useMemo(() => (draft?.units === "US" ? "ft" : "m"), [draft]);
  const caUnit = useMemo(() => (draft?.units === "US" ? "in" : "mm"), [draft]);

  const sumCourses = useMemo(() => {
    const arr = courseHeights.map(toNumberOrNaN).filter((x) => Number.isFinite(x));
    return arr.reduce((a, b) => a + b, 0);
  }, [courseHeights]);

  const generateCourses = () => {
    const H = toNumberOrNaN(shellHeight);
    const n = Number.parseInt(numCourses, 10);
    const h = toNumberOrNaN(typicalCourseHeight);

    if (!Number.isFinite(H) || H <= 0) return;
    if (!Number.isFinite(h) || h <= 0) return;
    if (!Number.isFinite(n) || n < 1) return;

    const last = H - h * (n - 1);
    if (!(last > 0)) return;

    const arr: string[] = Array.from({ length: n }, (_, i) => (i === n - 1 ? String(last) : String(h)));
    setCourseHeights(arr);
  };

  const fillDefaultsFromShellHeight = () => {
    const H = toNumberOrNaN(shellHeight);
    if (!Number.isFinite(H) || H <= 0) return;

    // Default: operating 90% shell, hydrotest 100%, empty cases 0
    const op = Math.max(0, 0.9 * H);
    const ht = H;

    setLiquidHeights((prev) => ({
      ...prev,
      operating: prev.operating.trim() ? prev.operating : String(op.toFixed(3)),
      hydrotest: prev.hydrotest.trim() ? prev.hydrotest : String(ht.toFixed(3)),
      empty_wind: prev.empty_wind.trim() ? prev.empty_wind : "0",
      empty_seismic: prev.empty_seismic.trim() ? prev.empty_seismic : "0",
      vacuum: prev.vacuum.trim() ? prev.vacuum : "0",
      steamout: prev.steamout.trim() ? prev.steamout : "0",
    }));
  };

  const errors = useMemo(() => {
    const e: string[] = [];
    if (!draft) e.push("Draft project tidak ditemukan. Silakan kembali ke Step 0.");

    const sgN = toNumberOrNaN(sg);
    if (!Number.isFinite(sgN) || sgN <= 0) e.push("Specific gravity (SG) wajib diisi dan > 0.");

    const caN = toNumberOrNaN(ca);
    if (!Number.isFinite(caN) || caN < 0) e.push("Corrosion allowance (CA) wajib diisi dan ≥ 0.");

    const D = toNumberOrNaN(diameter);
    if (!Number.isFinite(D) || D <= 0) e.push("Diameter tank wajib diisi dan > 0.");

    const H = toNumberOrNaN(shellHeight);
    if (!Number.isFinite(H) || H <= 0) e.push("Shell height wajib diisi dan > 0.");

    if (courseHeights.length < 1) e.push("Course table belum ada. Klik “Generate course table”.");
    const ch = courseHeights.map(toNumberOrNaN);
    if (ch.some((x) => !Number.isFinite(x) || x <= 0)) e.push("Semua tinggi course harus angka dan > 0.");

    // liquid heights minimal
    if (draft) {
      const act = getActiveCases(draft);

      // operating always active in Step 1 (by design)
      if (act.includes("operating")) {
        const op = toNumberOrNaN(liquidHeights.operating);
        if (!Number.isFinite(op) || op < 0) e.push("Liquid height untuk Operating wajib diisi (angka ≥ 0).");
      }

      if (act.includes("hydrotest")) {
        const ht = toNumberOrNaN(liquidHeights.hydrotest);
        if (!Number.isFinite(ht) || ht < 0) e.push("Liquid height untuk Hydrotest wajib diisi (angka ≥ 0).");
      }

      // active optional cases: if blank, boleh (akan disimpan sebagai 0)
      for (const k of act) {
        const sVal = liquidHeights[k];
        if (sVal.trim() !== "") {
          const nVal = toNumberOrNaN(sVal);
          if (!Number.isFinite(nVal) || nVal < 0) e.push(`Liquid height untuk ${CASE_LABEL[k].title} harus angka ≥ 0.`);
        }
      }
    }

    return e;
  }, [draft, sg, ca, diameter, shellHeight, courseHeights, liquidHeights]);

  const warnings = useMemo(() => {
    const w: string[] = [];
    const H = toNumberOrNaN(shellHeight);
    if (Number.isFinite(H) && courseHeights.length > 0) {
      const diff = Math.abs(sumCourses - H);
      if (diff > 1e-6) {
        w.push(`Total tinggi course (${sumCourses.toFixed(3)} ${lengthUnit}) tidak sama dengan shell height (${H.toFixed(3)} ${lengthUnit}).`);
      }
    }
    if (draft) {
      const Hs = toNumberOrNaN(shellHeight);
      if (Number.isFinite(Hs)) {
        for (const k of getActiveCases(draft)) {
          const lh = toNumberOrNaN(liquidHeights[k] ?? "");
          if (Number.isFinite(lh) && lh > Hs + 1e-6) {
            w.push(`Liquid height case ${CASE_LABEL[k].title} lebih besar dari shell height. Periksa input.`);
          }
        }
      }
    }
    return w;
  }, [draft, shellHeight, courseHeights.length, sumCourses, liquidHeights, lengthUnit]);

  const canContinue = hydrated && errors.length === 0;

  const handleSaveContinue = () => {
    if (!draft || !canContinue) return;

    const sgN = toNumberOrNaN(sg);
    const caN = toNumberOrNaN(ca);
    const D = toNumberOrNaN(diameter);
    const H = toNumberOrNaN(shellHeight);

    const courses = courseHeights.map(toNumberOrNaN).map((x) => (Number.isFinite(x) ? x : 0)).filter((x) => x > 0);

    const act = getActiveCases(draft);
    const lh: Partial<Record<DesignCaseKey, number>> = {};
    for (const k of act) {
      const sVal = liquidHeights[k] ?? "";
      const nVal = toNumberOrNaN(sVal);
      lh[k] = Number.isFinite(nVal) ? nVal : 0; // blank -> 0
    }

    const service: ServiceDraft = {
      storedProduct: storedProduct.trim() || undefined,
      specificGravity: sgN,
      corrosionAllowance: caN,
      liquidHeights: lh,
    };

    const geometry: GeometryDraft = {
      diameter: D,
      shellHeight: H,
      courses,
    };

    updateProjectDraft({ service, geometry });
    router.push("/projects/new/materials");
  };

  if (!hydrated) {
    return (
      <main className="min-h-screen re-geo">
        <div className="mx-auto max-w-6xl px-6 py-10 md:px-10 md:py-14">
          <div className="re-card rounded-[2rem] p-7 md:p-9">
            <div className="text-sm re-muted">Memuat draft project...</div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen re-geo">
      <div className="mx-auto max-w-6xl px-6 py-10 md:px-10 md:py-14">
        {/* HEADER */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-6">
            <div className="shrink-0">
              <div className="h-14 w-40 md:h-16 md:w-52 rounded-3xl bg-white/90 border border-black/10 shadow-sm flex items-center justify-center px-3">
                <Image
                  src="/re-logo.png"
                  alt="Rekayasa Engineering"
                  width={560}
                  height={200}
                  className="w-full h-full object-contain"
                  priority
                />
              </div>
            </div>

            <div className="hidden sm:block">
              <div className="text-xs md:text-sm re-muted">Projects • New</div>
              <div className="mt-1 text-sm re-muted">Step 2 — Service & Geometry</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/projects/new/config"
              className="px-4 py-2 rounded-2xl text-sm font-semibold border border-black/10 bg-white/70 hover:bg-white/90 transition"
            >
              Kembali (Step 1)
            </Link>
          </div>
        </div>

        {/* STEPPER */}
        <div className="mt-6 flex flex-wrap gap-2">
          <StepPill label="Step 0 • Initiation" state="done" />
          <StepPill label="Step 1 • Config & Cases" state="done" />
          <StepPill label="Step 2 • Service & Geometry" state="active" />
          <StepPill label="Step 3 • Materials" state="next" />
          <StepPill label="Step 4 • Results" state="next" />
        </div>

        {/* CONTENT */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* LEFT */}
          <div className="lg:col-span-7 re-card rounded-[2rem] p-7 md:p-9">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[rgb(var(--re-ink))]">
              Service & Geometry
            </h1>

            <p className="mt-2 text-sm md:text-base re-muted leading-relaxed">
              Isi data fluida (SG + CA), liquid height per design case, dan geometri tank (diameter + course table).
              Kalkulasi shell thickness di Step 4 akan memakai data ini.
            </p>

            {/* SERVICE */}
            <div className="mt-7 rounded-2xl border border-black/10 bg-white/60 p-5">
              <div className="text-sm font-semibold text-[rgb(var(--re-blue))]">Service (Fluida)</div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="block">
                  <div className="text-sm font-semibold text-[rgb(var(--re-ink))]">Stored product (opsional)</div>
                  <input
                    value={storedProduct}
                    onChange={(e) => setStoredProduct(e.target.value)}
                    placeholder="Contoh: Diesel / Crude Oil / Water"
                    className="mt-2 w-full rounded-2xl border border-black/10 bg-white/90 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black/10"
                  />
                </label>

                <label className="block">
                  <div className="text-sm font-semibold text-[rgb(var(--re-ink))]">Specific gravity (SG) *</div>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="any"
                    value={sg}
                    onChange={(e) => setSg(e.target.value)}
                    placeholder="Contoh: 0.85 / 1.00"
                    className="mt-2 w-full rounded-2xl border border-black/10 bg-white/90 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black/10"
                  />
                </label>

                <label className="block">
                  <div className="text-sm font-semibold text-[rgb(var(--re-ink))]">
                    Corrosion allowance (CA) * ({caUnit})
                  </div>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="any"
                    value={ca}
                    onChange={(e) => setCa(e.target.value)}
                    placeholder={draft?.units === "US" ? "Contoh: 0.125" : "Contoh: 2"}
                    className="mt-2 w-full rounded-2xl border border-black/10 bg-white/90 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black/10"
                  />
                </label>
              </div>
            </div>

            {/* CASE HEIGHTS */}
            <div className="mt-6 rounded-2xl border border-black/10 bg-white/60 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-sm font-semibold text-[rgb(var(--re-blue))]">Liquid height per design case</div>
                <button
                  type="button"
                  onClick={fillDefaultsFromShellHeight}
                  className="px-4 py-2 rounded-2xl text-sm font-semibold border border-black/10 bg-white/70 hover:bg-white/90 transition"
                >
                  Isi default dari shell height
                </button>
              </div>

              <div className="mt-4 space-y-3">
                {activeCases.map((k) => (
                  <div
                    key={k}
                    className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 rounded-2xl border border-black/10 bg-white/70 px-4 py-3"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-[rgb(var(--re-ink))]">{CASE_LABEL[k].title}</div>
                      <div className="text-sm re-muted">{CASE_LABEL[k].hint}</div>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        inputMode="decimal"
                        step="any"
                        value={liquidHeights[k] ?? ""}
                        onChange={(e) =>
                          setLiquidHeights((prev) => ({ ...prev, [k]: e.target.value }))
                        }
                        placeholder="0"
                        className="w-44 rounded-2xl border border-black/10 bg-white/90 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10"
                      />
                      <span className="text-sm re-muted">{lengthUnit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* GEOMETRY */}
            <div className="mt-6 rounded-2xl border border-black/10 bg-white/60 p-5">
              <div className="text-sm font-semibold text-[rgb(var(--re-blue))]">Geometry</div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="block">
                  <div className="text-sm font-semibold text-[rgb(var(--re-ink))]">
                    Diameter tank (D) * ({lengthUnit})
                  </div>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="any"
                    value={diameter}
                    onChange={(e) => setDiameter(e.target.value)}
                    placeholder={draft?.units === "US" ? "Contoh: 40" : "Contoh: 12"}
                    className="mt-2 w-full rounded-2xl border border-black/10 bg-white/90 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black/10"
                  />
                </label>

                <label className="block">
                  <div className="text-sm font-semibold text-[rgb(var(--re-ink))]">
                    Shell height (Hshell) * ({lengthUnit})
                  </div>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="any"
                    value={shellHeight}
                    onChange={(e) => setShellHeight(e.target.value)}
                    placeholder={draft?.units === "US" ? "Contoh: 40" : "Contoh: 12"}
                    className="mt-2 w-full rounded-2xl border border-black/10 bg-white/90 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black/10"
                  />
                </label>

                <label className="block">
                  <div className="text-sm font-semibold text-[rgb(var(--re-ink))]">Jumlah courses *</div>
                  <input
                    type="number"
                    inputMode="numeric"
                    step="1"
                    value={numCourses}
                    onChange={(e) => setNumCourses(e.target.value)}
                    placeholder="6"
                    className="mt-2 w-full rounded-2xl border border-black/10 bg-white/90 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black/10"
                  />
                </label>

                <label className="block">
                  <div className="text-sm font-semibold text-[rgb(var(--re-ink))]">
                    Typical course height * ({lengthUnit})
                  </div>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="any"
                    value={typicalCourseHeight}
                    onChange={(e) => setTypicalCourseHeight(e.target.value)}
                    placeholder={draft?.units === "US" ? "Contoh: 8" : "Contoh: 2.5"}
                    className="mt-2 w-full rounded-2xl border border-black/10 bg-white/90 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black/10"
                  />
                </label>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={generateCourses}
                  className="px-4 py-2 rounded-2xl text-sm font-semibold text-white bg-[rgb(var(--re-blue))] hover:opacity-95 transition shadow"
                >
                  Generate course table
                </button>

                <button
                  type="button"
                  onClick={() => setCourseHeights([])}
                  className="px-4 py-2 rounded-2xl text-sm font-semibold border border-black/10 bg-white/70 hover:bg-white/90 transition re-muted"
                >
                  Reset course table
                </button>
              </div>

              {courseHeights.length > 0 ? (
                <div className="mt-5">
                  <div className="text-sm font-semibold text-[rgb(var(--re-ink))]">Course table (bottom → top)</div>
                  <div className="mt-3 space-y-2">
                    {courseHeights.map((h, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-3 rounded-2xl border border-black/10 bg-white/70 px-4 py-3"
                      >
                        <div className="text-sm font-semibold text-[rgb(var(--re-blue))]">
                          Course {idx + 1}
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            inputMode="decimal"
                            step="any"
                            value={h}
                            onChange={(e) => {
                              const v = e.target.value;
                              setCourseHeights((prev) => prev.map((x, i) => (i === idx ? v : x)));
                            }}
                            className="w-40 rounded-2xl border border-black/10 bg-white/90 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10"
                          />
                          <span className="text-sm re-muted">{lengthUnit}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 text-sm re-muted">
                    Total course height: <strong>{sumCourses.toFixed(3)}</strong> {lengthUnit}
                  </div>
                </div>
              ) : null}
            </div>

            {/* ERRORS */}
            {errors.length > 0 ? (
              <div className="mt-6 rounded-2xl border border-red-200 bg-white/80 p-5">
                <div className="text-sm font-semibold text-red-600">Periksa sebelum lanjut</div>
                <ul className="mt-2 list-disc pl-5 text-sm text-red-600">
                  {errors.map((x, i) => (
                    <li key={i}>{x}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {/* WARNINGS */}
            {warnings.length > 0 ? (
              <div className="mt-4 rounded-2xl border border-black/10 bg-white/70 p-5">
                <div className="text-sm font-semibold text-[rgb(var(--re-orange))]">Catatan</div>
                <ul className="mt-2 list-disc pl-5 text-sm re-muted">
                  {warnings.map((x, i) => (
                    <li key={i}>{x}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {/* ACTIONS */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleSaveContinue}
                disabled={!canContinue}
                className={[
                  "px-8 py-4 rounded-2xl text-base font-semibold text-white shadow transition",
                  canContinue ? "bg-[rgb(var(--re-blue))] hover:opacity-95" : "bg-black/30 cursor-not-allowed",
                ].join(" ")}
              >
                Simpan & Lanjut (Step 3)
              </button>

              <Link
                href="/projects/new/config"
                className="px-6 py-4 rounded-2xl text-base font-semibold border border-black/10 bg-white/70 hover:bg-white/90 transition"
              >
                Kembali (Step 1)
              </Link>
            </div>
          </div>

          {/* RIGHT SUMMARY */}
          <div className="lg:col-span-5 re-card rounded-[2rem] p-6 md:p-7">
            <div className="text-xs re-muted">Ringkasan</div>
            <div className="mt-1 text-lg font-semibold text-[rgb(var(--re-blue))]">Project Summary</div>

            <div className="mt-5 rounded-2xl border border-black/10 bg-white/60 p-5 text-sm re-muted leading-relaxed">
              {draft ? (
                <>
                  <div><strong className="text-[rgb(var(--re-ink))]">Project:</strong> {draft.projectName}</div>
                  <div><strong className="text-[rgb(var(--re-ink))]">Units:</strong> {draft.units}</div>
                  <div className="mt-2">
                    <strong className="text-[rgb(var(--re-ink))]">Standard (auto):</strong>{" "}
                    {draft.recommendedStandard === "API_650"
                      ? "API 650"
                      : draft.recommendedStandard === "API_620"
                        ? "API 620"
                        : "Out-of-scope"}
                  </div>

                  <div className="mt-4">
                    <strong className="text-[rgb(var(--re-ink))]">Active cases:</strong>{" "}
                    {activeCases.length}
                  </div>
                </>
              ) : (
                <div>Draft tidak ditemukan.</div>
              )}
            </div>

            <div className="mt-6 rounded-2xl border border-black/10 bg-white/60 p-4 text-sm re-muted leading-relaxed">
              Step 3 akan minta: <strong>allowable stress</strong>, <strong>joint efficiency</strong>, dan
              <strong> adopted thickness</strong> per course untuk verifikasi OK/NOT OK.
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
