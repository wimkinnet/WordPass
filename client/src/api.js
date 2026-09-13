const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

let currentToken = null;
let onUnauthorized = null;

export function setToken(token) {
  currentToken = token;
}
export function setUnauthorizedHandler(fn) {
  onUnauthorized = fn;
}

async function request(path, options = {}) {
  const headers = { "Content-Type": "application/json" };
  if (currentToken) headers.Authorization = `Bearer ${currentToken}`;

  const res = await fetch(`${API_URL}${path}`, { headers, ...options });

  if (res.status === 401) {
    onUnauthorized?.();
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

// --- auth ---
export const register = (username, password) =>
  request("/auth/register", { method: "POST", body: JSON.stringify({ username, password }) });
export const login = (username, password) =>
  request("/auth/login", { method: "POST", body: JSON.stringify({ username, password }) });
export const fetchMe = () => request("/auth/me");

// --- words ---
export const getWords = () => request("/words");
export const addWord = (word) => request("/words", { method: "POST", body: JSON.stringify(word) });
export const updateWord = (id, word) =>
  request(`/words/${id}`, { method: "PUT", body: JSON.stringify(word) });
export const deleteWord = (id) => request(`/words/${id}`, { method: "DELETE" });

// --- sentences ---
export const getSentences = () => request("/sentences");
export const addSentence = (s) => request("/sentences", { method: "POST", body: JSON.stringify(s) });
export const updateSentence = (id, s) =>
  request(`/sentences/${id}`, { method: "PUT", body: JSON.stringify(s) });
export const deleteSentence = (id) => request(`/sentences/${id}`, { method: "DELETE" });

// --- quiz ---
export const getNextQuizBatch = (count = 10) => request(`/quiz/next?count=${count}`);
export const submitAnswer = (payload) =>
  request("/quiz/answer", { method: "POST", body: JSON.stringify(payload) });

// --- progress ---
export const getProgress = () => request("/progress");

// --- admin ---
export const adminGetUsers = () => request("/admin/users");
export const adminCreateUser = (u) => request("/admin/users", { method: "POST", body: JSON.stringify(u) });
export const adminUpdateUser = (id, u) =>
  request(`/admin/users/${id}`, { method: "PATCH", body: JSON.stringify(u) });
export const adminDeleteUser = (id) => request(`/admin/users/${id}`, { method: "DELETE" });
export const adminGetUserWords = (id) => request(`/admin/users/${id}/words`);
export const adminGetUserSentences = (id) => request(`/admin/users/${id}/sentences`);
export const adminUpdateWord = (id, w) =>
  request(`/admin/words/${id}`, { method: "PUT", body: JSON.stringify(w) });
export const adminDeleteWord = (id) => request(`/admin/words/${id}`, { method: "DELETE" });
export const adminUpdateSentence = (id, s) =>
  request(`/admin/sentences/${id}`, { method: "PUT", body: JSON.stringify(s) });
export const adminDeleteSentence = (id) => request(`/admin/sentences/${id}`, { method: "DELETE" });
