import React from 'react';
import { ChatMessage } from '../src/App'; // Assuming the ChatMessage type is defined in App.tsx or imported here.

interface ChatHistoryProps {
  messages: ChatMessage[];  // Prop to receive messages to display
}

const ChatHistory: React.FC<ChatHistoryProps> = ({ messages }) => {
  return (
    <div className="chat-box">
      {messages.length === 0 ? (
        <p className="no-messages">No messages yet. Start chatting!</p>
      ) : (
        messages.map((msg) => (
          <div
            key={msg.id}
            className={`message ${msg.sender === 'user' ? 'user' : 'agent'}`}
          >
            <p>{msg.text}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default ChatHistory;
