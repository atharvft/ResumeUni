# Data Models — Universe Resume

All models use **Mongoose** schemas on **MongoDB**. IDs are Mongo `ObjectId`s unless noted. Timestamps (`createdAt`/`updatedAt`) are enabled on every schema via `{ timestamps: true }`.

---

## User

```js
{
  _id: ObjectId,
  name: String,               // required
  email: String,               // required, unique
  passwordHash: String,         // required (bcrypt), omitted from any API response
  authProvider: String,         // "local" | "google" | "github"
  avatarUrl: String,
  createdAt: Date,
  updatedAt: Date
}
```

## Resume ("Universe")

One per user (1:1), holds theme/config and top-level profile info. Skills/Projects/Experience are separate collections referenced by `resumeId` (allows independent ordering/CRUD without rewriting the whole document).

```js
{
  _id: ObjectId,
  userId: ObjectId,             // ref: User, required, unique
  slug: String,                  // required, unique — public URL segment, e.g. "johndoe"
  title: String,                  // e.g. "John Doe — Frontend Engineer"
  bio: String,
  socialLinks: {
    github: String,
    linkedin: String,
    website: String,
    twitter: String
  },
  theme: {
    palette: String,             // "nebula" | "aurora" | "solar" | "mono"
    galaxyShape: String,          // "spiral" | "cluster" | "ring"
    particleDensity: String        // "low" | "medium" | "high" (perf control)
  },
  isPublished: Boolean,           // default false — controls public visibility
  viewCount: Number,               // denormalized counter, updated on view events
  createdAt: Date,
  updatedAt: Date
}
```

## Skill ("Star")

```js
{
  _id: ObjectId,
  resumeId: ObjectId,            // ref: Resume, required
  name: String,                   // required, e.g. "React"
  category: String,                // e.g. "Frontend", "Backend", "DevOps", "Design"
  proficiency: Number,              // 0–100, maps to star size/brightness
  yearsUsed: Number,
  order: Number,                     // for stable rendering/list ordering
  createdAt: Date,
  updatedAt: Date
}
```

## Project ("Planet")

```js
{
  _id: ObjectId,
  resumeId: ObjectId,            // ref: Resume, required
  title: String,                   // required
  description: String,
  techStack: [String],              // e.g. ["React", "Node.js", "MongoDB"]
  links: {
    repo: String,
    live: String
  },
  media: [                            // "moons" — screenshots/video
    {
      url: String,
      type: String,                     // "image" | "video"
      caption: String
    }
  ],
  impactScore: Number,               // 0–100, maps to planet size
  startDate: Date,
  endDate: Date,                       // null/omitted if ongoing
  order: Number,
  createdAt: Date,
  updatedAt: Date
}
```

## Experience ("Timeline Waypoint")

```js
{
  _id: ObjectId,
  resumeId: ObjectId,            // ref: Resume, required
  company: String,                 // required
  role: String,                     // required
  startDate: Date,                   // required
  endDate: Date,                       // null if current role
  description: String,
  achievements: [String],
  location: String,
  order: Number,                       // chronological order for path generation
  createdAt: Date,
  updatedAt: Date
}
```

## Education (optional secondary path)

```js
{
  _id: ObjectId,
  resumeId: ObjectId,            // ref: Resume, required
  institution: String,             // required
  degree: String,
  fieldOfStudy: String,
  startDate: Date,
  endDate: Date,
  description: String,
  order: Number,
  createdAt: Date,
  updatedAt: Date
}
```

## AnalyticsEvent

```js
{
  _id: ObjectId,
  resumeId: ObjectId,            // ref: Resume, required
  eventType: String,                // "view" | "click_planet" | "click_star" | "click_waypoint" | "tour_started" | "tour_completed" | "pdf_downloaded"
  targetId: ObjectId,                 // ID of the Skill/Project/Experience clicked, if applicable
  sessionId: String,                    // anonymous session identifier (no PII)
  metadata: Object,                       // free-form, e.g. { device: "mobile", durationMs: 4210 }
  createdAt: Date
}
```

---

## Relationships Diagram

```
User (1) ──── (1) Resume
                   │
       ┌───────────┼────────────┬───────────────┐
       ▼           ▼            ▼               ▼
   Skill (N)   Project (N)  Experience (N)  Education (N)
                   │
                   ▼
             AnalyticsEvent (N)  ── (also linked from Resume directly for "view" events)
```

## Indexing Notes

- `Resume.slug` — unique index (used for public lookups; must be fast and collision-free).
- `Resume.userId` — unique index (enforces 1:1 with User).
- `Skill.resumeId`, `Project.resumeId`, `Experience.resumeId`, `Education.resumeId` — indexed for fast lookup when assembling a public universe payload.
- `AnalyticsEvent.resumeId` + `createdAt` — compound index for time-ranged analytics queries.

## Validation Notes

- All user-facing text fields (`bio`, `description`, `achievements`, etc.) should be sanitized server-side (e.g., strip/escape HTML) before storage, since this content is rendered publicly and could otherwise be an XSS vector.
- `slug` should be validated against a safe pattern (e.g., `^[a-z0-9-]{3,30}$`) and checked against a reserved-words list (`admin`, `api`, `login`, etc.) before allowing a user to claim it.
