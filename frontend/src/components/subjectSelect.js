import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // For redirection
import "./subjectSelect.css"; // External CSS file

const subjectsList = [
  "Cloud Computing",
  "DevOps",
  "Artificial Intelligence",
  "Machine Learning",
  "Cyber Security",
  "Computational Biology"
];

const SubjectSelection = () => {
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const navigate = useNavigate(); // React Router navigation

  // Toggle selection
  const toggleSubject = (subject) => {
    setSelectedSubjects((prevSelected) =>
      prevSelected.includes(subject)
        ? prevSelected.filter((s) => s !== subject) // Remove if already selected
        : [...prevSelected, subject] // Add if not selected
    );
  };

  // Save & navigate
  const handleContinue = () => {
    if (selectedSubjects.length === 0) {
      alert("Please select at least one subject.");
      return;
    }

    localStorage.setItem("selectedSubjects", JSON.stringify(selectedSubjects));
    alert("Subjects saved! Redirecting...");
    navigate("/dashboard"); // Change to your actual dashboard route
  };

  return (
    <div className="container-subjects">
      <h2>Choose your areas of expertise</h2>
      <div className="tags">
        {subjectsList.map((subject) => (
          <div
            key={subject}
            className={`tag ${selectedSubjects.includes(subject) ? "selected" : ""}`}
            onClick={() => toggleSubject(subject)}
          >
            <span className="tag-content">{subject}</span>
            <span className="icon">{selectedSubjects.includes(subject) ? "×" : "+"}</span>
          </div>
        ))}
      </div>
      <button className="btn" onClick={handleContinue}>Continue</button>
    </div>
  );
};

export default SubjectSelection;
