import { validateReferenceFile } from "@/lib/storage";
import type { GenerationInput } from "@/types/generation";

export async function parseGenerateForm(form: FormData): Promise<GenerationInput & { referenceImage?: File }> {
  const subject = String(form.get("subject") ?? "").trim();
  if (!subject) throw new Error("Subject is required");

  const reference = form.get("referenceImage");
  const referenceImage = reference instanceof File && reference.size > 0 ? reference : undefined;
  if (referenceImage) {
    const validation = validateReferenceFile(referenceImage);
    if (!validation.ok) throw new Error(validation.message);
  }

  return {
    locale: form.get("locale") === "en" ? "en" : "zh",
    subject,
    imageType: String(form.get("imageType") ?? "general"),
    aspectRatio: String(form.get("aspectRatio") ?? "1:1"),
    style: String(form.get("style") ?? "") || undefined,
    scene: String(form.get("scene") ?? "") || undefined,
    whitespace: String(form.get("whitespace") ?? "") || undefined,
    additionalRequirements: String(form.get("additionalRequirements") ?? "") || undefined,
    hasReferenceImage: Boolean(referenceImage),
    referenceImage
  };
}
