import { describe, expect, it } from "vitest";
import { criticalSeismicCoefficient } from "../../../src/engine/actions/seismic";
import { criticalWindSpeedMs, windPressurePa } from "../../../src/engine/actions/wind";
import { analyzeStack } from "../../../src/engine/stack/analyze";
import type { BrickStack, LateralLoad } from "../../../src/engine/stack/types";
import { EngineInputError } from "../../../src/engine/validation";
import { expectClose } from "../../helpers";
import { DRY_STACK, MORTARED_STACK, MORTARED_STACK_ON_DRY_BASE } from "./fixtures";

const wind = (speedMs: number): LateralLoad => ({ windPressurePa: windPressurePa(speedMs, 1.2), seismicCoefficient: 0 });
const quake = (kh: number): LateralLoad => ({ windPressurePa: 0, seismicCoefficient: kh });

describe("example A — dry stack, wind of 20 m/s", () => {
  const result = analyzeStack(DRY_STACK, wind(20));
  const base = result.joints[0]!;

  it("computes the demand at the base joint", () => {
    expectClose(base.normalForceN, 172.11);
    expectClose(base.shearForceN, 31.866);
    expectClose(base.momentNm, 9.082);
  });

  it("computes the capacities at the base joint", () => {
    expectClose(base.slidingResistanceN, 103.27);
    expectClose(base.crackingMomentNm, 2.582);
    expectClose(base.overturningMomentNm, 7.745);
    expectClose(base.tippingCapacityNm, 7.745);
  });

  it("computes the safety factors at the base joint", () => {
    expectClose(base.slidingSafetyFactor, 3.241);
    expectClose(base.crackingSafetyFactor, 0.2843);
    expectClose(base.overturningSafetyFactor, 0.8528);
    expectClose(base.tippingSafetyFactor, 0.8528);
  });

  it("fails by overturning at the base", () => {
    expect(result.stable).toBe(false);
    expect(result.failureMode).toBe("overturning");
    expect(result.criticalMode).toBe("overturning");
    expect(result.criticalJointIndex).toBe(0);
    expectClose(result.loadFactor, 0.8528);
    expect(base.state).toBe("failed");
  });

  it("gives the critical wind speed of 18.47 m/s", () => {
    expectClose(criticalWindSpeedMs(20, result.loadFactor), 18.47);
  });

  it("matches the other joints checked by hand", () => {
    expectClose(result.joints[1]!.overturningSafetyFactor, 0.9476);
    expect(result.joints[1]!.state).toBe("failed");
    expectClose(result.joints[2]!.overturningSafetyFactor, 1.066);
    expect(result.joints[2]!.state).toBe("open");
    expect(result.joints[9]!.state).toBe("intact");
  });

  it("reports total height and weight", () => {
    expectClose(result.totalHeightM, 0.57);
    expectClose(result.totalWeightN, 172.11);
    expect(result.joints).toHaveLength(10);
  });
});

describe("example B — dry stack, earthquake", () => {
  it("stands but rocks with kh = 0.15", () => {
    const result = analyzeStack(DRY_STACK, quake(0.15));
    const base = result.joints[0]!;
    expectClose(base.shearForceN, 25.817);
    expectClose(base.momentNm, 7.358);
    expectClose(base.slidingSafetyFactor, 4.0);
    expectClose(base.overturningSafetyFactor, 1.0526);
    expectClose(base.crackingSafetyFactor, 0.3509);
    expect(result.stable).toBe(true);
    expect(result.failureMode).toBeNull();
    expect(result.criticalMode).toBe("overturning");
    expect(base.state).toBe("open");
    expectClose(criticalSeismicCoefficient(0.15, result.loadFactor), 0.1579);
  });

  it("fails by overturning at the base with kh = 0.20", () => {
    const result = analyzeStack(DRY_STACK, quake(0.2));
    expect(result.stable).toBe(false);
    expect(result.failureMode).toBe("overturning");
    expect(result.criticalJointIndex).toBe(0);
    expectClose(result.loadFactor, 0.7895);
  });
});

describe("example C — mortared stack, wind of 40 m/s", () => {
  const result = analyzeStack(MORTARED_STACK, wind(40));
  const base = result.joints[0]!;

  it("computes demand and capacities at the base joint", () => {
    expectClose(base.normalForceN, 200.8);
    expectClose(base.shearForceN, 147.59);
    expectClose(base.momentNm, 48.705);
    expectClose(base.slidingResistanceN, 1810.4);
    expectClose(base.crackingMomentNm, 28.662);
    expectClose(base.overturningMomentNm, 9.036);
    expectClose(base.tippingCapacityNm, 28.662);
  });

  it("computes the safety factors at the base joint", () => {
    expectClose(base.slidingSafetyFactor, 12.27);
    expectClose(base.crackingSafetyFactor, 0.5885);
    expectClose(base.overturningSafetyFactor, 0.1855);
    expectClose(base.tippingSafetyFactor, 0.5885);
  });

  it("fails by bond rupture at the base", () => {
    expect(result.stable).toBe(false);
    expect(result.failureMode).toBe("bond-rupture");
    expect(base.tippingMode).toBe("bond-rupture");
    expect(result.criticalJointIndex).toBe(0);
    expectClose(result.loadFactor, 0.5885);
  });

  it("gives the critical wind speed of 30.69 m/s", () => {
    expectClose(criticalWindSpeedMs(40, result.loadFactor), 30.69);
  });
});

