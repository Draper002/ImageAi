import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import LoginPage from "./page";

describe("LoginPage", () => {
  test("shows a visible signup error from the query string", async () => {
    render(await LoginPage({ searchParams: Promise.resolve({ error: "signup" }) }));

    expect(screen.getByRole("alert")).toHaveTextContent("注册失败");
  });

  test("shows a clear message when Supabase email sending is rate limited", async () => {
    render(await LoginPage({ searchParams: Promise.resolve({ error: "signup-rate-limited" }) }));

    expect(screen.getByRole("alert")).toHaveTextContent("注册邮件发送过于频繁");
  });

  test("requires six characters for the signup password before submitting", async () => {
    render(await LoginPage({ searchParams: Promise.resolve({}) }));

    expect(screen.getByLabelText("注册密码")).toHaveAttribute("minlength", "6");
  });
});
