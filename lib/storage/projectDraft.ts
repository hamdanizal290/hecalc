// lib/storage/projectDraft.ts

import { FluidProperties, TubeSpecs, ShellSpecs, CalculationResult, UnitSystem, CalculationMode } from "../heatexchanger/types";

export interface ProjectDraft {
  id: string;
  createdAt: string;
  updatedAt?: string;
  projectName: string;
  units: UnitSystem;
  mode: CalculationMode;
  hot?: FluidProperties;
  cold?: FluidProperties;
  tube?: TubeSpecs;
  shell?: ShellSpecs;
  results?: CalculationResult;
  step: number;
}

const STORAGE_KEY = "heatexchanger:projectDraft";

export function saveProjectDraft(draft: ProjectDraft) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
}

export function loadProjectDraft(): ProjectDraft | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearProjectDraft() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}
