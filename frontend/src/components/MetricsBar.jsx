// Renders live metric counts — data sourced from useTasks metrics object
// Maps to GET /api/metrics/summary response shape: { total, pending, inProgress, completed }
export default function MetricsBar({ metrics = { total: 0, pending: 0, inProgress: 0, completed: 0 } }) {
  const stats = [
    { label: 'Total',       value: metrics.total,       accent: false },
    { label: 'Pending',     value: metrics.pending,     accent: false },
    { label: 'In Progress', value: metrics.inProgress,  accent: false },
    { label: 'Completed',   value: metrics.completed,   accent: true  },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-px border border-black bg-black">
      {stats.map(({ label, value, accent }) => (
        <div
          key={label}
          className={`flex flex-col justify-between p-5 ${accent ? 'bg-black text-white' : 'bg-white text-black'}`}
        >
          <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-50">
            {label}
          </span>
          <span className="text-4xl font-black tabular-nums mt-3 leading-none">
            {String(value).padStart(2, '0')}
          </span>
        </div>
      ))}
    </div>
  );
}
