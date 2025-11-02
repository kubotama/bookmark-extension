import {
  vi,
  describe,
  it,
  expect,
  beforeEach,
  type MockInstance,
} from "vitest";
import { updateIcon } from "./background";

describe("updateIcon", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should not do anything if tab is invalid", async () => {
    await updateIcon({} as chrome.tabs.Tab);
    expect(chrome.bookmarks.search).not.toHaveBeenCalled();
    expect(chrome.action.setIcon).not.toHaveBeenCalled();
  });

  it("should set saved icon if page is bookmarked", async () => {
    (chrome.bookmarks.search as unknown as MockInstance).mockResolvedValue([
      {},
    ]);
    const tab = { id: 1, url: "https://example.com" } as chrome.tabs.Tab;
    await updateIcon(tab);

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
    await updateIcon(tab);

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
    await updateIcon(tab);

    expect(chrome.bookmarks.search).toHaveBeenCalledWith({
      url: "https://example.com/",
    });
  });
});
