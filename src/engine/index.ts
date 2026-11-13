/**
 * Public API of the Structure Lab engine.
 *
 * The engine is pure calculation: no DOM, no rendering, no randomness.
 * The physics is explained in docs/05-physics-model.md.
 */

export { GRAVITY_MS2 } from "./constants";
export { EngineInputError } from "./validation";

export {
  DEFAULT_DRAG_COEFFICIENT,
  characteristicWindSpeedMs,
  criticalWindSpeedMs,
  dynamicPressurePa,
  kmhToMs,
  msToKmh,
  s2Factor,
  windPressurePa,
} from "./actions/wind";
export type { CharacteristicWindSpeedInput, TerrainCategory } from "./actions/wind";

export {
  NBR15421_ZONE_SEISMIC_COEFFICIENT,
  criticalSeismicCoefficient,
  seismicCoefficientFromAcceleration,
} from "./actions/seismic";
export type { SeismicZone } from "./actions/seismic";

export {
  DEFAULT_JOINT_THICKNESS_M,
  DRY_JOINT,
  MORTARED_JOINTS,
  MORTAR_DENSITY_KG_M3,
  SOLID_CLAY_BRICK,
} from "./materials";
export type { MortarClass } from "./materials";

export { analyzeStack, validateLoad, validateStack } from "./stack/analyze";
export { checkJoint } from "./stack/checks";
export { jointAreaM2, jointSectionModulusM3, portionAboveJoint } from "./stack/geometry";
export type {
  Brick,
  BrickStack,
  FailureMode,
  Joint,
  JointResult,
  JointState,
  LateralLoad,
  PortionAboveJoint,
  StackResult,
} from "./stack/types";
