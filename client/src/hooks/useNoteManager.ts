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

  const handleCreateItem = useCallback((parentId: string | null, type: 'folder' | 'note') => {
    if (!userId) return;
    let baseSubject = '';
    let actualParentId: string | null = parentId;
    if (parentId?.startsWith('subject-')) {
      // Creating inside a virtual subject folder - no real parent, just set subject
      baseSubject = parentId.replace('subject-', '');
      actualParentId = null;
    } else if (parentId) {
      // Creating inside a real note/folder - inherit its subject
      const parentNote = notes.find(n => n.id === parentId);
      baseSubject = parentNote?.subject ?? '';
    }
    // If actualParentId is null and baseSubject is empty, this is a true root item
    const draft: StudyNote = {
      id: '',
      userId,
      subject: baseSubject,
      title: type === 'folder' ? 'New Folder' : 'New Note',
      content: '',
      parentId: actualParentId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    handleNoteChange(draft);
  }, [userId, notes, handleNoteChange]);

  const handleRenameNote = useCallback(async (id: string, newName: string) => {
    if (!userId) return;
    const note = notes.find(n => n.id === id);
    if (!note) return;
    handleNoteChange({ ...note, title: newName });
  }, [userId, notes, handleNoteChange]);

  const handleDeleteNote = useCallback(async (id: string) => {
    // If deleting a subject folder (virtual id like 'subject-X'), delete all notes with that subject
    if (id.startsWith('subject-')) {
      const subjectName = id.replace('subject-', '');
      const notesToDelete = notes.filter(n => n.subject === subjectName && !n.parentId);
      // Also find all nested children of those notes
      const allIds = new Set<string>();
      const collectChildren = (parentId: string) => {
        notes.filter(n => n.parentId === parentId).forEach(child => {
          allIds.add(child.id);
          collectChildren(child.id);
        });
      };
      notesToDelete.forEach(n => { allIds.add(n.id); collectChildren(n.id); });
      // Delete each note
      for (const nid of allIds) {
        deleteMutation.mutate(nid);
      }
      if (selectedNoteId && allIds.has(selectedNoteId)) {
        setSelectedNoteId(null);
      }
      toast.success(`Deleted folder "${subjectName}" and all items inside`);
      return;
    }
    // Regular note/folder delete - also delete all children
    const allIds = new Set<string>([id]);
    const collectChildren = (parentId: string) => {
      notes.filter(n => n.parentId === parentId).forEach(child => {
        allIds.add(child.id);
        collectChildren(child.id);
      });
    };
    collectChildren(id);
    for (const nid of allIds) {
      deleteMutation.mutate(nid);
    }
    if (selectedNoteId && allIds.has(selectedNoteId)) {
      setSelectedNoteId(null);
    }
    toast.success('Deleted');
  }, [deleteMutation, notes, selectedNoteId]);

  const subjectTree: NoteSubjectNode[] = useMemo(() => {
    const byId = new Map<string, NoteSubjectNode>();
    const subjectMap = new Map<string, NoteSubjectNode>();
    const rootItems: NoteSubjectNode[] = [];

    // Create all nodes
    notes.forEach(note => {
      const hasChildren = notes.some(n => n.parentId === note.id);
      const isEmpty = !note.content || note.content.trim() === '';
      byId.set(note.id, {
        id: note.id,
        name: note.title || 'Untitled',
        children: [],
        isFolder: hasChildren || (isEmpty && note.title !== 'New Note'),
      });
    });

    // Build tree
    notes.forEach(note => {
      const node = byId.get(note.id)!;
      if (note.parentId && byId.has(note.parentId)) {
        // Has a parent note - nest under it
        byId.get(note.parentId)!.children!.push(node);
      } else if (note.subject && note.subject.trim() !== '') {
        // Root item with a subject - group under subject folder
        const subjectName = note.subject;
        if (!subjectMap.has(subjectName)) {
          subjectMap.set(subjectName, {
            id: `subject-${subjectName}`,
            name: subjectName,
            children: [],
            isSubject: true,
            isFolder: true,
          });
        }
        subjectMap.get(subjectName)!.children!.push(node);
      } else {
        // Root item with no subject - true root level
        rootItems.push(node);
      }
    });

    // Combine: root items first, then subject folders
    return [...rootItems, ...Array.from(subjectMap.values()).sort((a, b) => a.name.localeCompare(b.name))];
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
    handleCreateItem,
    handleRenameNote,
    handleDeleteNote,
  };
}
