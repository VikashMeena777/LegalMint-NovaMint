import { describe, it, expect } from "vitest";
import {
  sanitizeInput,
  sanitizeHtml,
  validateEmail,
  validatePhone,
  validateGSTIN,
  validatePAN,
  truncateText,
  formatCurrency,
  formatDate,
} from "@/lib/validation";

describe("sanitizeInput", () => {
  it("escapes HTML special characters", () => {
    expect(sanitizeInput("<script>alert('xss')</script>")).toBe(
      "&lt;script&gt;alert(&#x27;xss&#x27;)&lt;&#x2F;script&gt;"
    );
  });

  it("escapes quotes", () => {
    expect(sanitizeInput('He said "hello"')).toBe("He said &quot;hello&quot;");
  });

  it("handles ampersands", () => {
    expect(sanitizeInput("a & b")).toBe("a &amp; b");
  });
});

describe("sanitizeHtml", () => {
  it("allows safe tags", () => {
    const input = "<p>Hello <strong>world</strong></p>";
    expect(sanitizeHtml(input)).toBe(input);
  });

  it("removes script tags", () => {
    const input = "<p>Hello</p><script>alert('xss')</script>";
    expect(sanitizeHtml(input)).toBe("<p>Hello</p>");
  });

  it("removes onclick attributes via tag removal", () => {
    const input = '<div onclick="evil()">Content</div>';
    expect(sanitizeHtml(input)).toBe("<div>Content</div>");
  });
});

describe("validateEmail", () => {
  it("accepts valid emails", () => {
    expect(validateEmail("test@example.com")).toBe(true);
    expect(validateEmail("user.name+tag@domain.co.in")).toBe(true);
  });

  it("rejects invalid emails", () => {
    expect(validateEmail("invalid")).toBe(false);
    expect(validateEmail("@domain.com")).toBe(false);
    expect(validateEmail("user@")).toBe(false);
  });
});

describe("validatePhone", () => {
  it("accepts valid phone numbers", () => {
    expect(validatePhone("+91 98765 43210")).toBe(true);
    expect(validatePhone("9876543210")).toBe(true);
  });

  it("rejects invalid phone numbers", () => {
    expect(validatePhone("123")).toBe(false);
    expect(validatePhone("abc")).toBe(false);
  });
});

describe("validateGSTIN", () => {
  it("accepts valid GSTIN", () => {
    expect(validateGSTIN("22AAAAA0000A1Z5")).toBe(true);
    expect(validateGSTIN("29AABCU9603R1ZM")).toBe(true);
  });

  it("rejects invalid GSTIN", () => {
    expect(validateGSTIN("invalid")).toBe(false);
    expect(validateGSTIN("123456789012345")).toBe(false);
  });
});

describe("validatePAN", () => {
  it("accepts valid PAN", () => {
    expect(validatePAN("ABCDE1234F")).toBe(true);
    expect(validatePAN("abcde1234f")).toBe(true);
  });

  it("rejects invalid PAN", () => {
    expect(validatePAN("invalid")).toBe(false);
    expect(validatePAN("1234567890")).toBe(false);
  });
});

describe("truncateText", () => {
  it("truncates long text", () => {
    expect(truncateText("Hello World", 5)).toBe("Hello...");
  });

  it("does not truncate short text", () => {
    expect(truncateText("Hi", 10)).toBe("Hi");
  });

  it("preserves exact length", () => {
    expect(truncateText("Hello", 5)).toBe("Hello");
  });
});

describe("formatCurrency", () => {
  it("formats INR correctly", () => {
    expect(formatCurrency(1000, "INR")).toContain("1,000");
  });

  it("handles zero", () => {
    expect(formatCurrency(0, "INR")).toContain("0");
  });
});

describe("formatDate", () => {
  it("formats date correctly", () => {
    const result = formatDate("2026-05-18");
    expect(result).toContain("2026");
    expect(result).toContain("May");
    expect(result).toContain("18");
  });
});
