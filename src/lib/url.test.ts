import { describe, expect, it } from "vitest";
import {
  INVALID_URL_ERROR_MESSAGE,
  URL_HOSTNAME_ERROR_MESSAGE,
  URL_PROTOCOL_ERROR_MESSAGE,
  URL_REQUIRED_ERROR_MESSAGE,
} from "../constants/constants";
import { isValidUrl, validateUrl } from "./url";

describe("validateUrl", () => {
  const testCasesValidUrls = [
    {
      description: "should return an empty string for a valid http URL",
      url: "http://example.com",
      expected: "",
    },
    {
      description: "should return an empty string for a valid https URL",
      url: "https://example.com",
      expected: "",
    },
    {
      description: "should return an error message for an empty string",
      url: "",
      expected: URL_REQUIRED_ERROR_MESSAGE,
    },
    {
      description:
        "should return an error message for a URL without a protocol",
      url: "example.com",
      expected: INVALID_URL_ERROR_MESSAGE,
    },
    {
      description:
        "should return an error message for a URL with a different protocol",
      url: "ftp://example.com",
      expected: URL_PROTOCOL_ERROR_MESSAGE,
    },
    {
      description: "should return an error message for an invalid URL",
      url: "http:foo.com",
      expected: INVALID_URL_ERROR_MESSAGE,
    },
    {
      description: "should return an empty string for a valid localhost URL",
      url: "http://localhost",
      expected: "",
    },
    {
      description:
        "should return an empty string for a valid localhost URL with a port",
      url: "http://localhost:3000",
      expected: "",
    },
    {
      description: "should return an empty string for a valid IP address URL",
      url: "http://127.0.0.1",
      expected: "",
    },
    {
      description:
        "should return an error message for a hostname without a dot",
      url: "http://example",
      expected: URL_HOSTNAME_ERROR_MESSAGE,
    },
  ];

  it.each(testCasesValidUrls)(
    "$description",
    ({ url, expected }: { url: string; expected: string }) => {
      expect(validateUrl(url)).toBe(expected);
    }
  );
});

describe("isValidUrl", () => {
  const testCasesValidUrls = [
    {
      description: "should return true for a valid http URL",
      url: "http://example.com",
      expected: true,
    },
    {
      description: "should return true for a valid https URL",
      url: "https://example.com",
      expected: true,
    },
    {
      description: "should return false for an empty string",
      url: "",
      expected: false,
    },
    {
      description: "should return false for a URL without a protocol",
      url: "example.com",
      expected: false,
    },
    {
      description: "should return false for a URL with a different protocol",
      url: "ftp://example.com",
      expected: false,
    },
    {
      description: "should return false for an invalid URL",
      url: "http:foo",
      expected: false,
    },
    {
      description: "should return true for a valid localhost URL",
      url: "http://localhost",
      expected: true,
    },
    {
      description: "should return true for a valid localhost URL with a port",
      url: "http://localhost:3000",
      expected: true,
    },
    {
      description: "should return true for a valid IP address URL",
      url: "http://127.0.0.1",
      expected: true,
    },
    {
      description: "should return false for a hostname without a dot",
      url: "http://example",
      expected: false,
    },
  ];

  it.each(testCasesValidUrls)(
    "$description",
    ({ url, expected }: { url: string; expected: boolean }) => {
      expect(isValidUrl(url)).toBe(expected);
    }
  );
});
