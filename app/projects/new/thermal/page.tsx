"use client";

import Image from "next/image";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { TubeSpecs, ShellSpecs, CalculationResult } from "../../../../lib/heatexchanger/types";
import { performCalculation, calculateLMTD, calculateF } from "../../../../lib/heatexchanger/engine";
import WorkflowSidebar from "../../../../components/WorkflowSidebar";

export default function ThermalDesignPage() {
    const router = useRouter();
    const [projectData, setProjectData] = useState<any>(null);

    useEffect(() => {
        const data = JSON.parse(localStorage.getItem("he_current_project") || "{}");
        if (!data.hot || !data.cold) {
            router.push("/projects/new/fluid");
            return;
        }
        setProjectData(data);
    }, [router]);

    const [uAssume, setUAssume] = useState(500);
    const [tube, setTube] = useState<TubeSpecs>({
        od: 0.025,
        id: 0.020,
        length: 6,
        thickness: 0.002,
        material: "Carbon Steel",
        materialConductivity: 45,
        pitchType: "triangular",
        pitchRatio: 1.25,
    });

    const [shell, setShell] = useState<ShellSpecs>({
        type: "Fixed",
        passes: 1,
        tubePasses: 2,
        baffleRatio: 0.2,
        baffleCut: 25,
    });

    const calculationResults = useMemo(() => {
        if (!projectData) return null;
        try {
            return performCalculation(projectData.hot, projectData.cold, tube, shell, uAssume);
        } catch (e) {
            console.error(e);
            return null;
        }
    }, [projectData, tube, shell, uAssume]);

    const handleFinish = () => {
        const existing = JSON.parse(localStorage.getItem("he_current_project") || "{}");
        localStorage.setItem("he_current_project", JSON.stringify({ ...existing, tube, shell, uAssume, results: calculationResults, step: 2 }));
        router.push("/projects/new/results");
    };

    if (!projectData) return null;

    return (
        <main className="min-h-screen re-geo pb-20">
            <div className="mx-auto max-w-[1400px] px-6 py-8 md:px-10">
                {/* TOP HEADER */}
                <header className="flex items-center justify-between mb-12">
                    <div className="flex items-center gap-8">
                        <div className="h-16 w-48 rounded-[2rem] bg-white/90 border border-black/10 shadow-sm flex items-center justify-center p-3">
                            <Image src="/re-logo.png" alt="RE" width={160} height={50} />
                        </div>
                        <div className="hidden md:block">
                            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[rgb(var(--re-muted))] opacity-50">Engineering Lab</div>
                            <div className="text-xl font-black text-[rgb(var(--re-ink))] mt-1 flex items-center gap-2">
                                Step 3 <span className="w-1.5 h-1.5 rounded-full bg-[rgb(var(--re-blue))]" /> <span className="text-[rgb(var(--re-muted))] font-bold text-sm">Thermal & Mechanical Simulator</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={() => router.back()} className="px-6 py-3 rounded-2xl text-sm font-bold bg-white/70 border border-black/10 hover:bg-white transition">
                        Kembali
                    </button>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* SIDEBAR */}
                    <div className="lg:col-span-3">
                        <WorkflowSidebar />
                    </div>

                    {/* CONTENT AREA */}
                    <div className="lg:col-span-9 space-y-8">
                        <section className="re-card rounded-[3rem] p-8 md:p-10 shadow-2xl shadow-black/[0.02]">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-4">
                                    <h2 className="text-2xl font-black text-[rgb(var(--re-ink))]">Duty & Mechanics</h2>
                                    <div className="px-3 py-1 rounded-full bg-black/5 text-[rgb(var(--re-muted))] text-[10px] font-black uppercase tracking-widest">Calculations</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
                                <ResultCard label="Heat Load (Q)" value={calculationResults?.heatLoad?.toFixed(2)} unit="W" />
                                <ResultCard label="Cold Flowrate" value={calculationResults?.coldFlowrate?.toFixed(2)} unit="kg/s" />
                                <ResultCard label="ΔT LMTD" value={calculationResults?.lmtd?.toFixed(2)} unit="C" />
                                <ResultCard label="Corr Factor F" value={calculationResults?.fCorr?.toFixed(3)} unit="-" />
                            </div>

                            <div className="space-y-10">
                                <div className="border-t border-black/5 pt-10">
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-[rgb(var(--re-muted))] mb-6 opacity-60">Overall Coefficient Assumption (U)</h3>
                                    <div className="flex items-center gap-6 p-6 rounded-[2rem] bg-[rgb(var(--re-blue))]/5 border border-[rgb(var(--re-blue))]/10">
                                        <div className="space-y-1 flex-1">
                                            <div className="text-[10px] font-black uppercase tracking-widest text-[rgb(var(--re-blue))] mb-2 opacity-60">Input Value (W/m².°C)</div>
                                            <input
                                                type="number"
                                                className="w-full max-w-[200px] rounded-2xl border border-black/10 bg-white px-5 py-4 text-xl font-black text-[rgb(var(--re-ink))] outline-none focus:ring-4 focus:ring-[rgb(var(--re-blue))]/10"
                                                value={uAssume}
                                                onChange={(e) => setUAssume(parseFloat(e.target.value) || 0)}
                                            />
                                        </div>
                                        <div className="flex-1 text-sm font-semibold leading-relaxed text-[rgb(var(--re-muted))]">
                                            Determine your assumption based on standard values. Refer to <span className="text-[rgb(var(--re-blue))] font-bold underline">Figure 5</span> below for recommendations.
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-black/5 pt-10">
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-[rgb(var(--re-muted))] mb-6 opacity-60">Tube Specifications</h3>
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                                        <InputGroup label="Tube OD (m)" value={tube.od} onChange={(v) => setTube({ ...tube, od: v })} />
                                        <InputGroup label="Tube ID (m)" value={tube.id} onChange={(v) => setTube({ ...tube, id: v })} />
                                        <InputGroup label="Tube Length (m)" value={tube.length} onChange={(v) => setTube({ ...tube, length: v })} />
                                        <div className="space-y-2">
                                            <div className="text-[10px] font-black uppercase tracking-widest text-[rgb(var(--re-muted))]">Pitch Type</div>
                                            <select
                                                className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-bold"
                                                value={tube.pitchType}
                                                onChange={(e) => setTube({ ...tube, pitchType: e.target.value as any })}
                                            >
                                                <option value="triangular">Triangular (pt=1.25do)</option>
                                                <option value="square">Square (pt=1.33do)</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-black/5 pt-10">
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-[rgb(var(--re-muted))] mb-6 opacity-60">Shell & Baffle Design</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                                        <div className="space-y-2">
                                            <div className="text-[10px] font-black uppercase tracking-widest text-[rgb(var(--re-muted))]">Shell Type</div>
                                            <select
                                                className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-bold"
                                                value={shell.type}
                                                onChange={(e) => setShell({ ...shell, type: e.target.value as any })}
                                            >
                                                <option value="Fixed">Fixed and U-tube</option>
                                                <option value="Split-ring">Split-ring floating head</option>
                                                <option value="Pull-through">Pull-through floating head</option>
                                            </select>
                                        </div>
                                        <InputGroup label="Shell Passes" value={shell.passes} onChange={(v) => setShell({ ...shell, passes: v })} />
                                        <div className="space-y-2">
                                            <div className="text-[10px] font-black uppercase tracking-widest text-[rgb(var(--re-muted))]">Tube Passes</div>
                                            <select
                                                className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-bold"
                                                value={shell.tubePasses}
                                                onChange={(e) => setShell({ ...shell, tubePasses: parseInt(e.target.value) })}
                                            >
                                                {[1, 2, 4, 6, 8].map(p => <option key={p} value={p}>{p}</option>)}
                                            </select>
                                        </div>
                                        <InputGroup label="Baffle Ratio" value={shell.baffleRatio} onChange={(v) => setShell({ ...shell, baffleRatio: v })} />
                                        <div className="space-y-2">
                                            <div className="text-[10px] font-black uppercase tracking-widest text-[rgb(var(--re-muted))]">Baffle Cut</div>
                                            <select
                                                className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-bold"
                                                value={shell.baffleCut}
                                                onChange={(e) => setShell({ ...shell, baffleCut: parseInt(e.target.value) })}
                                            >
                                                {[15, 25, 35, 45].map(c => <option key={c} value={c}>{c}%</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section id="fig5" className="re-card rounded-[3rem] p-8 md:p-10 shadow-2xl shadow-black/[0.02]">
                            <h2 className="text-xl font-bold text-[rgb(var(--re-blue))] mb-5 flex items-center gap-3">
                                <span className="w-1.5 h-6 rounded-full bg-[rgb(var(--re-blue))]" />
                                Overall Coefficient Reference (Figure 5)
                            </h2>
                            <div className="text-sm re-muted mb-8 italic">Scroll to explore suggested U-values for various fluid combinations.</div>
                            <div className="bg-white rounded-[2rem] p-6 border border-black/5 flex justify-center overflow-auto min-h-[500px]">
                                <Image
                                    src="/uploaded_image_1_1768805200702.jpg"
                                    alt="U value guideline"
                                    width={1200}
                                    height={800}
                                    className="object-contain w-full h-auto max-w-none"
                                />
                            </div>
                        </section>

                        <div className="flex flex-col md:flex-row justify-between items-center bg-white/60 p-8 rounded-[3rem] border border-black/10 shadow-xl gap-6 sticky bottom-6 z-20 backdrop-blur-md">
                            <div className="flex items-center gap-6">
                                <div className="space-y-1">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-[rgb(var(--re-blue))]">Simulation Sync</div>
                                    <div className="text-2xl font-black text-[rgb(var(--re-ink))] flex items-center gap-2">
                                        Active Results <span className="inline-block w-2 h-2 rounded-full bg-[rgb(var(--re-green))] animate-pulse" />
                                    </div>
                                </div>
                                <div className="h-10 w-px bg-black/10 mx-2" />
                                <div className="text-sm font-bold leading-relaxed text-[rgb(var(--re-muted))]">
                                    {calculationResults ? (
                                        <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                                            <span>Area: <b className="text-[rgb(var(--re-ink))]">{calculationResults.areaConsidered?.toFixed(2)} m²</b></span>
                                            <span>Deviation: <b className={Math.abs(calculationResults.deviation) < 30 ? "text-[rgb(var(--re-green))]" : "text-[rgb(var(--re-orange))]"}>{calculationResults.deviation?.toFixed(1)}%</b></span>
                                        </div>
                                    ) : "Awaiting input optimization parameters..."}
                                </div>
                            </div>
                            <button
                                onClick={handleFinish}
                                className="w-full md:w-auto px-12 py-5 rounded-[1.5rem] bg-[rgb(var(--re-blue))] text-white font-black shadow-2xl shadow-[rgb(var(--re-blue))]/30 hover:scale-105 transition-all text-xl"
                            >
                                Generate Final Report <span className="ml-2">→</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

function InputGroup({ label, value, onChange }: { label: string, value: number, onChange: (v: number) => void }) {
    return (
        <div className="space-y-2">
            <div className="text-xs font-semibold re-muted">{label}</div>
            <input
                type="number"
                step="any"
                className="w-full rounded-xl border border-black/10 bg-white/90 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-black/5"
                value={value || ""}
                onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
            />
        </div>
    );
}

function ResultCard({ label, value, unit }: { label: string, value: string | undefined, unit: string }) {
    return (
        <div className="bg-white/60 border border-black/5 p-4 rounded-2xl">
            <div className="text-[10px] uppercase font-bold re-muted tracking-wider">{label}</div>
            <div className="mt-1 text-lg font-bold text-[rgb(var(--re-ink))]">
                {value || "-"} <span className="text-xs font-normal re-muted">{unit}</span>
            </div>
        </div>
    );
}
