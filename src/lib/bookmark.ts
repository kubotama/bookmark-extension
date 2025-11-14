export type Bookmark = {
  id: number;
  url: string;
  title: string;
  createdAt: string;
  updatedAt: string;
};

export const isBookmark = (obj: unknown): obj is Bookmark => {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "id" in obj &&
    typeof (obj as Bookmark).id === "number" &&
    "url" in obj &&
    typeof (obj as Bookmark).url === "string" &&
    "title" in obj &&
    typeof (obj as Bookmark).title === "string" &&
    "createdAt" in obj &&
    typeof (obj as Bookmark).createdAt === "string" &&
    "updatedAt" in obj &&
    typeof (obj as Bookmark).updatedAt === "string"
  );
};

export const areBookmarks = (obj: unknown): obj is Bookmark[] => {
  return Array.isArray(obj) && obj.every(isBookmark);
};
