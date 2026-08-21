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

const HOURS = Array.from({ length: 24 }, (_, i) => i); // 12AM - 11PM

const DailyPlanner = ({ tasks, selectedDate, onToggle, onDelete, onEdit }: DailyPlannerProps) => {
  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  const dayTasks = tasks.filter(t => format(new Date(t.deadline), 'yyyy-MM-dd') === dateStr);

  const morningHours = HOURS.slice(0, 12);
  const eveningHours = HOURS.slice(12, 24);

  const renderHourBlock = (hour: number) => {
    const hourTasks = dayTasks.filter(t => t.scheduledHour === hour);
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const timeLabel = `${displayHour}:00 ${ampm}`;

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
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">{format(selectedDate, 'EEEE, MMMM d')}</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Morning Column (12 AM - 11 AM) */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-4 border-b pb-2">Morning (AM)</h3>
          <div className="space-y-0.5">
            {morningHours.map(renderHourBlock)}
          </div>
        </div>

        {/* Evening Column (12 PM - 11 PM) */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-4 border-b pb-2">Evening (PM)</h3>
          <div className="space-y-0.5">
            {eveningHours.map(renderHourBlock)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyPlanner;
