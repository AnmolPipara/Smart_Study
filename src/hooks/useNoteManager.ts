import { useState, useCallback, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { StudyNote } from '@/types/study';
import { fetchNotes, upsertNote, deleteNote } from '@/services/noteService';
import { NoteSubjectNode } from '@/components/Notes/NotesSidebar';
import { toast } from 'sonner';

export function useNoteManager(userId: string | undefined) {
  const queryClient = useQueryClient();
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

  const { data: notes = [], isLoading, refetch: loadNotes } = useQuery({
    queryKey: ['notes', userId],
    queryFn: fetchNotes,
    enabled: !!userId,
  });

  // Automatically select the first note if none is selected
  useEffect(() => {
    if (notes.length > 0 && !selectedNoteId) {
      setSelectedNoteId(notes[0].id);
    }
  }, [notes, selectedNoteId]);

  const upsertMutation = useMutation({
    mutationFn: (note: StudyNote) => upsertNote(note, userId!),
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: ['notes', userId] });
      setSelectedNoteId(saved.id);
    },
    onError: () => {
      toast.error('Failed to save note');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteNote(id),
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ['notes', userId] });
      if (selectedNoteId === deletedId) {
        setSelectedNoteId(null);
      }
      toast.success('Note deleted');
    },
    onError: () => {
      toast.error('Failed to delete note');
    },
  });

  const handleNoteChange = useCallback(async (note: StudyNote) => {
    if (!userId) return;
    upsertMutation.mutate(note);
  }, [userId, upsertMutation]);

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
    deleteMutation.mutate(id);
  }, [deleteMutation]);

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
