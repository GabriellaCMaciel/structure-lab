# 2. Requirements

Priorities use MoSCoW: **Must** (required for the MVP), **Should** (important, right after the MVP), **Could** (nice to have), **Later** (explicitly out of the MVP).

## 2.1 Functional requirements

### Experiments and structures

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-01 | The user can choose an experiment from a list of ready-made experiments. | Must |
| FR-02 | The user can configure a **brick stack**: number of bricks, brick dimensions and orientation, material density. | Must |
| FR-03 | The user can choose how bricks are joined: **dry** (no mortar) or **mortared**, with selectable mortar strength class. | Must |
| FR-04 | The user can choose what the stack stands on (dry contact or mortared to the base). | Must |
| FR-05 | The user can configure a free-standing brick **wall**. | Later |
| FR-06 | The user can compare a **wooden house** and a **brick house**. | Later |
| FR-07 | The user can build a free-form structure from blocks. | Later |

### Natural events

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-10 | The user can apply **wind**, defined either by wind speed directly or by basic speed plus terrain factors (NBR 6123). | Must |
| FR-11 | The user can apply an **earthquake**, defined by peak horizontal ground acceleration (as a fraction of g), with presets for the Brazilian seismic zones (NBR 15421). | Must |
| FR-12 | The user can apply a **storm** (strong gusty wind plus rain effects such as wet, lower-friction surfaces). | Later |
| FR-13 | The user can vary the event intensity continuously (slider) and see the result update. | Should |

### Results and explanation

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-20 | For every experiment the engine returns a verdict: **stands** or **fails**. | Must |
| FR-21 | When it fails, the engine reports **how** (sliding, overturning, mortar bond rupture) and **where** (which joint). | Must |
| FR-22 | The engine reports **safety factors** for each failure mode at each joint. | Must |
| FR-23 | The engine reports the **critical intensity**: the wind speed or ground acceleration at which the structure first fails. | Must |
| FR-24 | The app shows the intermediate numbers (weights, forces, moments) and the formula used for each. | Should |
| FR-25 | The app explains the result in plain language ("the wind pushed harder than the weight could resist"). | Should |
| FR-26 | The app links each formula to the physics model document. | Could |

### 3D visualisation

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-30 | The app shows the structure in 3D and lets the user orbit and zoom. | Should |
| FR-31 | The app animates the failure mode decided by the engine (slide, tip over). The animation illustrates the result; it does not decide it. | Should |
| FR-32 | The app visualises the event (wind streaks, ground shaking). | Could |

### Site

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-40 | The footer shows "Gabriella Swarttz" as a link to `https://github.com/GabriellaCMaciel`. | Must (when the site exists) |
| FR-41 | The site has an "About the model" page summarising assumptions and limits. | Should |

## 2.2 Non-functional requirements

| ID | Requirement | How we verify it |
|----|-------------|------------------|
| NFR-01 | **Correctness.** Every engine formula is documented in the physics model document with its source. | Review: each engine function references a section of `05-physics-model.md`. |
| NFR-02 | **Verified by hand.** Engine results match hand-calculated reference cases within 0.1 %. | Automated tests (Vitest) run on every change. |
| NFR-03 | **Engine independence.** The engine has no dependency on the DOM, Three.js or any rendering code, and no runtime dependencies at all. | The engine is compiled without DOM typings; the dependency list is empty. |
| NFR-04 | **Honesty.** The site clearly states it is educational and must not be used to design real structures; every experiment lists its simplifications. | Review of UI copy. |
| NFR-05 | **Determinism.** The same input always gives exactly the same output (no randomness, no time dependence). | Engine functions are pure; tests are repeatable. |
| NFR-06 | **Units.** SI units only inside the engine; conversions (km/h, g) happen only at the edges and are named explicitly. | Code review; naming convention (`speedMs`, `pressurePa`). |
| NFR-07 | **Input validation.** Physically impossible inputs (negative sizes, zero bricks) are rejected with a clear error. | Automated tests. |
| NFR-08 | **Performance.** One analysis runs in under 1 ms on a typical laptop so that sliders feel instant. | Benchmark test (Should). |
| NFR-09 | **Typography.** The site uses sans-serif fonts only. | Review of CSS. |
| NFR-10 | **Accessibility.** Results are available as text (not only as animation), with sufficient colour contrast and keyboard access. | Manual check; automated audit (Should). |
| NFR-11 | **Compatibility.** Works on current desktop and mobile browsers with WebGL 2. | Manual test matrix. |
| NFR-12 | **Maintainability.** TypeScript in strict mode; one feature per commit; changes go through pull requests. | Compiler settings; repository history. |
| NFR-13 | **Documentation language.** All documentation and code are written in English. | Review. |

## 2.3 Open questions

These are decisions not yet made. They do not block the engine.

1. **Interface language**: English only, or English and Brazilian Portuguese?
2. **Hosting**: GitHub Pages (static site) is assumed; to be confirmed.
3. **Final name**: "Structure Lab" is a working name.
