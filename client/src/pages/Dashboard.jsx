import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  const [recentTests, setRecentTests] = useState([]);
  const [stats, setStats] = useState({
    totalTests: 0,
    averageAccuracy: 0,
    totalTimeSpent: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch the user's test history from the backend
    const fetchDashboardData = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/analytics', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        if (res.ok) {
          const data = await res.json();
          
          // Calculate overall stats
          if (data.length > 0) {
            const total = data.length;
            let totalScore = 0;
            let possibleScore = 0;
            let totalTime = 0;

            data.forEach(test => {
              totalScore += test.score;
              possibleScore += test.totalQuestions;
              totalTime += test.timeTaken;
            });

            setStats({
              totalTests: total,
              averageAccuracy: Math.round((totalScore / possibleScore) * 100) || 0,
              totalTimeSpent: totalTime
            });
          }

          // Keep only the 3 most recent tests for the dashboard view
          setRecentTests(data.slice().reverse().slice(0, 3));
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Helper function to turn seconds into "1h 15m" or "45m"
  const formatTotalTime = (seconds) => {
    if (!seconds) return "0m";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  return (
    <div className="content-area">
      <div className="page-container">
        
        {/* Welcome Header */}
        <header className="section-header-text" style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 className="text-accent">Welcome back, Student!</h2>
            <p style={{ color: 'var(--text-muted)' }}>Here is a summary of your recent preparation and progress.</p>
          </div>
          <button className="submit-test-btn" onClick={() => navigate('/tests')}>
            Take a Mock Test ⚡
          </button>
        </header>

        {loading ? (
          <div className="loader">Loading your dashboard...</div>
        ) : (
          <>
            {/* ==========================================
                UI 1: TOP LEVEL STATS CARDS
                ========================================== */}
            <div className="company-grid" style={{ marginBottom: '40px' }}>
              <div className="company-card" style={{ padding: '25px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '1px' }}>Assessments Completed</div>
                <div style={{ fontSize: '42px', fontWeight: '900', color: 'var(--text)', marginTop: '5px' }}>
                  {stats.totalTests}
                </div>
              </div>

              <div className="company-card" style={{ padding: '25px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '1px' }}>Average Accuracy</div>
                <div style={{ fontSize: '42px', fontWeight: '900', color: stats.averageAccuracy > 70 ? 'var(--green)' : 'var(--accent)', marginTop: '5px' }}>
                  {stats.averageAccuracy}%
                </div>
              </div>

              <div className="company-card" style={{ padding: '25px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '1px' }}>Total Practice Time</div>
                <div style={{ fontSize: '42px', fontWeight: '900', color: 'var(--text)', marginTop: '5px' }}>
                  {formatTotalTime(stats.totalTimeSpent)}
                </div>
              </div>
            </div>

            {/* ==========================================
                UI 2: RECENT ACTIVITY PREVIEW
                ========================================== */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid var(--border)', paddingBottom: '15px', marginBottom: '20px' }}>
              <h3 style={{ margin: 0 }}>Recent Activity</h3>
              {recentTests.length > 0 && (
                <button 
                  onClick={() => navigate('/analytics')} 
                  style={{ background: 'transparent', color: 'var(--accent)', fontWeight: 'bold', fontSize: '14px' }}
                >
                  View Full History →
                </button>
              )}
            </div>

            {recentTests.length > 0 ? (
              <div className="questions-list">
                {recentTests.map((test, idx) => (
                  <div key={idx} className="question-item" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ margin: 0, color: 'var(--text)', fontSize: '1.1rem' }}>
                        <span className="test-icon" style={{fontSize: '1.1rem', display: 'inline', marginRight: '8px'}}>📝</span> 
                        {test.company} - {test.testId}
                      </h4>
                      <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '5px', fontFamily: 'var(--font-mono)' }}>
                        {new Date(test.date).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div style={{ textAlign: 'right' }}>
                      <div className="category-badge" style={{ margin: 0, background: 'var(--bg3)' }}>
                        Score: {test.score}/{test.totalQuestions}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '40px 20px', textAlign: 'center', background: 'var(--bg2)', borderRadius: '12px', border: '1px dashed var(--border)' }}>
                <p style={{ color: 'var(--text-muted)', margin: 0 }}>You haven't taken any assessments yet. Click the button above to get started!</p>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}