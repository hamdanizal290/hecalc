"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import WorkflowSidebar from "../../../../components/WorkflowSidebar";

function SectionHeader({ title, icon, color }: { title: string; icon: string; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-8 h-8 rounded-xl bg-[rgb(var(--${color}))] text-white flex items-center justify-center font-black text-xs shadow-lg`}>
        {icon}
      </div>
      <h3 className="font-black text-[rgb(var(--re-ink))] uppercase tracking-widest text-xs">{title}</h3>
    </div>
  );
}

export default function ResultsPage() {
  const router = useRouter();
  const [project, setProject] = useState<any>(null);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("he_current_project") || "{}");
    if (!data.results) {
      router.push("/projects/new/thermal");
      return;
    }
    setProject(data);
  }, [router]);

  if (!project) return null;

  const res = project.results;

  return (
    <main className="min-h-screen re-geo pb-24">
      <div className="mx-auto max-w-[1400px] px-6 py-8 md:px-10">
        {/* TOP HEADER */}
        <header className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-8">
            <div className="h-16 w-48 rounded-[2rem] bg-white/90 border border-black/10 shadow-sm flex items-center justify-center p-3 relative group">
              <Image src="/re-logo.png" alt="RE" width={160} height={50} />
            </div>
            <div className="hidden md:block">
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[rgb(var(--re-muted))] opacity-50">Engineering Datasheet</div>
              <div className="text-xl font-black text-[rgb(var(--re-ink))] mt-1 flex items-center gap-2">
                Calc Results <span className="w-1.5 h-1.5 rounded-full bg-[rgb(var(--re-green))]" /> <span className="text-[rgb(var(--re-muted))] font-bold text-sm">{project.name}</span>
              </div>
            </div>
          </div>
          <Link href="/" className="px-6 py-3 rounded-2xl text-sm font-bold bg-white/70 border border-black/10 hover:bg-white transition">
            Dashboard Project
          </Link>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* SIDEBAR */}
          <div className="lg:col-span-3">
            <WorkflowSidebar />
          </div>

          <div className="lg:col-span-9 space-y-8">
            <div className="re-card rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden bg-white/80">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[rgb(var(--re-blue))]/5 to-transparent -mr-32 -mt-32 rounded-full" />

              <div className="relative z-10">
                <div className="border-b border-black/10 pb-6 mb-8 flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-black text-[rgb(var(--re-ink))] tracking-tight">Shell & Tube Heat Exchanger</h1>
                    <p className="text-xs font-bold text-[rgb(var(--re-muted))] uppercase tracking-widest mt-1">Technical Specification Results</p>
                  </div>
                  <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${Math.abs(res.deviation) < 30 ? "bg-[rgb(var(--re-green))]/10 border-[rgb(var(--re-green))]/20 text-[rgb(var(--re-green))]" : "bg-[rgb(var(--re-orange))]/10 border-[rgb(var(--re-orange))]/20 text-[rgb(var(--re-orange))]"}`}>
                    {Math.abs(res.deviation) < 30 ? "Design Passed" : "Check Optimization"}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-1">
                  <DataRow label="Project Name" value={project.name} />
                  <DataRow label="Location" value={project.location || "-"} />

                  <div className="col-span-full h-px bg-black/5 my-4" />

                  <DataRow label="Surface area" value={res.areaConsidered?.toFixed(2)} unit="m²" />
                  <div /> {/* spacing */}

                  <DataRow label="Overall h.t.c." value={res.overallUo?.toFixed(1)} unit="W/m²°C" />
                  <DataRow label="Margin" value={Math.abs(res.deviation)?.toFixed(1)} unit="%" />

                  <div className="col-span-full h-px bg-black/5 my-4" />

                  <DataRow label="Tube passes" value={project.shell.tubePasses} />
                  <DataRow label="Shell passes" value={project.shell.passes} />

                  <DataRow label="Tube OD" value={project.tube.od} unit="mm" />
                  <DataRow label="Shell ID" value={(res.shellDiameter * 1000)?.toFixed(1)} unit="mm" />

                  <DataRow label="Tube ID" value={project.tube.id} unit="mm" />
                  <DataRow label="Baffle spacing" value={(res.shellDiameter * project.shell.baffleRatio * 1000)?.toFixed(0)} unit="mm" />

                  <DataRow label="Tube length" value={project.tube.length} unit="m" />
                  <DataRow label="Baffle cut" value={project.shell.baffleCut} unit="%" />

                  <DataRow label="Tube layout" value={project.tube.pitchType === "triangular" ? "Triangular (30°)" : "Square (90°)"} />
                  <DataRow label="Tube bundle dia." value={res.bundleDiameter?.toFixed(3)} unit="m" />

                  <DataRow label="# of Tubes" value={res.numTubes} />
                  <div />

                  <div className="col-span-full h-px bg-black/5 my-4" />

                  <div className="space-y-1">
                    <DataRow label="Tube side h.t.c" value={res.tubeSide?.hi?.toFixed(1)} unit="W/m²°C" />
                    <DataRow label="Tube pressure drop" value={(res.tubeSide?.pressureDrop / 1000)?.toFixed(4)} unit="kPa" color={res.tubeSide?.pressureDrop / 1000 > (project.cold.allowableDP * 100) ? "text-[rgb(var(--re-orange))]" : ""} />
                  </div>
                  <div className="space-y-1">
                    <DataRow label="Shell side h.t.c" value={res.shellSide?.hs?.toFixed(1)} unit="W/m²°C" />
                    <DataRow label="Shell pressure drop" value={(res.shellSide?.pressureDrop / 1000)?.toFixed(4)} unit="kPa" color={res.shellSide?.pressureDrop / 1000 > (project.hot.allowableDP * 100) ? "text-[rgb(var(--re-orange))]" : ""} />
                  </div>
                </div>

                <div className="mt-12 pt-8 border-t border-black/5 flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="text-[10px] font-bold re-muted max-w-sm uppercase tracking-wider">
                    This datasheet is generated using the Kern Method.
                    Please verify mechanical integrity according to ASME VIII Div 1.
                  </div>
                  <div className="flex gap-4">
                    <button onClick={() => window.print()} className="px-6 py-3 rounded-2xl bg-black text-white text-sm font-bold hover:opacity-90 transition">
                      Export PDF
                    </button>
                    <button onClick={() => router.push("/")} className="px-6 py-3 rounded-2xl border border-black/10 text-sm font-bold hover:bg-black/5 transition">
                      Finish Project
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function DataRow({ label, value, unit, color = "" }: { label: string, value: any, unit?: string, color?: string }) {
  return (
    <div className="flex justify-between items-center py-2.5">
      <div className="text-[11px] font-bold text-[rgb(var(--re-muted))] uppercase tracking-widest">{label}</div>
      <div className={`text-sm font-black ${color || "text-[rgb(var(--re-ink))]"}`}>
        {value ?? "-"}
        {unit && <span className="ml-1 text-[10px] font-bold opacity-40">{unit}</span>}
      </div>
    </div>
  );
}
