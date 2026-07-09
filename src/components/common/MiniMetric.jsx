export function MiniMetric({ label, value, tone }) {
  return <div className={`mini-metric ${tone}`}><span>{label}</span><strong>{value}</strong></div>;
}
