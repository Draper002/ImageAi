import { describe, expect, test } from "vitest";
import { hasSupabasePublicConfig, parseEnv } from "./env";

describe("parseEnv", () => {
  test("returns typed environment values when all required keys exist", () => {
    const result = parseEnv({
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon",
      SUPABASE_SERVICE_ROLE_KEY: "service",
      OPENAI_API_KEY: "openai",
      OPENAI_IMAGE_MODEL: "gpt-image-2",
      NEXT_PUBLIC_APP_URL: "https://app.example.com"
    });

    expect(result.OPENAI_IMAGE_MODEL).toBe("gpt-image-2");
    expect(result.NEXT_PUBLIC_APP_URL).toBe("https://app.example.com");
  });

  test("throws a useful error when a required key is missing", () => {
    expect(() => parseEnv({})).toThrow("Missing environment variable: NEXT_PUBLIC_SUPABASE_URL");
  });

  test("detects missing Supabase public config", () => {
    expect(hasSupabasePublicConfig({})).toBe(false);
  });

  test("detects present Supabase public config", () => {
    expect(hasSupabasePublicConfig({
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon"
    })).toBe(true);
  });
});
