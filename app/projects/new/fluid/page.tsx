"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FluidProperties } from "../../../../lib/heatexchanger/types";
import { FOULING_FACTORS } from "../../../../lib/heatexchanger/constants";
import WorkflowSidebar from "../../../../components/WorkflowSidebar";

export default function FluidPropertiesPage() {
    const router = useRouter();
    const [activeFluid, setActiveFluid] = useState<"hot" | "cold">("hot");

    const [hot, setHot] = useState<FluidProperties>({
        label: "Hot Fluid",
        massFlow: 0,
        tempIn: 0,
        tempOut: 0,
        allowableDP: 0,
        foulingResistance: 0,
        cp: 0,
        mu: 0,
        k: 0,
        rho: 0,
    });

    const [cold, setCold] = useState<FluidProperties>({
        label: "Cold Fluid",
        massFlow: 0,
        tempIn: 0,
        tempOut: 0,
        allowableDP: 0,
        foulingResistance: 0,
        cp: 0,
        mu: 0,
        k: 0,
        rho: 0,
    });

    const handleFoulingSelect = (fluid: "hot" | "cold", label: string) => {
        const factor = FOULING_FACTORS.find(f => f.label === label);
        if (factor) {
            if (fluid === "hot") setHot({ ...hot, foulingResistance: factor.rangeFactor[0] });
            else setCold({ ...cold, foulingResistance: factor.rangeFactor[0] });
        }
    };

    const handleContinue = () => {
        const existing = JSON.parse(localStorage.getItem("he_current_project") || "{}");
        localStorage.setItem("he_current_project", JSON.stringify({ ...existing, hot, cold, step: 1 }));
        router.push("/projects/new/thermal");
    };

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
                            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[rgb(var(--re-muted))] opacity-50">Data Entry</div>
                            <div className="text-xl font-black text-[rgb(var(--re-ink))] mt-1 flex items-center gap-2">
                                Step 2 <span className="w-1.5 h-1.5 rounded-full bg-[rgb(var(--re-blue))]" /> <span className="text-[rgb(var(--re-muted))] font-bold text-sm">Fluid Properties Control</span>
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

                    {/* Form Area */}
                    <div className="lg:col-span-9 space-y-8">
                        <div className="re-card rounded-[3rem] p-8 md:p-10 shadow-2xl shadow-black/[0.02]">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-4">
                                    <h2 className="text-2xl font-black text-[rgb(var(--re-ink))]">Fluid Matrix</h2>
                                    <div className="px-3 py-1 rounded-full bg-black/5 text-[rgb(var(--re-muted))] text-[10px] font-black uppercase tracking-widest">Properties</div>
                                </div>

                                <div className="flex p-1 bg-black/5 rounded-2xl">
                                    <button
                                        onClick={() => setActiveFluid("hot")}
                                        className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${activeFluid === "hot" ? "bg-[rgb(var(--re-blue))] text-white shadow-lg" : "text-[rgb(var(--re-muted))] hover:text-[rgb(var(--re-ink))]"}`}
                                    >
                                        HOT SIDE
                                    </button>
                                    <button
                                        onClick={() => setActiveFluid("cold")}
                                        className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${activeFluid === "cold" ? "bg-[rgb(var(--re-blue))] text-white shadow-lg" : "text-[rgb(var(--re-muted))] hover:text-[rgb(var(--re-ink))]"}`}
                                    >
                                        COLD SIDE
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-6">
                                    <div className="text-xs font-bold uppercase tracking-widest text-[rgb(var(--re-muted))] opacity-60">Primary Thermodynamics</div>
                                    <div className="grid gap-5">
                                        <InputGroup label="Mass Flow (kg/s)" value={activeFluid === "hot" ? hot.massFlow : cold.massFlow} onChange={(v) => {
                                            if (activeFluid === "hot") setHot({ ...hot, massFlow: v });
                                            else setCold({ ...cold, massFlow: v });
                                        }} />
                                        <div className="grid grid-cols-2 gap-4">
                                            <InputGroup label="Inlet T (°C)" value={activeFluid === "hot" ? hot.tempIn : cold.tempIn} onChange={(v) => {
                                                if (activeFluid === "hot") setHot({ ...hot, tempIn: v });
                                                else setCold({ ...cold, tempIn: v });
                                            }} />
                                            <InputGroup label="Outlet T (°C)" value={activeFluid === "hot" ? hot.tempOut : cold.tempOut} onChange={(v) => {
                                                if (activeFluid === "hot") setHot({ ...hot, tempOut: v });
                                                else setCold({ ...cold, tempOut: v });
                                            }} />
                                        </div>
                                        <InputGroup label="Allow. ΔP (bar)" value={activeFluid === "hot" ? hot.allowableDP : cold.allowableDP} onChange={(v) => {
                                            if (activeFluid === "hot") setHot({ ...hot, allowableDP: v });
                                            else setCold({ ...cold, allowableDP: v });
                                        }} />
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="text-xs font-bold uppercase tracking-widest text-[rgb(var(--re-muted))] opacity-60">Physical Parameters</div>
                                    <div className="grid gap-5">
                                        <div className="space-y-2">
                                            <div className="text-[10px] font-black uppercase tracking-widest text-[rgb(var(--re-muted))]">Fouling Resistance (m².K/W)</div>
                                            <select
                                                className="w-full rounded-[1.25rem] border border-black/10 bg-white px-4 py-3 text-xs font-bold outline-none mb-2"
                                                onChange={(e) => handleFoulingSelect(activeFluid, e.target.value)}
                                            >
                                                <option value="">Choose standard factor...</option>
                                                {FOULING_FACTORS.map(f => <option key={f.label} value={f.label}>{f.label}</option>)}
                                            </select>
                                            <input
                                                type="number"
                                                step="0.0001"
                                                className="w-full rounded-[1.25rem] border border-black/10 bg-[rgb(var(--re-blue))]/5 px-4 py-3 text-sm font-bold text-[rgb(var(--re-blue))]"
                                                value={activeFluid === "hot" ? hot.foulingResistance : cold.foulingResistance}
                                                onChange={(e) => {
                                                    const v = parseFloat(e.target.value);
                                                    if (activeFluid === "hot") setHot({ ...hot, foulingResistance: v });
                                                    else setCold({ ...cold, foulingResistance: v });
                                                }}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <InputGroup label="Cp (J/kg.K)" value={activeFluid === "hot" ? hot.cp : cold.cp} onChange={(v) => {
                                                if (activeFluid === "hot") setHot({ ...hot, cp: v });
                                                else setCold({ ...cold, cp: v });
                                            }} />
                                            <InputGroup label="Visc (Pa.s)" value={activeFluid === "hot" ? hot.mu : cold.mu} onChange={(v) => {
                                                if (activeFluid === "hot") setHot({ ...hot, mu: v });
                                                else setCold({ ...cold, mu: v });
                                            }} />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <InputGroup label="K (W/m.K)" value={activeFluid === "hot" ? hot.k : cold.k} onChange={(v) => {
                                                if (activeFluid === "hot") setHot({ ...hot, k: v });
                                                else setCold({ ...cold, k: v });
                                            }} />
                                            <InputGroup label="Rho (kg/m³)" value={activeFluid === "hot" ? hot.rho : cold.rho} onChange={(v) => {
                                                if (activeFluid === "hot") setHot({ ...hot, rho: v });
                                                else setCold({ ...cold, rho: v });
                                            }} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-12 pt-8 border-t border-black/5 flex justify-end">
                                <button
                                    onClick={handleContinue}
                                    className="px-10 py-5 rounded-[1.5rem] bg-[rgb(var(--re-blue))] text-white font-black shadow-2xl hover:scale-105 transition-all text-lg"
                                >
                                    Proceed to Thermal Design <span className="ml-2">→</span>
                                </button>
                            </div>
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
            <div className="text-sm font-semibold re-muted">{label}</div>
            <input
                type="number"
                step="any"
                className="w-full rounded-2xl border border-black/10 bg-white/90 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black/10"
                value={value || ""}
                onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
            />
        </div>
    );
}
