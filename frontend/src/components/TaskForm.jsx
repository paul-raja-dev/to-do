import { useState } from 'react';

// Modular form for adding or editing tasks — maps to POST /api/tasks payload
export default function TaskForm({ onCreate, onComplete, initialData = null }) {
  const [title,       setTitle]       = useState(initialData?.title       || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [priority,    setPriority]    = useState(initialData?.priority    || 'medium');
  const [submitting,  setSubmitting]  = useState(false);

  const PRIORITIES = ['low', 'medium', 'high'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      await onCreate({ title, description, priority });
      setTitle('');
      setDescription('');
      setPriority('medium');
      if (onComplete) onComplete();
    } catch {
      // error state is managed in useTasks
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="font-mono text-black">
      {/* Form heading */}
      <div className="flex items-center justify-between mb-6">
        <span className="text-[10px] font-black uppercase tracking-[0.25em] text-black">
          ── New Task Record
        </span>
        {onComplete && (
          <button
            type="button"
            onClick={onComplete}
            className="text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity cursor-pointer"
          >
            [ ESC ]
          </button>
        )}
      </div>

      {/* Title */}
      <div className="mb-4">
        <label htmlFor="tf-title" className="block text-[9px] font-black uppercase tracking-[0.2em] mb-2 opacity-50">
          Title *
        </label>
        <input
          id="tf-title"
          type="text"
          required
          placeholder="Enter task title..."
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="w-full border-b-2 border-black bg-transparent py-2 text-sm font-bold placeholder:text-neutral-300 focus:outline-none focus:border-black"
        />
      </div>

      {/* Description */}
      <div className="mb-6">
        <label htmlFor="tf-desc" className="block text-[9px] font-black uppercase tracking-[0.2em] mb-2 opacity-50">
          Description
        </label>
        <textarea
          id="tf-desc"
          rows={3}
          placeholder="Optional details..."
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="w-full border-b-2 border-black bg-transparent py-2 text-xs placeholder:text-neutral-300 focus:outline-none resize-none"
        />
      </div>

      {/* Priority */}
      <div className="mb-8">
        <span className="block text-[9px] font-black uppercase tracking-[0.2em] mb-3 opacity-50">
          Priority
        </span>
        <div className="flex gap-px bg-black border border-black">
          {PRIORITIES.map(p => (
            <button
              key={p}
              type="button"
              onClick={() => setPriority(p)}
              className={`flex-1 py-2.5 text-[9px] font-black uppercase tracking-widest transition-colors cursor-pointer
                ${priority === p ? 'bg-black text-white' : 'bg-white text-black hover:bg-neutral-100'}`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={!title.trim() || submitting}
          className="flex-1 py-3 bg-black text-white text-[10px] font-black uppercase tracking-[0.2em] border border-black hover:bg-white hover:text-black transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
        >
          {submitting ? '[ Saving... ]' : '[ Register Task ]'}
        </button>
      </div>
    </form>
  );
}
