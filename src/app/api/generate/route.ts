import { NextResponse } from "next/server";
import { reserveGenerationCredit, refundGenerationCredit } from "@/lib/credits";
import { getEnv } from "@/lib/env";
import { generationFailurePayload, messageFromUnknownError } from "@/lib/generation-errors";
import { parseGenerateForm } from "@/lib/generate-form";
import { createOpenAIClient, generateImage } from "@/lib/openai-images";
import { buildPrompt } from "@/lib/prompt-builder";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { buildStoragePath, uploadPrivateFile } from "@/lib/storage";

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const admin = createSupabaseAdminClient();
  const env = getEnv();

  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let parsed: Awaited<ReturnType<typeof parseGenerateForm>>;
  try {
    parsed = await parseGenerateForm(await request.formData());
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid request" }, { status: 400 });
  }

  const prompt = buildPrompt(parsed);
  const generationId = crypto.randomUUID();

  const { error: insertError } = await admin.from("generations").insert({
    id: generationId,
    user_id: user.id,
    status: "processing",
    subject: parsed.subject,
    image_type: parsed.imageType,
    aspect_ratio: parsed.aspectRatio,
    style: parsed.style,
    scene: parsed.scene,
    whitespace: parsed.whitespace,
    additional_requirements: parsed.additionalRequirements,
    locale: parsed.locale,
    prompt_preview_zh: prompt.promptPreviewZh,
    prompt_preview_en: prompt.promptPreviewEn,
    submitted_prompt: prompt.submittedPrompt
  });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  const reserved = await reserveGenerationCredit(admin, user.id, generationId);
  if (!reserved) {
    await admin.from("generations").update({ status: "failed", error_message: "Insufficient credits" }).eq("id", generationId);
    return NextResponse.json({ error: "Insufficient credits" }, { status: 402 });
  }

  try {
    let referencePath: string | undefined;
    if (parsed.referenceImage) {
      referencePath = buildStoragePath(user.id, generationId, parsed.referenceImage.name);
      await uploadPrivateFile(admin, "reference-images", referencePath, parsed.referenceImage, parsed.referenceImage.type);
    }

    const openai = createOpenAIClient(env.OPENAI_API_KEY);
    const imageBytes = await generateImage({
      client: openai,
      model: env.OPENAI_IMAGE_MODEL,
      prompt: prompt.submittedPrompt,
      aspectRatio: parsed.aspectRatio ?? "1:1",
      referenceImage: parsed.referenceImage
    });

    const generatedPath = buildStoragePath(user.id, generationId, "generated.png");
    const imageArrayBuffer = imageBytes.buffer.slice(
      imageBytes.byteOffset,
      imageBytes.byteOffset + imageBytes.byteLength
    ) as ArrayBuffer;
    await uploadPrivateFile(admin, "generated-images", generatedPath, new Blob([imageArrayBuffer], { type: "image/png" }), "image/png");

    await admin.from("generations").update({
      status: "succeeded",
      reference_image_path: referencePath,
      generated_image_path: generatedPath,
      updated_at: new Date().toISOString()
    }).eq("id", generationId);

    const signed = await admin.storage.from("generated-images").createSignedUrl(generatedPath, 60 * 10);
    return NextResponse.json({
      id: generationId,
      imageUrl: signed.data?.signedUrl ?? null,
      status: "succeeded"
    });
  } catch (error) {
    const failure = generationFailurePayload(error);
    await refundGenerationCredit(admin, user.id, generationId);
    await admin.from("generations").update({
      status: "failed",
      error_message: messageFromUnknownError(error),
      updated_at: new Date().toISOString()
    }).eq("id", generationId);

    return NextResponse.json(failure, { status: 500 });
  }
}
