"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function Home() {
  const [openInfo, setOpenInfo] = useState(false);

  return (
    <main className="min-h-screen p-6 re-geo">
      <div className="mx-auto max-w-5xl">
        <section className="re-card rounded-3xl p-8 md:p-10">
          {/* HEADER */}
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            {/* LOGO (RECTANGLE / LANDSCAPE) — jangan diubah */}
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

              {/* Catchy + lebih umum */}
              <p className="mt-4 max-w-3xl text-sm md:text-base re-muted leading-relaxed">
                Tool cepat untuk <strong>desain & verifikasi tangki API 650</strong> —
                dari input sederhana sampai output yang siap direview (SI / US).
              </p>

              {/* Quick chips biar gak sepi tapi tetap minimal */}
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="px-3 py-1.5 rounded-2xl text-xs border border-black/10 bg-white/70 re-muted">
                  SI / US Units
                </span>
                <span className="px-3 py-1.5 rounded-2xl text-xs border border-black/10 bg-white/70 re-muted">
                  Per-course check
                </span>
                <span className="px-3 py-1.5 rounded-2xl text-xs border border-black/10 bg-white/70 re-muted">
                  OK / NOT OK
                </span>
                <span className="px-3 py-1.5 rounded-2xl text-xs border border-black/10 bg-white/70 re-muted">
                  Modular (Shell/Bottom/Roof/Wind/Seismic/Nozzle)
                </span>
              </div>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="mt-9 flex flex-wrap items-center gap-3">
            {/* Primary */}
            <Link
              href="/calculator"
              className="px-10 py-4 rounded-2xl text-sm md:text-base font-semibold text-white
                         bg-[rgb(var(--re-blue))] hover:opacity-95 transition shadow"
            >
              Buka Kalkulator
            </Link>

            {/* Secondary */}
            <button
              type="button"
              className="px-8 py-4 rounded-2xl text-sm md:text-base font-semibold
                         border border-black/10 bg-white/70 hover:bg-white/90 transition"
              onClick={() => setOpenInfo(true)}
              aria-haspopup="dialog"
              aria-expanded={openInfo}
            >
              Tentang
            </button>

            <button
              type="button"
              className="px-8 py-4 rounded-2xl text-sm md:text-base font-semibold
                         border border-black/10 bg-white/70 hover:bg-white/90 transition"
              onClick={() =>
                alert(
                  "Template Input (coming soon)\n\nIde: preset parameter umum (water, diesel, dll) + contoh pembagian course."
                )
              }
            >
              Template Input
            </button>

            <button
              type="button"
              className="px-8 py-4 rounded-2xl text-sm md:text-base font-semibold
                         border border-black/10 bg-white/70 hover:bg-white/90 transition"
              onClick={() =>
                alert(
                  "Dokumentasi (coming soon)\n\nNanti bisa diisi: sumber clause API 650, asumsi, definisi simbol, dan contoh kasus."
                )
              }
            >
              Dokumentasi
            </button>
          </div>

          {/* EXTRA ROW: link kecil (biar ada “produk feel”) */}
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs re-muted">
            <button
              type="button"
              className="hover:underline underline-offset-4"
              onClick={() =>
                alert(
                  "Changelog (coming soon)\n\nNanti bisa isi: versi, perubahan rumus, perbaikan UI, dll."
                )
              }
            >
              Changelog
            </button>
            <button
              type="button"
              className="hover:underline underline-offset-4"
              onClick={() =>
                alert(
                  "Roadmap (coming soon)\n\n• Bottom\n• Roof\n• Wind\n• Seismic\n• Nozzle reinforcement\n• Export PDF/Excel"
                )
              }
            >
              Roadmap
            </button>
            <span className="text-[10px] px-2 py-1 rounded-xl border border-black/10 bg-white/60">
              Internal RE
            </span>
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

      {/* INFO MODAL (simple) */}
      {openInfo ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Info TankCalc"
          onClick={() => setOpenInfo(false)}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-lg rounded-3xl re-card p-6 md:p-7 border border-black/10 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs re-muted">Tentang</div>
                <div className="mt-1 text-lg font-semibold text-[rgb(var(--re-ink))]">
                  TankCalc (API 650)
                </div>
              </div>
              <button
                type="button"
                className="px-3 py-2 rounded-2xl text-sm font-semibold border border-black/10 bg-white/70 hover:bg-white/90 transition"
                onClick={() => setOpenInfo(false)}
              >
                Tutup
              </button>
            </div>

            <div className="mt-4 text-sm re-muted leading-relaxed">
              TankCalc adalah platform kalkulator untuk kebutuhan desain/cek tangki sesuai API 650.
              Targetnya: input cepat, hasil jelas, dan struktur modular buat pengembangan fitur lanjutan.
            </div>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl border border-black/10 bg-white/55 p-4">
                <div className="text-xs re-muted">Saat ini</div>
                <ul className="mt-2 space-y-1 re-muted">
                  <li>• Unit SI / US</li>
                  <li>• Output per course + OK/NOT OK</li>
                  <li>• Struktur modul sudah siap</li>
                </ul>
              </div>
              <div className="rounded-2xl border border-black/10 bg-white/55 p-4">
                <div className="text-xs re-muted">Next</div>
                <ul className="mt-2 space-y-1 re-muted">
                  <li>• Wind / Seismic</li>
                  <li>• Bottom / Roof</li>
                  <li>• Export PDF/Excel</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
