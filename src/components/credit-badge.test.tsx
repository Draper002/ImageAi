import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { CreditBadge } from "./credit-badge";

describe("CreditBadge", () => {
  test("renders English copy when locale is English", () => {
    render(<CreditBadge credits={2} locale="en" />);

    expect(screen.getByText("Current credits")).toBeInTheDocument();
    expect(screen.getByText("Each image costs 1 credit")).toBeInTheDocument();
    expect(screen.queryByText("当前积分")).not.toBeInTheDocument();
  });
});
