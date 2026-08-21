import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTaskManager } from '@/hooks/useTaskManager';
import { useNoteManager } from '@/hooks/useNoteManager';
import { useDashboardNav } from '@/hooks/useDashboardNav';
import Header from '@/components/Header';
import DailyPlanner from '@/components/DailyPlanner';
import WeeklyPlanner from '@/components/WeeklyPlanner';
import CalendarPlanner from '@/components/CalendarPlanner';
import KanbanPlanner from '@/components/KanbanPlanner';
import TimelinePlanner from '@/components/TimelinePlanner';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import AiPlannerDialog from '@/components/AiPlannerDialog';
import NotesSidebar from '@/components/Notes/NotesSidebar';
import NotesEditor from '@/components/Notes/NotesEditor';
import DeadlinePanel from '@/components/DeadlinePanel';
import StudyProgress from '@/components/StudyProgress';
import TaskForm from '@/components/TaskForm';
import DashboardSkeleton from '@/components/DashboardSkeleton';
import PomodoroTimer from '@/components/PomodoroTimer';
import MobileBottomNav from '@/components/MobileBottomNav';
import MasteryPanel from '@/components/MasteryPanel';
import RevisionPanel from '@/components/RevisionPanel';
import TodayRecommendation from '@/components/TodayRecommendation';
import { useMastery } from '@/hooks/useMastery';
import { useDeadlineNotifications } from '@/hooks/useDeadlineNotifications';
import { exportTasksAsCSV } from '@/utils/exportData';
import { Plus, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Menu, LayoutList, BookOpen, BarChart2, Download, Target } from 'lucide-react';


