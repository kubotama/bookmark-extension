import { useEffect, useRef, useState } from "react";

import { createMessage, type MessageData } from "./useMessage";
import {
  OPTION_SAVE_SUCCESS_MESSAGE,
  SAVE_MESSAGE_TIMEOUT_MS,
  STORAGE_KEY_API_BASE_URL,
} from "../constants/constants";

export const useOptions = () => {
  const [baseUrl, setBaseUrl] = useState("");
  const [saveMessage, setSaveMessage] = useState<MessageData | null>(null);

  const timerRef = useRef<number | null>(null);

  // コンポーネントのマウント時にストレージからURLを読み込む
  useEffect(() => {
    const abortController = new AbortController();
    const loadUrl = async () => {
      try {
        const data = await chrome.storage.local.get(STORAGE_KEY_API_BASE_URL);
        if (!abortController.signal.aborted && data.apiBaseUrl) {
          setBaseUrl(data.apiBaseUrl);
        }
      } catch (error) {
        if (!abortController.signal.aborted) {
          console.error("Failed to load URL from storage:", error);
        }
      }
    };

    loadUrl();

    return () => {
      abortController.abort();
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  // 保存ボタンがクリックされたときの処理
  const handleSave = async () => {
    if (baseUrl) {
      await chrome.storage.local.set({ [STORAGE_KEY_API_BASE_URL]: baseUrl });
      setSaveMessage(createMessage(OPTION_SAVE_SUCCESS_MESSAGE, "success"));

      // 既存のタイマーをクリア
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      // 新しいタイマーをセット
      timerRef.current = window.setTimeout(() => {
        setSaveMessage(null);
      }, SAVE_MESSAGE_TIMEOUT_MS);
    }
  };

  return {
    baseUrl,
    setBaseUrl,
    saveMessage,
    handleSave,
  };
};
