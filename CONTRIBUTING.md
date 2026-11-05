# Contributing — Universe Resume

## Local Setup

### Prerequisites
- Node.js 18+ and npm
- A MongoDB instance (local `mongod` or a free MongoDB Atlas cluster)
- (Optional) Cloudinary or AWS S3 account for media uploads

### Steps

```bash
git clone <repo-url>
cd universe-resume

# Backend
cd server
npm install
npm install --save-dev nodemon   # auto-restarts the server on file changes
cp .env.example .env   # fill in values below
npm run dev             # runs nodemon, starts Express on :5000 with auto-reload

# Frontend (new terminal)
cd ../client
npm install
npm run dev              # starts Vite dev server on :5173
```

### Required Environment Variables (`server/.env`)

```
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_ACCESS_SECRET=change-me
JWT_REFRESH_SECRET=change-me-too
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
CLIENT_ORIGIN=http://localhost:5173
```

## Backend `package.json` Scripts (reference)

```json
{
  "scripts": {
    "dev": "node --watch src/server.js",
    "build": "node --check src/server.js",
    "start": "node src/server.js",
    "test": "jest"
  },
  "devDependencies": {
    "nodemon": "^3.1.0"
  }
}
```

- `npm run dev` — **local development only**. nodemon watches `src/` and restarts the server on every save.
- `npm run start` — **production**. Runs the compiled build directly with plain `node`; nodemon is not installed/used here.
- CI (GitHub Actions) runs `npm run build` then `npm test` — nodemon plays no role in the pipeline itself, it's purely a dev-loop convenience.

A minimal `nodemon.json` (optional, if you want more control than the CLI flags above):

```json
{
  "watch": ["src"],
  "ext": "ts,js,json",
  "ignore": ["src/**/*.test.js"],
  "exec": "node src/server.js"
}
```

## Branching Model

- `main` — always deployable.
- `feature/<short-name>` — one branch per feature/fix, branched from `main`.
- Open a PR into `main`; at least one review before merge (or self-review checklist if solo).
- Squash-merge preferred to keep history clean.

## Commit Convention

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(scene): add orbit animation to project planets
fix(auth): correct refresh token expiry check
docs(readme): update quick start instructions
chore(deps): bump react-three-fiber to latest
```

## Coding Conventions

- **JavaScript preferred** for both client and server.
- **ESLint + Prettier** — run `npm run lint` and `npm run format` before committing.
- **3D components** live under `client/src/scenes/` and should stay presentation-only — they read from Zustand stores, they don't fetch data directly.
- **API calls** always go through the `client/src/api/` wrapper layer, never raw `fetch`/`axios` calls scattered in components.
- **Validation schemas** (Zod) should be shared/mirrored between client forms and server routes where possible to avoid drift.

## Testing Expectations

- New API routes should include at least a happy-path integration test (Supertest).
- New reusable UI components should include a basic render test (React Testing Library).
- Critical flows (signup → build → publish → view public link) should be covered by a Playwright E2E test before major releases.

## Performance Guidelines for 3D Work

- Prefer **instanced meshes** for repeated objects (stars, small decorative elements) over individual meshes per object.
- Keep heavy postprocessing (bloom, SSAO) behind the theme/"Lite Mode" setting — never on unconditionally.
- Profile with the browser's performance tab and `r3f-perf` (or similar) before merging any new scene feature.

## Reporting Issues

Use the issue tracker with:
- **Bug reports:** steps to reproduce, expected vs actual behavior, browser/device info.
- **Feature requests:** problem being solved, not just the solution — link back to `PRD.md` scope if relevant.
