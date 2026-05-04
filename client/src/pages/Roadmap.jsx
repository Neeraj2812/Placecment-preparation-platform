import { useState, useEffect } from "react";

const steps = [
  { title: "Basics", desc: "C++ / Java / Python" },
  { title: "DSA", desc: "Arrays, Trees, Graphs" },
  { title: "Problem Solving", desc: "Leetcode Practice" },
  { title: "Core Subjects", desc: "OS, DBMS, CN" },
  { title: "Projects", desc: "Build real apps" },
  { title: "Interview Prep", desc: "HR + Tech" }
];

export default function Roadmap() {
  const [completed, setCompleted] = useState([]);

  // Save progress
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("progress")) || [];
    setCompleted(saved);
  }, []);

  const toggleStep = (index) => {
    let updated;

    if (completed.includes(index)) {
      updated = completed.filter(i => i !== index);
    } else {
      updated = [...completed, index];
    }

    setCompleted(updated);
    localStorage.setItem("progress", JSON.stringify(updated));
  };

  const progress = Math.round((completed.length / steps.length) * 100);

  return (
    <div className="roadmap-container">

      {/* HEADER */}
      <h2>🚀 Your Learning Roadmap</h2>

      {/* PROGRESS BAR */}
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>
      <p>{progress}% Completed</p>

      {/* CARDS */}
      <div className="card-container">
        {steps.map((step, index) => (
          <div
            key={index}
            className={`course-card ${completed.includes(index) ? "done" : ""}`}
          >
            <h3>{step.title}</h3>
            <p>{step.desc}</p>

            <button onClick={() => toggleStep(index)}>
              {completed.includes(index) ? "Completed ✅" : "Start Learning"}
            </button>

            {completed.includes(index) && (
              <span className="badge">🏆 Badge Earned</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}