import React, { useState, useEffect } from "react";
import axios from "axios";

const BACKEND_URL = "http://127.0.0.1:8000"; // Update if deployed

const App = () => {
  const [file, setFile] = useState<File | null>(null);
  const [fileId, setFileId] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [chat, setChat] = useState<{ sender: string; text: string }[]>([]);
  const [uploadMsg, setUploadMsg] = useState("");

  // Load chat from localStorage
  useEffect(() => {
    const storedChat = localStorage.getItem("chat");
    if (storedChat) {
      setChat(JSON.parse(storedChat));
    }
  }, []);

  // Save chat to localStorage
  useEffect(() => {
    localStorage.setItem("chat", JSON.stringify(chat));
  }, [chat]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    const formData = new FormData();
    formData.append("file", selected);

    try {
      const res = await axios.post(`${BACKEND_URL}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUploadMsg(res.data.message);
      setFileId(res.data.file_id);
      setChat([]); // Clear previous chat after upload
    } catch (err) {
      console.error('Upload failed', err);
      setUploadMsg("Upload failed.");
    }
  };

  const handleSend = async () => {
    if (!question.trim()) return;

    setChat((prev) => [...prev, { sender: "You", text: question }]);

    try {
      const res = await axios.post(
        `${BACKEND_URL}/ask`,
        {
          question,
          session_id: fileId,
        },
        { headers: { "Content-Type": "application/json" } }
      );
      setChat((prev) => [...prev, { sender: "AI", text: res.data.response }]); // ✅ Corrected here
      setQuestion("");
    } catch (err) {
      console.error('Question failed', err);
      setChat((prev) => [...prev, { sender: "AI", text: "Error getting answer." }]);
    }
  };

  const handleNewChat = () => {
    // ✅ No backend call needed, just clear local state
    setChat([]);
    setFileId(null);
    setUploadMsg("New chat started. Upload a document.");
    localStorage.removeItem("chat");
  };

  const handleClearChat = () => {
    setChat([]);
    localStorage.removeItem("chat");
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>Document Q&A Chatbot</h1>

      <input type="file" onChange={handleUpload} />
      <p>{uploadMsg}</p>

      <div style={{ marginTop: "20px" }}>
        {chat.map((msg, idx) => (
          <div key={idx} style={{ margin: "10px 0" }}>
            <b>{msg.sender}:</b> {msg.text}
          </div>
        ))}

        <div style={{ marginTop: "20px" }}>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a question..."
            style={{ width: "300px", marginRight: "10px" }}
          />
          <button onClick={handleSend}>Send</button>
          <button onClick={handleClearChat} style={{ marginLeft: "10px" }}>
            Clear Chat
          </button>
          <button onClick={handleNewChat} style={{ marginLeft: "10px" }}>
            New Chat
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
