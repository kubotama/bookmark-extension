import {
  vi,
  describe,
  it,
  expect,
  beforeEach,
  type MockInstance,
  type MockedFunction,
} from "vitest";
import * as background from "./background.ts"; // Import all exports

import {
  BACKGROUND_TAB_ACTIVATE_ERROR_PREFIX,
  BACKGROUND_TAB_UPDATE_ERROR_PREFIX,
  DEFAULT_ICON_PATHS,
  SAVED_ICON_PATHS,
  INVALID_URL_ERROR_MESSAGE,
  OPTION_FAILED_FETCH_BOOKMARKS_PREFIX,
} from "./constants/constants.ts";

const MOCK_TAB: chrome.tabs.Tab = {
  id: 1,
  url: "https://example.com",
  active: true,
  autoDiscardable: true,
  discarded: false,
  groupId: -1, // chrome.tabGroups.TAB_GROUP_ID_NONE
  highlighted: true,
  incognito: false,
  index: 0,
  pinned: false,
  windowId: 1,
  frozen: false,
  selected: false,
};

let consoleErrorSpy: MockInstance;

beforeEach(() => {
  vi.clearAllMocks();
  consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  consoleErrorSpy.mockRestore();
});

describe("updateIcon", () => {
  const testCasesForNotCall = [
    {
      description: "should not do anything if tab has no url",
      tab: { id: 1 } as chrome.tabs.Tab,
    },
    {
      description: "should not do anything if tab has undefined",
      tab: { id: 1, url: undefined } as chrome.tabs.Tab,
    },
    {
      description:
        "should not do anything for non-http urls(chrome://extensions)",
      tab: { id: 1, url: "chrome://extensions" } as chrome.tabs.Tab,
    },
    {
      description: "should not do anything for non-http urls(file:///)",
      tab: { id: 1, url: "file:///" } as chrome.tabs.Tab,
    },
  ];

  it.each(testCasesForNotCall)("$description", async ({ tab }) => {
    await background.updateIcon(tab);
    expect(chrome.storage.local.get).not.toHaveBeenCalled();
    expect(chrome.action.setIcon).not.toHaveBeenCalled();
  });

  const testCasesForCall = [
    {
      description: "should set saved icon if page is bookmarked",
      apiBaseUrl: "https://api.example.com",
      bookmarks: [
        {
          bookmark_id: 1,
          url: "https://example.com/",
          title: "Example",
          keywords: [],
        },
      ],
      tab: { id: 1, url: "https://example.com" } as chrome.tabs.Tab,
      expected: {
        forSetIcon: {
          path: SAVED_ICON_PATHS,
          tabId: 1,
        },
      },
    },
    {
      description: "should set default icon if page is not bookmarked",
      apiBaseUrl: "https://api.example.com",
      bookmarks: [],
      tab: { id: 1, url: "https://example.com" } as chrome.tabs.Tab,
      expected: {
        forSetIcon: {
          path: DEFAULT_ICON_PATHS,
          tabId: 1,
        },
      },
    },
    {
      description: "should ignore hash in url",
      apiBaseUrl: "https://api.example.com",
      bookmarks: [
        {
          bookmark_id: 1,
          url: "https://example.com/",
          title: "Example",
          keywords: [],
        },
      ],
      tab: { id: 1, url: "https://example.com#section" } as chrome.tabs.Tab,
      expected: {
        forSetIcon: {
          path: SAVED_ICON_PATHS,
          tabId: 1,
        },
      },
    },
  ];
  it.each(testCasesForCall)(
    "$description",
    async ({ tab, expected, apiBaseUrl, bookmarks }) => {
      (chrome.storage.local.get as unknown as MockInstance).mockResolvedValue({
        apiBaseUrl,
      });
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => bookmarks,
      });

      await background.updateIcon(tab);

      expect(chrome.action.setIcon).toHaveBeenCalledWith(
        expected.forSetIcon,
        expect.anything()
      );
    }
  );

  it("should set default icon if apiBaseUrl is invalid", async () => {
    (chrome.storage.local.get as unknown as MockInstance).mockResolvedValue({
      apiBaseUrl: "invalid-url",
    });

    await background.updateIcon(MOCK_TAB);

    expect(chrome.action.setIcon).toHaveBeenCalledWith(
      {
        path: DEFAULT_ICON_PATHS,
        tabId: 1,
      },
      expect.anything()
    );
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      INVALID_URL_ERROR_MESSAGE,
      new Error(`apiBaseUrl: invalid-url`)
    );
  });

  it("should set default icon if local storage isn't stored", async () => {
    const apiUrl = "http://localhost:3000/api/bookmarks";

    (chrome.storage.local.get as unknown as MockInstance).mockResolvedValue({});
    const mockFetch = vi.fn().mockImplementation((url) => {
      if (url === apiUrl) {
        return Promise.resolve({
          ok: true,
          json: async () => [],
        });
      }
      return Promise.reject(new Error(`Unexpected fetch call to ${url}`));
    });
    global.fetch = mockFetch;

    await background.updateIcon(MOCK_TAB);

    expect(chrome.action.setIcon).toHaveBeenCalledWith(
      {
        path: DEFAULT_ICON_PATHS,
        tabId: 1,
      },
      expect.anything()
    );
    // 期待通りにfetchが呼ばれたかを確認
    expect(global.fetch).toHaveBeenCalled();

    // 特定のURLで呼ばれたかを確認
    expect(global.fetch).toHaveBeenCalledWith(apiUrl);

    expect(consoleErrorSpy).toBeCalledTimes(0);
  });

  it("should set default icon if fetch fails", async () => {
    (chrome.storage.local.get as unknown as MockInstance).mockResolvedValue({
      apiBaseUrl: "https://api.example.com",
    });
    const error = new Error("Network error");
    global.fetch = vi.fn().mockRejectedValue(error);

    await background.updateIcon(MOCK_TAB);

    expect(chrome.action.setIcon).toHaveBeenCalledWith(
      {
        path: DEFAULT_ICON_PATHS,
        tabId: 1,
      },
      expect.anything()
    );
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      OPTION_FAILED_FETCH_BOOKMARKS_PREFIX,
      error
    );
  });
});

