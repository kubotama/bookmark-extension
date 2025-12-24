import {
  API_ENDPOINT,
  BACKGROUND_TAB_ACTIVATE_ERROR_PREFIX,
  BACKGROUND_TAB_UPDATE_ERROR_PREFIX,
  DEFAULT_ICON_PATHS,
  INVALID_BOOKMARK_ARRAY_ERROR,
  INVALID_URL_ERROR_MESSAGE,
  NO_TAB_ERROR_PREFIX,
  OPTION_FAILED_API_REQUEST_PREFIX,
  OPTION_FAILED_FETCH_BOOKMARKS_PREFIX,
  OPTION_FAILED_UPDATE_ICON_PREFIX,
  SAVED_ICON_PATHS,
} from "./constants/constants";
import { type Bookmark, areBookmarks } from "./lib/bookmark";
import { getApiUrl, getStoredApiBaseUrl, isValidUrl } from "./lib/url";

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

  const apiBaseUrl = await getStoredApiBaseUrl();

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
    const json = await response.json();
    if (!areBookmarks(json)) {
      throw new Error(INVALID_BOOKMARK_ARRAY_ERROR);
    }
    bookmarks = json;
  } catch (error) {
    console.error(OPTION_FAILED_FETCH_BOOKMARKS_PREFIX, error);
    await setIconToDefault(tab.id);
    return;
  }

  const isBookmarked = bookmarks.some(
    (bookmark) => bookmark.url === currentUrl
  );
  const iconPath = isBookmarked ? SAVED_ICON_PATHS : DEFAULT_ICON_PATHS;

  try {
    await setIcon({
      path: iconPath,
      tabId: tab.id,
    });
  } catch (error) {
    console.error(OPTION_FAILED_UPDATE_ICON_PREFIX, error);
    // 保存済みアイコンの設定に失敗した場合のみ、デフォルトアイコンへのフォールバックを試みる
    if (isBookmarked) {
      await setIconToDefault(tab.id);
    }
  }
};

/**
 * タブIDに基づいてタブ情報を取得し、指定された関数でアイコンを更新します。
 * @param tabId - アイコンを更新するタブのID。
 * @param updateIconFn - タブオブジェクトを受け取りアイコン更新処理を行う非同期関数。
 * @param errorPrefix - エラー発生時にコンソールに出力するメッセージのプレフィックス。
 */
const updateTabIconById = async (
  tabId: number,
  updateIconFn: (tab: chrome.tabs.Tab) => Promise<void>,
  errorPrefix: string
): Promise<void> => {
  try {
    const tab = await chrome.tabs.get(tabId);
    await updateIconFn(tab);
  } catch (e) {
    if (e instanceof Error && e.message.startsWith(NO_TAB_ERROR_PREFIX)) {
      return;
    }
    console.error(errorPrefix, e);
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
      await updateTabIconById(
        tabId,
        updateIconFn,
        BACKGROUND_TAB_UPDATE_ERROR_PREFIX
      );
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
    await updateTabIconById(
      activeInfo.tabId,
      updateIconFn,
      BACKGROUND_TAB_ACTIVATE_ERROR_PREFIX
    );
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
