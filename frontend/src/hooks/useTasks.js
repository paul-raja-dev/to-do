import { useState, useEffect, useCallback, useMemo } from 'react';

// ─── MOCK DATABASE ────────────────────────────────────────────────────────────
// Simulates GET /api/auth/me → hardcoded owner_id: 1 for local prototyping
const MOCK_USER = {
  id: 1,
  username: 'test',
  email: 'test@taskflow.local',
};

let mockTasks = [
  {
    id: 1,
    title: 'Design Database Schema',
    description: 'Create models for tasks, users, and categories with appropriate relationships.',
    status: 'completed',
    priority: 'high',
    due_date: null,
    owner_id: 1,
    created_at: '2026-07-11T10:00:00.000Z',
    updated_at: '2026-07-11T10:30:00.000Z',
  },
  {
    id: 2,
    title: 'Implement FastAPI Routes',
    description: 'Write the CRUD endpoints for task management and status transition validations.',
    status: 'in_progress',
    priority: 'medium',
    due_date: null,
    owner_id: 1,
    created_at: '2026-07-11T11:00:00.000Z',
    updated_at: '2026-07-11T11:45:00.000Z',
  },
  {
    id: 3,
    title: 'Develop Frontend Components',
    description: 'Build clean, reusable dashboard components with Tailwind CSS integration.',
    status: 'pending',
    priority: 'high',
    due_date: null,
    owner_id: 1,
    created_at: '2026-07-11T12:00:00.000Z',
    updated_at: '2026-07-11T12:00:00.000Z',
  },
  {
    id: 4,
    title: 'Write Integration Tests',
    description: 'Ensure that front-to-back authentication and data flow function end-to-end.',
    status: 'pending',
    priority: 'low',
    due_date: null,
    owner_id: 1,
    created_at: '2026-07-11T13:00:00.000Z',
    updated_at: '2026-07-11T13:00:00.000Z',
  },
];

// ─── METRICS HELPER ───────────────────────────────────────────────────────────
// Simulates GET /api/metrics/summary — derived locally from in-memory array
function computeMetrics(taskArray) {
  return taskArray.reduce(
    (acc, task) => {
      acc.total += 1;
      if (task.status === 'pending')     acc.pending    += 1;
      if (task.status === 'in_progress') acc.inProgress += 1;
      if (task.status === 'completed')   acc.completed  += 1;
      return acc;
    },
    { total: 0, pending: 0, inProgress: 0, completed: 0 }
  );
}

// ─── HOOK ─────────────────────────────────────────────────────────────────────
export default function useTasks() {
  const [tasks,        setTasks]        = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState(null);
  const [user]                          = useState(MOCK_USER);

  // ── GET /api/tasks ─────────────────────────────────────────────────────────
  const fetchTasks = useCallback(async (filterStatus = null) => {
    setLoading(true);
    setError(null);
    try {
      await new Promise(r => setTimeout(r, 150));
      if (filterStatus) setStatusFilter(filterStatus);
      setTasks([...mockTasks]);
    } catch (err) {
      setError(err.message || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  // ── POST /api/tasks ────────────────────────────────────────────────────────
  const createTask = useCallback(async (taskData) => {
    setLoading(true);
    setError(null);
    try {
      await new Promise(r => setTimeout(r, 150));
      if (!taskData.title?.trim()) throw new Error('Task title is required');

      const newTask = {
        id:          mockTasks.length > 0 ? Math.max(...mockTasks.map(t => t.id)) + 1 : 1,
        title:       taskData.title.trim(),
        description: taskData.description || '',
        status:      taskData.status   || 'pending',
        priority:    taskData.priority || 'medium',
        due_date:    taskData.due_date || null,
        owner_id:    MOCK_USER.id,
        created_at:  new Date().toISOString(),
        updated_at:  new Date().toISOString(),
      };

      mockTasks.push(newTask);
      setTasks([...mockTasks]); // triggers metrics recompute via useMemo
      return newTask;
    } catch (err) {
      setError(err.message || 'Failed to create task');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ── PUT /api/tasks/{task_id} ───────────────────────────────────────────────
  const updateTask = useCallback(async (taskId, updatedFields) => {
    setLoading(true);
    setError(null);
    try {
      await new Promise(r => setTimeout(r, 150));
      const idx = mockTasks.findIndex(t => t.id === taskId);
      if (idx === -1) throw new Error(`Task #${taskId} not found`);

      mockTasks[idx] = { ...mockTasks[idx], ...updatedFields, updated_at: new Date().toISOString() };
      setTasks([...mockTasks]);
      return mockTasks[idx];
    } catch (err) {
      setError(err.message || 'Failed to update task');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ── PATCH /api/tasks/{task_id}/status ──────────────────────────────────────
  const toggleTaskStatus = useCallback(async (taskId) => {
    setLoading(true);
    setError(null);
    try {
      await new Promise(r => setTimeout(r, 100));
      const idx = mockTasks.findIndex(t => t.id === taskId);
      if (idx === -1) throw new Error(`Task #${taskId} not found`);

      const cycle = { pending: 'in_progress', in_progress: 'completed', completed: 'pending' };
      mockTasks[idx] = {
        ...mockTasks[idx],
        status:     cycle[mockTasks[idx].status],
        updated_at: new Date().toISOString(),
      };
      setTasks([...mockTasks]);
      return mockTasks[idx];
    } catch (err) {
      setError(err.message || 'Failed to toggle status');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ── DELETE /api/tasks/{task_id} ────────────────────────────────────────────
  const deleteTask = useCallback(async (taskId) => {
    setLoading(true);
    setError(null);
    try {
      await new Promise(r => setTimeout(r, 150));
      const idx = mockTasks.findIndex(t => t.id === taskId);
      if (idx === -1) throw new Error(`Task #${taskId} not found`);

      mockTasks = mockTasks.filter(t => t.id !== taskId);
      setTasks([...mockTasks]);
    } catch (err) {
      setError(err.message || 'Failed to delete task');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ── BOOTSTRAP ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => fetchTasks(), 0);
    return () => clearTimeout(t);
  }, [fetchTasks]);

  // ── DERIVED STATE ──────────────────────────────────────────────────────────
  // Simulates GET /api/tasks?status=<filter>
  const filteredTasks = useMemo(() =>
    tasks.filter(t => statusFilter === 'all' || t.status === statusFilter),
    [tasks, statusFilter]
  );

  // Simulates GET /api/metrics/summary — always fresh, never stale
  const metrics = useMemo(() => computeMetrics(tasks), [tasks]);

  return {
    tasks,
    filteredTasks,
    statusFilter,
    setStatusFilter,
    metrics,
    loading,
    error,
    user,
    fetchTasks,
    createTask,
    updateTask,
    toggleTaskStatus,
    deleteTask,
  };
}
