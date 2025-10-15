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

import { render, screen, waitFor } from "@testing-library/react";
import userEvent, { type UserEvent } from "@testing-library/user-event";

import {
  API_BOOKMARK_ADD,
  STORAGE_KEY_BOOKMARK_URL,
} from "../constants/constants";
import Popup from "./Popup";

const createMockTab = (
  url: string,
  title: string | undefined
): chrome.tabs.Tab => ({
  id: 1,
  index: 0,
  windowId: 1,
  highlighted: true,
  active: true,
  pinned: false,
  discarded: false,
  autoDiscardable: true,
  incognito: false,
  url,
  title,
  frozen: false,
  selected: false,
  groupId: 0,
});

describe("Popup", () => {
  let user: UserEvent;
  let mockQuery: Mock;
  let mockStorageGet: Mock;

  // トップレベルに共通のモックセットアップを移動
  beforeEach(() => {
    mockQuery = vi
      .fn()
      .mockResolvedValue([
        createMockTab("https://example.com", "サンプルのページのタイトル"),
      ]);
    mockStorageGet = vi.fn().mockResolvedValue({});

    // Mock chrome APIs
    vi.clearAllMocks();
    vi.stubGlobal("chrome", {
      tabs: {
        query: mockQuery,
      },
      storage: {
        local: {
          get: mockStorageGet,
        },
      },
      runtime: {
        lastError: undefined,
      },
    });
    vi.stubGlobal("fetch", vi.fn());
    user = userEvent.setup();
  });

  // vi.fn()でモック化したものは、afterEachでクリアするのが一般的です
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const keyContainsBookmarkUrl = (
    keys: string | string[] | { [key: string]: unknown } | null
  ): boolean => {
    if (keys === STORAGE_KEY_BOOKMARK_URL) return true;
    if (Array.isArray(keys) && keys.includes(STORAGE_KEY_BOOKMARK_URL))
      return true;
    if (
      typeof keys === "object" &&
      keys !== null &&
      !Array.isArray(keys) &&
      Object.prototype.hasOwnProperty.call(keys, STORAGE_KEY_BOOKMARK_URL)
    ) {
      return true;
    }
    return false;
  };

  it("初期表示時にアクティブタブのURLとタイトルが正しく表示される", async () => {
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

  it("アクティブなタブのURL取得に失敗した場合、エラーメッセージが表示される", async () => {
    mockQuery.mockResolvedValue([]);

    render(<Popup />);

    expect(await screen.findByText("登録")).toBeInTheDocument();
    expect(await screen.findByLabelText("url")).toHaveValue(
      "URLの取得に失敗しました。"
    );
  });

  it("アクティブなタブのタイトルの取得に失敗した場合、タイトルは空になり登録ボタンは無効になる", async () => {
    mockQuery.mockResolvedValue([
      createMockTab("https://example.com", undefined),
    ]);

    render(<Popup />);

    expect(await screen.findByLabelText("title")).toHaveValue("");
    const registerButton = await screen.findByRole("button", { name: "登録" });
    expect(registerButton).toBeInTheDocument();
    expect(registerButton).toBeDisabled();
  });

  it("フォームに入力した内容でブックマークを登録する", async () => {
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

  it("既に登録済みのブックマークを登録しようとした場合にエラーメッセージが表示される", async () => {
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

  it("無効なURLが入力された場合、登録ボタンは無効になる", async () => {
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
      mockStorageGet.mockImplementation((keys) => {
        if (keyContainsBookmarkUrl(keys)) {
          return Promise.resolve({ [STORAGE_KEY_BOOKMARK_URL]: customApiUrl });
        } else {
          return Promise.resolve({});
        }
      });
    });

    it("オプションページで設定したURLでブックマークを登録する", async () => {
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
        mockFetch: () => Promise.reject(new Error("APIエラー")),
        expectedMessage: "Error: APIエラー",
        expectedConsoleError: new Error("APIエラー"),
      },
      {
        testName: "エラーのレスポンスがJSON形式でないエラー",
        mockFetch: () =>
          Promise.resolve(new Response("invalid json", { status: 500 })),
        expectedMessage: "ブックマークの登録に失敗しました。ステータス: 500",
        expectedConsoleError: [
          "ブックマークの登録に失敗しました。ステータス: 500:",
          new SyntaxError(
            "Unexpected token 'i', \"invalid json\" is not valid JSON"
          ),
        ],
      },
      {
        testName: "エラーレスポンスのJSONにmessageプロパティがない場合",
        mockFetch: () =>
          Promise.resolve(
            new Response(JSON.stringify({}), {
              status: 400,
              statusText: "Bad Request",
            })
          ),
        expectedMessage: "登録失敗: Bad Request",
        // このケースではconsole.errorは呼ばれない
        expectedConsoleError: undefined,
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
        if (expectedConsoleError) {
          expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
          if (Array.isArray(expectedConsoleError)) {
            expect(consoleErrorSpy).toHaveBeenCalledWith(
              ...expectedConsoleError
            );
          } else {
            expect(consoleErrorSpy).toHaveBeenCalledWith(expectedConsoleError);
          }
        } else {
          expect(consoleErrorSpy).not.toHaveBeenCalled();
        }
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
      mockStorageGet.mockRejectedValue(new Error(errorMessage));

      render(<Popup />);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(errorMessage);
      });
    });

    it("chrome.tabs.queryでエラーが発生した場合", async () => {
      const errorMessage = "tabs.query failed";
      mockQuery.mockRejectedValue(new Error(errorMessage));

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
