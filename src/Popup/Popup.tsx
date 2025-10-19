/// <reference types="chrome"/>

import "./Popup.css";

import { useMemo, useRef } from "react";

import LabeledInputField from "../components/LabeledInputField";
import { LABEL_TITLE, LABEL_URL } from "../constants/constants";
import { useDynamicPopupWidth } from "../hooks/useDynamicPopupWidth";
import { usePopup } from "../hooks/usePopup";

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

  // スタイルに関連する定数をコンポーネントの近くに定義
  // この定数はこのコンポーネントのレイアウトに依存するため、内部で定義するのが適切です。
  // useMemoでメモ化することで、再レンダリング時に不要な再生成を防ぎます。
  const popupWidthConfig = useMemo(
    () => ({
      labelWidth: 80,
      buttonWidth: 80,
      paddingAndGaps: 40,
    }),
    []
  );

  const measurementRef = useRef<HTMLSpanElement>(null);
  const popupWidth = useDynamicPopupWidth(
    activeTabUrl,
    measurementRef,
    popupWidthConfig
  );

  return (
    <div className="popup-wrapper" style={{ width: popupWidth }}>
      {/* 幅計測用の非表示要素 */}
      <span ref={measurementRef} className="text-measurement">
        {activeTabUrl}
      </span>
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
      <LabeledInputField
        label={LABEL_TITLE}
        type="text"
        placeholder="タイトルを入力してください"
        value={activeTabTitle}
        onChange={(e) => setActiveTabTitle(e.target.value)}
        className="popup-input"
      />
      {messageText && (
        <div className="popup-message">
          <div className="popup-message-text">{messageText}</div>
        </div>
      )}
    </div>
  );
};

export default Popup;
