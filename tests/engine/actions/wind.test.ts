import { describe, expect, it } from "vitest";
import {
  characteristicWindSpeedMs,
  criticalWindSpeedMs,
  dynamicPressurePa,
  kmhToMs,
  msToKmh,
  s2Factor,
  windPressurePa,
} from "../../../src/engine/actions/wind";
import type { TerrainCategory } from "../../../src/engine/actions/wind";
import { EngineInputError } from "../../../src/engine/validation";
import { expectClose } from "../../helpers";

describe("dynamic pressure (physics model 5.3)", () => {
  it("matches the hand calculations of examples A, C and F", () => {
    expectClose(dynamicPressurePa(20), 245.2);
    expectClose(dynamicPressurePa(40), 980.8);
    expectClose(dynamicPressurePa(26.31), 424.4);
  });

  it("is zero with no wind and quadruples when the speed doubles", () => {
    expect(dynamicPressurePa(0)).toBe(0);
    expectClose(dynamicPressurePa(30) / dynamicPressurePa(15), 4);
  });
});

describe("wind pressure on the frontal area (physics model 5.4)", () => {
  it("multiplies the dynamic pressure by the drag coefficient", () => {
    expectClose(windPressurePa(20, 1.2), 294.24);
    expectClose(windPressurePa(40, 1.2), 1176.96);
  });

  it("uses Ca = 1.2 by default", () => {
    expect(windPressurePa(20)).toBe(windPressurePa(20, 1.2));
  });
});

describe("S2 factor, Class A (physics model 5.2)", () => {
  it("matches the hand calculation of example F", () => {
    expectClose(s2Factor("III", 5), 0.8771);
  });

  it("reproduces the standard's table at z ≤ 5 m (two decimals)", () => {
    const table: Record<TerrainCategory, number> = { I: 1.06, II: 0.94, III: 0.88, IV: 0.79, V: 0.74 };
    for (const [category, tabulated] of Object.entries(table)) {
      expect(s2Factor(category as TerrainCategory, 5)).toBeCloseTo(tabulated, 2);
    }
  });

  it("reproduces the standard's table at z = 50 m (two decimals)", () => {
    const table: Record<TerrainCategory, number> = { I: 1.21, II: 1.15, III: 1.1, IV: 1.04, V: 0.94 };
    for (const [category, tabulated] of Object.entries(table)) {
      expect(s2Factor(category as TerrainCategory, 50)).toBeCloseTo(tabulated, 2);
    }
  });

  it("equals bm at the reference height of 10 m", () => {
    expectClose(s2Factor("II", 10), 1.0);
    expectClose(s2Factor("IV", 10), 0.86);
  });

  it("is constant below the minimum height (5 m; 10 m for category V)", () => {
    expect(s2Factor("II", 0.57)).toBe(s2Factor("II", 5));
    expect(s2Factor("V", 3)).toBe(s2Factor("V", 10));
    expectClose(s2Factor("V", 8), 0.74);
  });

  it("rejects unknown categories and negative heights", () => {
    expect(() => s2Factor("VI" as TerrainCategory, 5)).toThrow(EngineInputError);
    expect(() => s2Factor("II", -1)).toThrow(EngineInputError);
  });
});

describe("characteristic wind speed (physics model 5.1)", () => {
  it("matches the hand calculation of example F", () => {
    const vk = characteristicWindSpeedMs({ basicSpeedMs: 30, s1: 1, s2: s2Factor("III", 0.66), s3: 1 });
    expectClose(vk, 26.31);
  });

  it("rejects non-positive factors", () => {
    expect(() => characteristicWindSpeedMs({ basicSpeedMs: 30, s1: 0, s2: 1, s3: 1 })).toThrow(EngineInputError);
  });
});

describe("critical wind speed (physics model 9)", () => {
  it("scales with the square root of the load factor", () => {
    expectClose(criticalWindSpeedMs(20, 0.8528), 18.47);
    expectClose(criticalWindSpeedMs(40, 0.5885), 30.69);
  });
});

describe("speed conversions", () => {
  it("converts between km/h and m/s", () => {
    expectClose(msToKmh(20), 72);
    expectClose(kmhToMs(144), 40);
  });
});

describe("input validation", () => {
  it("rejects negative or non-finite speeds", () => {
    expect(() => dynamicPressurePa(-1)).toThrow(EngineInputError);
    expect(() => dynamicPressurePa(Number.NaN)).toThrow(EngineInputError);
    expect(() => windPressurePa(20, 0)).toThrow(EngineInputError);
  });
});
