import { useEffect, useState } from "react";

import { createMessage, type MessageData } from "./useMessage";
import {
  OPTION_SAVE_SUCCESS_MESSAGE,
  STORAGE_KEY_API_BASE_URL,
} from "../constants/constants";

export const useOptions = () => {
  const [baseUrl, setBaseUrl] = useState("");
  const [saveMessage, setSaveMessage] = useState<MessageData | null>(null);

  // コンポーネントのマウント時にストレージからURLを読み込む
  useEffect(() => {
    const abortController = new AbortController();
    const signal = abortController.signal;

    chrome.storage.local
      .get([STORAGE_KEY_API_BASE_URL])
      .then((result) => {
        if (!signal.aborted) {
          setBaseUrl(result[STORAGE_KEY_API_BASE_URL] || "");
        }
      })
      .catch((error) => {
        console.error("Failed to get base URL:", error);
      });

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
