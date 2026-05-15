import { describe, expect, test } from "vitest";
import { buildPrompt } from "./prompt-builder";

describe("buildPrompt", () => {
  test("requires a non-empty subject", () => {
    expect(() => buildPrompt({ subject: "  ", locale: "zh" })).toThrow("Subject is required");
  });

  test("preserves Chinese user input in the submitted prompt", () => {
    const result = buildPrompt({
      locale: "zh",
      subject: "一只穿着宇航服的橘猫",
      aspectRatio: "16:9",
      style: "cinematic",
      whitespace: "right",
      additionalRequirements: "不要出现水印"
    });

    expect(result.submittedPrompt).toContain("一只穿着宇航服的橘猫");
    expect(result.submittedPrompt).toContain("不要出现水印");
    expect(result.submittedPrompt).toContain("画面比例：16:9");
    expect(result.promptPreviewZh).toContain("右侧留白");
    expect(result.promptPreviewEn).toContain("Right whitespace");
  });

  test("adds reference image guidance when a reference image exists", () => {
    const result = buildPrompt({
      locale: "en",
      subject: "a red running shoe",
      hasReferenceImage: true
    });

    expect(result.submittedPrompt).toContain("Use the uploaded image as visual reference");
  });
});
