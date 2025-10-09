import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import Options from "./Options";

describe("Options", () => {
  // chrome.storage.localのモック
  const mockGet = vi.fn();
  const mockSet = vi.fn();

  beforeEach(() => {
    global.chrome = {
      storage: {
        local: {
          get: mockGet.mockImplementation((_keys, callback) => {
            callback({}); // デフォルトでは空のオブジェクトを返す
          }),
          set: mockSet.mockImplementation((_items, callback) => {
            callback();
          }),
        },
      },
    } as never;

    // window.alertのモック
    vi.spyOn(window, "alert").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders correctly", () => {
    render(<Options />);
    expect(
      screen.getByRole("heading", { name: "オプション" })
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("ブックマークするURL")
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "保存" })).toBeInTheDocument();
  });

  it("loads and displays the saved URL on mount", async () => {
    const savedUrl = "https://example.com/saved";
    mockGet.mockImplementation((_keys, callback) => {
      callback({ bookmarkUrl: savedUrl });
    });

    render(<Options />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText("ブックマークするURL")).toHaveValue(
        savedUrl
      );
    });

    expect(mockGet).toHaveBeenCalledWith("bookmarkUrl", expect.any(Function));
  });

  it("updates the input value on change", () => {
    render(<Options />);
    const input = screen.getByPlaceholderText("ブックマークするURL");
    const newUrl = "https://example.com/new";

    fireEvent.change(input, { target: { value: newUrl } });

    expect(input).toHaveValue(newUrl);
  });

  it("saves the URL to storage when the save button is clicked", async () => {
    render(<Options />);
    const input = screen.getByPlaceholderText("ブックマークするURL");
    const button = screen.getByRole("button", { name: "保存" });
    const newUrl = "https://example.com/new";

    fireEvent.change(input, { target: { value: newUrl } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockSet).toHaveBeenCalledWith(
        { bookmarkUrl: newUrl },
        expect.any(Function)
      );
    });
  });

  it("does not save if the URL is empty", () => {
    render(<Options />);
    const button = screen.getByRole("button", { name: "保存" });

    fireEvent.click(button);

    expect(mockSet).not.toHaveBeenCalled();
    expect(window.alert).not.toHaveBeenCalled();
  });
});
