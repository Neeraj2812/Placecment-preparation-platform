import { useState } from "react";
import { useNavigate } from "react-router-dom";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Signup() {
  const navigate  = useNavigate();
  const [username, setUsername] = useState("");
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

  const handleSignup = async () => {
    if (!username || !email || !password) { setError("All fields are required."); return; }
    if (!EMAIL_REGEX.test(email)) { setError("Please enter a valid email address."); return; }
    setLoading(true);
    setError("");
    try {
      const res  = await fetch("http://localhost:5000/signup", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ username, email, password }),
      });
      const data = await res.json();

      if (res.ok) {
        navigate("/login", { replace: true });
      } else {
        setError(data.message || "Signup failed.");
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
        <h2 style={{ fontFamily: "var(--font-mono)", color: "var(--accent)" }}>SIGN UP</h2>
        <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "20px" }}>
          Create your free account
        </p>

        {error && (
          <div style={{ background: "rgba(248,81,73,0.12)", border: "1px solid var(--red)",
            color: "var(--red)", borderRadius: 8, padding: "10px 14px",
            fontSize: 13, marginBottom: 12, textAlign: "left" }}>
            {error}
          </div>
        )}

        <input
          value={username}
          placeholder="Username"
          onChange={(e) => setUsername(e.target.value)}
        />

        <div style={{ width: "100%", marginBottom: emailErr ? 4 : 0 }}>
          <input
            value={email}
            placeholder="Email (e.g. user@example.com)"
            type="email"
            autoComplete="email"
            onChange={handleEmailChange}
            onKeyDown={(e) => e.key === "Enter" && handleSignup()}
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
          placeholder="Password"
          type="password"
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSignup()}
        />

        <button onClick={handleSignup} disabled={loading || !!emailErr}>
          {loading ? "Creating account…" : "Create Account"}
        </button>

        <p style={{ marginTop: 16, fontSize: 13, color: "var(--text-muted)" }}>
          Already registered?{" "}
          <span
            onClick={() => navigate("/login")}
            style={{ color: "var(--accent)", cursor: "pointer", fontWeight: 700 }}
          >
            Log in
          </span>
        </p>
      </div>
    </div>
  );
}
