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
      try {
        const data = await chrome.storage.local.get("bookmarkUrl");
        if (data.bookmarkUrl) {
          setApiUrl(data.bookmarkUrl);
        }
      } catch (e) {
        if (e instanceof Error) {
          console.error(e.message);
        }
      } finally {
        if (isMounted) setIsApiUrlLoaded(true);
      }

      try {
        const tabs = await chrome.tabs.query({
          active: true,
          currentWindow: true,
        });
        const tab = tabs?.[0];
        if (!tab?.url) {
          throw new Error("アクティブなタブまたはURLが見つかりませんでした。");
        }
        if (isMounted) {
          setActiveTabUrl(tab.url);
          setActiveTabTitle(tab.title || "");
        }
      } catch (e) {
        if (isMounted) {
          setActiveTabUrl("URLの取得に失敗しました。");
          setActiveTabTitle("");
        }
        if (e instanceof Error) console.error(e.message);
      }
    };
    initialize();
    return () => {
      isMounted = false;
    };
  }, []);

  const registerClick = () => {
    const bookmark = {
      url: activeTabUrl,
      title: activeTabTitle,
    };

    fetch(apiUrl, {
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
