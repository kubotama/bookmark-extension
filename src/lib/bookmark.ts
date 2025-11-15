export type Bookmark = {
  id: number;
  url: string;
  title: string;
};

export const isBookmark = (obj: unknown): obj is Bookmark => {
  if (typeof obj !== "object" || obj === null) {
    return false;
  }
  const record = obj as Record<string, unknown>;
  return (
    typeof record.id === "number" &&
    typeof record.url === "string" &&
    typeof record.title === "string"
  );
};

export const areBookmarks = (obj: unknown): obj is Bookmark[] => {
  return Array.isArray(obj) && obj.every(isBookmark);
};
