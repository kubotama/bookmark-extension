/// <reference types="chrome"/>

import "./Popup.css";

import { useEffect, useState } from "react";

const Popup = () => {
  const [activeTabUrl, setActiveTabUrl] = useState<string | undefined>(
    "URLの取得中..."
  );

  useEffect(() => {
    // Query for the active tab in the current window
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      // tabs is an array of Tab objects.
      // There should be only one active tab in the current window.
      if (tabs && tabs.length > 0 && tabs[0].url) {
        setActiveTabUrl(tabs[0].url);
      } else {
        setActiveTabUrl("URLの取得に失敗しました。");
      }
    });
  }, []);

  return (
    <div className="popup-container">
      <button className="popup-button">登録</button>
      <input
        className="popup-input"
        type="text"
        aria-label="url"
        placeholder="URLを入力してください"
        value={activeTabUrl}
        onChange={(e) => setActiveTabUrl(e.target.value)}
      />
    </div>
  );
};

export default Popup;
