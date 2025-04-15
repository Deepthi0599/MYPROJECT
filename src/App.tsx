import React, { useState, useEffect } from "react";
import "./App.css"; // Importing styles

// Define types for chat messages
interface ChatMessage {
  id: number;
  text: string;
  sender: "user" | "agent";
}

const App: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState<string>("");

  // Load chat history from localStorage
  useEffect(() => {
    const savedMessages = localStorage.getItem("chatHistory");
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }
  }, []);

  // Save chat history to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("chatHistory", JSON.stringify(messages));
    }
  }, [messages]);

  // Handle sending a new message
  const handleSendMessage = () => {
    if (input.trim() === "") return;

    const newMessage: ChatMessage = {
      id: Date.now(),
      text: input,
      sender: "user",
    };

    // Sample agent response
    const newAgentResponse: ChatMessage = {
      id: Date.now() + 1,
      text: "Agent response goes here!",
      sender: "agent",
    };

    setMessages([...messages, newMessage, newAgentResponse]);
    setInput(""); // Clear the input field
  };

  // Handle clearing the chat
  const handleClearChat = () => {
    setMessages([]);
    localStorage.removeItem("chatHistory");
  };

  // Handle starting a new chat
  const handleNewChat = () => {
    setMessages([]);
    setInput("");
  };

  return (
    <div className="App">
      <div className="chat-container">
        <div className="header">
          <button className="new-chat-btn" onClick={handleNewChat}>
            New Chat
          </button>
          <button className="clear-chat-btn" onClick={handleClearChat}>
            Clear Chat
          </button>
        </div>
        <div className="chat-box">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`message ${msg.sender === "user" ? "user" : "agent"}`}
            >
              <p>{msg.text}</p>
            </div>
          ))}
        </div>
        <div className="input-container">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
          />
          <button onClick={handleSendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
};

export default App;