const Dashboard = () => {
  const { user } = useAuth();

  const {
    tasks, loading, showForm, editingTask,
    loadTasks, handleAddTask, handleToggle, handleDelete, handleEdit,
    openNewTaskForm, closeForm,
  } = useTaskManager(user?.id);

  const {
    selectedNoteId, setSelectedNoteId, selectedNote, subjectTree,
    loadNotes, handleNoteChange, handleCreateItem, handleRenameNote, handleDeleteNote,
  } = useNoteManager(user?.id);

  const {
    section, setSection, view, setView,
    selectedDate, setSelectedDate, tasksExpanded, setTasksExpanded,
    navCollapsed, toggleNav, navigateDate, goToToday,
  } = useDashboardNav();

  const mastery = useMastery();
  const [showAiPlanner, setShowAiPlanner] = useState(false);

  // Enable deadline notifications
  useDeadlineNotifications(tasks);

  useEffect(() => {
    loadTasks();
    loadNotes();
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="w-full px-4 sm:px-6 py-6 pb-24 md:pb-6 flex gap-4">
        <aside className={`shrink-0 transition-all duration-300 hidden md:block ${navCollapsed ? 'w-12' : 'w-40'}`}>
          <div className="relative space-y-2">
            {/* Hamburger toggle */}
            <button
              type="button"
              onClick={toggleNav}
              className="w-full flex items-center justify-start pl-2 p-2 rounded-xl bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors mb-1"
              title={navCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <Menu className="w-4 h-4" />
            </button>

            {navCollapsed ? (
              // Collapsed: icon-only buttons
              <>
                <button
                  type="button"
                  onClick={() => { setSection('tasks'); setTasksExpanded(true); toggleNav(); }}
                  title="Tasks"
                  className={`w-full flex items-center justify-center p-2 rounded-xl transition-all ${
                    section === 'tasks'
                      ? 'bg-gradient-to-r from-primary to-[#C084FC] text-primary-foreground'
                      : 'bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground'
                  }`}
                >
                  <LayoutList className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => { setSection('notes'); toggleNav(); }}
                  title="Notes"
                  className={`w-full flex items-center justify-center p-2 rounded-xl transition-all ${
                    section === 'notes'
                      ? 'bg-gradient-to-r from-primary to-[#C084FC] text-primary-foreground'
                      : 'bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => { setSection('analytics'); toggleNav(); }}
                  title="Analytics"
                  className={`w-full flex items-center justify-center p-2 rounded-xl transition-all ${
                    section === 'analytics'
                      ? 'bg-gradient-to-r from-primary to-[#C084FC] text-primary-foreground'
                      : 'bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground'
                  }`}
                >
                  <BarChart2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => { setSection('mastery'); toggleNav(); }}
                  title="Mastery"
                  className={`w-full flex items-center justify-center p-2 rounded-xl transition-all ${
                    section === 'mastery'
                      ? 'bg-gradient-to-r from-primary to-[#C084FC] text-primary-foreground'
                      : 'bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground'
                  }`}
                >
                  <Target className="w-4 h-4" />
                </button>
              </>
            ) : (
              // Expanded: full sidebar
              <>
                <button
                  type="button"
                  onClick={() => {
                    if (section !== 'tasks') {
                      setSection('tasks');
                      setTasksExpanded(true);
                    } else {
                      setTasksExpanded((prev) => !prev);
                    }
                  }}
                  className={`relative w-full text-left text-sm px-3 py-2.5 rounded-xl transition-all duration-300 flex items-center justify-between ${
                    section === 'tasks'
                      ? 'bg-gradient-to-r from-primary to-[#C084FC] text-primary-foreground shadow-card'
                      : 'bg-secondary/60 text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
                >
                  Tasks
                  {tasksExpanded ? (
                    <ChevronUp className="w-4 h-4 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 shrink-0" />
                  )}
                </button>
                {section === 'tasks' && tasksExpanded && (
                  <div className="pl-3 mt-0.5 space-y-0.5 border-l border-border/40 ml-2">
                    {[
                      { id: 'daily' as const, label: 'Daily' },
                      { id: 'weekly' as const, label: 'Weekly' },
                      { id: 'calendar' as const, label: 'Month' },
                      { id: 'kanban' as const, label: 'Kanban' },
                      { id: 'timeline' as const, label: 'Timeline' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setView(item.id)}
                        className={`w-full text-left text-xs px-2 py-1.5 rounded-md transition-colors ${
                          view === item.id
                            ? 'bg-primary/15 text-primary font-medium'
                            : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setSection('notes')}
                  className={`relative w-full text-left text-sm px-3 py-2.5 rounded-xl transition-all duration-300 ${
                    section === 'notes'
                      ? 'bg-gradient-to-r from-primary to-[#C084FC] text-primary-foreground shadow-card'
                      : 'bg-secondary/60 text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
                >
                  Notes
                </button>
                <button
                  type="button"
                  onClick={() => setSection('analytics')}
                  className={`relative w-full text-left text-sm px-3 py-2.5 rounded-xl transition-all duration-300 ${
                    section === 'analytics'
                      ? 'bg-gradient-to-r from-primary to-[#C084FC] text-primary-foreground shadow-card'
                      : 'bg-secondary/60 text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
                >
                  Analytics
                </button>
                <button
                  type="button"
                  onClick={() => setSection('mastery')}
                  className={`relative w-full text-left text-sm px-3 py-2.5 rounded-xl transition-all duration-300 ${
                    section === 'mastery'
                      ? 'bg-gradient-to-r from-primary to-[#C084FC] text-primary-foreground shadow-card'
                      : 'bg-secondary/60 text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
                >
                  Mastery
                </button>
              </>
            )}
          </div>
        </aside>

        <div className="flex-1">
        {section !== 'notes' && (
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <button onClick={() => navigateDate('prev')} className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={goToToday}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                Today
              </button>
              <button onClick={() => navigateDate('next')} className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              {section === 'tasks' && (
                <>
                  <button
                    onClick={openNewTaskForm}
                    className="flex items-center gap-2 bg-gradient-to-r from-primary to-[#C084FC] text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity glow-primary"
                  >
                    <Plus className="w-4 h-4" />
                    Add Task
                  </button>
                  <button
                    onClick={() => setShowAiPlanner(true)}
                    className="px-3 py-2 rounded-lg text-xs font-semibold bg-secondary text-foreground hover:bg-secondary/80 transition-colors border border-primary/40"
                  >
                    AI Auto Plan
                  </button>
                  <button
                    onClick={() => exportTasksAsCSV(tasks)}
                    className="px-3 py-2 rounded-lg text-xs font-semibold bg-secondary text-foreground hover:bg-secondary/80 transition-colors border border-border/60"
                    title="Export tasks as CSV"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </>
              )}

            </div>
          </div>
        )}

        {section === 'tasks' && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
            <div className="glass rounded-xl p-5 relative overflow-hidden">
              {view === 'daily' && (
                <DailyPlanner
                  tasks={tasks}
                  selectedDate={selectedDate}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                />
              )}
              {view === 'weekly' && (
                <WeeklyPlanner
                  tasks={tasks}
                  selectedDate={selectedDate}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                />
              )}
              {view === 'calendar' && (
                <CalendarPlanner
                  tasks={tasks}
                  selectedDate={selectedDate}
                  onSelectDate={setSelectedDate}
                />
              )}
              {view === 'kanban' && (
                <KanbanPlanner
                  tasks={tasks}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                />
              )}
              {view === 'timeline' && (
                <TimelinePlanner
                  tasks={tasks}
                  selectedDate={selectedDate}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                />
              )}
            </div>
            <div className="space-y-4">
              <TodayRecommendation subjectsWithMastery={mastery.subjectsWithMastery} revisionsDue={mastery.revisionsDue} />
              <PomodoroTimer />
              <StudyProgress tasks={tasks} />
              <RevisionPanel revisionsDue={mastery.revisionsDue} onProcessRevision={mastery.processRevision} isProcessing={mastery.isProcessingRevision} />
              <DeadlinePanel tasks={tasks} />
            </div>
          </div>
        )}

        {section === 'mastery' && (
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] gap-6">
            <MasteryPanel
              subjectsWithMastery={mastery.subjectsWithMastery}
              onAddSubject={mastery.addSubject}
              onAddTopic={mastery.addTopic}
              onRemoveSubject={mastery.removeSubject}
              onRemoveTopic={mastery.removeTopic}
              loading={mastery.loading}
            />
            <div className="space-y-4">
              <RevisionPanel revisionsDue={mastery.revisionsDue} onProcessRevision={mastery.processRevision} isProcessing={mastery.isProcessingRevision} />
              <TodayRecommendation subjectsWithMastery={mastery.subjectsWithMastery} revisionsDue={mastery.revisionsDue} />
              <PomodoroTimer />
            </div>
          </div>
        )}

        {section === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] gap-6">
            <AnalyticsDashboard tasks={tasks} selectedDate={selectedDate} />
            <div className="space-y-4">
              <PomodoroTimer />
              <StudyProgress tasks={tasks} />
              <DeadlinePanel tasks={tasks} />
            </div>
          </div>
        )}

        {section === 'notes' && (
          <div className="glass rounded-xl overflow-hidden flex min-h-[520px] md:min-h-[620px]">
            <NotesSidebar
              subjects={subjectTree}
              selectedId={selectedNoteId}
              onSelect={setSelectedNoteId}
              onCreate={handleCreateItem}
              onRename={handleRenameNote}
              onDelete={handleDeleteNote}
            />
            <NotesEditor note={selectedNote} onChange={handleNoteChange} />
          </div>
        )}
        </div>
      </main>

      {showForm && (
        <TaskForm
          onSubmit={handleAddTask}
          onClose={closeForm}
          editTask={editingTask}
          onDelete={handleDelete}
        />
      )}
      <AiPlannerDialog open={showAiPlanner} onClose={() => setShowAiPlanner(false)} />
      <MobileBottomNav section={section} />
    </div>
  );
};

export default Dashboard;
