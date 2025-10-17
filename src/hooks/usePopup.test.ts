import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { act, renderHook, waitFor } from "@testing-library/react";
import { useActiveTabInfo } from "../hooks/useActiveTabInfo";
import { useApiUrl } from "../hooks/useApiUrl";

import { API_BOOKMARK_ADD } from "../constants/constants";
import { usePopup } from "./usePopup";

// モック用の変数を定義
let mockActiveTabInfo: ReturnType<typeof useActiveTabInfo>;
let mockApiUrl: ReturnType<typeof useApiUrl>;

vi.mock("../hooks/useActiveTabInfo", () => ({
  // ファクトリ関数内で変数を返すようにする
  useActiveTabInfo: () => mockActiveTabInfo,
}));

vi.mock("../hooks/useApiUrl", () => ({
  // ファクトリ関数内で変数を返すようにする
  useApiUrl: () => mockApiUrl,
}));

describe("usePopup", () => {
  let hookResult: ReturnType<
    typeof renderHook<ReturnType<typeof usePopup>, unknown>
  >;

  beforeEach(() => {
    // 各テストの前にモックを初期化
    mockActiveTabInfo = {
      url: "https://example.com",
      setUrl: vi.fn(),
      title: "Test Title",
      setTitle: vi.fn(),
    };
    mockApiUrl = {
      apiUrl: API_BOOKMARK_ADD,
      isApiUrlLoaded: true,
    };
    vi.stubGlobal("fetch", vi.fn());
    hookResult = renderHook(() => usePopup());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("初期値が正しく返されること", () => {
    const { result } = hookResult;

    expect(result.current.activeTabUrl).toBe("https://example.com");
    expect(result.current.activeTabTitle).toBe("Test Title");
    expect(result.current.isRegisterDisabled).toBe(false);
    expect(result.current.messageText).toBeUndefined();
  });

  it("ブックマークが正常に登録されること", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
    });

    const { result } = hookResult;

    await act(async () => {
      await result.current.registerClick();
    });

    expect(global.fetch).toHaveBeenCalledWith(API_BOOKMARK_ADD, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: "https://example.com",
        title: "Test Title",
      }),
    });

    await waitFor(() => {
      expect(result.current.messageText).toBe("ブックマークが登録されました。");
    });
  });

  it("ブックマーク登録失敗時の処理が正しく行われること", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
      json: () => Promise.resolve({ message: "Error message" }),
    });

    const { result } = hookResult;

    await act(async () => {
      await result.current.registerClick();
    });

    await waitFor(() => {
      expect(result.current.messageText).toBe("登録失敗: Error message");
    });
  });

  it("ネットワークエラー時の処理が正しく行われること", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("Network error")
    );

    const { result } = hookResult;

    await act(async () => {
      await result.current.registerClick();
    });

    await waitFor(() => {
      expect(result.current.messageText).toBe(
        "予期せぬエラーが発生しました: Error: Network error"
      );
    });
  });

  it("エラーメッセージがボディに含まれないブックマーク登録失敗時の処理が正しく行われること", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      status: 400,
      statusText: "Bad Request",
      json: () => Promise.resolve({}), // messageプロパティがないレスポンス
    });

    const { result } = hookResult;

    await act(async () => {
      await result.current.registerClick();
    });

    await waitFor(() => {
      // response.statusTextがフォールバックとして使用されることを確認
      expect(result.current.messageText).toBe("登録失敗: Bad Request");
    });
  });

  describe("isRegisterDisabledのロジック", () => {
    it("タイトルが空の場合に登録ボタンが無効になること", () => {
      // モックの値を直接変更
      mockActiveTabInfo.title = "";

      const { result, rerender } = hookResult;
      rerender(); // フックを再実行して新しいモックの値を反映
      expect(result.current.isRegisterDisabled).toBe(true);
    });

    it("URLが無効な場合に登録ボタンが無効になること", () => {
      // モックの値を直接変更
      mockActiveTabInfo.url = "invalid-url";

      const { result, rerender } = hookResult;
      rerender();
      expect(result.current.isRegisterDisabled).toBe(true);
    });

    it("APIのURLがロードされていない場合に登録ボタンが無効になること", () => {
      // モックの値を直接変更
      mockApiUrl.isApiUrlLoaded = false;

      const { result, rerender } = hookResult;
      rerender();
      expect(result.current.isRegisterDisabled).toBe(true);
    });
  });
});
