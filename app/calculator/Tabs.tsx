"use client";

type TabKey = "shell" | "bottom" | "roof" | "wind" | "seismic" | "nozzle";

export function Tabs(props: {
  value: TabKey;
  onChange: (v: TabKey) => void;
}) {
  const tabs: { key: TabKey; label: string }[] = [
    { key: "shell", label: "Shell" },
    { key: "bottom", label: "Bottom" },
    { key: "roof", label: "Roof" },
    { key: "wind", label: "Wind" },
    { key: "seismic", label: "Seismic" },
    { key: "nozzle", label: "Nozzle" },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((t) => {
        const active = props.value === t.key;
        return (
          <button
            key={t.key}
            type="button"
            onClick={() => props.onChange(t.key)}
            className={[
              "px-3 py-2 rounded-xl border text-sm transition",
              active
                ? "bg-white text-black border-white"
                : "bg-transparent border-white/15 hover:border-white/30",
            ].join(" ")}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

export type { TabKey };
