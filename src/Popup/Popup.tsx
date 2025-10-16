/// <reference types="chrome"/>

import "./Popup.css";

import { usePopup } from "../hooks/usePopup";

const Popup = () => {
  const {
    activeTabUrl,
    setActiveTabUrl,
    activeTabTitle,
    setActiveTabTitle,
    isApiUrlLoaded,
    messageText,
    setMessageText,
    isValidUrl,
    registerClick,
  } = usePopup();

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
