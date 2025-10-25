/// <reference types="chrome"/>

import { useCallback, useEffect, useState } from "react";

import { API_BASE_URL, STORAGE_KEY_API_BASE_URL } from "../constants/constants";

export const useApiUrl = () => {
  const [apiBaseUrl, setApiBaseUrl] = useState<string>(API_BASE_URL);
  const [isApiUrlLoaded, setIsApiUrlLoaded] = useState<boolean>(false);

  const getApiBookmarkAddUrl = useCallback(() => {
    return new URL("api/bookmarks", apiBaseUrl).href;
  }, [apiBaseUrl]);

  useEffect(() => {
    let isMounted = true;
    const fetchApiUrl = async () => {
      try {
        const result = await chrome.storage.local.get(STORAGE_KEY_API_BASE_URL);
        if (isMounted && result.apiBaseUrl) {
          // ベースURLの末尾にスラッシュがなければ追加し、パスを結合
          const baseUrl = result.apiBaseUrl.endsWith("/")
            ? result.apiBaseUrl
            : `${result.apiBaseUrl}/`;
          setApiBaseUrl(baseUrl);
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error(error.message);
        }
      } finally {
        if (isMounted) {
          setIsApiUrlLoaded(true);
        }
      }
    };

    fetchApiUrl();

    return () => {
      isMounted = false;
    };
  }, []);

  return { getApiBookmarkAddUrl, isApiUrlLoaded };
};
