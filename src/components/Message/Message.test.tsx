import { render, screen, act } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import Message from "./Message";

describe("Message", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should hide the message after the specified duration", () => {
    const message = { text: "This is a test message", type: "success" as const };
    render(<Message message={message} duration={3000} />);

    expect(screen.getByText("This is a test message")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(screen.queryByText("This is a test message")).not.toBeInTheDocument();
  });

  it("should not hide the message if no duration is specified", () => {
    const message = { text: "This is a test message", type: "success" as const };
    render(<Message message={message} />);

    expect(screen.getByText("This is a test message")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(screen.getByText("This is a test message")).toBeInTheDocument();
  });
});
