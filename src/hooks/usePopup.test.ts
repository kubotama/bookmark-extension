import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type MockInstance,
} from "vitest";

import { act, renderHook, waitFor } from "@testing-library/react";
import { useActiveTabInfo } from "../hooks/useActiveTabInfo";
import { useApiUrl } from "../hooks/useApiUrl";

import { API_BASE_URL, API_ENDPOINT } from "../constants/constants";
import { usePopup } from "./usePopup";

const API_BOOKMARK_ADD = new URL(API_ENDPOINT.ADD_BOOKMARK, API_BASE_URL).href;

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

  let consoleErrorSpy: MockInstance;

  beforeEach(() => {
    // console.errorをモック化して、コンソールへの出力を抑制する
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    // 各テストの前にモックを初期化
    mockActiveTabInfo = {
      url: "https://example.com",
      setUrl: vi.fn(),
      title: "Test Title",
      setTitle: vi.fn(),
    };
    mockApiUrl = {
      getApiBookmarkAddUrl: () => API_BOOKMARK_ADD,
      isApiUrlLoaded: true,
    };
    vi.stubGlobal("fetch", vi.fn());
    hookResult = renderHook(() => usePopup());
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    vi.restoreAllMocks();
  });

  it("初期値が正しく返されること", () => {
    const { result } = hookResult;

    expect(result.current.activeTabUrl).toBe("https://example.com");
    expect(result.current.activeTabTitle).toBe("Test Title");
    expect(result.current.isRegisterDisabled).toBe(false);
    expect(result.current.message).toBeUndefined();
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
      expect(result.current.message?.text).toBe(
        "ブックマークが登録されました。"
      );
      expect(result.current.message?.type).toBe("success");
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
      expect(result.current.message?.text).toBe("登録失敗: Error message");
      expect(result.current.message?.type).toBe("error");
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
      expect(result.current.message?.text).toBe(
        "予期せぬエラーが発生しました: Network error"
      );
      expect(result.current.message?.type).toBe("error");
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "予期せぬエラーが発生しました: Network error",
        new Error("Network error")
      );
    });
  });

  it("不正なベースURLでTypeErrorが発生した際の処理が正しく行われること", async () => {
    const typeErrorMessage =
      "Cannot read properties of undefined (reading 'ok')";
    mockApiUrl.getApiBookmarkAddUrl = vi.fn().mockImplementation(() => {
      throw new TypeError(typeErrorMessage);
    });

    const { result } = hookResult;

    await act(async () => {
      await result.current.registerClick();
    });

    await waitFor(() => {
      expect(result.current.message?.text).toBe(
        "APIのベースURL設定が不正です。"
      );
      expect(result.current.message?.type).toBe("error");
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "APIのベースURL設定が不正です。",
        new TypeError(typeErrorMessage)
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
      expect(result.current.message?.text).toBe(
        "登録失敗: エラー応答の解析に失敗しました。"
      );
      expect(result.current.message?.type).toBe("error");
    });
  });

  describe("isRegisterDisabledのロジック", () => {
    const testCases = [
      {
        description: "タイトルが空の場合に登録ボタンが無効になること",
        setup: () => {
          // モックの値を直接変更
          mockActiveTabInfo.title = "";
        },
        expected: true,
      },
      {
        description: "URLが無効な場合に登録ボタンが無効になること",
        setup: () => {
          // モックの値を直接変更
          mockActiveTabInfo.url = "invalid-url";
        },
        expected: true,
      },
      {
        description:
          "APIのURLがロードされていない場合に登録ボタンが無効になること",
        setup: () => {
          // モックの値を直接変更
          mockApiUrl.isApiUrlLoaded = false;
        },
        expected: true,
      },
    ];

    it.each(testCases)("$description", async ({ setup, expected }) => {
      setup();
      const { result } = (hookResult = renderHook(() => usePopup()));
      expect(result.current.isRegisterDisabled).toBe(expected);
    });
  });
});
