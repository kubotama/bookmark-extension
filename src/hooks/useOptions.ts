import { useCallback, useEffect, useState } from "react";

import {
  API_ERROR_MESSAGE,
  FAILED_TO_CONNECT_API,
  FAILED_TO_CONNECT_API_WITH_NETWORK,
  OPTION_INVALID_BASE_URL_ERROR,
  OPTION_INVALID_BASE_URL_PREFIX,
  OPTION_SAVE_SUCCESS_MESSAGE,
  OPTION_UNEXPECTED_API_RESPONSE_ERROR,
  OPTION_UNEXPECTED_API_RESPONSE_PREFIX,
  STORAGE_KEY_API_BASE_URL,
  SUCCESS_MESSAGE,
} from "../constants/constants";
import { getStoredApiBaseUrl, validateUrl } from "../lib/url";
import { useApiUrl } from "./useApiUrl";
import { createMessage, type MessageData } from "./useMessage";

export const useOptions = () => {
  const [baseUrl, setBaseUrl] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState<MessageData | null>(
    null
  );
  const [urlError, setUrlError] = useState("");
  const { getApiBookmarkGetUrl } = useApiUrl();

  useEffect(() => {
    const abortController = new AbortController();
    const { signal } = abortController;

    const loadUrl = async () => {
      const url = await getStoredApiBaseUrl();
      if (!signal.aborted) {
        setBaseUrl(url);
      }
    };

    loadUrl();

    return () => {
      abortController.abort();
    };
  }, []);

  const handleBaseUrlChange = (newUrl: string) => {
    setBaseUrl(newUrl);
    setUrlError(validateUrl(newUrl));
  };

  const verifyClick = useCallback(async () => {
    let apiUrl: string;
    try {
      apiUrl = getApiBookmarkGetUrl();
    } catch (error) {
      // URL生成時のエラー（主に不正なURL）
      console.error(OPTION_INVALID_BASE_URL_PREFIX, error);
      setFeedbackMessage(createMessage(OPTION_INVALID_BASE_URL_ERROR, "error"));
      return;
    }
    try {
      const response = await fetch(apiUrl);

      if (response.ok) {
        const handleUnexpectedApiResponse = (errorDetail: unknown) => {
          console.error(OPTION_UNEXPECTED_API_RESPONSE_PREFIX, errorDetail);
          setFeedbackMessage(
            createMessage(OPTION_UNEXPECTED_API_RESPONSE_ERROR, "error")
          );
        };

        let data;
        try {
          data = await response.json();
        } catch (error) {
          handleUnexpectedApiResponse(error);
          return;
        }
        if (Array.isArray(data)) {
          setFeedbackMessage(
            createMessage(SUCCESS_MESSAGE(data.length), "success")
          );
        } else {
          handleUnexpectedApiResponse(data);
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
    const error = validateUrl(baseUrl);
    setUrlError(error);
    if (error) {
      return;
    }
    await chrome.storage.local.set({ [STORAGE_KEY_API_BASE_URL]: baseUrl });
    setFeedbackMessage(createMessage(OPTION_SAVE_SUCCESS_MESSAGE, "success"));
  };

  return {
    baseUrl,
    feedbackMessage,
    handleSave,
    verifyClick,
    urlError,
    handleBaseUrlChange,
  };
};
