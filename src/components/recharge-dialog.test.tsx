import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { RechargeButton } from "./recharge-dialog";

describe("RechargeButton", () => {
  test("opens a recharge dialog with point and monthly options", () => {
    render(<RechargeButton />);

    fireEvent.click(screen.getByRole("button", { name: "充值积分" }));

    expect(screen.getByRole("dialog", { name: "充值积分" })).toBeInTheDocument();
    expect(screen.getByText("1元1积分")).toBeInTheDocument();
    expect(screen.getByText("30元/月（内含50积分）")).toBeInTheDocument();
    expect(screen.getByLabelText("积分数量")).toHaveValue(10);
    expect(screen.getByRole("button", { name: /按量充值/ })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: /月度方案/ })).toHaveAttribute("aria-pressed", "false");

    fireEvent.change(screen.getByLabelText("积分数量"), { target: { value: "20" } });
    expect(screen.getByText("应付金额：20 元")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /月度方案/ }));
    expect(screen.getByRole("button", { name: /按量充值/ })).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("button", { name: /月度方案/ })).toHaveAttribute("aria-pressed", "true");
    expect(screen.queryByLabelText("积分数量")).not.toBeInTheDocument();
  });

  test("renders English recharge copy", () => {
    render(<RechargeButton locale="en" />);

    fireEvent.click(screen.getByRole("button", { name: "Recharge credits" }));

    expect(screen.getByRole("dialog", { name: "Recharge credits" })).toBeInTheDocument();
    expect(screen.getByText("1 yuan / credit")).toBeInTheDocument();
    expect(screen.getByText("30 yuan / month, includes 50 credits")).toBeInTheDocument();
    expect(screen.getByLabelText("Credit quantity")).toHaveValue(10);
    expect(screen.getByRole("button", { name: /Pay-as-you-go/ })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: /Monthly plan/ })).toHaveAttribute("aria-pressed", "false");
  });
});
