# Roadmap — Universe Resume

## Phase 0 — Foundation (Week 1–2)
- Repo setup (client + server), CI pipeline, lint/format config.
- Auth: register/login/JWT + refresh flow.
- Base Mongoose models: `User`, `Resume`, `Skill`, `Project`, `Experience`, `Education`.
- Basic Express CRUD routes for all resources (no 3D yet).
- Basic React app shell: routing, auth-protected dashboard route.

**Exit criteria:** A user can sign up, log in, and CRUD their resume data through plain forms (no 3D).

## Phase 1 — MVP Universe Renderer (Week 3–5)
- Integrate React Three Fiber + Drei into the client.
- Build `GalaxyBackground`, `SkillStar`/`ConstellationGroup`, `ProjectPlanet`, `TimelinePath` components using **static/mock data** first.
- Build `CameraController` with OrbitControls (desktop only for now).
- Wire real resume data from the API into the 3D scene.
- Build `DetailPanel` overlay for clicking planets/stars/waypoints.

**Exit criteria:** A logged-in user can view their own data rendered as a navigable 3D scene.

## Phase 2 — Public Sharing & Fallbacks (Week 6–7)
- Public `/api/public/:slug` endpoint + public viewer route (no auth).
- Slug claiming + validation + publish/unpublish toggle.
- Plain-HTML accessible fallback view (`/u/:slug/plain`).
- PDF export (server-side render via Puppeteer or `@react-pdf/renderer`).
- Basic SEO/OG meta tag handling for public pages.

**Exit criteria:** A user can publish their universe and share a public link that works for both recruiters (3D) and ATS/accessibility needs (plain view/PDF).

## Phase 3 — Mobile, Performance, Polish (Week 8–9)
- Mobile touch controls + "guided tour" auto-camera mode.
- "Lite Mode" (reduced particle density/postprocessing) with auto-detection for low-end devices.
- Theme picker (palette + galaxy shape presets).
- Loading states, error boundaries, empty-state UX for new users.
- Basic analytics event logging (`view`, `click_planet`, `click_star`, `click_waypoint`).

**Exit criteria:** The app is usable and performant across desktop and mobile, with a polished first-run experience.

## Phase 4 — Analytics Dashboard & Growth Features (Week 10+)
- Candidate-facing analytics dashboard (views, engagement, most-clicked planet/star).
- Drag-and-drop reordering for skills/projects/experience.
- Image/video upload for project "moons."
- Custom domain / vanity URL support.
- (Stretch) AI-assisted import: paste LinkedIn export or plain text → auto-populate resume fields.

**Exit criteria:** Candidates have a reason to return to the product beyond initial setup (analytics, growth loop).

## Post-Launch / Backlog Ideas
- Public gallery/discovery page of opt-in universes.
- WebXR/VR support for immersive viewing.
- Multiple simultaneous "universes" per user (e.g., one per target role/industry).
- Team/company pages (a shared galaxy for a whole team).
- Paid tier: premium themes, custom domains, advanced analytics.

## Milestone Tracking Template

| Phase | Target Date | Status | Notes |
|---|---|---|---|
| Phase 0 | | Not started | |
| Phase 1 | | Not started | |
| Phase 2 | | Not started | |
| Phase 3 | | Not started | |
| Phase 4 | | Not started | |
