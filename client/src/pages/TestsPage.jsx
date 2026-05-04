import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function TestsPage() {
  const { company } = useParams();
  const navigate = useNavigate();

  const displayCompany = company
    ? company.charAt(0).toUpperCase() + company.slice(1)
    : "General";

  const [availableTests, setAvailableTests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch distinct testIds for this company from the backend
  useEffect(() => {
    let url = `http://localhost:5000/questions/tests`;
    if (company) url += `?company=${company}`;

    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        // data = [{ testId, count }] from the server
        setAvailableTests(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        // Fallback: show a static card if server endpoint doesn't exist yet
        setAvailableTests([{ testId: "Test 1", count: 20 }]);
        setLoading(false);
      });
  }, [company]);

  const handleStart = (testId) => {
    const path = company
      ? `/questions/aptitude/${company}`
      : `/questions/aptitude`;
    navigate(path, { state: { isPractice: true, testId } });
  };

  return (
    <div className="content-area">
      <div className="page-container">

        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
          <button className="back-btn" onClick={() => navigate(-1)} style={{ margin: 0 }}>← Back</button>
          <div className="category-badge">Mock Test Section</div>
        </div>

        <header style={{ marginBottom: '40px' }}>
          <h2 className="text-accent">{displayCompany} Practice Assessments</h2>
          <p style={{ color: 'var(--text-muted)' }}>
            Simulate the actual exam environment with timed MCQ tests.
          </p>
        </header>

        {loading ? (
          <div className="loader">Loading available tests…</div>
        ) : availableTests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg2)', borderRadius: 12, border: '1px dashed var(--border)' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: 16 }}>
              No tests found for <strong>{displayCompany}</strong>.<br />
              Upload test questions to MongoDB with a <code>testId</code> field.
            </p>
          </div>
        ) : (
          <div className="test-grid">
            {availableTests.map((test, i) => (
              <div
                key={i}
                className="test-card animate-float"
                onClick={() => handleStart(test.testId)}
              >
                <span className="test-icon">📝</span>
                <h3>{test.testId}</h3>
                <div className="test-meta">
                  <span>{test.count} Questions</span>
                  {test.count > 0 && <span> · ~{Math.ceil(test.count * 2)}m</span>}
                </div>
                <button className="start-test-btn">Start Assessment →</button>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
