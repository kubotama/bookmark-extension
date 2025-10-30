import { useCallback, useEffect, useState } from "react";

import { createMessage, type MessageData } from "./useMessage";
import { useApiUrl } from "./useApiUrl";
import {
  OPTION_SAVE_SUCCESS_MESSAGE,
  STORAGE_KEY_API_BASE_URL,
} from "../constants/constants";

export const useOptions = () => {
  const [baseUrl, setBaseUrl] = useState("");
  const [saveMessage, setSaveMessage] = useState<MessageData | null>(null);
  const { getApiBookmarkGetUrl } = useApiUrl();

  useEffect(() => {
    const abortController = new AbortController();
    const { signal } = abortController;

    const loadUrl = async () => {
      try {
        const result = await chrome.storage.local.get([
          STORAGE_KEY_API_BASE_URL,
        ]);
        if (!signal.aborted) {
          setBaseUrl(result[STORAGE_KEY_API_BASE_URL] || "");
        }
      } catch (error) {
        if (!signal.aborted) {
          console.error("Failed to get base URL:", error);
        }
      }
    };

    loadUrl();

    return () => {
      abortController.abort();
    };
  }, []);

  const verifyClick = useCallback(async () => {
    const apiUrl = getApiBookmarkGetUrl();

    const response = await fetch(apiUrl);
    if (response.ok) {
      const data = await response.json();
      setSaveMessage(
        createMessage(
          `${data.length}件のブックマークを取得しました。`,
          "success"
        )
      );
    }
  }, [getApiBookmarkGetUrl]);

  const handleSave = async () => {
    if (baseUrl) {
      await chrome.storage.local.set({ [STORAGE_KEY_API_BASE_URL]: baseUrl });
      setSaveMessage(createMessage(OPTION_SAVE_SUCCESS_MESSAGE, "success"));
    }
  };

  return { baseUrl, setBaseUrl, saveMessage, handleSave, verifyClick };
};
