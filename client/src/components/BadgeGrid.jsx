export default function BadgeGrid({ badges }) {
  if (!badges?.length) return null;
  return (
    <div className="badge-grid">
      {badges.map((b) => (
        <div key={b.id} className={`badge-stamp ${b.earned ? "" : "locked"}`} title={b.desc}>
          {b.name}
        </div>
      ))}
    </div>
  );
}
