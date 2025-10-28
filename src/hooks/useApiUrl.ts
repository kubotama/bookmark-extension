/// <reference types="chrome"/>

import { useCallback, useEffect, useState } from "react";

import {
  API_BASE_URL,
  API_ENDPOINT,
  POPUP_FAILED_TO_FETCH_API_URL,
  STORAGE_KEY_API_BASE_URL,
} from "../constants/constants";

export const useApiUrl = () => {
  const [apiBaseUrl, setApiBaseUrl] = useState<string>(API_BASE_URL);
  const [isApiUrlLoaded, setIsApiUrlLoaded] = useState<boolean>(false);

  const getApiBookmarkAddUrl = useCallback(() => {
    return new URL(API_ENDPOINT.ADD_BOOKMARK, apiBaseUrl).href;
  }, [apiBaseUrl]);

  useEffect(() => {
    const abortController = new AbortController();
    const { signal } = abortController;

    const fetchApiUrl = async () => {
      try {
        const result = await chrome.storage.local.get([
          STORAGE_KEY_API_BASE_URL,
        ]);
        if (!signal.aborted && result[STORAGE_KEY_API_BASE_URL]) {
          setApiBaseUrl(result[STORAGE_KEY_API_BASE_URL]);
        }
      } catch (error) {
        if (!signal.aborted) {
          console.error(POPUP_FAILED_TO_FETCH_API_URL, error);
        }
      } finally {
        if (!signal.aborted) {
          setIsApiUrlLoaded(true);
        }
      }
    };

    fetchApiUrl();

    return () => {
      abortController.abort();
    };
  }, []);

  return { getApiBookmarkAddUrl, isApiUrlLoaded };
};
