// @vitest-environment node

import { NextRequest } from "next/server";
import { afterEach, describe, expect, test } from "vitest";
import { middleware } from "./middleware";

const supabaseKeys = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"] as const;

describe("middleware", () => {
  const originalValues = Object.fromEntries(supabaseKeys.map((key) => [key, process.env[key]]));

  afterEach(() => {
    supabaseKeys.forEach((key) => {
      const originalValue = originalValues[key];
      if (originalValue) {
        process.env[key] = originalValue;
      } else {
        delete process.env[key];
      }
    });
  });

  test("allows public pages to load when Supabase public config is missing", async () => {
    supabaseKeys.forEach((key) => delete process.env[key]);

    const request = new NextRequest("http://localhost:3000/");
    const response = await middleware(request);

    expect(response.status).toBe(200);
  });
});
