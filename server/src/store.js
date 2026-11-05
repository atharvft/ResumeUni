import { randomUUID } from "node:crypto";
// Temporary Phase 0 store. Replace these collections with Mongoose repositories in the DB milestone.
export const users = new Map();
export const resumes = new Map();
export const analyticsEvents = [];
export const refreshSessions = new Map();
export function createResume(userId, name, slug) {
    const resume = {
        id: randomUUID(), userId, slug, title: `${name} — Resume`, bio: "", socialLinks: {},
        theme: { palette: "nebula", galaxyShape: "spiral", particleDensity: "medium" },
        isPublished: false, viewCount: 0, skills: [], projects: [], experience: [], education: []
    };
    resumes.set(resume.id, resume);
    return resume;
}
