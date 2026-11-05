# Architecture — Universe Resume

## 1. High-Level Overview

```
                        ┌─────────────────────────────┐
                        │         Client (React)       │
                        │  ┌───────────────────────┐   │
                        │  │  Dashboard / Editor UI │   │
                        │  └───────────┬───────────┘   │
                        │              │                │
                        │  ┌───────────▼───────────┐   │
                        │  │  3D Universe Renderer  │   │
                        │  │ (React Three Fiber)   │   │
                        │  └───────────────────────┘   │
                        └───────────────┬───────────────┘
                                        │ REST (HTTPS/JSON)
                                        ▼
                        ┌─────────────────────────────┐
                        │      Express API Server      │
                        │  /auth  /resumes  /skills     │
                        │  /projects  /experience        │
                        │  /public/:slug  /analytics      │
                        └───────────────┬───────────────┘
                                        │
                     ┌──────────────────┼───────────────────┐
                     ▼                                      ▼
            ┌─────────────────┐                   ┌───────────────────┐
            │  MongoDB Atlas   │                   │ Cloudinary / S3     │
            │ (Users, Resumes, │                   │ (avatars, project    │
            │ Skills, Projects,│                   │  images, media)      │
            │ Experience, ...) │                   └───────────────────┘
            └─────────────────┘
```

## 2. Frontend Architecture

### Two main application modes

1. **Builder Mode** (authenticated) — traditional CRUD UI (forms, lists, drag-and-drop ordering) for editing resume data, with a live 3D preview panel.
2. **Viewer Mode** (public, unauthenticated) — full-screen 3D universe experience for recruiters, loaded from a public slug/username, read-only.

### Key Frontend Modules

- **`scenes/`** — pure 3D components:
  - `GalaxyBackground` — instanced star field, ambient particles.
  - `SkillStar` / `ConstellationGroup` — renders a skill as a star; groups by category.
  - `ProjectPlanet` — renders a project as an orbiting planet with optional "moons" for sub-media.
  - `TimelinePath` — spline connecting experience waypoints; supports "auto-fly" mode.
  - `CameraController` — wraps OrbitControls (desktop) / guided-tour controller (mobile).
- **`components/`** — 2D/HTML overlay UI:
  - `DetailPanel` — slide-in panel shown when a planet/star/waypoint is selected.
  - `ResumeForm` (Profile/Skill/Project/Experience sub-forms).
  - `ThemeSelector` — palette/galaxy-shape picker.
  - `ShareLinkBar`, `ExportPdfButton`, `AnalyticsWidget`.
- **`store/`** (Zustand) — `useResumeStore` (current resume data being edited/viewed), `useSceneStore` (selected node, camera target, tour state), `useAuthStore`.
- **`api/`** — typed Axios wrappers per resource (`authApi`, `resumeApi`, `skillApi`, `projectApi`, `experienceApi`, `analyticsApi`).

### Rendering Strategy

- All 3D rendering is **client-side only**. The backend never touches Three.js.
- Public viewer pages are served as a normal SPA route, but crawlers/social-preview bots hit a **lightweight SSR/pre-render shim** (small Express/Puppeteer job) that returns static meta tags + a snapshot OG image, so links shared on LinkedIn/Slack/etc. preview correctly.
- A **"Lite Mode" toggle** disables heavy postprocessing (bloom, shadows) and reduces particle counts for low-end devices; auto-detected via a simple WebGL capability/perf check on load.

## 3. Backend Architecture

### Layers

- **Routes** → **Controllers** → **Services** → **Models (Mongoose)**.
- Routes are grouped by resource: `authRoutes`, `resumeRoutes`, `skillRoutes`, `projectRoutes`, `experienceRoutes`, `publicRoutes`, `analyticsRoutes`.
- **Middleware:**
  - `authenticate` — verifies JWT, attaches `req.user`.
  - `authorizeOwner` — ensures a user can only edit their own resume/skills/projects/experience.
  - `validateBody(schema)` — Zod/Joi schema validation per route.
  - `rateLimiter` — applied especially to `/public/*` and `/analytics/*` routes (unauthenticated, high traffic potential).

### Public vs Private Split

- **Private API** (`/api/resumes`, `/api/skills`, etc.) — requires JWT, used by Builder Mode.
- **Public API** (`/api/public/:slug`) — no auth required, returns a read-only, sanitized JSON payload (no emails, no internal IDs beyond what's needed) for Viewer Mode. This keeps public data intentionally minimal and safe to expose.

## 4. Data Flow Example — Loading a Public Universe

1. Recruiter opens `universe.app/u/johndoe`.
2. React app mounts, calls `GET /api/public/johndoe`.
3. Express looks up the `Resume` by `slug`, populates `skills`, `projects`, `experience` (via Mongoose `.populate()` or embedded sub-documents), strips any private fields, returns JSON.
4. Frontend feeds this JSON into `useResumeStore`.
5. `scenes/` components read from the store and procedurally generate positions:
   - Skills → clustered by category into constellations.
   - Projects → placed at orbit radii based on order/date.
   - Experience → ordered chronologically into timeline waypoints.
6. An `AnalyticsEvent` (`view`) is fired to `POST /api/analytics` on load; further events (`click_planet`, `click_star`, `tour_completed`) fire on interaction.

## 5. Deployment Topology

```
[ Browser ] ──HTTPS── [ Vercel/Netlify: React build ]
                                │
                                ▼
                     [ Render/Railway: Express API ]
                        │                │
                        ▼                ▼
              [ MongoDB Atlas ]   [ Cloudinary/S3 ]
```

- Frontend and backend deployed independently; CORS configured on Express to allow the frontend's domain.
- Environment variables (Mongo URI, JWT secret, Cloudinary keys) injected via each host's secret manager — never committed to source.

## 6. Key Architectural Decisions

| Decision | Rationale |
|---|---|
| 3D rendering is 100% client-side | Keeps backend simple/stateless; server never needs a GPU or headless-rendering pipeline (except for the small OG-image snapshot job). |
| Public API is a separate, minimal surface from the private CRUD API | Reduces risk of leaking private fields and simplifies caching/rate-limiting of high-traffic public reads. |
| MongoDB over a relational DB | Resume data is naturally hierarchical/document-shaped (one resume → many skills/projects/experience entries) with flexible, evolving fields (new galaxy themes, new metadata) — a good fit for a flexible schema. |
| Zustand over Redux | Scene/camera state changes very frequently (every frame in some cases); a lightweight store avoids unnecessary boilerplate and re-render overhead. |
| Always ship a non-3D fallback | Accessibility, ATS compatibility, and low-end device support are core requirements, not optional extras. |
