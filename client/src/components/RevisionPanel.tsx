import { useState } from 'react';
import { RevisionDueItem, PerformanceRating, getMasteryLevel } from '@/types/mastery';
import { RefreshCw, Clock, AlertTriangle, BookOpen } from 'lucide-react';
import RevisionQuiz from './RevisionQuiz';

interface Props {
  revisionsDue: RevisionDueItem[];
  onProcessRevision: (p: { topicId: string; rating: PerformanceRating }) => void;
  isProcessing: boolean;
}

const rc: Record<PerformanceRating, { label: string; color: string; bg: string }> = {
  again: { label: 'Again', color: 'text-red-400', bg: 'bg-red-500/15 border-red-500/30 hover:bg-red-500/25' },
  hard: { label: 'Hard', color: 'text-amber-400', bg: 'bg-amber-500/15 border-amber-500/30 hover:bg-amber-500/25' },
  good: { label: 'Good', color: 'text-green-400', bg: 'bg-green-500/15 border-green-500/30 hover:bg-green-500/25' },
  easy: { label: 'Easy', color: 'text-emerald-300', bg: 'bg-emerald-500/15 border-emerald-500/30 hover:bg-emerald-500/25' },
};

const RevisionPanel = ({ revisionsDue, onProcessRevision, isProcessing }: Props) => {
  const [active, setActive] = useState<string | null>(null);
  const [quizTopic, setQuizTopic] = useState<{topicId:string;topicName:string;subjectName:string;mastery:number} | null>(null);

  return (
    <>
    <div className="glass rounded-xl p-4">
      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
        <RefreshCw className="w-4 h-4 text-[#C084FC]" />
        Revision Due
        {revisionsDue.length > 0 && (
          <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-[#7C3AED]/15 text-[#7C3AED] font-semibold">
            {revisionsDue.length} topic{revisionsDue.length > 1 ? 's' : ''}
          </span>
        )}
      </h3>
      {revisionsDue.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-xs text-muted-foreground">All caught up! No revisions due.</p>
          <p className="text-[10px] text-muted-foreground/60 mt-1">Complete study sessions to schedule revisions.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {revisionsDue.map(({ topic, subject, mastery, revision, daysOverdue }) => {
            const score = mastery?.score ?? 0;
            const level = getMasteryLevel(score);
            return (
              <div key={topic.id} className="rounded-lg bg-secondary/30 border border-border/30 p-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate">{topic.name}</p>
                    <p className="text-[10px] text-muted-foreground">{subject?.name ?? 'General'}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-semibold" style={{color:level.color}}>{score}%</span>
                    {daysOverdue > 0 && (
                      <span className="text-[10px] text-red-400 font-medium flex items-center gap-0.5">
                        <AlertTriangle className="w-3 h-3" /> {daysOverdue}d late
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    Reviews: {revision.revisionCount}
                  </div>
                  {active !== topic.id ? (
                    <div className="flex gap-1.5">
                      <button onClick={() => setActive(topic.id)}
                        className="text-[10px] font-semibold px-2.5 py-1 rounded-md bg-gradient-to-r from-[#7C3AED] to-[#C084FC] text-white hover:opacity-90 transition-opacity">
                        Start Revision
                      </button>
                      <button onClick={() => setQuizTopic({topicId:topic.id,topicName:topic.name,subjectName:subject?.name??'General',mastery:score})}
                        className="text-[10px] font-semibold px-2 py-1 rounded-md bg-secondary text-[#C084FC] border border-[#7C3AED]/40 hover:bg-secondary/80 transition-colors flex items-center gap-1">
                        <BookOpen className="w-3 h-3" /> Quiz
                      </button>
                    </div>
                  ) : null}
                </div>
                {active === topic.id && (
                  <div className="mt-3 pt-2 border-t border-border/30">
                    <p className="text-[10px] text-muted-foreground mb-2">How well did you remember?</p>
                    <div className="grid grid-cols-4 gap-1.5">
                      {(Object.keys(rc) as PerformanceRating[]).map(rating => (
                        <button key={rating} onClick={() => { onProcessRevision({topicId:topic.id, rating}); setActive(null); }} disabled={isProcessing}
                          className={`px-1.5 py-1.5 rounded-md text-[10px] font-semibold border transition-colors disabled:opacity-50 ${rc[rating].bg}`}>
                          <span className={rc[rating].color}>{rc[rating].label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
      {quizTopic && (
        <RevisionQuiz
          topicId={quizTopic.topicId}
          topicName={quizTopic.topicName}
          subjectName={quizTopic.subjectName}
          currentMastery={quizTopic.mastery}
          onClose={() => setQuizTopic(null)}
          onComplete={() => setQuizTopic(null)}
        />
      )}
    </>
  );
};

export default RevisionPanel;
