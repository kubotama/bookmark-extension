import { useCallback, useMemo, useState } from "react";

import {
  POPUP_REGISTER_CONFLICT_ERROR_PREFIX,
  POPUP_REGISTER_FAILED_PREFIX,
  POPUP_REGISTER_SUCCESS_MESSAGE,
  POPUP_RESPONSE_MESSAGE_PARSE_ERROR,
  POPUP_UNEXPECTED_ERROR_PREFIX,
} from "../constants/constants";
import { useActiveTabInfo } from "./useActiveTabInfo";
import { useApiUrl } from "./useApiUrl";

const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const usePopup = () => {
  const {
    url: activeTabUrl,
    setUrl: setActiveTabUrl,
    title: activeTabTitle,
    setTitle: setActiveTabTitle,
  } = useActiveTabInfo();
  const { apiUrl, isApiUrlLoaded } = useApiUrl();
  const [message, setMessage] = useState<
    { text: string; type: "success" | "error" | "info" } | undefined
  >(undefined);
  const [isLoading, setIsLoading] = useState(false);

  const handleUrlChange = useCallback(
    (newUrl: string) => {
      setActiveTabUrl(newUrl);

      setMessage(
        isValidUrl(newUrl)
          ? undefined
          : { text: `無効なURLです: ${newUrl}`, type: "error" }
      );
    },
    [setActiveTabUrl]
  );

  const registerClick = useCallback(async () => {
    const bookmark = {
      url: activeTabUrl,
      title: activeTabTitle,
    };

    setIsLoading(true);
    setMessage(undefined); // メッセージをリセット

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookmark),
      });

      if (response.ok) {
        setMessage({
          text: POPUP_REGISTER_SUCCESS_MESSAGE,
          type: "success",
        });
      } else {
        try {
          const errorData = await response.json();
          setMessage({
            text: `${POPUP_REGISTER_CONFLICT_ERROR_PREFIX}${
              errorData.message || POPUP_RESPONSE_MESSAGE_PARSE_ERROR
            }`,
            type: "error",
          });
        } catch (error) {
          const errorMessage = `${POPUP_REGISTER_FAILED_PREFIX}${response.status}`;
          setMessage({ text: errorMessage, type: "error" });
          console.error(`${errorMessage}:`, error);
        }
      }
    } catch (error) {
      // fetchがrejectするエラーは通常Errorインスタンスですが、予期せぬケースを考慮します。
      // 文字列やオブジェクトがthrowされる可能性も考えられます。
      const errorMessage = `${POPUP_UNEXPECTED_ERROR_PREFIX}${String(error)}`;
      setMessage({ text: errorMessage, type: "error" });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [apiUrl, activeTabUrl, activeTabTitle]);

  const isRegisterDisabled = useMemo(() => {
    return (
      isLoading ||
      !isApiUrlLoaded ||
      !activeTabTitle ||
      !isValidUrl(activeTabUrl)
    );
  }, [isLoading, isApiUrlLoaded, activeTabTitle, activeTabUrl]);

  return {
    // Tab info
    activeTabUrl,
    activeTabTitle,
    setActiveTabTitle,
    // API status
    isLoading,
    // UI state and handlers
    message,
    registerClick,
    handleUrlChange,
    isRegisterDisabled,
  };
};
