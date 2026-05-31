import OpenAI from "openai";
import { HttpsProxyAgent } from "https-proxy-agent";

type ImageResponse = {
  data?: Array<{ b64_json?: string | null }>;
};

type OpenAIImageClient = {
  images: {
    generate: (args: Record<string, unknown>) => Promise<ImageResponse>;
    edit: (args: Record<string, unknown>) => Promise<ImageResponse>;
  };
};

type GenerateImageArgs = {
  client: OpenAIImageClient;
  model: string;
  prompt: string;
  aspectRatio: string;
  referenceImage?: File;
};

type ProxyEnv = NodeJS.ProcessEnv | Record<string, string | undefined>;

function sizeForAspectRatio(aspectRatio: string): "1024x1024" | "1536x1024" | "1024x1536" {
  if (aspectRatio === "16:9" || aspectRatio === "3:2") return "1536x1024";
  if (aspectRatio === "9:16" || aspectRatio === "4:5") return "1024x1536";
  return "1024x1024";
}

function decodeImage(data: ImageResponse["data"]): Buffer {
  const b64Json = data?.[0]?.b64_json;
  if (!b64Json) {
    throw new Error("OpenAI did not return image data.");
  }
  return Buffer.from(b64Json, "base64");
}

export async function generateImage(args: GenerateImageArgs): Promise<Buffer> {
  const size = sizeForAspectRatio(args.aspectRatio);

  if (args.referenceImage) {
    const response = await args.client.images.edit({
      model: args.model,
      image: args.referenceImage,
      prompt: args.prompt,
      size
    });
    return decodeImage(response.data);
  }

  const response = await args.client.images.generate({
    model: args.model,
    prompt: args.prompt,
    size
  });
  return decodeImage(response.data);
}

export function resolveOpenAIProxyUrl(source: ProxyEnv = process.env): string | undefined {
  return source.OPENAI_PROXY_URL || source.HTTPS_PROXY || source.HTTP_PROXY || undefined;
}

export function createOpenAIClient(apiKey: string): OpenAIImageClient {
  const proxyUrl = resolveOpenAIProxyUrl();

  return new OpenAI({
    apiKey,
    ...(proxyUrl ? { httpAgent: new HttpsProxyAgent(proxyUrl) } : {})
  }) as unknown as OpenAIImageClient;
}
