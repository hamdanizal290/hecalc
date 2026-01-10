"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type ModalKey = "about" | "changelog" | "roadmap" | "internal" | "support" | null;

function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg rounded-3xl re-card p-6 md:p-7 border border-black/10 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="text-lg font-semibold text-[rgb(var(--re-blue))]">
            {title}
          </div>
          <button
            type="button"
            className="px-3 py-2 rounded-2xl text-sm font-semibold border border-black/10 bg-white/85 hover:bg-white transition"
            onClick={onClose}
          >
            Tutup
          </button>
        </div>

        <div className="mt-3 text-sm re-muted leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const [modal, setModal] = useState<ModalKey>(null);

  const modalContent = useMemo(() => {
    switch (modal) {
      case "about":
        return {
          title: "Tentang TankCalc",
          body: (
            <>
              TankCalc adalah tool internal untuk mendukung{" "}
              <strong className="text-[rgb(var(--re-blue))]">
                perhitungan & verifikasi desain tangki
              </strong>{" "}
              mengacu pada{" "}
              <strong className="text-[rgb(var(--re-green))]">API 650</strong>.
              Fokusnya: input ringkas, hasil jelas, dan siap untuk proses review.
            </>
          ),
        };
      case "changelog":
        return {
          title: "Changelog",
          body: (
            <>
              Placeholder untuk catatan perubahan versi.
              <ul className="mt-2 list-disc pl-5">
                <li>v0.1 — UI home + struktur modul</li>
                <li>v0.2 — shell thickness per course (planned)</li>
                <li>v0.3 — export / report (planned)</li>
              </ul>
            </>
          ),
        };
      case "roadmap":
        return {
          title: "Roadmap",
          body: (
            <>
              Rencana pengembangan modul (bertahap):
              <ul className="mt-2 list-disc pl-5">
                <li>
                  <strong className="text-[rgb(var(--re-blue))]">Shell</strong>{" "}
                  (core)
                </li>
                <li>Bottom</li>
                <li>Roof</li>
                <li>Wind</li>
                <li>Seismic</li>
                <li>Nozzle reinforcement</li>
                <li>Export PDF/Excel + report ringkas</li>
              </ul>
            </>
          ),
        };
      case "internal":
        return {
          title: "Internal RE",
          body: (
            <>
              Tool ini ditujukan untuk penggunaan internal divisi Mechanical.
              Jika mau disebar ke luar tim, biasanya perlu rapihin:
              <ul className="mt-2 list-disc pl-5">
                <li>Dokumentasi asumsi & referensi clause</li>
                <li>Validasi contoh kasus (benchmark)</li>
                <li>Approval alur review</li>
              </ul>
            </>
          ),
        };
      case "support":
        return {
          title: "Bantuan & Dukungan",
          body: (
            <>
              Kalau nemu bug / butuh fitur:
              <ul className="mt-2 list-disc pl-5">
                <li>Catat input yang dipakai</li>
                <li>Screenshot hasil</li>
                <li>Tulis langkah reproduksi</li>
              </ul>
              <div className="mt-2">
                (Placeholder) Nanti bisa diarahkan ke channel internal / PIC.
              </div>
            </>
          ),
        };
      default:
        return null;
    }
  }, [modal]);

  // Helpers: kalau route belum ada, fallback alert biar tetap “klik = ada aksi”
  const safePush = (path: string, fallbackMsg: string) => {
    try {
      router.push(path);
    } catch {
      alert(fallbackMsg);
    }
  };

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
              <button
                type="button"
                className="px-4 py-2 rounded-2xl text-sm font-semibold border border-black/10 bg-white/70 hover:bg-white/90 transition"
                onClick={() => setModal("changelog")}
              >
                Changelog
              </button>

              <button
                type="button"
                className="px-4 py-2 rounded-2xl text-sm font-semibold border border-black/10 bg-white/70 hover:bg-white/90 transition"
                onClick={() => setModal("roadmap")}
              >
                Roadmap
              </button>

              <button
                type="button"
                className="px-3 py-2 rounded-2xl text-sm font-semibold border border-black/10 bg-white/60 hover:bg-white/90 transition re-muted"
                onClick={() => setModal("internal")}
              >
                Internal RE
              </button>
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
                  <span className="dot" aria-hidden="true" />
                </span>{" "}
                <span className="text-[rgb(var(--re-ink))]">Web App</span>
              </h1>

              <p className="mt-6 max-w-2xl text-base md:text-lg re-muted leading-relaxed">
                Platform kalkulator untuk{" "}
                <strong className="text-[rgb(var(--re-blue))]">
                  perhitungan dan verifikasi desain tangki
                </strong>{" "}
                mengacu pada{" "}
                <strong className="text-[rgb(var(--re-green))]">API 650</strong>
                —input ringkas, hasil jelas, dan siap untuk proses review{" "}
                <strong className="text-[rgb(var(--re-orange))]">(SI / US)</strong>
                .
              </p>

              {/* ACTIONS */}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href="/calculator"
                  className="px-10 py-4 rounded-2xl text-base md:text-lg font-semibold text-white
                             bg-[rgb(var(--re-blue))] hover:opacity-95 transition shadow"
                >
                  Buka Kalkulator
                </Link>

                <button
                  type="button"
                  className="px-8 py-4 rounded-2xl text-base md:text-lg font-semibold text-[rgb(var(--re-blue))] hover:opacity-90 transition"
                  onClick={() => setModal("about")}
                >
                  Tentang
                </button>

                <button
                  type="button"
                  className="px-8 py-4 rounded-2xl text-base md:text-lg font-semibold text-[rgb(var(--re-green))] hover:opacity-90 transition"
                  onClick={() =>
                    safePush(
                      "/calculator?template=default",
                      "Template Input belum tersedia. (Nanti bisa diarahkan ke preset input di halaman calculator.)"
                    )
                  }
                >
                  Template Input
                </button>
              </div>

              {/* BRAND DOTS */}
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
                <button
                  type="button"
                  className="px-4 py-2 rounded-2xl text-sm font-semibold text-[rgb(var(--re-blue))] border border-black/10 hover:bg-white/70 transition"
                  onClick={() =>
                    safePush(
                      "/docs",
                      "Halaman Dokumentasi Teknis belum ada. (Nanti bisa dibuat route /docs.)"
                    )
                  }
                >
                  Dokumentasi Teknis
                </button>

                <button
                  type="button"
                  className="px-4 py-2 rounded-2xl text-sm font-semibold text-[rgb(var(--re-green))] border border-black/10 hover:bg-white/70 transition"
                  onClick={() => setModal("support")}
                >
                  Bantuan & Dukungan
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* MODAL RENDER */}
      {modalContent ? (
        <Modal title={modalContent.title} onClose={() => setModal(null)}>
          {modalContent.body}
        </Modal>
      ) : null}
    </main>
  );
}
