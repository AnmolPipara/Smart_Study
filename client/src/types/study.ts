export type Priority = 'high' | 'medium' | 'low';

export interface StudyTask {
  id: string;
  title: string;
  subject: string;
  priority: Priority;
  estimatedMinutes: number;
  deadline: string; // ISO date string
  scheduledDate: string; // ISO date string (YYYY-MM-DD)
  scheduledHour: number; // 0-23
  completed: boolean;
  createdAt: string;
}

export interface DaySchedule {
  [hour: number]: StudyTask[];
}

export interface StudyNote {
  id: string;
  userId: string;
  subject: string;
  title: string;
  content: string;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
}
