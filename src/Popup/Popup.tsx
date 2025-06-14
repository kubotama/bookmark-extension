/// <reference types="chrome"/>

import "./Popup.css";

import { useEffect, useState } from "react";

const API_BOOKMARK_ADD = "http://localhost:3000/api/bookmark/add"; // TODO: Make configurable via options page (ref /gemini #4)

const Popup = () => {
  const [activeTabUrl, setActiveTabUrl] = useState<string | undefined>(
    "URLの取得中..."
  );
  const [activeTabTitle, setActiveTabTitle] = useState<string | undefined>(
    "タイトルの取得中..."
  );

  const [isTitleLoaded, setIsTitleLoaded] = useState<boolean>(false);

  const [messageText, setMessageText] = useState<string | undefined>(undefined);

  useEffect(() => {
    setIsTitleLoaded(false);
    // Query for the active tab in the current window
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      // tabs is an array of Tab objects.
      // There should be only one active tab in the current window.
      if (tabs && tabs.length > 0 && tabs[0].url) {
        setActiveTabUrl(tabs[0].url);
        if (tabs[0].title !== undefined) {
          setActiveTabTitle(tabs[0].title);
          setIsTitleLoaded(true);
        } else {
          setActiveTabTitle("タイトルの取得に失敗しました。");
        }
      } else {
        setActiveTabUrl("URLの取得に失敗しました。");
      }
    });
  }, []);

  const registerClick = () => {
    if (!activeTabUrl || !isValidUrl(activeTabUrl)) {
      setMessageText(
        activeTabUrl
          ? `登録できません: 無効なURLです (${activeTabUrl})`
          : "登録できません: URLが指定されていません"
      );
      return;
    }
    // if (!activeTabTitle || !isTitleLoaded) {
    if (!isTitleLoaded || !activeTabTitle) {
      setMessageText(
        activeTabTitle
          ? `登録できません: タイトルが無効です (${activeTabTitle})`
          : "登録できません: タイトルが指定されていません"
      );
      return;
    }
    const bookmark = {
      url: activeTabUrl,
      title: activeTabTitle,
    };

    fetch(API_BOOKMARK_ADD, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bookmark),
    })
      .then(async (response) => {
        // asyncキーワードを追加
        if (response.ok) {
          setMessageText("ブックマークが登録されました。");
        } else {
          try {
            const errorData = await response.json(); // エラーレスポンスをJSONとしてパース
            setMessageText(
              `登録失敗: ${errorData.message || response.statusText}`
            );
          } catch (error) {
            setMessageText(
              `ブックマークの登録に失敗しました。ステータス: ${
                response.status
              }: ${error instanceof Error ? error.message : String(error)}`
            );
            console.error(
              `ブックマークの登録に失敗しました。ステータス: ${
                response.status
              }: ${error instanceof Error ? error.message : String(error)}`
            );
          }
        }
      })
      .catch((error) => {
        setMessageText(`${error.name}: ${error.message}`);
        console.error(error);
      });
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
        <button className="popup-button" onClick={registerClick}>
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
