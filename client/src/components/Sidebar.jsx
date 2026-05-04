import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h3 className="brand-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          PREP<span className="text-accent">AI</span>
        </h3>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-group">
          <div className="nav-label">Main Menu</div>
          <NavLink to="/dashboard" className="nav-link">🏠 Dashboard</NavLink>
          <NavLink to="/section/tests" className="nav-link">📝 Mock Assessments</NavLink>
        </div>

        <div className="nav-group">
          <div className="nav-label">Practice Zone</div>
          <NavLink to="/section/aptitude" className="nav-link">🧠 Aptitude</NavLink>
          <NavLink to="/section/coding" className="nav-link">💻 Coding</NavLink>
          <NavLink to="/section/technical" className="nav-link">⚙️ Technical</NavLink>
        </div>

        <div className="nav-group">
          <div className="nav-label">Personal</div>
          <NavLink to="/analytics" className="nav-link">📊 My Analytics</NavLink>
        </div>
      </nav>

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout}>🚪 Logout</button>
      </div>
    </aside>
  );
}