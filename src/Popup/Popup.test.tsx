import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  type MockInstance,
  vi,
} from "vitest";

import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { API_BOOKMARK_ADD } from "../constants/constants";
import Popup from "./Popup";

describe("Popup", () => {
  // トップレベルに共通のモックセットアップを移動
  beforeEach(() => {
    // Mock chrome.tabs.query
    global.chrome = {
      tabs: {
        query: vi.fn((_options, callback) => {
          // Simulate an active tab with a URL
          callback([
            { url: "https://example.com", title: "サンプルのページのタイトル" },
          ]);
        }),
      },
      storage: {
        local: {
          get: vi.fn((_keys, callback) => {
            callback({});
          }),
        },
      },
      // Mock other chrome APIs if needed
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;

    global.fetch = vi.fn();
  });

  // vi.fn()でモック化したものは、afterEachでクリアするのが一般的です
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders correctly and displays the active tab URL", async () => {
    render(<Popup />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "登録" })).toBeInTheDocument();
      expect(screen.getByLabelText("url")).toHaveValue("https://example.com");
      expect(screen.getByLabelText("title")).toHaveValue(
        "サンプルのページのタイトル"
      );
    });
  });

  it("アクティブなタブのURLの取得に失敗", async () => {
    global.chrome = {
      tabs: {
        query: vi.fn((_options, callback) => {
          // Simulate an active tab with a URL
          callback([]);
        }),
      },
      storage: {
        local: {
          get: vi.fn(
            (
              _keys: string | string[] | { [key: string]: unknown } | null,
              callback: (items: { [key: string]: unknown }) => void
            ) => {
              callback({});
            }
          ),
        },
      },
      // Mock other chrome APIs if needed
    } as never;

    render(<Popup />);

    await waitFor(() => {
      expect(screen.getByText("登録")).toBeInTheDocument();
      expect(screen.getByLabelText("url")).toHaveValue(
        "URLの取得に失敗しました。"
      );
    });
  });

  it("アクティブなタブのタイトルの取得に失敗", async () => {
    global.chrome = {
      tabs: {
        query: vi.fn((_options, callback) => {
          // Simulate an active tab with a URL
          callback([{ url: "https://example.com" }]);
        }),
      },
      storage: {
        local: {
          get: vi.fn(
            (
              _keys: string | string[] | { [key: string]: unknown } | null,
              callback: (items: { [key: string]: unknown }) => void
            ) => {
              callback({});
            }
          ),
        },
      },
      // Mock other chrome APIs if needed
    } as never;

    render(<Popup />);

    await waitFor(() => {
      expect(screen.getByText("登録")).toBeInTheDocument();
      expect(screen.getByLabelText("title")).toHaveValue(
        "タイトルの取得に失敗しました。"
      );
    });
  });

  it("ブックマークを登録", async () => {
    global.fetch = vi.fn().mockImplementation(
      async () =>
        new Response(
          JSON.stringify({
            url: "https://www.google.com/",
            title: "Google",
            id: 1,
          }),
          { status: 200 }
        )
    );

    render(<Popup />);

    const urlInput = screen.getByLabelText("url");
    const titleInput = screen.getByLabelText("title");

    fireEvent.change(urlInput, {
      target: { value: "https://www.google.com/" },
    });
    fireEvent.change(titleInput, { target: { value: "Google" } });

    const registerButton = screen.getByRole("button", { name: "登録" });
    fireEvent.click(registerButton);

    await waitFor(() => {
      expect(global.fetch).toBeCalledTimes(1);
      expect(global.fetch).toBeCalledWith(API_BOOKMARK_ADD, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: '{"url":"https://www.google.com/","title":"Google"}',
      });
      expect(
        screen.getByText("ブックマークが登録されました。")
      ).toBeInTheDocument();
    });
  });

  it("既に登録されているブックマークを登録しようとしてエラー", async () => {
    global.fetch = vi.fn().mockImplementation(
      async () =>
        new Response(
          JSON.stringify({
            error: "指定されたURLのブックマークは既に登録されています。",
            message: "指定されたURLのブックマークは既に登録されています。",
            url: "https://www.google.com/",
            title: "Google",
          }),
          {
            status: 409,
          }
        )
    );

    render(<Popup />);

    const urlInput = screen.getByLabelText("url");
    const titleInput = screen.getByLabelText("title");

    fireEvent.change(urlInput, {
      target: { value: "https://www.google.com/" },
    });
    fireEvent.change(titleInput, { target: { value: "Google" } });

    const registerButton = screen.getByRole("button", { name: "登録" });
    fireEvent.click(registerButton);

    await waitFor(() => {
      expect(global.fetch).toBeCalledTimes(1);
      expect(global.fetch).toBeCalledWith(API_BOOKMARK_ADD, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: '{"url":"https://www.google.com/","title":"Google"}',
      });
      expect(
        screen.getByText(
          "登録失敗: 指定されたURLのブックマークは既に登録されています。"
        )
      ).toBeInTheDocument();
    });
  });

  it("無効なURLが入力された場合", async () => {
    render(<Popup />);

    const urlInput = screen.getByLabelText("url");

    fireEvent.change(urlInput, {
      target: { value: "invalid-url" },
    });
    const registerButton = screen.getByRole("button", { name: "登録" });
    fireEvent.click(registerButton);

    await waitFor(() => {
      expect(global.fetch).not.toBeCalled();
      expect(
        screen.getByText("登録できません: 無効なURLです (invalid-url)")
      ).toBeInTheDocument();
    });
  });

  it("無効なタイトルが入力された場合", async () => {
    render(<Popup />);

    const urlInput = screen.getByLabelText("url");
    const titleInput = screen.getByLabelText("title");
    fireEvent.change(urlInput, {
      target: { value: "https://www.amazon.co.jp/" },
    });
    fireEvent.change(titleInput, { target: { value: "" } });

    const registerButton = screen.getByRole("button", { name: "登録" });
    fireEvent.click(registerButton);

    await waitFor(() => {
      expect(global.fetch).not.toBeCalled();
      expect(
        screen.getByText("登録できません: タイトルが指定されていません")
      ).toBeInTheDocument();
    });
  });

  describe("オプションページで設定したURLを利用する", () => {
    const customApiUrl = "https://custom-api.example.com/bookmarks";

    beforeEach(() => {
      // Mock chrome.tabs.query
      global.chrome = {
        tabs: {
          query: vi.fn((_options, callback) => {
            // Simulate an active tab with a URL
            callback([
              {
                url: "https://example.com",
                title: "サンプルのページのタイトル",
              },
            ]);
          }),
        },
        storage: {
          local: {
            get: vi.fn(
              (
                _keys: string | string[] | { [key: string]: unknown } | null,
                callback: (items: { [key: string]: unknown }) => void
              ) => {
                callback({ bookmarkUrl: customApiUrl });
              }
            ),
          },
        },
        // Mock other chrome APIs if needed
      } as never;

      global.fetch = vi.fn();
    });

    it("ブックマークを登録", async () => {
      global.fetch = vi.fn().mockImplementation(
        async () =>
          new Response(
            JSON.stringify({
              url: "https://www.google.com/",
              title: "Google",
              id: 1,
            }),
            { status: 200 }
          )
      );

      render(<Popup />);

      const urlInput = screen.getByLabelText("url");
      const titleInput = screen.getByLabelText("title");

      fireEvent.change(urlInput, {
        target: { value: "https://www.google.com/" },
      });
      fireEvent.change(titleInput, { target: { value: "Google" } });

      const registerButton = screen.getByRole("button", { name: "登録" });
      fireEvent.click(registerButton);

      await waitFor(() => {
        expect(global.fetch).toBeCalledTimes(1);
        expect(global.fetch).toBeCalledWith(customApiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: '{"url":"https://www.google.com/","title":"Google"}',
        });
        expect(
          screen.getByText("ブックマークが登録されました。")
        ).toBeInTheDocument();
      });
    });
  });

  describe("エラーメッセージが出力される場合", () => {
    let consoleErrorSpy: MockInstance;

    beforeEach(() => {
      // console.errorをモック化して、コンソールへの出力を抑制する
      consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    });

    // フォームへの入力と登録ボタンのクリックを共通化
    beforeEach(() => {
      render(<Popup />);
      const urlInput = screen.getByLabelText("url");
      const titleInput = screen.getByLabelText("title");

      fireEvent.change(urlInput, {
        target: { value: "https://www.amazon.co.jp/" },
      });
      fireEvent.change(titleInput, { target: { value: "Amazon" } });
    });

    afterEach(() => {
      consoleErrorSpy.mockRestore();
    });

    it("APIリクエストで例外が発生", async () => {
      global.fetch = vi
        .fn()
        .mockReturnValueOnce(Promise.reject(new Error("APIエラー")));
      const registerButton = screen.getByRole("button", { name: "登録" });
      fireEvent.click(registerButton);

      await waitFor(() => {
        expect(global.fetch).toBeCalledTimes(1);
        expect(global.fetch).toBeCalledWith(API_BOOKMARK_ADD, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: '{"url":"https://www.amazon.co.jp/","title":"Amazon"}',
        });
        expect(screen.getByText("Error: APIエラー")).toBeInTheDocument();
        expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
        expect(consoleErrorSpy).toHaveBeenCalledWith(new Error("APIエラー"));
      });
    });

    it("エラーのレスポンスがJSON形式でないエラー", async () => {
      global.fetch = vi
        .fn()
        .mockImplementation(
          async () => new Response("invalid json", { status: 500 })
        );

      const registerButton = screen.getByRole("button", { name: "登録" });
      fireEvent.click(registerButton);

      await waitFor(() => {
        expect(global.fetch).toBeCalledTimes(1);
        expect(global.fetch).toBeCalledWith(API_BOOKMARK_ADD, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: '{"url":"https://www.amazon.co.jp/","title":"Amazon"}',
        });
        expect(
          screen.getByText(
            "ブックマークの登録に失敗しました。ステータス: 500: Unexpected token 'i', \"invalid json\" is not valid JSON"
          )
        ).toBeInTheDocument();
        expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          "ブックマークの登録に失敗しました。ステータス: 500: Unexpected token 'i', \"invalid json\" is not valid JSON"
        );
      });
    });
  });
});
