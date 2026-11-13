import { describe, expect, it } from "vitest";
import * as engine from "../../src/engine";

describe("public engine API", () => {
  it("runs a complete experiment using only the public entry point", () => {
    const stack: engine.BrickStack = {
      brickCount: 10,
      brick: engine.SOLID_CLAY_BRICK,
      joint: engine.DRY_JOINT,
      baseJoint: engine.DRY_JOINT,
      jointThicknessM: 0,
      mortarDensityKgM3: 0,
    };
    const speedMs = engine.characteristicWindSpeedMs({
      basicSpeedMs: 30,
      s1: 1,
      s2: engine.s2Factor("III", 0.57),
      s3: 1,
    });
    const result = engine.analyzeStack(stack, {
      windPressurePa: engine.windPressurePa(speedMs),
      seismicCoefficient: 0,
    });

    expect(result.stable).toBe(false);
    expect(result.failureMode).toBe("overturning");
    // Same stack as example A: the critical speed does not depend on the speed analysed.
    expect(engine.criticalWindSpeedMs(speedMs, result.loadFactor)).toBeCloseTo(18.47, 2);
  });
});
