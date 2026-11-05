# API Specification — Universe Resume

Base URL (dev): `http://localhost:5000/api`
All private routes require header: `Authorization: Bearer <accessToken>`

---

## Auth

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/auth/register` | Create a new user account | No |
| POST | `/auth/login` | Login, returns access + refresh tokens | No |
| POST | `/auth/refresh` | Exchange refresh token for new access token | No |
| POST | `/auth/logout` | Invalidate refresh token | Yes |
| GET | `/auth/me` | Get current authenticated user | Yes |

**POST `/auth/register`**
```json
// Request
{ "name": "John Doe", "email": "john@example.com", "password": "••••••••" }
// Response 201
{ "user": { "id": "...", "name": "John Doe", "email": "john@example.com" }, "accessToken": "...", "refreshToken": "..." }
```

---

## Resumes (Builder — private)

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/resumes/me` | Get the current user's resume/universe | Yes |
| POST | `/resumes` | Create a resume (usually auto-created on signup) | Yes |
| PATCH | `/resumes/:id` | Update profile/theme/publish status | Yes (owner) |
| DELETE | `/resumes/:id` | Delete a resume and all child data | Yes (owner) |
| POST | `/resumes/:id/publish` | Toggle `isPublished` true | Yes (owner) |
| GET | `/resumes/check-slug/:slug` | Check slug availability | Yes |

**PATCH `/resumes/:id`**
```json
// Request (partial update)
{
  "title": "John Doe — Frontend Engineer",
  "bio": "I build delightful interfaces...",
  "theme": { "palette": "nebula", "galaxyShape": "spiral", "particleDensity": "medium" }
}
```

---

## Skills

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/resumes/:resumeId/skills` | List skills for a resume | Yes (owner) |
| POST | `/resumes/:resumeId/skills` | Add a skill | Yes (owner) |
| PATCH | `/skills/:id` | Update a skill | Yes (owner) |
| DELETE | `/skills/:id` | Delete a skill | Yes (owner) |
| PATCH | `/resumes/:resumeId/skills/reorder` | Bulk-update `order` values | Yes (owner) |

**POST `/resumes/:resumeId/skills`**
```json
{ "name": "React", "category": "Frontend", "proficiency": 90, "yearsUsed": 4 }
```

---

## Projects

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/resumes/:resumeId/projects` | List projects for a resume | Yes (owner) |
| POST | `/resumes/:resumeId/projects` | Add a project | Yes (owner) |
| PATCH | `/projects/:id` | Update a project | Yes (owner) |
| DELETE | `/projects/:id` | Delete a project | Yes (owner) |
| POST | `/projects/:id/media` | Upload project image/video (multipart) | Yes (owner) |
| PATCH | `/resumes/:resumeId/projects/reorder` | Bulk-update `order` values | Yes (owner) |

**POST `/resumes/:resumeId/projects`**
```json
{
  "title": "Universe Resume",
  "description": "A 3D interactive resume builder.",
  "techStack": ["React", "Three.js", "Node.js", "MongoDB"],
  "links": { "repo": "https://github.com/...", "live": "https://universe.app/u/johndoe" },
  "impactScore": 80,
  "startDate": "2026-01-01"
}
```

---

## Experience

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/resumes/:resumeId/experience` | List experience entries | Yes (owner) |
| POST | `/resumes/:resumeId/experience` | Add an experience entry | Yes (owner) |
| PATCH | `/experience/:id` | Update an entry | Yes (owner) |
| DELETE | `/experience/:id` | Delete an entry | Yes (owner) |
| PATCH | `/resumes/:resumeId/experience/reorder` | Bulk-update `order` values | Yes (owner) |

---

## Education

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/resumes/:resumeId/education` | List education entries | Yes (owner) |
| POST | `/resumes/:resumeId/education` | Add an entry | Yes (owner) |
| PATCH | `/education/:id` | Update an entry | Yes (owner) |
| DELETE | `/education/:id` | Delete an entry | Yes (owner) |

---

## Public (Viewer — no auth)

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/public/:slug` | Get full public universe payload (profile + skills + projects + experience + education, sanitized) | No |
| GET | `/public/:slug/plain` | Get the same data shaped for the plain-HTML/accessible fallback view | No |
| GET | `/public/:slug/pdf` | Generate and stream a PDF export | No |
| GET | `/public/:slug/og-image` | Return a pre-rendered social preview image | No |

**GET `/public/:slug`** — Response 200
```json
{
  "title": "John Doe — Frontend Engineer",
  "bio": "...",
  "theme": { "palette": "nebula", "galaxyShape": "spiral", "particleDensity": "medium" },
  "socialLinks": { "github": "...", "linkedin": "..." },
  "skills": [ { "name": "React", "category": "Frontend", "proficiency": 90 } ],
  "projects": [ { "title": "...", "description": "...", "techStack": [...], "links": {...}, "media": [...] } ],
  "experience": [ { "company": "...", "role": "...", "startDate": "...", "endDate": "...", "achievements": [...] } ],
  "education": [ { "institution": "...", "degree": "..." } ]
}
```
*(Note: private fields like `userId`, `email`, internal `_id`s beyond what's needed for click-tracking are stripped from this response.)*

---

## Analytics

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/analytics/:resumeId/event` | Log a view/click/tour event | No (rate-limited) |
| GET | `/resumes/:resumeId/analytics/summary` | Get aggregated analytics for the owner's dashboard | Yes (owner) |

**POST `/analytics/:resumeId/event`**
```json
{ "eventType": "click_planet", "targetId": "...", "sessionId": "anon-abc123", "metadata": { "device": "mobile" } }
```

---

## Standard Error Shape

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Slug must be 3-30 lowercase letters, numbers, or hyphens.",
    "details": [ { "field": "slug", "issue": "invalid_pattern" } ]
  }
}
```

## Status Codes Used

- `200` OK / `201` Created / `204` No Content
- `400` Validation error
- `401` Unauthorized (missing/invalid token)
- `403` Forbidden (not the resource owner)
- `404` Not found (e.g., unknown slug)
- `409` Conflict (e.g., slug already taken)
- `429` Too Many Requests (rate limit, mainly on public/analytics routes)
- `500` Internal server error
