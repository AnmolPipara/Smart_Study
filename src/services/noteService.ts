import { supabase } from '@/integrations/supabase/client';
import { StudyNote } from '@/types/study';

interface DbNote {
  id: string;
  user_id: string;
  subject: string;
  title: string;
  content: string;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
}

function toStudyNote(row: DbNote): StudyNote {
  return {
    id: row.id,
    userId: row.user_id,
    subject: row.subject,
    title: row.title,
    content: row.content,
    parentId: row.parent_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function fetchNotes(): Promise<StudyNote[]> {
  const { data, error } = await supabase
    .from('study_notes')
    .select('*')
    .order('subject', { ascending: true })
    .order('title', { ascending: true });

  if (error) throw error;
  return (data as DbNote[]).map(toStudyNote);
}

export async function upsertNote(note: Omit<StudyNote, 'createdAt' | 'updatedAt' | 'userId'>, userId: string) {
  const { data, error } = await supabase
    .from('study_notes')
    .upsert({
      id: note.id || undefined,
      user_id: userId,
      subject: note.subject,
      title: note.title,
      content: note.content,
      parent_id: note.parentId,
    })
    .select()
    .single();

  if (error) throw error;
  return toStudyNote(data as DbNote);
}

