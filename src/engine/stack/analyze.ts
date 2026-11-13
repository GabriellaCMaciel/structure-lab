/**
 * Analysis of a brick stack under a lateral load: runs the checks at every
 * joint and gives the verdict. Explained in docs/05-physics-model.md, section 9.
 */

import { EngineInputError, requireNonNegative, requirePositive, requirePositiveInteger } from "../validation";
import { checkJoint } from "./checks";
import { portionAboveJoint } from "./geometry";
import type { BrickStack, Joint, JointResult, LateralLoad, StackResult } from "./types";

function validateJoint(joint: Joint, name: string): void {
  requireNonNegative(joint.friction, `${name}.friction`);
  requireNonNegative(joint.cohesionPa, `${name}.cohesionPa`);
  requireNonNegative(joint.tensileStrengthPa, `${name}.tensileStrengthPa`);
}

/** Throws an {@link EngineInputError} if the stack is not physically meaningful. */
export function validateStack(stack: BrickStack): void {
  requirePositiveInteger(stack.brickCount, "brickCount");
  requirePositive(stack.brick.widthM, "brick.widthM");
  requirePositive(stack.brick.depthM, "brick.depthM");
  requirePositive(stack.brick.heightM, "brick.heightM");
  requirePositive(stack.brick.densityKgM3, "brick.densityKgM3");
  validateJoint(stack.joint, "joint");
  validateJoint(stack.baseJoint, "baseJoint");
  requireNonNegative(stack.jointThicknessM, "jointThicknessM");
  requireNonNegative(stack.mortarDensityKgM3, "mortarDensityKgM3");
  if (stack.jointThicknessM > 0 && stack.mortarDensityKgM3 === 0) {
    throw new EngineInputError("mortarDensityKgM3 must be greater than 0 when jointThicknessM is greater than 0.");
  }
}

/** Throws an {@link EngineInputError} if the load is not physically meaningful. */
export function validateLoad(load: LateralLoad): void {
  requireNonNegative(load.windPressurePa, "windPressurePa");
  requireNonNegative(load.seismicCoefficient, "seismicCoefficient");
}

/**
 * Analyses a brick stack under a lateral load.
 *
 * The load factor λ is the smallest safety factor over all joints and failure
 * modes; the stack stands when λ ≥ 1. Ties are resolved towards the lower
 * joint, and towards sliding within a joint.
 */
export function analyzeStack(stack: BrickStack, load: LateralLoad): StackResult {
  validateStack(stack);
  validateLoad(load);

  const section = { widthM: stack.brick.widthM, depthM: stack.brick.depthM };
  const joints: JointResult[] = [];
  for (let jointIndex = 0; jointIndex < stack.brickCount; jointIndex += 1) {
    const portion = portionAboveJoint(stack, jointIndex);
    const joint = jointIndex === 0 ? stack.baseJoint : stack.joint;
    joints.push(checkJoint(portion, section, joint, load));
  }

  const base = joints[0];
  if (base === undefined) {
    throw new EngineInputError("The stack has no joints to analyse.");
  }
  let critical = base;
  for (const joint of joints) {
    if (joint.safetyFactor < critical.safetyFactor) {
      critical = joint;
    }
  }

  const stable = critical.safetyFactor >= 1;
  return {
    stable,
    loadFactor: critical.safetyFactor,
    criticalJointIndex: critical.jointIndex,
    criticalMode: critical.governingMode,
    failureMode: stable ? null : critical.governingMode,
    totalHeightM: base.heightAboveM,
    totalWeightN: base.normalForceN,
    joints,
  };
}
