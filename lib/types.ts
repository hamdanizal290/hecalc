export type Unit = "SI" | "US";

export interface ShellInput {
  unit: Unit;
  diameter: number;
  height: number;
  courses: number;
  designLiquidHeight: number;
  specificGravity: number;
  corrosionAllowance: number;
  fy: number;
  jointEfficiency: number;
}

export interface ShellCourseResult {
  courseNo: number;
  required: number;
  adopted: number;
  status: "OK" | "NG";
}
