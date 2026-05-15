import { describe, expect, test } from "vitest";
import { buildStoragePath, validateReferenceFile } from "./storage";

describe("storage helpers", () => {
  test("builds deterministic user-scoped storage path", () => {
    expect(buildStoragePath("user-1", "gen-1", "image.png")).toMatch(/^user-1\/gen-1\/\d+-image\.png$/);
  });

  test("validates reference image type and size", () => {
    const file = new File(["x"], "ref.png", { type: "image/png" });
    expect(validateReferenceFile(file)).toEqual({ ok: true });

    const bad = new File(["x"], "ref.gif", { type: "image/gif" });
    expect(validateReferenceFile(bad)).toEqual({ ok: false, message: "Reference image must be JPEG, PNG, or WebP." });
  });
});
