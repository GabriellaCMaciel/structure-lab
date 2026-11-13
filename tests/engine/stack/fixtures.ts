import { DRY_JOINT, MORTARED_JOINTS, MORTAR_DENSITY_KG_M3, SOLID_CLAY_BRICK } from "../../../src/engine/materials";
import type { BrickStack } from "../../../src/engine/stack/types";

/** Examples A and B: 10 solid bricks, no mortar. */
export const DRY_STACK: BrickStack = {
  brickCount: 10,
  brick: SOLID_CLAY_BRICK,
  joint: DRY_JOINT,
  baseJoint: DRY_JOINT,
  jointThicknessM: 0,
  mortarDensityKgM3: 0,
};

/** Examples C and D: 10 solid bricks, weak mortar at every joint including the base. */
export const MORTARED_STACK: BrickStack = {
  brickCount: 10,
  brick: SOLID_CLAY_BRICK,
  joint: MORTARED_JOINTS.weak,
  baseJoint: MORTARED_JOINTS.weak,
  jointThicknessM: 0.01,
  mortarDensityKgM3: MORTAR_DENSITY_KG_M3,
};

/** Example E: mortared between bricks, simply resting on the ground. */
export const MORTARED_STACK_ON_DRY_BASE: BrickStack = {
  ...MORTARED_STACK,
  baseJoint: DRY_JOINT,
};
