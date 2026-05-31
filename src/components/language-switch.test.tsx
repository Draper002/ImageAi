import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { LanguageSwitch } from "./language-switch";

describe("LanguageSwitch", () => {
  test("opens a language menu with English and Chinese choices", () => {
    render(<LanguageSwitch locale="zh" />);

    const menu = screen.getByTestId("language-menu");
    expect(menu).not.toHaveAttribute("open");

    fireEvent.click(screen.getByText("语言"));

    expect(menu).toHaveAttribute("open");
    expect(screen.getByRole("link", { name: "English" })).toHaveAttribute("href", "?locale=en");
    expect(screen.getByRole("link", { name: "中文" })).toHaveAttribute("href", "?locale=zh");
  });

  test("builds language links for the current page path", () => {
    render(<LanguageSwitch locale="zh" path="/create" />);

    expect(screen.getByRole("link", { name: "English" })).toHaveAttribute("href", "/create?locale=en");
    expect(screen.getByRole("link", { name: "中文" })).toHaveAttribute("href", "/create?locale=zh");
  });
});
