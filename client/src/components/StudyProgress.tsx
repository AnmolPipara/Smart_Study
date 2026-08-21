import { StudyTask } from '@/types/study';
import { CheckCircle2, Clock, Target, TrendingUp } from 'lucide-react';

interface StudyProgressProps {
  tasks: StudyTask[];
}

const StudyProgress = ({ tasks }: StudyProgressProps) => {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const totalMinutes = tasks.reduce((sum, t) => sum + t.estimatedMinutes, 0);
  const completedMinutes = tasks.filter(t => t.completed).reduce((sum, t) => sum + t.estimatedMinutes, 0);
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const stats = [
    {
      icon: Target,
      label: 'Total Tasks',
      value: total,
      color: 'text-blue-600',
    },
    {
      icon: CheckCircle2,
      label: 'Completed',
      value: completed,
      color: 'text-[#22C55E]',
    },
    {
      icon: Clock,
      label: 'Study Time',
      value: `${Math.round(totalMinutes / 60)}h`,
      color: 'text-[#D97706]',
    },
    {
      icon: TrendingUp,
      label: 'Progress',
      value: `${completionRate}%`,
      color: 'text-blue-400',
    },
  ];

  return (
    <div className="glass rounded-xl p-4">
      <h3 className="text-sm font-semibold mb-3">Study Progress</h3>
      
      {/* Progress bar */}
      <div className="h-2 bg-secondary rounded-full mb-4 overflow-hidden">
        <div
          className="h-full bg-blue-600 rounded-full transition-all duration-500"
          style={{ width: `${completionRate}%` }}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {stats.map(stat => (
          <div key={stat.label} className="bg-secondary/50 rounded-lg p-3">
            <stat.icon className={`w-4 h-4 ${stat.color} mb-1.5`} />
            <p className="text-lg font-bold">{stat.value}</p>
            <p className="text-[10px] text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudyProgress;
