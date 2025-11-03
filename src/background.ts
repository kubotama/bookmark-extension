import {
  BACKGROUND_TAB_ACTIVATE_ERROR_PREFIX,
  BACKGROUND_TAB_UPDATE_ERROR_PREFIX,
} from "./constants/constants";

export const updateIcon = async (tab: chrome.tabs.Tab): Promise<void> => {
  if (!tab || !tab.id || !tab.url || !tab.url.startsWith("http")) {
    return;
  }

  const url = new URL(tab.url);
  // ページ内リンク（#sectionなど）を無視してブックマークを検索するため、ハッシュを削除
  url.hash = "";
  const isBookmarked = await chrome.bookmarks.search({ url: url.href });
  const iconPrefix = isBookmarked.length ? "icon-saved" : "icon";

  const iconPath = {
    16: `icons/${iconPrefix}16.png`,
    48: `icons/${iconPrefix}48.png`,
    128: `icons/${iconPrefix}128.png`,
  };

  chrome.action.setIcon({
    path: iconPath,
    tabId: tab.id,
  });
};

export const onUpdated = async (
  _tabId: number,
  changeInfo: chrome.tabs.TabChangeInfo,
  tab: chrome.tabs.Tab
): Promise<void> => {
  if (changeInfo.status === "complete") {
    try {
      await updateIcon(tab);
    } catch (e) {
      console.error(`${BACKGROUND_TAB_UPDATE_ERROR_PREFIX}${e}`);
    }
  }
};

chrome.tabs.onUpdated.addListener(onUpdated);

export const onActivated = async (
  activeInfo: chrome.tabs.TabActiveInfo
): Promise<void> => {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    await updateIcon(tab);
  } catch (e) {
    console.error(`${BACKGROUND_TAB_ACTIVATE_ERROR_PREFIX}${e}`);
  }
};

chrome.tabs.onActivated.addListener(onActivated);
