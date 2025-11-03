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

/**
 * onUpdatedリスナー関数を生成するファクトリ関数。
 * updateIconFnを依存性として受け取ります。
 */
export const createOnUpdated = (
  updateIconFn: (tab: chrome.tabs.Tab) => Promise<void>
) => {
  return async (
    _tabId: number,
    changeInfo: chrome.tabs.TabChangeInfo,
    tab: chrome.tabs.Tab
  ): Promise<void> => {
    if (changeInfo.status === "complete") {
      try {
        await updateIconFn(tab); // 注入されたupdateIconFnを使用
      } catch (e) {
        console.error(BACKGROUND_TAB_UPDATE_ERROR_PREFIX, e);
      }
    }
  };
};

/**
 * onActivatedリスナー関数を生成するファクトリ関数。
 * updateIconFnを依存性として受け取ります。
 */
export const createOnActivated = (
  updateIconFn: (tab: chrome.tabs.Tab) => Promise<void>
) => {
  return async (activeInfo: chrome.tabs.TabActiveInfo): Promise<void> => {
    try {
      const tab = await chrome.tabs.get(activeInfo.tabId);
      await updateIconFn(tab); // 注入されたupdateIconFnを使用
    } catch (e) {
      console.error(BACKGROUND_TAB_ACTIVATE_ERROR_PREFIX, e);
    }
  };
};

/**
 * バックグラウンドスクリプトのリスナーを初期化する関数。
 * 実際のupdateIcon関数を渡してリスナーを登録します。
 */
export const initializeBackgroundListeners = (
  updateIconFn: (tab: chrome.tabs.Tab) => Promise<void>
) => {
  const onUpdatedListener = createOnUpdated(updateIconFn);
  const onActivatedListener = createOnActivated(updateIconFn);

  chrome.tabs.onUpdated.addListener(onUpdatedListener);
  chrome.tabs.onActivated.addListener(onActivatedListener);
};

// アプリケーションのエントリーポイントで、実際のupdateIcon関数を渡してリスナーを初期化します。
initializeBackgroundListeners(updateIcon);
