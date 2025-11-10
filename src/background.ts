import {
  API_BASE_URL,
  API_ENDPOINT,
  BACKGROUND_TAB_ACTIVATE_ERROR_PREFIX,
  BACKGROUND_TAB_UPDATE_ERROR_PREFIX,
  STORAGE_KEY_API_BASE_URL,
} from "./constants/constants";
import { isValidUrl } from "./lib/url";

type Bookmark = {
  id: number;
  url: string;
  title: string;
  createdAt: string;
  updatedAt: string;
};

const getApiUrl = (apiPath: string, baseUrl: string) => {
  try {
    return new URL(apiPath, baseUrl).href;
  } catch (error) {
    console.error("Failed to create API URL:", error);
    throw error;
  }
};

export const updateIcon = async (tab: chrome.tabs.Tab): Promise<void> => {
  if (!tab || !tab.id || !tab.url || !tab.url.startsWith("http")) {
    return;
  }

  const url = new URL(tab.url);
  url.hash = "";
  const currentUrl = url.href;

  const storageData = await chrome.storage.local.get(STORAGE_KEY_API_BASE_URL);
  const apiBaseUrl = storageData?.[STORAGE_KEY_API_BASE_URL] ?? API_BASE_URL;

  if (typeof apiBaseUrl !== "string" || !isValidUrl(apiBaseUrl)) {
    console.error("Invalid API Base URL:", apiBaseUrl);
    // API のベース URL が無効な場合、デフォルトアイコンを設定するなどのフォールバック処理
    chrome.action.setIcon({
      path: {
        16: "icons/icon16.png",
        48: "icons/icon48.png",
        128: "icons/icon128.png",
      },
      tabId: tab.id,
    });
    return;
  }

  try {
    const apiUrl = getApiUrl(API_ENDPOINT.GET_BOOKMARKS, apiBaseUrl);
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    const bookmarks: Bookmark[] = await response.json();
    const isBookmarked = bookmarks.some(
      (bookmark) => bookmark.url === currentUrl
    );

    const iconPrefix = isBookmarked ? "icon-saved" : "icon";
    const iconPath = {
      16: `icons/${iconPrefix}16.png`,
      48: `icons/${iconPrefix}48.png`,
      128: `icons/${iconPrefix}128.png`,
    };

    chrome.action.setIcon({
      path: iconPath,
      tabId: tab.id,
    });
  } catch (error) {
    console.error("Failed to fetch bookmarks or update icon:", error);
    // エラーが発生した場合、デフォルトアイコンを設定
    chrome.action.setIcon({
      path: {
        16: "icons/icon16.png",
        48: "icons/icon48.png",
        128: "icons/icon128.png",
      },
      tabId: tab.id,
    });
  }
};

/**
 * onUpdatedリスナー関数を生成するファクトリ関数。
 * updateIconFnを依存性として受け取ります。
 */
export const createOnUpdated = (
  updateIconFn: (tab: chrome.tabs.Tab) => Promise<void>
) => {
  return async (
    tabId: number,
    changeInfo: chrome.tabs.TabChangeInfo
    // // eslint-disable-next-line @typescript-eslint/no-unused-vars
    // _tab: chrome.tabs.Tab
  ): Promise<void> => {
    if (changeInfo.status === "complete") {
      try {
        const tab = await chrome.tabs.get(tabId);
        await updateIconFn(tab);
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
const initializeBackgroundListeners = (
  updateIconFn: (tab: chrome.tabs.Tab) => Promise<void>
) => {
  const onUpdatedListener = createOnUpdated(updateIconFn);
  const onActivatedListener = createOnActivated(updateIconFn);

  chrome.tabs.onUpdated.addListener(onUpdatedListener);
  chrome.tabs.onActivated.addListener(onActivatedListener);
};

// アプリケーションのエントリーポイントで、実際のupdateIcon関数を渡してリスナーを初期化します。
initializeBackgroundListeners(updateIcon);
