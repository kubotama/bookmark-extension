/// <reference types="chrome"/>

import "./Popup.css";

import { useEffect, useState } from "react";

import { API_BOOKMARK_ADD } from "../constants/constants";

const Popup = () => {
  const [activeTabUrl, setActiveTabUrl] = useState<string>("URLの取得中...");
  const [activeTabTitle, setActiveTabTitle] =
    useState<string>("タイトルの取得中...");

  const [messageText, setMessageText] = useState<string | undefined>(undefined);
  const [apiUrl, setApiUrl] = useState<string>(API_BOOKMARK_ADD);
  const [isApiUrlLoaded, setIsApiUrlLoaded] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    const initialize = async () => {
      const [storageResult, tabsResult] = await Promise.allSettled([
        chrome.storage.local.get("bookmarkUrl"),
        chrome.tabs.query({ active: true, currentWindow: true }),
      ]);

      if (!isMounted) return;

      // API URLの読み込み結果を処理
      if (
        storageResult.status === "fulfilled" &&
        storageResult.value.bookmarkUrl
      ) {
        setApiUrl(storageResult.value.bookmarkUrl);
      } else if (
        storageResult.status === "rejected" &&
        storageResult.reason instanceof Error
      ) {
        console.error(storageResult.reason.message);
      }
      setIsApiUrlLoaded(true);

      // タブ情報の読み込み結果を処理
      if (tabsResult.status === "fulfilled") {
        const tab = tabsResult.value?.[0];
        if (tab?.url) {
          setActiveTabUrl(tab.url);
          setActiveTabTitle(tab.title || "");
        } else {
          console.error("アクティブなタブまたはURLが見つかりませんでした。");
          setActiveTabUrl("URLの取得に失敗しました。");
          setActiveTabTitle("");
        }
      } else if (tabsResult.status === "rejected") {
        if (tabsResult.reason instanceof Error) {
          console.error(tabsResult.reason.message);
        }
        setActiveTabUrl("URLの取得に失敗しました。");
        setActiveTabTitle("");
      }
    };
    initialize();
    return () => {
      isMounted = false;
    };
  }, []);

  const registerClick = async () => {
    const bookmark = {
      url: activeTabUrl,
      title: activeTabTitle,
    };

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
          const errorMessage = `ブックマークの登録に失敗しました。ステータス: ${
            response.status
          }: ${error instanceof Error ? error.message : String(error)}`;
          setMessageText(errorMessage);
          console.error(errorMessage);
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        setMessageText(`${error.name}: ${error.message}`);
        console.error(error);
      } else {
        setMessageText(`予期せぬエラーが発生しました: ${String(error)}`);
        console.error("An unexpected error occurred:", error);
      }
    }
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <>
      {messageText && (
        <div className="popup-message">
          <div className="popup-message-text">{messageText}</div>
        </div>
      )}
      <div className="popup-container">
        <button
          className="popup-button"
          onClick={registerClick}
          disabled={
            !isApiUrlLoaded || !activeTabTitle || !isValidUrl(activeTabUrl)
          }
        >
          登録
        </button>
        <input
          className="popup-input"
          type="text"
          aria-label="url"
          placeholder="URLを入力してください"
          value={activeTabUrl}
          onChange={(e) => {
            const newUrl = e.target.value;
            setActiveTabUrl(newUrl);

            if (isValidUrl(e.target.value)) {
              // 有効なURLの場合はメッセージをクリア
              setMessageText("");
            } else {
              // 無効なURLの場合の処理
              setMessageText(`無効なURLです: ${newUrl}`);
            }
          }}
        />
        <div className="popup-separator" />
        <input
          className="popup-input"
          type="text"
          aria-label="title"
          placeholder="タイトルを入力してください"
          value={activeTabTitle}
          onChange={(e) => setActiveTabTitle(e.target.value)}
        />
      </div>
    </>
  );
};

export default Popup;
