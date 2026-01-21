"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { FluidProperties, TubeSpecs, ShellSpecs } from "../../lib/heatexchanger/types";
import { performCalculation } from "../../lib/heatexchanger/engine";
import { FOULING_FACTORS } from "../../lib/heatexchanger/constants";

export default function CalculatorPage() {
  const [activeTab, setActiveTab] = useState<"fluid" | "mechanical" | "results">("fluid");

  const [hot, setHot] = useState<FluidProperties>({
    label: "Hot Fluid", massFlow: 10, tempIn: 100, tempOut: 60, allowableDP: 0.5, foulingResistance: 0.0002, cp: 2200, mu: 0.001, k: 0.15, rho: 800
  });
  const [cold, setCold] = useState<FluidProperties>({
    label: "Cold Fluid", massFlow: 20, tempIn: 30, tempOut: 50, allowableDP: 0.5, foulingResistance: 0.0001, cp: 4180, mu: 0.0008, k: 0.6, rho: 1000
  });
  const [tube, setTube] = useState<TubeSpecs>({
    od: 0.025, id: 0.020, length: 6, thickness: 0.002, material: "CS", materialConductivity: 45, pitchType: "triangular", pitchRatio: 1.25
  });
  const [shell, setShell] = useState<ShellSpecs>({
    type: "Fixed", passes: 1, tubePasses: 2, baffleRatio: 0.2, baffleCut: 25
  });
  const [uAssume, setUAssume] = useState(500);

  const results = useMemo(() => performCalculation(hot, cold, tube, shell, uAssume), [hot, cold, tube, shell, uAssume]);

  return (
    <main className="min-h-screen p-6 re-geo">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="rounded-2xl re-card p-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-[rgb(var(--re-blue))]">HeatExchangerCalc <span className="text-[rgb(var(--re-ink))] font-normal">Quick Calc</span></h1>
            <p className="text-sm re-muted">Simplified Shell & Tube Calculation</p>
          </div>
          <Link href="/">
            <button className="px-4 py-2 rounded-xl bg-white border border-black/10 text-sm font-semibold hover:bg-black/5 transition">Beranda</button>
          </Link>
        </header>

        <section className="re-card rounded-2xl p-4 flex gap-2">
          {["fluid", "mechanical", "results"].map((t: any) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition ${activeTab === t ? "bg-[rgb(var(--re-blue))] text-white shadow" : "bg-white/50 re-muted hover:bg-white"}`}
            >
              {t.toUpperCase()}
            </button>
          ))}
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="re-card rounded-[2rem] p-8 space-y-6">
            {activeTab === "fluid" && (
              <div className="space-y-6">
                <h3 className="font-bold text-[rgb(var(--re-ink))]">Hot Fluid properties</h3>
                <div className="grid grid-cols-2 gap-4">
                  <InputNumber label="Mass Flow" value={hot.massFlow} onChange={(v) => setHot({ ...hot, massFlow: v })} />
                  <InputNumber label="Temp In" value={hot.tempIn} onChange={(v) => setHot({ ...hot, tempIn: v })} />
                  <InputNumber label="Temp Out" value={hot.tempOut} onChange={(v) => setHot({ ...hot, tempOut: v })} />
                  <InputNumber label="Cp" value={hot.cp} onChange={(v) => setHot({ ...hot, cp: v })} />
                </div>
                <h3 className="font-bold text-[rgb(var(--re-ink))] pt-4">Cold Fluid properties</h3>
                <div className="grid grid-cols-2 gap-4">
                  <InputNumber label="Mass Flow" value={cold.massFlow} onChange={(v) => setCold({ ...cold, massFlow: v })} />
                  <InputNumber label="Temp In" value={cold.tempIn} onChange={(v) => setCold({ ...cold, tempIn: v })} />
                  <InputNumber label="Temp Out" value={cold.tempOut} onChange={(v) => setCold({ ...cold, tempOut: v })} />
                  <InputNumber label="Cp" value={cold.cp} onChange={(v) => setCold({ ...cold, cp: v })} />
                </div>
              </div>
            )}

            {activeTab === "mechanical" && (
              <div className="space-y-6">
                <h3 className="font-bold text-[rgb(var(--re-ink))]">Tube & Shell Geometry</h3>
                <div className="grid grid-cols-2 gap-4">
                  <InputNumber label="Tube OD (m)" value={tube.od} onChange={(v) => setTube({ ...tube, od: v })} />
                  <InputNumber label="Tube ID (m)" value={tube.id} onChange={(v) => setTube({ ...tube, id: v })} />
                  <InputNumber label="Tube Length (m)" value={tube.length} onChange={(v) => setTube({ ...tube, length: v })} />
                  <InputNumber label="U Assumption" value={uAssume} onChange={(v) => setUAssume(v)} />
                  <div className="space-y-1 col-span-2">
                    <div className="text-xs font-semibold re-muted">Shell Type</div>
                    <select className="w-full rounded-xl border border-black/10 bg-white/70 p-2 text-sm outline-none" value={shell.type} onChange={(e) => setShell({ ...shell, type: e.target.value as any })}>
                      <option value="Fixed">Fixed</option>
                      <option value="Split-ring">Split-ring</option>
                      <option value="Pull-through">Pull-through</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "results" && (
              <div className="space-y-6">
                <h3 className="font-bold text-[rgb(var(--re-ink))]">Overall Summary</h3>
                <div className={`p-6 rounded-2xl border ${Math.abs(results.deviation) < 30 ? "bg-[rgb(var(--re-green))]/5 border-[rgb(var(--re-green))]/20" : "bg-[rgb(var(--re-orange))]/5 border-[rgb(var(--re-orange))]/20"}`}>
                  <div className="text-xs uppercase font-bold re-muted">Deviation Check</div>
                  <div className="text-3xl font-black mt-2 text-[rgb(var(--re-ink))]">{results.deviation.toFixed(2)}%</div>
                  <div className={`text-sm font-bold mt-1 ${Math.abs(results.deviation) < 30 ? "text-[rgb(var(--re-green))]" : "text-[rgb(var(--re-orange))]"}`}>
                    {Math.abs(results.deviation) < 30 ? "Design is acceptable" : "Redesign recommended"}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <ResultMini label="Area (m²)" value={results.areaConsidered.toFixed(2)} />
                  <ResultMini label="Num Tubes" value={results.numTubes} />
                  <ResultMini label="U Calc" value={results.overallUo.toFixed(2)} />
                  <ResultMini label="Shell D (m)" value={results.shellDiameter.toFixed(3)} />
                </div>
              </div>
            )}
          </div>

          <div className="re-card rounded-[2rem] p-8 flex flex-col justify-center items-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Image src="/re-logo.png" alt="RE" width={300} height={100} />
            </div>
            <div className="text-center space-y-2">
              <div className="text-sm font-bold text-[rgb(var(--re-blue))] uppercase tracking-widest">Heat Load (Q)</div>
              <div className="text-6xl font-black text-[rgb(var(--re-ink))]">{(results.heatLoad / 1000).toFixed(1)} <span className="text-xl font-normal re-muted">kW</span></div>
            </div>
            <div className="mt-12 grid grid-cols-2 gap-10 w-full max-w-sm">
              <div className="text-center">
                <div className="text-[10px] uppercase font-bold re-muted">Tube ΔP</div>
                <div className="text-lg font-bold">{(results.tubeSide.pressureDrop / 1000).toFixed(2)} <span className="text-[10px] font-normal">kPa</span></div>
              </div>
              <div className="text-center">
                <div className="text-[10px] uppercase font-bold re-muted">Shell ΔP</div>
                <div className="text-lg font-bold">{(results.shellSide.pressureDrop / 1000).toFixed(2)} <span className="text-[10px] font-normal">kPa</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function InputNumber({ label, value, onChange }: { label: string, value: number, onChange: (v: number) => void }) {
  return (
    <div className="space-y-1">
      <div className="text-[10px] font-bold uppercase re-muted">{label}</div>
      <input
        type="number"
        className="w-full rounded-xl border border-black/10 bg-white/70 p-2 text-sm outline-none focus:ring-2 focus:ring-[rgb(var(--re-blue))]/20"
        value={value || ""}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
      />
    </div>
  );
}

function ResultMini({ label, value }: { label: string, value: any }) {
  return (
    <div className="bg-white/40 p-3 rounded-xl border border-black/5">
      <div className="text-[9px] uppercase font-bold re-muted">{label}</div>
      <div className="text-sm font-bold text-[rgb(var(--re-ink))] mt-1">{value}</div>
    </div>
  );
}
