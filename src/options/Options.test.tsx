import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import Options from "./Options";
import { STORAGE_KEY_BOOKMARK_URL } from "../constants/constants";

describe("Options", () => {
  const URL_PLACEHOLDER = "ブックマークするURL";
  const SAVE_BUTTON_NAME = "保存";

  // chrome.storage.localのモック
  const mockGet = vi.fn();
  const mockSet = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("chrome", {
      storage: {
        local: {
          get: mockGet,
          set: mockSet.mockImplementation((_data, callback) => callback()),
        },
      },
    });

    // モックされた get のデフォルトの動作を設定
    mockGet.mockImplementation((_keys, callback) => {
      const result = {
        [STORAGE_KEY_BOOKMARK_URL]: "https://example.com/saved",
      };
      callback(result);
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders the options page", () => {
    render(<Options />);
    expect(
      screen.getByRole("heading", { name: "オプション" })
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText(URL_PLACEHOLDER)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: SAVE_BUTTON_NAME })
    ).toBeInTheDocument();
  });

  it("loads and displays the saved URL on mount", async () => {
    const savedUrl = "https://example.com/saved";
    mockGet.mockImplementation((_keys, callback) => {
      callback({ [STORAGE_KEY_BOOKMARK_URL]: savedUrl });
    });

    render(<Options />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(URL_PLACEHOLDER)).toHaveValue(
        savedUrl
      );
    });

    expect(mockGet).toHaveBeenCalledWith(
      STORAGE_KEY_BOOKMARK_URL,
      expect.any(Function)
    );
  });

  it("updates the input value on change", () => {
    render(<Options />);
    const input = screen.getByPlaceholderText(URL_PLACEHOLDER);
    const newUrl = "https://example.com/new";

    fireEvent.change(input, { target: { value: newUrl } });

    expect(input).toHaveValue(newUrl);
  });

  it("saves the URL to storage when the save button is clicked", async () => {
    render(<Options />);
    const input = screen.getByPlaceholderText(URL_PLACEHOLDER);
    const button = screen.getByRole("button", { name: SAVE_BUTTON_NAME });
    const newUrl = "https://example.com/new";

    fireEvent.change(input, { target: { value: newUrl } });
    fireEvent.click(button);

    expect(mockSet).toHaveBeenCalledWith(
      { [STORAGE_KEY_BOOKMARK_URL]: newUrl },
      expect.any(Function)
    );
  });

  it("does not save if the URL is empty", () => {
    mockGet.mockImplementation((_keys, callback) => {
      callback({});
    });
    render(<Options />);
    const button = screen.getByRole("button", { name: SAVE_BUTTON_NAME });

    fireEvent.click(button);

    expect(mockSet).not.toHaveBeenCalled();
  });

  it("displays a save message and clears it after 3 seconds", () => {
    vi.useFakeTimers();
    render(<Options />);
    const input = screen.getByPlaceholderText(URL_PLACEHOLDER);
    const button = screen.getByRole("button", { name: SAVE_BUTTON_NAME });
    const newUrl = "https://example.com/new-url-for-message-test";

    fireEvent.change(input, { target: { value: newUrl } });

    act(() => {
      fireEvent.click(button);
    });

    // メッセージが表示されることを確認
    expect(screen.getByText("保存しました！")).toBeInTheDocument();

    // 3秒経過させる
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    // メッセージが消えることを確認
    expect(screen.queryByText("保存しました！")).not.toBeInTheDocument();

    vi.useRealTimers();
  });
});
