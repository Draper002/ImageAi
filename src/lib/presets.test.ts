import { describe, expect, test } from "vitest";
import { aspectRatios, getPresetLabel } from "./presets";

describe("presets", () => {
  test("aspect ratios include numeric labels and icon shapes", () => {
    expect(aspectRatios).toEqual([
      { value: "1:1", label: "1:1", shape: "square" },
      { value: "4:5", label: "4:5", shape: "portrait" },
      { value: "16:9", label: "16:9", shape: "wide" },
      { value: "9:16", label: "9:16", shape: "tall" },
      { value: "3:2", label: "3:2", shape: "landscape" }
    ]);
  });

  test("returns Chinese and English labels for image type presets", () => {
    expect(getPresetLabel("imageTypes", "social_cover", "zh")).toBe("社媒封面");
    expect(getPresetLabel("imageTypes", "social_cover", "en")).toBe("Social cover");
  });
});
