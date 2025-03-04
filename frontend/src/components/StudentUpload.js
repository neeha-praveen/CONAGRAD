import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./StudentUpload.css";

const StudentUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // For pending uploads
  const [pending, setPending] = useState([]);
  const [loadingPending, setLoadingPending] = useState(true);
  const [errorPending, setErrorPending] = useState("");

  // Fetch initial upload history
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axios.get("http://localhost:4000/history");
        setHistory(response.data);
      } catch (err) {
        console.error("History fetch error:", err);
        setError("Failed to load upload history");
        // Uncomment below to use dummy data if API is unavailable:
        /*
        setHistory([
          { name: "Assignment1.pdf", status: "Completed", date: "01/10/2025" },
          { name: "Project.zip", status: "Pending", date: "01/12/2025" },
        ]);
        */
      }
      setLoading(false);
    };
    fetchHistory();
  }, []);

  // Fetch pending uploads
  useEffect(() => {
    const fetchPending = async () => {
      try {
        const response = await axios.get("http://localhost:4000/pending");
        setPending(response.data);
      } catch (err) {
        console.error("Pending fetch error:", err);
        setErrorPending("Failed to load pending uploads");
        // Uncomment below to use dummy data if API is unavailable:
        /*
        setPending([
          { name: "Draft1.pdf", status: "Pending", date: "01/15/2025" },
          { name: "Draft2.pdf", status: "Pending", date: "01/16/2025" },
        ]);
        */
      }
      setLoadingPending(false);
    };
    fetchPending();
  }, []);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setUploadStatus("");
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadStatus("No file selected. Please choose a file.");
      return;
    }

    // Simulated API upload:
    try {
      // Simulate an API upload delay (simulated success)
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Simulated upload success");

      // Create a new history record with the current date.
      const currentDate = new Date().toLocaleDateString();
      const newRecord = {
        name: selectedFile.name,
        status: "Completed",
        date: currentDate,
      };
      // Update history: add the new record at the beginning.
      setHistory((prevHistory) => [newRecord, ...prevHistory]);
      setUploadStatus("Uploaded successfully!");
      setSelectedFile(null);
    } catch (uploadError) {
      console.error("Upload error:", uploadError);
      setUploadStatus("Uploaded unsuccessfully - try again.");
    }
  };

  return (
    <div className="student-upload-page">
      <nav className="navbar">
        <div className="navbar-logo">
          <img src="/Conagrad.jpg" alt="Platform Logo" />
        </div>
        <div className="navbar-menu">
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/history">History</Link>
            </li>
            <li className="profile-dropdown">
              <Link to="/profile">Profile</Link>
              <ul className="dropdown">
                <li>
                  <Link to="/help">Help</Link>
                </li>
                <li>
                  <Link to="/settings">Settings</Link>
                </li>
                <li>
                  <Link to="/logout">Logout</Link>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </nav>

      <div className="upload-container">
        <h2>Upload Assignment / Project</h2>
        <input type="file" onChange={handleFileChange} />
        {selectedFile && (
          <div className="file-preview">
            <p>
              <strong>Selected file:</strong> {selectedFile.name}
            </p>
          </div>
        )}
        <button onClick={handleUpload}>Upload</button>
        {uploadStatus && (
          <div
            className={`upload-message ${
              uploadStatus.includes("successfully") ? "success" : "error"
            }`}
          >
            {uploadStatus}
          </div>
        )}
      </div>

      {/* Pending Uploads */}
      <div className="pending-container">
        <h2>Your Pending Uploads</h2>
        {loadingPending ? (
          <p>Loading...</p>
        ) : errorPending ? (
          <p className="error">{errorPending}</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>File Name</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {pending.length === 0 ? (
                <tr>
                  <td colSpan="3">No pending uploads found.</td>
                </tr>
              ) : (
                pending.map((item, index) => (
                  <tr key={index}>
                    <td>{item.name}</td>
                    <td>{item.status}</td>
                    <td>{item.date}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default StudentUpload;