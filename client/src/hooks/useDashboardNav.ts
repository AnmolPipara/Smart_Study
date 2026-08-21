import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { addDays, subDays, addWeeks, subWeeks } from 'date-fns';

export type DashboardSection = 'tasks' | 'notes' | 'analytics' | 'mastery';
export type PlannerView = 'daily' | 'weekly' | 'calendar' | 'kanban' | 'timeline';

const VALID_SECTIONS: DashboardSection[] = ['tasks', 'notes', 'analytics', 'mastery'];

export function useDashboardNav() {
  const navigate = useNavigate();
  const { section: urlSection } = useParams();

  const section: DashboardSection = VALID_SECTIONS.includes(urlSection as DashboardSection)
    ? (urlSection as DashboardSection)
    : 'tasks';

  const [view, setView] = useState<PlannerView>('daily');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tasksExpanded, setTasksExpanded] = useState(true);
  const [navCollapsed, setNavCollapsed] = useState(false);

  const setSection = useCallback((s: DashboardSection) => {
    navigate(`/dashboard/${s}`, { replace: false });
  }, [navigate]);

  const navigateDate = useCallback((direction: 'prev' | 'next') => {
    setSelectedDate(d => {
      if (direction === 'next') return view === 'daily' || view === 'timeline' ? addDays(d, 1) : addWeeks(d, 1);
      return view === 'daily' || view === 'timeline' ? subDays(d, 1) : subWeeks(d, 1);
    });
  }, [view]);

  const goToToday = useCallback(() => setSelectedDate(new Date()), []);
  const toggleNav = useCallback(() => setNavCollapsed(prev => !prev), []);

  // Auto-expand tasks when navigating to tasks section
  useEffect(() => {
    if (section === 'tasks') setTasksExpanded(true);
  }, [section]);

  return { section, setSection, view, setView, selectedDate, setSelectedDate, tasksExpanded, setTasksExpanded, navCollapsed, toggleNav, navigateDate, goToToday };
}
