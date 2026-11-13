# 5. Physics Model

This document explains **what the engine calculates and why**. It is written to be read by someone who is still learning: every idea is introduced before it is used, every formula says where it comes from, and the last sections say honestly what the model does **not** represent.

Scope of this version: **a stack of bricks, with or without mortar, under wind or earthquake** (the MVP experiment).

**Contents**

1. [The big picture](#1-the-big-picture)
2. [Concepts you need](#2-concepts-you-need)
3. [The structure: geometry and notation](#3-the-structure-geometry-and-notation)
4. [Weight](#4-weight)
5. [Wind (NBR 6123)](#5-wind-nbr-6123)
6. [Earthquake (pseudo-static method, NBR 15421)](#6-earthquake-pseudo-static-method-nbr-15421)
7. [Demand: what the event asks of each joint](#7-demand-what-the-event-asks-of-each-joint)
8. [Capacity: what each joint can resist](#8-capacity-what-each-joint-can-resist)
9. [Verdict, load factor and critical intensity](#9-verdict-load-factor-and-critical-intensity)
10. [Three things the formulas teach us](#10-three-things-the-formulas-teach-us)
11. [Material values used](#11-material-values-used)
12. [Simplifications and why we made them](#12-simplifications-and-why-we-made-them)
13. [Limits: what the model does NOT represent well](#13-limits-what-the-model-does-not-represent-well)
14. [Worked examples (calculated by hand)](#14-worked-examples-calculated-by-hand)
15. [References](#15-references)

---

## 1. The big picture

Engineers answer "will it stand?" by comparing two things:

- **Demand** — what the event (wind, earthquake) asks of the structure: forces trying to push it sideways and tip it over.
- **Capacity** — what the structure can resist: its weight holding it down, friction, and the glue effect of mortar.

```
safety factor = capacity / demand

  safety factor > 1  →  it stands (capacity is larger)
  safety factor < 1  →  it fails
  safety factor = 1  →  exactly at the limit
```

The engine does this comparison at **every joint** of the stack, for **every way the joint can fail**, and the smallest safety factor decides the result.

This is an **analytical, quasi-static** model: it uses closed-form formulas and treats the event as a steady sideways push. It does not simulate bricks moving through time. That choice is what makes every number checkable by hand (see section 12).

## 2. Concepts you need

| Concept | Meaning | Unit |
|---------|---------|------|
| **Force** | A push or pull. | newton (N). 1 N is roughly the weight of a 100 g apple. |
| **Weight** | The force of gravity on a mass: `W = m · g`, with `g = 9.81 m/s²`. | N |
| **Pressure / stress** | Force spread over an area: `force / area`. We say *pressure* for wind on a surface and *stress* for forces inside a material. | pascal (Pa = N/m²). 1 MPa = 1 000 000 Pa. |
| **Moment** | The turning effect of a force: `force × distance` to the point it tries to rotate about (the "lever arm"). A small force far away turns as much as a large force close by — like a door handle. | N·m |
| **Friction** | Resistance to sliding between two surfaces pressed together. Maximum friction = `μ × normal force`, where `μ` (mu) is the friction coefficient. | μ has no unit |
| **Normal force (N)** | The force pressing two surfaces together, perpendicular to them. For a horizontal joint it is the weight of everything above. | N |
| **Shear force (V)** | The force trying to slide one part over another, parallel to the joint. | N |
| **Safety factor (SF)** | `capacity / demand`. | no unit |

## 3. The structure: geometry and notation

A **stack** is a single column of `n` identical bricks, one on top of another.

```
            load direction  ──▶

              ┌───────────┐   ▲
              │  brick n  │   │
  joint n-1 ─ ├───────────┤   │
              │    ...    │   │  H = total height
  joint 1 ─── ├───────────┤   │
              │  brick 1  │   │
  joint 0 ─── └───────────┘   ▼   (joint 0 = contact with the base/ground)
              ◀──── d ────▶
```

| Symbol | Meaning | Unit |
|--------|---------|------|
| `n` | number of bricks | – |
| `b` | brick **width**: horizontal size *across* the load direction (the face the wind hits is `b` wide) | m |
| `d` | brick **depth**: horizontal size *along* the load direction (this is what resists tipping) | m |
| `h` | brick height | m |
| `ρ` (rho) | brick density | kg/m³ |
| `t` | mortar joint thickness (0 for a dry stack) | m |
| `ρm` | mortar density | kg/m³ |
| `A = b · d` | contact area of a joint | m² |

**Joints are numbered from the bottom:** joint `i` is the plane directly under brick `i + 1`. Joint 0 is the contact between the first brick and the base. Each joint can fail, so each joint is checked.

Each joint has three resistance properties (section 8):

| Symbol | Meaning | Dry joint | Mortared joint |
|--------|---------|-----------|----------------|
| `μ` | friction coefficient | yes | yes |
| `c` | cohesion: shear strength of the bond with zero weight on it | 0 | > 0 |
| `ft` | tensile bond strength: how hard you must pull to separate the joint | 0 | > 0 |

The joint under the first brick (joint 0) has its own properties, because a stack may be mortared between bricks but simply resting on the ground.

## 4. Weight

Everything **above** joint `i` is: `(n − i)` bricks and `(n − 1 − i)` mortar layers.

```
height above joint i:   Hi = (n − i) · h + (n − 1 − i) · t

weight above joint i:   Wi = g · b · d · [ ρ · (n − i) · h + ρm · (n − 1 − i) · t ]
```

Where it comes from: `weight = mass × g` and `mass = density × volume` (basic mechanics).

Because bricks and joints alternate symmetrically, the **centre of mass** of the part above joint `i` is exactly at mid-height, `Hi / 2` above the joint.

## 5. Wind (NBR 6123)

Source: **ABNT NBR 6123 — Forças devidas ao vento em edificações** (the Brazilian wind standard). The values below are from the 1988 edition; see the note at the end of this section.

### 5.1 From the weather map to the wind speed at the structure

```
Vk = V0 · S1 · S2 · S3
```

| Symbol | Meaning |
|--------|---------|
| `V0` | **Basic wind speed**: a 3-second gust, exceeded on average once in 50 years, measured 10 m above open flat ground. It comes from a map in the standard (roughly 30 to 50 m/s across Brazil). |
| `S1` | **Topographic factor**: 1.0 on flat ground; larger on hilltops, smaller in sheltered valleys. |
| `S2` | **Roughness and height factor**: wind is slower near the ground and behind obstacles (section 5.2). |
| `S3` | **Statistical factor**: how much safety the use of the building deserves (1.0 for ordinary buildings such as houses). |
| `Vk` | **Characteristic speed**: the wind speed actually used in the calculation. |

In the lab the user may also type `Vk` directly ("what if the wind here is 20 m/s?"). To convert: `1 m/s = 3.6 km/h`.

### 5.2 The S2 factor

```
S2 = bm · Fr · (z / 10)^p
```

`z` is the height above ground in metres; `bm` and `p` depend on the terrain category; `Fr` is the gust factor. For small structures (largest dimension up to 20 m, called **Class A** in the standard, 3-second gust) the parameters are:

| Category | Terrain | `bm` | `p` | `Fr` |
|----------|---------|------|-----|------|
| I | Very smooth and large: open sea, lakes | 1.10 | 0.06 | 1.00 |
| II | Open flat land with few obstacles: fields, airports | 1.00 | 0.085 | 1.00 |
| III | Flat land with low obstacles: farms with hedges, low sparse houses | 0.94 | 0.10 | 1.00 |
| IV | Many close obstacles: suburbs, small towns, industrial areas | 0.86 | 0.12 | 1.00 |
| V | Many tall close obstacles: big city centres | 0.74 | 0.15 | 1.00 |

(The standard calls the first parameter `b`; we write `bm` to avoid confusion with the brick width `b`.)

**Minimum height.** The standard's table does not go below `z = 5 m` (10 m for category V): S2 is taken as constant below that. Our stacks are far shorter, so the engine always uses the minimum height. This is why wind pressure is **uniform** over the height of the stack.

The engine implements Class A only, because every MVP structure is much smaller than 20 m.

### 5.3 Dynamic pressure

```
q = 0.613 · Vk²        (q in N/m², Vk in m/s)
```

Where it comes from: moving air has kinetic energy. Bernoulli's principle gives the pressure of air brought to rest as `q = ½ · ρair · V²`. With the standard air density `ρair = 1.226 kg/m³`, half of that is 0.613.

Notice the **square**: twice the wind speed means four times the pressure.

### 5.4 Force on the structure

```
F = Ca · q · Ae
```

| Symbol | Meaning |
|--------|---------|
| `Ca` | **Drag coefficient**: depends on the shape. The standard gives it in charts for rectangular prisms as a function of their proportions. |
| `Ae` | **Effective frontal area**: the area the wind "sees" — here `b × height`. |

For the part of the stack above joint `i`: `Fi = Ca · q · b · Hi`.

**About `Ca`.** It is an explicit input of the engine. The lab uses `Ca = 1.2` as a default, a typical order of magnitude for a short rectangular prism. It was *not* read from the standard's chart for each specific stack proportion — see limits (section 13).

> **Edition note.** NBR 6123 was revised in 2023. The formulas and the Class A parameters above were checked against the 1988 edition as reproduced in university course material (see references). The 2023 text was not available for checking and may differ in details. This is acceptable for an educational lab but must be reviewed before claiming conformity with the current standard.

## 6. Earthquake (pseudo-static method, NBR 15421)

### 6.1 The idea

In an earthquake the ground accelerates sideways. The structure "wants to stay where it is" (inertia), so relative to the ground it feels a sideways force. By Newton's second law (`F = m · a`):

```
F = m · a = (W / g) · a = kh · W        with   kh = a / g
```

`kh` is the **horizontal seismic coefficient**: the ground acceleration as a fraction of gravity. With `kh = 0.2` the structure is pushed sideways by 20 % of its own weight. The force acts at the centre of mass.

This is the **pseudo-static** (or *equivalent static*) method: the earthquake is replaced by a constant horizontal force. It is the simplest classical method in earthquake engineering and the starting point of the equivalent-lateral-force procedures in design standards.

For the part above joint `i`: `Fi = kh · Wi`, acting at `Hi / 2` above the joint.

### 6.2 How strong? Brazilian seismic zones

**ABNT NBR 15421 — Projeto de estruturas resistentes a sismos** divides Brazil into zones by characteristic horizontal ground acceleration `ag` (on rock):

| Zone | `ag` | Preset used by the lab (`kh`) |
|------|------|-------------------------------|
| 0 | 0.025 g | 0.025 |
| 1 | 0.025 g to 0.05 g | 0.05 |
| 2 | 0.05 g to 0.10 g | 0.10 |
| 3 | 0.10 g to 0.15 g | 0.15 |
| 4 | 0.15 g | 0.15 |

Most of Brazil is in zone 0; the highest zones are in the far west (Acre). The lab also lets the user type any value, because strong earthquakes elsewhere in the world reach much higher accelerations.

The lab uses `kh = ag / g` directly, with **no** soil amplification, importance factor or response-reduction factor from the standard (see section 12).

## 7. Demand: what the event asks of each joint

At joint `i`, with wind pressure `pw = Ca · q` and seismic coefficient `kh` (normally only one of them is non-zero):

```
normal force:   Ni = Wi                         (weight above, pressing the joint)

shear force:    Vi = pw · b · Hi  +  kh · Wi    (sideways push above the joint)

moment:         Mi = Vi · Hi / 2                (the push acts at mid-height)
```

Both loads act at mid-height of the part above the joint: wind because the pressure is uniform, the seismic force because the centre of mass is at mid-height.

## 8. Capacity: what each joint can resist

A joint can fail in two families of ways: **sliding** (the top part moves sideways) and **tipping** (the top part rotates about its edge).

### 8.1 Sliding

```
sliding resistance:   R = μ · N + c · A

safety factor:        SFslide = R / V
```

- `μ · N` is **Coulomb friction** (classical mechanics): the heavier the load on the joint, the harder it is to slide.
- `c · A` is the **cohesion** of mortar: the shear strength of the bond even with no weight on it.
- Together this is the **Mohr–Coulomb** criterion. The Brazilian masonry standard **ABNT NBR 16868-1** (Table 15) has exactly this shape: `fvk = c + 0.5 · σ`, so for mortared joints `μ = 0.5` and `c` depends on the mortar strength (section 11).

### 8.2 Tipping, step 1: when does the joint start to open?

The moment `M` presses one edge of the joint harder and relieves the other. For a rectangular joint, strength of materials (combined compression and bending) gives the stress at the relieved edge:

```
stress at the relieved edge = N / A − M / Z        with   Z = b · d² / 6   (section modulus)
```

As long as this is positive the whole joint is in compression. When the moment grows, the relieved edge goes into **tension** (it is being pulled apart). The joint starts to open when the tension exceeds the bond strength `ft`:

```
cracking moment:   Mcr = (ft + N / A) · Z

safety factor:     SFcrack = Mcr / M
```

- **Dry joint** (`ft = 0`): `Mcr = N · d / 6`. This is the famous **middle-third rule**: the joint stays fully closed while the resultant force stays within the middle third of the depth. Passing this point is **not** a failure — the joint just starts to open on one side (the stack "rocks").
- **Mortared joint**: `ft` comes from NBR 16868-1, Table 14 (flexural tensile strength normal to the bed joint). Passing `Mcr` breaks the bond.

### 8.3 Tipping, step 2: overturning

Once a joint is open, the part above can only be held by its own weight, rotating about its edge (the "toe"). The weight acts at the centre, `d / 2` from the edge:

```
overturning moment capacity:   Mot = N · d / 2

safety factor:                 SFoverturn = Mot / M
```

This is the equilibrium of a rigid block (statics).

### 8.4 Putting tipping together

The joint finally fails by tipping when the moment exceeds **both** capacities:

```
tipping capacity:   Mu = max(Mcr, Mot)          SFtip = Mu / M
```

| Situation | What happens as the load grows |
|-----------|-------------------------------|
| `Mcr < Mot` (always true for dry joints, since `N·d/6 < N·d/2`) | The joint opens first (rocking, still standing), then overturns at `Mot`. **Failure mode: overturning.** |
| `Mcr > Mot` (typical for mortared joints) | The bond holds beyond the point where weight alone would have failed. When it finally breaks there is nothing left to hold the stack, and it falls at once. **Failure mode: bond rupture** (sudden, brittle). |

The engine also reports the **state** of each joint:

- `intact` — `M ≤ Mcr`: joint fully bonded/closed;
- `open` — `Mcr < M ≤ Mot`: joint cracked or partly open, but still stable (only possible when `Mcr < Mot`);
- `failed` — sliding or tipping capacity exceeded.

## 9. Verdict, load factor and critical intensity

For each joint: `SF = min(SFslide, SFtip)`. For the whole stack:

```
load factor  λ = smallest SF over all joints
```

- `λ ≥ 1` → **the stack stands**. `λ < 1` → **it fails**, at the joint and in the mode that gave the smallest value.
- If sliding and tipping tie, the engine reports sliding. If two joints tie, it reports the lower one.

**Why "load factor"?** All demands (`V`, `M`) are proportional to the load, and capacities do not depend on it. So `λ` is exactly the number by which the load could be multiplied to reach failure. This gives the **critical intensity** directly:

```
earthquake:  kh,critical = λ · kh              (force is proportional to kh)

wind:        Vk,critical = Vk · √λ             (force is proportional to Vk², hence the square root)
```

## 10. Three things the formulas teach us

For a **dry** stack (no mortar, `t = 0`) the formulas simplify beautifully. With `H` the height above the joint:

**1. Earthquake sliding does not depend on size or weight.**

```
SFslide = μ · W / (kh · W) = μ / kh     →  slides when  kh > μ
```

**2. Earthquake overturning depends only on the shape (slenderness).**

```
SFoverturn = (W · d/2) / (kh · W · H/2) = d / (kh · H)     →  tips when  kh > d / H
```

A stack ten times heavier but with the same proportions tips at the same acceleration. And since `d / H` is smallest for the whole stack, **the base joint is always the critical one**. (This is the classical condition for a rigid block to start rocking, studied by Housner in 1963.)

**3. Under wind, sliding does not depend on height, but overturning gets worse as the stack grows.**

```
SFslide    = μ · ρ · g · d / (Ca · q)             (no H: height cancels out)

SFoverturn = ρ · g · d² / (Ca · q · H)            (H in the denominator: taller is worse)
```

Heavier material (`ρ`) and deeper bricks (`d`) help against wind — depth helps overturning *twice* (it appears squared).

## 11. Material values used

These are **presets**: reasonable values so the lab works out of the box. All of them are explicit inputs that the user can change.

| Property | Preset | Source and confidence |
|----------|--------|-----------------------|
| Solid clay brick size | 190 × 90 × 57 mm | Common Brazilian solid brick size. |
| Solid clay brick density `ρ` | 1800 kg/m³ | Typical value for solid clay brick masonry (18 kN/m³), in line with the unit weights of ABNT NBR 6120. *To be confirmed against the standard's table.* |
| Mortar density `ρm` | 1900 kg/m³ | Typical for cement-lime-sand mortar (19 kN/m³), in line with ABNT NBR 6120. *To be confirmed against the standard's table.* |
| Mortar joint thickness `t` | 10 mm | Usual bed-joint thickness in Brazilian masonry. |
| Dry brick-on-brick friction `μ` | 0.6 | Typical of masonry literature (dry joints are usually reported around 0.6 to 0.75). Varies with surface and moisture. Measurable at home with a tilt test: `μ = tan(angle at which it starts sliding)`. |
| Mortared joint friction `μ` | 0.5 | ABNT NBR 16868-1:2020, Table 15 (the `0.5 · σ` term). |
| Mortared joint cohesion `c` | see table below | ABNT NBR 16868-1:2020, Table 15. |
| Mortared joint tensile bond `ft` | see table below | ABNT NBR 16868-1:2020, Table 14 (tension normal to the bed joint). |
| Drag coefficient `Ca` | 1.2 | Order-of-magnitude default; see section 13. |

Mortar classes (by mortar compressive strength):

| Preset name | Mortar compressive strength | `c` (MPa) | `ft` (MPa) |
|-------------|-----------------------------|-----------|------------|
| `weak` | 1.5 to 3.4 MPa | 0.10 | 0.10 |
| `medium` | 3.5 to 7.0 MPa | 0.15 | 0.20 |
| `strong` | above 7.0 MPa | 0.35 | 0.25 |

Two notes on these mortar values:

- They are **characteristic** values: deliberately low estimates (about 95 % of real joints are stronger). We use them **without** the design safety coefficients of the standard (which would divide them by 2.0), because the lab asks "what would probably happen?", not "is this safe enough to build?".
- The standard states these tables for walls with filled vertical joints and caps the shear strength at high compression; the caps are never reached in small stacks.

## 12. Simplifications and why we made them

| # | Simplification | Why | Effect |
|---|----------------|-----|--------|
| S1 | **Quasi-static analysis.** The event is a steady sideways push; nothing moves through time. | Every result can be checked by hand; this is how hand calculations in standards work. | We know *whether* and *how* it fails, not the motion of the collapse. |
| S2 | **Bricks are rigid and infinitely strong in compression.** | Stresses in a small stack are tiny compared with brick strength. | Overturning pivots exactly on the edge; slightly optimistic for very heavy or tall structures. |
| S3 | **Two-dimensional.** Load acts along one horizontal axis, perpendicular to a face. | Keeps formulas simple; the user can test each direction separately. | Diagonal wind and twisting are not modelled. |
| S4 | **Uniform wind pressure over the height.** | The standard itself takes S2 constant below 5 m. | Exact within the standard's model for structures under 5 m. |
| S5 | **Steady wind.** Gusts are included only through the 3-second gust speed. | Dynamic wind effects matter for tall flexible structures, not small stiff ones. | No vortex shedding or resonance. |
| S6 | **One drag coefficient for the whole stack**, also used for each upper part. | Avoids reading charts for every proportion. | Forces may be off by tens of percent for unusual proportions. |
| S7 | **Earthquake = constant horizontal force `kh · W`.** No vertical acceleration, no duration, no frequency content. | Simplest classical method; gives closed-form results. | Conservative for tipping: real ground shaking reverses direction, so a block that starts rocking often does not have time to fall. |
| S8 | **`kh = ag / g` with no amplification or reduction factors.** | Those factors are meant for designing buildings, not for a rigid block on the ground. | Results are "peak ground acceleration" thresholds, not design checks. |
| S9 | **Mohr–Coulomb joints with characteristic strengths, no safety coefficients.** | Best simple description of a joint; we want the likely outcome, not a design margin. | Real joints vary a lot (workmanship, curing, moisture). |
| S10 | **Perfect geometry.** Bricks are perfectly aligned, the base is level. | No data on imperfections. | Real stacks lean and are weaker. |
| S11 | **Failure plane at the brick–mortar interface; mortar bed under the first brick adds no height.** | Bond is normally the weakest part of a joint. | Negligible. |

## 13. Limits: what the model does NOT represent well

Be sceptical of results in these situations:

1. **The collapse itself.** The model says that it fails, where and in which mode. It does not say where the bricks land. Any animation is an illustration.
2. **Real earthquakes.** Tipping under real shaking depends on duration and frequency; the pseudo-static threshold says when rocking *starts*, which is earlier than actual toppling (Housner, 1963). Small objects and short pulses are especially over-penalised. Sliding thresholds are more realistic.
3. **Very small or very slender objects in wind.** A real gust is not uniform at brick scale, and `Ca` changes with proportions and with the ground nearby. Treat critical wind speeds as order-of-magnitude estimates (±20 % or more).
4. **Wind speeds near the ground.** The standard is written for buildings; using its minimum height for a 0.5 m stack overestimates the wind a ground-level object really feels (wind is slower very close to the ground).
5. **Mortar that is not fully cured, is badly applied or is wet.** Bond strength can be far below (or above) the characteristic values.
6. **Tall or heavily loaded masonry.** Crushing of the compressed edge and buckling are ignored.
7. **Anything that is not a single column.** Walls gain strength from interlocking bricks and lose it through bending as a plate; houses depend on roofs and connections. Those need their own models.
8. **Foundations and soil.** The base is rigid and level.
9. **Combined events.** The engine can add wind and earthquake forces together, but real standards combine events with specific rules; this is not modelled.

**Structure Lab is an educational tool. It must never be used to design, approve or assess a real structure.**

## 14. Worked examples (calculated by hand)

These examples are the reference cases for the engine's automated tests. Common data: solid brick laid flat, load along the 90 mm side.

```
b = 0.19 m    d = 0.09 m    h = 0.057 m    ρ = 1800 kg/m³    g = 9.81 m/s²
A = b · d = 0.0171 m²
```

### Example A — dry stack, wind

10 bricks, no mortar, `μ = 0.6` at all joints, `Vk = 20 m/s` (72 km/h), `Ca = 1.2`.

```
Wind      q  = 0.613 · 20² = 245.2 Pa
          pw = Ca · q = 1.2 · 245.2 = 294.24 Pa

Base joint (i = 0):
          H  = 10 · 0.057 = 0.57 m
          W  = 9.81 · 0.0171 · 1800 · 0.57 = 172.11 N        (about 17.5 kg)
          V  = 294.24 · 0.19 · 0.57 = 31.87 N
          M  = 31.87 · 0.57 / 2 = 9.082 N·m

Sliding   R  = 0.6 · 172.11 = 103.27 N        SFslide    = 103.27 / 31.87 = 3.241
Opening   Mcr = 172.11 · 0.09 / 6 = 2.582 N·m  SFcrack    = 2.582 / 9.082 = 0.284
Overturn  Mot = 172.11 · 0.09 / 2 = 7.745 N·m  SFoverturn = 7.745 / 9.082 = 0.853
```

**Result: fails by overturning at the base joint.** `λ = 0.853`.

Critical wind speed: `20 · √0.853 = 18.47 m/s` (66.5 km/h).

Other joints, for checking: joint 1 has `SFoverturn = 0.948` (also failing); joint 2 has `1.066` (open but stable); `SFslide = 3.241` at every joint (section 10, point 3).

### Example B — dry stack, earthquake

Same stack, `kh = 0.15` (zone 3/4 preset).

```
Base joint:   V = 0.15 · 172.11 = 25.82 N        M = 25.82 · 0.285 = 7.358 N·m

Sliding    SFslide    = 0.6 / 0.15 = 4.000
Overturn   SFoverturn = 7.745 / 7.358 = 1.0526     ( = d / (kh · H) = 0.09 / (0.15 · 0.57) )
```

**Result: stands** (`λ = 1.0526`), but the base joint is `open` (`SFcrack = 0.351`): the stack is rocking on its edge.

Critical acceleration: `kh = 1.0526 · 0.15 = 0.1579 = d / H`. With `kh = 0.20`: `SFoverturn = 0.7895` → **fails by overturning at the base**.

### Example C — mortared stack, wind

10 bricks, `weak` mortar (`μ = 0.5`, `c = ft = 0.10 MPa`) at all joints including the base, joint thickness 10 mm, `ρm = 1900 kg/m³`, `Vk = 40 m/s` (144 km/h), `Ca = 1.2`.

```
Wind      q  = 0.613 · 40² = 980.8 Pa         pw = 1.2 · 980.8 = 1176.96 Pa

Base joint:
          H  = 10 · 0.057 + 9 · 0.010 = 0.66 m
          W  = 9.81 · 0.0171 · (1800 · 0.57 + 1900 · 0.09) = 9.81 · 0.0171 · 1197 = 200.80 N
          V  = 1176.96 · 0.19 · 0.66 = 147.59 N
          M  = 147.59 · 0.33 = 48.705 N·m

Sliding   R   = 0.5 · 200.80 + 100000 · 0.0171 = 100.40 + 1710 = 1810.40 N
          SFslide = 1810.40 / 147.59 = 12.27

Bond      Z   = 0.19 · 0.09² / 6 = 0.0002565 m³
          N/A = 200.80 / 0.0171 = 11 743 Pa
          Mcr = (100000 + 11743) · 0.0002565 = 28.662 N·m       SFcrack = 28.662 / 48.705 = 0.5885

Overturn  Mot = 200.80 · 0.045 = 9.036 N·m                      SFoverturn = 0.1855

Tipping   Mu  = max(28.662, 9.036) = 28.662 N·m                 SFtip = 0.5885
```

**Result: fails by bond rupture at the base joint.** `λ = 0.5885`. Critical wind speed: `40 · √0.5885 = 30.69 m/s` (110 km/h).

Compare with Example A: mortar raised the critical wind speed from about 66 km/h to about 110 km/h — and changed the kind of failure from a gradual rocking-then-overturning to a sudden break. Notice also where the strength comes from: the bond contributes `100000 Pa`, the weight only `11743 Pa`.

### Example D — mortared stack, earthquake

Same stack as C, `kh = 0.5` (a very strong earthquake).

```
Base joint:   V = 0.5 · 200.80 = 100.40 N        M = 100.40 · 0.33 = 33.132 N·m

SFslide = 1810.40 / 100.40 = 18.03        SFtip = 28.662 / 33.132 = 0.8651
```

**Result: fails by bond rupture at the base.** Critical `kh = 0.8651 · 0.5 = 0.4325`. (Joint 1 has `SFtip = 1.060`: it holds.)

### Example E — mortared stack simply resting on the ground, wind

Same stack as C, but the base joint is **dry** (`μ = 0.6`, `c = ft = 0`), `Vk = 20 m/s`.

```
Base joint:   V = 294.24 · 0.19 · 0.66 = 36.90 N      M = 36.90 · 0.33 = 12.176 N·m
              SFslide = 0.6 · 200.80 / 36.90 = 3.265
              SFoverturn = 9.036 / 12.176 = 0.7421

Joint 1:      SFtip = 28.356 / 9.830 = 2.885          (mortar holds easily)
```

**Result: fails by overturning at the base** (`λ = 0.7421`): the stack tips over **in one piece**. Gluing the bricks together does not help if the whole column is not anchored — it is now a taller, more slender rigid block than in Example A.

### Example F — S2 factor and characteristic speed

`V0 = 30 m/s`, flat ground (`S1 = 1`), category III, ordinary building (`S3 = 1`), structure lower than 5 m:

```
S2 = 0.94 · 1.00 · (5 / 10)^0.10 = 0.94 · 0.93303 = 0.8771
Vk = 30 · 1 · 0.8771 · 1 = 26.31 m/s
q  = 0.613 · 26.31² = 424.4 Pa
```

Check against the standard's own table (Class A, z ≤ 5 m): I 1.06, II 0.94, III 0.88, IV 0.79, V 0.74. The formula gives 1.055, 0.943, 0.877, 0.791, 0.740.

## 15. References

**Standards**

- ABNT NBR 6123:1988 (with errata) — *Forças devidas ao vento em edificações*. Formulas `Vk = V0·S1·S2·S3`, `q = 0.613·Vk²`, `F = Ca·q·Ae`, the S2 expression and parameter table. Revised in 2023 (not checked, see section 5).
- ABNT NBR 15421 (2006, revised 2023) — *Projeto de estruturas resistentes a sismos — Procedimento*. Seismic zones and `ag`; `g = 9.81 m/s²`.
- ABNT NBR 16868-1:2020 — *Alvenaria estrutural — Parte 1: Projeto*. Table 14 (flexural tensile strength) and Table 15 (shear strength of bed joints).
- ABNT NBR 6120 — *Ações para o cálculo de estruturas de edificações*. Unit weights of materials.

**Where the values were checked** (the standards themselves are paid documents)

- Bastos, P. S. *Alvenaria Estrutural* (course notes, UNESP Bauru) — reproduces NBR 16868-1 Tables 13, 14 and 15.
- Wahrhaftig, A. M. *Ação do vento em estruturas esbeltas com efeito geométrico* (Blucher, open access) — reproduces the NBR 6123 S2 parameters, S2 table and the dynamic pressure formula.
- University of São Paulo course material on wind actions (e-Disciplinas) — NBR 6123 parameter table and classes.
- Pereira et al., paper on the seismic assessment of a church in Sobral (Frattura ed Integrità Strutturale, no. 45) — NBR 15421 zone accelerations.

**Textbook theory**

- Coulomb friction, Mohr–Coulomb criterion, combined axial force and bending (`σ = N/A ± M/Z`), rigid-body equilibrium: any introductory statics and strength-of-materials textbook (for example Beer & Johnston, *Mechanics of Materials*; Hibbeler, *Statics*).
- Housner, G. W. (1963). "The behavior of inverted pendulum structures during earthquakes." *Bulletin of the Seismological Society of America*, 53(2), 403–417. Rocking and overturning of rigid blocks.
