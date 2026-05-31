import { describe, expect, test, vi } from "vitest";
import { generateImage, resolveOpenAIProxyUrl } from "./openai-images";

describe("generateImage", () => {
  test("uses text generation when no reference image exists", async () => {
    const generate = vi.fn().mockResolvedValue({ data: [{ b64_json: "aGVsbG8=" }] });
    const edit = vi.fn();

    const bytes = await generateImage({
      client: { images: { generate, edit } },
      model: "gpt-image-2",
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
      model: "gpt-image-2",
      prompt: "Create image",
      aspectRatio: "16:9",
      referenceImage: new File(["image"], "ref.png", { type: "image/png" })
    });

    expect(edit).toHaveBeenCalled();
    expect(generate).not.toHaveBeenCalled();
  });

  test("resolves an optional OpenAI proxy URL", () => {
    expect(resolveOpenAIProxyUrl({
      HTTP_PROXY: "http://127.0.0.1:1080",
      HTTPS_PROXY: "http://127.0.0.1:7890",
      OPENAI_PROXY_URL: "http://127.0.0.1:7897"
    })).toBe("http://127.0.0.1:7897");

    expect(resolveOpenAIProxyUrl({
      HTTPS_PROXY: "http://127.0.0.1:7890"
    })).toBe("http://127.0.0.1:7890");

    expect(resolveOpenAIProxyUrl({})).toBeUndefined();
  });
});
