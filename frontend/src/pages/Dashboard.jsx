import { useState } from 'react';
import useTasks from '../hooks/useTasks';
import MetricsBar   from '../components/MetricsBar';
import StatusFilter  from '../components/StatusFilter';
import TaskList      from '../components/TaskList';
import TaskForm      from '../components/TaskForm';
import AlertBanner   from '../components/AlertBanner';

// ─── PROFILE POPUP ────────────────────────────────────────────────────────────
function ProfilePopup({ user }) {
  return (
    <div className="absolute top-full right-0 mt-3 w-64 border-2 border-black bg-white z-50 shadow-[4px_4px_0px_0px_#000]">
      {/* Header strip */}
      <div className="bg-black text-white px-4 py-3">
        <div className="text-[9px] font-black uppercase tracking-[0.25em] opacity-60 mb-1">
          Active Session
        </div>
        <div className="text-base font-black uppercase tracking-tight">
          {user.username}
        </div>
      </div>

      {/* Fields */}
      <div className="divide-y divide-neutral-100">
        <div className="px-4 py-3">
          <div className="text-[8px] font-black uppercase tracking-[0.2em] text-neutral-400 mb-0.5">
            Email
          </div>
          <div className="text-xs font-mono text-black font-bold">{user.email}</div>
        </div>
        <div className="px-4 py-3">
          <div className="text-[8px] font-black uppercase tracking-[0.2em] text-neutral-400 mb-0.5">
            User ID
          </div>
          <div className="text-xs font-mono text-black font-bold">#{user.id}</div>
        </div>
        <div className="px-4 py-3">
          <div className="text-[8px] font-black uppercase tracking-[0.2em] text-neutral-400 mb-0.5">
            Auth Mode
          </div>
          <div className="text-xs font-mono text-black font-bold">Mock / Local Prototype</div>
        </div>
      </div>

      {/* Footer caret triangle */}
      <div className="absolute -top-2 right-4 w-3 h-3 border-t-2 border-l-2 border-black bg-white rotate-45" />
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const {
    filteredTasks,
    statusFilter,
    setStatusFilter,
    metrics,
    loading,
    error,
    user,
    createTask,
    updateTask,
    toggleTaskStatus,
    deleteTask,
  } = useTasks();

  const [showForm,    setShowForm]    = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [banner,      setBanner]      = useState(null); // { message, type }

  // Wrap actions to surface success/error banners
  const handleCreate = async (data) => {
    try {
      await createTask(data);
      setBanner({ message: `Task "${data.title}" registered.`, type: 'success' });
      setShowForm(false);
    } catch (err) {
      setBanner({ message: err.message, type: 'error' });
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteTask(id);
      setBanner({ message: `Task #${id} deleted.`, type: 'success' });
    } catch (err) {
      setBanner({ message: err.message, type: 'error' });
    }
  };

  const handleUpdate = async (id, fields) => {
    try {
      await updateTask(id, fields);
      setBanner({ message: `Task #${id} updated.`, type: 'success' });
    } catch (err) {
      setBanner({ message: err.message, type: 'error' });
    }
  };

  return (
    <div className="min-h-screen bg-white text-black font-mono">
      <div className="max-w-6xl mx-auto px-8 border-x border-neutral-200 min-h-screen flex flex-col">

        {/* ── HEADER ──────────────────────────────────────────────────────── */}
        <header className="flex items-center justify-between py-8 border-b-2 border-black">
          {/* Logo / wordmark */}
          <div>
            <h1 className="text-2xl font-black uppercase tracking-[-0.03em] leading-none">
              TaskFlow
            </h1>
            <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-neutral-400 mt-1">
              System Dashboard
            </p>
          </div>

          {/* Right cluster */}
          <div className="flex items-center gap-4">
            {/* Create Task button */}
            <button
              onClick={() => setShowForm(v => !v)}
              className={`text-[10px] font-black uppercase tracking-[0.15em] px-4 py-2.5 border border-black transition-colors cursor-pointer
                ${showForm ? 'bg-black text-white' : 'bg-white text-black hover:bg-black hover:text-white'}`}
            >
              {showForm ? '[ Close ]' : '[ + Task ]'}
            </button>

            {/* Profile pill with hover popup */}
            <div
              className="relative"
              onMouseEnter={() => setShowProfile(true)}
              onMouseLeave={() => setShowProfile(false)}
            >
              <button
                className="flex items-center gap-2 border border-black px-3 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-colors cursor-pointer"
                aria-label="View profile"
              >
                <span className="w-4 h-4 bg-black text-white flex items-center justify-center text-[8px] font-black leading-none">
                  {user.username.slice(0, 1).toUpperCase()}
                </span>
                {user.username}
              </button>

              {/* Hover popup — shows user session details */}
              {showProfile && <ProfilePopup user={user} />}
            </div>
          </div>
        </header>

        {/* ── ALERT BANNER ────────────────────────────────────────────────── */}
        {(banner || error) && (
          <AlertBanner
            message={banner?.message || error}
            type={banner?.type || 'error'}
            onDismiss={() => setBanner(null)}
          />
        )}

        {/* ── TASK FORM ───────────────────────────────────────────────────── */}
        {showForm && (
          <div className="border-x border-b border-black px-8 py-7 mt-8">
            <TaskForm onCreate={handleCreate} onComplete={() => setShowForm(false)} />
          </div>
        )}

        {/* ── METRICS BAR ─────────────────────────────────────────────────── */}
        <section className="mt-10">
          <div className="text-[9px] font-black uppercase tracking-[0.25em] text-neutral-400 mb-3">
            ── Overview
          </div>
          <MetricsBar metrics={metrics} />
        </section>

        {/* ── STATUS FILTER ────────────────────────────────────────────────── */}
        <section className="mt-8">
          <div className="text-[9px] font-black uppercase tracking-[0.25em] text-neutral-400 mb-3">
            ── Filter
          </div>
          <StatusFilter currentFilter={statusFilter} onFilterChange={setStatusFilter} />
        </section>

        {/* ── TASK LIST ───────────────────────────────────────────────────── */}
        <main className="mt-10 flex-grow">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[9px] font-black uppercase tracking-[0.25em] text-neutral-400">
              ── Records
            </div>
            {loading && (
              <span className="text-[9px] font-mono text-neutral-300 uppercase tracking-widest animate-pulse">
                syncing...
              </span>
            )}
            <span className="text-[9px] font-mono text-neutral-300 uppercase tracking-widest">
              {filteredTasks.length} shown
            </span>
          </div>

          <TaskList
            tasks={filteredTasks}
            onToggle={toggleTaskStatus}
            onDelete={handleDelete}
            onUpdate={handleUpdate}
          />
        </main>

        {/* ── FOOTER ──────────────────────────────────────────────────────── */}
        <footer className="border-t border-neutral-200 py-6 mt-16 flex items-center justify-between">
          <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-neutral-300">
            TaskFlow · Local Prototype
          </span>
          <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-neutral-300">
            user:{user.username} id:{user.id}
          </span>
        </footer>

      </div>
    </div>
  );
}
