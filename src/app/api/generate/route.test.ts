import { describe, expect, test } from "vitest";
import { parseGenerateForm } from "@/lib/generate-form";

describe("parseGenerateForm", () => {
  test("requires subject", async () => {
    const form = new FormData();
    await expect(parseGenerateForm(form)).rejects.toThrow("Subject is required");
  });

  test("accepts subject-only generation input", async () => {
    const form = new FormData();
    form.set("subject", "一杯冰美式");

    const input = await parseGenerateForm(form);

    expect(input.subject).toBe("一杯冰美式");
    expect(input.locale).toBe("zh");
    expect(input.aspectRatio).toBe("1:1");
  });
});
