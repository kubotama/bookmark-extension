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
} from "./constants/constants.ts";

describe("updateIcon", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const testCases = [
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

  it.each(testCases)("$description", async ({ tab }) => {
    await background.updateIcon(tab);
    expect(chrome.bookmarks.search).not.toHaveBeenCalled();
    expect(chrome.action.setIcon).not.toHaveBeenCalled();
  });

  it("should set saved icon if page is bookmarked", async () => {
    (chrome.bookmarks.search as unknown as MockInstance).mockResolvedValue([
      {},
    ]);
    const tab = { id: 1, url: "https://example.com" } as chrome.tabs.Tab;
    await background.updateIcon(tab);

    expect(chrome.bookmarks.search).toHaveBeenCalledWith({
      url: "https://example.com/",
    });
    expect(chrome.action.setIcon).toHaveBeenCalledWith({
      path: {
        16: "icons/icon-saved16.png",
        48: "icons/icon-saved48.png",
        128: "icons/icon-saved128.png",
      },
      tabId: 1,
    });
  });

  it("should set default icon if page is not bookmarked", async () => {
    (chrome.bookmarks.search as unknown as MockInstance).mockResolvedValue([]);
    const tab = { id: 1, url: "https://example.com" } as chrome.tabs.Tab;
    await background.updateIcon(tab);

    expect(chrome.bookmarks.search).toHaveBeenCalledWith({
      url: "https://example.com/",
    });
    expect(chrome.action.setIcon).toHaveBeenCalledWith({
      path: {
        16: "icons/icon16.png",
        48: "icons/icon48.png",
        128: "icons/icon128.png",
      },
      tabId: 1,
    });
  });

  it("should ignore hash in url", async () => {
    (chrome.bookmarks.search as unknown as MockInstance).mockResolvedValue([]);
    const tab = {
      id: 1,
      url: "https://example.com#section",
    } as chrome.tabs.Tab;
    await background.updateIcon(tab);

    expect(chrome.bookmarks.search).toHaveBeenCalledWith({
      url: "https://example.com/",
    });
  });
});

describe("background listeners with dependency injection", () => {
  let updateIconMock: MockedFunction<(tab: chrome.tabs.Tab) => Promise<void>>;
  let consoleErrorSpy: MockInstance;

  beforeEach(() => {
    updateIconMock = vi.fn();
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe("onUpdated", () => {
    it("should call updateIconFn when status is complete", async () => {
      const onUpdatedListener = background.createOnUpdated(updateIconMock); // モックを注入
      const tab = { id: 1, url: "https://example.com" } as chrome.tabs.Tab;
      await onUpdatedListener(tab.id as number, { status: "complete" }, tab);
      expect(updateIconMock).toHaveBeenCalledWith(tab);
    });

    it("should not call updateIconFn when status is not complete", async () => {
      const onUpdatedListener = background.createOnUpdated(updateIconMock); // モックを注入
      const tab = { id: 1, url: "https://example.com" } as chrome.tabs.Tab;
      await onUpdatedListener(tab.id as number, { status: "loading" }, tab);
      expect(updateIconMock).not.toHaveBeenCalled();
    });

    it("should log error if updateIconFn throws", async () => {
      const error = new Error("test error");
      updateIconMock.mockRejectedValue(error); // モックがエラーを投げるように設定
      const onUpdatedListener = background.createOnUpdated(updateIconMock); // モックを注入
      const tab = { id: 1, url: "https://example.com" } as chrome.tabs.Tab;
      await onUpdatedListener(tab.id as number, { status: "complete" }, tab);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        BACKGROUND_TAB_UPDATE_ERROR_PREFIX,
        new Error("test error")
      );
    });
  });

  describe("onActivated", () => {
    it("should call updateIconFn for the active tab", async () => {
      const onActivatedListener = background.createOnActivated(updateIconMock); // モックを注入
      const tab = { id: 1, url: "https://example.com" } as chrome.tabs.Tab;
      (chrome.tabs.get as unknown as MockInstance).mockResolvedValue(tab);
      await onActivatedListener({ tabId: 1, windowId: 1 });
      expect(chrome.tabs.get).toHaveBeenCalledWith(1);
      expect(updateIconMock).toHaveBeenCalledWith(tab);
    });

    it("should log error if chrome.tabs.get throws", async () => {
      const error = new Error("get tab error");
      (chrome.tabs.get as unknown as MockInstance).mockRejectedValue(error);
      const onActivatedListener = background.createOnActivated(updateIconMock); // モックを注入
      await onActivatedListener({ tabId: 1, windowId: 1 });
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        BACKGROUND_TAB_ACTIVATE_ERROR_PREFIX,
        new Error("get tab error")
      );
    });

    it("should log error if updateIconFn throws", async () => {
      const error = new Error("update icon error");
      updateIconMock.mockRejectedValue(error); // モックがエラーを投げるように設定
      const tab = { id: 1, url: "https://example.com" } as chrome.tabs.Tab;
      (chrome.tabs.get as unknown as MockInstance).mockResolvedValue(tab);
      const onActivatedListener = background.createOnActivated(updateIconMock); // モックを注入
      await onActivatedListener({ tabId: 1, windowId: 1 });
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        BACKGROUND_TAB_ACTIVATE_ERROR_PREFIX,
        new Error("update icon error")
      );
    });
  });
});
