import { areBookmarks, isBookmark } from "./bookmark";

describe("isBookmark", () => {
  it.each([
    {
      description: "should return true for a valid bookmark object",
      value: {
        bookmark_id: 1,
        url: "https://example.com",
        title: "Example",
        keywords: [],
      },
      expected: true,
    },
    {
      description: "object with missing 'url' property",
      value: { bookmark_id: 1, title: "Example" },
      expected: false,
    },
    {
      description: "object with missing 'id' property",
      value: { url: "https://example.com", title: "Example" },
      expected: false,
    },
    {
      description: "object with missing 'title' property",
      value: { bookmark_id: 1, url: "https://example.com" },
      expected: false,
    },
    {
      description: "object with incorrect 'bookmark_id' type",
      value: { bookmark_id: "1", url: "https://example.com", title: "Example" },
      expected: false,
    },
    {
      description: "object with incorrect 'url' type",
      value: { bookmark_id: 1, url: 123, title: "Example" },
      expected: false,
    },
    {
      description: "object with incorrect 'title' type",
      value: { bookmark_id: 1, url: "https://example.com", title: null },
      expected: false,
    },
    { description: "null value", value: null, expected: false },
    { description: "undefined value", value: undefined, expected: false },
    { description: "string value", value: "string", expected: false },
    { description: "number value", value: 123, expected: false },
    {
      description: "should return true for an object with extra properties",
      value: {
        bookmark_id: 1,
        url: "https://example.com",
        title: "Example",
        keywords: [],
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
  it.each([
    {
      description: "an array of valid bookmark objects",
      value: [
        {
          bookmark_id: 1,
          url: "https://example.com",
          title: "Example",
          keywords: [],
        },
        {
          bookmark_id: 2,
          url: "https://example.org",
          title: "Example Org",
          keywords: [],
        },
      ],
      expected: true,
    },
    {
      description: "an array containing an invalid bookmark object",
      value: [
        {
          bookmark_id: 1,
          url: "https://example.com",
          title: "Example",
          keywords: [],
        },
        {
          bookmark_id: 2,
          // Missing 'url' property
          title: "Example Org",
        },
      ],
      expected: false,
    },
    {
      description: "an empty object",
      value: {},
      expected: false,
    },
    {
      description: "null value",
      value: null,
      expected: false,
    },
    {
      description: "undefined value",
      value: undefined,
      expected: false,
    },
    {
      description: "empty array",
      value: [],
      expected: true,
    },
  ])("should return $expected for $description", ({ value, expected }) => {
    expect(areBookmarks(value)).toBe(expected);
  });
});
