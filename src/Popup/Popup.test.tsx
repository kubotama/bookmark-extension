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

import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent, { type UserEvent } from "@testing-library/user-event";

import {
  API_BOOKMARK_ADD,
  LABEL_TITLE,
  LABEL_URL,
  POPUP_REGISTER_BUTTON_TEXT,
  POPUP_REGISTER_SUCCESS_MESSAGE,
  POPUP_URL_FETCH_ERROR_MESSAGE,
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
  let consoleErrorSpy: MockInstance;

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

    // console.errorをモック化して、コンソールへの出力を抑制する
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  // vi.fn()でモック化したものは、afterEachでクリアするのが一般的です
  afterEach(() => {
    consoleErrorSpy.mockRestore();
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
      await screen.findByRole("button", { name: POPUP_REGISTER_BUTTON_TEXT })
    ).toBeInTheDocument();
    expect(await screen.findByLabelText(LABEL_URL)).toHaveValue(
      "https://example.com"
    );
    expect(await screen.findByLabelText(LABEL_TITLE)).toHaveValue(
      "サンプルのページのタイトル"
    );
  });

  it("アクティブなタブのURL取得に失敗した場合、エラーメッセージが表示される", async () => {
    mockQuery.mockResolvedValue([]);

    render(<Popup />);

    expect(
      await screen.findByText(POPUP_REGISTER_BUTTON_TEXT)
    ).toBeInTheDocument();
    expect(await screen.findByLabelText(LABEL_URL)).toHaveValue(
      POPUP_URL_FETCH_ERROR_MESSAGE
    );
  });

  it("アクティブなタブのタイトルの取得に失敗した場合、タイトルは空になり登録ボタンは無効になる", async () => {
    mockQuery.mockResolvedValue([
      createMockTab("https://example.com", undefined),
    ]);

    render(<Popup />);

    expect(await screen.findByLabelText(LABEL_TITLE)).toHaveValue("");
    const registerButton = await screen.findByRole("button", {
      name: POPUP_REGISTER_BUTTON_TEXT,
    });
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

    const urlInput = await screen.findByLabelText(LABEL_URL);
    const titleInput = await screen.findByLabelText(LABEL_TITLE);

    await user.clear(urlInput);
    await user.type(urlInput, "https://www.google.com/");
    await user.clear(titleInput);
    await user.type(titleInput, "Google");

    const registerButton = await screen.findByRole("button", {
      name: POPUP_REGISTER_BUTTON_TEXT,
    });
    await user.click(registerButton);

    const message = await screen.findByText(POPUP_REGISTER_SUCCESS_MESSAGE);
    expect(message.parentElement).toHaveClass("message message--success");

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

    const urlInput = await screen.findByLabelText(LABEL_URL);
    const titleInput = await screen.findByLabelText(LABEL_TITLE);

    await user.clear(urlInput);
    await user.type(urlInput, "https://www.google.com/");
    await user.clear(titleInput);
    await user.type(titleInput, "Google");

    const registerButton = await screen.findByRole("button", {
      name: POPUP_REGISTER_BUTTON_TEXT,
    });
    await user.click(registerButton);

    const message = await screen.findByText(
      "登録失敗: 指定されたURLのブックマークは既に登録されています。"
    );
    expect(message.parentElement).toHaveClass("message message--error");

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

    const urlInput = await screen.findByLabelText(LABEL_URL);
    await user.clear(urlInput);
    await user.type(urlInput, "invalid-url");

    const registerButton = await screen.findByRole("button", {
      name: POPUP_REGISTER_BUTTON_TEXT,
    });
    expect(registerButton).toBeDisabled();
  });

  it("タイトルが空の場合、登録ボタンは無効になる", async () => {
    render(<Popup />);

    const registerButton = await screen.findByRole("button", {
      name: POPUP_REGISTER_BUTTON_TEXT,
    });
    const titleInput = await screen.findByLabelText(LABEL_TITLE);

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

  it("登録処理中に登録ボタンが無効化されること", async () => {
    // fetchが即座に解決されないようにPromiseを作成
    let resolveFetch: (value: Response) => void;
    const fetchPromise = new Promise<Response>((resolve) => {
      resolveFetch = resolve;
    });

    (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
      () => fetchPromise
    );

    render(<Popup />);

    const registerButton = await screen.findByRole("button", {
      name: POPUP_REGISTER_BUTTON_TEXT,
    });
    expect(registerButton).toBeEnabled();

    // user.clickは非同期イベントなので、完了を待つ
    await user.click(registerButton);

    // isLoadingがtrueになり、ボタンが無効化されることを確認
    expect(registerButton).toBeDisabled();

    // fetchを解決して処理を完了させる
    await act(async () => {
      resolveFetch(new Response(JSON.stringify({ id: 1 }), { status: 200 }));
    });

    // 処理完了後、ボタンが再度有効になることを確認
    await waitFor(() => {
      expect(registerButton).toBeEnabled();
    });
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

      const urlInput = await screen.findByLabelText(LABEL_URL);
      const titleInput = await screen.findByLabelText(LABEL_TITLE);

      await user.clear(urlInput);
      await user.type(urlInput, "https://www.google.com/");
      await user.clear(titleInput);
      await user.type(titleInput, "Google");

      const registerButton = await screen.findByRole("button", {
        name: POPUP_REGISTER_BUTTON_TEXT,
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
      const message = await screen.findByText(POPUP_REGISTER_SUCCESS_MESSAGE);
      expect(message.parentElement).toHaveClass("message message--success");
    });
  });

  describe("エラーメッセージが出力される場合", () => {
    // フォームへの入力と登録ボタンのクリックを共通化
    beforeEach(async () => {
      render(<Popup />);
      const urlInput = await screen.findByLabelText(LABEL_URL);
      const titleInput = await screen.findByLabelText(LABEL_TITLE);

      await user.clear(urlInput);
      await user.type(urlInput, "https://www.amazon.co.jp/");
      await user.clear(titleInput);
      await user.type(titleInput, "Amazon");
    });

    it.each([
      {
        testName: "APIリクエストで例外が発生",
        mockFetch: () => Promise.reject(new Error("APIエラー")),
        expectedMessage: "予期せぬエラーが発生しました: APIエラー",
        expectedConsoleError: [
          "予期せぬエラーが発生しました: APIエラー",
          new Error("APIエラー"),
        ],
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
        expectedMessage: "登録失敗: エラー応答の解析に失敗しました。",
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

        const message = await screen.findByText(expectedMessage);
        expect(message.parentElement).toHaveClass("message message--error");

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
          // 配列でない場合もスプレッド構文で対応可能
          const args = Array.isArray(expectedConsoleError)
            ? expectedConsoleError
            : [expectedConsoleError];
          expect(consoleErrorSpy).toHaveBeenCalledWith(...args);
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

      expect(await screen.findByLabelText(LABEL_TITLE)).toHaveValue("");
      expect(consoleErrorSpy).toHaveBeenCalledWith(errorMessage);
      expect(await screen.findByLabelText(LABEL_URL)).toHaveValue(
        "URLの取得に失敗しました。"
      );
      const registerButton = await screen.findByRole("button", {
        name: "登録",
      });
      expect(registerButton).toBeDisabled();
    });
  });
});
