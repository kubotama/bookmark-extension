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

      expect(result.current.saveMessage).toEqual({
        text: "2件のブックマークを取得しました。",
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

      expect(result.current.saveMessage).toEqual({
        text: "APIへの接続に失敗しました (HTTP 500)",
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

      expect(result.current.saveMessage).toEqual({
        text: "APIへの接続に失敗しました。ネットワーク設定などを確認してください。",
        type: "error",
        id: expect.any(String),
      });
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "APIへの接続に失敗しました:",
        error
      );
    });
  });
});
