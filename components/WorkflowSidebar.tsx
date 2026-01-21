"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

const steps = [
    { id: 1, name: "Project Init", path: "/projects/new" },
    { id: 2, name: "Fluid Properties", path: "/projects/new/fluid" },
    { id: 3, name: "Thermal Design", path: "/projects/new/thermal" },
    { id: 4, name: "Review Results", path: "/projects/new/results" },
];

export default function WorkflowSidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-full space-y-6">
            <div className="flex items-center gap-2 px-2">
                <div className="text-xs font-bold uppercase tracking-widest text-[rgb(var(--re-muted))] opacity-60">Workflow Progress</div>
            </div>

            <nav className="space-y-3">
                {steps.map((step) => {
                    const isActive = pathname === step.path;
                    const isCompleted = steps.findIndex(s => s.path === pathname) > steps.findIndex(s => s.path === step.path);

                    return (
                        <div
                            key={step.id}
                            className={`group flex items-center justify-between p-4 rounded-3xl border transition-all duration-300 ${isActive
                                    ? "bg-[rgb(var(--re-blue))]/5 border-[rgb(var(--re-blue))]/20 shadow-sm"
                                    : "bg-white/40 border-black/5 hover:bg-white/60"
                                }`}
                        >
                            <div className="flex items-center gap-4">
                                <div
                                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors ${isActive
                                            ? "bg-[rgb(var(--re-blue))] text-white"
                                            : isCompleted
                                                ? "bg-[rgb(var(--re-green))] text-white"
                                                : "bg-black/5 text-[rgb(var(--re-muted))]"
                                        }`}
                                >
                                    {isCompleted ? "✓" : step.id}
                                </div>
                                <div>
                                    <div
                                        className={`text-sm font-bold leading-tight ${isActive ? "text-[rgb(var(--re-blue))]" : "text-[rgb(var(--re-ink))]"
                                            }`}
                                    >
                                        {step.name}
                                    </div>
                                    <div className="mt-0.5 text-[10px] font-semibold text-[rgb(var(--re-muted))]">
                                        Step {step.id}
                                    </div>
                                </div>
                            </div>
                            {isActive && (
                                <div className="px-2.5 py-1 rounded-full bg-[rgb(var(--re-blue))] text-[10px] font-black text-white uppercase tracking-tighter">
                                    Active
                                </div>
                            )}
                        </div>
                    );
                })}
            </nav>
        </aside>
    );
}
