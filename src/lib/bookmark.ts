import { hasPropertyOfType, isObject, isArrayOf } from "./type-guards";

export type Keyword = {
  keyword_id: number;
  keyword_name: string;
};

export type Bookmark = {
  bookmark_id: number;
  url: string;
  title: string;
  keywords: Keyword[];
};

// Keywordの型ガードを新しく作成
export const isKeyword = (obj: unknown): obj is Keyword => {
  return (
    isObject(obj) &&
    hasPropertyOfType(obj, "keyword_id", "number") &&
    hasPropertyOfType(obj, "keyword_name", "string")
  );
};

export const isBookmark = (obj: unknown): obj is Bookmark => {
  return (
    isObject(obj) &&
    hasPropertyOfType(obj, "bookmark_id", "number") &&
    hasPropertyOfType(obj, "url", "string") &&
    hasPropertyOfType(obj, "title", "string") &&
    "keywords" in obj &&
    isArrayOf(obj.keywords, isKeyword)
  );
};

export const areBookmarks = (obj: unknown): obj is Bookmark[] => {
  return isArrayOf(obj, isBookmark);
};
