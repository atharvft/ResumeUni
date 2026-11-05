import "dotenv/config";
import bcrypt from "bcryptjs";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import jwt from "jsonwebtoken";
import PDFDocument from "pdfkit";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import { Readable } from "node:stream";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { analyticsEvents, createResume, refreshSessions, resumes, users } from "./store.js";
import { connectDatabase } from "./db.js";
import { hydrateStore, persistRefreshSession, persistResume, persistUser, removeRefreshSession } from "./persistence.js";
import { scanResumeFile } from "./resumeScanner.js";
const app = express();
const port = Number(process.env.PORT ?? 5000);
const jwtSecret = process.env.JWT_ACCESS_SECRET ?? "development-secret";
const refreshSecret = process.env.JWT_REFRESH_SECRET ?? "development-refresh-secret";
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173", credentials: true }));
app.use(express.json({ limit: "200kb" }));
cloudinary.config({ cloud_name: process.env.CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_API_KEY, api_secret: process.env.CLOUDINARY_API_SECRET, secure: true });
const mediaUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
const resumeUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
const credentials = z.object({ name: z.string().trim().min(2).max(80).optional(), email: z.string().trim().email().transform((v) => v.toLowerCase()), password: z.string().min(8).max(128) });
const tokenFor = (userId) => jwt.sign({ sub: userId }, jwtSecret, { expiresIn: "1h" });
const refreshTokenFor = (userId) => { const token = jwt.sign({ sub: userId }, refreshSecret, { expiresIn: "30d" }); refreshSessions.set(token, userId); persistRefreshSession(token, userId).catch((error) => console.error("refresh session persistence failed", error)); return token; };
const authenticate = (req, res, next) => {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer "))
        return res.status(401).json({ error: { code: "UNAUTHORIZED", message: "A bearer token is required." } });
    try {
        req.userId = String(jwt.verify(header.slice(7), jwtSecret).sub);
        next();
    }
    catch {
        return res.status(401).json({ error: { code: "UNAUTHORIZED", message: "The access token is invalid or expired." } });
    }
};
const publicResume = (resume) => ({ ...resume, userId: undefined, isPublished: undefined, viewCount: undefined });
const publishedResume = (slug) => [...resumes.values()].find((candidate) => candidate.slug === slug && candidate.isPublished);
const slugSchema = z.string().regex(/^[a-z0-9-]{3,30}$/, "Slug must be 3-30 lowercase letters, numbers, or hyphens.");
const analyticsEventSchema = z.object({ eventType: z.enum(["view", "click_planet", "click_star", "click_waypoint", "tour_started", "tour_completed", "pdf_downloaded"]), targetId: z.string().max(100).optional(), sessionId: z.string().max(100).optional(), metadata: z.record(z.unknown()).optional() });
const resourceSchemas = {
    skills: z.object({ name: z.string().trim().min(1).max(80), category: z.string().trim().min(1).max(60), proficiency: z.number().min(0).max(100), yearsUsed: z.number().min(0).max(80).optional() }),
    projects: z.object({ title: z.string().trim().min(1).max(120), description: z.string().max(2000).default(""), techStack: z.array(z.string().max(50)).max(30).default([]), links: z.record(z.string().url()).default({}), impactScore: z.number().min(0).max(100).default(50) }),
    experience: z.object({ company: z.string().trim().min(1).max(120), role: z.string().trim().min(1).max(120), startDate: z.string().min(4), endDate: z.string().optional(), description: z.string().max(2000).default(""), achievements: z.array(z.string().max(500)).max(30).default([]), location: z.string().max(120).optional() }),
    education: z.object({ institution: z.string().trim().min(1).max(160), degree: z.string().max(120).default(""), fieldOfStudy: z.string().max(120).optional(), startDate: z.string().optional(), endDate: z.string().optional(), description: z.string().max(1000).optional() })
};
const resourceCollection = (resume, key) => resume[key];
const resourceOwner = (req, resumeId) => { const resume = resumes.get(resumeId); return resume && resume.userId === req.userId ? resume : undefined; };
app.get("/api/health", (_req, res) => res.json({ status: "ok", service: "universe-resume-api" }));
app.post("/api/auth/register", async (req, res) => {
    const parsed = credentials.safeParse(req.body);
    if (!parsed.success || !parsed.data.name)
        return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Name, email, and an 8-character password are required." } });
    if ([...users.values()].some((user) => user.email === parsed.data.email))
        return res.status(409).json({ error: { code: "EMAIL_TAKEN", message: "An account with this email already exists." } });
    const user = { id: randomUUID(), name: parsed.data.name, email: parsed.data.email, passwordHash: await bcrypt.hash(parsed.data.password, 12) };
    users.set(user.id, user);
    const slug = user.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 30) || `user-${user.id.slice(0, 6)}`;
    const resume = createResume(user.id, user.name, slug);
    persistUser(user).catch((error) => console.error("user persistence failed", error));
    persistResume(resume).catch((error) => console.error("resume persistence failed", error));
    res.status(201).json({ user: { id: user.id, name: user.name, email: user.email }, resume, accessToken: tokenFor(user.id), refreshToken: refreshTokenFor(user.id) });
});
app.post("/api/auth/login", async (req, res) => {
    const parsed = credentials.pick({ email: true, password: true }).safeParse(req.body);
    const user = parsed.success ? [...users.values()].find((candidate) => candidate.email === parsed.data.email) : undefined;
    if (!user || !(await bcrypt.compare(parsed.success ? parsed.data.password : "", user.passwordHash)))
        return res.status(401).json({ error: { code: "INVALID_CREDENTIALS", message: "Email or password is incorrect." } });
    res.json({ user: { id: user.id, name: user.name, email: user.email }, accessToken: tokenFor(user.id), refreshToken: refreshTokenFor(user.id) });
});
app.post("/api/auth/refresh", (req, res) => {
    const token = typeof req.body?.refreshToken === "string" ? req.body.refreshToken : "";
    try {
        const payload = jwt.verify(token, refreshSecret);
        const userId = refreshSessions.get(token);
        if (!userId || userId !== String(payload.sub))
            throw new Error("Invalid session");
        refreshSessions.delete(token);
        removeRefreshSession(token).catch(() => undefined);
        res.json({ accessToken: tokenFor(userId), refreshToken: refreshTokenFor(userId) });
    }
    catch {
        res.status(401).json({ error: { code: "UNAUTHORIZED", message: "The refresh token is invalid or expired." } });
    }
});
app.post("/api/auth/logout", authenticate, (req, res) => {
    const token = typeof req.body?.refreshToken === "string" ? req.body.refreshToken : "";
    if (token) {
        refreshSessions.delete(token);
        removeRefreshSession(token).catch(() => undefined);
    }
    res.status(204).send();
});
app.get("/api/auth/me", authenticate, (req, res) => {
    const user = users.get(req.userId);
    if (!user)
        return res.status(404).json({ error: { code: "NOT_FOUND", message: "User not found." } });
    res.json({ id: user.id, name: user.name, email: user.email });
});
app.get("/api/resumes/me", authenticate, (req, res) => res.json([...resumes.values()].find((resume) => resume.userId === req.userId) ?? null));
app.get("/api/resumes/check-slug/:slug", authenticate, (req, res) => {
    const slug = String(req.params.slug);
    const valid = slugSchema.safeParse(slug).success;
    res.json({ slug, valid, available: valid && ![...resumes.values()].some((resume) => resume.slug === slug), message: valid ? undefined : "Use 3-30 lowercase letters, numbers, or hyphens." });
});
app.patch("/api/resumes/:id", authenticate, (req, res) => {
    const resume = resumes.get(String(req.params.id));
    if (!resume)
        return res.status(404).json({ error: { code: "NOT_FOUND", message: "Resume not found." } });
    if (resume.userId !== req.userId)
        return res.status(403).json({ error: { code: "FORBIDDEN", message: "You do not own this resume." } });
    const allowed = z.object({ title: z.string().max(140).optional(), bio: z.string().max(2000).optional(), socialLinks: z.record(z.string().url()).optional(), theme: z.object({ palette: z.enum(["nebula", "aurora", "solar", "mono"]), galaxyShape: z.enum(["spiral", "cluster", "ring"]), particleDensity: z.enum(["low", "medium", "high"]) }).optional() }).safeParse(req.body);
    if (!allowed.success)
        return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Resume fields are invalid." } });
    Object.assign(resume, allowed.data);
    persistResume(resume).catch((error) => console.error("resume persistence failed", error));
    res.json(resume);
});
const domainSchema = z.string().trim().toLowerCase().regex(/^(?=.{4,253}$)([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/, "Enter a valid domain such as resume.example.com.");
app.put("/api/resumes/:id/custom-domain", authenticate, (req, res) => {
    const resume = resourceOwner(req, String(req.params.id));
    if (!resume)
        return res.status(404).json({ error: { code: "NOT_FOUND", message: "Resume not found." } });
    const raw = typeof req.body?.customDomain === "string" ? req.body.customDomain.trim() : "";
    if (!raw) {
        resume.customDomain = undefined;
    }
    else {
        const parsed = domainSchema.safeParse(raw);
        if (!parsed.success)
            return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message } });
        if ([...resumes.values()].some((candidate) => candidate.id !== resume.id && candidate.customDomain === parsed.data))
            return res.status(409).json({ error: { code: "DOMAIN_TAKEN", message: "This domain is already connected to another universe." } });
        resume.customDomain = parsed.data;
    }
    persistResume(resume).catch((error) => console.error("resume persistence failed", error));
    res.json({ customDomain: resume.customDomain ?? null });
});
app.put("/api/resumes/:resumeId/:key/reorder", authenticate, (req, res) => {
    const key = String(req.params.key);
    if (!["skills", "projects", "experience", "education"].includes(key))
        return res.status(404).json({ error: { code: "NOT_FOUND", message: "Unknown collection." } });
    const resume = resourceOwner(req, String(req.params.resumeId));
    if (!resume)
        return res.status(404).json({ error: { code: "NOT_FOUND", message: "Resume not found." } });
    const parsed = z.object({ ids: z.array(z.string()).max(500) }).safeParse(req.body);
    const collection = resourceCollection(resume, key);
    if (!parsed.success || parsed.data.ids.length !== collection.length || new Set(parsed.data.ids).size !== collection.length || !collection.every((item) => parsed.data.ids.includes(item.id)))
        return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "ids must list every item in the collection exactly once." } });
    const byId = new Map(collection.map((item) => [item.id, item]));
    collection.splice(0, collection.length, ...parsed.data.ids.map((id, order) => Object.assign(byId.get(id), { order })));
    persistResume(resume).catch((error) => console.error("resume persistence failed", error));
    res.json(collection);
});
app.post("/api/resumes/:id/publish", authenticate, (req, res) => {
    const resume = resumes.get(String(req.params.id));
    if (!resume || resume.userId !== req.userId)
        return res.status(404).json({ error: { code: "NOT_FOUND", message: "Resume not found." } });
    resume.isPublished = !resume.isPublished;
    persistResume(resume).catch((error) => console.error("resume persistence failed", error));
    res.json({ isPublished: resume.isPublished });
});
for (const key of ["skills", "projects", "experience", "education"]) {
    app.get(`/api/resumes/:resumeId/${key}`, authenticate, (req, res) => {
        const resume = resourceOwner(req, String(req.params.resumeId));
        if (!resume)
            return res.status(404).json({ error: { code: "NOT_FOUND", message: "Resume not found." } });
        res.json(resourceCollection(resume, key));
    });
    app.post(`/api/resumes/:resumeId/${key}`, authenticate, (req, res) => {
        const resume = resourceOwner(req, String(req.params.resumeId));
        if (!resume)
            return res.status(404).json({ error: { code: "NOT_FOUND", message: "Resume not found." } });
        const parsed = resourceSchemas[key].safeParse(req.body);
        if (!parsed.success)
            return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Resource fields are invalid.", details: parsed.error.flatten() } });
        const item = { id: randomUUID(), ...parsed.data, order: resourceCollection(resume, key).length };
        resourceCollection(resume, key).push(item);
        persistResume(resume).catch((error) => console.error("resource persistence failed", error));
        res.status(201).json(item);
    });
}
for (const [key, singular] of [["skills", "skills"], ["projects", "projects"], ["experience", "experience"], ["education", "education"]]) {
    app.patch(`/api/${singular}/:id`, authenticate, (req, res) => {
        const resume = [...resumes.values()].find((candidate) => candidate.userId === req.userId && resourceCollection(candidate, key).some((item) => item.id === String(req.params.id)));
        if (!resume)
            return res.status(404).json({ error: { code: "NOT_FOUND", message: "Resource not found." } });
        const parsed = resourceSchemas[key].partial().safeParse(req.body);
        if (!parsed.success)
            return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Resource fields are invalid." } });
        const item = resourceCollection(resume, key).find((candidate) => candidate.id === String(req.params.id));
        Object.assign(item, parsed.data);
        persistResume(resume).catch((error) => console.error("resource persistence failed", error));
        res.json(item);
    });
    app.delete(`/api/${singular}/:id`, authenticate, (req, res) => {
        const resume = [...resumes.values()].find((candidate) => candidate.userId === req.userId && resourceCollection(candidate, key).some((item) => item.id === String(req.params.id)));
        if (!resume)
            return res.status(404).json({ error: { code: "NOT_FOUND", message: "Resource not found." } });
        const collection = resourceCollection(resume, key);
        const index = collection.findIndex((candidate) => candidate.id === String(req.params.id));
        collection.splice(index, 1);
        persistResume(resume).catch((error) => console.error("resource persistence failed", error));
        res.status(204).send();
    });
}
app.post("/api/projects/:id/media", authenticate, mediaUpload.single("file"), async (req, res) => {
    const projectId = String(req.params.id);
    const resume = [...resumes.values()].find((candidate) => candidate.userId === req.userId && candidate.projects.some((project) => project.id === projectId));
    if (!resume)
        return res.status(404).json({ error: { code: "NOT_FOUND", message: "Project not found." } });
    if (!req.file)
        return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "A file is required." } });
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET)
        return res.status(503).json({ error: { code: "MEDIA_NOT_CONFIGURED", message: "Cloudinary is not configured on this server." } });
    try {
        const result = await new Promise((resolve, reject) => { const stream = cloudinary.uploader.upload_stream({ folder: "universe-resume/projects", resource_type: "auto" }, (error, uploaded) => error || !uploaded ? reject(error ?? new Error("Upload failed")) : resolve(uploaded)); Readable.from(req.file.buffer).pipe(stream); });
        const project = resume.projects.find((item) => item.id === projectId);
        project.media ??= [];
        project.media.push({ url: result.secure_url, type: result.resource_type, caption: "" });
        persistResume(resume).catch((error) => console.error("media persistence failed", error));
        res.status(201).json(project.media.at(-1));
    }
    catch {
        res.status(502).json({ error: { code: "MEDIA_UPLOAD_FAILED", message: "Cloudinary could not accept the upload." } });
    }
});
app.post("/api/resumes/:resumeId/import", authenticate, resumeUpload.single("resume"), async (req, res) => {
    const resume = resourceOwner(req, String(req.params.resumeId));
    if (!resume)
        return res.status(404).json({ error: { code: "NOT_FOUND", message: "Resume not found." } });
    if (!req.file)
        return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Upload a PDF, DOCX, or TXT resume using the resume field." } });
    try {
        const scanned = await scanResumeFile(req.file.buffer, req.file.originalname, req.file.mimetype);
        const apply = req.query.apply === "true";
        if (apply) {
            // Re-importing an updated resume replaces the generated collections instead of duplicating them.
            resume.skills = scanned.skills.map((item, order) => ({ id: randomUUID(), ...item, order }));
            resume.projects = scanned.projects.map((item, order) => ({ id: randomUUID(), ...item, order }));
            resume.experience = scanned.experience.map((item, order) => ({ id: randomUUID(), ...item, order }));
            resume.education = scanned.education.map((item, order) => ({ id: randomUUID(), ...item, order }));
            persistResume(resume).catch((error) => console.error("resume import persistence failed", error));
        }
        res.status(200).json({ applied: apply, extracted: scanned });
    }
    catch (error) {
        res.status(400).json({ error: { code: "IMPORT_FAILED", message: error instanceof Error ? error.message : "Unable to scan this resume." } });
    }
});
app.get("/api/public/domain/:host", (req, res) => {
    const host = String(req.params.host).toLowerCase();
    const resume = [...resumes.values()].find((candidate) => candidate.customDomain === host && candidate.isPublished);
    if (!resume)
        return res.status(404).json({ error: { code: "NOT_FOUND", message: "No published universe for this domain." } });
    res.json({ slug: resume.slug });
});
app.get("/api/public/:slug", (req, res) => {
    const resume = publishedResume(String(req.params.slug));
    if (!resume)
        return res.status(404).json({ error: { code: "NOT_FOUND", message: "Published universe not found." } });
    resume.viewCount += 1;
    persistResume(resume).catch(() => undefined);
    res.json(publicResume(resume));
});
app.get("/api/public/:slug/plain", (req, res) => {
    const resume = publishedResume(String(req.params.slug));
    if (!resume)
        return res.status(404).json({ error: { code: "NOT_FOUND", message: "Published universe not found." } });
    res.json({ ...publicResume(resume), format: "plain" });
});
app.get("/api/public/:slug/pdf", (req, res) => {
    const resume = publishedResume(String(req.params.slug));
    if (!resume)
        return res.status(404).json({ error: { code: "NOT_FOUND", message: "Published universe not found." } });
    const document = new PDFDocument({ size: "A4", margin: 52 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${resume.slug}-resume.pdf"`);
    document.pipe(res);
    document.fontSize(24).fillColor("#19151e").text(resume.title);
    document.moveDown(0.5).fontSize(11).fillColor("#55505c").text(resume.bio);
    const section = (title) => document.moveDown(1).fontSize(13).fillColor("#6b3e8f").text(title).moveDown(0.3);
    if (resume.skills.length) {
        section("Skills");
        document.fontSize(10).fillColor("#333").text(resume.skills.map((skill) => `${skill.name} (${skill.proficiency}%)`).join("  ·  "));
    }
    if (resume.experience.length) {
        section("Experience");
        resume.experience.forEach((entry) => { document.fontSize(11).fillColor("#19151e").text(`${entry.role} — ${entry.company}`); document.fontSize(9).fillColor("#55505c").text(`${entry.startDate.slice(0, 4)} — ${entry.endDate?.slice(0, 4) ?? "Present"}`); document.text(entry.description); entry.achievements.forEach((achievement) => document.text(`• ${achievement}`)); document.moveDown(0.4); });
    }
    if (resume.projects.length) {
        section("Projects");
        resume.projects.forEach((project) => { document.fontSize(11).fillColor("#19151e").text(project.title); document.fontSize(9).fillColor("#55505c").text(project.description); document.text(project.techStack.join(" · ")).moveDown(0.4); });
    }
    document.end();
});
app.get("/api/public/:slug/og-image", (req, res) => {
    const resume = publishedResume(String(req.params.slug));
    if (!resume)
        return res.status(404).send("Not found");
    const title = resume.title.replace(/[<&>]/g, "");
    const bio = resume.bio.replace(/[<&>]/g, "").slice(0, 120);
    res.type("image/svg+xml").send(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><defs><radialGradient id="g"><stop stop-color="#63378b"/><stop offset="1" stop-color="#0c0b11"/></radialGradient></defs><rect width="1200" height="630" fill="#0c0b11"/><circle cx="900" cy="270" r="280" fill="url(#g)"/><circle cx="900" cy="270" r="90" fill="#bc7df1" opacity=".9"/><text x="80" y="110" fill="#caa7e7" font-family="monospace" font-size="18">UNIVERSE · RESUME</text><text x="80" y="300" fill="#f1ece4" font-family="sans-serif" font-size="54" font-weight="700">${title}</text><text x="80" y="360" fill="#aaa0b2" font-family="sans-serif" font-size="22">${bio}</text></svg>`);
});
app.post("/api/analytics/:resumeId/event", (req, res) => {
    const resumeId = String(req.params.resumeId);
    if (!resumes.has(resumeId))
        return res.status(404).json({ error: { code: "NOT_FOUND", message: "Resume not found." } });
    const parsed = analyticsEventSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Analytics event is invalid." } });
    analyticsEvents.push({ resumeId, ...parsed.data, createdAt: new Date().toISOString() });
    res.status(201).json({ accepted: true });
});
app.get("/api/resumes/:resumeId/analytics/summary", authenticate, (req, res) => {
    const resume = resumes.get(String(req.params.resumeId));
    if (!resume || resume.userId !== req.userId)
        return res.status(404).json({ error: { code: "NOT_FOUND", message: "Resume not found." } });
    const events = analyticsEvents.filter((event) => event.resumeId === resume.id);
    const byType = Object.fromEntries([...new Set(events.map((event) => event.eventType))].map((type) => [type, events.filter((event) => event.eventType === type).length]));
    res.json({ resumeId: resume.id, views: events.filter((event) => event.eventType === "view").length, totalEvents: events.length, byType });
});
app.use((error, _req, res, _next) => { console.error(error); res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Something went wrong." } }); });
connectDatabase().then(() => hydrateStore()).catch((error) => console.error("MongoDB startup failed:", error));
app.listen(port, () => console.log(`Universe Resume API listening on http://localhost:${port}`));
