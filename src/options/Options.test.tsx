import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { act, fireEvent, render, screen } from "@testing-library/react";

import {
  SAVE_MESSAGE_TIMEOUT_MS,
  STORAGE_KEY_BOOKMARK_URL,
} from "../constants/constants";
import Options from "./Options";

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
          set: mockSet.mockResolvedValue(undefined),
        },
      },
    });

    // モックされた get のデフォルトの動作を設定
    mockGet.mockResolvedValue({
      [STORAGE_KEY_BOOKMARK_URL]: "https://example.com/saved",
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders the options page", async () => {
    render(<Options />);

    expect(
      await screen.findByRole("heading", { name: "オプション" })
    ).toBeInTheDocument();
    expect(
      await screen.findByPlaceholderText(URL_PLACEHOLDER)
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("button", { name: SAVE_BUTTON_NAME })
    ).toBeInTheDocument();
  });

  it("loads and displays the saved URL on mount", async () => {
    const savedUrl = "https://example.com/saved";
    mockGet.mockResolvedValue({ [STORAGE_KEY_BOOKMARK_URL]: savedUrl });

    render(<Options />);

    expect(await screen.findByPlaceholderText(URL_PLACEHOLDER)).toHaveValue(
      savedUrl
    );

    expect(mockGet).toHaveBeenCalledWith(STORAGE_KEY_BOOKMARK_URL);
  });

  it("updates the input value on change", async () => {
    render(<Options />);

    const input = await screen.findByPlaceholderText(URL_PLACEHOLDER);
    const newUrl = "https://example.com/new";

    fireEvent.change(input, { target: { value: newUrl } });

    expect(input).toHaveValue(newUrl);
  });

  it("saves the URL to storage when the save button is clicked", async () => {
    render(<Options />);

    const input = await screen.findByPlaceholderText(URL_PLACEHOLDER);
    const button = await screen.findByRole("button", {
      name: SAVE_BUTTON_NAME,
    });
    const newUrl = "https://example.com/new";

    fireEvent.change(input, { target: { value: newUrl } });
    await act(async () => {
      fireEvent.click(button);
    });

    expect(mockSet).toHaveBeenCalledWith({
      [STORAGE_KEY_BOOKMARK_URL]: newUrl,
    });
  });

  it("does not save if the URL is empty", async () => {
    mockGet.mockResolvedValue({});
    render(<Options />);
    const button = await screen.findByRole("button", {
      name: SAVE_BUTTON_NAME,
    });

    await act(async () => {
      fireEvent.click(button);
    });

    expect(mockSet).not.toHaveBeenCalled();
  });

  it("displays a save message and clears it after 3 seconds", async () => {
    vi.useFakeTimers();
    render(<Options />);
    const input = screen.getByPlaceholderText(URL_PLACEHOLDER);
    const button = screen.getByRole("button", { name: SAVE_BUTTON_NAME });
    const newUrl = "https://example.com/new-url-for-message-test";

    fireEvent.change(input, { target: { value: newUrl } });

    // fireEvent.clickは非同期の状態で更新をトリガーするため、actでラップします
    await act(async () => {
      fireEvent.click(button);
    });

    // メッセージが表示されることを確認
    expect(screen.getByText("保存しました！")).toBeInTheDocument();

    // 3秒経過させる
    act(() => {
      vi.advanceTimersByTime(SAVE_MESSAGE_TIMEOUT_MS);
    });

    // メッセージが消えることを確認
    expect(screen.queryByText("保存しました！")).not.toBeInTheDocument();

    vi.useRealTimers();
  });
});
