import { useState, useEffect } from "react";
import "./Options.css";
import { STORAGE_KEY_BOOKMARK_URL } from "../constants/constants";

const Options = () => {
  const [url, setUrl] = useState("");
  const [saveMessage, setSaveMessage] = useState(""); // メッセージ用のstateを追加

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
        setSaveMessage("保存しました！"); // メッセージを設定
        setTimeout(() => {
          setSaveMessage(""); // 3秒後にメッセージをクリア
        }, 3000);
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
      {saveMessage && <p className="save-message">{saveMessage}</p>} {/* メッセージの表示 */}
    </div>
  );
};

export default Options;
