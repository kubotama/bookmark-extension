import {
  BACKGROUND_TAB_ACTIVATE_ERROR_PREFIX,
  BACKGROUND_TAB_UPDATE_ERROR_PREFIX,
} from "./constants";

const updateIcon = async (tab) => {
  if (!tab || !tab.url || !tab.url.startsWith("http")) {
    return;
  }

  const isBookmarked = await chrome.bookmarks.search({ url: tab.url });
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

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete") {
    try {
      await updateIcon(tab);
    } catch (e) {
      console.error(`${BACKGROUND_TAB_UPDATE_ERROR_PREFIX}${e}`);
    }
  }
});

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    await updateIcon(tab);
  } catch (e) {
    console.error(`${BACKGROUND_TAB_ACTIVATE_ERROR_PREFIX}${e}`);
  }
});
