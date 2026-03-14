import { StudyTask } from '@/types/study';
import { format, isToday } from 'date-fns';
import { CheckCircle2, ListTodo, SunMedium } from 'lucide-react';

interface KanbanPlannerProps {
  tasks: StudyTask[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: StudyTask) => void;
}

const KanbanPlanner = ({ tasks, onToggle, onDelete, onEdit }: KanbanPlannerProps) => {
  const todayStr = format(new Date(), 'yyyy-MM-dd');

  const columns = [
    {
      id: 'today',
      title: 'Today',
      description: 'Tasks due today',
      icon: SunMedium,
      tasks: tasks.filter((t) => format(new Date(t.deadline), 'yyyy-MM-dd') === todayStr && !t.completed),
    },
    {
      id: 'upcoming',
      title: 'Upcoming',
      description: 'Tasks due after today',
      icon: ListTodo,
      tasks: tasks.filter((t) => format(new Date(t.deadline), 'yyyy-MM-dd') !== todayStr && !t.completed),
    },
    {
      id: 'completed',
      title: 'Completed',
      description: 'Finished tasks',
      icon: CheckCircle2,
      tasks: tasks.filter((t) => t.completed),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between">
        <h2 className="text-lg font-semibold">Kanban Study Board</h2>
        <p className="text-xs text-muted-foreground">
          Drag-and-drop is not enabled yet, but you can manage tasks visually across columns.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {columns.map((column) => (
          <section
            key={column.id}
            className="glass rounded-xl p-3 flex flex-col min-h-[260px]"
          >
            <header className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center">
                  <column.icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">{column.title}</h3>
                  <p className="text-[10px] text-muted-foreground">
                    {column.description}
                  </p>
                </div>
              </div>
              <span className="text-[10px] text-muted-foreground font-medium px-2 py-0.5 rounded-full bg-secondary/70">
                {column.tasks.length} tasks
              </span>
            </header>

            <div className="space-y-2 flex-1">
              {column.tasks.length === 0 ? (
                <p className="text-[11px] text-muted-foreground/60 text-center py-6">
                  No tasks here yet.
                </p>
              ) : (
                column.tasks.map((task) => {
                  const deadline = new Date(task.deadline);
                  const isTodayDeadline = isToday(deadline);
                  return (
                    <button
                      key={task.id}
                      type="button"
                      onClick={() => onEdit(task)}
                      className={[
                        'w-full text-left rounded-lg p-3 text-xs transition-all bg-gradient-to-br shadow-card',
                        task.priority === 'high'
                          ? 'from-red-500/25 via-red-400/15 to-background'
                          : task.priority === 'medium'
                          ? 'from-amber-400/25 via-amber-300/15 to-background'
                          : 'from-emerald-400/25 via-emerald-300/15 to-background',
                      ].join(' ')}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <p className="font-semibold truncate text-foreground">
                          {task.title}
                        </p>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggle(task.id);
                          }}
                          className="shrink-0"
                        >
                          {task.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-primary" />
                          ) : (
                            <span className="w-4 h-4 inline-block rounded-full border border-primary/60" />
                          )}
                        </button>
                      </div>
                      <p className="text-[11px] text-muted-foreground mb-1">
                        {task.subject}
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                        <span>{task.estimatedMinutes} min</span>
                        <span>
                          {isTodayDeadline
                            ? 'Due today'
                            : format(deadline, 'MMM d')}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

export default KanbanPlanner;

