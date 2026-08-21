import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { StudyTask } from '@/types/study';
import { fetchTasks, createTask, editTask, removeTask, toggleTaskCompletion } from '@/services/taskService';
import { toast } from 'sonner';

export function useTaskManager(userId: string | undefined) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<StudyTask | null>(null);

  const { data: tasks = [], isLoading: loading, refetch: loadTasks } = useQuery({
    queryKey: ['tasks', userId],
    queryFn: fetchTasks,
    enabled: !!userId,
  });

  const addTaskMutation = useMutation({
    mutationFn: (task: StudyTask) => editingTask ? editTask(task) : createTask(task, userId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', userId] });
      setShowForm(false);
      setEditingTask(null);
      toast.success(editingTask ? 'Task updated' : 'Task created');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to save task');
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) => toggleTaskCompletion(id, completed),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', userId] });
    },
    onError: () => {
      toast.error('Failed to update task');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => removeTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', userId] });
      toast.success('Task deleted');
    },
    onError: () => {
      toast.error('Failed to delete task');
    },
  });

  const handleAddTask = useCallback(async (task: StudyTask) => {
    if (!userId) return;
    addTaskMutation.mutate(task);
  }, [userId, addTaskMutation]);

  const handleToggle = useCallback(async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    toggleMutation.mutate({ id, completed: !task.completed });
  }, [tasks, toggleMutation]);

  const handleDelete = useCallback(async (id: string) => {
    deleteMutation.mutate(id);
  }, [deleteMutation]);

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
