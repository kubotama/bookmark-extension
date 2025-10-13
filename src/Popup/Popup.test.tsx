import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  type Mock,
  type MockInstance,
  vi,
} from "vitest";

import { render, screen } from "@testing-library/react";
import userEvent, { type UserEvent } from "@testing-library/user-event";

import { API_BOOKMARK_ADD } from "../constants/constants";
import Popup from "./Popup";

describe("Popup", () => {
  let user: UserEvent;
  let fetchSpy: MockInstance;
  // トップレベルに共通のモックセットアップを移動
  beforeEach(() => {
    // Mock chrome APIs
    vi.clearAllMocks();
    vi.stubGlobal("chrome", {
      tabs: {
        query: vi.fn((_options, callback) => {
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
      runtime: {
        lastError: undefined,
      },
      // Mock other chrome APIs if needed
    });

    fetchSpy = vi.spyOn(global, "fetch").mockImplementation(vi.fn());
    user = userEvent.setup();
  });

  // vi.fn()でモック化したものは、afterEachでクリアするのが一般的です
  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it("renders correctly and displays the active tab URL", async () => {
    render(<Popup />);

    expect(
      await screen.findByRole("button", { name: "登録" })
    ).toBeInTheDocument();
    expect(await screen.findByLabelText("url")).toHaveValue(
      "https://example.com"
    );
    expect(await screen.findByLabelText("title")).toHaveValue(
      "サンプルのページのタイトル"
    );
  });

  it("アクティブなタブのURLの取得に失敗", async () => {
    (global.chrome.tabs.query as Mock).mockImplementation(
      (_options, callback) => {
        callback([]);
      }
    );

    render(<Popup />);

    expect(await screen.findByText("登録")).toBeInTheDocument();
    expect(await screen.findByLabelText("url")).toHaveValue(
      "URLの取得に失敗しました。"
    );
  });

  it("アクティブなタブのタイトルの取得に失敗した場合、タイトルは空になり登録ボタンは無効になる", async () => {
    (global.chrome.tabs.query as Mock).mockImplementation(
      (_options, callback) => {
        callback([{ url: "https://example.com", title: undefined }]);
      }
    );

    render(<Popup />);

    expect(await screen.findByLabelText("title")).toHaveValue("");
    const registerButton = await screen.findByRole("button", { name: "登録" });
    expect(registerButton).toBeInTheDocument();
    expect(registerButton).toBeDisabled();
  });

  it("ブックマークを登録", async () => {
    (global.fetch as Mock).mockImplementation(
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

    const urlInput = await screen.findByLabelText("url");
    const titleInput = await screen.findByLabelText("title");

    await user.clear(urlInput);
    await user.type(urlInput, "https://www.google.com/");
    await user.clear(titleInput);
    await user.type(titleInput, "Google");

    const registerButton = await screen.findByRole("button", { name: "登録" });
    await user.click(registerButton);

    expect(
      await screen.findByText("ブックマークが登録されました。")
    ).toBeInTheDocument();
    expect(global.fetch).toBeCalledTimes(1);
    expect(global.fetch).toBeCalledWith(API_BOOKMARK_ADD, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: '{"url":"https://www.google.com/","title":"Google"}',
    });
  });

  it("既に登録されているブックマークを登録しようとしてエラー", async () => {
    (global.fetch as Mock).mockImplementation(
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

    const urlInput = await screen.findByLabelText("url");
    const titleInput = await screen.findByLabelText("title");

    await user.clear(urlInput);
    await user.type(urlInput, "https://www.google.com/");
    await user.clear(titleInput);
    await user.type(titleInput, "Google");

    const registerButton = await screen.findByRole("button", { name: "登録" });
    await user.click(registerButton);

    expect(
      await screen.findByText(
        "登録失敗: 指定されたURLのブックマークは既に登録されています。"
      )
    ).toBeInTheDocument();
    expect(global.fetch).toBeCalledTimes(1);
    expect(global.fetch).toBeCalledWith(API_BOOKMARK_ADD, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: '{"url":"https://www.google.com/","title":"Google"}',
    });
  });

  it("無効なURLが入力された場合", async () => {
    render(<Popup />);

    const urlInput = await screen.findByLabelText("url");
    await user.clear(urlInput);
    await user.type(urlInput, "invalid-url");

    const registerButton = await screen.findByRole("button", { name: "登録" });
    expect(registerButton).toBeDisabled();
  });

  it("タイトルが空の場合、登録ボタンは無効になる", async () => {
    render(<Popup />);

    const registerButton = await screen.findByRole("button", { name: "登録" });
    const titleInput = await screen.findByLabelText("title");

    // Initially, with a valid title, the button is enabled.
    expect(titleInput).toHaveValue("サンプルのページのタイトル");
    expect(registerButton).toBeEnabled();

    // Clear the title
    await user.clear(titleInput);

    // Now, the button should be disabled
    expect(registerButton).toBeDisabled();

    // Verify no message is shown and no fetch is made, because the button is disabled
    // and the click handler that sets the message is not supposed to be called.
    await user.click(registerButton);
    expect(
      screen.queryByText("登録できません: タイトルが指定されていません")
    ).not.toBeInTheDocument();
    expect(global.fetch).not.toBeCalled();
  });

  describe("オプションページで設定したURLを利用する", () => {
    const customApiUrl = "https://custom-api.example.com/bookmarks";

    beforeEach(() => {
      // global.chromeオブジェクト全体を再定義する代わりに、
      // storage.local.getのモック実装を上書きします。
      (global.chrome.storage.local.get as Mock).mockImplementation(
        (
          _keys: string | string[] | { [key: string]: unknown } | null,
          callback: (items: { [key: string]: unknown }) => void
        ) => {
          callback({ bookmarkUrl: customApiUrl });
        }
      );
    });

    it("ブックマークを登録", async () => {
      (global.fetch as Mock).mockImplementation(
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

      const urlInput = await screen.findByLabelText("url");
      const titleInput = await screen.findByLabelText("title");

      await user.clear(urlInput);
      await user.type(urlInput, "https://www.google.com/");
      await user.clear(titleInput);
      await user.type(titleInput, "Google");

      const registerButton = await screen.findByRole("button", {
        name: "登録",
      });
      await user.click(registerButton);

      expect(global.fetch).toBeCalledTimes(1);
      expect(global.fetch).toBeCalledWith(customApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: '{"url":"https://www.google.com/","title":"Google"}',
      });
      expect(
        await screen.findByText("ブックマークが登録されました。")
      ).toBeInTheDocument();
    });
  });

  describe("エラーメッセージが出力される場合", () => {
    let consoleErrorSpy: MockInstance;

    beforeEach(() => {
      // console.errorをモック化して、コンソールへの出力を抑制する
      consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    });

    // フォームへの入力と登録ボタンのクリックを共通化
    beforeEach(async () => {
      render(<Popup />);
      const urlInput = await screen.findByLabelText("url");
      const titleInput = await screen.findByLabelText("title");

      await user.clear(urlInput);
      await user.type(urlInput, "https://www.amazon.co.jp/");
      await user.clear(titleInput);
      await user.type(titleInput, "Amazon");
    });

    afterEach(() => {
      consoleErrorSpy.mockRestore();
    });

    it.each([
      {
        testName: "APIリクエストで例外が発生",
        mockFetch: vi.fn().mockRejectedValue(new Error("APIエラー")),
        expectedMessage: "Error: APIエラー",
        expectedConsoleError: new Error("APIエラー"),
      },
      {
        testName: "エラーのレスポンスがJSON形式でないエラー",
        mockFetch: vi
          .fn()
          .mockResolvedValue(new Response("invalid json", { status: 500 })),
        expectedMessage:
          "ブックマークの登録に失敗しました。ステータス: 500: Unexpected token 'i', \"invalid json\" is not valid JSON",
        expectedConsoleError:
          "ブックマークの登録に失敗しました。ステータス: 500: Unexpected token 'i', \"invalid json\" is not valid JSON",
      },
    ])(
      "$testName",
      async ({ mockFetch, expectedMessage, expectedConsoleError }) => {
        (global.fetch as Mock).mockImplementation(mockFetch);

        const registerButton = await screen.findByRole("button", {
          name: "登録",
        });
        await user.click(registerButton);

        expect(await screen.findByText(expectedMessage)).toBeInTheDocument();
        expect(global.fetch).toBeCalledTimes(1);
        expect(global.fetch).toBeCalledWith(API_BOOKMARK_ADD, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: '{"url":"https://www.amazon.co.jp/","title":"Amazon"}',
        });
        expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
        expect(consoleErrorSpy).toHaveBeenCalledWith(expectedConsoleError);
      }
    );
  });

  describe("Chrome APIのエラーハンドリング", () => {
    let consoleErrorSpy: MockInstance;

    beforeEach(() => {
      consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
      consoleErrorSpy.mockRestore();
    });

    it("chrome.storage.local.getでエラーが発生した場合", async () => {
      const errorMessage = "storage.local.get failed";
      (global.chrome.storage.local.get as Mock).mockImplementation(
        (
          _keys: string | string[] | { [key: string]: unknown } | null,
          callback: (items: { [key: string]: unknown }) => void
        ) => {
          global.chrome.runtime.lastError = { message: errorMessage };
          callback({});
        }
      );

      render(<Popup />);

      expect(consoleErrorSpy).toHaveBeenCalledWith(errorMessage);
    });

    it("chrome.tabs.queryでエラーが発生した場合", async () => {
      const errorMessage = "tabs.query failed";
      (global.chrome.tabs.query as Mock).mockImplementation(
        (_options, callback) => {
          global.chrome.runtime.lastError = { message: errorMessage };
          callback([]);
        }
      );

      render(<Popup />);

      expect(await screen.findByLabelText("title")).toHaveValue("");
      expect(consoleErrorSpy).toHaveBeenCalledWith(errorMessage);
      expect(await screen.findByLabelText("url")).toHaveValue(
        "URLの取得に失敗しました。"
      );
      const registerButton = await screen.findByRole("button", {
        name: "登録",
      });
      expect(registerButton).toBeDisabled();
    });
  });
});
