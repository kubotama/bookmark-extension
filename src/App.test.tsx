import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import App from "./App.tsx";

describe("Popup", () => {
  it("renders correctly", () => {
    render(<App />);
    expect(screen.getByText("Vite + React")).toBeInTheDocument();
  });
});
