import React, { useState } from "react";
import { useDropzone } from "react-dropzone"; // Importing useDropzone hook from react-dropzone
import "./FileUpload.css"; // Add custom styles for file upload (optional)

interface FileUploadProps {
  onFileUpload: (file: File) => void; // Prop to handle file upload
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload }) => {
  const [message, setMessage] = useState<string>(""); // State for success/failure message

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'application/pdf': [], // Accept PDF files
      'text/plain': [],
      'application/msword': [], // for .doc
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [],// Accept TXT files
    },
    minSize: 0,             // Minimum file size (in bytes)
    maxSize: 10 * 1024 * 1024, // Maximum file size (10MB in bytes)
    maxFiles: 1,            // Allow only one file to be uploaded at a time
    noClick: false,         // Allow the file input to be clicked for selecting files
    noKeyboard: false,      // Enable keyboard support for file selection
    noDrag: false,          // Enable dragging of files into the dropzone
    noDragEventsBubbling: false, // Ensure drag events propagate normally
    preventDropOnDocument: false, // Allow dropping on the entire document
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        onFileUpload(file);  // Call the parent component's handler function
        setMessage("File uploaded successfully!");  // Show success message
      } else {
        setMessage("Invalid file type! Please upload a .pdf or .txt file.");
      }
    },
    onDropRejected: () => {
      setMessage("Invalid file type! Please upload a .pdf or .txt file.");
    },
  });

  return (
    <div className="file-upload-container">
      <div {...getRootProps()} className="dropzone">
        <input {...getInputProps()} />
        <p>Drag & Drop PDF or TXT file here, or click to select</p>
      </div>
      {message && <p className="upload-message">{message}</p>} {/* Display message */}
    </div>
  );
};

export default FileUpload;
