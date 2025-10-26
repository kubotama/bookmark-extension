import "./Message.css";

import { useEffect, useState } from "react";

type MessageProps = {
  message: {
    text: string;
    type: "success" | "error" | "info";
  };
  duration?: number;
};

const Message = ({ message, duration }: MessageProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // 新しいメッセージが渡されたら、表示状態にリセットする
    setIsVisible(true);
  }, [message]);
  useEffect(() => {
    if (duration && isVisible) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, message]);

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
