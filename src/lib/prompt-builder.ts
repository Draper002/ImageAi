import type { GenerationInput, PromptResult } from "@/types/generation";
import { getPresetLabel } from "./presets";

function clean(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export function buildPrompt(input: GenerationInput): PromptResult {
  const subject = clean(input.subject);
  if (!subject) {
    throw new Error("Subject is required");
  }

  const aspectRatio = input.aspectRatio ?? "1:1";
  const zhType = getPresetLabel("imageTypes", input.imageType ?? "general", "zh") ?? "通用高质量图片";
  const enType = getPresetLabel("imageTypes", input.imageType ?? "general", "en") ?? "General high-quality image";
  const zhStyle = getPresetLabel("styles", input.style, "zh") ?? "清晰、高质量、有视觉吸引力";
  const enStyle = getPresetLabel("styles", input.style, "en") ?? "Clean, high-quality, visually appealing";
  const zhScene = getPresetLabel("scenes", input.scene, "zh");
  const enScene = getPresetLabel("scenes", input.scene, "en");
  const zhWhitespace = getPresetLabel("whitespaceOptions", input.whitespace, "zh");
  const enWhitespace = getPresetLabel("whitespaceOptions", input.whitespace, "en");
  const additional = clean(input.additionalRequirements);

  const zhLines = [
    "请生成一张高质量图片。",
    `主体：${subject}`,
    `图片类型：${zhType}`,
    `画面比例：${aspectRatio}`,
    `视觉风格：${zhStyle}`,
    zhScene ? `场景：${zhScene}` : undefined,
    zhWhitespace ? `构图要求：${zhWhitespace}` : undefined,
    additional ? `补充要求：${additional}` : undefined,
    input.hasReferenceImage ? "请参考上传图片的主体、构图或风格，同时遵守以上要求。" : undefined,
    "避免无意义文字、水印、低清细节和明显畸形。"
  ].filter(Boolean);

  const enLines = [
    "Create a high-quality image.",
    `Subject: ${subject}`,
    `Image type: ${enType}`,
    `Aspect ratio: ${aspectRatio}`,
    `Visual style: ${enStyle}`,
    enScene ? `Scene: ${enScene}` : undefined,
    enWhitespace ? `Composition requirement: ${enWhitespace}` : undefined,
    additional ? `Additional requirements: ${additional}` : undefined,
    input.hasReferenceImage ? "Use the uploaded image as visual reference while following the prompt." : undefined,
    "Avoid meaningless text, watermarks, low-resolution details, and obvious distortions."
  ].filter(Boolean);

  return {
    promptPreviewZh: zhLines.join("\n"),
    promptPreviewEn: enLines.join("\n"),
    submittedPrompt: input.locale === "en" ? enLines.join("\n") : zhLines.join("\n")
  };
}
