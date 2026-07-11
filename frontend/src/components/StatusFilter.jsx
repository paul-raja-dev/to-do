// Status-based view filter tabs — drives GET /api/tasks?status= query param
const FILTERS = [
  { key: 'all',         label: 'All'         },
  { key: 'pending',     label: 'Pending'     },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'completed',   label: 'Completed'   },
];

export default function StatusFilter({ currentFilter = 'all', onFilterChange }) {
  return (
    <div className="flex items-center gap-px border border-black bg-black">
      {FILTERS.map(({ key, label }) => {
        const active = currentFilter === key;
        return (
          <button
            key={key}
            onClick={() => onFilterChange(key)}
            className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-[0.15em] transition-colors cursor-pointer
              ${active ? 'bg-black text-white' : 'bg-white text-black hover:bg-neutral-800 hover:text-white'}`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
