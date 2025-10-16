import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { act, renderHook, waitFor } from "@testing-library/react";

import { API_BOOKMARK_ADD } from "../constants/constants";
import { usePopup } from "./usePopup";

vi.mock("./useActiveTabInfo", () => ({
  useActiveTabInfo: () => ({
    url: "https://example.com",
    setUrl: vi.fn(),
    title: "Test Title",
    setTitle: vi.fn(),
  }),
}));

vi.mock("./useApiUrl", () => ({
  useApiUrl: () => ({
    apiUrl: API_BOOKMARK_ADD,
    isApiUrlLoaded: true,
  }),
}));

describe("usePopup", () => {
  let hookResult: ReturnType<
    typeof renderHook<ReturnType<typeof usePopup>, unknown>
  >;

  beforeEach(() => {
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
    expect(result.current.isApiUrlLoaded).toBe(true);
    expect(result.current.messageText).toBeUndefined();
  });

  it("URLの検証が正しく行われること", () => {
    const { result } = hookResult;

    expect(result.current.isValidUrl("https://example.com")).toBe(true);
    expect(result.current.isValidUrl("invalid-url")).toBe(false);
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
      expect(result.current.messageText).toBe("Error: Network error");
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
});
