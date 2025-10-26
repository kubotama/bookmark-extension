import "./Message.css";

import { useEffect, useState } from "react";

export type MessageData = {
  text: string;
  type: "success" | "error" | "info";
  id: string;
};

type MessageProps = {
  message: MessageData;
  duration?: number;
};

const Message = ({ message, duration }: MessageProps) => {
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

  if (!message || !isVisible) {
    return null;
  }

  return (
    <div className={`message message--${message.type}`}>
      <p>{message.text}</p>
    </div>
  );
};

export default Message;