describe("background listeners with dependency injection", () => {
  let updateIconMock: MockedFunction<(tab: chrome.tabs.Tab) => Promise<void>>;

  beforeEach(() => {
    updateIconMock = vi.fn();
  });

  describe("onUpdated", () => {
    it("should call updateIconFn when status is complete", async () => {
      const onUpdatedListener = background.createOnUpdated(updateIconMock); // モックを注入
      (chrome.tabs.get as unknown as MockInstance).mockResolvedValue(MOCK_TAB);
      await onUpdatedListener(MOCK_TAB.id as number, { status: "complete" });
      expect(updateIconMock).toHaveBeenCalledWith(MOCK_TAB);
    });

    it("should not call updateIconFn when status is not complete", async () => {
      const onUpdatedListener = background.createOnUpdated(updateIconMock); // モックを注入
      await onUpdatedListener(MOCK_TAB.id as number, { status: "loading" });
      expect(updateIconMock).not.toHaveBeenCalled();
    });

    it("should log error if updateIconFn throws", async () => {
      const error = new Error("test error");
      updateIconMock.mockRejectedValue(error); // モックがエラーを投げるように設定
      (chrome.tabs.get as unknown as MockInstance).mockResolvedValue(MOCK_TAB);
      const onUpdatedListener = background.createOnUpdated(updateIconMock); // モックを注入
      await onUpdatedListener(MOCK_TAB.id as number, { status: "complete" });
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        BACKGROUND_TAB_UPDATE_ERROR_PREFIX,
        error
      );
    });
  });

  describe("onActivated", () => {
    it("should call updateIconFn for the active tab", async () => {
      const onActivatedListener = background.createOnActivated(updateIconMock); // モックを注入
      (chrome.tabs.get as unknown as MockInstance).mockResolvedValue(MOCK_TAB);
      await onActivatedListener({ tabId: 1, windowId: 1 });
      expect(chrome.tabs.get).toHaveBeenCalledWith(1);
      expect(updateIconMock).toHaveBeenCalledWith(MOCK_TAB);
    });

    it("should log error if chrome.tabs.get throws", async () => {
      const error = new Error("get tab error");
      (chrome.tabs.get as unknown as MockInstance).mockRejectedValue(error);
      const onActivatedListener = background.createOnActivated(updateIconMock); // モックを注入
      await onActivatedListener({ tabId: 1, windowId: 1 });
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        BACKGROUND_TAB_ACTIVATE_ERROR_PREFIX,
        error
      );
    });

    it("should log error if updateIconFn throws", async () => {
      const error = new Error("update icon error");
      updateIconMock.mockRejectedValue(error); // モックがエラーを投げるように設定
      (chrome.tabs.get as unknown as MockInstance).mockResolvedValue(MOCK_TAB);
      const onActivatedListener = background.createOnActivated(updateIconMock); // モックを注入
      await onActivatedListener({ tabId: 1, windowId: 1 });
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        BACKGROUND_TAB_ACTIVATE_ERROR_PREFIX,
        error
      );
    });
  });
});
