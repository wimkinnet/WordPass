import { createContext, useContext, useState, useCallback } from "react";

const STORAGE_KEY = "wp_auth";
const AuthContext = createContext(null);

function loadStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(loadStored); // { token, user: { id, username, role } } | null

  const setSession = useCallback((session) => {
    setAuth(session);
    if (session) localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    else localStorage.removeItem(STORAGE_KEY);
  }, []);

  const logout = useCallback(() => setSession(null), [setSession]);

  return (
    <AuthContext.Provider value={{ auth, setSession, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside an AuthProvider");
  return ctx;
}
