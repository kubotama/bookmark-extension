import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  type MockInstance,
  vi,
} from "vitest";

import { act, renderHook, waitFor } from "@testing-library/react";

import {
  API_BASE_URL,
  API_ERROR_MESSAGE,
  FAILED_TO_CONNECT_API,
  FAILED_TO_CONNECT_API_WITH_NETWORK,
  INVALID_URL_ERROR_MESSAGE,
  OPTION_INVALID_BASE_URL_ERROR,
  OPTION_INVALID_BASE_URL_PREFIX,
  OPTION_FAILED_TO_GET_API_BASE_URL_FROM_STORAGE_PREFIX,
  OPTION_UNEXPECTED_API_RESPONSE_ERROR,
  OPTION_UNEXPECTED_API_RESPONSE_PREFIX,
  STORAGE_KEY_API_BASE_URL,
  SUCCESS_MESSAGE,
  URL_REQUIRED_ERROR_MESSAGE,
} from "../constants/constants";
import { useApiUrl } from "./useApiUrl";
import { useOptions } from "./useOptions";

import { chromeStorageLocalSet, chromeStorageLocalGet } from "../test/setup";

vi.mock("./useApiUrl");

describe("useOptions", () => {
  const newUrl = "https://example.com";

  let consoleErrorSpy: MockInstance;
  const mockUseApiUrl = useApiUrl as unknown as MockInstance;

  beforeEach(() => {
    // console.errorをモック化して、コンソールへの出力を抑制する
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mockUseApiUrl.mockReturnValue({
      getApiBookmarkGetUrl: vi
        .fn()
        .mockReturnValue("https://example.com/bookmarks"),
    });
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    mockUseApiUrl.mockReset();
  });

  describe("URLの初期化", () => {
    it("ストレージからURLを読み込んで設定すること", async () => {
      chromeStorageLocalGet.mockResolvedValue({
        [STORAGE_KEY_API_BASE_URL]: newUrl,
      });
      const { result } = renderHook(() => useOptions());

      await waitFor(() => {
        expect(result.current.baseUrl).toBe(newUrl);
      });
    });

    it("ストレージにURLがない場合、APIのデフォルトのURLが設定されること", async () => {
      chromeStorageLocalGet.mockResolvedValue({});
      const { result } = renderHook(() => useOptions());

      await waitFor(() => {
        expect(result.current.baseUrl).toBe(API_BASE_URL);
      });
    });

    it("ストレージからの読み込みに失敗した場合、コンソールにエラーが出力されること", async () => {
      chromeStorageLocalGet.mockRejectedValue(new Error("Failed to get"));
      renderHook(() => useOptions());

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          OPTION_FAILED_TO_GET_API_BASE_URL_FROM_STORAGE_PREFIX,
          new Error("Failed to get")
        );
      });
    });
  });

  describe("URLの保存", () => {
    it("URLが入力されている場合、ストレージに保存されること", async () => {
      const { result } = renderHook(() => useOptions());

      act(() => {
        result.current.handleBaseUrlChange(newUrl);
      });

      await act(async () => {
        await result.current.handleSave();
      });

      expect(chromeStorageLocalSet).toHaveBeenCalledWith({
        [STORAGE_KEY_API_BASE_URL]: newUrl,
      });
    });

    it("保存後、メッセージが設定されること", async () => {
      const { result } = renderHook(() => useOptions());

      act(() => {
        result.current.handleBaseUrlChange(newUrl);
      });

      await act(async () => {
        await result.current.handleSave();
      });

      expect(result.current.feedbackMessage).toEqual({
        text: "保存しました！",
        type: "success",
        id: expect.any(String),
      });
    });
  });

  describe("URLの検証", () => {
    it("不正なURLが入力された場合、エラーメッセージが設定されること", () => {
      const { result } = renderHook(() => useOptions());

      act(() => {
        result.current.handleBaseUrlChange("invalid-url");
      });

      expect(result.current.urlError).toBe(INVALID_URL_ERROR_MESSAGE);
    });

    it("有効なURLが入力された場合、エラーメッセージが空になること", () => {
      const { result } = renderHook(() => useOptions());

      act(() => {
        result.current.handleBaseUrlChange("https://example.com");
      });

      expect(result.current.urlError).toBe("");
    });

    it("不正なURLで保存しようとした場合、保存されずにエラーメッセージが設定されること", async () => {
      const { result } = renderHook(() => useOptions());

      act(() => {
        result.current.handleBaseUrlChange("invalid-url");
      });

      await act(async () => {
        await result.current.handleSave();
      });

      expect(chromeStorageLocalSet).not.toHaveBeenCalled();
      expect(result.current.urlError).toBe(INVALID_URL_ERROR_MESSAGE);
    });

    it("URLが空の状態で保存しようとした場合、保存されずにエラーメッセージが設定されること", async () => {
      const { result } = renderHook(() => useOptions());

      await act(async () => {
        await result.current.handleSave();
      });

      expect(chromeStorageLocalSet).not.toHaveBeenCalled();
      expect(result.current.urlError).toBe(URL_REQUIRED_ERROR_MESSAGE);
    });
  });

  describe("verifyClick", () => {
    let fetchSpy: MockInstance;

    beforeEach(() => {
      fetchSpy = vi.spyOn(global, "fetch");
    });

    afterEach(() => {
      fetchSpy.mockRestore();
    });

    it("API通信が成功した場合、成功メッセージを設定すること", async () => {
      const mockData = [{ id: 1 }, { id: 2 }];
      fetchSpy.mockResolvedValue({
        ok: true,
        json: async () => mockData,
      } as Response);

      const { result } = renderHook(() => useOptions());

      await act(async () => {
        await result.current.verifyClick();
      });

      expect(result.current.feedbackMessage).toEqual({
        text: SUCCESS_MESSAGE(mockData.length),
        type: "success",
        id: expect.any(String),
      });
    });

    it("APIがサーバーエラーを返した場合、エラーメッセージを設定すること", async () => {
      fetchSpy.mockResolvedValue({
        ok: false,
        status: 500,
      } as Response);

      const { result } = renderHook(() => useOptions());

      await act(async () => {
        await result.current.verifyClick();
      });

      expect(result.current.feedbackMessage).toEqual({
        text: API_ERROR_MESSAGE(500),
        type: "error",
        id: expect.any(String),
      });
    });

    it("ネットワークエラーが発生した場合、エラーメッセージを設定し、コンソールにエラーを出力すること", async () => {
      const error = new Error("Network error");
      fetchSpy.mockRejectedValue(error);

      const { result } = renderHook(() => useOptions());

      await act(async () => {
        await result.current.verifyClick();
      });

      expect(result.current.feedbackMessage).toEqual({
        text: FAILED_TO_CONNECT_API_WITH_NETWORK,
        type: "error",
        id: expect.any(String),
      });
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        FAILED_TO_CONNECT_API,
        error
      );
    });

    it("APIが予期しない形式のデータを返した場合、エラーメッセージを設定すること", async () => {
      const mockData = { message: "unexpected data" };
      fetchSpy.mockResolvedValue({
        ok: true,
        json: async () => mockData,
      } as Response);

      const { result } = renderHook(() => useOptions());

      await act(async () => {
        await result.current.verifyClick();
      });

      expect(result.current.feedbackMessage).toEqual({
        text: OPTION_UNEXPECTED_API_RESPONSE_ERROR,
        type: "error",
        id: expect.any(String),
      });
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        OPTION_UNEXPECTED_API_RESPONSE_PREFIX,
        mockData
      );
    });

    it("APIが不正なJSONを返した場合、エラーメッセージを設定すること", async () => {
      fetchSpy.mockResolvedValue({
        ok: true,
        json: async () => {
          throw new SyntaxError("Unexpected token in JSON");
        },
      } as unknown as Response);

      const { result } = renderHook(() => useOptions());

      await act(async () => {
        await result.current.verifyClick();
      });

      expect(result.current.feedbackMessage).toEqual({
        text: OPTION_UNEXPECTED_API_RESPONSE_ERROR,
        type: "error",
        id: expect.any(String),
      });
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        OPTION_UNEXPECTED_API_RESPONSE_PREFIX,
        expect.any(SyntaxError)
      );
    });

    it("APIが不正なURLの場合、エラーメッセージを設定し、コンソールにエラーを出力すること", async () => {
      const error = new TypeError("Invalid URL");
      mockUseApiUrl.mockReturnValue({
        getApiBookmarkGetUrl: vi.fn().mockImplementation(() => {
          throw error;
        }),
      });

      const { result } = renderHook(() => useOptions());

      await act(async () => {
        await result.current.verifyClick();
      });

      expect(result.current.feedbackMessage).toEqual({
        text: OPTION_INVALID_BASE_URL_ERROR,
        type: "error",
        id: expect.any(String),
      });
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        OPTION_INVALID_BASE_URL_PREFIX,
        error
      );
    });
  });
});
