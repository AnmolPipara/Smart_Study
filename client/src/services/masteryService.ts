import { supabase } from '@/integrations/supabase/client';
import {
  Subject, Topic, TopicMastery, RevisionSchedule, StudySession,
  PerformanceRating, calculateNextRevision, calculateMasteryUpdate
} from '@/types/mastery';

// ---- SUBJECTS ----
export async function fetchSubjects(): Promise<Subject[]> {
  const { data, error } = await supabase.from('subjects').select('*').order('name');
  if (error) throw error;
  return (data || []).map(r => ({
    id: r.id, userId: r.user_id, name: r.name,
    createdAt: r.created_at, updatedAt: r.updated_at,
  }));
}
export async function upsertSubject(name: string, userId: string): Promise<Subject> {
  const { data, error } = await supabase.from('subjects')
    .upsert({ user_id: userId, name }, { onConflict: 'user_id,name' })
    .select().single();
  if (error) throw error;
  return { id: data.id, userId: data.user_id, name: data.name, createdAt: data.created_at, updatedAt: data.updated_at };
}
export async function deleteSubject(id: string): Promise<void> {
  const { error } = await supabase.from('subjects').delete().eq('id', id);
  if (error) throw error;
}
// ---- TOPICS ----
export async function fetchTopics(): Promise<Topic[]> {
  const { data, error } = await supabase.from('topics').select('*').order('name');
  if (error) throw error;
  return (data || []).map(r => ({
    id: r.id, userId: r.user_id, subjectId: r.subject_id, name: r.name,
    createdAt: r.created_at, updatedAt: r.updated_at,
  }));
}
export async function upsertTopic(name: string, subjectId: string, userId: string): Promise<Topic> {
  const { data, error } = await supabase.from('topics')
    .upsert({ user_id: userId, subject_id: subjectId, name }, { onConflict: 'user_id,subject_id,name' })
    .select().single();
  if (error) throw error;
  return { id: data.id, userId: data.user_id, subjectId: data.subject_id, name: data.name, createdAt: data.created_at, updatedAt: data.updated_at };
}
export async function deleteTopic(id: string): Promise<void> {
  const { error } = await supabase.from('topics').delete().eq('id', id);
  if (error) throw error;
}
// ---- MASTERY ----
export async function fetchMastery(): Promise<TopicMastery[]> {
  const { data, error } = await supabase.from('topic_mastery').select('*');
  if (error) throw error;
  return (data || []).map(r => ({
    id: r.id, userId: r.user_id, topicId: r.topic_id, score: r.score,
    totalReviews: r.total_reviews, correctAnswers: r.correct_answers,
    incorrectAnswers: r.incorrect_answers, lastStudiedAt: r.last_studied_at,
    createdAt: r.created_at, updatedAt: r.updated_at,
  }));
}
export async function upsertMastery(
  topicId: string, userId: string,
  updates: Partial<Pick<TopicMastery, 'score' | 'totalReviews' | 'correctAnswers' | 'incorrectAnswers' | 'lastStudiedAt'>>
): Promise<TopicMastery> {
  const row: Record<string, unknown> = { user_id: userId, topic_id: topicId };
  if (updates.score !== undefined) row.score = updates.score;
  if (updates.totalReviews !== undefined) row.total_reviews = updates.totalReviews;
  if (updates.correctAnswers !== undefined) row.correct_answers = updates.correctAnswers;
  if (updates.incorrectAnswers !== undefined) row.incorrect_answers = updates.incorrectAnswers;
  if (updates.lastStudiedAt !== undefined) row.last_studied_at = updates.lastStudiedAt;
  const { data, error } = await supabase.from('topic_mastery')
    .upsert(row, { onConflict: 'user_id,topic_id' }).select().single();
  if (error) throw error;
  return { id: data.id, userId: data.user_id, topicId: data.topic_id, score: data.score,
    totalReviews: data.total_reviews, correctAnswers: data.correct_answers,
    incorrectAnswers: data.incorrect_answers, lastStudiedAt: data.last_studied_at,
    createdAt: data.created_at, updatedAt: data.updated_at };
}
export async function recordMasteryFromRating(
  topicId: string, userId: string, rating: PerformanceRating, isCorrect: boolean, actualScore?: number
): Promise<TopicMastery> {
  const existing = (await supabase.from('topic_mastery').select('*')
    .eq('topic_id', topicId).eq('user_id', userId).maybeSingle()).data;
  const currentScore = existing?.score ?? 0;
  const newScore = calculateMasteryUpdate(currentScore, rating, actualScore);
  return upsertMastery(topicId, userId, {
    score: newScore, totalReviews: (existing?.total_reviews ?? 0) + 1,
    correctAnswers: (existing?.correct_answers ?? 0) + (isCorrect ? 1 : 0),
    incorrectAnswers: (existing?.incorrect_answers ?? 0) + (isCorrect ? 0 : 1),
    lastStudiedAt: new Date().toISOString(),
  });
}
// ---- REVISION SCHEDULE ----
export async function fetchRevisionSchedule(): Promise<RevisionSchedule[]> {
  const { data, error } = await supabase.from('revision_schedule').select('*');
  if (error) throw error;
  return (data || []).map(r => ({
    id: r.id, userId: r.user_id, topicId: r.topic_id,
    nextRevisionDate: r.next_revision_date, lastRevisionDate: r.last_revision_date,
    revisionCount: r.revision_count, intervalDays: r.interval_days,
    easeFactor: r.ease_factor, createdAt: r.created_at, updatedAt: r.updated_at,
  }));
}
export async function upsertRevision(
  topicId: string, userId: string,
  updates: Partial<Pick<RevisionSchedule, 'nextRevisionDate' | 'lastRevisionDate' | 'revisionCount' | 'intervalDays' | 'easeFactor'>>
): Promise<RevisionSchedule> {
  const row: Record<string, unknown> = { user_id: userId, topic_id: topicId };
  if (updates.nextRevisionDate !== undefined) row.next_revision_date = updates.nextRevisionDate;
  if (updates.lastRevisionDate !== undefined) row.last_revision_date = updates.lastRevisionDate;
  if (updates.revisionCount !== undefined) row.revision_count = updates.revisionCount;
  if (updates.intervalDays !== undefined) row.interval_days = updates.intervalDays;
  if (updates.easeFactor !== undefined) row.ease_factor = updates.easeFactor;
  const { data, error } = await supabase.from('revision_schedule')
    .upsert(row, { onConflict: 'user_id,topic_id' }).select().single();
  if (error) throw error;
  return { id: data.id, userId: data.user_id, topicId: data.topic_id,
    nextRevisionDate: data.next_revision_date, lastRevisionDate: data.last_revision_date,
    revisionCount: data.revision_count, intervalDays: data.interval_days,
    easeFactor: data.ease_factor, createdAt: data.created_at, updatedAt: data.updated_at };
}
export async function processRevisionFeedback(
  topicId: string, userId: string, rating: PerformanceRating
): Promise<{ mastery: TopicMastery; revision: RevisionSchedule }> {
  const existing = (await supabase.from('revision_schedule').select('*')
    .eq('topic_id', topicId).eq('user_id', userId).maybeSingle()).data;
  const currentInterval = existing?.interval_days ?? 1;
  const currentEase = existing?.ease_factor ?? 2.5;
  const { intervalDays, easeFactor } = calculateNextRevision(currentInterval, currentEase, rating);
  const today = new Date().toISOString().split('T')[0];
  const nextDate = new Date(); nextDate.setDate(nextDate.getDate() + intervalDays);
  const revision = await upsertRevision(topicId, userId, {
    nextRevisionDate: nextDate.toISOString().split('T')[0], lastRevisionDate: today,
    revisionCount: (existing?.revision_count ?? 0) + 1, intervalDays, easeFactor,
  });
  const isCorrect = rating !== 'again';
  const mastery = await recordMasteryFromRating(topicId, userId, rating, isCorrect);
  return { mastery, revision };
}
// ---- STUDY SESSIONS ----
export async function createStudySession(session: Omit<StudySession, 'id' | 'createdAt'>): Promise<StudySession> {
  const { data, error } = await supabase.from('study_sessions').insert({
    user_id: session.userId, topic_id: session.topicId, subject: session.subject,
    topic_name: session.topicName, session_type: session.sessionType,
    duration_minutes: session.durationMinutes, performance_rating: session.performanceRating,
    score: session.score, completed: session.completed,
  }).select().single();
  if (error) throw error;
  return { id: data.id, userId: data.user_id, topicId: data.topic_id,
    subject: data.subject, topicName: data.topic_name,
    sessionType: data.session_type as StudySession['sessionType'],
    durationMinutes: data.duration_minutes,
    performanceRating: data.performance_rating as PerformanceRating | null,
    score: data.score, completed: data.completed, createdAt: data.created_at };
}
export async function fetchStudySessions(limit = 20): Promise<StudySession[]> {
  const { data, error } = await supabase.from('study_sessions').select('*')
    .order('created_at', { ascending: false }).limit(limit);
  if (error) throw error;
  return (data || []).map(r => ({
    id: r.id, userId: r.user_id, topicId: r.topic_id,
    subject: r.subject, topicName: r.topic_name,
    sessionType: r.session_type as StudySession['sessionType'],
    durationMinutes: r.duration_minutes,
    performanceRating: r.performance_rating as PerformanceRating | null,
    score: r.score, completed: r.completed, createdAt: r.created_at }));
}