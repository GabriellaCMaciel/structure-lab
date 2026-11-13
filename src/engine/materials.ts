/**
 * Material presets. Sources and confidence levels are listed in
 * docs/05-physics-model.md, section 11. Every value is a plain input of the
 * engine; these presets only make the lab usable out of the box.
 */

import type { Brick, Joint } from "./stack/types";

/** Common Brazilian solid clay brick laid flat, loaded along its 90 mm side. */
export const SOLID_CLAY_BRICK: Brick = {
  widthM: 0.19,
  depthM: 0.09,
  heightM: 0.057,
  densityKgM3: 1800,
};

/** Usual bed-joint thickness, in m. */
export const DEFAULT_JOINT_THICKNESS_M = 0.01;

/** Typical density of cement-lime-sand mortar, in kg/m³. */
export const MORTAR_DENSITY_KG_M3 = 1900;

/** Dry brick-on-brick contact: friction only. */
export const DRY_JOINT: Joint = {
  friction: 0.6,
  cohesionPa: 0,
  tensileStrengthPa: 0,
};

/** Mortar strength classes of ABNT NBR 16868-1 (by mortar compressive strength). */
export type MortarClass = "weak" | "medium" | "strong";

/**
 * Mortared joints following ABNT NBR 16868-1:2020, Tables 14 and 15
 * (characteristic values, no safety coefficients):
 * - "weak": mortar of 1.5 to 3.4 MPa;
 * - "medium": mortar of 3.5 to 7.0 MPa;
 * - "strong": mortar above 7.0 MPa.
 */
export const MORTARED_JOINTS: Readonly<Record<MortarClass, Joint>> = {
  weak: { friction: 0.5, cohesionPa: 0.1e6, tensileStrengthPa: 0.1e6 },
  medium: { friction: 0.5, cohesionPa: 0.15e6, tensileStrengthPa: 0.2e6 },
  strong: { friction: 0.5, cohesionPa: 0.35e6, tensileStrengthPa: 0.25e6 },
};
