import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function Analytics() {
  const location = useLocation();
  const navigate = useNavigate();

  // 🟢 Catch the data passed directly from QuestionsPage.jsx
  const recentTest = location.state;

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Save the new score to the database, then fetch all historical scores
  useEffect(() => {
    const handleScores = async () => {
      // 1. If we just arrived from a completed test, save it to the DB
      if (recentTest && recentTest.testId) {
        try {
          await fetch('http://localhost:5000/api/save-score', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              // Include your auth token so the backend knows which user this is
              'Authorization': `Bearer ${localStorage.getItem('token')}` 
            },
            body: JSON.stringify({
              testId: recentTest.testId,
              company: recentTest.company,
              score: recentTest.score,
              totalQuestions: recentTest.totalQuestions,
              timeTaken: recentTest.timeTaken,
              date: new Date().toISOString()
            })
          });
          // Note: We don't await the response to block the UI, we just let it save in the background
        } catch (err) {
          console.error("Failed to save score:", err);
        }
      }

      // 2. Fetch the user's entire past history
      try {
        const res = await fetch('http://localhost:5000/api/analytics', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        if (res.ok) {
          const data = await res.json();
          setHistory(data);
        }
      } catch (err) {
        console.error("Failed to fetch history:", err);
      } finally {
        setLoading(false);
      }
    };

    handleScores();
  }, [recentTest]);

  // Helper function to turn seconds (e.g., 95) into "1m 35s"
  const formatTime = (seconds) => {
    if (!seconds) return "0s";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  return (
    <div className="content-area">
      <div className="page-container">
        <header className="section-header-text">
          <h2 className="text-accent">Performance Analytics</h2>
          <p>Track your assessment scores, speed, and overall progress.</p>
        </header>

        {/* ==========================================
            UI 1: IMMEDIATE RESULTS (If just finished a test)
            ========================================== */}
        {recentTest && (
          <div className="company-card" style={{ marginBottom: '40px', borderColor: 'var(--green)', animation: 'fadeIn 0.5s ease-in-out' }}>
            <div className="category-badge" style={{ background: 'var(--green-dim)', color: 'var(--green)', borderColor: 'var(--green)' }}>
              Test Completed Successfully
            </div>
            <h3 style={{ fontSize: '1.5rem', marginTop: '10px' }}>{recentTest.company} - {recentTest.testId}</h3>
            
            <div style={{ display: 'flex', gap: '20px', marginTop: '25px', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 200px', background: 'var(--bg3)', padding: '20px', borderRadius: '12px', textAlign: 'center', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '1px' }}>Final Score</div>
                <div style={{ fontSize: '36px', fontWeight: '800', color: 'var(--accent)', marginTop: '10px' }}>
                  {recentTest.score} <span style={{fontSize: '18px', color: 'var(--text-muted)'}}>/ {recentTest.totalQuestions}</span>
                </div>
              </div>
              
              <div style={{ flex: '1 1 200px', background: 'var(--bg3)', padding: '20px', borderRadius: '12px', textAlign: 'center', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '1px' }}>Time Taken</div>
                <div style={{ fontSize: '36px', fontWeight: '800', color: 'var(--text)', marginTop: '10px' }}>
                  {formatTime(recentTest.timeTaken)}
                </div>
              </div>
              
              <div style={{ flex: '1 1 200px', background: 'var(--bg3)', padding: '20px', borderRadius: '12px', textAlign: 'center', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '1px' }}>Accuracy</div>
                <div style={{ fontSize: '36px', fontWeight: '800', color: 'var(--green)', marginTop: '10px' }}>
                  {Math.round((recentTest.score / recentTest.totalQuestions) * 100)}%
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            UI 2: HISTORICAL DATA
            ========================================== */}
        <h3 style={{ marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>Past Assessments</h3>
        
        {loading ? (
          <div className="loader">Syncing historical data...</div>
        ) : history.length > 0 ? (
          <div className="questions-list">
            {/* Map through historical data, showing the newest first */}
            {history.slice().reverse().map((test, idx) => (
              <div key={idx} className="question-item" style={{ padding: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ margin: 0, color: 'var(--text)', fontSize: '1.2rem' }}>
                    <span className="test-icon" style={{fontSize: '1.2rem', display: 'inline', marginRight: '8px'}}>📝</span> 
                    {test.company} - {test.testId}
                  </h4>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px', fontFamily: 'var(--font-mono)' }}>
                    Taken on: {new Date(test.date).toLocaleDateString()} at {new Date(test.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </div>
                </div>
                
                <div style={{ textAlign: 'right', display: 'flex', gap: '30px', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>Time</div>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text)' }}>{formatTime(test.timeTaken)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>Score</div>
                    <div style={{ fontSize: '24px', fontWeight: '900', color: 'var(--accent)' }}>{test.score}/{test.totalQuestions}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '60px 20px', textAlign: 'center', background: 'var(--bg2)', borderRadius: '12px', border: '1px dashed var(--border)' }}>
            <span style={{ fontSize: '40px', display: 'block', marginBottom: '15px' }}>📊</span>
            <h3 style={{ color: 'var(--text)', marginBottom: '10px' }}>No Data Available Yet</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>Your analytics will populate here once you complete your first mock assessment.</p>
            <button className="submit-test-btn" onClick={() => navigate('/tests')}>
              Go to Mock Tests
            </button>
          </div>
        )}

      </div>
    </div>
  );
}