import { describe, expect, it } from "vitest";
import {
  NBR15421_ZONE_SEISMIC_COEFFICIENT,
  criticalSeismicCoefficient,
  seismicCoefficientFromAcceleration,
} from "../../../src/engine/actions/seismic";
import { EngineInputError } from "../../../src/engine/validation";
import { expectClose } from "../../helpers";

describe("seismic coefficient (physics model 6.1)", () => {
  it("is the ground acceleration divided by g", () => {
    expectClose(seismicCoefficientFromAcceleration(9.81), 1);
    expectClose(seismicCoefficientFromAcceleration(1.4715), 0.15);
    expect(seismicCoefficientFromAcceleration(0)).toBe(0);
  });

  it("rejects negative accelerations", () => {
    expect(() => seismicCoefficientFromAcceleration(-1)).toThrow(EngineInputError);
  });
});

describe("NBR 15421 zone presets (physics model 6.2)", () => {
  it("uses the upper bound of ag for each zone", () => {
    expect(NBR15421_ZONE_SEISMIC_COEFFICIENT).toEqual({ 0: 0.025, 1: 0.05, 2: 0.1, 3: 0.15, 4: 0.15 });
  });
});

describe("critical seismic coefficient (physics model 9)", () => {
  it("scales linearly with the load factor", () => {
    expectClose(criticalSeismicCoefficient(0.15, 1.0526), 0.1579);
    expectClose(criticalSeismicCoefficient(0.5, 0.8651), 0.4325);
  });
});
