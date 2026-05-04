import { useNavigate } from "react-router-dom";

// Import company logos from assets
import amazonLogo   from "../assets/amazon.png";
import googleLogo   from "../assets/google.png";
import microsoftLogo from "../assets/microsoft.png";
import tcsLogo      from "../assets/tcs.png";
import infosysLogo  from "../assets/infosys.png";
import wiproLogo    from "../assets/wipro.png";

const companies = [
  { id: "amazon",    name: "Amazon",    logo: amazonLogo },
  { id: "google",    name: "Google",    logo: googleLogo },
  { id: "microsoft", name: "Microsoft", logo: microsoftLogo },
  { id: "tcs",       name: "TCS",       logo: tcsLogo },
  { id: "infosys",   name: "Infosys",   logo: infosysLogo },
  { id: "wipro",     name: "Wipro",     logo: wiproLogo },
];

const categories = [
  {
    section: "Practice Tracks",
    items: [
      { id: "aptitude",  label: "Aptitude",  icon: "🧮", desc: "Quant, logical & verbal reasoning",   count: "200+ Qs" },
      { id: "coding",    label: "Coding",    icon: "💻", desc: "DSA, algorithms & problem solving",   count: "350+ Qs" },
      { id: "interview", label: "Interview", icon: "🎯", desc: "HR, behavioural & technical rounds",  count: "180+ Qs" },
    ],
  },
];

const stats = [
  { num: "730+", label: "Problems" },
  { num: "6",    label: "Companies" },
  { num: "3",    label: "Tracks" },
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home">

      {/* ── Hero ── */}
      <div className="home-hero">
        <div className="home-badge">
          🎯 730+ Questions · 6 Companies · 3 Tracks
        </div>
        <h1>
          Master DSA &amp; Ace<br />
          <em>Every Placement Round</em>
        </h1>
        <p>
          Company-wise curated questions with solutions, approaches &amp;
          complexity analysis — built for campus placements.
        </p>
        <div className="home-stats">
          {stats.map(({ num, label }) => (
            <div className="stat-item" key={label}>
              <span className="stat-num">{num}</span>
              <span className="stat-label">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Company Floating Tiles ── */}
      <div className="home-section">
        <div className="section-header">
          <span className="section-label">Companies</span>
          <span className="section-line" />
        </div>
        <div className="company-tiles-grid">
          {companies.map(({ id, name, logo }) => (
            <div
              key={id}
              className="company-tile animate-float"
              onClick={() => navigate(`/section/${id}`)}
            >
              <div className="logo-wrapper">
                <img src={logo} alt={name} className="company-logo-img" />
              </div>
              <span className="company-tile-name">{name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Practice Tracks ── */}
      {categories.map(({ section, items }) => (
        <div className="home-section" key={section}>
          <div className="section-header">
            <span className="section-label">{section}</span>
            <span className="section-line" />
          </div>
          <div className="home-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}>
            {items.map(({ id, label, icon, desc, count }) => (
              <div
                key={id}
                className="card"
                style={{ textAlign: "left", padding: "28px 24px" }}
                onClick={() => navigate(`/${id}`)}
              >
                <div style={{ fontSize: 32, marginBottom: 12 }}>{icon}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 16, fontWeight: 800, color: "var(--text)", marginBottom: 6 }}>
                  {label}
                </div>
                <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 14, lineHeight: 1.5 }}>
                  {desc}
                </div>
                <div style={{
                  display: "inline-block", fontFamily: "var(--font-mono)", fontSize: 11,
                  fontWeight: 700, color: "var(--accent)", background: "var(--accent-dim)",
                  border: "1px solid #f0b42930", borderRadius: 20, padding: "3px 12px",
                }}>
                  {count}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div style={{
        textAlign: "center", marginTop: 48, padding: "24px",
        borderTop: "1px solid var(--border-soft)", fontFamily: "var(--font-mono)",
        fontSize: 12, color: "var(--text-faint)",
      }}>
        Built to help you crack placements ·{" "}
        <span style={{ color: "var(--accent)" }}>Prepare For Placements</span>
      </div>
    </div>
  );
}
