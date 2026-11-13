import { expect } from "vitest";

/**
 * Asserts that a value matches a hand-calculated reference within a relative
 * tolerance (default 0.1 %, requirement NFR-02).
 */
export function expectClose(actual: number, expected: number, relativeTolerance = 1e-3): void {
  const relativeError = Math.abs(actual - expected) / Math.abs(expected);
  expect(
    relativeError,
    `expected ${actual} to be within ${relativeTolerance * 100} % of ${expected}`,
  ).toBeLessThanOrEqual(relativeTolerance);
}
