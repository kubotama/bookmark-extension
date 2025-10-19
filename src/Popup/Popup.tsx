/// <reference types="chrome"/>

import "./Popup.css";

import { usePopup } from "../hooks/usePopup";
import LabeledInputField from "../components/LabeledInputField";

import { LABEL_URL, LABEL_TITLE } from "../constants/constants";

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
          label={LABEL_URL}
          type="text"
          placeholder="URLを入力してください"
          value={activeTabUrl}
          onChange={(e) => handleUrlChange(e.target.value)}
          className="popup-input"
        />
        <div className="popup-separator" />
        <LabeledInputField
          label={LABEL_TITLE}
          type="text"
          placeholder="タイトルを入力してください"
          value={activeTabTitle}
          onChange={(e) => setActiveTabTitle(e.target.value)}
          className="popup-input"
        />
      </div>
    </>
  );
};

export default Popup;
