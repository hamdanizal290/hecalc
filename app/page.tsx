"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function Home() {
  const [openInfo, setOpenInfo] = useState(false);

  return (
    <main className="min-h-screen re-geo">
      <div className="mx-auto max-w-6xl px-6 py-10 md:px-10 md:py-14">
        <section className="rounded-[2rem]">
          {/* TOP BAR */}
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-6">
              {/* LOGO — jangan diubah */}
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

              <div className="hidden sm:block">
                <div className="text-xs md:text-sm re-muted">
                  API 650 Tank Calculator
                </div>
                <div className="mt-1 text-sm re-muted">
                  Internal tool • Mechanical Engineering
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button className="px-4 py-2 rounded-2xl text-sm font-semibold border border-black/10 bg-white/70">
                Changelog
              </button>
              <button className="px-4 py-2 rounded-2xl text-sm font-semibold border border-black/10 bg-white/70">
                Roadmap
              </button>
              <span className="px-3 py-2 rounded-2xl text-sm font-semibold border border-black/10 bg-white/60 re-muted">
                Internal RE
              </span>
            </div>
          </div>

          {/* GRID */}
          <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
            {/* LEFT */}
            <div className="lg:col-span-7 re-card rounded-[2rem] p-8 md:p-10">
              <div className="text-xs md:text-sm re-muted">
                Desain & verifikasi tangki
              </div>

              <h1 className="mt-3 text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.03]">
                <span className="re-title">
                  <span className="tank">Tank</span>
                  <span className="calc">Calc</span>
                  <span className="dot" />
                </span>{" "}
                <span className="text-[rgb(var(--re-ink))]">Web App</span>
              </h1>

              <p className="mt-6 max-w-2xl text-base md:text-lg re-muted leading-relaxed">
                Platform kalkulator untuk{" "}
                <strong className="text-[rgb(var(--re-blue))]">
                  perhitungan dan verifikasi desain tangki
                </strong>{" "}
                mengacu pada{" "}
                <strong className="text-[rgb(var(--re-green))]">
                  API 650
                </strong>
                —input ringkas, hasil jelas, dan siap untuk proses review{" "}
                <strong className="text-[rgb(var(--re-orange))]">
                  (SI / US)
                </strong>
                .
              </p>

              {/* ACTIONS */}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href="/calculator"
                  className="px-10 py-4 rounded-2xl text-base md:text-lg font-semibold text-white
                             bg-[rgb(var(--re-blue))] shadow"
                >
                  Buka Kalkulator
                </Link>

                <button
                  className="px-8 py-4 rounded-2xl text-base md:text-lg font-semibold text-[rgb(var(--re-blue))]"
                  onClick={() => setOpenInfo(true)}
                >
                  Tentang
                </button>

                <button className="px-8 py-4 rounded-2xl text-base md:text-lg font-semibold text-[rgb(var(--re-green))]">
                  Template Input
                </button>
              </div>

              <div className="mt-10 flex items-center gap-3 text-sm re-muted">
                <span className="h-3 w-3 rounded-full bg-[rgb(var(--re-blue))]" />
                <span className="h-3 w-3 rounded-full bg-[rgb(var(--re-green))]" />
                <span className="h-3 w-3 rounded-full bg-[rgb(var(--re-orange))]" />
                <span>Engineering calculator platform</span>
              </div>
            </div>

            {/* RIGHT */}
            <div className="lg:col-span-5 re-card rounded-[2rem] p-6 md:p-7">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs re-muted">Sorotan</div>
                  <div className="mt-1 text-lg font-semibold text-[rgb(var(--re-blue))]">
                    Kapabilitas Utama
                  </div>
                </div>

                <span className="px-3 py-1.5 rounded-2xl text-xs font-semibold border border-black/10 bg-white/80 text-[rgb(var(--re-green))]">
                  API 650
                </span>
              </div>

              <div className="mt-5 space-y-4">
                <div>
                  <div className="font-semibold text-[rgb(var(--re-blue))]">
                    Sistem Satuan (SI / US)
                  </div>
                  <p className="text-sm re-muted">
                    Mendukung SI dan US untuk menjaga konsistensi perhitungan dari
                    input hingga output.
                  </p>
                </div>

                <div>
                  <div className="font-semibold text-[rgb(var(--re-green))]">
                    Verifikasi per Course
                  </div>
                  <p className="text-sm re-muted">
                    Menampilkan kebutuhan tebal minimum dan status kelulusan (OK /
                    NOT OK) per course.
                  </p>
                </div>

                <div>
                  <div className="font-semibold text-[rgb(var(--re-orange))]">
                    Struktur Modular
                  </div>
                  <p className="text-sm re-muted">
                    Dirancang modular (Shell → Bottom → Roof → Wind → Seismic →
                    Nozzle) untuk pengembangan bertahap.
                  </p>
                </div>

                <div>
                  <div className="font-semibold text-[rgb(var(--re-blue))]">
                    Catatan
                  </div>
                  <p className="text-sm re-muted">
                    Mulai dari modul Shell. Modul lain disiapkan agar penambahan
                    fitur tidak mengubah UI secara signifikan.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                <button className="px-4 py-2 rounded-2xl text-sm font-semibold text-[rgb(var(--re-blue))] border border-black/10">
                  Dokumentasi Teknis
                </button>
                <button className="px-4 py-2 rounded-2xl text-sm font-semibold text-[rgb(var(--re-green))] border border-black/10">
                  Bantuan & Dukungan
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* MODAL */}
      {openInfo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setOpenInfo(false)}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-lg rounded-3xl re-card p-6 md:p-7"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-lg font-semibold text-[rgb(var(--re-blue))]">
              Tentang TankCalc
            </div>
            <p className="mt-3 text-sm re-muted">
              Tool internal untuk mendukung perhitungan dan verifikasi desain
              tangki berbasis API 650 dengan pendekatan modular.
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
