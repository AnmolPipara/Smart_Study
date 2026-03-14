import { StudyTask } from '@/types/study';
import { format } from 'date-fns';

interface TimelinePlannerProps {
  tasks: StudyTask[];
  selectedDate: Date;
  onToggle: (id: string) => void;
  onEdit: (task: StudyTask) => void;
}

const TimelinePlanner = ({
  tasks,
  selectedDate,
  onToggle,
  onEdit,
}: TimelinePlannerProps) => {
  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  const dayTasks = tasks
    .filter((t) => format(new Date(t.deadline), 'yyyy-MM-dd') === dateStr)
    .sort((a, b) => a.scheduledHour - b.scheduledHour);

  const minHour = 6;
  const maxHour = 22;
  const totalSpan = maxHour - minHour;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">
          Timeline for {format(selectedDate, 'EEEE, MMMM d')}
        </h2>
        <p className="text-xs text-muted-foreground">
          Visual timeline of your study blocks for the day.
        </p>
      </div>

      <div className="relative mt-4">
        <div className="h-1 rounded-full bg-gradient-to-r from-[#2D2550] via-[#7C3AED]/50 to-[#2D2550]" />
        <div className="flex justify-between mt-2 text-[10px] text-[#94A3B8]">
          <span>6 AM</span>
          <span>12 PM</span>
          <span>6 PM</span>
          <span>10 PM</span>
        </div>

        <div className="relative mt-6 space-y-2">
          {dayTasks.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-6">
              No tasks scheduled for this day yet.
            </p>
          )}

          {dayTasks.map((task) => {
            const startOffset = Math.max(task.scheduledHour - minHour, 0);
            const durationHours = Math.max(task.estimatedMinutes / 60, 0.5);
            const widthPercent = Math.min(
              (durationHours / totalSpan) * 100,
              35,
            );
            const leftPercent = Math.min(
              (startOffset / totalSpan) * 100,
              100 - widthPercent,
            );

            const gradientClass =
              task.priority === 'high'
                ? 'from-[#4C1D95] via-[#7C3AED] to-[#C084FC]'
                : task.priority === 'medium'
                ? 'from-amber-400 via-amber-300 to-yellow-400'
                : 'from-emerald-400 via-teal-400 to-cyan-400';

            return (
              <button
                key={task.id}
                type="button"
                onClick={() => onEdit(task)}
                className="group absolute top-0 left-0 h-9 rounded-2xl overflow-hidden shadow-card text-left"
                style={{
                  width: `${widthPercent}%`,
                  left: `${leftPercent}%`,
                }}
              >
                <div
                  className={`h-full w-full bg-gradient-to-r ${gradientClass} opacity-90 group-hover:opacity-100 transition-opacity`}
                >
                  <div className="h-full w-full px-3 flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold truncate text-slate-950">
                        {task.title}
                      </p>
                      <p className="text-[10px] text-slate-900/80 truncate">
                        {task.estimatedMinutes} min •{' '}
                        {task.scheduledHour > 12
                          ? `${task.scheduledHour - 12}:00 PM`
                          : `${task.scheduledHour}:00 ${
                              task.scheduledHour >= 12 ? 'PM' : 'AM'
                            }`}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggle(task.id);
                      }}
                      className="ml-2 w-4 h-4 rounded-full border border-slate-900/40 bg-white/60 group-hover:bg-white"
                    />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TimelinePlanner;

