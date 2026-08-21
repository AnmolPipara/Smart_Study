import { StudyTask } from '@/types/study';
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isSameDay,
  isToday,
} from 'date-fns';

interface CalendarPlannerProps {
  tasks: StudyTask[];
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

const CalendarPlanner = ({ tasks, selectedDate, onSelectDate }: CalendarPlannerProps) => {
  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const today = new Date();

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">
        {format(selectedDate, 'MMMM yyyy')}
      </h2>
      <div className="grid grid-cols-7 gap-2 text-xs text-muted-foreground mb-2">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
          <div key={d} className="text-center uppercase tracking-wide">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const dayTasks = tasks.filter((t) => format(new Date(t.deadline), 'yyyy-MM-dd') === dateStr);
          const isSelected = isSameDay(day, selectedDate);
          const isCurrentToday = isToday(day);

          return (
            <button
              key={dateStr}
              type="button"
              onClick={() => onSelectDate(day)}
              className={[
                'relative flex flex-col items-start justify-between rounded-xl p-2 min-h-[80px] text-left transition-all glass',
                isSelected ? 'border-[#7C3AED]/60 shadow-[0_0_12px_rgba(124,58,237,0.4)]' : 'border-border hover:border-border/60',
              ].join(' ')}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span
                  className={[
                    'text-sm font-semibold',
                    isCurrentToday ? 'text-[#C084FC]' : '',
                  ].join(' ')}
                >
                  {format(day, 'd')}
                </span>
                {isCurrentToday && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED]" />
                )}
              </div>
              <div className="space-y-1 w-full">
                {dayTasks.slice(0, 3).map((task) => (
                  <div
                    key={task.id}
                    className={[
                      'w-full h-1.5 rounded-full bg-gradient-to-r',
                      task.priority === 'high'
                        ? 'from-[#7C3AED]/80 to-[#C084FC]/60'
                        : task.priority === 'medium'
                        ? 'from-amber-400/80 to-amber-300/60'
                        : 'from-emerald-400/80 to-emerald-300/60',
                    ].join(' ')}
                  />
                ))}
                {dayTasks.length > 3 && (
                  <span className="text-[10px] text-muted-foreground">
                    +{dayTasks.length - 3} more
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarPlanner;

