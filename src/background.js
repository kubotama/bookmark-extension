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

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete") {
    updateIcon(tab);
  }
});

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await chrome.tabs.get(activeInfo.tabId);
  updateIcon(tab);
});
