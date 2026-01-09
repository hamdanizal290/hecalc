import { ShellCourseResult, ShellInput, Unit } from "./types";

// Placeholder: nanti ganti rumus API 650 asli
export function calcShell(input: ShellInput): ShellCourseResult[] {
  const courses = Math.max(1, Math.min(40, Math.floor(input.courses || 1)));

  const base = input.unit === "SI" ? 6 : 0.25;
  const step = input.unit === "SI" ? 1.5 : 0.0625;

  return Array.from({ length: courses }, (_, i) => {
    const courseNo = i + 1;
    const req = base + (courses - courseNo) * step;
    const adopted = roundUpToStandard(req + (input.corrosionAllowance || 0), input.unit);

    return {
      courseNo,
      required: round(req),
      adopted: round(adopted),
      status: adopted >= req + (input.corrosionAllowance || 0) ? "OK" : "NG",
    };
  });
}

function round(x: number) {
  return Math.round(x * 1000) / 1000;
}

function roundUpToStandard(x: number, unit: Unit) {
  if (unit === "SI") {
    const standards = [6, 8, 10, 12, 14, 16, 18, 20, 22, 25, 28, 32];
    return standards.find((s) => s >= x) ?? x;
  }
  const standards = [0.25, 0.3125, 0.375, 0.5, 0.625, 0.75, 1.0];
  return standards.find((s) => s >= x) ?? x;
}
