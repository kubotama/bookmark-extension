import { useCallback, useEffect, useState } from "react";

import { createMessage, type MessageData } from "./useMessage";
import { useApiUrl } from "./useApiUrl";
import {
  OPTION_SAVE_SUCCESS_MESSAGE,
  OPTION_UNEXPECTED_API_RESPONSE_ERROR,
  OPTION_UNEXPECTED_API_RESPONSE_PREFIX,
  STORAGE_KEY_API_BASE_URL,
} from "../constants/constants";

export const SUCCESS_MESSAGE = (count: number) =>
  `${count}件のブックマークを取得しました。`;
export const API_ERROR_MESSAGE = (status: number) =>
  `APIへの接続に失敗しました (HTTP ${status})`;
export const FAILED_TO_CONNECT_API_WITH_NETWORK =
  "APIへの接続に失敗しました。ネットワーク設定などを確認してください。";
export const FAILED_TO_GET_BASE_URL_MESSAGE =
  "APIのベースURLを取得できませんでした:";
export const FAILED_TO_CONNECT_API = "APIへの接続に失敗しました:";

export const useOptions = () => {
  const [baseUrl, setBaseUrl] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState<MessageData | null>(
    null
  );
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
          console.error(FAILED_TO_GET_BASE_URL_MESSAGE, error);
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

    try {
      const response = await fetch(apiUrl);
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setFeedbackMessage(
            createMessage(SUCCESS_MESSAGE(data.length), "success")
          );
        } else {
          console.error(OPTION_UNEXPECTED_API_RESPONSE_PREFIX, data);
          setFeedbackMessage(
            createMessage(OPTION_UNEXPECTED_API_RESPONSE_ERROR, "error")
          );
        }
      } else {
        // サーバーエラーの場合のメッセージ
        setFeedbackMessage(
          createMessage(API_ERROR_MESSAGE(response.status), "error")
        );
      }
    } catch (error) {
      // ネットワークエラーなどの場合のメッセージ
      setFeedbackMessage(
        createMessage(FAILED_TO_CONNECT_API_WITH_NETWORK, "error")
      );
      console.error(FAILED_TO_CONNECT_API, error);
    }
  }, [getApiBookmarkGetUrl]);

  const handleSave = async () => {
    if (baseUrl) {
      await chrome.storage.local.set({ [STORAGE_KEY_API_BASE_URL]: baseUrl });
      setFeedbackMessage(createMessage(OPTION_SAVE_SUCCESS_MESSAGE, "success"));
    }
  };

  return {
    baseUrl,
    setBaseUrl,
    feedbackMessage,
    handleSave,
    verifyClick,
  };
};
