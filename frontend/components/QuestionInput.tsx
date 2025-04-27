import React from 'react';

interface QuestionInputProps {
  input: string;                  // Current input value
  setInput: React.Dispatch<React.SetStateAction<string>>; // Function to update input
  onSendMessage: () => void;      // Function to send the message
}

const QuestionInput: React.FC<QuestionInputProps> = ({ input, setInput, onSendMessage }) => {
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInput(event.target.value); // Update the input state with the user's typing
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault(); // Prevent the form from refreshing
    onSendMessage(); // Trigger sending the message when the user submits
  };

  return (
    <div className="input-container">
      <form onSubmit={handleSubmit} className="input-form">
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder="Type a message..."
          className="input-box"
        />
        <button type="submit" className="send-btn">Send</button>
      </form>
    </div>
  );
};

export default QuestionInput;
