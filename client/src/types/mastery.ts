export interface Subject {
  id: string;
  userId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Topic {
  id: string;
  userId: string;
  subjectId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface TopicMastery {
  id: string;
  userId: string;
  topicId: string;
  score: number;
  totalReviews: number;
  correctAnswers: number;
  incorrectAnswers: number;
  lastStudiedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RevisionSchedule {
  id: string;
  userId: string;
  topicId: string;
  nextRevisionDate: string;
  lastRevisionDate: string | null;
  revisionCount: number;
  intervalDays: number;
  easeFactor: number;
  createdAt: string;
  updatedAt: string;
}

export type PerformanceRating = 'again' | 'hard' | 'good' | 'easy';
export type SessionType = 'study' | 'revision' | 'quiz';

export interface StudySession {
  id: string;
  userId: string;
  topicId: string | null;
  subject: string | null;
  topicName: string | null;
  sessionType: SessionType;
  durationMinutes: number;
  performanceRating: PerformanceRating | null;
  score: number | null;
  completed: boolean;
  createdAt: string;
}

export interface TopicWithMastery {
  topic: Topic;
  mastery: TopicMastery | null;
  revision: RevisionSchedule | null;
  subjectName: string;
}

export interface SubjectWithMastery {
  subject: Subject;
  topics: TopicWithMastery[];
  overallScore: number;
}

export interface RevisionDueItem {
  topic: Topic;
  subject: Subject;
  mastery: TopicMastery | null;
  revision: RevisionSchedule;
  daysOverdue: number;
}

export function getMasteryLevel(score: number): { label: string; color: string; className: string } {
  if (score >= 80) return { label: 'Strong', color: '#22C55E', className: 'text-[#22C55E]' };
  if (score >= 50) return { label: 'Moderate', color: '#EAB308', className: 'text-[#EAB308]' };
  return { label: 'Weak', color: '#EF4444', className: 'text-[#EF4444]' };
}

export function getMasteryBarColor(score: number): string {
  if (score >= 80) return 'bg-[#22C55E]';
  if (score >= 50) return 'bg-[#EAB308]';
  return 'bg-[#EF4444]';
}

export function calculateNextRevision(
  currentInterval: number,
  easeFactor: number,
  rating: PerformanceRating,
): { intervalDays: number; easeFactor: number } {
  let newEase = easeFactor;
  let newInterval: number;
  switch (rating) {
    case 'again':
      newEase = Math.max(1.3, easeFactor - 0.2);
      newInterval = 1;
      break;
    case 'hard':
      newEase = Math.max(1.3, easeFactor - 0.15);
      newInterval = Math.max(1, Math.round(currentInterval * 1.2));
      break;
    case 'good':
      newInterval = Math.max(1, Math.round(currentInterval * easeFactor));
      break;
    case 'easy':
      newEase = easeFactor + 0.15;
      newInterval = Math.max(1, Math.round(currentInterval * easeFactor * 1.3));
      break;
  }
  return { intervalDays: newInterval, easeFactor: newEase };
}

export function calculateMasteryUpdate(currentScore: number, rating: PerformanceRating): number {
  let delta: number;
  switch (rating) {
    case 'again': delta = -15; break;
    case 'hard': delta = -5; break;
    case 'good': delta = 10; break;
    case 'easy': delta = 15; break;
  }
  return Math.max(0, Math.min(100, currentScore + delta));
}
