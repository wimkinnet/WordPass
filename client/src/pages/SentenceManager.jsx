import { useEffect, useState } from "react";
import { getSentences, addSentence, updateSentence, deleteSentence } from "../api.js";

export default function SentenceManager({ onChanged }) {
  const [sentences, setSentences] = useState([]);
  const [french, setFrench] = useState("");
  const [dutch, setDutch] = useState("");
  const [notes, setNotes] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);

  function refresh() {
    getSentences().then(setSentences).catch((e) => setError(e.message));
  }

  useEffect(refresh, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    try {
      if (editingId) {
        await updateSentence(editingId, { french, dutch, notes });
        setEditingId(null);
      } else {
        await addSentence({ french, dutch, notes });
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

  function startEdit(s) {
    setEditingId(s._id);
    setFrench(s.french);
    setDutch(s.dutch);
    setNotes(s.notes || "");
  }

  function cancelEdit() {
    setEditingId(null);
    setFrench("");
    setDutch("");
    setNotes("");
  }

  async function handleDelete(id) {
    if (!confirm("Remove this sentence?")) return;
    await deleteSentence(id);
    refresh();
    onChanged?.();
  }

  return (
    <div className="page-card">
      <h2>My sentences</h2>
      <p style={{ color: "var(--ink-soft)", fontSize: "0.85rem", marginTop: -6 }}>
        Sentences of 2+ words unlock fill-in-the-blank practice as well as full translation.
      </p>
      <form className="word-form" onSubmit={handleSubmit} style={{ marginTop: 12 }}>
        <input placeholder="French sentence" value={french} onChange={(e) => setFrench(e.target.value)} required />
        <input placeholder="Dutch sentence" value={dutch} onChange={(e) => setDutch(e.target.value)} required />
        <input placeholder="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} />
        <button className="btn gold" type="submit">
          {editingId ? "Save" : "Add sentence"}
        </button>
        {editingId && (
          <button type="button" className="btn ghost" onClick={cancelEdit}>
            Cancel
          </button>
        )}
      </form>

      {error && <p style={{ color: "var(--stamp-red)" }}>{error}</p>}

      {sentences.length === 0 ? (
        <div className="empty-state">
          No sentences yet — add your first French/Dutch sentence pair above.
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
            {sentences.map((s) => (
              <tr key={s._id}>
                <td>{s.french}</td>
                <td>{s.dutch}</td>
                <td>
                  <span className="level-dots">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <span key={i} className={i < s.level ? "filled" : ""} />
                    ))}
                  </span>
                </td>
                <td>
                  <button className="btn ghost" onClick={() => startEdit(s)}>Edit</button>{" "}
                  <button className="btn ghost" onClick={() => handleDelete(s._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
