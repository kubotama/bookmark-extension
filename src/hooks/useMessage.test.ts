import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useMessage, createMessage, createErrorMessage } from "./useMessage";

describe("createErrorMessage", () => {
  it.each([
    { error: null, expected: undefined, case: "null" },
    { error: undefined, expected: undefined, case: "undefined" },
    {
      error: new Error("This is an error"),
      expected: "This is an error",
      case: "Error instance",
    },
    {
      error: { code: 500, status: "Internal Server Error" },
      expected: '{"code":500,"status":"Internal Server Error"}',
      case: "object",
    },
    {
      error: "A custom error occurred",
      expected: "A custom error occurred",
      case: "string",
    },
  ])(
    "should return a message with prefix and error message for $case",
    ({ error, expected }) => {
      const prefix = "Test prefix";
      const message = createErrorMessage(prefix, error);
      if (expected === undefined) {
        expect(message.text).toBe(prefix);
      } else {
        expect(message.text).toBe(`${prefix} ${expected}`);
      }
      expect(message.type).toBe("error");
    }
  );

  it("should trim the prefix", () => {
    const prefix = "  Test prefix  ";
    const message = createErrorMessage(prefix, null);

    expect(message.text).toBe(prefix.trim());
  });

  it("should return an empty message when prefix is empty and error is null", () => {
    const message = createErrorMessage("", null);
    expect(message.text).toBe("");
  });

  it("should handle prefix with only whitespace", () => {
    const prefix = "   ";
    const errorMessage = "This is an error";
    const error = new Error(errorMessage);
    const message = createErrorMessage(prefix, error);

    expect(message.text).toBe(errorMessage);
  });
});

describe("useMessage", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("should return isVisible true when a message is provided", () => {
    const message = createMessage("Test message", "info");
    const { result } = renderHook(() => useMessage({ message }));
    expect(result.current.isVisible).toBe(true);
  });

  it("should return isVisible false when no message is provided", () => {
    const { result } = renderHook(() => useMessage({ message: null }));
    expect(result.current.isVisible).toBe(false);
  });

  it("should set isVisible to false after the specified duration", async () => {
    const message = createMessage("Test message", "info");
    const duration = 1000;
    const { result } = renderHook(() => useMessage({ message, duration }));

    expect(result.current.isVisible).toBe(true);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(duration);
    });

    expect(result.current.isVisible).toBe(false);
  });

  it("should reset the timer if the message changes before duration expires", async () => {
    const message1 = createMessage("Message 1", "info");
    const message2 = createMessage("Message 2", "info");
    const duration = 2000;
    const { result, rerender } = renderHook(
      ({ message, duration }) => useMessage({ message, duration }),
      { initialProps: { message: message1, duration } }
    );

    expect(result.current.isVisible).toBe(true);

    // Advance half the duration
    await act(async () => {
      await vi.advanceTimersByTimeAsync(duration / 2);
    });

    // Message changes, timer should reset
    rerender({ message: message2, duration });

    expect(result.current.isVisible).toBe(true);

    // Advance another half duration (total 1 duration from message change)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(duration / 2);
    });

    expect(result.current.isVisible).toBe(true);

    // Advance remaining duration (total 1.5 duration from message change)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(duration / 2);
    });

    expect(result.current.isVisible).toBe(false);
  });

  it("should clear the timer on unmount", () => {
    const clearTimeoutSpy = vi.spyOn(global, "clearTimeout");
    const message = createMessage("Test message", "info");
    const duration = 10000; // Long duration
    const { unmount } = renderHook(() => useMessage({ message, duration }));
    unmount();
    expect(clearTimeoutSpy).toHaveBeenCalled();
  });
});
