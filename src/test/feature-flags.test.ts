import { describe, it, expect } from "vitest";
import { isFeatureEnabled, getAllFlags } from "@/lib/feature-flags";

describe("feature-flags", () => {
  it("returns true for enabled features", () => {
    expect(isFeatureEnabled("ai_document_generation")).toBe(true);
    expect(isFeatureEnabled("dark_mode")).toBe(true);
    expect(isFeatureEnabled("command_palette")).toBe(true);
  });

  it("returns false for disabled features", () => {
    expect(isFeatureEnabled("team_collaboration")).toBe(false);
    expect(isFeatureEnabled("api_access")).toBe(false);
    expect(isFeatureEnabled("multi_language")).toBe(false);
  });

  it("returns all flags", () => {
    const flags = getAllFlags();
    expect(Object.keys(flags).length).toBe(10);
    expect(flags).toHaveProperty("ai_document_generation", true);
    expect(flags).toHaveProperty("team_collaboration", false);
  });
});
