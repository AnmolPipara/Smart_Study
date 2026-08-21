import { useState } from 'react';
import { generateStudyPlan, AiStudyPlan } from '@/services/aiService';
import { X } from 'lucide-react';
import { toast } from 'sonner';

interface AiPlannerDialogProps {
  open: boolean;
  onClose: () => void;
}

const AiPlannerDialog = ({ open, onClose }: AiPlannerDialogProps) => {
  const [examName, setExamName] = useState('');
  const [planDays, setPlanDays] = useState('10');
  const [subjects, setSubjects] = useState('');
  const [topics, setTopics] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<AiStudyPlan | null>(null);

  if (!open) return null;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    const daysNum = Number(planDays);
    if (!examName || !daysNum || daysNum <= 0) {
      toast.error('Please enter exam name and a valid number of days');
      return;
    }
    setLoading(true);
    setPlan(null);
    try {
      const result = await generateStudyPlan({
        examName,
        days: daysNum,
        subjects,
        topics,
        difficulty,
      });
      setPlan(result);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to generate plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass rounded-xl w-full max-w-2xl shadow-card max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-border/50">
          <div>
            <h2 className="text-lg font-semibold">AI Auto Study Planner</h2>
            <p className="text-xs text-muted-foreground mt-1">
              Describe your exam and let AI generate a day-by-day plan.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1.1fr_1.2fr] gap-4 p-5 overflow-hidden">
          <form onSubmit={handleGenerate} className="space-y-3 md:pr-3 border-b md:border-b-0 md:border-r border-border/40 pb-4 md:pb-0">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Exam name
              </label>
              <input
                value={examName}
                onChange={(e) => setExamName(e.target.value)}
                placeholder="Operating Systems Midterm"
                className="w-full bg-secondary rounded-lg px-3 py-2.5 text-xs border border-border/50 focus:border-primary/60 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Number of days
                </label>
                <input
                  type="number"
                  min={1}
                  value={planDays}
                  onChange={(e) => setPlanDays(e.target.value)}
                  className="w-full bg-secondary rounded-lg px-3 py-2.5 text-xs border border-border/50 focus:border-primary/60 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Difficulty
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
                  className="w-full bg-secondary rounded-lg px-3 py-2.5 text-xs border border-border/50 focus:border-primary/60 focus:outline-none"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Subjects (comma separated)
              </label>
              <input
                value={subjects}
                onChange={(e) => setSubjects(e.target.value)}
                placeholder="Operating Systems, DBMS, Computer Networks"
                className="w-full bg-secondary rounded-lg px-3 py-2.5 text-xs border border-border/50 focus:border-primary/60 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Topics / chapters
              </label>
              <textarea
                value={topics}
                onChange={(e) => setTopics(e.target.value)}
                placeholder="Deadlock, Banker Algorithm, CPU Scheduling, Memory Management, ..."
                rows={4}
                className="w-full bg-secondary rounded-lg px-3 py-2.5 text-xs border border-border/50 focus:border-primary/60 focus:outline-none resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground rounded-lg py-2.5 text-xs font-semibold hover:opacity-90 transition-opacity glow-primary disabled:opacity-60"
            >
              {loading ? 'Generating plan...' : 'Generate Study Plan'}
            </button>
          </form>

          <div className="flex flex-col min-h-0">
            <h3 className="text-xs font-semibold mb-2">AI Plan</h3>
            <div className="flex-1 rounded-lg bg-secondary/40 border border-border/40 p-3 overflow-auto text-xs space-y-2">
              {!plan && !loading && (
                <p className="text-muted-foreground">
                  Your generated day-by-day plan will appear here. You can then use it to create tasks.
                </p>
              )}
              {loading && (
                <p className="text-muted-foreground">Thinking through your study schedule...</p>
              )}
              {plan && (
                <div className="space-y-2">
                  <p className="text-[11px] text-muted-foreground">
                    Exam: <span className="font-semibold text-foreground">{plan.exam}</span> • Days:{' '}
                    <span className="font-semibold text-foreground">{plan.days.length}</span>
                  </p>
                  <div className="space-y-1.5">
                    {plan.days.map((day, index) => (
                      <div
                        key={`${day.day}-${index}`}
                        className="rounded-md bg-background/40 border border-border/40 px-2.5 py-2"
                      >
                        <p className="text-[11px] font-semibold text-primary mb-0.5">
                          Day {index + 1} — {day.title}
                        </p>
                        {day.topics.length > 0 && (
                          <ul className="list-disc list-inside text-[11px] text-muted-foreground space-y-0.5">
                            {day.topics.map((t) => (
                              <li key={t}>{t}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <p className="mt-2 text-[10px] text-muted-foreground">
              Tip: Use this as a high-level plan. You can convert each day into concrete tasks with
              time estimates and deadlines.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiPlannerDialog;

