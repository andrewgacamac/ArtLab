import { useState, useEffect, useCallback } from 'react';
import { fluxAPI } from '../services/api';
import { FluxTask, FluxEditRequest } from '../types';

interface UseFluxTasksReturn {
  tasks: FluxTask[];
  loading: boolean;
  error: string | null;
  submitEdit: (request: FluxEditRequest) => Promise<FluxTask>;
  refreshTasks: () => Promise<void>;
}

export const useFluxTasks = (imageId?: string): UseFluxTasksReturn => {
  const [tasks, setTasks] = useState<FluxTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await fluxAPI.getTasks(imageId);
      setTasks(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch tasks';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [imageId]);

  const submitEdit = async (request: FluxEditRequest): Promise<FluxTask> => {
    setError(null);
    
    try {
      const task = await fluxAPI.edit(request);
      setTasks(prev => [task, ...prev]);
      return task;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Edit request failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Poll for task updates
  useEffect(() => {
    if (tasks.length === 0) return;

    const processingTasks = tasks.filter(task => task.status === 'processing');
    if (processingTasks.length === 0) return;

    const pollInterval = setInterval(async () => {
      try {
        const updatedTasks = await Promise.all(
          processingTasks.map(task => fluxAPI.getTaskStatus(task.id))
        );

        setTasks(prev => {
          const newTasks = [...prev];
          
          updatedTasks.forEach(updatedTask => {
            const index = newTasks.findIndex(t => t.id === updatedTask.id);
            if (index !== -1) {
              newTasks[index] = updatedTask;
            }
          });
          
          return newTasks;
        });

      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(pollInterval);
  }, [tasks]);

  useEffect(() => {
    refreshTasks();
  }, [refreshTasks]);

  return {
    tasks,
    loading,
    error,
    submitEdit,
    refreshTasks,
  };
};