describe("example D — mortared stack, earthquake with kh = 0.5", () => {
  const result = analyzeStack(MORTARED_STACK, quake(0.5));

  it("fails by bond rupture at the base", () => {
    const base = result.joints[0]!;
    expectClose(base.shearForceN, 100.4);
    expectClose(base.momentNm, 33.132);
    expectClose(base.slidingSafetyFactor, 18.03);
    expectClose(base.tippingSafetyFactor, 0.8651);
    expect(result.failureMode).toBe("bond-rupture");
    expect(result.criticalJointIndex).toBe(0);
    expectClose(criticalSeismicCoefficient(0.5, result.loadFactor), 0.4325);
  });

  it("keeps joint 1 intact", () => {
    expectClose(result.joints[1]!.tippingSafetyFactor, 1.06);
    expect(result.joints[1]!.state).toBe("intact");
  });
});

describe("example E — mortared stack resting on a dry base, wind of 20 m/s", () => {
  const result = analyzeStack(MORTARED_STACK_ON_DRY_BASE, wind(20));

  it("tips over in one piece at the base", () => {
    const base = result.joints[0]!;
    expectClose(base.shearForceN, 36.9);
    expectClose(base.momentNm, 12.176);
    expectClose(base.slidingSafetyFactor, 3.265);
    expectClose(base.overturningSafetyFactor, 0.7421);
    expect(result.failureMode).toBe("overturning");
    expect(result.criticalJointIndex).toBe(0);
    expectClose(result.loadFactor, 0.7421);
  });

  it("keeps the mortared joint 1 intact", () => {
    expectClose(result.joints[1]!.tippingSafetyFactor, 2.885);
    expect(result.joints[1]!.tippingMode).toBe("bond-rupture");
    expect(result.joints[1]!.state).toBe("intact");
  });
});

describe("closed-form results for dry stacks (physics model 10)", () => {
  it("earthquake sliding factor is μ / kh at every joint", () => {
    const result = analyzeStack(DRY_STACK, quake(0.25));
    for (const joint of result.joints) {
      expectClose(joint.slidingSafetyFactor, 0.6 / 0.25, 1e-9);
    }
  });

  it("earthquake overturning factor is d / (kh · H) at every joint", () => {
    const kh = 0.1;
    const result = analyzeStack(DRY_STACK, quake(kh));
    for (const joint of result.joints) {
      expectClose(joint.overturningSafetyFactor, 0.09 / (kh * joint.heightAboveM), 1e-9);
    }
  });

  it("earthquake thresholds do not depend on density", () => {
    const heavy: BrickStack = { ...DRY_STACK, brick: { ...DRY_STACK.brick, densityKgM3: 7850 } };
    expectClose(analyzeStack(heavy, quake(0.2)).loadFactor, analyzeStack(DRY_STACK, quake(0.2)).loadFactor, 1e-9);
  });

  it("slides before tipping when the stack is squat: one brick, kh above μ", () => {
    // d / H = 0.09 / 0.057 = 1.579 > μ = 0.6, so sliding governs
    const single: BrickStack = { ...DRY_STACK, brickCount: 1 };
    const result = analyzeStack(single, quake(0.7));
    expect(result.failureMode).toBe("sliding");
    expectClose(result.loadFactor, 0.6 / 0.7, 1e-9);
  });

  it("wind sliding factor does not depend on the number of bricks", () => {
    // SF = μ · ρ · g · d / (Ca · q) = 0.6 · 1800 · 9.81 · 0.09 / 294.24 = 3.2407
    for (const brickCount of [1, 3, 10, 40]) {
      const result = analyzeStack({ ...DRY_STACK, brickCount }, wind(20));
      expectClose(result.joints[0]!.slidingSafetyFactor, 3.2407);
    }
  });

  it("wind overturning factor is ρ · g · d² / (Ca · q · H)", () => {
    const result = analyzeStack(DRY_STACK, wind(20));
    for (const joint of result.joints) {
      const expected = (1800 * 9.81 * 0.09 ** 2) / (294.24 * joint.heightAboveM);
      expectClose(joint.overturningSafetyFactor, expected, 1e-9);
    }
  });
});

