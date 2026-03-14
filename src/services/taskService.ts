import { supabase } from '@/integrations/supabase/client';
import { StudyTask } from '@/types/study';

interface DbTask {
  id: string;
  user_id: string;
  title: string;
  subject: string;
  priority: string;
  estimated_minutes: number;
  deadline: string;
  scheduled_date: string;
  scheduled_hour: number;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

function toStudyTask(row: DbTask): StudyTask {
  return {
    id: row.id,
    title: row.title,
    subject: row.subject,
    priority: row.priority as StudyTask['priority'],
    estimatedMinutes: row.estimated_minutes,
    deadline: row.deadline,
    scheduledDate: row.scheduled_date,
    scheduledHour: row.scheduled_hour,
    completed: row.completed,
    createdAt: row.created_at,
  };
}

export async function fetchTasks(): Promise<StudyTask[]> {
  const { data, error } = await supabase
    .from('study_tasks')
    .select('*')
    .order('scheduled_date', { ascending: true })
    .order('scheduled_hour', { ascending: true });
  if (error) throw error;
  return (data as DbTask[]).map(toStudyTask);
}

export async function createTask(task: Omit<StudyTask, 'id' | 'createdAt'>, userId: string): Promise<StudyTask> {
  const { data, error } = await supabase
    .from('study_tasks')
    .insert({
      user_id: userId,
      title: task.title,
      subject: task.subject,
      priority: task.priority,
      estimated_minutes: task.estimatedMinutes,
      deadline: task.deadline,
      scheduled_date: task.scheduledDate,
      scheduled_hour: task.scheduledHour,
      completed: task.completed,
    })
    .select()
    .single();
  if (error) throw error;
  return toStudyTask(data as DbTask);
}

export async function editTask(task: StudyTask): Promise<StudyTask> {
  const { data, error } = await supabase
    .from('study_tasks')
    .update({
      title: task.title,
      subject: task.subject,
      priority: task.priority,
      estimated_minutes: task.estimatedMinutes,
      deadline: task.deadline,
      scheduled_date: task.scheduledDate,
      scheduled_hour: task.scheduledHour,
      completed: task.completed,
    })
    .eq('id', task.id)
    .select()
    .single();
  if (error) throw error;
  return toStudyTask(data as DbTask);
}

export async function removeTask(id: string): Promise<void> {
  const { error } = await supabase.from('study_tasks').delete().eq('id', id);
  if (error) throw error;
}

export async function toggleTaskCompletion(id: string, completed: boolean): Promise<void> {
  const { error } = await supabase.from('study_tasks').update({ completed }).eq('id', id);
  if (error) throw error;
}
