import { SubjectWithMastery, RevisionDueItem, getMasteryLevel } from '@/types/mastery';
import { Lightbulb, Play } from 'lucide-react';

interface Props {
  subjectsWithMastery: SubjectWithMastery[];
  revisionsDue: RevisionDueItem[];
}

const TodayRecommendation = ({ subjectsWithMastery, revisionsDue }: Props) => {
  const recs: Array<{ subject: string; topic: string; reason: string; priority: 'high' | 'medium' | 'low'; score: number }> = [];

  revisionsDue.forEach(({ topic, subject, mastery }) => {
    const score = mastery?.score ?? 0;
    recs.push({ subject: subject?.name ?? 'General', topic: topic.name,
      reason: score < 50 ? 'Low mastery + revision due' : 'Revision is due', priority: 'high', score });
  });

  subjectsWithMastery.forEach(({ subject, topics }) => {
    topics.forEach(({ topic, mastery }) => {
      const score = mastery?.score ?? 0;
      if (score > 0 && score < 50 && !revisionsDue.find(r => r.topic.id === topic.id)) {
        recs.push({ subject: subject.name, topic: topic.name, reason: 'Low mastery', priority: 'medium', score });
      }
      if (!mastery) {
        recs.push({ subject: subject.name, topic: topic.name, reason: 'Not yet studied', priority: 'medium', score: 0 });
      }
    });
  });

  const top3 = recs.slice(0, 3);
  const pColor = { high: 'border-l-red-400', medium: 'border-l-amber-400', low: 'border-l-green-400' };

  return (
    <div className="glass rounded-xl p-4">
      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
        <Lightbulb className="w-4 h-4 text-[#D97706]" /> What should I study now?
      </h3>
      {top3.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-4">Add subjects and topics to get recommendations.</p>
      ) : (
        <div className="space-y-2">
          {top3.map((r, i) => {
            const level = getMasteryLevel(r.score);
            return (
              <div key={i} className={`rounded-lg bg-secondary/30 border border-border/30 border-l-2 ${pColor[r.priority]} p-3`}>
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-xs font-medium">{r.subject} — {r.topic}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{r.reason}</p>
                  </div>
                  {r.score > 0 && <span className="text-[10px] font-semibold shrink-0" style={{color:level.color}}>{r.score}%</span>}
                </div>
              </div>
            );
          })}
          {recs.length > 3 && <p className="text-[10px] text-muted-foreground text-center">+{recs.length - 3} more</p>}
        </div>
      )}
    </div>
  );
};
export default TodayRecommendation;
