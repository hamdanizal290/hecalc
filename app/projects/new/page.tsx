"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { UnitSystem, CalculationMode } from "../../../lib/heatexchanger/types";
import WorkflowSidebar from "../../../components/WorkflowSidebar";

function Toggle({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(o.value)}
            className={[
              "px-4 py-2 rounded-2xl text-sm font-semibold border transition",
              "border-black/10",
              active
                ? "bg-white shadow-sm text-[rgb(var(--re-blue))]"
                : "bg-white/60 hover:bg-white/80 re-muted",
            ].join(" ")}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export default function NewProjectPage() {
  const router = useRouter();
  const [projectName, setProjectName] = useState("");
  const [location, setLocation] = useState("");
  const [units, setUnits] = useState<UnitSystem>("SI");
  const [mode, setMode] = useState<CalculationMode>("Design");

  const canContinue = projectName.trim().length > 0;

  const handleCreate = () => {
    if (!canContinue) return;
    // Save to local storage
    const project = {
      id: `he-project-${Date.now()}`,
      name: projectName,
      location,
      units,
      mode,
      step: 0,
    };
    localStorage.setItem("he_current_project", JSON.stringify(project));
    router.push("/projects/new/fluid");
  };

  return (
    <main className="min-h-screen re-geo pb-20">
      <div className="mx-auto max-w-[1400px] px-6 py-8 md:px-10">
        {/* TOP HEADER */}
        <header className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-8">
            <div className="h-16 w-48 rounded-[2rem] bg-white/90 border border-black/10 shadow-sm flex items-center justify-center p-3 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-tr from-[rgb(var(--re-blue))]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <Image src="/re-logo.png" alt="RE" width={160} height={50} className="relative z-10" />
            </div>
            <div className="hidden md:block">
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[rgb(var(--re-muted))] opacity-50">Project Management</div>
              <div className="text-xl font-black text-[rgb(var(--re-ink))] mt-1 flex items-center gap-2">
                HE-Calc <span className="w-1.5 h-1.5 rounded-full bg-[rgb(var(--re-blue))]" /> <span className="text-[rgb(var(--re-muted))] font-bold text-sm">New Project Initiation</span>
              </div>
            </div>
          </div>
          <Link href="/" className="px-6 py-3 rounded-2xl text-sm font-bold bg-white/70 border border-black/10 hover:bg-white transition flex items-center gap-2 group">
            <span className="opacity-40 group-hover:translate-x-[-2px] transition-transform">←</span> Kembali ke Beranda
          </Link>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* SIDEBAR */}
          <div className="lg:col-span-3">
            <WorkflowSidebar />
          </div>

          {/* CONTENT */}
          <div className="lg:col-span-9">
            <div className="re-card rounded-[3rem] p-8 md:p-12 shadow-2xl shadow-black/[0.02]">
              <div className="flex items-center gap-3 mb-8">
                <span className="px-3 py-1 rounded-full bg-[rgb(var(--re-blue))]/10 text-[rgb(var(--re-blue))] text-[10px] font-black uppercase tracking-widest">Step 1</span>
                <span className="w-1 h-1 rounded-full bg-black/10" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-[rgb(var(--re-muted))]">Setup & Units</span>
              </div>

              <h1 className="text-4xl font-black tracking-tight text-[rgb(var(--re-ink))] mb-4">
                Buat Project Baru
              </h1>
              <p className="text-[rgb(var(--re-muted))] max-w-xl text-lg leading-relaxed mb-10">
                Isi informasi dasar project dan tentukan sistem satuan yang akan digunakan sebagai basis kalkulasi.
              </p>

              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <div className="text-xs font-bold uppercase tracking-widest text-[rgb(var(--re-muted))]">Nama Project *</div>
                    <input
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      placeholder="Contoh: HE-101 Shell & Tube"
                      className="w-full rounded-[1.5rem] border border-black/10 bg-white/90 px-5 py-4 text-sm outline-none focus:ring-4 focus:ring-[rgb(var(--re-blue))]/10 focus:border-[rgb(var(--re-blue))]/30 transition-all font-semibold"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs font-bold uppercase tracking-widest text-[rgb(var(--re-muted))]">Lokasi (Opsional)</div>
                    <input
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Contoh: Balikpapan"
                      className="w-full rounded-[1.5rem] border border-black/10 bg-white/90 px-5 py-4 text-sm outline-none focus:ring-4 focus:ring-[rgb(var(--re-blue))]/10 focus:border-[rgb(var(--re-blue))]/30 transition-all font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-black/5 pt-8">
                  <div className="space-y-4">
                    <div className="text-xs font-bold uppercase tracking-widest text-[rgb(var(--re-muted))]">Sistem Satuan *</div>
                    <div className="flex gap-3">
                      {["SI", "Imperial"].map((unit) => (
                        <button
                          key={unit}
                          onClick={() => setUnits(unit as UnitSystem)}
                          className={`flex-1 px-4 py-4 rounded-[1.5rem] border text-sm font-bold transition-all ${units === unit
                            ? "bg-[rgb(var(--re-blue))] text-white border-transparent shadow-lg shadow-[rgb(var(--re-blue))]/20 scale-[1.02]"
                            : "bg-white/60 border-black/10 text-[rgb(var(--re-muted))] hover:bg-white"
                            }`}
                        >
                          {unit === "SI" ? "SI (Metric)" : "US (Imperial)"}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="text-xs font-bold uppercase tracking-widest text-[rgb(var(--re-muted))]">Calculation Mode *</div>
                    <div className="flex gap-3">
                      {["Design", "Rating"].map((m) => (
                        <button
                          key={m}
                          onClick={() => setMode(m as CalculationMode)}
                          className={`flex-1 px-4 py-4 rounded-[1.5rem] border text-sm font-bold transition-all ${mode === m
                            ? "bg-[rgb(var(--re-blue))] text-white border-transparent shadow-lg shadow-[rgb(var(--re-blue))]/20 scale-[1.02]"
                            : "bg-white/60 border-black/10 text-[rgb(var(--re-muted))] hover:bg-white"
                            }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-black/5 flex justify-end">
                  <button
                    onClick={handleCreate}
                    disabled={!canContinue}
                    className={`px-10 py-5 rounded-[1.5rem] text-lg font-black text-white shadow-2xl transition-all ${canContinue
                      ? "bg-[rgb(var(--re-blue))] shadow-[rgb(var(--re-blue))]/30 hover:scale-[1.05] active:scale-95"
                      : "bg-black/20 cursor-not-allowed opacity-50"
                      }`}
                  >
                    Lanjut ke Input Properties <span className="ml-2">→</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
