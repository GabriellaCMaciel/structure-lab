import { describe, expect, it } from "vitest";
import { DRY_JOINT, MORTARED_JOINTS, SOLID_CLAY_BRICK } from "../../src/engine/materials";

describe("material presets (physics model 11)", () => {
  it("defines the common solid clay brick laid flat", () => {
    expect(SOLID_CLAY_BRICK).toEqual({ widthM: 0.19, depthM: 0.09, heightM: 0.057, densityKgM3: 1800 });
  });

  it("gives dry joints friction only", () => {
    expect(DRY_JOINT).toEqual({ friction: 0.6, cohesionPa: 0, tensileStrengthPa: 0 });
  });

  it("follows NBR 16868-1 Tables 14 and 15 for mortared joints", () => {
    expect(MORTARED_JOINTS.weak).toEqual({ friction: 0.5, cohesionPa: 100_000, tensileStrengthPa: 100_000 });
    expect(MORTARED_JOINTS.medium).toEqual({ friction: 0.5, cohesionPa: 150_000, tensileStrengthPa: 200_000 });
    expect(MORTARED_JOINTS.strong).toEqual({ friction: 0.5, cohesionPa: 350_000, tensileStrengthPa: 250_000 });
  });
});
