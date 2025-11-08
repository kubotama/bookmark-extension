/// <reference types="chrome"/>

import { useCallback, useEffect, useState } from "react";

import {
  API_BASE_URL,
  API_ENDPOINT,
  POPUP_FAILED_TO_FETCH_API_URL_PREFIX,
  STORAGE_KEY_API_BASE_URL,
} from "../constants/constants";

const isValidUrl = (url: string): boolean => {
  return url.startsWith("http://") || url.startsWith("https://");
};

export const useApiUrl = () => {
  const [apiBaseUrl, setApiBaseUrl] = useState<string>(API_BASE_URL);
  const [isApiUrlLoaded, setIsApiUrlLoaded] = useState<boolean>(false);
  const [isApiUrlInvalid, setIsApiUrlInvalid] = useState<boolean>(false);

  const getApiUrl = useCallback((apiPath: string, baseUrl: string) => {
    try {
      return new URL(apiPath, baseUrl).href;
    } catch (error) {
      console.error(POPUP_FAILED_TO_FETCH_API_URL_PREFIX, error);
      throw error;
    }
  }, []);

  const getApiBookmarkAddUrl = useCallback(() => {
    return getApiUrl(API_ENDPOINT.ADD_BOOKMARK, apiBaseUrl);
  }, [apiBaseUrl, getApiUrl]);

  const getApiBookmarkGetUrl = useCallback(() => {
    return getApiUrl(API_ENDPOINT.GET_BOOKMARKS, apiBaseUrl);
  }, [apiBaseUrl, getApiUrl]);

  useEffect(() => {
    const abortController = new AbortController();
    const { signal } = abortController;

    const fetchApiUrl = async () => {
      try {
        const result = await chrome.storage.local.get([
          STORAGE_KEY_API_BASE_URL,
        ]);
        const storedUrl = result[STORAGE_KEY_API_BASE_URL];
        if (signal.aborted) {
          return;
        }
        if (typeof storedUrl === "string") {
          const trimmedUrl = storedUrl.trim();
          if (trimmedUrl && isValidUrl(trimmedUrl)) {
            setApiBaseUrl(trimmedUrl);
          } else {
            setIsApiUrlInvalid(true);
          }
        } else if (storedUrl !== undefined) {
          // The value exists in storage but is not a string (e.g., null, number, boolean)
          setIsApiUrlInvalid(true);
        }
      } catch (error) {
        if (!signal.aborted) {
          console.error(POPUP_FAILED_TO_FETCH_API_URL_PREFIX, error);
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

  return {
    getApiBookmarkAddUrl,
    getApiBookmarkGetUrl,
    isApiUrlLoaded,
    isApiUrlInvalid,
  };
};
