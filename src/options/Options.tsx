import "./Options.css";

import LabeledInputField from "../components/LabeledInputField";
import {
  OPTION_LABEL_API_URL,
  OPTION_SAVE_BUTTON_TEXT,
  OPTION_SUBTITLE_TEXT,
  OPTION_TITLE_TEXT,
  PLACEHOLDER_URL,
} from "../constants/constants";
import { useOptions } from "../hooks/useOptions";

const Options = () => {
  const { url, setUrl, saveMessage, handleSave } = useOptions();

  return (
    <main className="options-page">
      <h1 className="option-title">{OPTION_TITLE_TEXT}</h1>
      <h2 className="option-subtitle">{OPTION_SUBTITLE_TEXT}</h2>
      <div className="options-container">
        <LabeledInputField
          label={OPTION_LABEL_API_URL}
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder={PLACEHOLDER_URL}
        />
      </div>
      <button className="save-button" onClick={handleSave}>
        {OPTION_SAVE_BUTTON_TEXT}
      </button>
      {saveMessage && <p className="save-message">{saveMessage}</p>}
      {/* メッセージの表示 */}
    </main>
  );
};

export default Options;
