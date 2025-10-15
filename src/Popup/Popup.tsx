/// <reference types="chrome"/>

import "./Popup.css";

import { useState } from "react";

import { useActiveTabInfo } from "../hooks/useActiveTabInfo";
import { useApiUrl } from "../hooks/useApiUrl";

const Popup = () => {
  const {
    url: activeTabUrl,
    setUrl: setActiveTabUrl,
    title: activeTabTitle,
    setTitle: setActiveTabTitle,
  } = useActiveTabInfo();
  const { apiUrl, isApiUrlLoaded } = useApiUrl();
  const [messageText, setMessageText] = useState<string | undefined>(undefined);

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
        setMessageText(`予期せぬエラーが発生しました: ${String(error)}`);
        console.error("予期せぬエラーが発生しました:", error);
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
