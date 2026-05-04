import { Link } from "react-router-dom";

export default function Navbar() {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <div className="navbar">
      <h2 className="logo">Placement Prep</h2>

      <div className="nav-links">
        <Link to="/aptitude">Aptitude</Link>
        <Link to="/coding">Coding</Link>
        <Link to="/interview">Interview</Link>
        <Link to="/roadmap">Roadmap</Link>

        {/* 🔥 CONDITIONAL RENDERING */}
        {!token ? (
          <>
            <Link to="/login" className="auth-link">Login</Link>
            <Link to="/signup" className="auth-link signup-btn">Signup</Link>
          </>
        ) : (
          <>
            <span style={{ color: "#00adb5", fontWeight: "bold" }}>
              Hi, {user}
            </span>
            <button
              onClick={handleLogout}
              style={{
                background: "#ff4d4d",
                border: "none",
                padding: "5px 10px",
                borderRadius: "5px",
                color: "white",
                cursor: "pointer"
              }}
            >
              Logout
            </button>
          </>
        )}
      </div>
    </div>
  );
}