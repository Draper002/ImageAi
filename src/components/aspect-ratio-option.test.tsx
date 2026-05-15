import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { AspectRatioOption } from "./aspect-ratio-option";

describe("AspectRatioOption", () => {
  test("renders numeric ratio and accessible visual shape", () => {
    render(<AspectRatioOption value="16:9" label="16:9" shape="wide" selected={true} />);

    expect(screen.getByText("16:9")).toBeInTheDocument();
    expect(screen.getByLabelText("16:9 aspect ratio preview")).toHaveAttribute("data-shape", "wide");
  });
});
