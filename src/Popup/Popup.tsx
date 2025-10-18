/// <reference types="chrome"/>

import "./Popup.css";

import { usePopup } from "../hooks/usePopup";
import LabeledInputField from "../components/LabeledInputField";

const Popup = () => {
  const {
    activeTabUrl,
    activeTabTitle,
    isLoading,
    setActiveTabTitle,
    messageText,
    registerClick,
    handleUrlChange,
    isRegisterDisabled,
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
          disabled={isRegisterDisabled}
        >
          {isLoading ? "登録中..." : "登録"}
        </button>
        <LabeledInputField
          label="URL"
          type="text"
          aria-label="url"
          placeholder="URLを入力してください"
          value={activeTabUrl}
          onChange={(e) => handleUrlChange(e.target.value)}
        />
        <div className="popup-separator" />
        <LabeledInputField
          label="タイトル"
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
