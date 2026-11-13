/**
 * Wind actions following ABNT NBR 6123 (1988 edition values).
 * Explained in docs/05-physics-model.md, section 5.
 */

import { EngineInputError, requireNonNegative, requirePositive } from "../validation";

/** Terrain roughness categories of NBR 6123 (I = open sea ... V = big city centre). */
export type TerrainCategory = "I" | "II" | "III" | "IV" | "V";

interface S2Parameters {
  /** Meteorological parameter (called "b" in the standard). */
  readonly bm: number;
  /** Exponent of the power law. */
  readonly p: number;
  /** Height below which S2 is taken as constant, in metres. */
  readonly minHeightM: number;
}

/**
 * Gust factor Fr for Class A (largest dimension up to 20 m, 3-second gust).
 * Physics model, section 5.2.
 */
const GUST_FACTOR_CLASS_A = 1.0;

/**
 * S2 parameters for Class A. Physics model, section 5.2.
 * The standard tabulates S2 from z = 5 m; for category V it is constant up to 10 m.
 */
const S2_PARAMETERS_CLASS_A: Readonly<Record<TerrainCategory, S2Parameters>> = {
  I: { bm: 1.1, p: 0.06, minHeightM: 5 },
  II: { bm: 1.0, p: 0.085, minHeightM: 5 },
  III: { bm: 0.94, p: 0.1, minHeightM: 5 },
  IV: { bm: 0.86, p: 0.12, minHeightM: 5 },
  V: { bm: 0.74, p: 0.15, minHeightM: 10 },
};

/** Drag coefficient used by the lab when the user does not provide one (section 5.4). */
export const DEFAULT_DRAG_COEFFICIENT = 1.2;

/**
 * S2 factor (terrain roughness and height) for Class A structures.
 *
 *   S2 = bm · Fr · (z / 10)^p
 *
 * Heights below the standard's minimum use the minimum (S2 constant near the ground).
 * Physics model, section 5.2.
 */
export function s2Factor(category: TerrainCategory, heightAboveGroundM: number): number {
  const parameters = S2_PARAMETERS_CLASS_A[category];
  if (parameters === undefined) {
    throw new EngineInputError(`Unknown terrain category "${String(category)}". Use "I", "II", "III", "IV" or "V".`);
  }
  requireNonNegative(heightAboveGroundM, "heightAboveGroundM");
  const z = Math.max(heightAboveGroundM, parameters.minHeightM);
  return parameters.bm * GUST_FACTOR_CLASS_A * Math.pow(z / 10, parameters.p);
}

/** Inputs of the characteristic wind speed. */
export interface CharacteristicWindSpeedInput {
  /** Basic wind speed V0 from the standard's map, in m/s. */
  readonly basicSpeedMs: number;
  /** Topographic factor S1 (1.0 on flat ground). */
  readonly s1: number;
  /** Roughness and height factor S2 (see {@link s2Factor}). */
  readonly s2: number;
  /** Statistical factor S3 (1.0 for ordinary buildings). */
  readonly s3: number;
}

/**
 * Characteristic wind speed, in m/s.
 *
 *   Vk = V0 · S1 · S2 · S3
 *
 * Physics model, section 5.1.
 */
export function characteristicWindSpeedMs(input: CharacteristicWindSpeedInput): number {
  requireNonNegative(input.basicSpeedMs, "basicSpeedMs");
  requirePositive(input.s1, "s1");
  requirePositive(input.s2, "s2");
  requirePositive(input.s3, "s3");
  return input.basicSpeedMs * input.s1 * input.s2 * input.s3;
}

/**
 * Dynamic pressure of the wind, in Pa (N/m²).
 *
 *   q = 0.613 · Vk²
 *
 * Physics model, section 5.3.
 */
export function dynamicPressurePa(characteristicSpeedMs: number): number {
  requireNonNegative(characteristicSpeedMs, "characteristicSpeedMs");
  return 0.613 * characteristicSpeedMs * characteristicSpeedMs;
}

/**
 * Wind pressure acting on the frontal area of the structure, in Pa.
 *
 *   pw = Ca · q        (so that F = pw · Ae = Ca · q · Ae)
 *
 * Physics model, section 5.4.
 */
export function windPressurePa(
  characteristicSpeedMs: number,
  dragCoefficient: number = DEFAULT_DRAG_COEFFICIENT,
): number {
  requirePositive(dragCoefficient, "dragCoefficient");
  return dragCoefficient * dynamicPressurePa(characteristicSpeedMs);
}

/**
 * Wind speed at which a structure first fails, in m/s, given the speed that
 * was analysed and the load factor obtained (wind-only analysis).
 *
 *   Vk,critical = Vk · √λ
 *
 * Physics model, section 9.
 */
export function criticalWindSpeedMs(analysedSpeedMs: number, loadFactor: number): number {
  requireNonNegative(analysedSpeedMs, "analysedSpeedMs");
  if (Number.isNaN(loadFactor) || loadFactor < 0) {
    throw new EngineInputError(`loadFactor must be greater than or equal to 0 (received ${loadFactor}).`);
  }
  return analysedSpeedMs * Math.sqrt(loadFactor);
}

/** Converts a speed from km/h to m/s. */
export function kmhToMs(speedKmh: number): number {
  return speedKmh / 3.6;
}

/** Converts a speed from m/s to km/h. */
export function msToKmh(speedMs: number): number {
  return speedMs * 3.6;
}
