export const validateUrl = (url: string): string => {
  if (!url) {
    return "URLは必須です。";
  }
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return "URLはhttp://またはhttps://で始まる必要があります。";
  }
  return "";
};

export const isValidUrl = (url: string): boolean => {
  return validateUrl(url) === "";
};
