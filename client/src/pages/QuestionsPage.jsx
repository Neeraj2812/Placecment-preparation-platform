import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Editor from "@monaco-editor/react";

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS — parse your actual MongoDB data format
//
// Your questions look like:
//   question: "Which algo is best?\n\na) BFS\nb) DFS\nc) DP\nd) Greedy"
//   answer:   "Answer: c\n\nExplanation: ..."
//
// So we pull options OUT of the question text, and detect the correct letter
// from the answer string.
// ─────────────────────────────────────────────────────────────────────────────

/** Split question text into the stem and options a/b/c/d if they're embedded */
function parseQuestion(raw = "") {
  const text   = raw.trim();
  // Match lines that start with  a)  b)  c)  d)  (with optional leading whitespace)
  const optRe  = /^\s*([a-d])\s*[).:\-]\s*(.+)/im;

  if (!optRe.test(text)) {
    // No embedded options — return question as-is, options will be empty
    return { stem: text, options: {} };
  }

  // Split on the FIRST occurrence of an option line
  const firstOpt = text.search(/\n\s*[a-d]\s*[).:\-]/i);
  const stem     = firstOpt > -1 ? text.substring(0, firstOpt).trim() : text;

  // Extract each option
  const options = {};
  const lines   = text.split("\n");
  lines.forEach(line => {
    const m = line.match(/^\s*([a-d])\s*[).:\-]\s*(.+)/i);
    if (m) options[m[1].toLowerCase()] = m[2].trim();
  });

  return { stem, options };
}

/** Detect the correct letter from the answer string.
 *  Handles: "Answer: c", "Correct: C", "c)", "Answer is c", bare "c" etc. */
function detectCorrect(answer = "") {
  const s = answer.toLowerCase();
  // explicit label
  let m = s.match(/(?:answer|correct)\s*(?:is\s*)?[:\-]?\s*([a-d])\b/);
  if (m) return m[1];
  // first lone letter a-d
  m = s.match(/\b([a-d])\b/);
  return m ? m[1] : null;
}

