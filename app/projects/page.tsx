"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { listSavedProjects, loadSavedProject, deleteSavedProject } from "../../lib/storage/savedProjects";
import { saveProjectDraft } from "../../lib/storage/projectDraft";
import { useRouter } from "next/navigation";

export default function ProjectsPage() {
  const router = useRouter();
  const [items, setItems] = useState(listSavedProjects());

  useEffect(() => {
    setItems(listSavedProjects());
  }, []);

  const refresh = () => setItems(listSavedProjects());

  const openProject = (id: string) => {
    const p = loadSavedProject(id);
    if (!p) return;
    saveProjectDraft(p); // jadikan draft aktif
    router.push("/projects/new/results");
  };

  return (
    <main className="min-h-screen re-geo">
      <div className="mx-auto max-w-5xl px-6 py-10 md:px-10 md:py-14">
        <div className="re-card rounded-[2rem] p-7 md:p-9">
          <div className="text-xs re-muted">Projects</div>
          <h1 className="mt-2 text-2xl md:text-3xl font-extrabold tracking-tight text-[rgb(var(--re-ink))]">
            Saved Projects
          </h1>
          <p className="mt-2 text-sm md:text-base re-muted">
            Daftar project yang sudah disimpan dari halaman Results.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            <Link
              href="/projects/new"
              className="px-4 py-2 rounded-2xl text-sm font-semibold border border-black/10 bg-white/70 hover:bg-white/90 transition"
            >
              Start New Project
            </Link>
            <Link
              href="/"
              className="px-4 py-2 rounded-2xl text-sm font-semibold border border-black/10 bg-white/70 hover:bg-white/90 transition"
            >
              Ke Beranda
            </Link>
          </div>

          <div className="mt-8 space-y-3">
            {items.length === 0 ? (
              <div className="rounded-2xl border border-black/10 bg-white/60 p-5 text-sm re-muted">
                Belum ada project yang disimpan.
              </div>
            ) : (
              items.map((x) => (
                <div key={x.id} className="rounded-2xl border border-black/10 bg-white/60 p-5">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-[rgb(var(--re-ink))]">{x.projectName}</div>
                      <div className="mt-1 text-sm re-muted">
                        Standard: <strong>{x.standard}</strong> • Units: <strong>{x.units}</strong>
                      </div>
                      <div className="mt-1 text-xs re-muted">
                        Updated: {new Date(x.updatedAt).toLocaleString()}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => openProject(x.id)}
                        className="px-4 py-2 rounded-2xl text-sm font-semibold text-white bg-[rgb(var(--re-blue))] hover:opacity-95 transition shadow"
                      >
                        Buka
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          deleteSavedProject(x.id);
                          refresh();
                        }}
                        className="px-4 py-2 rounded-2xl text-sm font-semibold border border-black/10 bg-white/70 hover:bg-white/90 transition text-red-600"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
