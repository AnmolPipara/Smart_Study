import { StudyTask } from '@/types/study';
import { addDays, format, startOfWeek } from 'date-fns';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface AnalyticsDashboardProps {
  tasks: StudyTask[];
  selectedDate: Date;
}

const FOCUS_BASELINE_MINUTES = 240;

const AnalyticsDashboard = ({ tasks, selectedDate }: AnalyticsDashboardProps) => {
  const todayStr = format(selectedDate, 'yyyy-MM-dd');
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });

  const todayTasks = tasks.filter((t) => t.scheduledDate === todayStr);
  const todayCompleted = todayTasks.filter((t) => t.completed);
  const todayTotalMinutes = todayTasks.reduce((sum, t) => sum + t.estimatedMinutes, 0);
  const todayCompletedMinutes = todayCompleted.reduce((sum, t) => sum + t.estimatedMinutes, 0);

  const completionPercent =
    todayTasks.length > 0 ? Math.round((todayCompleted.length / todayTasks.length) * 100) : 0;

  const focusScore = Math.min(
    100,
    Math.round((todayCompletedMinutes / FOCUS_BASELINE_MINUTES) * 100),
  );

  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const day = addDays(weekStart, i);
    const dateStr = format(day, 'yyyy-MM-dd');
    const dayMinutes = tasks
      .filter((t) => t.scheduledDate === dateStr && t.completed)
      .reduce((sum, t) => sum + t.estimatedMinutes, 0);
    return {
      label: format(day, 'EEE'),
      minutes: Math.round(dayMinutes / 60 * 10) / 10,
    };
  });

  const subjectMap = new Map<string, number>();
  tasks.forEach((t) => {
    if (!t.completed) return;
    subjectMap.set(t.subject, (subjectMap.get(t.subject) || 0) + t.estimatedMinutes);
  });
  const subjectData = Array.from(subjectMap.entries()).map(([name, minutes]) => ({
    name,
    minutes: Math.round(minutes / 60 * 10) / 10,
  }));

  const mostStudiedSubject = subjectData.sort((a, b) => b.minutes - a.minutes)[0]?.name ?? '—';

  const COLORS = ['#3b82f6', '#60a5fa', '#1d4ed8', '#D97706', '#22C55E', '#ec4899'];

  return (
    <div className="space-y-4">
      <div className="glass rounded-xl p-4">
        <h3 className="text-sm font-semibold mb-3">Today</h3>
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <p className="text-muted-foreground mb-1">Study Time</p>
            <p className="text-lg font-semibold">
              {Math.floor(todayCompletedMinutes / 60)}h{' '}
              {todayCompletedMinutes % 60}m
            </p>
          </div>
          <div>
            <p className="text-muted-foreground mb-1">Tasks Completed</p>
            <p className="text-lg font-semibold">
              {todayCompleted.length}/{todayTasks.length || 0}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground mb-1">Focus Score</p>
            <p className="text-lg font-semibold">{focusScore}%</p>
          </div>
          <div>
            <p className="text-muted-foreground mb-1">Most Studied Subject</p>
            <p className="text-lg font-semibold truncate">{mostStudiedSubject}</p>
          </div>
        </div>
      </div>

      <div className="glass rounded-xl p-4">
        <h3 className="text-sm font-semibold mb-3">Weekly Productivity (hrs)</h3>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData}>
              <XAxis dataKey="label" stroke="#9ca3af" fontSize={10} />
              <YAxis stroke="#9ca3af" fontSize={10} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  borderRadius: 8,
                  border: '1px solid hsl(var(--border))',
                  fontSize: 11,
                }}
              />
              <Bar dataKey="minutes" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass rounded-xl p-4">
        <h3 className="text-sm font-semibold mb-3">Subject Distribution (hrs)</h3>
        {subjectData.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-6">
            Complete some tasks to see subject analytics.
          </p>
        ) : (
          <div className="flex items-center gap-4">
            <div className="h-40 flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={subjectData}
                    dataKey="minutes"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                  >
                    {subjectData.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#020617',
                      borderRadius: 8,
                      border: '1px solid #1f2937',
                      fontSize: 11,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="space-y-1 text-xs w-32">
              {subjectData.map((s, idx) => (
                <li key={s.name} className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 truncate">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                    />
                    <span className="truncate">{s.name}</span>
                  </span>
                  <span className="text-muted-foreground">{s.minutes}h</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;

