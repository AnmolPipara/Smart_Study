import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { SubjectWithMastery, RevisionDueItem } from '@/types/mastery';
import { fetchSubjects, upsertSubject, deleteSubject, fetchTopics, upsertTopic, deleteTopic, fetchMastery, upsertMastery, fetchRevisionSchedule, processRevisionFeedback } from '@/services/masteryService';
import { toast } from 'sonner';

export function useMastery() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const uid = user?.id;

  const { data: subjects = [], isLoading: l1 } = useQuery({ queryKey: ['subjects', uid], queryFn: fetchSubjects, enabled: !!uid });
  const { data: topics = [], isLoading: l2 } = useQuery({ queryKey: ['topics', uid], queryFn: fetchTopics, enabled: !!uid });
  const { data: masteryList = [], isLoading: l3 } = useQuery({ queryKey: ['mastery', uid], queryFn: fetchMastery, enabled: !!uid });
  const { data: revisions = [], isLoading: l4 } = useQuery({ queryKey: ['revisions', uid], queryFn: fetchRevisionSchedule, enabled: !!uid });

  const inv = useCallback(() => {
    qc.invalidateQueries({ queryKey: ['subjects', uid] });
    qc.invalidateQueries({ queryKey: ['topics', uid] });
    qc.invalidateQueries({ queryKey: ['mastery', uid] });
    qc.invalidateQueries({ queryKey: ['revisions', uid] });
  }, [qc, uid]);

  const addSubj = useMutation({ mutationFn: (name: string) => upsertSubject(name, uid!), onSuccess: () => { inv(); toast.success('Subject added'); }, onError: (e: any) => toast.error(e.message) });
  const addTop = useMutation({ mutationFn: (p: {name:string;subjectId:string}) => upsertTopic(p.name, p.subjectId, uid!), onSuccess: () => { inv(); toast.success('Topic added'); }, onError: (e: any) => toast.error(e.message) });
  const delSubj = useMutation({ mutationFn: deleteSubject, onSuccess: () => { inv(); toast.success('Subject deleted'); } });
  const delTop = useMutation({ mutationFn: deleteTopic, onSuccess: () => { inv(); toast.success('Topic deleted'); } });
  const updMast = useMutation({ mutationFn: (p:{topicId:string;updates:any}) => upsertMastery(p.topicId, uid!, p.updates), onSuccess: () => inv() });
  const revFb = useMutation({ mutationFn: (p:{topicId:string;rating:any}) => processRevisionFeedback(p.topicId, uid!, p.rating), onSuccess: () => { inv(); toast.success('Revision recorded!'); }, onError: (e:any) => toast.error(e.message) });

  const subjectsWithMastery: SubjectWithMastery[] = subjects.map(s => {
    const st = topics.filter(t => t.subjectId === s.id);
    const twm = st.map(t => ({ topic: t, mastery: masteryList.find(m => m.topicId === t.id) ?? null, revision: revisions.find(r => r.topicId === t.id) ?? null, subjectName: s.name }));
    const scores = twm.filter(t => t.mastery).map(t => t.mastery!.score);
    return { subject: s, topics: twm, overallScore: scores.length > 0 ? Math.round(scores.reduce((a,b) => a+b, 0) / scores.length) : 0 };
  });

  const today = new Date().toISOString().split('T')[0];
  const revisionsDue: RevisionDueItem[] = revisions.filter(r => r.nextRevisionDate <= today).map(rev => {
    const topic = topics.find(t => t.id === rev.topicId);
    if (!topic) return null;
    const subject = subjects.find(s => s.id === topic.subjectId) ?? subjects[0];
    if (!subject) return null;
    const mastery = masteryList.find(m => m.topicId === rev.topicId) ?? null;
    const daysOverdue = Math.max(0, Math.floor((new Date(today).getTime() - new Date(rev.nextRevisionDate).getTime()) / 86400000));
    return { topic, subject, mastery, revision: rev, daysOverdue };
  }).filter(Boolean) as RevisionDueItem[];

  return {
    subjects, topics, masteryList, revisions, subjectsWithMastery, revisionsDue, loading: l1||l2||l3||l4,
    addSubject: addSubj.mutate, addTopic: addTop.mutate, removeSubject: delSubj.mutate, removeTopic: delTop.mutate,
    updateMastery: updMast.mutate, processRevision: revFb.mutate, isProcessingRevision: revFb.isPending, refreshAll: inv,
  };
}
