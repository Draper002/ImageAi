import { describe, expect, test } from "vitest";
import { getCopy, normalizeLocale } from "./i18n";

describe("i18n", () => {
  test("defaults to Chinese for unknown locale values", () => {
    expect(normalizeLocale(undefined)).toBe("zh");
    expect(normalizeLocale("fr")).toBe("zh");
    expect(normalizeLocale("zh-CN")).toBe("zh");
  });

  test("treats English browser locale values as English", () => {
    expect(normalizeLocale("en")).toBe("en");
    expect(normalizeLocale("en-US")).toBe("en");
    expect(normalizeLocale("en-GB")).toBe("en");
  });

  test("returns localized page copy", () => {
    expect(getCopy("zh").nav.create).toBe("生成图片");
    expect(getCopy("en").nav.create).toBe("Create");
  });
});
