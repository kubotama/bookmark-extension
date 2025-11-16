/// <reference types="chrome"/>

import "./Popup.css";

import { useCallback, useRef } from "react";

import LabeledInputField from "../components/LabeledInputField";
import Message from "../components/Message/Message";
import {
  LABEL_TITLE,
  LABEL_URL,
  OPTIONS_PAGE_PATH,
  POPUP_INVALID_API_URL_MESSAGE,
  POPUP_OPTIONS_PAGE_LINK_TEXT,
  SAVE_MESSAGE_TIMEOUT_MS,
} from "../constants/constants";
import { useApiUrl } from "../hooks/useApiUrl";
import { useDynamicPopupWidth } from "../hooks/useDynamicPopupWidth";
import { usePopup } from "../hooks/usePopup";

const Popup = () => {
  const {
    activeTabUrl,
    setActiveTabUrl,
    activeTabTitle,
    isLoading,
    setActiveTabTitle,
    message,
    registerClick,
    isRegisterDisabled,
  } = usePopup();
  const { isApiUrlLoaded, isApiUrlInvalid } = useApiUrl();

  const measurementRef = useRef<HTMLSpanElement>(null);
  const popupWidth = useDynamicPopupWidth(activeTabUrl, measurementRef);

  const openOptionsPage = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      chrome.tabs.create({ url: chrome.runtime.getURL(OPTIONS_PAGE_PATH) });
    },
    []
  );

  if (!isApiUrlLoaded) {
    return <div>Loading...</div>;
  }

  if (isApiUrlInvalid) {
    return (
      <div className="popup-wrapper">
        <p className="popup-error-message">{POPUP_INVALID_API_URL_MESSAGE}</p>
        <a href="#" onClick={openOptionsPage} className="popup-error-message">
          {POPUP_OPTIONS_PAGE_LINK_TEXT}
        </a>
      </div>
    );
  }

  return (
    <>
      <button
        className="popup-button"
        onClick={registerClick}
        disabled={isRegisterDisabled}
      >
        {isLoading ? "登録中..." : "登録"}
      </button>
      <div className="popup-wrapper" style={{ width: popupWidth }}>
        {/* 幅計測用の非表示要素 */}
        <span ref={measurementRef} className="text-measurement">
          {activeTabUrl}
        </span>
        <LabeledInputField
          label={LABEL_URL}
          type="text"
          placeholder="URLを入力してください"
          value={activeTabUrl}
          onChange={(e) => setActiveTabUrl(e.target.value)}
          className="popup-input"
        />
        <LabeledInputField
          label={LABEL_TITLE}
          type="text"
          placeholder="タイトルを入力してください"
          value={activeTabTitle}
          onChange={(e) => setActiveTabTitle(e.target.value)}
          className="popup-input"
        />
      </div>
      {message && (
        <Message
          key={message.id}
          message={message}
          duration={
            message.type === "success" ? SAVE_MESSAGE_TIMEOUT_MS : undefined
          }
        />
      )}
    </>
  );
};

export default Popup;
