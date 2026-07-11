import { useState } from 'react';

// Single task card — exposes status-toggle (PATCH) and delete (DELETE) triggers
// All actions flow through useTasks; no direct Axios calls here
const STATUS_LABEL  = { pending: 'Pending', in_progress: 'In Progress', completed: 'Done' };
const STATUS_CYCLE  = { pending: '◐', in_progress: '◕', completed: '●' };
const PRIORITY_MARK = { low: '↓', medium: '→', high: '↑' };

export default function TaskCard({ task, onToggle, onDelete }) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try { await onDelete(task.id); }
    catch { setDeleting(false); }
  };

  const isDone = task.status === 'completed';

  return (
    <div
      className={`group border-b border-neutral-200 last:border-b-0 flex items-start gap-5 py-5 px-1 transition-opacity duration-200
        ${isDone ? 'opacity-35' : 'opacity-100'}`}
    >
      {/* Status toggle — PATCH /api/tasks/{id}/status */}
      <button
        onClick={() => onToggle(task.id)}
        title={`Cycle status (currently: ${task.status})`}
        className="mt-0.5 text-lg leading-none font-black select-none cursor-pointer hover:scale-110 transition-transform shrink-0"
        aria-label="Cycle task status"
      >
        {STATUS_CYCLE[task.status]}
      </button>

      {/* Body */}
      <div className="flex-grow min-w-0">
        {/* Title + badges row */}
        <div className="flex items-baseline gap-3 flex-wrap">
          <h3
            className={`text-sm font-black uppercase tracking-tight leading-snug
              ${isDone ? 'line-through text-neutral-400' : 'text-black'}`}
          >
            {task.title}
          </h3>

          {/* Priority mark */}
          <span
            className="text-[9px] font-black font-mono border border-black px-1.5 py-0.5 leading-none"
            title={`Priority: ${task.priority}`}
          >
            {PRIORITY_MARK[task.priority]} {task.priority.toUpperCase()}
          </span>

          {/* Status label */}
          <span
            className={`text-[9px] font-black font-mono px-1.5 py-0.5 leading-none
              ${isDone ? 'bg-black text-white' : 'border border-neutral-300 text-neutral-500'}`}
          >
            {STATUS_LABEL[task.status]}
          </span>
        </div>

        {/* Description */}
        {task.description && (
          <p className={`text-xs mt-2 leading-relaxed ${isDone ? 'text-neutral-300' : 'text-neutral-500'}`}>
            {task.description}
          </p>
        )}

        {/* Meta */}
        <div className="flex items-center gap-4 mt-3">
          <span className="text-[9px] font-mono text-neutral-300 uppercase tracking-widest">
            #{task.id} · owner:{task.owner_id} · {new Date(task.created_at).toLocaleDateString('en-GB')}
          </span>
        </div>
      </div>

      {/* Delete — DELETE /api/tasks/{id} */}
      <button
        onClick={handleDelete}
        disabled={deleting}
        title="Delete task"
        className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 text-[9px] font-black font-mono uppercase tracking-widest border border-black px-2.5 py-1.5 hover:bg-black hover:text-white disabled:opacity-30 cursor-pointer mt-0.5"
      >
        {deleting ? '...' : '[ del ]'}
      </button>
    </div>
  );
}
