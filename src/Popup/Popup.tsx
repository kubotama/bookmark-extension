/// <reference types="chrome"/>

import "./Popup.css";

import { useEffect, useState } from "react";

const Popup = () => {
  const [bookmarkUrl, setBookmarkUrl] = useState<string | null>(null);

  useEffect(() => {
    chrome.storage.local.get("bookmarkUrl", (data) => {
      if (data.bookmarkUrl) {
        setBookmarkUrl(data.bookmarkUrl);
      }
    });
  }, []);

  const handleAccessClick = () => {
    if (bookmarkUrl) {
      chrome.tabs.create({ url: bookmarkUrl });
    }
  };

  const handleOpenOptions = () => {
    chrome.runtime.openOptionsPage();
  };

  return (
    <div className="popup-container">
      {bookmarkUrl ? (
        <button className="popup-button" onClick={handleAccessClick}>
          アクセス
        </button>
      ) : (
        <div className="popup-message">
          <div className="popup-message-text">
            URLが設定されていません。オプションページで設定してください。
          </div>
          <button className="popup-button" onClick={handleOpenOptions}>
            オプションページへ
          </button>
        </div>
      )}
    </div>
  );
};

export default Popup;
