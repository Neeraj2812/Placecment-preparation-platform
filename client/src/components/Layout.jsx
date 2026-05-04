import { Link, Outlet, useLocation } from "react-router-dom";
import gehuLogo from "../assets/logo.png";

export default function Layout() {
  const location = useLocation();
  const user     = localStorage.getItem("user") || "User";

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const isActive = (path) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  return (
    <div className="app-container">
      <header className="modern-header">

        {/* Left: Brand icon + title */}
        <div className="header-left">
          <Link to="/" className="brand-logo" style={{ textDecoration: "none" }}>
            <div className="brand-icon">
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/>
              </svg>
            </div>
            <div className="brand-name">
              <div className="brand-title">ACE YOUR PLACEMENTS</div>
              <div className="brand-subtitle">Placement Preparation Platform</div>
            </div>
          </Link>
        </div>

        {/* Right: University logo + info */}
        <div className="univ-logo">
          <div className="univ-info">
            <div className="univ-name">Graphic Era Hill<br/>University</div>
            <div className="univ-tagline">Transforming Dreams Into Reality</div>
          </div>
          <img src={gehuLogo} alt="University Logo" className="gehu-logo" />
        </div>
      </header>

      {/* Sub-nav tabs */}
      <nav className="sub-nav">
        <Link to="/"          className={`nav-item ${isActive("/")          ? "active" : ""}`}>Home</Link>
        <Link to="/coding"    className={`nav-item ${isActive("/coding")    ? "active" : ""}`}>Practice</Link>
        <Link to="/tests"     className={`nav-item ${isActive("/tests")     ? "active" : ""}`}>Tests</Link>
        <Link to="/analytics" className={`nav-item ${isActive("/analytics") ? "active" : ""}`}>Analytics</Link>

        {/* User pill moved into sub-nav right side */}
        <div className="sub-nav-user">
          <div className="user-profile-pill">
            <div className="user-avatar">{user[0].toUpperCase()}</div>
            <span className="user-name">{user}</span>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>
        </div>
      </nav>

      <main style={{ marginTop: "112px" }}>
        <Outlet />
      </main>
    </div>
  );
}
