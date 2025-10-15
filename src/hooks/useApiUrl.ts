/// <reference types="chrome"/>

import { useEffect, useState } from "react";

import { API_BOOKMARK_ADD } from "../constants/constants";

export const useApiUrl = () => {
  const [apiUrl, setApiUrl] = useState<string>(API_BOOKMARK_ADD);
  const [isApiUrlLoaded, setIsApiUrlLoaded] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    const fetchApiUrl = async () => {
      try {
        const result = await chrome.storage.local.get("bookmarkUrl");
        if (isMounted && result.bookmarkUrl) {
          setApiUrl(result.bookmarkUrl);
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

  return { apiUrl, isApiUrlLoaded };
};
