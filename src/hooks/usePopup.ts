import { useState, useCallback } from "react";

import { useActiveTabInfo } from "./useActiveTabInfo";
import { useApiUrl } from "./useApiUrl";

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

  const isValidUrl = useCallback((url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }, []);

  const handleUrlChange = useCallback(
    (newUrl: string) => {
      setActiveTabUrl(newUrl);

      setMessageText(
        isValidUrl(newUrl) ? undefined : `無効なURLです: ${newUrl}`
      );
    },
    [setActiveTabUrl, isValidUrl]
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
        setMessageText("ブックマークが登録されました。");
      } else {
        try {
          const errorData = await response.json();
          setMessageText(
            `登録失敗: ${errorData.message || response.statusText}`
          );
        } catch (error) {
          const errorMessage = `ブックマークの登録に失敗しました。ステータス: ${response.status}`;
          setMessageText(errorMessage);
          console.error(`${errorMessage}:`, error);
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        setMessageText(`${error.name}: ${error.message}`);
        console.error(error);
      } else {
        // fetchがrejectするエラーは通常Errorインスタンスですが、予期せぬケースを考慮します。
        // 文字列やオブジェクトがthrowされる可能性も考えられます。
        const errorMessage = `予期せぬエラーが発生しました: ${String(error)}`;
        setMessageText(errorMessage);
        console.error(errorMessage, error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [apiUrl, activeTabUrl, activeTabTitle]);

  return {
    // Tab info
    activeTabUrl,
    setActiveTabUrl,
    activeTabTitle,
    setActiveTabTitle,
    // API status
    isApiUrlLoaded,
    isLoading,
    // UI state and handlers
    messageText,
    isValidUrl,
    registerClick,
    handleUrlChange,
  };
};
