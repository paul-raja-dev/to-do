import { useState, useEffect, useCallback, useMemo } from 'react';
import API from '../api/axiosInstance';

// ─── HOOK ─────────────────────────────────────────────────────────────────────
export default function useTasks() {
  const [tasks,        setTasks]        = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState(null);

  // ── GET /api/tasks ─────────────────────────────────────────────────────────
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get('/tasks');
      setTasks(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  // ── POST /api/tasks ────────────────────────────────────────────────────────
  const createTask = useCallback(async (taskData) => {
    setError(null);
    try {
      const res = await API.post('/tasks', taskData);
      setTasks(prev => [...prev, res.data]);
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Failed to create task';
      setError(msg);
      throw new Error(msg);
    }
  }, []);

  // ── PUT /api/tasks/{task_id} ───────────────────────────────────────────────
  const updateTask = useCallback(async (taskId, updatedFields) => {
    setError(null);
    try {
      const res = await API.put(`/tasks/${taskId}`, updatedFields);
      setTasks(prev => prev.map(t => t.id === taskId ? res.data : t));
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Failed to update task';
      setError(msg);
      throw new Error(msg);
    }
  }, []);

  // ── PATCH /api/tasks/{task_id}/status ──────────────────────────────────────
  const toggleTaskStatus = useCallback(async (taskId) => {
    setError(null);
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) throw new Error(`Task #${taskId} not found`);

      const cycle = { pending: 'in_progress', in_progress: 'completed', completed: 'pending' };
      const nextStatus = cycle[task.status];

      const res = await API.patch(`/tasks/${taskId}/status`, { status: nextStatus });
      setTasks(prev => prev.map(t => t.id === taskId ? res.data : t));
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Failed to toggle status';
      setError(msg);
      throw new Error(msg);
    }
  }, [tasks]);

  // ── DELETE /api/tasks/{task_id} ────────────────────────────────────────────
  const deleteTask = useCallback(async (taskId) => {
    setError(null);
    try {
      await API.delete(`/tasks/${taskId}`);
      setTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Failed to delete task';
      setError(msg);
      throw new Error(msg);
    }
  }, []);

  // ── GET /api/metrics/summary ──────────────────────────────────────────────
  const [metrics, setMetrics] = useState({ total: 0, pending: 0, inProgress: 0, completed: 0 });

  const fetchMetrics = useCallback(async () => {
    try {
      const res = await API.get('/metrics/summary');
      setMetrics(res.data);
    } catch {
      // Fallback: compute locally if metrics endpoint fails
      setMetrics(tasks.reduce(
        (acc, t) => {
          acc.total += 1;
          if (t.status === 'pending')     acc.pending    += 1;
          if (t.status === 'in_progress') acc.inProgress += 1;
          if (t.status === 'completed')   acc.completed  += 1;
          return acc;
        },
        { total: 0, pending: 0, inProgress: 0, completed: 0 }
      ));
    }
  }, [tasks]);

  // ── BOOTSTRAP ──────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Re-fetch metrics whenever tasks change
  useEffect(() => {
    fetchMetrics();
  }, [tasks, fetchMetrics]);

  // ── DERIVED STATE ──────────────────────────────────────────────────────────
  const filteredTasks = useMemo(() =>
    tasks.filter(t => statusFilter === 'all' || t.status === statusFilter),
    [tasks, statusFilter]
  );

  return {
    tasks,
    filteredTasks,
    statusFilter,
    setStatusFilter,
    metrics,
    loading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    toggleTaskStatus,
    deleteTask,
  };
}
