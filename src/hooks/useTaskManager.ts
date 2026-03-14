import { useState, useCallback } from 'react';
import { StudyTask } from '@/types/study';
import { fetchTasks, createTask, editTask, removeTask, toggleTaskCompletion } from '@/services/taskService';
import { toast } from 'sonner';

export function useTaskManager(userId: string | undefined) {
  const [tasks, setTasks] = useState<StudyTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<StudyTask | null>(null);

  const loadTasks = useCallback(async () => {
    try {
      const data = await fetchTasks();
      setTasks(data);
    } catch {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAddTask = useCallback(async (task: StudyTask) => {
    if (!userId) return;
    try {
      if (editingTask) {
        const updated = await editTask(task);
        setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
      } else {
        const created = await createTask(task, userId);
        setTasks(prev => [...prev, created]);
      }
      setShowForm(false);
      setEditingTask(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to save task');
    }
  }, [userId, editingTask]);

  const handleToggle = useCallback(async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    try {
      await toggleTaskCompletion(id, !task.completed);
      setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    } catch {
      toast.error('Failed to update task');
    }
  }, [tasks]);

  const handleDelete = useCallback(async (id: string) => {
    try {
      await removeTask(id);
      setTasks(prev => prev.filter(t => t.id !== id));
    } catch {
      toast.error('Failed to delete task');
    }
  }, []);

  const handleEdit = useCallback((task: StudyTask) => {
    setEditingTask(task);
    setShowForm(true);
  }, []);

  const openNewTaskForm = useCallback(() => {
    setEditingTask(null);
    setShowForm(true);
  }, []);

  const closeForm = useCallback(() => {
    setShowForm(false);
    setEditingTask(null);
  }, []);

  return {
    tasks,
    loading,
    showForm,
    editingTask,
    loadTasks,
    handleAddTask,
    handleToggle,
    handleDelete,
    handleEdit,
    openNewTaskForm,
    closeForm,
  };
}
