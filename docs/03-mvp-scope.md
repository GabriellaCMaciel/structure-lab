# 3. MVP Scope and Roadmap

## 3.1 MVP goal

> Deliver **one experiment that is completely correct and completely explained**: a stack of bricks, with and without mortar, under wind and under earthquake.

The MVP is built in two layers, in this order:

1. **Engine MVP** — the calculation core with automated tests against hand calculations. *This is the priority.*
2. **Visual MVP** — a minimal 3D scene that uses the engine for that one experiment.

## 3.2 In scope (MVP)

| Area | Included |
|------|----------|
| Structure | A single column of identical bricks stacked one on top of another (FR-02) |
| Joints | Dry (friction only) or mortared (friction + cohesion + tensile bond), three mortar strength classes (FR-03, FR-04) |
| Wind | Characteristic speed, dynamic pressure and drag force following NBR 6123 (FR-10) |
| Earthquake | Equivalent static horizontal force from peak ground acceleration, zone presets from NBR 15421 (FR-11) |
| Checks | Sliding, joint opening/bond rupture, overturning — at every joint (FR-20 to FR-22) |
| Output | Verdict, failure mode, critical joint, safety factors, critical wind speed / acceleration (FR-23) |
| Quality | Tests versus hand calculations, input validation, documentation of the model (NFR-01, 02, 07) |

## 3.3 Out of scope (for now) — and why

| Left for later | Why it is not in the MVP |
|----------------|--------------------------|
| Brick **wall** (FR-05) | Needs bending of the wall as a plate and bond patterns; next step after the stack. |
| **Wooden vs brick house** (FR-06) | Needs roof uplift, connections (nails, anchors) and pressure coefficients for buildings; much larger model. |
| **Storm** (FR-12) | It is wind plus rain effects; needs data on how wetting changes friction and mortar. Wind alone already covers the main effect. |
| **Time-step dynamics** (blocks actually moving and colliding) | Hard to validate by hand. The MVP engine is analytical; dynamics may be added later only to *animate* a failure the engine has already decided. |
| Free-form building (FR-07) | Requires a general solver; depends on everything above. |
| Material crushing, foundations and soil | Negligible for small stacks; documented as a model limit. |
| Accounts, saving, sharing | Not needed to learn from one experiment. |

## 3.4 Roadmap

| Phase | Deliverable | Status |
|-------|-------------|--------|
| 0 | Documentation: vision, requirements, scope, architecture | This document set |
| 1 | Physics model document | Planned |
| 2 | Engine: brick stack under wind and earthquake, with tests | Planned |
| 3 | Minimal 3D scene using the engine | Planned |
| 4 | Explanations in the UI (numbers, formulas, plain language) | Later |
| 5 | Brick wall experiment | Later |
| 6 | Storm event | Later |
| 7 | Wooden house vs brick house | Later |

## 3.5 Definition of done for the engine MVP

- [ ] Every formula in the code appears in the physics model document with its source.
- [ ] Every worked example in the physics model document is an automated test.
- [ ] Tests pass, and the code compiles in strict mode with no DOM typings.
- [ ] Invalid inputs are rejected with clear messages.
