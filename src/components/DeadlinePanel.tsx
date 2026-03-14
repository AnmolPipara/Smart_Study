import { StudyTask } from '@/types/study';
import { AlertTriangle, Clock } from 'lucide-react';
import { format, isPast, isToday, differenceInDays } from 'date-fns';

interface DeadlinePanelProps {
  tasks: StudyTask[];
}

const DeadlinePanel = ({ tasks }: DeadlinePanelProps) => {
  const upcoming = tasks
    .filter(t => !t.completed)
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 5);

  return (
    <div className="glass rounded-xl p-4">
      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-[#C084FC]" />
        Upcoming Deadlines
      </h3>
      {upcoming.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-4">No upcoming deadlines 🎉</p>
      ) : (
        <div className="space-y-2">
          {upcoming.map(task => {
            const deadline = new Date(task.deadline);
            const isOverdue = isPast(deadline) && !isToday(deadline);
            const daysLeft = differenceInDays(deadline, new Date());

            return (
              <div
                key={task.id}
                className={`p-3 rounded-lg bg-secondary/50 border border-border/30 ${
                  isOverdue ? 'border-destructive/40' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-medium truncate">{task.title}</p>
                  <span className={`text-[10px] font-semibold ${
                    isOverdue ? 'text-destructive' : daysLeft <= 1 ? 'text-[#C084FC]' : 'text-muted-foreground'
                  }`}>
                    {isOverdue ? 'Overdue' : daysLeft === 0 ? 'Today' : `${daysLeft}d left`}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  {format(deadline, 'MMM d, h:mm a')}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DeadlinePanel;
