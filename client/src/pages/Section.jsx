import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

import amazonLogo    from '../assets/amazon.png';
import googleLogo    from '../assets/google.png';
import microsoftLogo from '../assets/microsoft.png';
import tcsLogo       from '../assets/tcs.png';
import infosysLogo   from '../assets/infosys.png';
import wiproLogo     from '../assets/wipro.png';

const COMPANIES = [
  { id: 'amazon',    name: 'Amazon',    logo: amazonLogo },
  { id: 'google',    name: 'Google',    logo: googleLogo },
  { id: 'microsoft', name: 'Microsoft', logo: microsoftLogo },
  { id: 'tcs',       name: 'TCS',       logo: tcsLogo },
  { id: 'infosys',   name: 'Infosys',   logo: infosysLogo },
  { id: 'wipro',     name: 'Wipro',     logo: wiproLogo },
];

export default function Section() {
  const { company } = useParams();
  const navigate    = useNavigate();
  const location    = useLocation();

  // Derive active tab from the URL path when no company (e.g. /coding → 'coding')
  const pathSegment  = location.pathname.replace('/', '');
  const defaultTab   = ['aptitude', 'coding', 'interview'].includes(pathSegment)
    ? pathSegment
    : 'coding';

  const [activeTab, setActiveTab] = useState(defaultTab);

  const tabs = [
    { id: 'coding',    label: 'Coding',    icon: '💻' },
    { id: 'aptitude',  label: 'Aptitude',  icon: '🧮' },
    { id: 'interview', label: 'Interview', icon: '🎯' },
  ];

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
  };

  // ── When a company tile is clicked in "no-company" mode ──────────────────
  const handleCompanyPick = (companyId) => {
    navigate(`/section/${companyId}`, { state: { tab: activeTab } });
  };

  // ── When a mode card is clicked (company already known) ──────────────────
  const handleModeClick = (isPractice) => {
    navigate(
      company
        ? `/questions/${activeTab}/${company}`
        : `/questions/${activeTab}`,
      { state: { isPractice } }
    );
  };

  const displayTitle = company
    ? `${company.charAt(0).toUpperCase()}${company.slice(1)} Preparation`
    : 'Practice Zone';

  return (
    <div style={{ padding: '40px 20px', maxWidth: 1100, margin: '0 auto' }}>

      {/* Header */}
      <header style={{ marginBottom: 32 }}>
        {company && (
          <button className="back-btn" onClick={() => navigate(-1)} style={{ marginBottom: 12 }}>
            ← Back
          </button>
        )}
        <h2 className="text-accent">{displayTitle}</h2>
        <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>
          {company
            ? 'Choose a track and mode to begin.'
            : 'Select a category, then pick a company to filter questions.'}
        </p>
      </header>

      {/* Category Tabs */}
      <div className="category-tabs" style={{ marginBottom: 40 }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => handleTabClick(tab.id)}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Section content */}
      <div>
          {/* ── CASE A: No company selected → show company picker ── */}
          {!company && (
            <>
              <div style={{ marginBottom: 24 }}>
                <div className="section-header">
                  <span className="section-label">Select a Company</span>
                  <span className="section-line" />
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 20 }}>
                  Pick a company to see their specific {activeTab} questions.
                </p>

                <div className="company-tiles-grid">
                  {COMPANIES.map(({ id, name, logo }) => (
                    <div
                      key={id}
                      className="company-tile animate-float"
                      onClick={() => handleCompanyPick(id)}
                    >
                      <div className="logo-wrapper">
                        <img src={logo} alt={name} className="company-logo-img" />
                      </div>
                      <span className="company-tile-name">{name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className="section-header" style={{ margin: '32px 0 20px' }}>
                <span className="section-label">Or practice without filter</span>
                <span className="section-line" />
              </div>

              {/* Mode cards for all companies */}
              <div className="company-grid">
                <div className="company-card" style={{ cursor: 'pointer' }}
                  onClick={() => handleModeClick(false)}>
                  <div className="test-icon" style={{ fontSize: 40, marginBottom: 16 }}>📚</div>
                  <h3 style={{ marginBottom: 10, fontSize: 16 }}>All {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Questions</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.6 }}>
                    Browse the full question bank across all companies.
                  </p>
                </div>
                {activeTab !== 'interview' && (
                  <div className="company-card" style={{ cursor: 'pointer' }}
                    onClick={() => handleModeClick(true)}>
                    <div className="test-icon" style={{ fontSize: 40, marginBottom: 16 }}>🚀</div>
                    <h3 style={{ marginBottom: 10, fontSize: 16 }}>Interactive Practice</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.6 }}>
                      Jump straight into {activeTab === 'coding' ? 'the IDE' : 'quiz mode'} with all questions.
                    </p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ── CASE B: Company already selected → show mode cards ── */}
          {company && (
            <div className="company-grid">
              <div className="company-card" style={{ cursor: 'pointer' }}
                onClick={() => handleModeClick(false)}>
                <div className="test-icon">📚</div>
                <h3>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Bank</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                  Review questions and verified solutions.
                </p>
              </div>
              {activeTab !== 'interview' && (
                <div className="company-card" style={{ cursor: 'pointer' }}
                  onClick={() => handleModeClick(true)}>
                  <div className="test-icon">⚡</div>
                  <h3>Interactive Practice</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                    Solve in real-time {activeTab === 'coding' ? 'IDE' : 'Quiz'} mode.
                  </p>
                </div>
              )}
            </div>
          )}
      </div>
    </div>
  );
}
