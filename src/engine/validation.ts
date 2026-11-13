/**
 * Input validation helpers. Public engine functions validate their inputs with
 * these and throw a descriptive error, so physically impossible values (NFR-07)
 * never reach the formulas.
 */

/** Error thrown when an engine input is not physically meaningful. */
export class EngineInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EngineInputError";
  }
}

/** Requires a finite number greater than zero (sizes, densities). */
export function requirePositive(value: number, name: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new EngineInputError(`${name} must be a finite number greater than 0 (received ${value}).`);
  }
}

/** Requires a finite number greater than or equal to zero (loads, strengths). */
export function requireNonNegative(value: number, name: string): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new EngineInputError(`${name} must be a finite number greater than or equal to 0 (received ${value}).`);
  }
}

/** Requires a whole number greater than or equal to one (counts). */
export function requirePositiveInteger(value: number, name: string): void {
  if (!Number.isInteger(value) || value < 1) {
    throw new EngineInputError(`${name} must be a whole number greater than or equal to 1 (received ${value}).`);
  }
}
