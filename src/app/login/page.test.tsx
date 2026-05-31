import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import LoginPage from "./page";

describe("LoginPage", () => {
  test("uses the revised inspiration copy on the login page", async () => {
    render(await LoginPage({ searchParams: Promise.resolve({}) }));

    expect(screen.getByText(/再从历史作品库里获取灵感/)).toBeInTheDocument();
    expect(screen.queryByText(/复盘结果/)).not.toBeInTheDocument();
  });

  test("uses prompt preview copy in the login value list", async () => {
    render(await LoginPage({ searchParams: Promise.resolve({}) }));

    expect(screen.getByText("提示词预览")).toBeInTheDocument();
    expect(screen.getByText("积分账单")).toBeInTheDocument();
    expect(screen.queryByText("中英文预览")).not.toBeInTheDocument();
    expect(screen.queryByText("积分扣减")).not.toBeInTheDocument();
  });

  test("shows a visible signup error from the query string", async () => {
    render(await LoginPage({ searchParams: Promise.resolve({ error: "signup" }) }));

    expect(screen.getByRole("alert")).toHaveTextContent("注册失败");
  });

  test("shows a clear message when Supabase email sending is rate limited", async () => {
    render(await LoginPage({ searchParams: Promise.resolve({ error: "signup-rate-limited" }) }));

    expect(screen.getByRole("alert")).toHaveTextContent("注册邮件发送过于频繁");
  });

  test("requires six characters for the signup password before submitting", async () => {
    render(await LoginPage({ searchParams: Promise.resolve({ mode: "signup" }) }));

    expect(screen.getByLabelText("注册密码")).toHaveAttribute("minlength", "6");
  });

  test("shows signup fields only after choosing create account mode", async () => {
    render(await LoginPage({ searchParams: Promise.resolve({}) }));

    expect(screen.getByRole("button", { name: "登录" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "创建账号" })).toHaveAttribute("href", "/login?mode=signup");
    expect(screen.queryByLabelText("注册邮箱")).not.toBeInTheDocument();
  });

  test("shows the create account form in signup mode", async () => {
    render(await LoginPage({ searchParams: Promise.resolve({ mode: "signup" }) }));

    expect(screen.getByRole("button", { name: "创建账号" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "返回登录" })).toHaveAttribute("href", "/login");
    expect(screen.getByLabelText("注册邮箱")).toBeInTheDocument();
  });
});
