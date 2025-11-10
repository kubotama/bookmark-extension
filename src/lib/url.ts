import {
  INVALID_URL_ERROR_MESSAGE,
  URL_HOSTNAME_ERROR_MESSAGE,
  URL_PROTOCOL_ERROR_MESSAGE,
  URL_REQUIRED_ERROR_MESSAGE,
} from "../constants/constants";

export const validateUrl = (url: string): string => {
  if (!url) {
    return URL_REQUIRED_ERROR_MESSAGE;
  }
  if (!url.includes("://")) {
    return INVALID_URL_ERROR_MESSAGE;
  }

  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      return URL_PROTOCOL_ERROR_MESSAGE;
    }
    if (
      !parsedUrl.hostname.includes(".") &&
      parsedUrl.hostname !== "localhost"
    ) {
      return URL_HOSTNAME_ERROR_MESSAGE;
    }
  } catch {
    return INVALID_URL_ERROR_MESSAGE;
  }
  return "";
};

export const isValidUrl = (url: string): boolean => {
  return validateUrl(url) === "";
};
