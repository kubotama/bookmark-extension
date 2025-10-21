
import React from 'react';
import './Message.css';

type MessageProps = {
  message: {
    text: string;
    type: 'success' | 'error' | 'info';
  };
};

const Message: React.FC<MessageProps> = ({ message }) => {
  if (!message) {
    return null;
  }

  return (
    <div className={`message message--${message.type}`}>
      <p>{message.text}</p>
    </div>
  );
};

export default Message;
