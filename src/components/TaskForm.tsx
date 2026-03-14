import { useState } from 'react';
import { StudyTask, Priority } from '@/types/study';
import { X } from 'lucide-react';
import CircularTimePicker from './CircularTimePicker';
interface TaskFormProps {
  onSubmit: (task: StudyTask) => void;
  onClose: () => void;
  editTask?: StudyTask | null;
}

const TaskForm = ({ onSubmit, onClose, editTask }: TaskFormProps) => {
  const [title, setTitle] = useState(editTask?.title || '');
  const [subject, setSubject] = useState(editTask?.subject || '');
  const [priority, setPriority] = useState<Priority>(editTask?.priority || 'medium');
  const [estimatedMinutes, setEstimatedMinutes] = useState(editTask?.estimatedMinutes || 30);
  const [deadline, setDeadline] = useState(editTask?.deadline ? new Date(editTask.deadline).toISOString().slice(0, 16) : '');
  const [scheduledDate, setScheduledDate] = useState(editTask?.scheduledDate || new Date().toISOString().slice(0, 10));
  const [scheduledHour, setScheduledHour] = useState(editTask?.scheduledHour ?? 9);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !subject || !deadline) return;

    const task: StudyTask = {
      id: editTask?.id || '',
      title,
      subject,
      priority,
      estimatedMinutes,
      deadline: new Date(deadline).toISOString(),
      scheduledDate,
      scheduledHour,
      completed: editTask?.completed || false,
      createdAt: editTask?.createdAt || new Date().toISOString(),
    };
    onSubmit(task);
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass rounded-xl w-full max-w-md shadow-card">
        <div className="flex items-center justify-between p-5 border-b border-border/50">
          <h2 className="text-lg font-semibold">{editTask ? 'Edit Task' : 'New Study Task'}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Task Title</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g., Review Chapter 5"
              className="w-full bg-secondary rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground border border-border/50 focus:border-primary/50 focus:outline-none transition-colors"
              required
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Subject</label>
            <input
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="e.g., Mathematics"
              className="w-full bg-secondary rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground border border-border/50 focus:border-primary/50 focus:outline-none transition-colors"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Priority</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as Priority)}
                className="w-full bg-secondary rounded-lg px-3 py-2.5 text-sm text-foreground border border-border/50 focus:border-primary/50 focus:outline-none transition-colors"
              >
                <option value="high">🔴 High</option>
                <option value="medium">🟡 Medium</option>
                <option value="low">🟢 Low</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Est. Time (min)</label>
              <input
                type="number"
                min="1"
                value={estimatedMinutes}
                onChange={e => setEstimatedMinutes(Number(e.target.value))}
                className="w-full bg-secondary rounded-lg px-3 py-2.5 text-sm text-foreground border border-border/50 focus:border-primary/50 focus:outline-none transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Deadline</label>
            <input
              type="datetime-local"
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
              className="w-full bg-secondary rounded-lg px-3 py-2.5 text-sm text-foreground border border-border/50 focus:border-primary/50 focus:outline-none transition-colors"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Scheduled Date</label>
              <input
                type="date"
                value={scheduledDate}
                onChange={e => setScheduledDate(e.target.value)}
                className="w-full bg-secondary rounded-lg px-3 py-2.5 text-sm text-foreground border border-border/50 focus:border-primary/50 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Time Slot</label>
              <CircularTimePicker
                hour={scheduledHour}
                minute={0}
                onChange={(h) => setScheduledHour(h)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-primary text-primary-foreground rounded-lg py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity glow-primary"
          >
            {editTask ? 'Update Task' : 'Add Task'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;
