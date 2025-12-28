export const API_BASE_URL = "http://localhost:3000";
export const API_ENDPOINT = {
  ADD_BOOKMARK: "/api/bookmarks",
  GET_BOOKMARKS: "/api/bookmarks",
};

export const STORAGE_KEY_API_BASE_URL = "apiBaseUrl";
export const SAVE_MESSAGE_TIMEOUT_MS = 3000;

export const LABEL_URL = "URL";
export const LABEL_TITLE = "タイトル";

export const PLACEHOLDER_URL =
  "ブックマークを管理するAPIのベースURLを入力してください";

export const OPTION_TITLE_TEXT = "bookmark-extension";
export const OPTION_SUBTITLE_TEXT = "オプションの設定画面";
export const OPTION_SAVE_BUTTON_TEXT = "保存";
export const OPTION_VERIFY_BUTTON_TEXT = "API接続確認";
export const OPTION_LABEL_API_URL = "ブックマークを管理するAPIのベースURL";
export const OPTION_SAVE_SUCCESS_MESSAGE = "保存しました！";
export const OPTION_UNEXPECTED_API_RESPONSE_ERROR =
  "APIからの応答が予期しない形式です。";
export const OPTION_INVALID_BASE_URL_ERROR = "APIのベースURL設定が不正です。";
export const OPTION_UNEXPECTED_API_RESPONSE_PREFIX =
  "APIからの応答が予期しない形式です: ";
export const OPTION_INVALID_BASE_URL_PREFIX = "APIのベースURL設定が不正です: ";
export const OPTION_FAILED_API_REQUEST_PREFIX =
  "APIへのリクエストに失敗しました: ";
export const OPTION_FAILED_UPDATE_ICON_PREFIX =
  "アイコンの更新に失敗しました: ";
export const OPTION_FAILED_FETCH_BOOKMARKS_PREFIX =
  "ブックマークの取得に失敗しました: ";
export const OPTION_FAILED_TO_GET_API_BASE_URL_FROM_STORAGE_PREFIX =
  "ストレージからAPIのベースURLを取得できませんでした: ";

export const URL_REQUIRED_ERROR_MESSAGE = "URLは必須です。";
export const URL_PROTOCOL_ERROR_MESSAGE =
  "URLはhttp://またはhttps://で始まる必要があります。";
export const URL_HOSTNAME_ERROR_MESSAGE =
  "localhost以外のホスト名にはドット（.）を含める必要があります。";
export const INVALID_URL_ERROR_MESSAGE = "無効なURLです。";

export const POPUP_REGISTER_BUTTON_TEXT = "登録";

export const POPUP_URL_FETCH_ERROR_MESSAGE = "URLの取得に失敗しました。";
export const POPUP_REGISTER_SUCCESS_MESSAGE = "ブックマークが登録されました。";

export const POPUP_REGISTER_CONFLICT_ERROR_PREFIX = "登録失敗: ";
export const POPUP_REGISTER_FAILED_PREFIX =
  "ブックマークの登録に失敗しました。ステータス: ";
export const POPUP_UNEXPECTED_ERROR_PREFIX = "予期せぬエラーが発生しました: ";
export const POPUP_INVALID_URL_MESSAGE_PREFIX = "無効なURLです: ";
export const POPUP_FAILED_TO_RETRIEVE_ACTIVE_TAB_INFO_PREFIX =
  "アクティブなタブ情報の取得に失敗しました: ";
export const POPUP_FAILED_TO_FETCH_API_URL_PREFIX =
  "ストレージからAPIのURLを取得できませんでした: ";

export const POPUP_RESPONSE_MESSAGE_PARSE_ERROR =
  "エラー応答の解析に失敗しました。";
export const POPUP_NO_ACTIVE_TAB_ERROR =
  "アクティブなタブまたはURLが見つかりませんでした。";
export const POPUP_INVALID_API_URL_MESSAGE =
  "API URLが無効です。オプションページで設定してください。";
export const POPUP_OPTIONS_PAGE_LINK_TEXT = "オプションページを開く";

export const SUCCESS_MESSAGE = (count: number) =>
  `${count}件のブックマークを取得しました。`;
export const API_ERROR_MESSAGE = (status: number) =>
  `APIへの接続に失敗しました (HTTP ${status})`;
export const FAILED_TO_CONNECT_API_WITH_NETWORK =
  "APIへの接続に失敗しました。ネットワーク設定などを確認してください。";
export const FAILED_TO_GET_BASE_URL_MESSAGE =
  "APIのベースURLを取得できませんでした:";
export const FAILED_TO_CONNECT_API = "APIへの接続に失敗しました:";

export const NO_TAB_ERROR_PREFIX = "No tab with id";
export const BACKGROUND_TAB_UPDATE_ERROR_PREFIX = "タブの更新エラー: ";
export const BACKGROUND_TAB_ACTIVATE_ERROR_PREFIX =
  "タブのアクティベートエラー: ";
export const INVALID_BOOKMARK_ARRAY_ERROR =
  "APIのレスポンスが不正なブックマーク配列です";

export const OPTIONS_PAGE_PATH = "src/options.html";

export const DEFAULT_ICON_PATHS = {
  16: "icons/icon16.png",
  48: "icons/icon48.png",
  128: "icons/icon128.png",
};

export const SAVED_ICON_PATHS = {
  16: "icons/icon-saved16.png",
  48: "icons/icon-saved48.png",
  128: "icons/icon-saved128.png",
};
