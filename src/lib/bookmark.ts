export type Keyword = {
  keyword_id: number;
  keyword_name: string;
};

// Keywordの型ガードを新しく作成
export const isKeyword = (obj: unknown): obj is Keyword => {
  if (typeof obj !== "object" || obj === null) {
    return false;
  }
  const record = obj as Record<string, unknown>;
  return (
    typeof record.keyword_id === "number" &&
    typeof record.keyword_name === "string"
  );
};

export type Bookmark = {
  bookmark_id: number;
  url: string;
  title: string;
  keywords: Keyword[];
};

export const isBookmark = (obj: unknown): obj is Bookmark => {
  if (typeof obj !== "object" || obj === null) {
    return false;
  }
  const record = obj as Record<string, unknown>;
  return (
    typeof record.bookmark_id === "number" &&
    typeof record.url === "string" &&
    typeof record.title === "string" &&
    Array.isArray(record.keywords) &&
    // 配列のすべての要素が isKeyword を満たすかチェック
    record.keywords.every(isKeyword)
  );
};

export const areBookmarks = (obj: unknown): obj is Bookmark[] => {
  return Array.isArray(obj) && obj.every(isBookmark);
};
