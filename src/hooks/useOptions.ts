import { useEffect, useState } from "react";

import { createMessage, type MessageData } from "./useMessage";
import {
  OPTION_SAVE_SUCCESS_MESSAGE,
  STORAGE_KEY_API_BASE_URL,
} from "../constants/constants";

export const useOptions = () => {
  const [baseUrl, setBaseUrl] = useState("");
  const [saveMessage, setSaveMessage] = useState<MessageData | null>(null);

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
  const handleSave = async () => {
    if (baseUrl) {
      await chrome.storage.local.set({ [STORAGE_KEY_API_BASE_URL]: baseUrl });
      setSaveMessage(createMessage(OPTION_SAVE_SUCCESS_MESSAGE, "success"));
    }
  };

  return { baseUrl, setBaseUrl, saveMessage, handleSave };
};
