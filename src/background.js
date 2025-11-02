const updateIcon = async (tab) => {
  if (!tab || !tab.url) {
    return;
  }

  const isBookmarked = await chrome.bookmarks.search({ url: tab.url });

  const iconPath =
    isBookmarked.length > 0
      ? {
          16: "icons/icon-saved16.png",
          48: "icons/icon-saved48.png",
          128: "icons/icon-saved128.png",
        }
      : {
          16: "icons/icon16.png",
          48: "icons/icon48.png",
          128: "icons/icon128.png",
        };

  chrome.action.setIcon({
    path: iconPath,
    tabId: tab.id,
  });
};

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete") {
    updateIcon(tab);
  }
});

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await chrome.tabs.get(activeInfo.tabId);
  updateIcon(tab);
});
