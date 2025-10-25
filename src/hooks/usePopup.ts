import { useCallback, useMemo, useState } from "react";

import {
  POPUP_INVALID_URL_MESSAGE_PREFIX,
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

const createErrorMessage = (prefix: string, error?: unknown) => {
  if (error == null) {
    return prefix.trim();
  }
  if (error instanceof Error) {
    return `${prefix}${error.message}`;
  }
  return `${prefix}${String(error)}`;
};

export const usePopup = () => {
  const {
    url: activeTabUrl,
    setUrl: setActiveTabUrl,
    title: activeTabTitle,
    setTitle: setActiveTabTitle,
  } = useActiveTabInfo();
  const { getApiBookmarkAddUrl, isApiUrlLoaded } = useApiUrl();
  const [message, setMessage] = useState<
    { text: string; type: "success" | "error" | "info" } | undefined
  >(undefined);
  const [isLoading, setIsLoading] = useState(false);

  const handleUrlChange = useCallback(
    (newUrl: string) => {
      setActiveTabUrl(newUrl);
      const message = isValidUrl(newUrl)
        ? undefined
        : {
            text: `${POPUP_INVALID_URL_MESSAGE_PREFIX}${newUrl}`,
            type: "error" as const,
          };
      setMessage(message);
    },
    [setActiveTabUrl]
  );

  const registerClick = useCallback(async () => {
    const bookmark = {
      url: activeTabUrl,
      title: activeTabTitle,
    };

    setIsLoading(true);
    setMessage(undefined);

    try {
      const apiUrl = getApiBookmarkAddUrl();
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookmark),
      });

      if (response.ok) {
        setMessage({
          text: POPUP_REGISTER_SUCCESS_MESSAGE,
          type: "success",
        });
        return;
      }

      try {
        const errorData = await response.json();
        const errorMessage = createErrorMessage(
          POPUP_REGISTER_CONFLICT_ERROR_PREFIX,
          errorData.message || POPUP_RESPONSE_MESSAGE_PARSE_ERROR
        );
        setMessage({ text: errorMessage, type: "error" });
      } catch (parseError) {
        const errorMessage = createErrorMessage(
          POPUP_REGISTER_FAILED_PREFIX,
          response.status
        );
        setMessage({ text: errorMessage, type: "error" });
        console.error(errorMessage, parseError);
      }
    } catch (error) {
      if (error instanceof TypeError) {
        // `new URL()` に起因するエラーの可能性が高い
        const urlErrorMessage = "APIのベースURL設定が不正です。";
        setMessage({ text: urlErrorMessage, type: "error" });
        console.error(urlErrorMessage, error);
      } else {
        const errorMessage = createErrorMessage(
          POPUP_UNEXPECTED_ERROR_PREFIX,
          error
        );
        setMessage({ text: errorMessage, type: "error" });
        console.error(errorMessage, error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [getApiBookmarkAddUrl, activeTabUrl, activeTabTitle]);

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
