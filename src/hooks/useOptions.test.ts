import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { act, renderHook, waitFor } from "@testing-library/react";

import {
  SAVE_MESSAGE_TIMEOUT_MS,
  STORAGE_KEY_API_BASE_URL,
} from "../constants/constants";
import { useOptions } from "./useOptions";

describe("useOptions", () => {
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
    mockGet.mockResolvedValue({});
    mockSet.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("初期化", () => {
    const testCases = [
      {
        description:
          "ストレージに値が保存されている場合、ベースURLがセットされること",
        expectedUrl: "https://example.com/saved",
      },
      {
        description: "ストレージに保存されていない場合、ベースURLは空のまま",
        expectedUrl: "",
      },
    ];

    it.each(testCases)("$description", async ({ expectedUrl }) => {
      mockGet.mockResolvedValue(
        expectedUrl ? { [STORAGE_KEY_API_BASE_URL]: expectedUrl } : {}
      );

      const { result } = renderHook(() => useOptions());

      // 初期値が空文字列であることを確認
      expect(result.current.baseUrl).toBe("");

      // 非同期処理が完了し、値がセットされるのを待つ
      await waitFor(() => {
        expect(result.current.baseUrl).toBe(expectedUrl);
      });
    });
  });

  describe("handleSave", () => {
    const newUrl = "https://example.com/new";

    it("ベースURLが空の場合、storage.setは呼ばれないこと", async () => {
      const { result } = renderHook(() => useOptions());

      await act(async () => {
        await result.current.handleSave();
      });

      expect(mockSet).not.toHaveBeenCalled();
    });

    it("ベースURLがセットされている場合、storage.setが呼ばれ、メッセージが表示されること", async () => {
      const { result } = renderHook(() => useOptions());

      act(() => {
        result.current.setBaseUrl(newUrl);
      });

      await act(async () => {
        await result.current.handleSave();
      });

      expect(mockSet).toHaveBeenCalledWith({
        [STORAGE_KEY_API_BASE_URL]: newUrl,
      });
      expect(result.current.saveMessage).toEqual({
        text: "保存しました！",
        type: "success",
        id: "save-success",
      });
    });

    describe("タイマー関連", () => {
      beforeEach(() => {
        vi.useFakeTimers();
      });

      afterEach(() => {
        vi.useRealTimers();
      });

      it("保存後、指定時間が経過するとメッセージが消えること", async () => {
        const { result } = renderHook(() => useOptions());

        act(() => {
          result.current.setBaseUrl(newUrl);
        });

        await act(async () => {
          await result.current.handleSave();
        });

        expect(result.current.saveMessage).toEqual({
          text: "保存しました！",
          type: "success",
          id: "save-success",
        });

        await act(async () => {
          await vi.advanceTimersByTimeAsync(SAVE_MESSAGE_TIMEOUT_MS);
        });

        expect(result.current.saveMessage).toBeNull();
      });

      it("保存ボタンが連続で押された場合、タイマーがリセットされること", async () => {
        const { result } = renderHook(() => useOptions());
        const halfTimeout = SAVE_MESSAGE_TIMEOUT_MS / 2;

        act(() => {
          result.current.setBaseUrl(newUrl);
        });

        // 1回目の保存
        await act(async () => {
          await result.current.handleSave();
        });
        expect(result.current.saveMessage).toEqual({
          text: "保存しました！",
          type: "success",
          id: "save-success",
        });

        // 時間を半分進める
        await act(async () => {
          await vi.advanceTimersByTimeAsync(halfTimeout);
        });

        // 2回目の保存（タイマーがリセットされる）
        await act(async () => {
          await result.current.handleSave();
        });

        // 時間を半分進めてもメッセージは消えない
        await act(async () => {
          await vi.advanceTimersByTimeAsync(halfTimeout);
        });
        expect(result.current.saveMessage).toEqual({
          text: "保存しました！",
          type: "success",
          id: "save-success",
        });

        // さらに時間を進めるとメッセージが消える
        await act(async () => {
          await vi.advanceTimersByTimeAsync(halfTimeout);
        });
        expect(result.current.saveMessage).toBeNull();
      });
    });
  });
});
