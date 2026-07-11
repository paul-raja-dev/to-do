import TaskCard from './TaskCard';

// Loops over task data and renders TaskCard rows with empty-state fallback
// Data sourced exclusively from useTasks (no local Axios calls)
export default function TaskList({ tasks = [], onToggle, onDelete, onUpdate }) {
  if (tasks.length === 0) {
    return (
      <div className="border border-dashed border-neutral-300 py-16 text-center">
        <span className="text-[10px] font-black font-mono uppercase tracking-[0.25em] text-neutral-300">
          — no records —
        </span>
      </div>
    );
  }

  return (
    <div>
      {tasks.map(task => (
        <TaskCard
          key={task.id}
          task={task}
          onToggle={onToggle}
          onDelete={onDelete}
          onUpdate={onUpdate}
        />
      ))}
    </div>
  );
}
