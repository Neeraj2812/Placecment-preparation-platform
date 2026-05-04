import { useState } from "react";
import { useNavigate } from "react-router-dom";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const navigate  = useNavigate();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [emailErr, setEmailErr] = useState("");
  const [loading,  setLoading]  = useState(false);

  const handleEmailChange = (e) => {
    const val = e.target.value;
    setEmail(val);
    if (val && !EMAIL_REGEX.test(val)) {
      setEmailErr("Please enter a valid email address (e.g. user@example.com)");
    } else {
      setEmailErr("");
    }
  };

  const handleLogin = async () => {
    if (!email || !password) { setError("Please enter email and password."); return; }
    if (!EMAIL_REGEX.test(email)) { setError("Please enter a valid email address."); return; }
    setLoading(true);
    setError("");
    try {
      const res  = await fetch("http://localhost:5000/login", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (res.ok && data.token) {
        localStorage.setItem("token",    data.token);
        localStorage.setItem("user",     data.username);
        localStorage.setItem("email",    data.email || email);
        window.location.href = "/";
      } else {
        setError(data.message || "Login failed. Check your credentials.");
      }
    } catch {
      setError("Cannot connect to server. Make sure the backend is running on port 5000.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2 style={{ fontFamily: "var(--font-mono)", color: "var(--accent)" }}>LOGIN</h2>
        <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "20px" }}>
          Access your preparation platform
        </p>

        {error && (
          <div style={{ background: "rgba(248,81,73,0.12)", border: "1px solid var(--red)",
            color: "var(--red)", borderRadius: 8, padding: "10px 14px",
            fontSize: 13, marginBottom: 12, textAlign: "left" }}>
            {error}
          </div>
        )}

        <div style={{ width: "100%", marginBottom: emailErr ? 4 : 0 }}>
          <input
            value={email}
            placeholder="Email (e.g. user@example.com)"
            type="email"
            autoComplete="email"
            onChange={handleEmailChange}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            style={{
              width: "100%",
              borderColor: emailErr ? "var(--red)" : undefined,
              outline: emailErr ? "1px solid var(--red)" : undefined,
            }}
          />
          {emailErr && (
            <p style={{ color: "var(--red)", fontSize: 11, marginTop: 4, marginBottom: 0, textAlign: "left" }}>
              ⚠ {emailErr}
            </p>
          )}
        </div>

        <input
          value={password}
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
        />
        <button onClick={handleLogin} disabled={loading || !!emailErr}>
          {loading ? "Logging in…" : "Log In"}
        </button>

        <p className="auth-switch" style={{ marginTop: 16, fontSize: 13, color: "var(--text-muted)" }}>
          New here?{" "}
          <span
            onClick={() => navigate("/signup")}
            style={{ color: "var(--accent)", cursor: "pointer", fontWeight: 700 }}
          >
            Create account
          </span>
        </p>
      </div>
    </div>
  );
}
