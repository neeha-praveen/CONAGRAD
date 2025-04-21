import React, { useState } from 'react';
import { motion } from 'framer-motion';

const StudentUpload = () => {
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle file upload logic here
    console.log('File to upload:', file);
  };

  return (
    <div className="student-upload-container">
      <h2>Upload Your Document</h2>
      <form onSubmit={handleSubmit}>
        <div className="upload-section">
          <input
            type="file"
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx"
          />
        </div>
        <motion.button
          type="submit"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Upload Document
        </motion.button>
      </form>
    </div>
  );
};

export default StudentUpload;