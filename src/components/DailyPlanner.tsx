import { StudyTask } from '@/types/study';
import TaskCard from './TaskCard';
import { format } from 'date-fns';

interface DailyPlannerProps {
  tasks: StudyTask[];
  selectedDate: Date;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: StudyTask) => void;
}

const HOURS = Array.from({ length: 16 }, (_, i) => i + 6); // 6AM - 9PM

const DailyPlanner = ({ tasks, selectedDate, onToggle, onDelete, onEdit }: DailyPlannerProps) => {
  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  const dayTasks = tasks.filter(t => format(new Date(t.deadline), 'yyyy-MM-dd') === dateStr);

  return (
    <div className="space-y-1">
      <h2 className="text-lg font-semibold mb-4">{format(selectedDate, 'EEEE, MMMM d')}</h2>
      <div className="space-y-0.5">
        {HOURS.map(hour => {
          const hourTasks = dayTasks.filter(t => t.scheduledHour === hour);
          const timeLabel = `${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? 'PM' : 'AM'}`;

          return (
            <div key={hour} className="flex gap-4 group">
              <div className="w-16 shrink-0 text-right pt-3">
                <span className="text-xs text-muted-foreground font-medium">{timeLabel}</span>
              </div>
              <div className="flex-1 min-h-[3.5rem] border-t border-border/30 pt-2 pb-1">
                {hourTasks.length > 0 ? (
                  <div className="space-y-2">
                    {hourTasks.map(task => (
                      <TaskCard key={task.id} task={task} onToggle={onToggle} onDelete={onDelete} onEdit={onEdit} />
                    ))}
                  </div>
                ) : (
                  <div className="h-10 rounded-lg border border-dashed border-border/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[10px] text-muted-foreground/50">Empty slot</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DailyPlanner;
