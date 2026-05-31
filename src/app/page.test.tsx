import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import HomePage from "./page";

describe("HomePage", () => {
  test("renders the hero prompt example in Chinese by default", async () => {
    render(await HomePage({ searchParams: Promise.resolve({}) }));

    expect(screen.getByText("提示词组合")).toBeInTheDocument();
    expect(screen.getByText(/生成一张高端商品图/)).toBeInTheDocument();
    expect(screen.getByText(/整理成专业prompt，并交给最先进的 GPT Image-2/)).toBeInTheDocument();
    expect(screen.getByText(/最先进的 GPT Image-2 生成图片/)).toBeInTheDocument();
    expect(screen.queryByText(/专业英文 prompt/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Create a premium product image/)).not.toBeInTheDocument();
  });

  test("renders the hero prompt example in English when locale is English", async () => {
    render(await HomePage({ searchParams: Promise.resolve({ locale: "en" }) }));

    expect(screen.getByText("Prompt stack")).toBeInTheDocument();
    expect(screen.getByText(/Create a premium product image/)).toBeInTheDocument();
  });
});
