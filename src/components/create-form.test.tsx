import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { CreateForm } from "./create-form";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("CreateForm", () => {
  test("renders subject as required and optional controls as optional", () => {
    const { container } = render(<CreateForm locale="zh" credits={2} />);

    expect(container.querySelector(".create-studio")).toBeInTheDocument();
    expect(container.querySelector(".create-controls")).toBeInTheDocument();
    expect(container.querySelector(".create-output")).toBeInTheDocument();
    expect(screen.getByText("1. 描述主体")).toBeInTheDocument();
    expect(screen.getByText("必填")).toBeInTheDocument();
    expect(screen.getByText("2. 可选参数")).toBeInTheDocument();
    expect(screen.getAllByText("可选").length).toBeGreaterThan(0);
    expect(screen.getByText("当前提示词预览")).toBeInTheDocument();
    expect(screen.getByText("实际提交给模型的提示词")).toBeInTheDocument();
    expect(screen.getByText("生成进展")).toBeInTheDocument();

    const submitButton = screen.getByRole("button", { name: "生成图片" });
    expect(container.querySelector(".create-controls")).toContainElement(submitButton);
    expect(container.querySelector(".create-output")).not.toContainElement(submitButton);
  });

  test("shows one current-language prompt preview instead of bilingual previews", () => {
    render(<CreateForm locale="en" credits={2} />);

    expect(screen.getByText("Current prompt preview")).toBeInTheDocument();
    expect(screen.queryByText("English reference")).not.toBeInTheDocument();
    expect(screen.getByText("Actual prompt sent to the model")).toBeInTheDocument();
    expect(screen.getByTestId("current-prompt-preview")).toHaveTextContent("Subject: An orange cat in an astronaut suit");
    expect(screen.getByTestId("current-prompt-preview")).not.toHaveTextContent("主体：");
    expect(screen.getByTestId("submitted-prompt-preview")).toHaveTextContent("Subject: An orange cat in an astronaut suit");
  });

  test("uses a compact desktop layout for reference details and generation", () => {
    const { container } = render(<CreateForm locale="zh" credits={2} />);

    expect(container.querySelector(".create-studio-compact")).toBeInTheDocument();
    expect(container.querySelector(".reference-fields")).toContainElement(screen.getByLabelText("补充要求，例如：不要出现乱码文字、水印或低清细节。"));
    expect(container.querySelector(".reference-fields")).toContainElement(screen.getByText("上传参考图，可选"));
    expect(screen.getByRole("button", { name: "生成图片" })).toHaveClass("compact-submit");
  });

  test("uses a balanced desktop layout so controls and output can share the same bottom edge", () => {
    const { container } = render(<CreateForm locale="zh" credits={2} />);
    const generationPanel = container.querySelector<HTMLElement>(".generation-panel");
    const generationBody = container.querySelector<HTMLElement>(".generation-panel-body");

    expect(container.querySelector(".create-studio-balanced")).toBeInTheDocument();
    expect(container.querySelector(".create-output-balanced")).toBeInTheDocument();
    expect(generationPanel).toBeInTheDocument();
    expect(generationBody).toBeInTheDocument();
    expect(generationPanel).toContainElement(generationBody);
    expect(container.querySelector(".create-controls")).toContainElement(container.querySelector<HTMLElement>(".create-submit-row"));
  });

  test("allows selected optional controls to be clicked again and cleared", () => {
    render(<CreateForm locale="zh" credits={2} />);

    const imageType = screen.getByLabelText("通用图片");
    expect(imageType).toBeChecked();
    fireEvent.click(imageType);
    expect(imageType).not.toBeChecked();

    const aspectRatio = screen.getByLabelText("1:1");
    expect(aspectRatio).toBeChecked();
    fireEvent.click(aspectRatio);
    expect(aspectRatio).not.toBeChecked();

    const style = screen.getByLabelText("真实摄影");
    fireEvent.click(style);
    expect(style).toBeChecked();
    fireEvent.click(style);
    expect(style).not.toBeChecked();
  });

  test("submits generation in place and shows API errors", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ error: "Generation failed" })
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<CreateForm locale="zh" credits={2} />);

    fireEvent.change(screen.getByRole("textbox", { name: "主体，例如：一只穿着宇航服的橘猫，站在月球咖啡馆门口" }), { target: { value: "一只猫" } });
    fireEvent.click(screen.getByRole("button", { name: "生成图片" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith("/api/generate", expect.objectContaining({
        method: "POST",
        body: expect.any(FormData)
      }));
    });
    expect(await screen.findByRole("alert")).toHaveTextContent("生成失败");
    expect(screen.getByRole("button", { name: "生成图片" })).toBeEnabled();
  });

  test("shows the generated image when the API returns an image URL", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: "generation-1",
        imageUrl: "https://example.com/generated.png",
        status: "succeeded"
      })
    }));

    render(<CreateForm locale="zh" credits={2} />);

    fireEvent.change(screen.getByRole("textbox", { name: "主体，例如：一只穿着宇航服的橘猫，站在月球咖啡馆门口" }), { target: { value: "一只猫" } });
    fireEvent.click(screen.getByRole("button", { name: "生成图片" }));

    expect(await screen.findByRole("status")).toHaveTextContent("生成成功");
    expect(screen.getByRole("img", { name: "生成结果" })).toHaveAttribute("src", "https://example.com/generated.png");
  });
});
