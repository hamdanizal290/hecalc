export type UnitSystem = "SI" | "Imperial";
export type CalculationMode = "Design" | "Rating";

export interface FluidProperties {
  label: string;
  massFlow: number; // kg/s or lb/h
  tempIn: number; // C or F
  tempOut: number; // C or F
  allowableDP: number; // bar or psi
  foulingResistance: number; // m2.K/W or ft2.h.F/Btu
  cp: number; // J/kg.K or Btu/lb.F
  mu: number; // Pa.s or lb/ft.h
  k: number; // W/m.K or Btu/h.ft.F
  rho: number; // kg/m3 or lb/ft3
}

export interface TubeSpecs {
  od: number;
  id: number;
  length: number;
  thickness: number;
  material: string;
  materialConductivity: number;
  pitchType: "triangular" | "square";
  pitchRatio: number; // pt = ratio * do (default 1.25 or 1.33)
}

export interface ShellSpecs {
  type: "Fixed" | "Split-ring" | "Pull-through";
  passes: number;
  tubePasses: number;
  baffleRatio: number;
  baffleCut: number;
}

export interface CalculationResult {
  heatLoad: number;
  coldFlowrate: number;
  lmtd: number;
  fCorr: number;
  tm: number;
  areaRequired: number;
  areaOneTube: number;
  numTubes: number;
  areaConsidered: number;
  bundleDiameter: number;
  bundleClearance: number;
  shellDiameter: number;
  tubeSide: {
    velocity: number;
    re: number;
    pr: number;
    hi: number;
    pressureDrop: number;
  };
  shellSide: {
    velocity: number;
    re: number;
    pr: number;
    hs: number;
    pressureDrop: number;
  };
  overallUo: number;
  deviation: number;
}
export interface Project {
  id: string;
  name: string;
  location?: string;
  units: UnitSystem;
  mode: CalculationMode;
  step: number;
  hot: FluidProperties;
  cold: FluidProperties;
  tube: TubeSpecs;
  shell: ShellSpecs;
  results?: CalculationResult;
}
