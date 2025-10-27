import { useEffect, useState } from "react";

export type MessageData = {
  text: string;
  type: "success" | "error" | "info";
  id: string;
};

export type MessageProps = {
  message: MessageData | null;
  duration?: number;
};

export const createMessage = (
  text: string,
  type: "success" | "error" | "info",
  id: string = crypto.randomUUID()
) => {
  return {
    text,
    type,
    id,
  };
};

export const createErrorMessage = (prefix: string, error?: unknown) => {
  let messageText = prefix.trim();
  if (error != null) {
    messageText =
      error instanceof Error
        ? `${messageText} ${error.message}`
        : `${messageText} ${String(error)}`;
  }
  return createMessage(messageText, "error");
};

export const useMessage = ({ message, duration }: MessageProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setIsVisible(true);
      if (duration) {
        const timer = setTimeout(() => {
          setIsVisible(false);
        }, duration);
        return () => clearTimeout(timer);
      }
    } else {
      setIsVisible(false);
    }
  }, [message, duration]);

  return { isVisible };
};
