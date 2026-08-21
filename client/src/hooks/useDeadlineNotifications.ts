import { useEffect, useRef } from 'react';
import { StudyTask } from '@/types/study';

/**
 * Hook that checks tasks for upcoming deadlines and sends browser notifications.
 * Runs a check every 15 minutes.
 */
export function useDeadlineNotifications(tasks: StudyTask[]) {
  const notifiedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Request permission on mount
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const checkDeadlines = () => {
      if (!('Notification' in window) || Notification.permission !== 'granted') return;

      const now = new Date();
      const upcoming = tasks.filter(task => {
        if (task.completed) return false;
        if (notifiedRef.current.has(task.id)) return false;

        const deadline = new Date(task.deadline);
        const hoursUntil = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);

        // Notify if deadline is within 24 hours
        return hoursUntil > 0 && hoursUntil <= 24;
      });

      upcoming.forEach(task => {
        const deadline = new Date(task.deadline);
        const hoursUntil = Math.round((deadline.getTime() - now.getTime()) / (1000 * 60 * 60));

        new Notification(`📚 Deadline approaching: ${task.title}`, {
          body: `Due in ${hoursUntil} hour${hoursUntil !== 1 ? 's' : ''} • ${task.subject}`,
          icon: '/favicon.ico',
          tag: `deadline-${task.id}`,
        });

        notifiedRef.current.add(task.id);
      });
    };

    // Check immediately, then every 15 minutes
    checkDeadlines();
    const interval = setInterval(checkDeadlines, 15 * 60 * 1000);

    return () => clearInterval(interval);
  }, [tasks]);
}
