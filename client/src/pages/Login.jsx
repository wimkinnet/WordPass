import { useState } from "react";
import { login, setToken } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login({ onSwitchToRegister }) {
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
      const result = await login(username, password);
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
        <div className="tagline">your French ⇄ Dutch travel journal</div>
        <form onSubmit={handleSubmit}>
          <input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoFocus
            required
          />
          <input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button className="btn gold" type="submit" disabled={loading}>
            {loading ? "Checking passport..." : "Log in"}
          </button>
          {error && <div className="auth-error">{error}</div>}
        </form>
        <div className="auth-switch">
          New here?{" "}
          <button className="link-btn" onClick={onSwitchToRegister}>
            Create an account
          </button>
        </div>
      </div>
    </div>
  );
}
