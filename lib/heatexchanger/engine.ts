import { FluidProperties, TubeSpecs, ShellSpecs, CalculationResult } from "./types";
import { TRIANGULAR_PITCH, SQUARE_PITCH, BUNDLE_CLEARANCE, TUBE_JH, SHELL_JH, TUBE_JF, SHELL_JF } from "./constants";

/**
 * Linear interpolation
 */
function interpolate(x: number, x1: number, x2: number, y1: number, y2: number): number {
    if (x1 === x2) return y1;
    return y1 + (x - x1) * (y2 - y1) / (x2 - x1);
}

/**
 * Log Mean Temperature Difference
 */
export function calculateLMTD(thIn: number, thOut: number, tcIn: number, tcOut: number): number {
    const dt1 = thIn - tcOut;
    const dt2 = thOut - tcIn;
    if (dt1 <= 0 || dt2 <= 0) return 0;
    if (Math.abs(dt1 - dt2) < 1e-6) return dt1;
    return (dt1 - dt2) / Math.log(dt1 / dt2);
}

/**
 * Correction factor F
 */
export function calculateF(thIn: number, thOut: number, tcIn: number, tcOut: number, shellPasses: number): number {
    if (shellPasses === 0) return 1;
    const R = (thIn - thOut) / (tcOut - tcIn);
    const P = (tcOut - tcIn) / (thIn - tcIn);

    if (Math.abs(R - 1) < 1e-4) {
        const Wp = P / (2 - P);
        return Wp / Math.log((1 + Wp) / (1 - Wp));
    }

    const S = Math.sqrt(R * R + 1) / (R - 1);
    const num = S * Math.log((1 - P) / (1 - P * R));
    const den = Math.log((2 - P * (R + 1 - S)) / (2 - P * (R + 1 + S)));
    return num / den;
}

/**
 * Table lookup with interpolation for JH/JF
 */
function lookupTable(re: number, table: any[], subKey: string, subValue: number): number {
    const sorted = [...table].sort((a, b) => a.re - b.re);

    let lower = sorted[0];
    let upper = sorted[sorted.length - 1];

    if (re <= lower.re) return lower.ld ? lower.ld[subValue] : (lower.cut ? lower.cut[subValue] : lower.jf);
    if (re >= upper.re) return upper.ld ? upper.ld[subValue] : (upper.cut ? upper.cut[subValue] : upper.jf);

    for (let i = 0; i < sorted.length - 1; i++) {
        if (re >= sorted[i].re && re <= sorted[i + 1].re) {
            lower = sorted[i];
            upper = sorted[i + 1];
            break;
        }
    }

    const getSubVal = (obj: any) => {
        const val = obj.ld ? obj.ld[subValue] : (obj.cut ? obj.cut[subValue] : obj.jf);
        return typeof val === 'number' ? val : 0;
    };
    return interpolate(re, lower.re, upper.re, getSubVal(lower), getSubVal(upper));
}

