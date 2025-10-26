import { useEffect, useState } from "react";

export type MessageData = {
  text: string;
  type: "success" | "error" | "info";
  id: string;
};

export type MessageProps = {
  message: MessageData;
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
        ? `${prefix}${error.message}`
        : `${prefix}${String(error)}`;
  }
  return createMessage(messageText, "error");
};

export const useMessage = ({ message, duration }: MessageProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // 新しいメッセージが渡されたら、表示状態にリセットする
    setIsVisible(true);

    if (duration) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [message, duration]);

  return { isVisible };
};
