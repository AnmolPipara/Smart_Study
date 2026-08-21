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
    // If parentId looks like a subject folder (starts with 'subject-'), extract the subject name
    let baseSubject = 'General';
    let actualParentId: string | null = parentId;
    if (parentId?.startsWith('subject-')) {
      baseSubject = parentId.replace('subject-', '');
      actualParentId = null;
    } else if (parentId) {
      baseSubject = notes.find(n => n.id === parentId)?.subject ?? 'General';
    }
    const draft: StudyNote = {
      id: '',
      userId,
      subject: baseSubject,
      title: 'New Note',
      content: '',
      parentId: actualParentId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    handleNoteChange(draft);
  }, [userId, notes, handleNoteChange]);

  const handleDeleteNote = useCallback(async (id: string) => {
    deleteMutation.mutate(id);
  }, [deleteMutation]);

  const subjectTree: NoteSubjectNode[] = useMemo(() => {
    // Group notes by subject, then nest children
    const subjectMap = new Map<string, NoteSubjectNode>();
    const byId = new Map<string, NoteSubjectNode>();

    // First pass: create all nodes
    notes.forEach(note => {
      const node: NoteSubjectNode = { id: note.id, name: note.title || 'Untitled', children: [] };
      byId.set(note.id, node);
    });

    // Second pass: build tree - notes with parentId go under parent, others go under subject folder
    notes.forEach(note => {
      const node = byId.get(note.id)!;
      if (note.parentId && byId.has(note.parentId)) {
        // This is a child note - attach to parent
        byId.get(note.parentId)!.children!.push(node);
      } else {
        // This is a root note - attach to subject folder
        const subjectName = note.subject || 'General';
        if (!subjectMap.has(subjectName)) {
          subjectMap.set(subjectName, {
            id: `subject-${subjectName}`,
            name: subjectName,
            children: [],
            isSubject: true,
          });
        }
        subjectMap.get(subjectName)!.children!.push(node);
      }
    });

    // Sort subjects alphabetically
    return Array.from(subjectMap.values()).sort((a, b) => a.name.localeCompare(b.name));
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
