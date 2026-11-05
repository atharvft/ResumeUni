# Product Requirements Document (PRD)
## Project: Universe Resume

**Version:** 0.1 (Draft)
**Owner:** [Your Name]
**Last Updated:** July 25, 2026

---

## 1. Summary

Universe Resume turns a traditional resume into an interactive 3D space you can fly through. Instead of a static PDF, recruiters and visitors navigate a personal "universe" where:

- **The Resume = A Galaxy** — the overall 3D scene, unique per user.
- **Projects = Planets** — each project is a clickable planet with its own size, color, and moons (sub-features/screenshots).
- **Skills = Stars** — a star field or constellation where brightness/size maps to proficiency, and clustering maps to skill category (e.g., "Frontend constellation," "DevOps constellation").
- **Experience = A Timeline Through Space** — a flight path or "warp route" connecting eras of the user's career, with each stop representing a job/role.

The product is a MERN (MongoDB, Express, React, Node.js) web application with a public "resume builder" (for the user) and a public "viewer" (for recruiters), plus a 3D rendering layer (Three.js / React Three Fiber) on top of React.

---

## 2. Problem Statement

Resumes are flat, boring, and hard to differentiate. Recruiters skim hundreds of nearly identical PDFs in seconds. Candidates — especially in creative, frontend, game-dev, or 3D/graphics-adjacent roles — need a way to:

1. Stand out visually and memorably.
2. Show technical range (3D, animation, UX) through the resume itself, not just describe it.
3. Give recruiters an experience that's fast to skim but also rewards deeper exploration.

## 3. Goals & Non-Goals

### Goals
- Let a user create one "universe" (resume) with structured data (profile, projects, skills, experience, education).
- Render that data as an interactive, navigable 3D scene in the browser.
- Make the experience usable on both desktop (full 3D flight/orbit controls) and mobile (simplified/guided mode).
- Allow sharing via a public link (e.g., `universe.app/u/yourname`).
- Allow exporting a traditional PDF/text resume as a fallback for ATS systems.
- Keep load time and performance reasonable on mid-range hardware.

### Non-Goals (v1)
- Not building a full ATS (Applicant Tracking System) or job board.
- Not supporting multiplayer/real-time collaboration on the same universe.
- Not supporting VR headsets in v1 (keep the door open for later).
- Not building a full CMS/blog platform — content is resume-scoped only.

## 4. Target Users

| User | Description | Primary Need |
|---|---|---|
| Candidate (Builder) | Person creating their resume/universe | Easy way to input resume data and customize the 3D presentation |
| Recruiter/Viewer | Person viewing a shared universe link | Fast way to understand the candidate's skills/experience, with delight/memorability as a bonus |
| Admin (optional, later) | Platform operator | Manage users, moderate content, monitor usage |

## 5. Core User Stories

1. **As a candidate**, I want to sign up and fill in my profile, skills, projects, and experience through a normal form-based UI, so I don't have to hand-code 3D scenes.
2. **As a candidate**, I want to preview my universe in real time as I edit data, so I can see how it looks before sharing it.
3. **As a candidate**, I want to pick a theme/color palette and galaxy shape (spiral, cluster, ring) for personalization.
4. **As a candidate**, I want a shareable public URL for my universe that works without the recruiter needing an account.
5. **As a candidate**, I want a "download as PDF" fallback in case the recruiter's system needs a plain document.
6. **As a recruiter**, I want to fly/orbit through the universe using mouse/touch/keyboard controls.
7. **As a recruiter**, I want to click a planet (project) and see details: description, tech stack, links, images/video.
8. **As a recruiter**, I want to click a star (skill) and see proficiency level and related projects.
9. **As a recruiter**, I want to follow the timeline path and see role, company, dates, and achievements at each stop.
10. **As a recruiter on mobile**, I want a simplified guided tour instead of free-fly controls, since full 3D navigation is hard on touchscreens.
11. **As a candidate**, I want basic analytics (views, time spent, which planets were clicked) to know what recruiters engage with.

## 6. Feature Scope (v1 / MVP)

### Must-Have (MVP)
- Auth (signup/login) for candidates.
- Resume data CRUD: profile, skills, projects, experience, education.
- 3D scene rendering:
  - Galaxy background (stars/particles).
  - Skills rendered as stars, grouped/clustered by category.
  - Projects rendered as planets with basic orbit animation.
  - Experience rendered as a connected path/timeline with waypoints.
- Camera controls: orbit (desktop), simplified tap-to-travel (mobile).
- Click/tap interactions opening detail panels (HTML overlay, not 3D popups, for readability).
- Public shareable link per user (`/u/:username` or `/resume/:slug`).
- Responsive fallback: a clean traditional resume view/PDF export for non-3D contexts (ATS, screen readers, low-end devices).
- Basic theming (2–3 preset palettes/galaxy shapes).

### Should-Have (Fast Follow)
- View analytics dashboard for candidate.
- Custom domain / vanity URL.
- Drag-and-drop reordering of projects/timeline.
- Image/video upload for project "moons" (screenshots, demo clips).
- SEO-friendly meta tags + Open Graph preview image (static render) for link sharing.

