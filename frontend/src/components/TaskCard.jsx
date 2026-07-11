import { useState } from 'react';

// Maps for labels and display
const STATUS_OPTS  = ['pending', 'in_progress', 'completed'];
const STATUS_LABEL = { pending: 'Pending', in_progress: 'In Progress', completed: 'Done' };
const PRI_OPTS     = ['low', 'medium', 'high'];
const PRI_MARK     = { low: '↓', medium: '→', high: '↑' };

// ─── INLINE EDIT FORM ─────────────────────────────────────────────────────────
function EditForm({ task, onSave, onCancel }) {
  const [title,       setTitle]       = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [priority,    setPriority]    = useState(task.priority);
  const [status,      setStatus]      = useState(task.status);
  const [saving,      setSaving]      = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    try {
      await onSave(task.id, { title: title.trim(), description, priority, status });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 pt-4 border-t border-neutral-200 space-y-4">
      {/* Title */}
      <div>
        <label className="block text-[9px] font-black uppercase tracking-[0.2em] text-neutral-400 mb-1">
          Title *
        </label>
        <input
          type="text"
          required
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="w-full border-b-2 border-black bg-transparent py-1.5 text-sm font-bold focus:outline-none"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-[9px] font-black uppercase tracking-[0.2em] text-neutral-400 mb-1">
          Description
        </label>
        <textarea
          rows={2}
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="w-full border-b border-neutral-300 bg-transparent py-1.5 text-xs focus:outline-none focus:border-black resize-none"
        />
      </div>

      {/* Status + Priority row */}
      <div className="flex gap-6 flex-wrap">
        <div>
          <div className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-400 mb-2">Status</div>
          <div className="flex gap-px bg-black border border-black">
            {STATUS_OPTS.map(s => (
              <button
                key={s}
                type="button"
                onClick={() => setStatus(s)}
                className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-widest cursor-pointer transition-colors
                  ${status === s ? 'bg-black text-white' : 'bg-white text-black hover:bg-neutral-800 hover:text-white'}`}
              >
                {STATUS_LABEL[s]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-400 mb-2">Priority</div>
          <div className="flex gap-px bg-black border border-black">
            {PRI_OPTS.map(p => (
              <button
                key={p}
                type="button"
                onClick={() => setPriority(p)}
                className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-widest cursor-pointer transition-colors
                  ${priority === p ? 'bg-black text-white' : 'bg-white text-black hover:bg-neutral-800 hover:text-white'}`}
              >
                {PRI_MARK[p]} {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          disabled={!title.trim() || saving}
          className="px-4 py-2 bg-black text-white text-[9px] font-black uppercase tracking-widest border border-black hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
        >
          {saving ? '[ Saving... ]' : '[ Save Changes ]'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-white text-black text-[9px] font-black uppercase tracking-widest border border-black hover:bg-neutral-800 hover:text-white cursor-pointer transition-colors"
        >
          [ Cancel ]
        </button>
      </div>
    </form>
  );
}

// ─── TASK CARD ────────────────────────────────────────────────────────────────
export default function TaskCard({ task, onDelete, onUpdate }) {
  const [editing,  setEditing]  = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toggling, setToggling] = useState(false);

  const isDone = task.status === 'completed';

  // Checkbox tick — binary toggle: any non-completed → completed, completed → pending
  // Uses onUpdate (PUT) not onToggle (3-way PATCH cycle) so the tick always lands correctly
  const handleTick = async () => {
    if (toggling) return;
    setToggling(true);
    try {
      const nextStatus = isDone ? 'pending' : 'completed';
      await onUpdate(task.id, { status: nextStatus });
    } finally {
      setToggling(false);
    }
  };

  // Delete — DELETE /api/tasks/{id}
  const handleDelete = async () => {
    if (deleting) return;
    setDeleting(true);
    try { await onDelete(task.id); }
    catch { setDeleting(false); }
  };

  // Save inline edit — PUT /api/tasks/{id}
  const handleSave = async (id, fields) => {
    await onUpdate(id, fields);
    setEditing(false);
  };

  return (
    <div className={`border-2 border-black mb-3 transition-opacity duration-200 ${isDone ? 'opacity-40' : 'opacity-100'}`}>
      {/* ── Card top bar: priority stripe ─────────────────────────────────── */}
      <div className={`h-0.5 w-full ${
        task.priority === 'high'   ? 'bg-black'         :
        task.priority === 'medium' ? 'bg-neutral-400'   :
                                     'bg-neutral-200'
      }`} />

      {/* ── Main card body ─────────────────────────────────────────────────── */}
      <div className="p-5">
        <div className="flex items-start gap-4">

          {/* Checkbox — PATCH /api/tasks/{id}/status */}
          <button
            onClick={handleTick}
            disabled={toggling}
            aria-label={isDone ? 'Mark as pending' : 'Mark as complete'}
            className={`mt-0.5 w-5 h-5 border-2 shrink-0 flex items-center justify-center transition-colors cursor-pointer
              ${isDone
                ? 'bg-black border-black text-white'
                : 'bg-white border-black hover:border-black hover:bg-neutral-100'
              } ${toggling ? 'opacity-50' : ''}`}
          >
            {isDone && (
              <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
                <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>

          {/* Title + badges */}
          <div className="flex-grow min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className={`text-sm font-black uppercase tracking-tight leading-snug ${
                isDone ? 'line-through text-neutral-400' : 'text-black'
              }`}>
                {task.title}
              </h3>

              {/* Priority badge */}
              <span className={`text-[9px] font-black font-mono border px-1.5 py-0.5 leading-none ${
                task.priority === 'high'   ? 'border-black bg-black text-white'       :
                task.priority === 'medium' ? 'border-neutral-400 text-neutral-600'    :
                                             'border-neutral-200 text-neutral-400'
              }`}>
                {PRI_MARK[task.priority]} {task.priority.toUpperCase()}
              </span>

              {/* Status badge */}
              <span className={`text-[9px] font-black font-mono px-1.5 py-0.5 leading-none border ${
                isDone                       ? 'bg-black text-white border-black'        :
                task.status === 'in_progress'? 'border-neutral-400 text-neutral-600'     :
                                               'border-neutral-200 text-neutral-400'
              }`}>
                {STATUS_LABEL[task.status]}
              </span>
            </div>

            {/* Description */}
            {task.description && !editing && (
              <p className={`text-xs mt-2 leading-relaxed ${isDone ? 'text-neutral-300' : 'text-neutral-500'}`}>
                {task.description}
              </p>
            )}

            {/* Meta row */}
            <div className="flex items-center gap-4 mt-3">
              <span className="text-[9px] font-mono text-neutral-300 uppercase tracking-widest">
                #{task.id} · owner:{task.owner_id} · {new Date(task.created_at).toLocaleDateString('en-GB')}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 shrink-0 mt-0.5">
            {/* Edit button — PUT /api/tasks/{id} */}
            <button
              onClick={() => setEditing(v => !v)}
              className={`text-[9px] font-black font-mono uppercase tracking-widest border px-2.5 py-1.5 cursor-pointer transition-colors
                ${editing
                  ? 'bg-black text-white border-black'
                  : 'border-black text-black hover:bg-black hover:text-white'
                }`}
            >
              {editing ? '[ ✕ ]' : '[ edit ]'}
            </button>

            {/* Delete — DELETE /api/tasks/{id} */}
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="text-[9px] font-black font-mono uppercase tracking-widest border border-black px-2.5 py-1.5 hover:bg-black hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              {deleting ? '...' : '[ del ]'}
            </button>
          </div>
        </div>

        {/* Inline edit form */}
        {editing && (
          <EditForm
            task={task}
            onSave={handleSave}
            onCancel={() => setEditing(false)}
          />
        )}
      </div>
    </div>
  );
}
