export default function StatCard({ icon: Icon, label, value, delta }) {
  return (
    <article className="stat-card">
      <div className="stat-icon">{Icon && <Icon size={20} />}</div>
      <p>{label}</p>
      <strong>{value}</strong>
      {delta && <span>{delta}</span>}
    </article>
  );
}
