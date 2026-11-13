# Structure Lab — Documentation

Documentation comes first in this project: nothing is coded before it is described here.

| # | Document | What it answers |
|---|----------|-----------------|
| 1 | [Vision and audience](01-vision.md) | What are we building, for whom, and why? |
| 2 | [Requirements](02-requirements.md) | What must the product do (functional) and how well (non-functional)? |
| 3 | [MVP scope and roadmap](03-mvp-scope.md) | What is in the first version, and what is deliberately left for later? |
| 4 | [Architecture](04-architecture.md) | How is the code organised, and why these technologies? |
| 5 | [Physics model](05-physics-model.md) | Which phenomena, formulas, sources, simplifications and limits? |

Conventions used in all documents:

- **SI units everywhere**: metres (m), kilograms (kg), seconds (s), newtons (N), pascals (Pa = N/m²).
- Requirement identifiers (`FR-01`, `NFR-01`) are stable: they are never renumbered, only added or marked as removed.
- "The engine" always means the simulation core (pure calculation). "The app" means the 3D website that uses it.
