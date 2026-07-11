import { useState, useEffect } from 'react';

export default function useTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  return {
    tasks,
    loading,
    error,
  };
}
