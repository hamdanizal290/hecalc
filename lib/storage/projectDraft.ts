// lib/storage/projectDraft.ts

import type { EnvelopeInput, StandardDecision, UnitKey, StandardKey } from "../domain/standardSelector";

export interface ProjectDraft {
  id: string;
  createdAt: string;

  projectName: string;
  location?: string;

  units: UnitKey;

  envelope: EnvelopeInput;
  decision: StandardDecision;
  recommendedStandard: StandardKey;
}

const STORAGE_KEY = "tankcalc:projectDraft";

export function saveProjectDraft(draft: ProjectDraft) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
}

export function loadProjectDraft(): ProjectDraft | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as ProjectDraft;
  } catch {
    return null;
  }
}

export function clearProjectDraft() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}
