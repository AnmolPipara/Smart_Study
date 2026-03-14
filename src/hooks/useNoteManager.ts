import { useState, useCallback, useMemo } from 'react';
import { StudyNote } from '@/types/study';
import { fetchNotes, upsertNote, deleteNote } from '@/services/noteService';
import { NoteSubjectNode } from '@/components/Notes/NotesSidebar';
import { toast } from 'sonner';

export function useNoteManager(userId: string | undefined) {
  const [notes, setNotes] = useState<StudyNote[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

  const loadNotes = useCallback(async () => {
    try {
      const data = await fetchNotes();
      setNotes(data);
      if (data.length > 0 && !selectedNoteId) {
        setSelectedNoteId(data[0].id);
      }
    } catch {
      toast.error('Failed to load notes');
    }
  }, [selectedNoteId]);

  const handleNoteChange = useCallback(async (note: StudyNote) => {
    if (!userId) return;
    try {
      const saved = await upsertNote(note, userId);
      setNotes(prev =>
        prev.some(n => n.id === saved.id)
          ? prev.map(n => (n.id === saved.id ? saved : n))
          : [...prev, saved],
      );
      setSelectedNoteId(saved.id);
    } catch {
      toast.error('Failed to save note');
    }
  }, [userId]);

  const handleCreateNote = useCallback((parentId: string | null) => {
    if (!userId) return;
    const baseSubject = parentId
      ? notes.find(n => n.id === parentId)?.subject ?? 'General'
      : 'General';
    const draft: StudyNote = {
      id: '',
      userId,
      subject: baseSubject,
      title: 'New Note',
      content: '',
      parentId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    handleNoteChange(draft);
  }, [userId, notes, handleNoteChange]);

  const handleDeleteNote = useCallback(async (id: string) => {
    try {
      await deleteNote(id);
      setNotes(prev => prev.filter(n => n.id !== id));
      if (selectedNoteId === id) {
        setSelectedNoteId(null);
      }
      toast.success('Note deleted');
    } catch {
      toast.error('Failed to delete note');
    }
  }, [selectedNoteId]);

  const subjectTree: NoteSubjectNode[] = useMemo(() => {
    const byId = new Map<string, NoteSubjectNode>();
    const roots: NoteSubjectNode[] = [];
    notes.forEach(note => {
      byId.set(note.id, { id: note.id, name: note.title || note.subject, children: [] });
    });
    notes.forEach(note => {
      const node = byId.get(note.id)!;
      if (note.parentId && byId.has(note.parentId)) {
        byId.get(note.parentId)!.children!.push(node);
      } else {
        roots.push(node);
      }
    });
    return roots;
  }, [notes]);

  const selectedNote = useMemo(
    () => notes.find(n => n.id === selectedNoteId) ?? null,
    [notes, selectedNoteId],
  );

  return {
    notes,
    selectedNoteId,
    setSelectedNoteId,
    selectedNote,
    subjectTree,
    loadNotes,
    handleNoteChange,
    handleCreateNote,
    handleDeleteNote,
  };
}
