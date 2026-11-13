import { describe, expect, it } from "vitest";
import { jointAreaM2, jointSectionModulusM3, portionAboveJoint } from "../../../src/engine/stack/geometry";
import { expectClose } from "../../helpers";
import { DRY_STACK, MORTARED_STACK } from "./fixtures";

describe("joint section (physics model 3 and 8.2)", () => {
  it("computes area and section modulus", () => {
    expectClose(jointAreaM2(DRY_STACK), 0.0171);
    expectClose(jointSectionModulusM3(DRY_STACK), 0.0002565);
  });
});

describe("portion above a joint (physics model 4)", () => {
  it("matches example A at the base of the dry stack", () => {
    const base = portionAboveJoint(DRY_STACK, 0);
    expectClose(base.heightM, 0.57);
    expectClose(base.weightN, 172.11);
  });

  it("matches example C at the base of the mortared stack", () => {
    const base = portionAboveJoint(MORTARED_STACK, 0);
    expectClose(base.heightM, 0.66);
    expectClose(base.weightN, 200.8);
  });

  it("has one brick and no mortar above the top joint", () => {
    const top = portionAboveJoint(MORTARED_STACK, 9);
    expectClose(top.heightM, 0.057);
    // 9.81 · 0.0171 · 1800 · 0.057
    expectClose(top.weightN, 17.211);
  });

  it("counts bricks and mortar layers above an intermediate joint", () => {
    // joint 4 of the mortared stack: 6 bricks and 5 mortar layers above
    const portion = portionAboveJoint(MORTARED_STACK, 4);
    expectClose(portion.heightM, 6 * 0.057 + 5 * 0.01);
    // 9.81 · 0.0171 · (1800 · 0.342 + 1900 · 0.05) = 9.81 · 0.0171 · 710.6
    expectClose(portion.weightN, 119.2);
  });
});