/** Get display text for an option letter */
function getOptionText(q, opt, parsedOptions) {
  // Priority: separate DB field → embedded in question → fallback
  if (q.options && typeof q.options === "object" && !Array.isArray(q.options))
    return q.options[opt] || parsedOptions[opt] || `Option ${opt.toUpperCase()}`;
  if (q[`option_${opt}`])
    return q[`option_${opt}`];
  if (Array.isArray(q.options)) {
    const idx = ["a","b","c","d"].indexOf(opt);
    return q.options[idx] || parsedOptions[opt] || `Option ${opt.toUpperCase()}`;
  }
  return parsedOptions[opt] || `Option ${opt.toUpperCase()}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function QuestionsPage() {
  const { category, company } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const isPracticeMode = location.state?.isPractice;
  const testId         = location.state?.testId;

  const [questions,       setQuestions]       = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [error,           setError]           = useState("");
  const [openIndex,       setOpenIndex]       = useState(null);

  // Test / assessment state
  const [currentQIndex,   setCurrentQIndex]   = useState(0);
  const [isTestSubmitted, setIsTestSubmitted] = useState(false);
  const [score,           setScore]           = useState(0);
  const [testStartTime]                       = useState(Date.now());

  const [selectedOptions, setSelectedOptions] = useState({});
  const [revealedAnswers, setRevealedAnswers] = useState({});
  const [outputs,         setOutputs]         = useState({});
  const [runningId,       setRunningId]       = useState(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    setLoading(true);
    setError("");
    let url = `http://localhost:5000/questions?category=${encodeURIComponent(category)}`;
    if (company) url += `&company=${encodeURIComponent(company)}`;
    if (testId)  url += `&testId=${encodeURIComponent(testId)}`;

    fetch(url)
      .then(r => { if (!r.ok) throw new Error(`Server error ${r.status}`); return r.json(); })
      .then(data => { setQuestions(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  }, [category, company, testId]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const selectOption = (qIdx, opt) => {
    if (isTestSubmitted || revealedAnswers[qIdx]) return;
    setSelectedOptions(p => ({ ...p, [qIdx]: opt }));
  };

  const revealAnswer = (qIdx) => setRevealedAnswers(p => ({ ...p, [qIdx]: true }));

  const submitTest = () => {
    let calc = 0;
    const revealed = {};
    questions.forEach((q, idx) => {
      revealed[idx] = true;
      if (detectCorrect(q.answer) === selectedOptions[idx]) calc++;
    });
    setScore(calc);
    setRevealedAnswers(revealed);
    setIsTestSubmitted(true);

    const token = localStorage.getItem("token");
    if (token) {
      fetch("http://localhost:5000/api/save-score", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          testId:         testId || "Practice",
          company:        company || "General",
          score:          calc,
          totalQuestions: questions.length,
          timeTaken:      Math.round((Date.now() - testStartTime) / 1000),
        }),
      }).catch(() => {});
    }
  };

  const runCode = (idx) => {
    setRunningId(idx);
    setTimeout(() => {
      const ts = new Date().toLocaleTimeString();
      setOutputs(p => ({
        ...p,
        [idx]: `[${ts}] Compilation successful...\n[${ts}] Executing...\n-------------------------------\nHello World!\n\nProcess finished with exit code 0.`,
      }));
      setRunningId(null);
    }, 1000);
  };

  // ── Option row ─────────────────────────────────────────────────────────────
  const OptionRow = ({ q, qIdx, opt, parsedOptions, vertical = false }) => {
    const correct    = detectCorrect(q.answer);
    const isCorrect  = correct === opt;
    const isSelected = selectedOptions[qIdx] === opt;
    const isRevealed = revealedAnswers[qIdx];
    const text       = getOptionText(q, opt, parsedOptions);

    return (
      <div
        className={`option-row ${isSelected ? "selected" : ""} ${isRevealed && isCorrect ? "correct" : ""} ${isRevealed && isSelected && !isCorrect ? "wrong" : ""}`}
        onClick={() => selectOption(qIdx, opt)}
        style={{ justifyContent: "flex-start", padding: "13px 18px", gap: 12,
                 flexDirection: "row", width: "100%" }}
      >
        <div className="opt-indicator">{opt.toUpperCase()}</div>
        <span style={{ fontWeight: 600, fontSize: 14, lineHeight: 1.5 }}>{text}</span>
        {isRevealed && isCorrect  && <span style={{ marginLeft: "auto", fontWeight: 800 }}>✓</span>}
        {isRevealed && isSelected && !isCorrect && <span style={{ marginLeft: "auto", fontWeight: 800 }}>✗</span>}
      </div>
    );
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER A: FLOATING ASSESSMENT MODAL
  // ─────────────────────────────────────────────────────────────────────────
  if (testId && !loading) {
    if (questions.length === 0) {
      return (
        <div className="assessment-overlay">
          <div className="assessment-modal" style={{ textAlign: "center", padding: 60 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
            <h3>No questions found for "{testId}"</h3>
            <p style={{ color: "var(--text-muted)", marginTop: 8 }}>
              Make sure you've imported questions to MongoDB with <code>testId: "{testId}"</code>
              {company ? ` and company: "${company}"` : ""}.
            </p>
            <button className="close-modal-btn" style={{ marginTop: 28 }} onClick={() => navigate(-1)}>
              ← Go Back
            </button>
          </div>
        </div>
      );
    }

    const q = questions[currentQIndex];
    const { stem, options: parsedOpts } = parseQuestion(q.question);
    const hasOptions = Object.keys(parsedOpts).length > 0 || q.option_a || q.options;

    return (
      <div className="assessment-overlay">
        <div className="assessment-modal">

          {/* Header */}
          <div className="modal-header">
            <h3 style={{ fontSize: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <span>📝</span> {testId}{company ? ` — ${company}` : ""}
            </h3>
            {isTestSubmitted && (
              <div style={{ background: "var(--accent-dim)", color: "var(--accent)",
                padding: "5px 16px", borderRadius: 20, fontWeight: "bold", whiteSpace: "nowrap" }}>
                Score: {score} / {questions.length}
              </div>
            )}
            <button className="close-modal-btn" onClick={() => navigate(-1)}>Exit</button>
          </div>

          {/* Body */}
          <div className="modal-body">
            <div style={{ fontSize: 16, marginBottom: 24, whiteSpace: "pre-wrap", lineHeight: 1.75, color: "var(--text)" }}>
              <span className="q-num">Q{currentQIndex + 1}.</span> {stem}
            </div>

            {hasOptions ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {["a","b","c","d"].map(opt => (
                  <OptionRow key={opt} q={q} qIdx={currentQIndex} opt={opt} parsedOptions={parsedOpts} />
                ))}
              </div>
            ) : (
              <div style={{ background: "var(--bg3)", padding: 16, borderRadius: 8,
                color: "var(--text-muted)", fontSize: 14, fontStyle: "italic" }}>
                (No MCQ options — this is a descriptive question)
              </div>
            )}

            {isTestSubmitted && (
              <div className="solution-box animate-fade" style={{ marginTop: 24 }}>
                <div className="sol-label">Solution / Explanation:</div>
                <div style={{ color: "var(--text-muted)", whiteSpace: "pre-wrap", lineHeight: 1.7, marginTop: 8 }}>
                  {q.answer}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button className="nav-btn"
              onClick={() => setCurrentQIndex(p => p - 1)}
              disabled={currentQIndex === 0}>
              ← Prev
            </button>

            {/* Question dot navigation */}
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap",
              justifyContent: "center", flex: 1, maxWidth: "55%" }}>
              {questions.map((_, i) => (
                <button key={i} onClick={() => setCurrentQIndex(i)} style={{
                  width: 28, height: 28, borderRadius: "50%", fontSize: 11, fontWeight: 700, border: "1px solid",
                  background: i === currentQIndex ? "var(--accent)" : selectedOptions[i] ? "var(--bg3)" : "var(--bg2)",
                  color:      i === currentQIndex ? "var(--bg)" : "var(--text-muted)",
                  borderColor: i === currentQIndex ? "var(--accent)" : "var(--border)",
                }}>
                  {i + 1}
                </button>
              ))}
            </div>

            {currentQIndex === questions.length - 1 && !isTestSubmitted ? (
              <button className="submit-test-btn" onClick={submitTest}>Submit ✓</button>
            ) : (
              <button className="nav-btn"
                onClick={() => setCurrentQIndex(p => p + 1)}
                disabled={currentQIndex === questions.length - 1 || isTestSubmitted}>
                Next →
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER B: STUDY BANK / INTERACTIVE PRACTICE
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ padding: "40px 20px", maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ marginBottom: 28, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
        <div className="category-badge">{isPracticeMode ? "Interactive Practice" : "Study Bank"}</div>
        <h2 style={{ margin: 0 }}>
          {company ? `${company.charAt(0).toUpperCase()}${company.slice(1)} ` : "General "}
          <span className="text-accent">{category}</span>
        </h2>
      </div>

      {loading ? (
        <div className="loader">Loading questions…</div>
      ) : error ? (
        <div style={{ textAlign: "center", padding: 50, color: "var(--red)" }}>
          <h3>Error loading questions</h3>
          <p style={{ marginTop: 8, color: "var(--text-muted)" }}>{error}</p>
          <p style={{ marginTop: 8, color: "var(--text-muted)", fontSize: 13 }}>
            Make sure the backend server is running on port 5000.
          </p>
        </div>
      ) : questions.length === 0 ? (
        <div style={{ textAlign: "center", padding: 50, background: "var(--bg2)",
          borderRadius: 12, border: "1px dashed var(--border)" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
          <h3>No questions found</h3>
          <p style={{ color: "var(--text-muted)", marginTop: 8, fontSize: 14 }}>
            Looking for: <code>category="{category}"</code>
            {company ? <>, <code>company="{company}"</code></> : null}
          </p>
          <p style={{ color: "var(--text-muted)", marginTop: 8, fontSize: 13 }}>
            Make sure you've imported your JSON files into MongoDB and the server is running.
          </p>
        </div>
      ) : (
        <>
          <p style={{ color: "var(--text-muted)", marginBottom: 20, fontSize: 13 }}>
            {questions.length} question{questions.length !== 1 ? "s" : ""} found
          </p>
          <div className="questions-list">
            {questions.map((q, index) => {
              const { stem, options: parsedOpts } = parseQuestion(q.question);
              const hasOptions = Object.keys(parsedOpts).length > 0 || q.option_a || q.options;

              return (
                <div key={index} className={`question-item ${openIndex === index ? "active" : ""}`}>

                  <div className="question-header"
                    onClick={() => setOpenIndex(openIndex === index ? null : index)}>
                    <div className="question-text" style={{ flex: 1 }}>
                      <span className="q-num">Q{index + 1}.</span>{" "}
                      {stem.length > 100 ? stem.substring(0, 100) + "…" : stem}
                    </div>
                    <div className="q-meta" style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                      <span className={`pill pill-${(q.difficulty || "medium").toLowerCase()}`}>
                        {q.difficulty || "Medium"}
                      </span>
                      <span style={{ color: "var(--text-muted)", fontSize: 12 }}>
                        {openIndex === index ? "▲" : "▼"}
                      </span>
                    </div>
                  </div>

                  {openIndex === index && (
                    <div className="answer-section" style={{ padding: "0 20px 20px" }}>

                      {/* ── APTITUDE INTERACTIVE PRACTICE ── */}
                      {category === "aptitude" && isPracticeMode && hasOptions ? (
                        <div className="quiz-area animate-fade">
                          <div className="sol-label" style={{ marginBottom: 10 }}>Problem Statement:</div>
                          <p style={{ whiteSpace: "pre-wrap", marginBottom: 20,
                            color: "var(--text)", lineHeight: 1.75 }}>{stem}</p>

                          <div className="sol-label" style={{ marginBottom: 10 }}>Choose your answer:</div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
                            {["a","b","c","d"].map(opt => (
                              <OptionRow key={opt} q={q} qIdx={index} opt={opt} parsedOptions={parsedOpts} />
                            ))}
                          </div>

                          <button className="check-ans-btn"
                            onClick={() => revealAnswer(index)}
                            disabled={!selectedOptions[index] || revealedAnswers[index]}>
                            {revealedAnswers[index] ? "✓ Answer Revealed" : "Check Answer"}
                          </button>

                          {revealedAnswers[index] && (
                            <div className="solution-box animate-fade" style={{ marginTop: 18 }}>
                              <div className="sol-label">Explanation:</div>
                              <div style={{ color: "var(--text-muted)", whiteSpace: "pre-wrap",
                                lineHeight: 1.7, marginTop: 8 }}>{q.answer}</div>
                            </div>
                          )}
                        </div>

                      /* ── CODING INTERACTIVE PRACTICE ── */
                      ) : category === "coding" && isPracticeMode ? (
                        <div className="code-editor-area animate-fade" style={{ paddingTop: 12 }}>
                          <div style={{ marginBottom: 12, color: "var(--text)", lineHeight: 1.7 }}>{stem}</div>
                          <div className="code-editor-container">
                            <Editor
                              height="320px"
                              theme="vs-dark"
                              defaultLanguage="cpp"
                              defaultValue={q.answer || "// Write your solution here\n"}
                              onChange={() => {}}
                            />
                            <div className="editor-controls">
                              <button onClick={() => runCode(index)} disabled={runningId === index}>
                                {runningId === index ? "Running…" : "▶ Run Code"}
                              </button>
                            </div>
                            {outputs[index] && (
                              <pre className="console-output">
                                <div className="console-label">Terminal Output:</div>
                                <code>{outputs[index]}</code>
                              </pre>
                            )}
                          </div>
                        </div>

                      /* ── STUDY / READ-ONLY ── */
                      ) : (
                        <div className="animate-fade" style={{ paddingTop: 12 }}>
                          <div className="sol-label">Full Question:</div>
                          <div style={{ marginBottom: 18, color: "var(--text)",
                            whiteSpace: "pre-wrap", lineHeight: 1.75 }}>{stem}</div>

                          {/* Show parsed options in read-only style if they exist */}
                          {hasOptions && (
                            <>
                              <div className="sol-label" style={{ marginBottom: 10 }}>Options:</div>
                              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 18 }}>
                                {["a","b","c","d"].map(opt => {
                                  const text    = getOptionText(q, opt, parsedOpts);
                                  const correct = detectCorrect(q.answer);
                                  return (
                                    <div key={opt} style={{
                                      padding: "10px 16px", borderRadius: 8, display: "flex", gap: 12, alignItems: "center",
                                      background: correct === opt ? "rgba(63,185,80,0.12)" : "var(--bg3)",
                                      border: `1px solid ${correct === opt ? "var(--green)" : "var(--border)"}`,
                                      color: correct === opt ? "var(--green)" : "var(--text-muted)",
                                    }}>
                                      <strong style={{ fontFamily: "var(--font-mono)", minWidth: 20 }}>{opt.toUpperCase()}.</strong>
                                      <span>{text}</span>
                                      {correct === opt && <span style={{ marginLeft: "auto", fontWeight: 800 }}>✓ Correct</span>}
                                    </div>
                                  );
                                })}
                              </div>
                            </>
                          )}

                          <div className="sol-label">Answer / Explanation:</div>
                          <div style={{ color: "var(--text-muted)", whiteSpace: "pre-wrap", lineHeight: 1.75, marginTop: 8 }}>
                            {q.answer}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
