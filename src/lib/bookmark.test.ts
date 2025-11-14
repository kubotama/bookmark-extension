import { areBookmarks, isBookmark } from "./bookmark";

describe("isBookmark", () => {
  it.each([
    {
      description: "should return true for a valid bookmark object",
      value: {
        id: 1,
        url: "https://example.com",
        title: "Example",
      },
      expected: true,
    },
    {
      description: "object with missing 'url' property",
      value: { id: 1, title: "Example" },
      expected: false,
    },
    {
      description: "object with missing 'id' property",
      value: { url: "https://example.com", title: "Example" },
      expected: false,
    },
    {
      description: "object with missing 'title' property",
      value: { id: 1, url: "https://example.com" },
      expected: false,
    },
    {
      description: "object with incorrect 'id' type",
      value: { id: "1", url: "https://example.com", title: "Example" },
      expected: false,
    },
    {
      description: "object with incorrect 'url' type",
      value: { id: 1, url: 123, title: "Example" },
      expected: false,
    },
    {
      description: "object with incorrect 'title' type",
      value: { id: 1, url: "https://example.com", title: null },
      expected: false,
    },
    { description: "null value", value: null, expected: false },
    { description: "undefined value", value: undefined, expected: false },
    { description: "string value", value: "string", expected: false },
    { description: "number value", value: 123, expected: false },
    {
      description: "should return true for an object with extra properties",
      value: {
        id: 1,
        url: "https://example.com",
        title: "Example",
        extra: "some value",
        another: 123,
      },
      expected: true,
    },
  ])("should return $expected for $description", ({ value, expected }) => {
    expect(isBookmark(value)).toBe(expected);
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
