import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Popup from "./Popup";

describe("Popup", () => {
  it("renders correctly", () => {
    render(<Popup />);
    expect(screen.getByText("Bookmark Extension Popup")).toBeInTheDocument();
  });
});
