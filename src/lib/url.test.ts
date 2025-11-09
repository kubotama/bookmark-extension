import { describe, expect, it } from "vitest";
import {
  INVALID_URL_ERROR_MESSAGE,
  URL_PROTOCOL_ERROR_MESSAGE,
  URL_REQUIRED_ERROR_MESSAGE,
} from "../constants/constants";
import { isValidUrl, validateUrl } from "./url";

describe("validateUrl", () => {
  it("should return an empty string for a valid http URL", () => {
    expect(validateUrl("http://example.com")).toBe("");
  });

  it("should return an empty string for a valid https URL", () => {
    expect(validateUrl("https://example.com")).toBe("");
  });

  it("should return an error message for an empty string", () => {
    expect(validateUrl("")).toBe(URL_REQUIRED_ERROR_MESSAGE);
  });

  it("should return an error message for a URL without a protocol", () => {
    expect(validateUrl("example.com")).toBe(INVALID_URL_ERROR_MESSAGE);
  });

  it("should return an error message for a URL with a different protocol", () => {
    expect(validateUrl("ftp://example.com")).toBe(URL_PROTOCOL_ERROR_MESSAGE);
  });

  it("should return an error message for an invalid URL", () => {
    expect(validateUrl("http:foo")).toBe(INVALID_URL_ERROR_MESSAGE);
  });
});

describe("isValidUrl", () => {
  it("should return true for a valid http URL", () => {
    expect(isValidUrl("http://example.com")).toBe(true);
  });

  it("should return true for a valid https URL", () => {
    expect(isValidUrl("https://example.com")).toBe(true);
  });

  it("should return false for an empty string", () => {
    expect(isValidUrl("")).toBe(false);
  });

  it("should return false for a URL without a protocol", () => {
    expect(isValidUrl("example.com")).toBe(false);
  });

  it("should return false for a URL with a different protocol", () => {
    expect(isValidUrl("ftp://example.com")).toBe(false);
  });

  it("should return false for an invalid URL", () => {
    expect(isValidUrl("http:foo")).toBe(false);
  });
});
