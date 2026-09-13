import { Fragment, useEffect, useState } from "react";
import {
  adminGetUsers, adminCreateUser, adminUpdateUser, adminDeleteUser,
  adminGetUserWords, adminGetUserSentences,
  adminUpdateWord, adminDeleteWord, adminUpdateSentence, adminDeleteSentence,
} from "../api.js";

function ModerationTable({ items, kind, onSaved, onDeleted }) {
  const [editingId, setEditingId] = useState(null);
  const [french, setFrench] = useState("");
  const [dutch, setDutch] = useState("");

  const updateFn = kind === "word" ? adminUpdateWord : adminUpdateSentence;
  const deleteFn = kind === "word" ? adminDeleteWord : adminDeleteSentence;

  function startEdit(item) {
    setEditingId(item._id);
    setFrench(item.french);
    setDutch(item.dutch);
  }

  async function save(id) {
    await updateFn(id, { french, dutch });
    setEditingId(null);
    onSaved();
  }

  async function remove(id) {
    if (!confirm(`Delete this ${kind}?`)) return;
    await deleteFn(id);
    onDeleted();
  }

  if (items.length === 0) {
    return <p style={{ color: "var(--ink-soft)", fontSize: "0.85rem" }}>No {kind}s yet.</p>;
  }

  return (
    <table className="word-table">
      <thead>
        <tr><th>French</th><th>Dutch</th><th>Level</th><th></th></tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item._id}>
            {editingId === item._id ? (
              <>
                <td><input value={french} onChange={(e) => setFrench(e.target.value)} /></td>
                <td><input value={dutch} onChange={(e) => setDutch(e.target.value)} /></td>
                <td>{item.level}</td>
                <td>
                  <button className="btn ghost" onClick={() => save(item._id)}>Save</button>{" "}
                  <button className="btn ghost" onClick={() => setEditingId(null)}>Cancel</button>
                </td>
              </>
            ) : (
              <>
                <td>{item.french}</td>
                <td>{item.dutch}</td>
                <td>{item.level}</td>
                <td>
                  <button className="btn ghost" onClick={() => startEdit(item)}>Edit</button>{" "}
                  <button className="btn ghost" onClick={() => remove(item._id)}>Delete</button>
                </td>
              </>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function UserDetail({ userId, onUserContentChanged }) {
  const [words, setWords] = useState([]);
  const [sentences, setSentences] = useState([]);
  const [tab, setTab] = useState("words");

  function refresh() {
    adminGetUserWords(userId).then(setWords);
    adminGetUserSentences(userId).then(setSentences);
  }

  useEffect(refresh, [userId]);

  function handleChange() {
    refresh();
    onUserContentChanged?.();
  }

  return (
    <div className="admin-detail">
      <div className="nav-tabs" style={{ marginBottom: 12 }}>
        <button className={tab === "words" ? "active" : ""} onClick={() => setTab("words")}>
          Words ({words.length})
        </button>
        <button className={tab === "sentences" ? "active" : ""} onClick={() => setTab("sentences")}>
          Sentences ({sentences.length})
        </button>
      </div>
      {tab === "words" ? (
        <ModerationTable items={words} kind="word" onSaved={handleChange} onDeleted={handleChange} />
      ) : (
        <ModerationTable items={sentences} kind="sentence" onSaved={handleChange} onDeleted={handleChange} />
      )}
    </div>
  );
}

export default function AdminPanel({ currentUserId }) {
  const [users, setUsers] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [error, setError] = useState(null);

  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("user");

  function refresh() {
    adminGetUsers().then(setUsers).catch((e) => setError(e.message));
  }

  useEffect(refresh, []);

  async function handleCreate(e) {
    e.preventDefault();
    setError(null);
    try {
      await adminCreateUser({ username: newUsername, password: newPassword, role: newRole });
      setNewUsername("");
      setNewPassword("");
      setNewRole("user");
      refresh();
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleRoleToggle(user) {
    const role = user.role === "admin" ? "user" : "admin";
    await adminUpdateUser(user.id, { role });
    refresh();
  }

  async function handleResetPassword(user) {
    const password = prompt(`New password for ${user.username} (min. 4 characters):`);
    if (!password) return;
    try {
      await adminUpdateUser(user.id, { password });
      alert("Password updated.");
    } catch (e) {
      alert(e.message);
    }
  }

  async function handleDelete(user) {
    if (!confirm(`Delete ${user.username} and all their words/sentences/progress? This cannot be undone.`)) return;
    try {
      await adminDeleteUser(user.id);
      if (expandedId === user.id) setExpandedId(null);
      refresh();
    } catch (e) {
      alert(e.message);
    }
  }

  return (
    <div className="page-card">
      <h2>Admin</h2>

      <h3 style={{ fontSize: "1rem" }}>Create a user</h3>
      <form className="word-form" onSubmit={handleCreate}>
        <input
          placeholder="Username"
          value={newUsername}
          onChange={(e) => setNewUsername(e.target.value)}
          required
        />
        <input
          placeholder="Password"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <select value={newRole} onChange={(e) => setNewRole(e.target.value)}>
          <option value="user">user</option>
          <option value="admin">admin</option>
        </select>
        <button className="btn gold" type="submit">Create</button>
      </form>

      {error && <p style={{ color: "var(--stamp-red)" }}>{error}</p>}

      <h3 style={{ fontSize: "1rem", marginTop: 20 }}>Users</h3>
      <table className="word-table">
        <thead>
          <tr>
            <th>Username</th><th>Role</th><th>Points</th><th>Streak</th>
            <th>Words</th><th>Sentences</th><th></th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <Fragment key={u.id}>
              <tr
                className="admin-user-row"
                onClick={() => setExpandedId(expandedId === u.id ? null : u.id)}
              >
                <td>{u.username}</td>
                <td><span className={`role-pill ${u.role}`}>{u.role}</span></td>
                <td>{u.points}</td>
                <td>{u.streak}🔥</td>
                <td>{u.wordCount}</td>
                <td>{u.sentenceCount}</td>
                <td onClick={(e) => e.stopPropagation()}>
                  <button className="btn ghost" onClick={() => handleRoleToggle(u)}>
                    Make {u.role === "admin" ? "user" : "admin"}
                  </button>{" "}
                  <button className="btn ghost" onClick={() => handleResetPassword(u)}>
                    Reset pw
                  </button>{" "}
                  {u.id !== currentUserId && (
                    <button className="btn ghost" onClick={() => handleDelete(u)}>Delete</button>
                  )}
                </td>
              </tr>
              {expandedId === u.id && (
                <tr>
                  <td colSpan={7}>
                    <UserDetail userId={u.id} onUserContentChanged={refresh} />
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
