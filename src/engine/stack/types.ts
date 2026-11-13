/**
 * Data shapes of the brick-stack experiment. All plain serialisable objects.
 * Notation follows docs/05-physics-model.md, section 3.
 */

/** One brick. The load acts along the depth direction. */
export interface Brick {
  /** b: horizontal size across the load direction, in m. */
  readonly widthM: number;
  /** d: horizontal size along the load direction, in m. */
  readonly depthM: number;
  /** h: vertical size, in m. */
  readonly heightM: number;
  /** ρ: density, in kg/m³. */
  readonly densityKgM3: number;
}

/** Resistance properties of a horizontal joint (physics model, section 8). */
export interface Joint {
  /** μ: friction coefficient. */
  readonly friction: number;
  /** c: cohesion (shear bond strength with no compression), in Pa. 0 for dry joints. */
  readonly cohesionPa: number;
  /** ft: tensile bond strength normal to the joint, in Pa. 0 for dry joints. */
  readonly tensileStrengthPa: number;
}

/** A single column of identical bricks. */
export interface BrickStack {
  /** n: number of bricks. */
  readonly brickCount: number;
  readonly brick: Brick;
  /** Joints between bricks (joints 1 to n − 1). */
  readonly joint: Joint;
  /** Joint between the first brick and the base (joint 0). */
  readonly baseJoint: Joint;
  /** t: thickness of the mortar layers between bricks, in m. 0 for a dry stack. */
  readonly jointThicknessM: number;
  /** ρm: mortar density, in kg/m³. Ignored when the thickness is 0. */
  readonly mortarDensityKgM3: number;
}

/**
 * Lateral load applied to the stack (physics model, section 7).
 * Normally only one of the two is non-zero.
 */
export interface LateralLoad {
  /** pw = Ca · q: wind pressure on the frontal area, in Pa. */
  readonly windPressurePa: number;
  /** kh: horizontal seismic coefficient (ground acceleration / g). */
  readonly seismicCoefficient: number;
}

/** How a joint can fail. */
export type FailureMode = "sliding" | "overturning" | "bond-rupture";

/**
 * State of a joint under the applied load (physics model, section 8.4):
 * - "intact": fully closed / bonded;
 * - "open": cracked or partly open but still stable (rocking);
 * - "failed": sliding or tipping capacity exceeded.
 */
export type JointState = "intact" | "open" | "failed";

/** Geometry and weight of the part of the stack above one joint. */
export interface PortionAboveJoint {
  /** Joint index i, counted from the base (0). */
  readonly jointIndex: number;
  /** Hi: height of the part above the joint, in m. */
  readonly heightM: number;
  /** Wi: weight of the part above the joint, in N. */
  readonly weightN: number;
}

/** Full result of the checks at one joint. */
export interface JointResult {
  readonly jointIndex: number;
  /** Hi, in m. */
  readonly heightAboveM: number;

  /** N: normal force (weight above), in N. */
  readonly normalForceN: number;
  /** V: shear force, in N. */
  readonly shearForceN: number;
  /** M: moment about the joint, in N·m. */
  readonly momentNm: number;

  /** R = μ·N + c·A, in N. */
  readonly slidingResistanceN: number;
  /** Mcr = (ft + N/A)·Z, in N·m. */
  readonly crackingMomentNm: number;
  /** Mot = N·d/2, in N·m. */
  readonly overturningMomentNm: number;
  /** Mu = max(Mcr, Mot), in N·m. */
  readonly tippingCapacityNm: number;

  /** R / V. Infinity when there is no load. */
  readonly slidingSafetyFactor: number;
  /** Mcr / M. Below 1 means the joint has opened or cracked (not necessarily failed). */
  readonly crackingSafetyFactor: number;
  /** Mot / M. */
  readonly overturningSafetyFactor: number;
  /** Mu / M. */
  readonly tippingSafetyFactor: number;

  /** How this joint would tip: "overturning" if Mcr ≤ Mot, otherwise "bond-rupture". */
  readonly tippingMode: Exclude<FailureMode, "sliding">;
  /** Smallest of the sliding and tipping safety factors. */
  readonly safetyFactor: number;
  /** Failure mode that gives the smallest safety factor (sliding wins ties). */
  readonly governingMode: FailureMode;
  readonly state: JointState;
}

/** Verdict for the whole stack (physics model, section 9). */
export interface StackResult {
  /** True when no joint fails (load factor ≥ 1). */
  readonly stable: boolean;
  /** λ: number by which the load could be multiplied to reach failure. Infinity with no load. */
  readonly loadFactor: number;
  /** Joint with the smallest safety factor (the lowest one in case of a tie). */
  readonly criticalJointIndex: number;
  /** Failure mode with the smallest safety factor, whether or not it is reached. */
  readonly criticalMode: FailureMode;
  /** The failure mode that actually happens, or null if the stack stands. */
  readonly failureMode: FailureMode | null;
  /** Total height of the stack, in m. */
  readonly totalHeightM: number;
  /** Total weight of the stack, in N. */
  readonly totalWeightN: number;
  /** Results for every joint, from the base (index 0) upwards. */
  readonly joints: readonly JointResult[];
}
