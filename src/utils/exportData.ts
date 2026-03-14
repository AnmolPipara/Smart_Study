import { StudyTask } from '@/types/study';
import { format } from 'date-fns';

export function exportTasksAsCSV(tasks: StudyTask[]): void {
  const headers = ['Title', 'Subject', 'Priority', 'Deadline', 'Scheduled Date', 'Estimated Minutes', 'Completed'];

  const rows = tasks.map(task => [
    `"${task.title.replace(/"/g, '""')}"`,
    `"${task.subject.replace(/"/g, '""')}"`,
    task.priority,
    format(new Date(task.deadline), 'yyyy-MM-dd'),
    task.scheduledDate,
    String(task.estimatedMinutes),
    task.completed ? 'Yes' : 'No',
  ]);

  const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `study-tasks-${format(new Date(), 'yyyy-MM-dd')}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
