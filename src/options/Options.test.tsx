import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { act, render, screen } from "@testing-library/react";
import userEvent, { type UserEvent } from "@testing-library/user-event";

import {
  SAVE_MESSAGE_TIMEOUT_MS,
  STORAGE_KEY_BOOKMARK_URL,
} from "../constants/constants";
import Options from "./Options";

describe("Options", () => {
  const URL_PLACEHOLDER = "ブックマークするURL";
  const SAVE_BUTTON_NAME = "保存";
  let user: UserEvent;

  // chrome.storage.localのモック
  const mockGet = vi.fn();
  const mockSet = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("chrome", {
      storage: {
        local: {
          get: mockGet,
          set: mockSet,
        },
      },
    });
    mockGet.mockResolvedValue({
      [STORAGE_KEY_BOOKMARK_URL]: "https://example.com/saved",
    });
    mockSet.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("タイマーを使用しないテスト", () => {
    beforeEach(() => {
      user = userEvent.setup();
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

      await user.clear(input);
      await user.type(input, newUrl);

      expect(input).toHaveValue(newUrl);
    });

    it("saves the URL to storage when the save button is clicked", async () => {
      render(<Options />);

      const input = await screen.findByPlaceholderText(URL_PLACEHOLDER);
      const button = await screen.findByRole("button", {
        name: SAVE_BUTTON_NAME,
      });
      const newUrl = "https://example.com/new";

      await user.clear(input);
      await user.type(input, newUrl);
      await user.click(button);

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

      await user.click(button);

      expect(mockSet).not.toHaveBeenCalled();
    });
  });

  describe("タイマーを使用するテスト", () => {
    beforeEach(() => {
      vi.useFakeTimers();
      // vitest v3では必要な設定 V4で不要になる見込み
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (globalThis as any).jest = {
        advanceTimersByTime: vi.advanceTimersByTime.bind(vi),
      };
      user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("displays a save message and clears it after 3 seconds", async () => {
      render(<Options />);
      const input = await screen.findByPlaceholderText(URL_PLACEHOLDER);
      const button = await screen.findByRole("button", {
        name: SAVE_BUTTON_NAME,
      });
      const newUrl = "https://example.com/new-url-for-message-test";

      await user.clear(input);
      await user.type(input, newUrl);

      await user.click(button);

      // メッセージが表示されることを確認
      expect(await screen.findByText("保存しました！")).toBeInTheDocument();

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      // メッセージが消えることを確認
      expect(screen.queryByText("保存しました！")).not.toBeInTheDocument();
    });

    it("should reset the message timer when the save button is clicked again before the message disappears", async () => {
      const MESSAGE_TIMEOUT = SAVE_MESSAGE_TIMEOUT_MS;
      const HALF_TIMEOUT = MESSAGE_TIMEOUT / 2;
      render(<Options />);
      const input = await screen.findByPlaceholderText(URL_PLACEHOLDER);
      const button = await screen.findByRole("button", {
        name: SAVE_BUTTON_NAME,
      });
      const newUrl = "https://example.com/multiple-clicks-test";

      await user.clear(input);
      await user.type(input, newUrl);

      // 1回目のクリック
      await user.click(button);
      expect(await screen.findByText("保存しました！")).toBeInTheDocument();

      // タイマーが半分経過（1500ms）
      await act(async () => {
        await vi.advanceTimersByTimeAsync(HALF_TIMEOUT);
      });

      // 2回目のクリックでタイマーをリセット
      await user.click(button);

      // 1回目のタイマーが切れるはずの時間まで進める（+1500ms）
      // タイマーがリセットされていれば、メッセージは消えない
      await act(async () => {
        await vi.advanceTimersByTimeAsync(HALF_TIMEOUT);
      });
      expect(screen.getByText("保存しました！")).toBeInTheDocument();

      // 2回目のタイマーが切れる時間まで進める（さらに+1500ms）
      await act(async () => {
        await vi.advanceTimersByTimeAsync(HALF_TIMEOUT);
      });
      expect(screen.queryByText("保存しました！")).not.toBeInTheDocument();
    });
  });
});
