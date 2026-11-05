# 🌌 Universe Resume

> Instead of a PDF... your resume is a galaxy. Projects are planets. Skills are stars. Experience is a timeline through space. Recruiters literally fly through your career.

## What is this?

Universe Resume turns structured resume data into an interactive, navigable 3D scene:

- **Galaxy** = your whole resume/universe
- **Planets** = your projects
- **Stars** = your skills (grouped into constellations by category)
- **Flight path / warp route** = your career timeline

Built as a MERN application with a Three.js/React Three Fiber rendering layer.

## Docs in this project

| File | Purpose |
|---|---|
| [`PRD.md`](./PRD.md) | Product Requirements Document — problem, goals, scope, requirements, metrics |
| [`TECH_STACK.md`](./TECH_STACK.md) | Full technology choices and rationale for frontend, backend, 3D, DB, hosting |
| [`ARCHITECTURE.md`](./ARCHITECTURE.md) | System architecture, component breakdown, data flow diagrams |
| [`DATA_MODELS.md`](./DATA_MODELS.md) | MongoDB/Mongoose schema definitions for all entities |
| [`API_SPEC.md`](./API_SPEC.md) | REST API endpoint reference |
| [`ROADMAP.md`](./ROADMAP.md) | Phased build plan from MVP to post-launch features |
| [`CONTRIBUTING.md`](./CONTRIBUTING.md) | Setup instructions, branching model, coding conventions |

## Quick Start (once code exists)

```bash
# clone
git clone <repo-url>
cd universe-resume

# install
cd server && npm install
cd ../client && npm install

# env
cp server/.env.example server/.env
# fill in MONGODB_URI, JWT_SECRET, CLOUDINARY_* etc.

# run (two terminals)
cd server && npm run dev
cd client && npm run dev
```

## Core Concept Mapping

| Resume Element | Universe Representation |
|---|---|
| Profile | Home/starting viewpoint, "sun" or central hub |
| Skills | Stars, clustered into constellations by category (Frontend, Backend, DevOps, etc.), brightness/size = proficiency |
| Projects | Planets orbiting the hub, size = complexity/impact, moons = sub-features or screenshots |
| Experience | A connected path ("warp route") of waypoints through the scene, one per role |
| Education | Smaller waypoints or a secondary path branch |

## Status

📋 Planning / documentation phase — see `ROADMAP.md` for current milestone.

## License

TBD.
