import { useState, useEffect } from "react";
import "./Options.css";
import { STORAGE_KEY_BOOKMARK_URL } from "../constants/constants";

const Options = () => {
  const [url, setUrl] = useState("");

  // コンポーネントのマウント時にストレージからURLを読み込む
  useEffect(() => {
    chrome.storage.local.get(STORAGE_KEY_BOOKMARK_URL, (data) => {
      if (data.bookmarkUrl) {
        setUrl(data.bookmarkUrl);
      }
    });
  }, []);

  // 保存ボタンがクリックされたときの処理
  const handleSave = () => {
    if (url) {
      chrome.storage.local.set({ [STORAGE_KEY_BOOKMARK_URL]: url }, () => {
        console.log("URL saved:", url);
      });
    }
  };

  return (
    <div className="options-container">
      <h1>オプション</h1>
      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="ブックマークするURL"
      />
      <button onClick={handleSave}>保存</button>
    </div>
  );
};

export default Options;
