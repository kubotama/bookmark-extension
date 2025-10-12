import "./Options.css";

import { useEffect, useRef, useState } from "react";

import {
  SAVE_MESSAGE_TIMEOUT_MS,
  STORAGE_KEY_BOOKMARK_URL,
} from "../constants/constants";

const Options = () => {
  const [url, setUrl] = useState("");
  const [saveMessage, setSaveMessage] = useState("");

  const timerRef = useRef<number | null>(null);

  // コンポーネントのマウント時にストレージからURLを読み込む
  useEffect(() => {
    // const loadUrl = async () => {
    //   const data = await chrome.storage.local.get(STORAGE_KEY_BOOKMARK_URL);
    //   if (data.bookmarkUrl) {
    //     setUrl(data.bookmarkUrl);
    //   }
    // };
    // loadUrl();
    (async () => {
      const data = await chrome.storage.local.get(STORAGE_KEY_BOOKMARK_URL);
      if (data.bookmarkUrl) {
        setUrl(data.bookmarkUrl);
      }
    })();
  }, []);

  // コンポーネントのアンマウント時にタイマーをクリアする
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  // 保存ボタンがクリックされたときの処理
  const handleSave = async () => {
    if (url) {
      await chrome.storage.local.set({ [STORAGE_KEY_BOOKMARK_URL]: url });
      console.log("URL saved:", url);
      setSaveMessage("保存しました！");

      // 既存のタイマーをクリア
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      // 新しいタイマーをセット
      timerRef.current = window.setTimeout(() => {
        setSaveMessage("");
      }, SAVE_MESSAGE_TIMEOUT_MS);
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
      {saveMessage && <p className="save-message">{saveMessage}</p>}
      {/* メッセージの表示 */}
    </div>
  );
};

export default Options;
