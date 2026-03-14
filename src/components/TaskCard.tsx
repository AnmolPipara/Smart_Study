import { StudyTask, Priority } from '@/types/study';
import { Clock, Flag, Trash2, CheckCircle2, Circle, CalendarDays } from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';

interface TaskCardProps {
  task: StudyTask;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: StudyTask) => void;
}

const priorityConfig: Record<Priority, { label: string; className: string }> = {
  high: { label: 'High', className: 'bg-priority-high/20 text-priority-high' },
  medium: { label: 'Medium', className: 'bg-priority-medium/20 text-priority-medium' },
  low: { label: 'Low', className: 'bg-priority-low/20 text-priority-low' },
};

const TaskCard = ({ task, onToggle, onDelete, onEdit }: TaskCardProps) => {
  const priority = priorityConfig[task.priority];
  const deadlineDate = new Date(task.deadline);
  const isOverdue = isPast(deadlineDate) && !task.completed && !isToday(deadlineDate);
  const scheduledDateLabel = format(new Date(task.scheduledDate), 'MMM d');

  return (
    <div
      className={`group glass rounded-lg p-3.5 transition-all hover:border-primary/30 cursor-pointer ${
        task.completed ? 'opacity-50' : ''
      } ${isOverdue ? 'border-destructive/50' : ''}`}
      onClick={() => onEdit(task)}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={(e) => { e.stopPropagation(); onToggle(task.id); }}
          className="mt-0.5 shrink-0"
        >
          {task.completed ? (
            <CheckCircle2 className="w-5 h-5 text-primary" />
          ) : (
            <Circle className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className={`text-sm font-medium truncate ${task.completed ? 'line-through' : ''}`}>
              {task.title}
            </h4>
          </div>
          <p className="text-xs text-muted-foreground mb-2">{task.subject}</p>

          <div className="flex items-center gap-3 flex-wrap">
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${priority.className}`}>
              <Flag className="w-3 h-3 inline mr-1" />
              {priority.label}
            </span>
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {task.estimatedMinutes}m
            </span>
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <CalendarDays className="w-3 h-3" />
              planned {scheduledDateLabel}
            </span>
            {isOverdue && (
              <span className="text-[10px] text-destructive font-medium">Overdue!</span>
            )}
          </div>
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
          className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
        >
          <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive transition-colors" />
        </button>
      </div>

      <div className="mt-2 pt-2 border-t border-border/30 flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground">
          Due: {format(deadlineDate, 'MMM d, yyyy')}
        </span>
        <span className="text-[10px] text-muted-foreground">
          {format(deadlineDate, 'h:mm a')}
        </span>
      </div>
    </div>
  );
};

export default TaskCard;
