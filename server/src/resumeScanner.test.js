import { describe, expect, it } from "vitest";
import { scanResumeText } from "./resumeScanner.js";
describe("resume scanner", () => {
    it("extracts skills, projects, and dated experience from common resume sections", () => {
        const scanned = scanResumeText(`
      SKILLS
      Frontend: React, JavaScript, CSS
      Backend: Node.js, PostgreSQL
      PROJECTS
      Universe Resume
      Built an interactive resume with React and Three.js.
      https://example.com/universe
      EXPERIENCE
      Northstar Labs
      Product Engineer
      2023-01 - Present
      Led the platform launch and improved activation.
      - Shipped the first version in 12 weeks
      EDUCATION
      State University
      Bachelor of Science in Computer Science
    `);
    expect(scanned.skills.map((skill) => skill.name)).toEqual(["React", "JavaScript", "CSS", "Node.js", "PostgreSQL"]);
        expect(scanned.projects[0]).toMatchObject({ title: "Universe Resume", techStack: ["React", "Three.js"], links: { live: "https://example.com/universe" } });
        expect(scanned.experience[0]).toMatchObject({ company: "Northstar Labs", role: "Product Engineer", startDate: "2023-01", achievements: ["Shipped the first version in 12 weeks"] });
        expect(scanned.education[0]).toMatchObject({ institution: "State University", degree: "Bachelor of Science in Computer Science" });
    });
});
