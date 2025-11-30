import {
  API_BASE_URL,
  INVALID_URL_ERROR_MESSAGE,
  OPTION_FAILED_TO_GET_API_BASE_URL_FROM_STORAGE_PREFIX,
  POPUP_FAILED_TO_FETCH_API_URL_PREFIX,
  STORAGE_KEY_API_BASE_URL,
  URL_HOSTNAME_ERROR_MESSAGE,
  URL_PROTOCOL_ERROR_MESSAGE,
  URL_REQUIRED_ERROR_MESSAGE,
} from "../constants/constants";

export const validateUrl = (url: string): string => {
  if (!url) {
    return URL_REQUIRED_ERROR_MESSAGE;
  }
  if (!url.includes("://")) {
    return INVALID_URL_ERROR_MESSAGE;
  }

  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      return URL_PROTOCOL_ERROR_MESSAGE;
    }
    if (
      !parsedUrl.hostname.includes(".") &&
      parsedUrl.hostname !== "localhost"
    ) {
      return URL_HOSTNAME_ERROR_MESSAGE;
    }
  } catch {
    return INVALID_URL_ERROR_MESSAGE;
  }
  return "";
};

export const isValidUrl = (url: string): boolean => {
  return validateUrl(url) === "";
};

export const getApiUrl = (apiPath: string, baseUrl: string) => {
  try {
    return new URL(apiPath, baseUrl).href;
  } catch (error) {
    console.error(POPUP_FAILED_TO_FETCH_API_URL_PREFIX, error);
    throw error;
  }
};

/**
 * ChromeストレージからAPIのベースURLを取得します。
 * 値が未設定の場合はデフォルトのURLを返します。
 * @returns {Promise<string>} APIのベースURL
 */
export const getStoredApiBaseUrl = async (): Promise<string> => {
  try {
    const storageData = await chrome.storage.local.get(
      STORAGE_KEY_API_BASE_URL
    );
    // ストレージの値が存在すればそれを使い、なければデフォルト値を使用する
    return storageData?.[STORAGE_KEY_API_BASE_URL] ?? API_BASE_URL;
  } catch (error) {
    console.error(OPTION_FAILED_TO_GET_API_BASE_URL_FROM_STORAGE_PREFIX, error);
    // エラーが発生した場合もデフォルト値を返す
    return API_BASE_URL;
  }
};
