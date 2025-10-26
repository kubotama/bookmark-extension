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

import { STORAGE_KEY_API_BASE_URL } from "../constants/constants";
import { useOptions } from "./useOptions";

describe("useOptions", () => {
  const set = vi.fn();
  const get = vi.fn();
  global.chrome = {
    storage: {
      local: {
        set,
        get,
      },
    },
  } as unknown as typeof chrome;

  const newUrl = "https://example.com";

  let consoleErrorSpy: MockInstance;

  beforeEach(() => {
    // console.errorをモック化して、コンソールへの出力を抑制する
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    set.mockClear();
    get.mockClear();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe("URLの初期化", () => {
    it("ストレージからURLを読み込んで設定すること", async () => {
      get.mockResolvedValue({ [STORAGE_KEY_API_BASE_URL]: newUrl });
      const { result } = renderHook(() => useOptions());

      await waitFor(() => {
        expect(result.current.baseUrl).toBe(newUrl);
      });
    });

    it("ストレージにURLがない場合、空文字に設定されること", async () => {
      get.mockResolvedValue({});
      const { result } = renderHook(() => useOptions());

      await waitFor(() => {
        expect(result.current.baseUrl).toBe("");
      });
    });

    it("ストレージからの読み込みに失敗した場合、コンソールにエラーが出力されること", async () => {
      get.mockRejectedValue(new Error("Failed to get"));
      renderHook(() => useOptions());

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          "Failed to get base URL:",
          new Error("Failed to get")
        );
      });
    });
  });

  describe("URLの保存", () => {
    it("URLが空の場合、ストレージに保存されないこと", async () => {
      const { result } = renderHook(() => useOptions());

      await act(async () => {
        await result.current.handleSave();
      });

      expect(set).not.toHaveBeenCalled();
    });

    it("URLが入力されている場合、ストレージに保存されること", async () => {
      const { result } = renderHook(() => useOptions());

      act(() => {
        result.current.setBaseUrl(newUrl);
      });

      await act(async () => {
        await result.current.handleSave();
      });

      expect(set).toHaveBeenCalledWith({ [STORAGE_KEY_API_BASE_URL]: newUrl });
    });

    it("保存後、メッセージが設定されること", async () => {
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
        id: expect.any(String),
      });
    });
  });
});
