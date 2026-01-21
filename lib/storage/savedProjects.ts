// lib/storage/savedProjects.ts

import {
  loadProjectDraft,
  saveProjectDraft,
  type ProjectDraft,
} from "./projectDraft";

export interface SavedProjectMeta {
  id: string;
  name: string;
  savedAt: string;
  units: ProjectDraft["units"];
  mode: ProjectDraft["mode"];
}

interface SavedProjectRecord {
  id: string;
  savedAt: string;
  draft: ProjectDraft;
}

const STORAGE_KEY = "heatexchanger:savedProjects";

const readAll = (): SavedProjectRecord[] => {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
};

const writeAll = (items: SavedProjectRecord[]) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

export function listSavedProjects(): SavedProjectMeta[] {
  const items = readAll();
  return items
    .slice()
    .sort((a, b) => (a.savedAt < b.savedAt ? 1 : -1))
    .map((x) => ({
      id: x.id,
      name: x.draft.projectName,
      savedAt: x.savedAt,
      units: x.draft.units,
      mode: x.draft.mode,
    }));
}

export function saveCurrentDraftAsProject(): string | null {
  const draft = loadProjectDraft();
  if (!draft) return null;

  const id = `saved-${Date.now()}`;
  const savedAt = new Date().toISOString();

  const record: SavedProjectRecord = {
    id,
    savedAt,
    draft: {
      ...draft,
      updatedAt: draft.updatedAt ?? draft.createdAt,
    },
  };

  const items = readAll();
  writeAll([record, ...items]);

  saveProjectDraft({ ...draft, updatedAt: new Date().toISOString() });

  return id;
}

export function loadSavedProjectIntoDraft(id: string): ProjectDraft | null {
  const items = readAll();
  const rec = items.find((x) => x.id === id);
  if (!rec) return null;

  saveProjectDraft({ ...rec.draft, updatedAt: new Date().toISOString() });
  return rec.draft;
}

export function deleteSavedProject(id: string) {
  const items = readAll().filter((x) => x.id !== id);
  writeAll(items);
}
