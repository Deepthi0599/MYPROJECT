import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000", // Backend URL
});

export const uploadFile = (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  return api.post("/upload", formData);
};

export const getAgentResponse = (message: string) => {
  return api.post("/ask", { message });
};
