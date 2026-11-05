import { UserModel, ResumeModel, SkillModel, ProjectModel, ExperienceModel, EducationModel, RefreshSessionModel } from "./models.js";
import { refreshSessions, resumes, users } from "./store.js";
export const persistenceEnabled = () => process.env.MONGODB_ENABLED === "true";
export async function hydrateStore() {
    if (!persistenceEnabled())
        return;
    const [userDocs, resumeDocs, skillDocs, projectDocs, experienceDocs, educationDocs, sessionDocs] = await Promise.all([UserModel.find().lean(), ResumeModel.find().lean(), SkillModel.find().lean(), ProjectModel.find().lean(), ExperienceModel.find().lean(), EducationModel.find().lean(), RefreshSessionModel.find().lean()]);
    users.clear();
    resumes.clear();
    refreshSessions.clear();
    userDocs.forEach((raw) => { const doc = raw; users.set(String(doc._id), { id: String(doc._id), name: doc.name, email: doc.email, passwordHash: doc.passwordHash }); });
    resumeDocs.forEach((raw) => { const doc = raw; resumes.set(String(doc._id), { id: String(doc._id), userId: String(doc.userId), slug: doc.slug, title: doc.title ?? "", bio: doc.bio ?? "", socialLinks: doc.socialLinks ?? {}, theme: doc.theme, customDomain: doc.customDomain ?? undefined, isPublished: Boolean(doc.isPublished), viewCount: doc.viewCount ?? 0, skills: [], projects: [], experience: [], education: [] }); });
    skillDocs.forEach((raw) => { const doc = raw; resumes.get(String(doc.resumeId))?.skills.push({ id: String(doc._id), name: doc.name, category: doc.category, proficiency: doc.proficiency, yearsUsed: doc.yearsUsed ?? undefined, order: doc.order ?? 0 }); });
    projectDocs.forEach((raw) => { const doc = raw; resumes.get(String(doc.resumeId))?.projects.push({ id: String(doc._id), title: doc.title, description: doc.description ?? "", techStack: doc.techStack ?? [], links: doc.links ?? {}, media: doc.media ?? [], impactScore: doc.impactScore ?? 50, order: doc.order ?? 0 }); });
    experienceDocs.forEach((raw) => { const doc = raw; resumes.get(String(doc.resumeId))?.experience.push({ id: String(doc._id), company: doc.company, role: doc.role, startDate: doc.startDate ?? "", endDate: doc.endDate ?? undefined, description: doc.description ?? "", achievements: doc.achievements ?? [], location: doc.location ?? undefined, order: doc.order ?? 0 }); });
    educationDocs.forEach((raw) => { const doc = raw; resumes.get(String(doc.resumeId))?.education.push({ id: String(doc._id), institution: doc.institution, degree: doc.degree ?? "", fieldOfStudy: doc.fieldOfStudy ?? undefined, startDate: doc.startDate ?? undefined, endDate: doc.endDate ?? undefined, description: doc.description ?? undefined, order: doc.order ?? 0 }); });
    sessionDocs.forEach((doc) => refreshSessions.set(String(doc._id), doc.userId));
    resumes.forEach((resume) => { resume.skills.sort((a, b) => a.order - b.order); resume.projects.sort((a, b) => a.order - b.order); resume.experience.sort((a, b) => a.order - b.order); resume.education.sort((a, b) => a.order - b.order); });
}
export async function persistUser(user) {
    if (!persistenceEnabled())
        return;
    await UserModel.findByIdAndUpdate(user.id, { _id: user.id, name: user.name, email: user.email, passwordHash: user.passwordHash }, { upsert: true, setDefaultsOnInsert: true });
}
export async function persistResume(resume) {
    if (!persistenceEnabled())
        return;
    await ResumeModel.findByIdAndUpdate(resume.id, { _id: resume.id, userId: resume.userId, slug: resume.slug, title: resume.title, bio: resume.bio, socialLinks: resume.socialLinks, theme: resume.theme, customDomain: resume.customDomain ?? null, isPublished: resume.isPublished, viewCount: resume.viewCount }, { upsert: true, setDefaultsOnInsert: true });
    await Promise.all([SkillModel.deleteMany({ resumeId: resume.id }), ProjectModel.deleteMany({ resumeId: resume.id }), ExperienceModel.deleteMany({ resumeId: resume.id }), EducationModel.deleteMany({ resumeId: resume.id })]);
    await Promise.all([SkillModel.insertMany(resume.skills.map((item) => ({ ...item, _id: item.id, resumeId: resume.id }))), ProjectModel.insertMany(resume.projects.map((item) => ({ ...item, _id: item.id, resumeId: resume.id }))), ExperienceModel.insertMany(resume.experience.map((item) => ({ ...item, _id: item.id, resumeId: resume.id }))), EducationModel.insertMany(resume.education.map((item) => ({ ...item, _id: item.id, resumeId: resume.id })))]);
}
export async function persistRefreshSession(token, userId) {
    if (!persistenceEnabled())
        return;
    await RefreshSessionModel.findByIdAndUpdate(token, { _id: token, userId, expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }, { upsert: true, setDefaultsOnInsert: true });
}
export async function removeRefreshSession(token) { if (persistenceEnabled())
    await RefreshSessionModel.findByIdAndDelete(token); }
