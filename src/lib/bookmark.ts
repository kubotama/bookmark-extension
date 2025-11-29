export type Keyword = {
  keyword_id: number;
  keyword_name: string;
};

// Keywordの型ガードを新しく作成
export const isKeyword = (obj: unknown): obj is Keyword => {
  if (typeof obj !== "object" || obj === null) {
    return false;
  }
  return (
    "keyword_id" in obj &&
    typeof (obj as Keyword).keyword_id === "number" &&
    "keyword_name" in obj &&
    typeof (obj as Keyword).keyword_name === "string"
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

  if (
    !("bookmark_id" in obj) ||
    !("url" in obj) ||
    !("title" in obj) ||
    !("keywords" in obj)
  ) {
    return false;
  }

  const bookmark = obj as Bookmark;
  if (
    typeof bookmark.bookmark_id !== "number" ||
    typeof bookmark.url !== "string" ||
    typeof bookmark.title !== "string"
  ) {
    return false;
  }

  if (
    !Array.isArray(bookmark.keywords) ||
    !bookmark.keywords.every(isKeyword)
  ) {
    return false;
  }

  return true;
};

export const areBookmarks = (obj: unknown): obj is Bookmark[] => {
  return Array.isArray(obj) && obj.every(isBookmark);
};
