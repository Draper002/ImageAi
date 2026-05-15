import type { Locale } from "@/lib/presets";

export type GenerationInput = {
  locale: Locale;
  subject: string;
  imageType?: string;
  aspectRatio?: string;
  style?: string;
  scene?: string;
  whitespace?: string;
  additionalRequirements?: string;
  hasReferenceImage?: boolean;
};

export type PromptResult = {
  promptPreviewZh: string;
  promptPreviewEn: string;
  submittedPrompt: string;
};

export type GenerationStatus = "processing" | "succeeded" | "failed";
