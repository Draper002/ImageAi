import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { AccountMenu } from "./account-menu";

describe("AccountMenu", () => {
  test("shows account details and sign out action in a floating account menu", () => {
    const { container } = render(<AccountMenu email="tester@example.com" credits={2} />);

    expect(screen.getAllByText("tester@example.com").length).toBeGreaterThan(0);
    expect(screen.getByText("2 积分")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "充值积分" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "退出登录" })).toBeInTheDocument();
    expect(container.querySelector(".account-menu")).toHaveClass("account-menu-floating");
    expect(container.querySelector(".account-menu")).not.toHaveClass("account-menu-sidebar");

    fireEvent.click(screen.getByRole("button", { name: "充值积分" }));
    expect(screen.getByRole("dialog", { name: "充值积分" })).toBeInTheDocument();
  });

  test("localizes the floating account menu and includes an open-state icon", () => {
    const { container } = render(<AccountMenu email="crazydraper@gmail.com" credits={2} locale="en" />);

    expect(screen.getByText("Current account")).toBeInTheDocument();
    expect(screen.getByText("2 credits")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Account/ })).toHaveAttribute("href", "/account?locale=en");
    expect(screen.getByRole("link", { name: /Create page/ })).toHaveAttribute("href", "/create?locale=en");
    expect(screen.getByRole("link", { name: /Generation history/ })).toHaveAttribute("href", "/history?locale=en");
    expect(screen.getByRole("button", { name: "Recharge credits" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign out" })).toBeInTheDocument();
    expect(container.querySelector(".avatar-close")).toBeInTheDocument();
  });

  test("can render inside the create sidebar instead of the viewport corner", () => {
    const { container } = render(<AccountMenu email="tester@example.com" credits={2} placement="sidebar" />);

    expect(container.querySelector(".account-menu")).toHaveClass("account-menu-sidebar");
    expect(container.querySelector(".account-menu")).not.toHaveClass("account-menu-floating");
  });
});
