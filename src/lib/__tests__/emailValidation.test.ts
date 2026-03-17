import { describe, it, expect } from "vitest";
import { extractDomain, validateEmailDomain } from "../emailValidation";

describe("emailValidation", () => {
  // ---- extractDomain ----

  describe("extractDomain", () => {
    it("should extract domain from a valid email", () => {
      expect(extractDomain("student@school.edu")).toBe("school.edu");
    });

    it("should lowercase the domain", () => {
      expect(extractDomain("user@SCHOOL.EDU")).toBe("school.edu");
    });

    it("should trim whitespace from domain", () => {
      expect(extractDomain("user@school.edu  ")).toBe("school.edu");
    });

    it("should return null for empty string", () => {
      expect(extractDomain("")).toBeNull();
    });

    it("should return null for email without @", () => {
      expect(extractDomain("invalid-email")).toBeNull();
    });

    it("should return null for email with multiple @", () => {
      expect(extractDomain("user@@school.edu")).toBeNull();
    });

    it("should return null for null/undefined input", () => {
      expect(extractDomain(null as any)).toBeNull();
      expect(extractDomain(undefined as any)).toBeNull();
    });

    it("should handle complex subdomains", () => {
      expect(extractDomain("user@mail.cs.school.edu")).toBe("mail.cs.school.edu");
    });
  });

  // ---- validateEmailDomain ----

  describe("validateEmailDomain", () => {
    const allowedDomains = ["school.edu", "academy.org"];

    it("should accept email from an allowed domain", () => {
      const result = validateEmailDomain("student@school.edu", allowedDomains);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should accept email from subdomain of allowed domain", () => {
      const result = validateEmailDomain(
        "user@mail.school.edu",
        allowedDomains
      );
      expect(result.isValid).toBe(true);
    });

    it("should reject email from an unallowed domain", () => {
      const result = validateEmailDomain("hacker@gmail.com", allowedDomains);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("must be from one of these domains");
    });

    it("should be case-insensitive for domain matching", () => {
      const result = validateEmailDomain("user@SCHOOL.EDU", allowedDomains);
      expect(result.isValid).toBe(true);
    });

    it("should allow any email when allowedDomains is empty", () => {
      const result = validateEmailDomain("anyone@gmail.com", []);
      expect(result.isValid).toBe(true);
    });

    it("should allow any email when allowedDomains is null/undefined", () => {
      const result = validateEmailDomain("anyone@gmail.com", null as any);
      expect(result.isValid).toBe(true);
    });

    it("should reject empty email", () => {
      const result = validateEmailDomain("", allowedDomains);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Email is required");
    });

    it("should reject malformed email", () => {
      const result = validateEmailDomain("not-an-email", allowedDomains);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Invalid email format");
    });

    it("should not match partial domain names", () => {
      // "notschool.edu" should NOT match "school.edu"
      const result = validateEmailDomain(
        "user@notschool.edu",
        allowedDomains
      );
      expect(result.isValid).toBe(false);
    });

    it("should match second allowed domain", () => {
      const result = validateEmailDomain(
        "teacher@academy.org",
        allowedDomains
      );
      expect(result.isValid).toBe(true);
    });
  });
});
