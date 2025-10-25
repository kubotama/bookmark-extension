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
    let isMounted = true;
    const fetchApiUrl = async () => {
      try {
        const result = await chrome.storage.local.get(STORAGE_KEY_API_BASE_URL);
        if (isMounted && result.apiBaseUrl) {
          const baseUrl = new URL(result.apiBaseUrl).href;
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
