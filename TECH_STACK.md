# Tech Stack — Universe Resume

## Overview

Universe Resume is built on the **MERN** stack (MongoDB, Express, React, Node.js), with an added **3D rendering layer** for the "galaxy" experience. All 3D work happens client-side in the browser — the backend only ever deals with structured JSON data, never with rendering.

---

## Frontend

| Layer | Choice | Why |
|---|---|---|
| Framework | **React** (Vite) | Fast dev server, component model fits both UI forms and 3D scene composition. |
| 3D rendering | **Three.js** via **React Three Fiber (R3F)** | Lets 3D scenes be built declaratively as React components instead of imperative Three.js code. |
| 3D helpers | **@react-three/drei** | Ready-made helpers: OrbitControls, Stars, Text, Html overlays, Environment, LOD helpers. |
| Post-processing (optional) | **@react-three/postprocessing** | Bloom/glow effects for stars and planet atmospheres — used sparingly for performance. |
| Physics/animation | **@react-spring/three** or **Framer Motion** (for HTML overlays) | Smooth camera transitions, planet hover states, UI panel animations. |
| State management | **Zustand** | Lightweight, avoids Redux boilerplate; good fit for scene state (camera target, selected node, theme). |
| Routing | **React Router v6** | Client-side routes: `/dashboard`, `/edit`, `/u/:username` (public viewer). |
| Styling | **Tailwind CSS** | Fast iteration for overlay UI (forms, detail panels, nav); keeps 3D canvas full-bleed. |
| Forms | **React Hook Form** + **Zod** | Validated resume-editing forms (skills, projects, experience). |
| HTTP client | **Axios** (or fetch + a thin wrapper) | API calls to Express backend. |
| PDF export | **@react-pdf/renderer** or server-side **Puppeteer** render | Generates the ATS-friendly fallback resume. |

## Backend

| Layer | Choice | Why |
|---|---|---|
| Runtime | **Node.js** (LTS) | Matches MERN, shared JS/TS with frontend. |
| Framework | **Express.js** | Simple, well-understood REST API framework. |
| Language | **JavaScript** | One language across the React frontend and Express.js backend. |
| Auth | **JWT** (access + refresh tokens), **bcrypt** for password hashing | Standard, stateless auth suitable for a public-viewer + private-editor split. |
| OAuth (optional) | **Passport.js** (Google/GitHub strategies) | Faster signup for developer-audience users. |
| Validation | **Zod** or **Joi** on the server, mirroring client-side validation | Prevent bad/malicious data since resumes are publicly rendered. |
| File uploads | **Multer** (handling) + **Cloudinary** or **AWS S3** (storage) | Project screenshots/avatars; keep binary data out of MongoDB. |
| Rate limiting / security | **express-rate-limit**, **helmet**, **cors** | Protect public endpoints (especially public universe view + analytics ingestion) from abuse. |
| Analytics ingestion | Lightweight custom Express route + MongoDB collection | No need for a heavy analytics platform at MVP scale. |
| Dev process manager | **nodemon** | Auto-restarts the Express server on file changes during local development (`npm run dev`). Not used in production — production runs `node dist/server.js` directly, or under a process manager like **PM2**/the host's own process supervisor. |

## Database

| Layer | Choice | Why |
|---|---|---|
| Database | **MongoDB** (Atlas for hosting) | Natural fit for nested/flexible resume documents (skills/projects/experience as sub-documents or referenced collections). |
| ODM | **Mongoose** | Schema definitions, validation, middleware (e.g., slug generation on save). |
| Caching (optional, later) | **Redis** | Cache public universe reads if traffic grows; cache PDF renders. |

## 3D/Visual Design Details

- **Galaxy background:** Instanced point cloud (via `drei`'s `<Stars />` or custom `InstancedMesh`) for performance — thousands of stars rendered in one draw call.
- **Skill stars:** Positioned via a clustering algorithm (e.g., simple force-directed layout or predefined category coordinates) so skills of the same category visually group into "constellations."
- **Project planets:** Each a sphere mesh with a procedural or texture-based material; size mapped from a "complexity/impact" field; orbit animation via simple angular velocity per frame.
- **Timeline path:** A `CatmullRomCurve3` (Three.js spline) connecting waypoints chronologically; camera can optionally auto-fly along this curve ("guided tour" mode).
- **Camera:** `OrbitControls` (desktop) for free-fly/orbit; a simplified "tap next waypoint" auto-camera-move mode for mobile/guided tours.
- **Detail panels:** Rendered as HTML overlays (via `drei`'s `<Html>` or a plain absolutely-positioned React component) rather than 3D text meshes, for readability and accessibility.

## Hosting & DevOps

| Concern | Choice |
|---|---|
| Frontend hosting | **Vercel** or **Netlify** (static build + CDN) |
| Backend hosting | **Render**, **Railway**, or **AWS EC2/Elastic Beanstalk** |
| Database hosting | **MongoDB Atlas** |
| Media storage | **Cloudinary** (simplest, has built-in image transforms) or **AWS S3 + CloudFront** |
| CI/CD | **GitHub Actions** — lint/test/build on PR, deploy on merge to `main`. (Note: **nodemon** is a local dev tool only — it watches/restarts the server while coding, it isn't part of the CI/CD pipeline itself. CI runs `npm run build && npm test`; production starts the server with `node dist/server.js`, not `nodemon`.) |
| Monitoring | **Sentry** (frontend + backend error tracking), basic uptime monitor (e.g., UptimeRobot) |
| Environment config | `.env` files locally, secrets manager (Vercel/Render env vars) in production |

## Accessibility & SEO Layer

- Server-side rendered (or pre-rendered/static) **meta tags + OG image** per public universe page (can use a small Express route that serves an SSR shell for crawlers, or a pre-generation job that snapshots a canvas image).
- Parallel **plain-HTML resume view** at `/u/:username/plain` for screen readers, ATS parsers, and low-end devices/browsers without WebGL.

## Testing

| Layer | Tooling |
|---|---|
| Frontend unit/component | **Vitest** + **React Testing Library** |
| 3D scene smoke tests | Manual/visual QA + basic "does it render without throwing" tests |
| Backend unit/integration | **Jest** or **Vitest** + **Supertest** |
| E2E | **Playwright** (cover: sign up → build resume → view public link → PDF export) |

## Suggested Repository Structure

```
universe-resume/
├── client/                 # React + R3F frontend
│   ├── src/
│   │   ├── scenes/         # 3D scene components (Galaxy, Planet, Star, TimelinePath)
│   │   ├── components/     # UI overlays (forms, panels, nav)
│   │   ├── pages/          # Route-level pages (Dashboard, Editor, PublicViewer)
│   │   ├── store/          # Zustand stores
│   │   ├── api/            # Axios client wrappers
│   │   └── styles/
│   └── vite.config.js
├── server/                  # Express backend
│   ├── src/
│   │   ├── models/          # Mongoose schemas
│   │   ├── routes/          # /auth, /resumes, /skills, /projects, /experience, /public
│   │   ├── controllers/
│   │   ├── middleware/      # auth, validation, rate-limit
│   │   └── utils/
│   └── server.js
└── docs/                     # This documentation set
```
