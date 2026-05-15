import { describe, expect, test, vi } from "vitest";
import { generateImage } from "./openai-images";

describe("generateImage", () => {
  test("uses text generation when no reference image exists", async () => {
    const generate = vi.fn().mockResolvedValue({ data: [{ b64_json: "aGVsbG8=" }] });
    const edit = vi.fn();

    const bytes = await generateImage({
      client: { images: { generate, edit } },
      model: "gpt-image-1",
      prompt: "生成一张图片",
      aspectRatio: "1:1"
    });

    expect(generate).toHaveBeenCalled();
    expect(edit).not.toHaveBeenCalled();
    expect(bytes.toString("utf8")).toBe("hello");
  });

  test("uses edit flow when reference image exists", async () => {
    const generate = vi.fn();
    const edit = vi.fn().mockResolvedValue({ data: [{ b64_json: "aGVsbG8=" }] });

    await generateImage({
      client: { images: { generate, edit } },
      model: "gpt-image-1",
      prompt: "Create image",
      aspectRatio: "16:9",
      referenceImage: new File(["image"], "ref.png", { type: "image/png" })
    });

    expect(edit).toHaveBeenCalled();
    expect(generate).not.toHaveBeenCalled();
  });
});
