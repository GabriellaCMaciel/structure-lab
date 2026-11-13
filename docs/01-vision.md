# 1. Vision and Audience

## 1.1 Vision

**Structure Lab is a 3D physics and structural engineering lab in the browser.** A curious person builds or picks a structure, exposes it to a natural event (wind, storm, earthquake) and sees what happens to it — and, more importantly, **why**.

What makes it different from a game with nice destruction animations: the outcome is decided by **real engineering calculations** (the same kind of checks an engineer does by hand, based on published standards and textbooks), and the lab shows those numbers and explains them.

> One-sentence pitch: *"Will it stand? Find out with real engineering, not just a pretty animation."*

## 1.2 The problem

- Physics sandboxes are fun but usually tuned to *look* right, not to *be* right. You cannot trust the result or learn the reasoning behind it.
- Real structural engineering software is correct but expensive, complex and made for professionals.
- There is very little in between: something trustworthy **and** approachable.

## 1.3 Audience

**Primary: curious people** — teenagers and adults with no engineering training who wonder things like "why does mortar matter?", "how strong must wind be to knock down a wall?" or "why do some houses survive earthquakes?".

| Persona | Who | What they want |
|---------|-----|----------------|
| The curious visitor | Arrives from a link or video, no background | Press a button, see a result, understand it in one sentence |
| The student | High school / technical course / first-year engineering | See the formula behind the result and check it by hand |
| The teacher | Science, physics or robotics teacher | A reliable demo to use in class, with honest explanations |

**Not the audience:** professional engineers designing real structures. Structure Lab is educational and must say so clearly (see NFR-04).

## 1.4 Product principles

1. **Correct before pretty.** If the physics and the animation disagree, the physics wins.
2. **Explain everything.** Every result can be traced to a formula, and every formula to a source.
3. **Honest about limits.** The lab states its simplifications and what the model does *not* represent.
4. **Simple first.** Start with the simplest experiment that is fully correct, then grow.
5. **Engine independent of visuals.** The calculation core can be tested, trusted and reused without any 3D code.

## 1.5 Example experiments (long-term)

- A stack of bricks with and without mortar.
- A free-standing brick wall.
- A wooden house versus a brick house.
- Events: wind, storm (wind plus rain effects), earthquake.

Only the first one is in the MVP — see [MVP scope](03-mvp-scope.md).

## 1.6 What success looks like

- A visitor can run an experiment and correctly explain *why* the structure failed or survived.
- A student can reproduce any number shown by the lab with pen, paper and the [physics model document](05-physics-model.md).
- Every engine result is covered by an automated test against a hand calculation.
