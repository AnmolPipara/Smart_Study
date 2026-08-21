import { useState, useCallback } from 'react';
import { addDays, subDays, addWeeks, subWeeks } from 'date-fns';

export type DashboardSection = 'tasks' | 'notes' | 'analytics';
export type PlannerView = 'daily' | 'weekly' | 'calendar' | 'kanban' | 'timeline';

export function useDashboardNav() {
  const [section, setSection] = useState<DashboardSection>('tasks');
  const [view, setView] = useState<PlannerView>('daily');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tasksExpanded, setTasksExpanded] = useState(true);
  const [navCollapsed, setNavCollapsed] = useState(false);

  const navigateDate = useCallback((direction: 'prev' | 'next') => {
    setSelectedDate(d => {
      if (direction === 'next') {
        return view === 'daily' || view === 'timeline' ? addDays(d, 1) : addWeeks(d, 1);
      }
      return view === 'daily' || view === 'timeline' ? subDays(d, 1) : subWeeks(d, 1);
    });
  }, [view]);

  const goToToday = useCallback(() => setSelectedDate(new Date()), []);

  const toggleNav = useCallback(() => setNavCollapsed(prev => !prev), []);

  return {
    section,
    setSection,
    view,
    setView,
    selectedDate,
    setSelectedDate,
    tasksExpanded,
    setTasksExpanded,
    navCollapsed,
    toggleNav,
    navigateDate,
    goToToday,
  };
}
