import { useEffect, useState } from "react";
import { useAuth } from "./context/AuthContext.jsx";
import { setToken, setUnauthorizedHandler } from "./api.js";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import NavBar from "./components/NavBar.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import WordManager from "./pages/WordManager.jsx";
import SentenceManager from "./pages/SentenceManager.jsx";
import Quiz from "./pages/Quiz.jsx";
import AdminPanel from "./pages/AdminPanel.jsx";

export default function App() {
  const { auth, logout } = useAuth();
  const [authView, setAuthView] = useState("login"); // "login" | "register"
  const [view, setView] = useState("dashboard");
  const [refreshKey, setRefreshKey] = useState(0);
  const bump = () => setRefreshKey((k) => k + 1);

  // keep the API client's token in sync with the session, and log out
  // automatically if the server ever rejects the token (expired/invalid)
  useEffect(() => {
    setToken(auth?.token || null);
  }, [auth]);

  useEffect(() => {
    setUnauthorizedHandler(() => logout());
  }, [logout]);

  if (!auth) {
    return authView === "login" ? (
      <Login onSwitchToRegister={() => setAuthView("register")} />
    ) : (
      <Register onSwitchToLogin={() => setAuthView("login")} />
    );
  }

  return (
    <div className="app-shell">
      <div className="app-header">
        <h1>Woordenpaspoort</h1>
        <span className="tagline">your French ⇄ Dutch travel journal</span>
      </div>
      <NavBar view={view} setView={setView} user={auth.user} onLogout={logout} />

      {view === "dashboard" && (
        <Dashboard refreshKey={refreshKey} onStartQuiz={() => setView("quiz")} />
      )}
      {view === "words" && <WordManager onChanged={bump} />}
      {view === "sentences" && <SentenceManager onChanged={bump} />}
      {view === "quiz" && <Quiz onProgressChanged={bump} />}
      {view === "admin" && auth.user.role === "admin" && (
        <AdminPanel currentUserId={auth.user.id} />
      )}
    </div>
  );
}
