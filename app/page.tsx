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
              <div className="text-sm re-muted">API 650 Tank Calculator</div>

              <h1 className="mt-2 text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.05]">
                <span className="re-title">
                  <span className="tank">Tank</span>
                  <span className="calc">Calc</span>
                  <span className="dot" aria-hidden="true" />
                </span>{" "}
                <span className="text-[rgb(var(--re-ink))]">Web App</span>
              </h1>
            </div>
          </div>

          {/* DESCRIPTION (DETAILED) */}
          <p className="mt-8 max-w-3xl text-base md:text-lg re-muted leading-relaxed">
            Web-based engineering tool untuk perhitungan desain tangki silinder
            vertikal sesuai <strong>API 650</strong>. Aplikasi ini mendukung
            pilihan satuan <strong>SI / US</strong>, menghitung ketebalan shell{" "}
            <strong>per course</strong>, menampilkan hasil verifikasi{" "}
            <strong>OK / NOT OK</strong>, serta menyediakan struktur modular
            untuk pengembangan lanjutan (bottom plate, roof, wind load, seismic
            load, dan nozzle reinforcement).
          </p>

          {/* FEATURE BULLETS */}
          <ul className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm re-muted">
            <li>• Perhitungan shell tank berbasis API 650</li>
            <li>• Sistem satuan SI dan US</li>
            <li>• Evaluasi OK / NOT OK per course</li>
            <li>• Fondasi modular: bottom, roof, wind, seismic, nozzle</li>
          </ul>

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
                alert(
                  "TankCalc (API 650)\n\n• Unit: SI / US\n• Output: Shell per course (OK/NOT OK)\n• Modul lanjutan: Bottom/Roof/Wind/Seismic/Nozzle (coming soon)"
                )
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
            <span>Engineering calculator platform</span>
          </div>
        </section>
      </div>
    </main>
  );
}
