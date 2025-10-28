import { useMessage, type MessageProps } from "../../hooks/useMessage";
import "./Message.css";

const Message = ({ message, duration }: MessageProps) => {
  const { isVisible } = useMessage({ message, duration });

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
