"use client";

import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen p-6 re-geo">
      <div className="mx-auto max-w-5xl">
        <section className="rounded-3xl re-card p-8 md:p-10">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            {/* Logo */}
            <div className="shrink-0">
              <div className="h-20 w-20 md:h-24 md:w-24 rounded-3xl bg-white/85 border border-black/10 shadow-sm flex items-center justify-center overflow-hidden">
                <Image
                  src="/re-logo.png"
                  alt="Rekayasa Engineering Logo"
                  width={120}
                  height={120}
                  className="object-contain scale-125" /* bikin logo landscape keliatan lebih gede */
                  priority
                />
              </div>
            </div>

            {/* Title */}
            <div className="flex-1">
              <div className="text-sm re-muted">API 650 Tank Calculator</div>

              <h1 className="mt-2 text-4xl md:text-6xl font-extrabold leading-[1.05] tracking-tight">
                <span className="re-gradient-text">TankCalc</span>{" "}
                <span className="text-[rgb(var(--re-ink))]">Web App</span>
              </h1>

              <div className="text-sm re-muted mt-3">
                Tema: Rekayasa Engineering (Blue / Green / Orange)
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-lg md:text-xl re-muted mt-8 max-w-2xl">
            Web app interaktif untuk perhitungan tangki (SI/US), hasil table
            course, dan export report.
          </p>

          {/* Actions */}
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/calculator"
              className="px-7 py-3.5 rounded-2xl text-sm font-semibold text-white shadow
                         bg-[rgb(var(--re-blue))] hover:opacity-95 transition"
            >
              Buka Kalkulator
            </Link>

            <button
              type="button"
              className="px-7 py-3.5 rounded-2xl text-sm font-semibold border border-black/10
                         bg-white/70 hover:bg-white/90 transition"
              onClick={() => alert("Info: API 650 TankCalc — coming soon ✨")}
            >
              Info
            </button>
          </div>

          {/* Brand dots */}
          <div className="mt-8 flex items-center gap-3 text-xs re-muted">
            <span className="h-2.5 w-2.5 rounded-full bg-[rgb(var(--re-blue))]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[rgb(var(--re-green))]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[rgb(var(--re-orange))]" />
            <span>Brand colors applied</span>
          </div>
        </section>
      </div>
    </main>
  );
}
