import { useState, useEffect } from 'react';
import { StudyTask, StudyNote } from '@/types/study';
import { fetchTasks, createTask, editTask, removeTask, toggleTaskCompletion } from '@/services/taskService';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import DailyPlanner from '@/components/DailyPlanner';
import WeeklyPlanner from '@/components/WeeklyPlanner';
import CalendarPlanner from '@/components/CalendarPlanner';
import KanbanPlanner from '@/components/KanbanPlanner';
import TimelinePlanner from '@/components/TimelinePlanner';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import AiPlannerDialog from '@/components/AiPlannerDialog';
import NotesSidebar, { NoteSubjectNode } from '@/components/Notes/NotesSidebar';
import NotesEditor from '@/components/Notes/NotesEditor';
import { fetchNotes, upsertNote } from '@/services/noteService';
import DeadlinePanel from '@/components/DeadlinePanel';
import StudyProgress from '@/components/StudyProgress';
import TaskForm from '@/components/TaskForm';
import { Plus, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Menu, LayoutList, BookOpen, BarChart2 } from 'lucide-react';
import { addDays, subDays, addWeeks, subWeeks } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const Dashboard = () => {
  const [tasks, setTasks] = useState<StudyTask[]>([]);
  const [notes, setNotes] = useState<StudyNote[]>([]);
  const [section, setSection] = useState<'tasks' | 'notes' | 'analytics'>('tasks');
  const [tasksExpanded, setTasksExpanded] = useState(true);
  const [view, setView] = useState<'daily' | 'weekly' | 'calendar' | 'kanban' | 'timeline'>('daily');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<StudyTask | null>(null);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [showAiPlanner, setShowAiPlanner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [navCollapsed, setNavCollapsed] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadTasks();
    loadNotes();
  }, []);

  const loadTasks = async () => {
    try {
      const data = await fetchTasks();
      setTasks(data);
    } catch (err: any) {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (task: StudyTask) => {
    try {
      if (editingTask) {
        const updated = await editTask(task);
        setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
      } else {
        const created = await createTask(task, user!.id);
        setTasks(prev => [...prev, created]);
      }
      setShowForm(false);
      setEditingTask(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to save task');
    }
  };

  const loadNotes = async () => {
    try {
      const data = await fetchNotes();
      setNotes(data);
      if (data.length > 0 && !selectedNoteId) {
        setSelectedNoteId(data[0].id);
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to load notes');
    }
  };

  const handleNoteChange = async (note: StudyNote) => {
    if (!user) return;
    try {
      const saved = await upsertNote(note, user.id);
      setNotes(prev =>
        prev.some(n => n.id === saved.id)
          ? prev.map(n => (n.id === saved.id ? saved : n))
          : [...prev, saved],
      );
      setSelectedNoteId(saved.id);
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to save note');
    }
  };

  const handleCreateNote = (parentId: string | null) => {
    if (!user) return;
    const baseSubject = parentId ? notes.find(n => n.id === parentId)?.subject ?? 'General' : 'General';
    const draft: StudyNote = {
      id: '',
      userId: user.id,
      subject: baseSubject,
      title: 'New Note',
      content: '',
      parentId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    handleNoteChange(draft);
  };

  const subjectTree: NoteSubjectNode[] = (() => {
    const byId = new Map<string, NoteSubjectNode>();
    const roots: NoteSubjectNode[] = [];
    notes.forEach(note => {
      byId.set(note.id, { id: note.id, name: note.title || note.subject, children: [] });
    });
    notes.forEach(note => {
      const node = byId.get(note.id)!;
      if (note.parentId && byId.has(note.parentId)) {
        byId.get(note.parentId)!.children!.push(node);
      } else {
        roots.push(node);
      }
    });
    return roots;
  })();

  const selectedNote = notes.find(n => n.id === selectedNoteId) ?? null;

  const handleToggle = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    try {
      await toggleTaskCompletion(id, !task.completed);
      setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    } catch {
      toast.error('Failed to update task');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await removeTask(id);
      setTasks(prev => prev.filter(t => t.id !== id));
    } catch {
      toast.error('Failed to delete task');
    }
  };

  const handleEdit = (task: StudyTask) => {
    setEditingTask(task);
    setShowForm(true);
  };


  const navigateDate = (direction: 'prev' | 'next') => {
    if (view === 'daily' || view === 'timeline') {
      setSelectedDate(d => direction === 'next' ? addDays(d, 1) : subDays(d, 1));
    } else if (view === 'weekly') {
      setSelectedDate(d => direction === 'next' ? addWeeks(d, 1) : subWeeks(d, 1));
    } else {
      // Calendar & Kanban just move by weeks for a broader overview
      setSelectedDate(d => direction === 'next' ? addWeeks(d, 1) : subWeeks(d, 1));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading your study plan...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="w-full px-4 sm:px-6 py-6 flex gap-4">
        <aside className={`shrink-0 transition-all duration-300 ${navCollapsed ? 'w-12' : 'w-40'}`}>
          <div className="relative space-y-2">
            {/* Hamburger toggle */}
            <button
              type="button"
              onClick={() => setNavCollapsed((prev) => !prev)}
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
                  onClick={() => { setSection('tasks'); setTasksExpanded(true); setNavCollapsed(false); }}
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
                  onClick={() => { setSection('notes'); setNavCollapsed(false); }}
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
                  onClick={() => { setSection('analytics'); setNavCollapsed(false); }}
                  title="Analytics"
                  className={`w-full flex items-center justify-center p-2 rounded-xl transition-all ${
                    section === 'analytics'
                      ? 'bg-gradient-to-r from-primary to-[#C084FC] text-primary-foreground'
                      : 'bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground'
                  }`}
                >
                  <BarChart2 className="w-4 h-4" />
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
                onClick={() => setSelectedDate(new Date())}
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
                    onClick={() => { setEditingTask(null); setShowForm(true); }}
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
                  onEdit={handleEdit}
                />
              )}
            </div>
            <div className="space-y-4">
              <StudyProgress tasks={tasks} />
              <DeadlinePanel tasks={tasks} />
            </div>
          </div>
        )}

        {section === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] gap-6">
            <AnalyticsDashboard tasks={tasks} selectedDate={selectedDate} />
            <div className="space-y-4">
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
              onCreate={handleCreateNote}
            />
            <NotesEditor note={selectedNote} onChange={handleNoteChange} />
          </div>
        )}
        </div>
      </main>

      {showForm && (
        <TaskForm
          onSubmit={handleAddTask}
          onClose={() => { setShowForm(false); setEditingTask(null); }}
          editTask={editingTask}
        />
      )}
      <AiPlannerDialog open={showAiPlanner} onClose={() => setShowAiPlanner(false)} />
    </div>
  );
};

export default Dashboard;
