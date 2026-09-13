import { useState } from "react";
import { register, setToken } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Register({ onSwitchToLogin }) {
  const { setSession } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await register(username, password);
      setToken(result.token);
      setSession(result);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h1>Woordenpaspoort</h1>
        <div className="tagline">create your travel journal</div>
        <form onSubmit={handleSubmit}>
          <input
            placeholder="Choose a username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoFocus
            required
          />
          <input
            placeholder="Choose a password (min. 4 characters)"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button className="btn gold" type="submit" disabled={loading}>
            {loading ? "Setting up..." : "Create account"}
          </button>
          {error && <div className="auth-error">{error}</div>}
        </form>
        <div className="auth-switch">
          Already have an account?{" "}
          <button className="link-btn" onClick={onSwitchToLogin}>
            Log in
          </button>
        </div>
      </div>
    </div>
  );
}
