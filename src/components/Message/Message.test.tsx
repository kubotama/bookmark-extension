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
    const message = {
      text: "This is a test message",
      type: "success" as const,
    };
    render(<Message message={message} duration={3000} />);

    expect(screen.getByText("This is a test message")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(
      screen.queryByText("This is a test message")
    ).not.toBeInTheDocument();
  });

  it("should not hide the message if no duration is specified", () => {
    const message = {
      text: "This is a test message",
      type: "success" as const,
    };
    render(<Message message={message} />);

    expect(screen.getByText("This is a test message")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(screen.getByText("This is a test message")).toBeInTheDocument();
  });

  it("should reset timer when a new message is received", () => {
    const message1 = { text: "First message", type: "success" as const };
    const { rerender } = render(<Message message={message1} duration={3000} />);

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    // 2秒後に新しいメッセージで再レンダリング
    const message2 = { text: "Second message", type: "success" as const };
    rerender(<Message message={message2} duration={3000} />);

    expect(screen.getByText("Second message")).toBeInTheDocument();

    // さらに2秒経過（2番目のメッセージが表示されてから2秒）
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    // 2番目のメッセージはまだ表示されているはず
    expect(screen.getByText("Second message")).toBeInTheDocument();

    // さらに1秒経過（2番目のメッセージが表示されてから合計3秒）
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // 2番目のメッセージが非表示になる
    expect(screen.queryByText("Second message")).not.toBeInTheDocument();
  });
});
