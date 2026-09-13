import { useEffect, useState } from "react";
import { getWords, addWord, updateWord, deleteWord } from "../api.js";

export default function WordManager({ onChanged }) {
  const [words, setWords] = useState([]);
  const [french, setFrench] = useState("");
  const [dutch, setDutch] = useState("");
  const [notes, setNotes] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);

  function refresh() {
    getWords().then(setWords).catch((e) => setError(e.message));
  }

  useEffect(refresh, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    try {
      if (editingId) {
        await updateWord(editingId, { french, dutch, notes });
        setEditingId(null);
      } else {
        await addWord({ french, dutch, notes });
      }
      setFrench("");
      setDutch("");
      setNotes("");
      refresh();
      onChanged?.();
    } catch (e) {
      setError(e.message);
    }
  }

  function startEdit(word) {
    setEditingId(word._id);
    setFrench(word.french);
    setDutch(word.dutch);
    setNotes(word.notes || "");
  }

  function cancelEdit() {
    setEditingId(null);
    setFrench("");
    setDutch("");
    setNotes("");
  }

  async function handleDelete(id) {
    if (!confirm("Remove this word?")) return;
    await deleteWord(id);
    refresh();
    onChanged?.();
  }

  return (
    <div className="page-card">
      <h2>My words</h2>
      <form className="word-form" onSubmit={handleSubmit}>
        <input placeholder="French" value={french} onChange={(e) => setFrench(e.target.value)} required />
        <input placeholder="Dutch" value={dutch} onChange={(e) => setDutch(e.target.value)} required />
        <input placeholder="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} />
        <button className="btn gold" type="submit">
          {editingId ? "Save" : "Add word"}
        </button>
        {editingId && (
          <button type="button" className="btn ghost" onClick={cancelEdit}>
            Cancel
          </button>
        )}
      </form>

      {error && <p style={{ color: "var(--stamp-red)" }}>{error}</p>}

      {words.length === 0 ? (
        <div className="empty-state">
          No words yet — add your first French/Dutch pair above.
        </div>
      ) : (
        <table className="word-table">
          <thead>
            <tr>
              <th>French</th>
              <th>Dutch</th>
              <th>Progress</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {words.map((w) => (
              <tr key={w._id}>
                <td>{w.french}</td>
                <td>{w.dutch}</td>
                <td>
                  <span className="level-dots">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <span key={i} className={i < w.level ? "filled" : ""} />
                    ))}
                  </span>
                </td>
                <td>
                  <button className="btn ghost" onClick={() => startEdit(w)}>Edit</button>{" "}
                  <button className="btn ghost" onClick={() => handleDelete(w._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