describe("load factor (physics model 9)", () => {
  it("multiplying the load by the load factor brings the stack exactly to the limit", () => {
    const cases: Array<[BrickStack, LateralLoad]> = [
      [DRY_STACK, wind(20)],
      [DRY_STACK, quake(0.15)],
      [MORTARED_STACK, wind(40)],
      [MORTARED_STACK_ON_DRY_BASE, quake(0.3)],
    ];
    for (const [stack, load] of cases) {
      const { loadFactor } = analyzeStack(stack, load);
      const scaled: LateralLoad = {
        windPressurePa: load.windPressurePa * loadFactor,
        seismicCoefficient: load.seismicCoefficient * loadFactor,
      };
      expectClose(analyzeStack(stack, scaled).loadFactor, 1, 1e-9);
    }
  });

  it("decreases when the load increases", () => {
    expect(analyzeStack(DRY_STACK, wind(25)).loadFactor).toBeLessThan(analyzeStack(DRY_STACK, wind(20)).loadFactor);
  });

  it("adds wind and earthquake forces when both are given", () => {
    const both = analyzeStack(DRY_STACK, { windPressurePa: 294.24, seismicCoefficient: 0.15 });
    // V = 31.866 + 25.817
    expectClose(both.joints[0]!.shearForceN, 57.683);
  });

  it("is infinite and stable with no load", () => {
    const result = analyzeStack(DRY_STACK, quake(0));
    expect(result.loadFactor).toBe(Number.POSITIVE_INFINITY);
    expect(result.stable).toBe(true);
    expect(result.failureMode).toBeNull();
    expect(result.joints.every((joint) => joint.state === "intact")).toBe(true);
  });

  it("treats a load factor of exactly 1 as stable", () => {
    // one block with d = 0.5 m and h = 1 m: overturns at kh = d / H = 0.5 (exact in binary arithmetic)
    const block: BrickStack = { ...DRY_STACK, brickCount: 1, brick: { ...DRY_STACK.brick, depthM: 0.5, heightM: 1 } };
    const result = analyzeStack(block, quake(0.5));
    expect(result.loadFactor).toBe(1);
    expect(result.stable).toBe(true);
    expect(result.failureMode).toBeNull();
  });
});

describe("effect of mortar (comparison of examples A and C)", () => {
  it("raises the critical wind speed from about 66 km/h to about 110 km/h", () => {
    const dry = criticalWindSpeedMs(20, analyzeStack(DRY_STACK, wind(20)).loadFactor);
    const mortared = criticalWindSpeedMs(20, analyzeStack(MORTARED_STACK, wind(20)).loadFactor);
    expectClose(dry * 3.6, 66.5);
    expectClose(mortared * 3.6, 110.5);
  });

  it("stronger mortar never lowers the load factor", () => {
    const weak = analyzeStack(MORTARED_STACK, wind(40)).loadFactor;
    const strong = analyzeStack(
      { ...MORTARED_STACK, joint: { friction: 0.5, cohesionPa: 0.35e6, tensileStrengthPa: 0.25e6 }, baseJoint: { friction: 0.5, cohesionPa: 0.35e6, tensileStrengthPa: 0.25e6 } },
      wind(40),
    ).loadFactor;
    expect(strong).toBeGreaterThan(weak);
  });
});

describe("determinism (NFR-05)", () => {
  it("returns identical results for identical inputs and does not modify them", () => {
    const stack = JSON.parse(JSON.stringify(MORTARED_STACK)) as BrickStack;
    const load = wind(33);
    const first = analyzeStack(stack, load);
    const second = analyzeStack(stack, load);
    expect(second).toEqual(first);
    expect(stack).toEqual(MORTARED_STACK);
  });
});

describe("input validation (NFR-07)", () => {
  const invalidStacks: Array<[string, BrickStack]> = [
    ["zero bricks", { ...DRY_STACK, brickCount: 0 }],
    ["fractional brick count", { ...DRY_STACK, brickCount: 2.5 }],
    ["negative depth", { ...DRY_STACK, brick: { ...DRY_STACK.brick, depthM: -0.09 } }],
    ["zero height", { ...DRY_STACK, brick: { ...DRY_STACK.brick, heightM: 0 } }],
    ["non-finite density", { ...DRY_STACK, brick: { ...DRY_STACK.brick, densityKgM3: Number.NaN } }],
    ["negative friction", { ...DRY_STACK, joint: { ...DRY_STACK.joint, friction: -0.1 } }],
    ["negative base cohesion", { ...DRY_STACK, baseJoint: { ...DRY_STACK.baseJoint, cohesionPa: -1 } }],
    ["negative joint thickness", { ...DRY_STACK, jointThicknessM: -0.01 }],
    ["mortar layers without density", { ...DRY_STACK, jointThicknessM: 0.01, mortarDensityKgM3: 0 }],
  ];

  it.each(invalidStacks)("rejects a stack with %s", (_name, stack) => {
    expect(() => analyzeStack(stack, quake(0.1))).toThrow(EngineInputError);
  });

  it("rejects negative or non-finite loads", () => {
    expect(() => analyzeStack(DRY_STACK, { windPressurePa: -1, seismicCoefficient: 0 })).toThrow(EngineInputError);
    expect(() => analyzeStack(DRY_STACK, { windPressurePa: 0, seismicCoefficient: Number.POSITIVE_INFINITY })).toThrow(
      EngineInputError,
    );
  });

  it("names the offending field in the error message", () => {
    expect(() => analyzeStack({ ...DRY_STACK, brickCount: 0 }, quake(0.1))).toThrow(/brickCount/);
  });
});
