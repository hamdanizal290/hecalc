"use client";

import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen p-6 re-geo">
      <div className="mx-auto max-w-5xl">
        <section className="re-card rounded-3xl p-8 md:p-10">
          {/* HEADER */}
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            {/* LOGO (RECTANGLE / LANDSCAPE) */}
            <div className="shrink-0">
              <div className="h-16 w-44 md:h-20 md:w-56 rounded-3xl bg-white/90 border border-black/10 shadow-sm flex items-center justify-center px-3">
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

            {/* TITLE */}
            <div className="flex-1">
              <div className="text-sm re-muted">
                API 650 Tank Calculator
              </div>

              <h1 className="mt-2 text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.05]">
                <span className="re-gradient-text">TankCalc</span>{" "}
                <span className="text-[rgb(var(--re-ink))]">Web App</span>
              </h1>

              <div className="mt-3 text-sm re-muted">
                Tema: Rekayasa Engineering (Blue / Green / Orange)
              </div>
            </div>
          </div>

          {/* DESCRIPTION */}
          <p className="mt-8 max-w-2xl text-lg md:text-xl re-muted">
            Web app interaktif untuk perhitungan tangki (SI/US),
            hasil table course, dan export report.
          </p>

          {/* ACTIONS */}
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/calculator"
              className="px-8 py-3.5 rounded-2xl text-sm font-semibold text-white
                         bg-[rgb(var(--re-blue))] hover:opacity-95 transition shadow"
            >
              Buka Kalkulator
            </Link>

            <button
              type="button"
              className="px-8 py-3.5 rounded-2xl text-sm font-semibold
                         border border-black/10 bg-white/70 hover:bg-white/90 transition"
              onClick={() =>
                alert("API 650 TankCalc\n\nModule Shell aktif.\nModule lain menyusul.")
              }
            >
              Info
            </button>
          </div>

          {/* BRAND DOTS */}
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
