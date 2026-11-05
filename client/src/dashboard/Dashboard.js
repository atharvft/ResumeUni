import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import API_BASE_URL from "../config/api";
const authKey = "universe-access-token";
const refreshKey = "universe-refresh-token";
const api = async (path, options = {}) => {
    const token = localStorage.getItem(authKey);
    const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers: { "content-type": "application/json", ...(token ? { authorization: `Bearer ${token}` } : {}), ...(options.headers ?? {}) } });
    if (!response.ok)
        throw new Error((await response.json().catch(() => null))?.error?.message ?? "Request failed");
    return response.status === 204 ? null : response.json();
};
export function Dashboard() {
    const [resume, setResume] = useState(null);
    const [mode, setMode] = useState("register");
    const [auth, setAuth] = useState({ name: "", email: "", password: "" });
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState("");
    const [analytics, setAnalytics] = useState(null);
    const [skill, setSkill] = useState({ name: "", category: "Frontend", proficiency: "80" });
    const [project, setProject] = useState({ title: "", description: "", techStack: "" });
    const [experience, setExperience] = useState({ company: "", role: "", startDate: "", description: "" });
    const [education, setEducation] = useState({ institution: "", degree: "", fieldOfStudy: "" });
    const [dragged, setDragged] = useState(null);
    const [domain, setDomain] = useState("");
    const reorder = async (kind, fromId, toId) => {
        if (!resume || fromId === toId)
            return;
        const ids = resume[kind].map((item) => item.id);
        ids.splice(ids.indexOf(toId), 0, ids.splice(ids.indexOf(fromId), 1)[0]);
        const previous = resume;
        setResume({ ...resume, [kind]: ids.map((id) => resume[kind].find((item) => item.id === id)) });
        try {
            await api(`/api/resumes/${resume.id}/${kind}/reorder`, { method: "PUT", body: JSON.stringify({ ids }) });
            setMessage("Order saved.");
        }
        catch (error) {
            setResume(previous);
            setMessage(error instanceof Error ? error.message : "Unable to reorder.");
        }
    };
    const drag = (kind, item) => ({ draggable: true, className: dragged?.id === item.id ? "dragging" : undefined, title: "Drag to reorder", onDragStart: () => setDragged({ kind, id: item.id }), onDragOver: (event) => { if (dragged?.kind === kind)
            event.preventDefault(); }, onDrop: (event) => { event.preventDefault(); if (dragged?.kind === kind)
            void reorder(kind, dragged.id, item.id); setDragged(null); }, onDragEnd: () => setDragged(null) });
    const saveDomain = async (event) => {
        event.preventDefault();
        if (!resume)
            return;
        try {
            const data = await api(`/api/resumes/${resume.id}/custom-domain`, { method: "PUT", body: JSON.stringify({ customDomain: domain }) });
            setResume({ ...resume, customDomain: data.customDomain ?? undefined });
            setMessage(data.customDomain ? "Custom domain saved. Point its CNAME at this app's host." : "Custom domain removed.");
        }
        catch (error) {
            setMessage(error instanceof Error ? error.message : "Unable to save domain.");
        }
    };
    const load = async () => {
        const data = await api("/api/resumes/me");
        setResume(data);
        setDomain(data?.customDomain ?? "");
        if (data)
            setAnalytics(await api(`/api/resumes/${data.id}/analytics/summary`));
    };
    useEffect(() => { if (localStorage.getItem(authKey))
        load().catch(() => localStorage.removeItem(authKey)); }, []);
    const submitAuth = async (event) => {
        event.preventDefault();
        setBusy(true);
        setMessage("");
        try {
            const data = await api(`/api/auth/${mode}`, { method: "POST", body: JSON.stringify(auth) });
            localStorage.setItem(authKey, data.accessToken);
            localStorage.setItem(refreshKey, data.refreshToken);
            await load();
        }
        catch (error) {
            setMessage(error instanceof Error ? error.message : "Unable to authenticate.");
        }
        finally {
            setBusy(false);
        }
    };
    const updateResume = async (patch) => { if (!resume)
        return; setResume(await api(`/api/resumes/${resume.id}`, { method: "PATCH", body: JSON.stringify(patch) })); setMessage("Saved."); };
    const publish = async () => { if (!resume)
        return; const data = await api(`/api/resumes/${resume.id}/publish`, { method: "POST" }); setResume({ ...resume, isPublished: data.isPublished }); };
    const add = async (kind, value) => { if (!resume)
        return; const item = await api(`/api/resumes/${resume.id}/${kind}`, { method: "POST", body: JSON.stringify(value) }); setResume({ ...resume, [kind]: [...resume[kind], item] }); setMessage(`${kind} updated.`); };
    const remove = async (kind, id) => { if (!resume || !id)
        return; await api(`/api/${kind}/${id}`, { method: "DELETE" }); setResume({ ...resume, [kind]: resume[kind].filter((item) => item.id !== id) }); };
    if (!localStorage.getItem(authKey))
        return _jsxs("main", { className: "dashboard-auth", children: [_jsxs("a", { className: "brand", href: "/", children: ["UNIVERSE", _jsx("span", { children: "\u00B7" }), "RESUME"] }), _jsxs("form", { onSubmit: submitAuth, children: [_jsx("p", { className: "eyebrow", children: "Candidate workspace" }), _jsx("h1", { children: mode === "register" ? "Build your universe." : "Welcome back." }), mode === "register" && _jsx("input", { placeholder: "Your name", value: auth.name, onChange: (event) => setAuth({ ...auth, name: event.target.value }), required: true }), _jsx("input", { type: "email", placeholder: "Email address", value: auth.email, onChange: (event) => setAuth({ ...auth, email: event.target.value }), required: true }), _jsx("input", { type: "password", placeholder: "Password (8+ characters)", value: auth.password, onChange: (event) => setAuth({ ...auth, password: event.target.value }), minLength: 8, required: true }), _jsx("button", { className: "button primary", disabled: busy, children: busy ? "Opening…" : mode === "register" ? "Create universe" : "Sign in" }), message && _jsx("p", { className: "form-message", children: message }), _jsx("button", { type: "button", className: "text-link plain-button", onClick: () => setMode(mode === "register" ? "login" : "register"), children: mode === "register" ? "Already have an account? Sign in" : "New here? Create an account" })] })] });
    if (!resume)
        return _jsx("main", { className: "viewer-state", children: _jsx("p", { children: "Loading workspace\u2026" }) });
    return _jsxs("main", { className: "dashboard", children: [_jsxs("header", { className: "dashboard-header", children: [_jsxs("a", { className: "brand", href: "/", children: ["UNIVERSE", _jsx("span", { children: "\u00B7" }), "RESUME"] }), _jsxs("div", { children: [_jsx("a", { className: "button primary", href: "/dashboard/import", children: "Import resume" }), _jsx("a", { className: "button secondary", href: `/u/${resume.slug}`, children: "View universe" }), _jsx("button", { className: "text-link plain-button", onClick: () => { localStorage.removeItem(authKey); location.reload(); }, children: "Sign out" })] })] }), _jsxs("section", { className: "dashboard-heading", children: [_jsxs("div", { children: [_jsx("p", { className: "eyebrow", children: "Candidate workspace" }), _jsx("h1", { children: "Shape your universe." }), _jsx("p", { children: "Upload your resume to automatically populate your skills, projects, experience, and education." })] }), _jsx("button", { className: "button primary", onClick: publish, children: resume.isPublished ? "Unpublish" : "Publish universe" })] }), message && _jsx("p", { className: "save-message", children: message }), _jsxs("div", { className: "dashboard-grid", children: [_jsxs("section", { className: "editor-card", children: [_jsx("p", { className: "eyebrow", children: "Profile" }), _jsxs("label", { children: ["Title", _jsx("input", { value: resume.title, onChange: (event) => setResume({ ...resume, title: event.target.value }) })] }), _jsxs("label", { children: ["Bio", _jsx("textarea", { value: resume.bio, onChange: (event) => setResume({ ...resume, bio: event.target.value }) })] }), _jsx("button", { className: "button secondary", onClick: () => updateResume({ title: resume.title, bio: resume.bio }), children: "Save profile" })] }), _jsxs("section", { className: "editor-card", children: [_jsx("p", { className: "eyebrow", children: "Custom domain" }), _jsxs("form", { className: "stack-form", onSubmit: saveDomain, children: [_jsx("input", { placeholder: "resume.example.com", value: domain, onChange: (event) => setDomain(event.target.value) }), _jsx("button", { className: "button secondary", children: "Save domain" })] }), _jsx("small", { children: resume.customDomain ? `Live at https://${resume.customDomain} once DNS points here and the universe is published.` : "Optional vanity URL for your published universe." })] }), _jsxs("section", { className: "editor-card", children: [_jsx("p", { className: "eyebrow", children: "Analytics" }), _jsxs("div", { className: "metric", children: [_jsx("strong", { children: analytics?.views ?? 0 }), _jsx("span", { children: "views" })] }), _jsxs("div", { className: "metric", children: [_jsx("strong", { children: analytics?.totalEvents ?? 0 }), _jsx("span", { children: "interactions" })] })] }), _jsxs("section", { className: "editor-card wide", children: [_jsx("p", { className: "eyebrow", children: "Skills / stars" }), _jsxs("form", { className: "inline-form", onSubmit: (event) => { event.preventDefault(); void add("skills", { ...skill, proficiency: Number(skill.proficiency) }); setSkill({ ...skill, name: "" }); }, children: [_jsx("input", { placeholder: "Skill name", value: skill.name, onChange: (event) => setSkill({ ...skill, name: event.target.value }), required: true }), _jsx("input", { placeholder: "Category", value: skill.category, onChange: (event) => setSkill({ ...skill, category: event.target.value }), required: true }), _jsx("input", { type: "number", min: "0", max: "100", value: skill.proficiency, onChange: (event) => setSkill({ ...skill, proficiency: event.target.value }) }), _jsx("button", { className: "button secondary", children: "Add star" })] }), _jsx("div", { className: "item-list", children: resume.skills.map((item) => _jsxs("div", { ...drag("skills", item), children: [_jsxs("span", { children: [item.name, _jsxs("small", { children: [item.category, " \u00B7 ", item.proficiency, "%"] })] }), _jsx("button", { onClick: () => remove("skills", item.id), children: "\u00D7" })] }, item.id ?? item.name)) })] }), _jsxs("section", { className: "editor-card wide", children: [_jsx("p", { className: "eyebrow", children: "Projects / planets" }), _jsxs("form", { className: "stack-form", onSubmit: (event) => { event.preventDefault(); void add("projects", { title: project.title, description: project.description, techStack: project.techStack.split(",").map((tag) => tag.trim()).filter(Boolean), links: {}, impactScore: 70 }); setProject({ title: "", description: "", techStack: "" }); }, children: [_jsx("input", { placeholder: "Project title", value: project.title, onChange: (event) => setProject({ ...project, title: event.target.value }), required: true }), _jsx("textarea", { placeholder: "What did you build?", value: project.description, onChange: (event) => setProject({ ...project, description: event.target.value }), required: true }), _jsx("input", { placeholder: "Tech stack, comma separated", value: project.techStack, onChange: (event) => setProject({ ...project, techStack: event.target.value }) }), _jsx("button", { className: "button secondary", children: "Add planet" })] }), _jsx("div", { className: "item-list", children: resume.projects.map((item) => _jsxs("div", { ...drag("projects", item), children: [_jsxs("span", { children: [item.title, _jsx("small", { children: item.techStack.join(" · ") })] }), _jsx("button", { onClick: () => remove("projects", item.id), children: "\u00D7" })] }, item.id ?? item.title)) })] }), _jsxs("section", { className: "editor-card wide", children: [_jsx("p", { className: "eyebrow", children: "Experience / route" }), _jsxs("form", { className: "inline-form", onSubmit: (event) => { event.preventDefault(); void add("experience", { ...experience, achievements: [] }); setExperience({ company: "", role: "", startDate: "", description: "" }); }, children: [_jsx("input", { placeholder: "Company", value: experience.company, onChange: (event) => setExperience({ ...experience, company: event.target.value }), required: true }), _jsx("input", { placeholder: "Role", value: experience.role, onChange: (event) => setExperience({ ...experience, role: event.target.value }), required: true }), _jsx("input", { placeholder: "Start year", value: experience.startDate, onChange: (event) => setExperience({ ...experience, startDate: event.target.value }), required: true }), _jsx("button", { className: "button secondary", children: "Add waypoint" })] }), _jsx("div", { className: "item-list", children: resume.experience.map((item) => _jsxs("div", { ...drag("experience", item), children: [_jsxs("span", { children: [item.role, " \u00B7 ", item.company, _jsx("small", { children: item.startDate })] }), _jsx("button", { onClick: () => remove("experience", item.id), children: "\u00D7" })] }, item.id ?? `${item.company}-${item.role}`)) })] }), _jsxs("section", { className: "editor-card wide", children: [_jsx("p", { className: "eyebrow", children: "Education / waypoints" }), _jsxs("form", { className: "inline-form", onSubmit: (event) => { event.preventDefault(); void add("education", education); setEducation({ institution: "", degree: "", fieldOfStudy: "" }); }, children: [_jsx("input", { placeholder: "Institution", value: education.institution, onChange: (event) => setEducation({ ...education, institution: event.target.value }), required: true }), _jsx("input", { placeholder: "Degree", value: education.degree, onChange: (event) => setEducation({ ...education, degree: event.target.value }) }), _jsx("input", { placeholder: "Field of study", value: education.fieldOfStudy, onChange: (event) => setEducation({ ...education, fieldOfStudy: event.target.value }) }), _jsx("button", { className: "button secondary", children: "Add education" })] }), _jsx("div", { className: "item-list", children: resume.education.map((item) => _jsxs("div", { ...drag("education", item), children: [_jsxs("span", { children: [item.degree, " \u00B7 ", item.institution, _jsx("small", { children: item.fieldOfStudy })] }), _jsx("button", { onClick: () => remove("education", item.id), children: "\u00D7" })] }, item.id ?? item.institution)) })] })] })] });
}
