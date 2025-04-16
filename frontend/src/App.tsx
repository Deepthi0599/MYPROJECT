import React, { useState, useEffect } from 'react';
import ChatHistory from './components/ChatHistory';
import FileUpload from './components/FileUpload';  // Assuming you have FileUpload
import QuestionInput from './components/QuestionInput';  // Import the QuestionInput component
import './App.css';

// Define types for chat messages
export interface ChatMessage {
  id: number;
  text: string;
  sender: 'user' | 'agent';
}

const App: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState<string>('');

  // Load chat history from localStorage
  useEffect(() => {
    const savedMessages = localStorage.getItem('chatHistory');
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }
  }, []);

  // Save chat history to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('chatHistory', JSON.stringify(messages));
    }
  }, [messages]);

  // Handle sending a new message
  const handleSendMessage = () => {
    if (input.trim() === '') return;

    const newMessage: ChatMessage = {
      id: Date.now(),
      text: input,
      sender: 'user',
    };

    // Sample agent response
    const newAgentResponse: ChatMessage = {
      id: Date.now() + 1,
      text: 'Agent response goes here!',
      sender: 'agent',
    };

    setMessages([...messages, newMessage, newAgentResponse]);
    setInput(''); // Clear the input field
  };

  // Handle clearing the chat
  const handleClearChat = () => {
    setMessages([]);
    localStorage.removeItem('chatHistory');
  };

  // Handle starting a new chat
  const handleNewChat = () => {
    setMessages([]);
    setInput('');
  };

  // Handle file upload
  const handleFileUpload = (file: File) => {
    const newMessage: ChatMessage = {
      id: Date.now(),
      text: `Uploaded file: ${file.name}`,
      sender: 'user',
    };
    setMessages([...messages, newMessage]);
    // Additional file processing logic can be added here (e.g., file parsing)
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
        <ChatHistory messages={messages} />
        <FileUpload onFileUpload={handleFileUpload} />
        <QuestionInput
          input={input}
          setInput={setInput}
          onSendMessage={handleSendMessage} // Passing send message function
        />
      </div>
    </div>
  );
};

export default App;
