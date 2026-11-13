/**
 * Earthquake actions with the pseudo-static method.
 * Explained in docs/05-physics-model.md, section 6.
 */

import { GRAVITY_MS2 } from "../constants";
import { EngineInputError, requireNonNegative } from "../validation";

/**
 * Horizontal seismic coefficient kh from a peak horizontal ground acceleration.
 *
 *   kh = a / g
 *
 * Physics model, section 6.1.
 */
export function seismicCoefficientFromAcceleration(accelerationMs2: number): number {
  requireNonNegative(accelerationMs2, "accelerationMs2");
  return accelerationMs2 / GRAVITY_MS2;
}

/** Seismic zones of ABNT NBR 15421. */
export type SeismicZone = 0 | 1 | 2 | 3 | 4;

/**
 * Preset seismic coefficient for each Brazilian seismic zone: the upper bound
 * of the characteristic ground acceleration ag of the zone, as a fraction of g.
 * Physics model, section 6.2.
 */
export const NBR15421_ZONE_SEISMIC_COEFFICIENT: Readonly<Record<SeismicZone, number>> = {
  0: 0.025,
  1: 0.05,
  2: 0.1,
  3: 0.15,
  4: 0.15,
};

/**
 * Seismic coefficient at which a structure first fails, given the coefficient
 * that was analysed and the load factor obtained (earthquake-only analysis).
 *
 *   kh,critical = λ · kh
 *
 * Physics model, section 9.
 */
export function criticalSeismicCoefficient(analysedCoefficient: number, loadFactor: number): number {
  requireNonNegative(analysedCoefficient, "analysedCoefficient");
  if (Number.isNaN(loadFactor) || loadFactor < 0) {
    throw new EngineInputError(`loadFactor must be greater than or equal to 0 (received ${loadFactor}).`);
  }
  return analysedCoefficient * loadFactor;
}