export function performCalculation(
    hot: FluidProperties,
    cold: FluidProperties,
    tube: TubeSpecs,
    shell: ShellSpecs,
    uAssume: number
): CalculationResult {
    const heatLoad = hot.massFlow * hot.cp * Math.abs(hot.tempIn - hot.tempOut);
    const coldFlowrate = heatLoad / (cold.cp * Math.abs(cold.tempIn - cold.tempOut));

    const lmtd = calculateLMTD(hot.tempIn, hot.tempOut, cold.tempIn, cold.tempOut);
    const fCorr = calculateF(hot.tempIn, hot.tempOut, cold.tempIn, cold.tempOut, shell.passes);
    const tm = fCorr * lmtd;

    const areaRequired = heatLoad / (uAssume * tm);
    const areaOneTube = Math.PI * tube.od * (tube.length - 2 * 0.005); // Assume 5mm tubesheet thickness if not provided
    const numTubes = Math.ceil(areaRequired / areaOneTube);
    const areaConsidered = numTubes * areaOneTube;

    // Shell specs
    const pitchMap = tube.pitchType === "triangular" ? TRIANGULAR_PITCH : SQUARE_PITCH;
    const tp = shell.tubePasses as keyof typeof pitchMap;
    const { k1, n1 } = (pitchMap as any)[tp] || (pitchMap as any)[8];
    const bundleDiameter = tube.od * Math.pow(numTubes / k1, 1 / n1);

    // Clearance lookup
    let clearance = 0;
    const bcSorted = [...BUNDLE_CLEARANCE].sort((a, b) => a.dia - b.dia);
    const clearanceRef = bcSorted.find(c => c.dia >= bundleDiameter) || bcSorted[bcSorted.length - 1];
    if (shell.type === "Fixed") clearance = clearanceRef.fixed / 1000;
    else if (shell.type === "Split-ring") clearance = clearanceRef.split / 1000;
    else clearance = clearanceRef.pull / 1000;

    const shellDiameter = bundleDiameter + clearance;

    // Tube-side HTC
    const tubeCSArea = (Math.PI * Math.pow(tube.id, 2)) / 4;
    const tubesPerPass = numTubes / shell.tubePasses;
    const totalFlowArea = tubesPerPass * tubeCSArea;
    const tubeVelocity = cold.massFlow / (cold.rho * totalFlowArea);
    const tubeRe = (cold.rho * tubeVelocity * tube.id) / cold.mu;
    const tubePr = (cold.cp * cold.mu) / cold.k;

    const ldRatio = tube.length / tube.id;
    // Find nearest L/D in database (24, 48, 120, 240, 500)
    const ldOptions = [24, 48, 120, 240, 500];
    const ldMatch = ldOptions.reduce((prev, curr) => Math.abs(curr - ldRatio) < Math.abs(prev - ldRatio) ? curr : prev);
    const tubeJh = lookupTable(tubeRe, TUBE_JH, "ld", ldMatch);
    const hi = tubeJh * tubeRe * Math.pow(tubePr, 0.33) * (cold.k / tube.id);

    // Shell-side HTC
    const pt = tube.pitchRatio * tube.od;
    const baffleSpacing = shellDiameter * shell.baffleRatio;
    const shellCrossFlowArea = (shellDiameter * baffleSpacing * (pt - tube.od)) / pt;
    const de = tube.pitchType === "triangular"
        ? (1.1 * Math.pow(pt, 2) - 0.917 * Math.pow(tube.od, 2)) / tube.od
        : (1.27 * Math.pow(pt, 2) - Math.pow(tube.od, 2)) / tube.od;

    const shellVelocity = hot.massFlow / (hot.rho * shellCrossFlowArea);
    const shellRe = (hot.rho * shellVelocity * de) / hot.mu;
    const shellPr = (hot.cp * hot.mu) / hot.k;
    const shellJh = lookupTable(shellRe, SHELL_JH, "cut", shell.baffleCut);
    const hsIdeal = shellJh * shellRe * Math.pow(shellPr, 0.33) * (hot.k / de);

    // Bell-Delaware Correction Factors
    // Fc: fraction of tubes in cross-flow (Simplified calculation)
    const theta_c = 2 * Math.acos(1 - 2 * (shell.baffleCut / 100));
    const Fc = 1 - (theta_c - Math.sin(theta_c)) / Math.PI;
    const Jc = 0.55 + 0.72 * Fc;

    // Jl: leakage (Simplified r_s, r_t)
    const rs = 0.04; // Assume shell-to-baffle leakage ratio
    const Jl = 0.44 + 0.56 * Math.exp(-1.33 * rs);

    // Jb: bundle bypass
    const rb = 0.05; // Assume bypass area ratio
    const Jb = Math.exp(-1.25 * rb);

    // Js: unequal spacing
    const Js = 1.0; // Assume equal spacing

    // Jr: laminar gradient
    const Jr = shellRe > 100 ? 1.0 : Math.pow(10 / shellRe, 0.1);

    const hs = hsIdeal * Jc * Jl * Jb * Js * Jr;

    // Overall Uo
    // 1/Uo = (1/ho) + (1/hod) + (do*LN(do/di)/(2*kw)) + (do/di)*(1/hid) + (do/di)*(1/hi)
    const invUo = (1 / hs) + hot.foulingResistance + (tube.od * Math.log(tube.od / tube.id) / (2 * tube.materialConductivity)) + (tube.od / tube.id) * (cold.foulingResistance + (1 / hi));
    const overallUo = 1 / invUo;
    const deviation = ((overallUo - uAssume) / uAssume) * 100;

    // Pressure Drop
    const tubeJf = lookupTable(tubeRe, TUBE_JF, "", 0);
    const tubeSideDP = (shell.tubePasses / 2) * (8 * tubeJf * (tube.length / tube.id) + 2.5) * (cold.rho * Math.pow(tubeVelocity, 2) / 2);

    // Shell-side Pressure Drop – Bell–Delaware
    const shellJf = lookupTable(shellRe, SHELL_JF, "cut", shell.baffleCut);
    const Nc = (tube.length / baffleSpacing); // Approximate rows in crossflow
    const dpCross = Nc * shellJf * (hot.rho * Math.pow(shellVelocity, 2) / 2);

    const Nw = Math.ceil(tube.length / baffleSpacing) - 1; // Number of windows
    const Kw = 0.5; // Window loss coefficient
    const uw = shellVelocity * 1.2; // Simplified window velocity
    const dpWindow = Nw * Kw * (hot.rho * Math.pow(uw, 2) / 2);

    const dpLeak = dpCross * ((1 - Jl) / Jl);
    const dpBypass = dpCross * ((1 - Jb) / Jb);
    const dpEnd = 2 * (hot.rho * Math.pow(shellVelocity, 2) / 2); // Simple end zone correction

    const shellSideDP = dpCross + dpWindow + dpLeak + dpBypass + dpEnd;

    return {
        heatLoad,
        coldFlowrate,
        lmtd,
        fCorr,
        tm,
        areaRequired,
        areaOneTube,
        numTubes,
        areaConsidered,
        bundleDiameter,
        bundleClearance: clearance,
        shellDiameter,
        tubeSide: {
            velocity: tubeVelocity,
            re: tubeRe,
            pr: tubePr,
            hi,
            pressureDrop: tubeSideDP
        },
        shellSide: {
            velocity: shellVelocity,
            re: shellRe,
            pr: shellPr,
            hs,
            pressureDrop: shellSideDP
        },
        overallUo,
        deviation,
        bellDelaware: {
            jc: Jc,
            jl: Jl,
            jb: Jb,
            js: Js,
            jr: Jr,
            dpCross,
            dpWindow,
            dpLeak,
            dpBypass,
            dpEnd
        }
    };
}
