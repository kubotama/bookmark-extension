import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  type MockInstance,
  vi,
} from "vitest";

import { renderHook, waitFor } from "@testing-library/react";

import {
  API_BASE_URL,
  API_ENDPOINT,
  POPUP_FAILED_TO_FETCH_API_URL_PREFIX,
  STORAGE_KEY_API_BASE_URL,
} from "../constants/constants";
import { useApiUrl } from "./useApiUrl";

describe("useApiUrl", () => {
  const get = vi.fn();
  global.chrome = {
    storage: {
      local: {
        get,
      },
    },
  } as unknown as typeof chrome;

  let consoleErrorSpy: MockInstance;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    get.mockClear();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it("apiBaseUrlの初期値が正しく設定されていること", () => {
    get.mockResolvedValue({});
    const { result } = renderHook(() => useApiUrl());

    expect(result.current.getApiBookmarkAddUrl()).toBe(
      new URL(API_ENDPOINT.ADD_BOOKMARK, API_BASE_URL).href
    );
    expect(result.current.getApiBookmarkGetUrl()).toBe(
      new URL(API_ENDPOINT.GET_BOOKMARKS, API_BASE_URL).href
    );
  });

  it("ストレージからURLを読み込んで設定すること", async () => {
    const newUrl = "https://example.com";
    get.mockResolvedValue({ [STORAGE_KEY_API_BASE_URL]: newUrl });
    const { result } = renderHook(() => useApiUrl());

    await waitFor(() => {
      expect(result.current.isApiUrlLoaded).toBe(true);
    });

    expect(result.current.getApiBookmarkAddUrl()).toBe(
      new URL(API_ENDPOINT.ADD_BOOKMARK, newUrl).href
    );
    expect(result.current.getApiBookmarkGetUrl()).toBe(
      new URL(API_ENDPOINT.GET_BOOKMARKS, newUrl).href
    );
  });

  it("ストレージのURLが空の場合、デフォルトURLが使用されること", async () => {
    get.mockResolvedValue({ [STORAGE_KEY_API_BASE_URL]: "" });
    const { result } = renderHook(() => useApiUrl());

    await waitFor(() => {
      expect(result.current.isApiUrlLoaded).toBe(true);
    });

    expect(result.current.getApiBookmarkAddUrl()).toBe(
      new URL(API_ENDPOINT.ADD_BOOKMARK, API_BASE_URL).href
    );
    expect(result.current.getApiBookmarkGetUrl()).toBe(
      new URL(API_ENDPOINT.GET_BOOKMARKS, API_BASE_URL).href
    );
  });

  it("ストレージからのURL取得に失敗した場合、エラーがコンソールに出力されること", async () => {
    const error = new Error("Failed to get URL");
    get.mockRejectedValue(error);
    const { result } = renderHook(() => useApiUrl());

    await waitFor(() => {
      expect(result.current.isApiUrlLoaded).toBe(true);
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      POPUP_FAILED_TO_FETCH_API_URL_PREFIX,
      error
    );
  });
});