### Could-Have (Later)
- AI-assisted content generation (turn a LinkedIn export or plain text into structured resume data).
- VR/WebXR support.
- Multiple universe "themes" marketplace.
- Public gallery/discovery page of universes (opt-in).

### Won't-Have (v1)
- Real-time multi-user presence in the same universe.
- Native mobile apps (web-responsive only for v1).
- Payment/subscription system (unless product decides to monetize later).

## 7. Functional Requirements

| ID | Requirement |
|---|---|
| FR-1 | Users can register/login via email+password (and optionally OAuth, e.g., Google/GitHub). |
| FR-2 | Users can create/edit/delete profile info: name, title, bio, avatar, social links. |
| FR-3 | Users can create/edit/delete skills with: name, category, proficiency (0–100), years used. |
| FR-4 | Users can create/edit/delete projects with: title, description, tech stack, links (repo/live demo), images, dates. |
| FR-5 | Users can create/edit/delete experience entries with: company, role, start/end date, description, achievements. |
| FR-6 | System renders a unique 3D universe scene from a user's structured data. |
| FR-7 | System supports orbit/pan/zoom camera controls (desktop) and touch gestures (mobile). |
| FR-8 | Clicking/tapping a planet, star, or timeline node opens a detail overlay with full information. |
| FR-9 | Users get a public shareable URL that renders their universe without requiring login. |
| FR-10 | Users can generate/download a traditional PDF resume from the same underlying data. |
| FR-11 | System tracks basic view analytics (page views, session duration, click events) per universe. |
| FR-12 | System provides a non-3D, accessible/text-based fallback view of the resume. |

## 8. Non-Functional Requirements

- **Performance:** First meaningful render of the 3D scene under ~3s on a mid-range laptop with a solid connection; degrade gracefully (reduce particle count, disable heavy postprocessing) on lower-end devices.
- **Responsiveness:** Fully usable on desktop, tablet, and mobile viewports.
- **Accessibility:** Provide a non-3D, screen-reader-friendly HTML version of the resume content (WCAG-conscious fallback), since a pure 3D scene is not accessible by default.
- **Scalability:** Backend should support many concurrent public universe views without needing per-view server-side 3D rendering (all 3D rendering happens client-side).
- **Security:** Auth tokens (JWT) properly secured; input validation/sanitization on all resume content fields (XSS prevention since content is user-generated and publicly viewable).
- **SEO:** Public universe pages should have server-rendered or pre-rendered meta tags (title, description, OG image) even though the 3D body is client-rendered.
- **Browser support:** Modern evergreen browsers (Chrome, Edge, Firefox, Safari) with WebGL support; graceful "your browser doesn't support 3D, here's the standard resume" fallback otherwise.

## 9. Tech Stack (MERN + 3D layer)

See `TECH_STACK.md` for full details. High-level:

- **Frontend:** React, React Three Fiber (Three.js wrapper), Drei (helpers), Zustand or Redux for state, Tailwind CSS for UI overlays, React Router.
- **Backend:** Node.js + Express, JWT auth, Multer/Cloud storage for image uploads.
- **Database:** MongoDB + Mongoose (schemas for User, Resume, Project, Skill, Experience).
- **Hosting:** Frontend on Vercel/Netlify, backend on Render/Railway/EC2, DB on MongoDB Atlas, media on S3/Cloudinary.

## 10. Data Model (Summary)

See `DATA_MODELS.md` for full schema definitions. Core entities:

- `User` — auth + basic profile.
- `Resume` (aka "Universe") — one per user, holds theme/config and references to Skills/Projects/Experience.
- `Skill` — name, category, proficiency, order.
- `Project` — title, description, techStack[], links, media[], order.
- `Experience` — company, role, dates, description, achievements[], order.
- `AnalyticsEvent` — resumeId, eventType, metadata, timestamp.

## 11. API Overview

See `API_SPEC.md` for full endpoint list. Core resource groups: `/api/auth`, `/api/resumes`, `/api/skills`, `/api/projects`, `/api/experience`, `/api/analytics`, `/api/public/:slug`.

## 12. Success Metrics

- **Activation:** % of signed-up users who complete a "minimum viable universe" (profile + ≥1 skill + ≥1 project + ≥1 experience entry).
- **Sharing:** % of users who copy/share their public link at least once.
- **Engagement (recruiter side):** average session duration and % of visitors who interact with at least one planet/star/timeline node.
- **Retention:** % of candidates who return to update their universe within 30/60/90 days.
- **Conversion (if monetized later):** % of free users upgrading to a paid theme/feature tier.

## 13. Risks & Open Questions

| Risk/Question | Notes |
|---|---|
| 3D performance on low-end/mobile devices | Need aggressive LOD (level of detail) and a "lite mode" toggle. |
| Accessibility of a 3D-first experience | Must ship a solid non-3D fallback from day one, not as an afterthought. |
| Recruiters may not want to "fly through space" under time pressure | Provide a quick "auto-tour" mode and a one-click "show me the plain resume" toggle. |
| SEO/link previews for a client-rendered 3D app | Needs server-side rendering or pre-generated OG images per user. |
| Content moderation for public universes | Even resumes can contain inappropriate content/links; need basic reporting/moderation path. |

## 14. Milestones

See `ROADMAP.md` for the phased build plan (Phase 0 → Phase 4).
