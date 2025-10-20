import { useCallback, useMemo, useState } from "react";

import {
  POPUP_REGISTER_CONFLICT_ERROR_PREFIX,
  POPUP_REGISTER_FAILED_PREFIX,
  POPUP_REGISTER_SUCCESS_MESSAGE,
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
  const [messageText, setMessageText] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  const handleUrlChange = useCallback(
    (newUrl: string) => {
      setActiveTabUrl(newUrl);

      setMessageText(
        isValidUrl(newUrl) ? undefined : `無効なURLです: ${newUrl}`
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
    setMessageText(undefined); // メッセージをリセット

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookmark),
      });

      if (response.ok) {
        setMessageText(POPUP_REGISTER_SUCCESS_MESSAGE);
      } else {
        try {
          const errorData = await response.json();
          setMessageText(
            `${POPUP_REGISTER_CONFLICT_ERROR_PREFIX}${
              errorData.message || response.statusText
            }`
          );
        } catch (error) {
          const errorMessage = `${POPUP_REGISTER_FAILED_PREFIX}${response.status}`;
          setMessageText(errorMessage);
          console.error(`${errorMessage}:`, error);
        }
      }
    } catch (error) {
      // fetchがrejectするエラーは通常Errorインスタンスですが、予期せぬケースを考慮します。
      // 文字列やオブジェクトがthrowされる可能性も考えられます。
      const errorMessage = `${POPUP_UNEXPECTED_ERROR_PREFIX}${String(error)}`;
      setMessageText(errorMessage);
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
    messageText,
    registerClick,
    handleUrlChange,
    isRegisterDisabled,
  };
};
