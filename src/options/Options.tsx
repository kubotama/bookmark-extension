import "./Options.css";

import LabeledInputField from "../components/LabeledInputField";
import Message from "../components/Message/Message";
import {
  OPTION_LABEL_API_URL,
  OPTION_SAVE_BUTTON_TEXT,
  OPTION_SUBTITLE_TEXT,
  OPTION_TITLE_TEXT,
  OPTION_VERIFY_BUTTON_TEXT,
  PLACEHOLDER_URL,
  SAVE_MESSAGE_TIMEOUT_MS,
} from "../constants/constants";
import { useOptions } from "../hooks/useOptions";

const Options = () => {
  const { baseUrl, setBaseUrl, saveMessage, handleSave, verifyClick } =
    useOptions();

  return (
    <main className="options-page">
      <h1 className="option-title">{OPTION_TITLE_TEXT}</h1>
      <h2 className="option-subtitle">{OPTION_SUBTITLE_TEXT}</h2>
      <div className="options-container">
        <LabeledInputField
          label={OPTION_LABEL_API_URL}
          type="text"
          value={baseUrl}
          onChange={(e) => setBaseUrl(e.target.value)}
          placeholder={PLACEHOLDER_URL}
        />
      </div>
      <button className="save-button" onClick={handleSave}>
        {OPTION_SAVE_BUTTON_TEXT}
      </button>
      <button className="verify-button" onClick={verifyClick}>
        {OPTION_VERIFY_BUTTON_TEXT}
      </button>
      <div className="message-container">
        {saveMessage && (
          <Message message={saveMessage} duration={SAVE_MESSAGE_TIMEOUT_MS} />
        )}
      </div>
    </main>
  );
};

export default Options;
