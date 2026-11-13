# 4. Architecture

## 4.1 The main idea: two separate parts

```
┌──────────────────────────┐        ┌───────────────────────────────┐
│          ENGINE          │        │              APP              │
│   (pure calculation)     │        │      (3D site, built later)   │
│                          │        │                               │
│  input:  plain data  ────┼──────▶ │  shows the structure in 3D    │
│  output: plain data      │ result │  animates the failure mode    │
│                          │        │  shows numbers and formulas   │
│  no DOM, no Three.js,    │        │                               │
│  no randomness, no clock │        │  Three.js + Vite              │
└──────────────────────────┘        └───────────────────────────────┘
        tested with Vitest                 depends on the engine
     against hand calculations          (never the other way round)
```

**Rule:** the app imports the engine; the engine never imports anything from the app. This is what lets us trust the physics: it can be read, tested and checked by hand without any 3D code in the way.

## 4.2 Technology decisions

| Decision | Choice | Why |
|----------|--------|-----|
| Language | **TypeScript** (strict mode) | Types catch unit and shape mistakes early (for example passing a wind speed where a pressure is expected). Runs in the browser with no server. |
| Tests | **Vitest** | Fast, TypeScript-native, same tooling as Vite. Ideal for many small numeric tests. |
| 3D rendering | **Three.js** (later) | The standard WebGL library, large community, good learning material. Used only for *drawing*. |
| Build tool | **Vite** (when the app starts) | Standard for Three.js + TypeScript projects; shares configuration with Vitest. |
| Physics library | **None in the engine** | See below. |
| Engine dependencies | **Zero** | Nothing to audit or break; the formulas are simple arithmetic. |

### Why no physics library (Rapier, cannon-es, Ammo) in the engine?

Game physics engines step rigid bodies through time. They are excellent for *animation* but they are tuned for stability and speed, not for agreeing with an engineering standard, and their results cannot be reproduced by hand. Our requirement NFR-02 (results verified against hand calculations) points to an **analytical engine**: it computes forces from the standards and checks each failure mode with closed-form formulas.

A rigid-body library may be added **later, in the app**, only to animate the collapse that the analytical engine has already decided. The architecture leaves room for that (see 4.6).

### Was another language considered?

Python or Rust would also work for the calculations, but the result must run in the browser next to Three.js. TypeScript runs there natively, with no extra build step, and the arithmetic is light (well under a millisecond), so there is no performance reason to use WebAssembly. TypeScript is the right choice here.

## 4.3 Folder structure

```
structure-lab/
├── docs/                    documentation (this folder)
├── src/
│   ├── engine/              the simulation core — no DOM, no Three.js
│   │   ├── constants.ts     physical constants (g)
│   │   ├── validation.ts    input checks with clear errors
│   │   ├── actions/         natural events turned into loads
│   │   │   ├── wind.ts        NBR 6123: Vk, S2, dynamic pressure
│   │   │   └── seismic.ts     seismic coefficient, NBR 15421 zones
│   │   ├── materials.ts     brick and mortar presets
│   │   ├── stack/           the brick-stack experiment
│   │   │   ├── types.ts       input and output data shapes
│   │   │   ├── geometry.ts    weights and heights above each joint
│   │   │   ├── checks.ts      sliding, bond rupture, overturning
│   │   │   └── analyze.ts     runs all checks and gives the verdict
│   │   └── index.ts         public API of the engine
│   └── app/                 the 3D site (added later)
├── tests/
│   └── engine/              tests mirroring src/engine
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

## 4.4 Data flow

```
 Experiment definition            Engine                     Result
 (plain object)                                              (plain object)

 stack: bricks, joints   ──▶  1. geometry: weight and    ──▶ per joint: forces,
 load:  wind pressure,           height above each joint      capacities, safety factors
        seismic coefficient   2. actions: force and moment    verdict: stands / fails
                                 at each joint                failure mode + joint
                              3. checks: compare demand       load factor at failure
                                 with capacity
                              4. verdict: weakest check
```

- Inputs and outputs are **plain serialisable objects** (no classes, no methods). They can be logged, saved as JSON, shown in the UI or compared in tests.
- All engine functions are **pure**: same input, same output, no side effects.

## 4.5 Engine design rules

1. **SI units only**, and the unit is part of the name when it could be ambiguous (`speedMs`, `pressurePa`, `accelerationG`).
2. **One formula, one small function**, with a comment pointing to the section of the physics model document.
3. **No hidden defaults for physics.** Coefficients such as friction or drag are explicit inputs; presets live in `materials.ts` and are documented.
4. **Validate at the boundary.** Public functions validate their input and throw a descriptive error; internal functions assume valid data.
5. **No DOM typings.** `tsconfig.json` compiles the engine with `lib: ["ES2022"]` only, so accidental use of `window` or `document` is a compile error.

## 4.6 How the app will use the engine (later)

```ts
import { analyzeStack } from "../engine";

const result = analyzeStack(stack, load);
// result.stable, result.failureMode, result.criticalInterface, ...
// The scene then plays the animation matching result.failureMode.
```

The app decides *how to show* a result; it never decides the result. If a rigid-body library is added for the collapse animation, it receives the failure mode and the failing joint from the engine as its starting condition.

## 4.7 Workflow

- `main` is protected by convention: all changes arrive through pull requests.
- One branch per stage or feature; one commit per feature; commit messages in English using Conventional Commits (`feat:`, `fix:`, `docs:`, `test:`, `chore:`).
- Site requirements that affect architecture later: sans-serif fonts only (NFR-09) and the footer credit (FR-40).
