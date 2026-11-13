/**
 * Demand and capacity at one joint of a brick stack.
 * Explained in docs/05-physics-model.md, sections 7 and 8.
 */

import type { FailureMode, Joint, JointResult, JointState, LateralLoad, PortionAboveJoint } from "./types";

/** Geometry of the joint plane needed by the checks. */
export interface JointSection {
  /** b, in m. */
  readonly widthM: number;
  /** d, in m. */
  readonly depthM: number;
}

/** capacity / demand, with "no demand" meaning an infinite safety factor. */
function safetyFactor(capacity: number, demand: number): number {
  return demand > 0 ? capacity / demand : Number.POSITIVE_INFINITY;
}

/**
 * Runs every check at one joint.
 *
 * Demand (section 7):
 *   N = W
 *   V = pw · b · H + kh · W
 *   M = V · H / 2
 *
 * Capacity (section 8):
 *   sliding      R   = μ · N + c · A
 *   cracking     Mcr = (ft + N / A) · Z,   Z = b · d² / 6
 *   overturning  Mot = N · d / 2
 *   tipping      Mu  = max(Mcr, Mot)
 */
export function checkJoint(
  portion: PortionAboveJoint,
  section: JointSection,
  joint: Joint,
  load: LateralLoad,
): JointResult {
  const areaM2 = section.widthM * section.depthM;
  const sectionModulusM3 = (section.widthM * section.depthM * section.depthM) / 6;

  // Demand
  const normalForceN = portion.weightN;
  const shearForceN =
    load.windPressurePa * section.widthM * portion.heightM + load.seismicCoefficient * portion.weightN;
  const momentNm = (shearForceN * portion.heightM) / 2;

  // Capacity
  const slidingResistanceN = joint.friction * normalForceN + joint.cohesionPa * areaM2;
  const crackingMomentNm = (joint.tensileStrengthPa + normalForceN / areaM2) * sectionModulusM3;
  const overturningMomentNm = (normalForceN * section.depthM) / 2;
  const tippingCapacityNm = Math.max(crackingMomentNm, overturningMomentNm);

  // Safety factors
  const slidingSafetyFactor = safetyFactor(slidingResistanceN, shearForceN);
  const crackingSafetyFactor = safetyFactor(crackingMomentNm, momentNm);
  const overturningSafetyFactor = safetyFactor(overturningMomentNm, momentNm);
  const tippingSafetyFactor = safetyFactor(tippingCapacityNm, momentNm);

  const tippingMode = crackingMomentNm > overturningMomentNm ? "bond-rupture" : "overturning";
  const governingMode: FailureMode = slidingSafetyFactor <= tippingSafetyFactor ? "sliding" : tippingMode;
  const jointSafetyFactor = Math.min(slidingSafetyFactor, tippingSafetyFactor);

  let state: JointState;
  if (jointSafetyFactor < 1) {
    state = "failed";
  } else if (momentNm > crackingMomentNm) {
    state = "open";
  } else {
    state = "intact";
  }

  return {
    jointIndex: portion.jointIndex,
    heightAboveM: portion.heightM,
    normalForceN,
    shearForceN,
    momentNm,
    slidingResistanceN,
    crackingMomentNm,
    overturningMomentNm,
    tippingCapacityNm,
    slidingSafetyFactor,
    crackingSafetyFactor,
    overturningSafetyFactor,
    tippingSafetyFactor,
    tippingMode,
    safetyFactor: jointSafetyFactor,
    governingMode,
    state,
  };
}
