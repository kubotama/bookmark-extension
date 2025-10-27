/// <reference types="chrome"/>

import { useCallback, useEffect, useState } from "react";

import {
  API_BASE_URL,
  API_ENDPOINT,
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
        const result = await chrome.storage.local.get(STORAGE_KEY_API_BASE_URL);
        if (!signal.aborted && result.apiBaseUrl) {
          setApiBaseUrl(result.apiBaseUrl);
        }
      } catch (error) {
        if (!signal.aborted && error instanceof Error) {
          console.error(error.message);
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
