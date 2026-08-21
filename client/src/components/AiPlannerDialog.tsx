import { useState, useRef, useEffect, useMemo } from 'react';
import { generateStudyPlan, AiStudyPlan } from '@/services/aiService';
import { useMastery } from '@/hooks/useMastery';
import { X, ChevronDown, Check } from 'lucide-react';
import { toast } from 'sonner';

interface AiPlannerDialogProps {
  open: boolean;
  onClose: () => void;
}

const AiPlannerDialog = ({ open, onClose }: AiPlannerDialogProps) => {
  const { subjectsWithMastery, revisionsDue } = useMastery();
  const [examName, setExamName] = useState('');
  const [planDays, setPlanDays] = useState('10');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [subjectDropOpen, setSubjectDropOpen] = useState(false);
  const [topicDropOpen, setTopicDropOpen] = useState(false);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<AiStudyPlan | null>(null);
  const subjectRef = useRef<HTMLDivElement>(null);
  const topicRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (subjectRef.current && !subjectRef.current.contains(e.target as Node)) setSubjectDropOpen(false);
      if (topicRef.current && !topicRef.current.contains(e.target as Node)) setTopicDropOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Get topics for selected subjects
  const topicsForSelectedSubjects = useMemo(() => {
    if (selectedSubjects.length === 0) return [];
    const result: { name: string; subjectName: string; mastery: number }[] = [];
    subjectsWithMastery.forEach(({ subject, topics }) => {
      if (selectedSubjects.includes(subject.name)) {
        topics.forEach(({ topic, mastery }) => {
          result.push({ name: topic.name, subjectName: subject.name, mastery: mastery?.score ?? 0 });
        });
      }
    });
    return result;
  }, [selectedSubjects, subjectsWithMastery]);

  // Clear topics when subjects change if they're no longer valid
  useEffect(() => {
    const validNames = new Set(topicsForSelectedSubjects.map(t => t.name));
    setSelectedTopics(prev => prev.filter(t => validNames.has(t)));
  }, [topicsForSelectedSubjects]);

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
      const subjectNames = selectedSubjects.join(', ');
      const topicNames = selectedTopics.join(', ');
      const result = await generateStudyPlan({
        examName,
        days: daysNum,
        subjects: subjectNames,
        topics: topicNames,
        difficulty,
        masteryData: subjectsWithMastery,
        revisionsDue: revisionsDue.length,
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

            <div ref={subjectRef} className="relative">
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Subjects {subjectsWithMastery.length > 0 ? '(from mastery)' : ''}
              </label>
              <button
                type="button"
                onClick={() => setSubjectDropOpen(!subjectDropOpen)}
                className="w-full bg-secondary rounded-lg px-3 py-2.5 text-xs border border-border/50 focus:border-primary/60 focus:outline-none flex items-center justify-between"
              >
                <span className={selectedSubjects.length === 0 ? 'text-muted-foreground' : ''}>
                  {selectedSubjects.length === 0
                    ? 'Select subjects...'
                    : `${selectedSubjects.length} selected`}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${subjectDropOpen ? 'rotate-180' : ''}`} />
              </button>
              {subjectDropOpen && (
                <div className="absolute z-50 mt-1 w-full bg-secondary border border-border/60 rounded-lg shadow-lg max-h-48 overflow-auto">
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedSubjects.length === subjectsWithMastery.length) {
                        setSelectedSubjects([]);
                      } else {
                        setSelectedSubjects(subjectsWithMastery.map(s => s.subject.name));
                      }
                    }}
                    className="w-full px-3 py-2 text-xs text-left hover:bg-primary/10 flex items-center gap-2 border-b border-border/40 font-semibold text-primary"
                  >
                    <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${selectedSubjects.length === subjectsWithMastery.length && subjectsWithMastery.length > 0 ? 'bg-primary border-primary' : 'border-muted-foreground/50'}`}>
                      {selectedSubjects.length === subjectsWithMastery.length && subjectsWithMastery.length > 0 && <Check className="w-2.5 h-2.5 text-white" />}
                    </div>
                    Select All
                  </button>
                  {subjectsWithMastery.map(({ subject, overallScore }) => {
                    const isSelected = selectedSubjects.includes(subject.name);
                    return (
                      <button
                        key={subject.id}
                        type="button"
                        onClick={() => {
                          setSelectedSubjects(prev =>
                            isSelected ? prev.filter(s => s !== subject.name) : [...prev, subject.name]
                          );
                        }}
                        className="w-full px-3 py-2 text-xs text-left hover:bg-primary/10 flex items-center gap-2"
                      >
                        <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${isSelected ? 'bg-primary border-primary' : 'border-muted-foreground/50'}`}>
                          {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                        </div>
                        <span className="flex-1 truncate">{subject.name}</span>
                        <span className="text-[10px] text-muted-foreground">{overallScore}%</span>
                      </button>
                    );
                  })}
                  {subjectsWithMastery.length === 0 && (
                    <p className="px-3 py-2 text-[10px] text-muted-foreground/70">
                      Add subjects in Mastery section first.
                    </p>
                  )}
                </div>
              )}
              {selectedSubjects.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {selectedSubjects.map(name => (
                    <span key={name} className="px-1.5 py-0.5 rounded bg-primary/15 text-primary text-[10px] font-medium flex items-center gap-1">
                      {name}
                      <button type="button" onClick={() => setSelectedSubjects(prev => prev.filter(s => s !== name))} className="hover:text-white">×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div ref={topicRef} className="relative">
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Topics {selectedSubjects.length > 0 ? `(${topicsForSelectedSubjects.length} available)` : '(select subjects first)'}
              </label>
              <button
                type="button"
                onClick={() => setTopicDropOpen(!topicDropOpen)}
                disabled={topicsForSelectedSubjects.length === 0}
                className="w-full bg-secondary rounded-lg px-3 py-2.5 text-xs border border-border/50 focus:border-primary/60 focus:outline-none flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className={selectedTopics.length === 0 ? 'text-muted-foreground' : ''}>
                  {selectedTopics.length === 0
                    ? 'Select topics...'
                    : `${selectedTopics.length} selected`}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${topicDropOpen ? 'rotate-180' : ''}`} />
              </button>
              {topicDropOpen && topicsForSelectedSubjects.length > 0 && (
                <div className="absolute z-50 mt-1 w-full bg-secondary border border-border/60 rounded-lg shadow-lg max-h-48 overflow-auto">
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedTopics.length === topicsForSelectedSubjects.length) {
                        setSelectedTopics([]);
                      } else {
                        setSelectedTopics(topicsForSelectedSubjects.map(t => t.name));
                      }
                    }}
                    className="w-full px-3 py-2 text-xs text-left hover:bg-primary/10 flex items-center gap-2 border-b border-border/40 font-semibold text-primary"
                  >
                    <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${selectedTopics.length === topicsForSelectedSubjects.length && topicsForSelectedSubjects.length > 0 ? 'bg-blue-600 border-blue-600' : 'border-muted-foreground/50'}`}>
                      {selectedTopics.length === topicsForSelectedSubjects.length && topicsForSelectedSubjects.length > 0 && <Check className="w-2.5 h-2.5 text-white" />}
                    </div>
                    Select All
                  </button>
                  {topicsForSelectedSubjects.map(({ name, subjectName, mastery }) => {
                    const isSelected = selectedTopics.includes(name);
                    return (
                      <button
                        key={`${subjectName}-${name}`}
                        type="button"
                        onClick={() => {
                          setSelectedTopics(prev =>
                            isSelected ? prev.filter(t => t !== name) : [...prev, name]
                          );
                        }}
                        className="w-full px-3 py-2 text-xs text-left hover:bg-primary/10 flex items-center gap-2"
                      >
                        <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${isSelected ? 'bg-primary border-primary' : 'border-muted-foreground/50'}`}>
                          {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                        </div>
                        <span className="flex-1 truncate">{name}</span>
                        <span className="text-[10px] text-muted-foreground">{mastery}%</span>
                      </button>
                    );
                  })}
                </div>
              )}
              {selectedTopics.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {selectedTopics.map(name => (
                    <span key={name} className="px-1.5 py-0.5 rounded bg-green-500/15 text-green-400 text-[10px] font-medium flex items-center gap-1">
                      {name}
                      <button type="button" onClick={() => setSelectedTopics(prev => prev.filter(t => t !== name))} className="hover:text-white">×</button>
                    </span>
                  ))}
                </div>
              )}
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
              <div className="rounded-md bg-primary/10 border border-primary/30 px-2.5 py-2 mb-2">
                <p className="text-[11px] font-semibold text-primary mb-0.5">\u2139\ufe0f Mastery-aware plan</p>
                <p className="text-[10px] text-muted-foreground">
                  AI will prioritize weak topics and schedule revisions for due topics.
                </p>
              </div>
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

