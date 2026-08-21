import { StudyTask } from '@/types/study';
import { format, addDays, startOfWeek } from 'date-fns';
import { Clock, Flag } from 'lucide-react';

interface WeeklyPlannerProps {
  tasks: StudyTask[];
  selectedDate: Date;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: StudyTask) => void;
}

const WeeklyPlanner = ({ tasks, selectedDate, onToggle, onEdit }: WeeklyPlannerProps) => {
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const today = format(new Date(), 'yyyy-MM-dd');

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">
        Week of {format(weekStart, 'MMMM d')}
      </h2>
      <div className="grid grid-cols-7 gap-2">
        {days.map(day => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const dayTasks = tasks.filter(t => format(new Date(t.deadline), 'yyyy-MM-dd') === dateStr);
          const isToday = dateStr === today;

          return (
            <div
              key={dateStr}
              className={`glass rounded-lg p-3 min-h-[200px] ${isToday ? 'border-primary/40 glow-primary' : ''}`}
            >
              <div className="mb-3">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  {format(day, 'EEE')}
                </p>
                <p className={`text-lg font-semibold ${isToday ? 'text-primary' : ''}`}>
                  {format(day, 'd')}
                </p>
              </div>
              <div className="space-y-1.5">
                {dayTasks.map(task => (
                  <button
                    key={task.id}
                    onClick={() => onEdit(task)}
                    className={`w-full text-left p-2 rounded-md text-[11px] transition-all hover:bg-secondary/80 ${
                      task.completed ? 'opacity-40 line-through' : ''
                    } ${
                      task.priority === 'high'
                        ? 'border-l-2 border-l-priority-high bg-priority-high/5'
                        : task.priority === 'medium'
                        ? 'border-l-2 border-l-priority-medium bg-priority-medium/5'
                        : 'border-l-2 border-l-priority-low bg-priority-low/5'
                    }`}
                  >
                    <p className="font-medium truncate">{task.title}</p>
                    <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>{task.estimatedMinutes}m</span>
                    </div>
                  </button>
                ))}
                {dayTasks.length === 0 && (
                  <p className="text-[10px] text-muted-foreground/40 text-center py-4">No tasks</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeeklyPlanner;
