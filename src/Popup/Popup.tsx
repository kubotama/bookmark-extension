/// <reference types="chrome"/>

import "./Popup.css";

import { usePopup } from "../hooks/usePopup";

const Popup = () => {
  const {
    activeTabUrl,
    activeTabTitle,
    isLoading,
    setActiveTabTitle,
    isApiUrlLoaded,
    messageText,
    isValidUrl,
    registerClick,
    handleUrlChange,
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
            isLoading ||
            !isApiUrlLoaded ||
            !activeTabTitle ||
            !isValidUrl(activeTabUrl)
          }
        >
          {isLoading ? "登録中..." : "登録"}
        </button>
        <input
          className="popup-input"
          type="text"
          aria-label="url"
          placeholder="URLを入力してください"
          value={activeTabUrl}
          onChange={(e) => handleUrlChange(e.target.value)}
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
