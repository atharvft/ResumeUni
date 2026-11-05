import { beforeEach, describe, expect, it } from "vitest";
import { createResume, resumes } from "./store.js";
describe("resume store", () => {
    beforeEach(() => resumes.clear());
    it("creates a resume with the documented defaults", () => {
        const resume = createResume("user-1", "Ada Lovelace", "ada-lovelace");
        expect(resume.slug).toBe("ada-lovelace");
        expect(resume.isPublished).toBe(false);
        expect(resume.theme.palette).toBe("nebula");
        expect(resume.skills).toEqual([]);
    });
});
