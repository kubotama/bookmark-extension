import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  type MockInstance,
  vi,
} from "vitest";

import { chromeStorageLocalGet } from "../test/setup";

import { renderHook, waitFor } from "@testing-library/react";

import {
  API_BASE_URL,
  API_ENDPOINT,
  POPUP_FAILED_TO_FETCH_API_URL_PREFIX,
  STORAGE_KEY_API_BASE_URL,
} from "../constants/constants";
import { useApiUrl } from "./useApiUrl";

describe("useApiUrl", () => {
  let consoleErrorSpy: MockInstance;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    chromeStorageLocalGet.mockClear();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  const assertApiUrls = async (
    result: { current: ReturnType<typeof useApiUrl> },
    expectedBaseUrl: string
  ) => {
    await waitFor(() => {
      expect(result.current.isApiUrlLoaded).toBe(true);
      expect(result.current.getApiBookmarkAddUrl()).toBe(
        new URL(API_ENDPOINT.ADD_BOOKMARK, expectedBaseUrl).href
      );
      expect(result.current.getApiBookmarkGetUrl()).toBe(
        new URL(API_ENDPOINT.GET_BOOKMARKS, expectedBaseUrl).href
      );
    });
  };

  it("apiBaseUrlの初期値が正しく設定されていること", async () => {
    chromeStorageLocalGet.mockResolvedValue({});
    const { result } = renderHook(() => useApiUrl());

    await assertApiUrls(result, API_BASE_URL);
  });

  it("ストレージからURLを読み込んで設定すること", async () => {
    const newUrl = "https://example.com";
    chromeStorageLocalGet.mockResolvedValue({
      [STORAGE_KEY_API_BASE_URL]: newUrl,
    });
    const { result } = renderHook(() => useApiUrl());

    await assertApiUrls(result, newUrl);
  });

  it("ストレージのURLが空の場合、デフォルトURLが使用されること", async () => {
    chromeStorageLocalGet.mockResolvedValue({ [STORAGE_KEY_API_BASE_URL]: "" });
    const { result } = renderHook(() => useApiUrl());

    await assertApiUrls(result, API_BASE_URL);
  });

  it("ストレージからのURL取得に失敗した場合、エラーがコンソールに出力されること", async () => {
    const error = new Error("Failed to get URL");
    chromeStorageLocalGet.mockRejectedValue(error);
    const { result } = renderHook(() => useApiUrl());

    await assertApiUrls(result, API_BASE_URL);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      POPUP_FAILED_TO_FETCH_API_URL_PREFIX,
      error
    );
  });
});
