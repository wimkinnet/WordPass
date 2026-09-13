export default function NavBar({ view, setView, user, onLogout }) {
  const tabs = [
    { id: "dashboard", label: "My Passport" },
    { id: "words", label: "Words" },
    { id: "sentences", label: "Sentences" },
    { id: "quiz", label: "Practice" },
    ...(user.role === "admin" ? [{ id: "admin", label: "Admin" }] : []),
  ];

  return (
    <div>
      <div className="user-chip" style={{ justifyContent: "flex-end", marginBottom: 10 }}>
        <span>
          {user.username} <span className="role-tag">{user.role}</span>
        </span>
        <button className="link-btn" onClick={onLogout}>
          Log out
        </button>
      </div>
      <div className="nav-tabs">
        {tabs.map((t) => (
          <button
            key={t.id}
            className={view === t.id ? "active" : ""}
            onClick={() => setView(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
