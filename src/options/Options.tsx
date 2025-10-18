import "./Options.css";

import { useOptions } from "../hooks/useOptions";

const Options = () => {
  const { url, setUrl, saveMessage, handleSave } = useOptions();

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
