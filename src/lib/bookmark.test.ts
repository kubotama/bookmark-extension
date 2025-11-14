import { areBookmarks, isBookmark } from "./bookmark";

describe("isBookmark", () => {
  it("should return true for a valid bookmark object", () => {
    const validBookmark = {
      id: 1,
      url: "https://example.com",
      title: "Example",
    };
    expect(isBookmark(validBookmark)).toBe(true);
  });

  it("should return false for an invalid bookmark object", () => {
    const invalidBookmark = {
      id: 1,
      // Missing 'url' property
      title: "Example",
    };
    expect(isBookmark(invalidBookmark)).toBe(false);
  });

  it("should return false for a non-object", () => {
    expect(isBookmark(null)).toBe(false);
    expect(isBookmark(undefined)).toBe(false);
    expect(isBookmark("string")).toBe(false);
    expect(isBookmark(123)).toBe(false);
  });

  it("should return false for an object with incorrect property types", () => {
    const bookmarkWithWrongType = {
      id: "1", // Should be a number
      url: "https://example.com",
      title: "Example",
    };
    expect(isBookmark(bookmarkWithWrongType)).toBe(false);
  });

  it("should return true for an object with extra properties", () => {
    const bookmarkWithExtraProps = {
      id: 1,
      url: "https://example.com",
      title: "Example",
      extra: "some value",
      another: 123,
    };
    expect(isBookmark(bookmarkWithExtraProps)).toBe(true);
  });
});

describe("areBookmarks", () => {
  it("should return true for an array of valid bookmark objects", () => {
    const validBookmarks = [
      {
        id: 1,
        url: "https://example.com",
        title: "Example",
      },
      {
        id: 2,
        url: "https://example.org",
        title: "Example Org",
      },
    ];
    expect(areBookmarks(validBookmarks)).toBe(true);
  });

  it("should return false for an array containing an invalid bookmark object", () => {
    const mixedBookmarks = [
      {
        id: 1,
        url: "https://example.com",
        title: "Example",
      },
      {
        id: 2,
        // Missing 'url' property
        title: "Example Org",
      },
    ];
    expect(areBookmarks(mixedBookmarks)).toBe(false);
  });

  it("should return false for a non-array", () => {
    expect(areBookmarks({})).toBe(false);
    expect(areBookmarks(null)).toBe(false);
    expect(areBookmarks(undefined)).toBe(false);
  });

  it("should return true for an empty array", () => {
    expect(areBookmarks([])).toBe(true);
  });
});
