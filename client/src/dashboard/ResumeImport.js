import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import API_BASE_URL from "../config/api";
const tokenKey = "universe-access-token";
export function ResumeImport() {
    const [resumeId, setResumeId] = useState("");
    const [file, setFile] = useState();
    const [result, setResult] = useState();
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState("");
    useEffect(() => {
        fetch(`${API_BASE_URL}/api/resumes/me`, { headers: { authorization: `Bearer ${localStorage.getItem(tokenKey)}` } })
            .then((response) => response.json())
            .then((resume) => setResumeId(resume.id))
            .catch(() => setMessage("Sign in before importing a resume."));
    }, []);
    const scan = async (selectedFile) => {
        if (!resumeId)
            return;
        setFile(selectedFile);
        setBusy(true);
        setMessage("");
        const form = new FormData();
        form.append("resume", selectedFile);
        try {
            const response = await fetch(`${API_BASE_URL}/api/resumes/${resumeId}/import?apply=true`, { method: "POST", headers: { authorization: `Bearer ${localStorage.getItem(tokenKey)}` }, body: form });
            const data = await response.json();
            if (!response.ok)
                setMessage(data.error?.message ?? "Unable to scan resume.");
            else {
                setResult(data.extracted);
                setMessage("Extracted and added to your universe.");
            }
        }
        catch {
            setMessage("Unable to reach the resume scanner.");
        }
        finally {
            setBusy(false);
        }
    };
    return _jsxs("main", { className: "import-page", children: [_jsxs("header", { className: "dashboard-header", children: [_jsxs("a", { className: "brand", href: "/", children: ["UNIVERSE", _jsx("span", { children: "\u00B7" }), "RESUME"] }), _jsx("a", { className: "button secondary", href: "/dashboard", children: "Back to dashboard" })] }), _jsxs("section", { className: "import-card", children: [_jsx("p", { className: "eyebrow", children: "Resume scanner" }), _jsx("h1", { children: "Bring your career into orbit." }), _jsx("p", { children: "Upload a PDF, DOCX, or TXT resume. We\u2019ll automatically extract your projects, experience, education, and skills into your universe." }), _jsxs("label", { className: "drop-zone", children: [_jsx("input", { type: "file", accept: ".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain", onChange: (event) => { const selected = event.target.files?.[0]; if (selected)
                                    void scan(selected); } }), busy ? "Extracting your resume…" : file ? file.name : "Choose a resume file"] }), message && _jsx("p", { className: "save-message", children: message })] }), result && _jsxs("section", { className: "scan-results", children: [_jsxs("div", { children: [_jsxs("h2", { children: ["Skills ", _jsx("small", { children: result.skills.length })] }), result.skills.map((item) => _jsx("p", { children: item.name }, item.name))] }), _jsxs("div", { children: [_jsxs("h2", { children: ["Projects ", _jsx("small", { children: result.projects.length })] }), result.projects.map((item) => _jsxs("p", { children: [_jsx("strong", { children: item.title }), _jsx("br", {}), item.description] }, item.title))] }), _jsxs("div", { children: [_jsxs("h2", { children: ["Experience ", _jsx("small", { children: result.experience.length })] }), result.experience.map((item) => _jsxs("p", { children: [_jsx("strong", { children: item.role }), " \u00B7 ", item.company] }, `${item.company}-${item.role}`))] }), _jsxs("div", { children: [_jsxs("h2", { children: ["Education ", _jsx("small", { children: result.education.length })] }), result.education.map((item) => _jsxs("p", { children: [_jsx("strong", { children: item.institution }), _jsx("br", {}), item.degree] }, item.institution))] })] })] });
}
