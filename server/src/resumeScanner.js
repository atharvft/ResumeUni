import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";
const sectionAliases = {
    skills: "skills", 
    "technical skills": "skills", 
    "core competencies": "skills", 
    technologies: "skills", 
    "tech stack": "skills",
    "skills & technologies": "skills",
    "skills and technologies": "skills",
    "skills & tools": "skills",
    "skills and tools": "skills",
    "technical qualifications": "skills",
    expertise: "skills",
    "areas of expertise": "skills",
    competencies: "skills",
    "key skills": "skills",
    tools: "skills",
    languages: "skills",
    "languages & technologies": "skills",
    "languages and technologies": "skills",
    
    projects: "projects", 
    "selected projects": "projects", 
    portfolio: "projects",
    "personal projects": "projects",
    "academic projects": "projects",
    "key projects": "projects",
    "featured projects": "projects",
    "recent projects": "projects",
    "projects & accomplishments": "projects",
    "projects and accomplishments": "projects",
    "relevant projects": "projects",
    "major projects": "projects",
    "other projects": "projects",
    "technical projects": "projects",
    "software projects": "projects",
    
    experience: "experience", 
    "work experience": "experience", 
    employment: "experience", 
    "professional experience": "experience",
    "employment history": "experience",
    "work history": "experience",
    "career history": "experience",
    "professional background": "experience",
    "relevant experience": "experience",
    "work experience & history": "experience",
    "experience history": "experience",
    "professional highlights": "experience",
    
    education: "education", 
    "academic background": "education", 
    academics: "education",
    "education and training": "education",
    "education & training": "education",
    "academic profile": "education",
    credentials: "education",
    qualifications: "education"
};
const techNames = ["react", "react native", "next.js", "node.js", "typescript", "javascript", "python", "java", "c#", "c++", "go", "ruby", "php", "sql", "postgresql", "postgres", "mysql", "mongodb", "redis", "aws", "azure", "gcp", "docker", "kubernetes", "terraform", "graphql", "figma", "three.js", "git", "html", "css", "tailwind", "django", "flask", "spring", "fastapi", "pandas", "tableau"];
const datePattern = /\b((?:19|20)\d{2}(?:[-/.](?:0?[1-9]|1[0-2]))?(?:[-/.](?:0?[1-9]|[12]\d|3[01]))?)\s*(?:-|–|—|to|until)\s*(present|current|now|(?:19|20)\d{2}(?:[-/.](?:0?[1-9]|1[0-2]))?(?:[-/.](?:0?[1-9]|[12]\d|3[01]))?)\b/i;
const singleYear = /\b(?:19|20)\d{2}\b/;
const clean = (value) => value.replace(/\u00a0/g, " ").replace(/\s+/g, " ").replace(/^[-•▪◦*➜■◆●○▪▫▶›»✓✓\uf0b7\u2022]+\s*/, "").trim();
const normalizedHeading = (value) => clean(value).toLowerCase().replace(/[.:|]+$/, "");
const isBullet = (value) => /^[-•▪◦*➜■◆●○▪▫▶›»✓✓\uf0b7\u2022]/.test(value.trim());
const unique = (values) => [...new Map(values.filter(Boolean).map((value) => [value.toLowerCase(), value])).values()];
const sectionHeading = (line) => sectionAliases[normalizedHeading(line)];
const linesFor = (sections, key) => sections[key] ?? [];
export async function extractResumeText(buffer, filename, mimetype) {
    const extension = filename.toLowerCase().split(".").pop();
    if (extension === "pdf" || mimetype === "application/pdf") {
        const parser = new PDFParse({ data: buffer });
        try {
            return (await parser.getText()).text;
        }
        finally {
            await parser.destroy();
        }
    }
    if (extension === "docx" || mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
        return (await mammoth.extractRawText({ buffer })).value;
    if (extension === "txt" || mimetype?.startsWith("text/"))
        return buffer.toString("utf8");
    throw new Error("Only PDF, DOCX, and TXT resumes are supported.");
}
function splitSections(text) {
    const sections = { other: [] };
    let current = "other";
    for (const rawLine of text.split(/\r?\n/)) {
        const line = clean(rawLine);
        if (!line)
            continue;
        const section = sectionHeading(line);
        if (section) {
            current = section;
            sections[current] ??= [];
            continue;
        }
        sections[current] ??= [];
        sections[current].push(line);
    }
    return sections;
}
function extractSkills(lines) {
    const skills = [];
    for (const line of lines) {
        const categoryMatch = line.match(/^([^:|]+)\s*[:|]\s*(.+)$/);
        const category = categoryMatch?.[1]?.trim() || "General";
        const values = (categoryMatch?.[2] ?? line).split(/[,;|·•]/).map(clean).filter((value) => value.length > 1 && value.length < 60);
        for (const name of values) {
            if (/^(skills?|technologies?|tools?|languages?)$/i.test(name))
                continue;
            if (!skills.some((skill) => skill.name.toLowerCase() === name.toLowerCase()))
                skills.push({ name, category, proficiency: 70 });
        }
    }
    return skills;
}
function techStack(text) {
    return unique(techNames.filter((name) => new RegExp(`(^|[^a-z0-9+#])${name.replace(/[.+#]/g, "\\$&")}(?=$|[^a-z0-9+#])`, "i").test(text)).map((name) => name === "node.js" ? "Node.js" : name === "next.js" ? "Next.js" : name[0].toUpperCase() + name.slice(1)));
}
function extractProjects(lines) {
    const projects = [];
    let current;
    const save = () => { if (current) {
        current.description = current.description.trim();
        current.techStack = unique([...current.techStack, ...techStack(`${current.title} ${current.description}`)]);
        projects.push(current);
    } };
    for (const line of lines) {
        const url = line.match(/https?:\/\/\S+/)?.[0];
        const looksLikeTitle = !isBullet(line) && line.length <= 90 && !/[.!?]$/.test(line) && !url;
        if (looksLikeTitle || !current) {
            if (looksLikeTitle || !current) {
                save();
                current = { title: line.replace(/\s*[-|–—]\s*https?:\/\/\S+/, "").trim(), description: "", techStack: [], links: url ? { live: url } : {}, impactScore: 60 };
                continue;
            }
        }
        if (url && current)
            current.links.live = url;
        else if (current)
            current.description += `${current.description ? " " : ""}${clean(line)}`;
    }
    save();
    return projects.filter((project) => project.title.length > 1);
}
function extractExperience(lines) {
    const experience = [];
    let current;
    let pending = [];
    const save = () => { if (current) {
        current.description = current.description.trim();
        experience.push(current);
    } };
    for (const line of lines) {
        const dates = line.match(datePattern);
        if (dates) {
            save();
            const withoutDates = clean(line.replace(dates[0], "").replace(/[|,·]+/g, " "));
            const parts = withoutDates.split(/\s+at\s+|\s+[|–—-]\s+/i).map(clean).filter(Boolean);
            const context = pending.filter((item) => !isBullet(item)).slice(-2);
            const role = parts.length > 1 ? parts[0] : context.at(-1) ?? parts[0] ?? "";
            const company = parts.length > 1 ? parts[1] : context.at(-2) ?? "";
            current = { company, role, startDate: dates[1], endDate: /present|current|now/i.test(dates[2]) ? undefined : dates[2], description: "", achievements: [] };
            pending = [];
            continue;
        }
        if (!current) {
            pending.push(line);
            continue;
        }
        if (isBullet(line))
            current.achievements.push(clean(line));
        else if (!current.role)
            current.role = line;
        else if (!current.company)
            current.company = line;
        else
            current.description += `${current.description ? " " : ""}${clean(line)}`;
    }
    save();
    return experience.filter((item) => item.company || item.role);
}
function extractEducation(lines) {
    return lines.filter((line) => line.length > 2).reduce((items, line, index) => {
        if (isBullet(line))
            return items;
        const degree = /\b(bachelor|master|ph\.d|doctor|b\.?s\.?|m\.?s\.?|mba|b\.?tech|m\.?tech|diploma)\b/i.test(line) ? line : lines[index + 1] ?? "";
        const institution = degree === line ? lines[index + 1] ?? line : line;
        if (!items.some((item) => item.institution === institution))
            items.push({ institution, degree, fieldOfStudy: degree.match(/(?:in|of)\s+(.+)$/i)?.[1] });
        return items;
    }, []);
}
export function scanResumeText(text) {
    const sections = splitSections(text);
    return { text, skills: extractSkills(linesFor(sections, "skills")), projects: extractProjects(linesFor(sections, "projects")), experience: extractExperience(linesFor(sections, "experience")), education: extractEducation(linesFor(sections, "education")) };
}
export async function scanResumeFile(buffer, filename, mimetype) { return scanResumeText(await extractResumeText(buffer, filename, mimetype)); }
