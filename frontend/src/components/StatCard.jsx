export default function StatCard({ title, value, icon: Icon, color = "blue", description }) {
  return (
    <div className="stat-card">
      <div className="stat-card-top">
        <span>{title}</span>

        <div className={`stat-icon ${color}`}>
          <Icon size={24} />
        </div>
      </div>

      <h2>{value}</h2>

      <p>{description}</p>
    </div>
  );
}
