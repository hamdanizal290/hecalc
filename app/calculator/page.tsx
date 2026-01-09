"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Tabs } from "./Tabs";
import type { TabKey } from "./Tabs";

import { calcShell } from "../../lib/api650/shell";
import type { ShellInput, Unit } from "../../lib/api650/types";

type PlaceholderResult = {
  title: string;
  status: "COMING_SOON" | "OK" | "NG";
  notes: string[];
};

export default function CalculatorPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("shell");

  const [input, setInput] = useState<ShellInput>({
    unit: "SI",
    diameter: 30,
    height: 12,
    courses: 6,
    designLiquidHeight: 11,
    specificGravity: 1.0,
    corrosionAllowance: 2,
    fy: 240,
    jointEfficiency: 1.0,
  });

  const safeInput = useMemo<ShellInput>(() => {
    return {
      ...input,
      courses: clampInt(input.courses, 1, 40),
      jointEfficiency: clamp(input.jointEfficiency, 0, 1),
      specificGravity: clamp(input.specificGravity, 0.5, 2.0),
      diameter: Math.max(0, input.diameter || 0),
      height: Math.max(0, input.height || 0),
      designLiquidHeight: Math.max(0, input.designLiquidHeight || 0),
      corrosionAllowance: Math.max(0, input.corrosionAllowance || 0),
      fy: Math.max(0, input.fy || 0),
    };
  }, [input]);

  const shellRows = useMemo(() => calcShell(safeInput), [safeInput]);
  const shellAllOk = shellRows.every((r) => r.status === "OK");

  const unitLabel =
    input.unit === "SI"
      ? { D: "m", H: "m", t: "mm", fy: "MPa" }
      : { D: "ft", H: "ft", t: "in", fy: "ksi" };

  const bottomResult: PlaceholderResult = {
    title: "Bottom Module",
    status: "COMING_SOON",
    notes: ["Minimum bottom thickness", "Annular plate check", "OK/NG summary"],
  };

  const roofResult: PlaceholderResult = {
    title: "Roof Module",
    status: "COMING_SOON",
    notes: ["Roof type selection", "Minimum roof thickness", "OK/NG summary"],
  };

  const windResult: PlaceholderResult = {
    title: "Wind Module",
    status: "COMING_SOON",
    notes: ["Wind input", "Stiffener/girder requirement", "OK/NG summary"],
  };

  const seismicResult: PlaceholderResult = {
    title: "Seismic Module",
    status: "COMING_SOON",
    notes: ["Seismic input", "Overturning/sliding", "Anchorage check"],
  };

  const nozzleResult: PlaceholderResult = {
    title: "Nozzle Module",
    status: "COMING_SOON",
    notes: ["Nozzle list", "Reinforcement area check", "OK/NG summary"],
  };

  return (
    <main className="min-h-screen p-6 re-geo">
      <div className="mx-auto max-w-6xl space-y-6 relative">
        {/* Header */}
        <header className="rounded-2xl re-card p-5 flex items-center justify-between">
          <div>
            <div className="text-sm re-muted">API 650 Tank Calculator</div>
            <h1 className="text-2xl font-semibold mt-1">
              TankCalc <span className="re-muted font-normal">Web App</span>
            </h1>
            <div className="text-sm re-muted mt-1">
              Tema: Rekayasa Engineering (Blue / Green / Orange)
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              className="px-3 py-2 rounded-xl border border-black/10 bg-white/70 hover:bg-white/90 transition text-sm font-medium"
              href="/"
            >
              Home
            </Link>
            <span className="h-9 w-[2px] bg-black/10 rounded-full" />
            <span className="px-3 py-2 rounded-xl text-sm font-semibold text-white bg-[rgb(var(--re-blue))] shadow">
              RE
            </span>
          </div>
        </header>

        {/* Tabs */}
        <section className="rounded-2xl re-card p-4">
          <Tabs value={activeTab} onChange={setActiveTab} />
          <div className="text-xs re-muted mt-2">
            Mulai dari Shell dulu. Modul lain masih placeholder.
          </div>
        </section>

        {/* Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Card */}
          <section className="rounded-2xl re-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Input</h2>
              <span className="text-xs re-muted">
                Units: {input.unit} • D({unitLabel.D}) H({unitLabel.H})
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FieldSelect
                label="Unit System"
                value={input.unit}
                options={[
                  { label: "SI", value: "SI" },
                  { label: "US", value: "US" },
                ]}
                onChange={(v) => setInput((s) => ({ ...s, unit: v as Unit }))}
              />

              <FieldNumber
                label={`Diameter (${unitLabel.D})`}
                value={input.diameter}
                onChange={(v) => setInput((s) => ({ ...s, diameter: v }))}
              />

              <FieldNumber
                label={`Height (${unitLabel.H})`}
                value={input.height}
                onChange={(v) => setInput((s) => ({ ...s, height: v }))}
              />

              <FieldNumber
                label="Number of Courses"
                value={input.courses}
                onChange={(v) =>
                  setInput((s) => ({ ...s, courses: clampInt(v, 1, 40) }))
                }
              />

              <FieldNumber
                label={`Design Liquid Height (${unitLabel.H})`}
                value={input.designLiquidHeight}
                onChange={(v) =>
                  setInput((s) => ({ ...s, designLiquidHeight: v }))
                }
              />

              <FieldNumber
                label="Specific Gravity (-)"
                value={input.specificGravity}
                step="0.01"
                onChange={(v) =>
                  setInput((s) => ({ ...s, specificGravity: v }))
                }
              />

              <FieldNumber
                label={`Corrosion Allowance (${unitLabel.t})`}
                value={input.corrosionAllowance}
                step="0.1"
                onChange={(v) =>
                  setInput((s) => ({ ...s, corrosionAllowance: v }))
                }
              />

              <FieldNumber
                label={`Fy (${unitLabel.fy})`}
                value={input.fy}
                step="1"
                onChange={(v) => setInput((s) => ({ ...s, fy: v }))}
              />

              <FieldNumber
                label="Joint Efficiency (0..1)"
                value={input.jointEfficiency}
                step="0.01"
                onChange={(v) =>
                  setInput((s) => ({ ...s, jointEfficiency: clamp(v, 0, 1) }))
                }
              />
            </div>

            <div className="rounded-xl border border-black/10 bg-white/60 p-4 text-sm re-muted">
              <div className="font-semibold text-[rgb(var(--re-blue))]">
                Catatan
              </div>
              Perhitungan shell masih placeholder. Tapi UI + struktur modul sudah
              siap untuk diisi API 650 beneran.
            </div>
          </section>

          {/* Results Card */}
          <section className="rounded-2xl re-card p-6 space-y-4">
            <h2 className="font-semibold">Results</h2>

            {activeTab === "shell" && (
              <>
                <div
                  className={`rounded-xl p-4 border ${
                    shellAllOk
                      ? "border-[rgba(var(--re-green),0.35)] bg-[rgba(var(--re-green),0.10)]"
                      : "border-[rgba(var(--re-orange),0.35)] bg-[rgba(var(--re-orange),0.10)]"
                  }`}
                >
                  <div className="font-semibold">
                    {shellAllOk ? "PASS" : "NOT PASS"}
                  </div>
                  <div className="text-sm re-muted">
                    Shell course thickness • unit thickness: {unitLabel.t}
                  </div>
                </div>

                <div className="overflow-auto rounded-xl border border-black/10 bg-white/60">
                  <table className="w-full text-sm">
                    <thead className="bg-[rgba(var(--re-blue),0.10)]">
                      <tr>
                        <th className="text-left p-3">Course</th>
                        <th className="text-left p-3">Req t ({unitLabel.t})</th>
                        <th className="text-left p-3">
                          Adopt t ({unitLabel.t})
                        </th>
                        <th className="text-left p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {shellRows.map((r, idx) => (
                        <tr
                          key={r.courseNo}
                          className={[
                            "border-t border-black/10",
                            idx % 2 === 0 ? "bg-white/40" : "bg-white/20",
                          ].join(" ")}
                        >
                          <td className="p-3">{r.courseNo}</td>
                          <td className="p-3">{r.required}</td>
                          <td className="p-3">{r.adopted}</td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-1 rounded-lg border text-xs font-semibold ${
                                r.status === "OK"
                                  ? "border-[rgba(var(--re-green),0.35)] bg-[rgba(var(--re-green),0.12)]"
                                  : "border-[rgba(var(--re-orange),0.35)] bg-[rgba(var(--re-orange),0.12)]"
                              }`}
                            >
                              {r.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="text-xs re-muted">
                  Next: kita isi rumus shell API 650 beneran.
                </div>
              </>
            )}

            {activeTab === "bottom" && <PlaceholderCard data={bottomResult} />}
            {activeTab === "roof" && <PlaceholderCard data={roofResult} />}
            {activeTab === "wind" && <PlaceholderCard data={windResult} />}
            {activeTab === "seismic" && <PlaceholderCard data={seismicResult} />}
            {activeTab === "nozzle" && <PlaceholderCard data={nozzleResult} />}
          </section>
        </div>
      </div>
    </main>
  );
}

function PlaceholderCard({ data }: { data: PlaceholderResult }) {
  const badge =
    data.status === "OK"
      ? "border-[rgba(var(--re-green),0.35)] bg-[rgba(var(--re-green),0.12)]"
      : data.status === "NG"
      ? "border-[rgba(var(--re-orange),0.35)] bg-[rgba(var(--re-orange),0.12)]"
      : "border-black/10 bg-white/60";

  return (
    <div className="rounded-2xl border border-black/10 bg-white/60 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-semibold text-[rgb(var(--re-blue))]">
            {data.title}
          </div>
          <div className="text-sm re-muted mt-1">
            Status:{" "}
            <span className={`px-2 py-1 rounded-lg border text-xs ${badge}`}>
              {data.status}
            </span>
          </div>
        </div>
      </div>

      <ul className="mt-4 space-y-2 text-sm re-muted list-disc pl-5">
        {data.notes.map((n, idx) => (
          <li key={idx}>{n}</li>
        ))}
      </ul>

      <div className="text-xs re-muted mt-4">
        Modul ini akan kita isi setelah Shell beres.
      </div>
    </div>
  );
}

function FieldNumber(props: {
  label: string;
  value: number;
  step?: string;
  onChange: (v: number) => void;
}) {
  return (
    <label className="space-y-1">
      <div className="text-sm re-muted">{props.label}</div>
      <input
        className="w-full rounded-xl border border-black/10 bg-white/70 p-2 outline-none focus:ring-2 focus:ring-[rgba(var(--re-blue),0.30)]"
        type="number"
        value={Number.isFinite(props.value) ? props.value : 0}
        step={props.step ?? "1"}
        onChange={(e) => props.onChange(parseFloat(e.target.value || "0"))}
      />
    </label>
  );
}

function FieldSelect(props: {
  label: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <label className="space-y-1">
      <div className="text-sm re-muted">{props.label}</div>
      <select
        className="w-full rounded-xl border border-black/10 bg-white/70 p-2 outline-none focus:ring-2 focus:ring-[rgba(var(--re-blue),0.30)]"
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
      >
        {props.options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function clamp(x: number, min: number, max: number) {
  if (!Number.isFinite(x)) return min;
  return Math.max(min, Math.min(max, x));
}

function clampInt(x: number, min: number, max: number) {
  return Math.floor(clamp(x, min, max));
}
