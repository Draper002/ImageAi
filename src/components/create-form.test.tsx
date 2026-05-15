import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { CreateForm } from "./create-form";

describe("CreateForm", () => {
  test("renders subject as required and optional controls as optional", () => {
    render(<CreateForm locale="zh" credits={2} />);

    expect(screen.getByText("1. 描述主体")).toBeInTheDocument();
    expect(screen.getByText("必填")).toBeInTheDocument();
    expect(screen.getByText("2. 可选参数")).toBeInTheDocument();
    expect(screen.getAllByText("可选").length).toBeGreaterThan(0);
    expect(screen.getByText("中文预览")).toBeInTheDocument();
    expect(screen.getByText("实际提交内容")).toBeInTheDocument();
  });
});
