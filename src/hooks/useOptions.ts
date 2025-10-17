import { useEffect, useRef, useState } from "react";

import {
  SAVE_MESSAGE_TIMEOUT_MS,
  STORAGE_KEY_BOOKMARK_URL,
} from "../constants/constants";

export const useOptions = () => {
  const [url, setUrl] = useState("");
  const [saveMessage, setSaveMessage] = useState("");

  const timerRef = useRef<number | null>(null);

  // コンポーネントのマウント時にストレージからURLを読み込む
  useEffect(() => {
    const abortController = new AbortController();
    const loadUrl = async () => {
      try {
        const data = await chrome.storage.local.get(STORAGE_KEY_BOOKMARK_URL);
        if (!abortController.signal.aborted && data.bookmarkUrl) {
          setUrl(data.bookmarkUrl);
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
    if (url) {
      await chrome.storage.local.set({ [STORAGE_KEY_BOOKMARK_URL]: url });
      console.log("URL saved:", url);
      setSaveMessage("保存しました！");

      // 既存のタイマーをクリア
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      // 新しいタイマーをセット
      timerRef.current = window.setTimeout(() => {
        setSaveMessage("");
      }, SAVE_MESSAGE_TIMEOUT_MS);
    }
  };

  return {
    url,
    setUrl,
    saveMessage,
    handleSave,
  };
};
