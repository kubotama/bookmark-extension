export type Bookmark = {
  id: number;
  url: string;
  title: string;
};

export const isBookmark = (obj: unknown): obj is Bookmark => {
  return (
    typeof obj === "object" &&
    obj !== null &&
    typeof (obj as Record<string, unknown>).id === "number" &&
    typeof (obj as Record<string, unknown>).url === "string" &&
    typeof (obj as Record<string, unknown>).title === "string"
  );
};

export const areBookmarks = (obj: unknown): obj is Bookmark[] => {
  return Array.isArray(obj) && obj.every(isBookmark);
};
