/**
 * Geometry and weight of a brick stack.
 * Explained in docs/05-physics-model.md, sections 3 and 4.
 */

import { GRAVITY_MS2 } from "../constants";
import type { BrickStack, PortionAboveJoint } from "./types";

/** A = b · d: contact area of a joint, in m². */
export function jointAreaM2(stack: BrickStack): number {
  return stack.brick.widthM * stack.brick.depthM;
}

/** Z = b · d² / 6: section modulus of a joint for bending along the depth, in m³. */
export function jointSectionModulusM3(stack: BrickStack): number {
  return (stack.brick.widthM * stack.brick.depthM * stack.brick.depthM) / 6;
}

/**
 * Height and weight of the part of the stack above joint i.
 *
 *   Hi = (n − i) · h + (n − 1 − i) · t
 *   Wi = g · b · d · [ ρ · (n − i) · h + ρm · (n − 1 − i) · t ]
 *
 * Physics model, section 4.
 */
export function portionAboveJoint(stack: BrickStack, jointIndex: number): PortionAboveJoint {
  const bricksAbove = stack.brickCount - jointIndex;
  const mortarLayersAbove = bricksAbove - 1;
  const heightM = bricksAbove * stack.brick.heightM + mortarLayersAbove * stack.jointThicknessM;
  const massPerAreaKgM2 =
    stack.brick.densityKgM3 * bricksAbove * stack.brick.heightM +
    stack.mortarDensityKgM3 * mortarLayersAbove * stack.jointThicknessM;
  const weightN = GRAVITY_MS2 * jointAreaM2(stack) * massPerAreaKgM2;
  return { jointIndex, heightM, weightN };
}
