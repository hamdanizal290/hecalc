"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import {
  loadProjectDraft,
  type ProjectDraft,
} from "../../../lib/storage/projectDraft";

import { runShellThickness } from "../../../lib/engine/shellThickness";

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
    <span
      className={`px-3 py-1.5 rounded-2xl text-xs font-semibold border border-black/10 ${cls}`}
    >
      {label}
    </span>
  );
}

const fmt = (x: number, digits = 2) =>
  Number.isFinite(x) ? x.toFixed(digits) : "-";

export default function ResultsPage() {
  const [draft, setDraft] = useState<ProjectDraft | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const [showCalc, setShowCalc] = useState(true);

  useEffect(() => {
    setDraft(loadProjectDraft());
    setHydrated(true);
  }, []);

  const units = draft?.units ?? "SI";
  const lengthUnit = units === "US" ? "ft" : "m";
  const thickUnit = units === "US" ? "in" : "mm";

  const minWithCA = useMemo(() => {
    const ca = draft?.service?.corrosionAllowance;
    const minNom = draft?.materials?.minNominalThickness;
    if (!Number.isFinite(ca as number) || !Number.isFinite(minNom as number)) return NaN;
    return (minNom as number) + (ca as number);
  }, [draft]);

  const engineResult = useMemo(() => {
    if (!draft) return null;

    // minimal guard supaya ga nge-crash
    if (!draft.geometry?.diameter) return null;
    if (!draft.geometry?.courses?.length) return null;
    if (!draft.service?.specificGravity) return null;
    if (draft.service?.corrosionAllowance === undefined) return null;
    if (!draft.materials) return null;

    const adopted = draft.materials.adoptedThicknesses ?? [];
    if (adopted.length !== draft.geometry.courses.length) return null;

    const activeCases = (draft.designCases
      ? (Object.keys(draft.designCases) as any[]).filter((k) => draft.designCases?.[k])
      : ["operating"]
    ).map((k) => ({
      key: k,
      liquidHeight: draft.service?.liquidHeights?.[k] ?? 0,
    }));

    return runShellThickness({
      units: draft.units,
      standard: draft.recommendedStandard ?? "API_650",

      diameter: draft.geometry.diameter,
      courses: draft.geometry.courses,

      specificGravity: draft.service.specificGravity,
      corrosionAllowance: draft.service.corrosionAllowance,

      designPressure: draft.envelope?.designPressure ?? 0,

      allowableStressDesign: draft.materials.allowableStressDesign,
      allowableStressTest: draft.materials.allowableStressTest,
      jointEfficiency: draft.materials.jointEfficiency,
      minNominalThickness: draft.materials.minNominalThickness,
      adoptedThicknesses: adopted,

      activeCases,
    });
  }, [draft]);

  const criticalNote = useMemo(() => {
    if (!engineResult) return null;
    if (!Number.isFinite(minWithCA)) return null;

    const allFloored = engineResult.results.every((r) => {
      // “Floored” kalau tRequired sama dengan minWithCA (within tolerance)
      return Math.abs(r.tRequired - minWithCA) < 1e-6;
    });

    return allFloored
      ? `Semua course terkena minimum thickness floor: t_required = max(t_calc, minNominal + CA) = ${fmt(minWithCA)} ${thickUnit}. Makanya t_required terlihat rata.`
      : null;
  }, [engineResult, minWithCA, thickUnit]);

  if (!hydrated) {
    return (
      <main className="min-h-screen re-geo">
        <div className="mx-auto max-w-6xl px-6 py-10 md:px-10 md:py-14">
          <div className="re-card rounded-[2rem] p-7 md:p-9">
            <div className="text-sm re-muted">Memuat hasil...</div>
          </div>
        </div>
      </main>
    );
  }

  if (!draft) {
    return (
      <main className="min-h-screen re-geo">
        <div className="mx-auto max-w-6xl px-6 py-10 md:px-10 md:py-14">
          <div className="re-card rounded-[2rem] p-7 md:p-9">
            <div className="text-sm font-semibold text-red-600">
              Draft project tidak ditemukan.
            </div>
            <div className="mt-4">
              <Link
                href="/projects/new"
                className="px-4 py-2 rounded-2xl text-sm font-semibold border border-black/10 bg-white/70 hover:bg-white/90 transition"
              >
                Kembali ke Step 0
              </Link>
            </div>
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
              <div className="mt-1 text-sm re-muted">
                Step 4 — Shell Thickness Results
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/projects/new/materials"
              className="px-4 py-2 rounded-2xl text-sm font-semibold border border-black/10 bg-white/70 hover:bg-white/90 transition"
            >
              Kembali (Step 3)
            </Link>

            <Link
              href="/projects"
              className="px-4 py-2 rounded-2xl text-sm font-semibold border border-black/10 bg-white/70 hover:bg-white/90 transition"
            >
              Saved Projects
            </Link>
          </div>
        </div>

        {/* STEPPER */}
        <div className="mt-6 flex flex-wrap gap-2">
          <StepPill label="Step 0 • Initiation" state="done" />
          <StepPill label="Step 1 • Config & Cases" state="done" />
          <StepPill label="Step 2 • Service & Geometry" state="done" />
          <StepPill label="Step 3 • Materials" state="done" />
          <StepPill label="Step 4 • Results" state="active" />
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* LEFT */}
          <div className="lg:col-span-8 re-card rounded-[2rem] p-7 md:p-9">
            <div className="text-xs re-muted">Ringkasan hasil</div>
            <h1 className="mt-2 text-2xl md:text-3xl font-extrabold tracking-tight text-[rgb(var(--re-ink))]">
              Shell Thickness — OK/NOT OK per Course
            </h1>
            <p className="mt-2 text-sm md:text-base re-muted leading-relaxed">
              Di bawah ini ada dua angka: <strong>t_calc</strong> (hasil rumus)
              dan <strong>t_required</strong> (sesudah minimum thickness).
              Kalau t_required rata, biasanya karena minimum thickness floor yang dominan.
            </p>

            {/* Controls */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-black/10 bg-white/70 p-4">
              <div className="text-sm font-semibold text-[rgb(var(--re-blue))]">
                Tampilan tabel
              </div>

              <button
                type="button"
                onClick={() => setShowCalc((v) => !v)}
                className="px-4 py-2 rounded-2xl text-sm font-semibold border border-black/10 bg-white/80 hover:bg-white transition"
              >
                {showCalc ? "Sembunyikan t_calc" : "Tampilkan t_calc"}
              </button>
            </div>

            {/* Notes */}
            {engineResult?.notes?.length ? (
              <div className="mt-6 rounded-2xl border border-black/10 bg-white/70 p-5">
                <div className="text-sm font-semibold text-[rgb(var(--re-blue))]">
                  Metode & catatan
                </div>
                <div className="mt-2 text-sm re-muted leading-relaxed">
                  <div className="font-semibold text-[rgb(var(--re-ink))]">
                    Method: {engineResult.method}
                  </div>
                  <ul className="mt-2 list-disc pl-5">
                    {engineResult.notes.map((n, i) => (
                      <li key={i}>{n}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : null}

            {criticalNote ? (
              <div className="mt-4 rounded-2xl border border-[rgb(var(--re-orange))]/30 bg-white/80 p-5">
                <div className="text-sm font-semibold text-[rgb(var(--re-orange))]">
                  Kenapa t_required rata?
                </div>
                <div className="mt-2 text-sm re-muted leading-relaxed">
                  {criticalNote}
                </div>
              </div>
            ) : null}

            {/* Table */}
            <div className="mt-6 overflow-hidden rounded-2xl border border-black/10 bg-white/70">
              <div className="overflow-auto">
                <table className="w-full text-sm">
                  <thead className="bg-white/70">
                    <tr className="text-left text-xs re-muted">
                      <th className="px-4 py-3">Course</th>
                      <th className="px-4 py-3">Governing case</th>

                      {showCalc ? (
                        <th className="px-4 py-3">
                          t_calc ({thickUnit})
                        </th>
                      ) : null}

                      <th className="px-4 py-3">
                        t_required ({thickUnit})
                      </th>
                      <th className="px-4 py-3">
                        t_adopted ({thickUnit})
                      </th>
                      <th className="px-4 py-3">Utilization</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {engineResult?.results?.map((r) => {
                      const floored =
                        Number.isFinite(minWithCA) &&
                        Math.abs(r.tRequired - (minWithCA as number)) < 1e-6 &&
                        r.tCalcGoverning < (minWithCA as number) - 1e-6;

                      return (
                        <tr key={r.courseNo} className="border-t border-black/5">
                          <td className="px-4 py-3 font-semibold text-[rgb(var(--re-ink))]">
                            {r.courseNo}
                          </td>
                          <td className="px-4 py-3 re-muted">
                            {r.governingCase}
                          </td>

                          {showCalc ? (
                            <td className="px-4 py-3 font-semibold text-[rgb(var(--re-blue))]">
                              {fmt(r.tCalcGoverning, 2)}
                            </td>
                          ) : null}

                          <td className="px-4 py-3 font-semibold text-[rgb(var(--re-blue))]">
                            {fmt(r.tRequired, 2)}{" "}
                            {floored ? (
                              <span className="ml-2 inline-flex items-center rounded-full border border-black/10 bg-white/80 px-2 py-0.5 text-[10px] font-semibold text-[rgb(var(--re-orange))]">
                                min thickness
                              </span>
                            ) : null}
                          </td>

                          <td className="px-4 py-3 re-muted">{fmt(r.tAdopted, 2)}</td>
                          <td className="px-4 py-3 re-muted">{fmt(r.utilization, 3)}</td>
                          <td className="px-4 py-3">
                            <span
                              className={[
                                "px-2.5 py-1 rounded-full text-xs font-semibold border border-black/10",
                                r.status === "OK"
                                  ? "bg-white/80 text-[rgb(var(--re-green))]"
                                  : "bg-white/80 text-red-600",
                              ].join(" ")}
                            >
                              {r.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}

                    {!engineResult ? (
                      <tr>
                        <td colSpan={showCalc ? 7 : 6} className="px-4 py-6 text-sm re-muted">
                          Hasil belum bisa dihitung. Cek lagi input Step 2 (Service & Geometry) dan Step 3 (Materials).
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/projects/new/materials"
                className="px-6 py-4 rounded-2xl text-base font-semibold border border-black/10 bg-white/70 hover:bg-white/90 transition"
              >
                Edit Materials (Step 3)
              </Link>

              <Link
                href="/projects/new/service"
                className="px-6 py-4 rounded-2xl text-base font-semibold border border-black/10 bg-white/70 hover:bg-white/90 transition"
              >
                Edit Service & Geometry (Step 2)
              </Link>

              <Link
                href="/"
                className="px-6 py-4 rounded-2xl text-base font-semibold border border-black/10 bg-white/70 hover:bg-white/90 transition"
              >
                Ke Beranda
              </Link>
            </div>
          </div>

          {/* RIGHT */}
          <div className="lg:col-span-4 re-card rounded-[2rem] p-6 md:p-7">
            <div className="text-xs re-muted">Ringkasan</div>
            <div className="mt-1 text-lg font-semibold text-[rgb(var(--re-blue))]">
              Project Summary
            </div>

            <div className="mt-5 rounded-2xl border border-black/10 bg-white/60 p-5 text-sm re-muted leading-relaxed">
              <div>
                <strong className="text-[rgb(var(--re-ink))]">Project:</strong>{" "}
                {draft.projectName}
              </div>
              <div>
                <strong className="text-[rgb(var(--re-ink))]">Standard:</strong>{" "}
                {draft.recommendedStandard ?? "-"}
              </div>
              <div>
                <strong className="text-[rgb(var(--re-ink))]">Units:</strong>{" "}
                {draft.units}
              </div>

              <div className="mt-3">
                <strong className="text-[rgb(var(--re-ink))]">Geometry:</strong>
                <ul className="mt-2 list-disc pl-5">
                  <li>D: {draft.geometry?.diameter ?? "-"} {lengthUnit}</li>
                  <li>Hshell: {draft.geometry?.shellHeight ?? "-"} {lengthUnit}</li>
                  <li>Courses: {draft.geometry?.courses?.length ?? "-"}</li>
                </ul>
              </div>

              <div className="mt-3">
                <strong className="text-[rgb(var(--re-ink))]">Min thickness floor:</strong>{" "}
                {Number.isFinite(minWithCA) ? `${fmt(minWithCA)} ${thickUnit}` : "-"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
