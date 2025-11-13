import {
  API_ENDPOINT,
  BACKGROUND_TAB_ACTIVATE_ERROR_PREFIX,
  BACKGROUND_TAB_UPDATE_ERROR_PREFIX,
  DEFAULT_ICON_PATHS,
  INVALID_URL_ERROR_MESSAGE,
  OPTION_FAILED_API_REQUEST_PREFIX,
  OPTION_FAILED_FETCH_BOOKMARKS_PREFIX,
  OPTION_FAILED_UPDATE_ICON_PREFIX,
  SAVED_ICON_PATHS,
  STORAGE_KEY_API_BASE_URL,
} from "./constants/constants";
import { getApiUrl, isValidUrl } from "./lib/url";

type Bookmark = {
  id: number;
  url: string;
  title: string;
  createdAt: string;
  updatedAt: string;
};

const setIcon = (options: chrome.action.TabIconDetails): Promise<void> => {
  return new Promise((resolve, reject) => {
    chrome.action.setIcon(options, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve();
      }
    });
  });
};

const setIconToDefault = async (tabId: number) => {
  try {
    await setIcon({ path: DEFAULT_ICON_PATHS, tabId });
  } catch (error) {
    console.error(`Failed to set default icon for tab ${tabId}:`, error);
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
  const apiBaseUrl = storageData?.[STORAGE_KEY_API_BASE_URL] ?? "";

  if (typeof apiBaseUrl !== "string" || !isValidUrl(apiBaseUrl)) {
    console.error(
      INVALID_URL_ERROR_MESSAGE,
      new Error(`apiBaseUrl: ${apiBaseUrl}`)
    );
    // API のベース URL が無効な場合、デフォルトアイコンを設定するなどのフォールバック処理
    await setIconToDefault(tab.id);
    return;
  }

  let bookmarks: Bookmark[];
  try {
    const apiUrl = getApiUrl(API_ENDPOINT.GET_BOOKMARKS, apiBaseUrl);
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`${OPTION_FAILED_API_REQUEST_PREFIX} ${response.status}`);
    }
    bookmarks = await response.json();
  } catch (error) {
    console.error(OPTION_FAILED_FETCH_BOOKMARKS_PREFIX, error);
    await setIconToDefault(tab.id);
    return;
  }

  try {
    await setIcon({
      path: bookmarks.some((bookmark) => bookmark.url === currentUrl)
        ? SAVED_ICON_PATHS
        : DEFAULT_ICON_PATHS,
      tabId: tab.id,
    });
  } catch (error) {
    console.error(OPTION_FAILED_UPDATE_ICON_PREFIX, error);
    await setIconToDefault(tab.id);
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
