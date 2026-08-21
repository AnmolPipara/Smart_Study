import { useState } from 'react';
import { SubjectWithMastery } from '@/types/mastery';
import { getMasteryLevel, getMasteryBarColor } from '@/types/mastery';
import { Plus, Trash2, ChevronDown, ChevronRight, Target } from 'lucide-react';

interface Props {
  subjectsWithMastery: SubjectWithMastery[];
  onAddSubject: (name: string) => void;
  onAddTopic: (p: { name: string; subjectId: string }) => void;
  onRemoveSubject: (id: string) => void;
  onRemoveTopic: (id: string) => void;
  loading: boolean;
}

const MasteryPanel = ({ subjectsWithMastery, onAddSubject, onAddTopic, onRemoveSubject, onRemoveTopic, loading }: Props) => {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [newSubject, setNewSubject] = useState('');
  const [newTopic, setNewTopic] = useState('');
  const [addingTo, setAddingTo] = useState<string | null>(null);

  const totalTopics = subjectsWithMastery.reduce((s, x) => s + x.topics.length, 0);
  const totalScored = subjectsWithMastery.reduce((s, x) => s + x.topics.filter(t => t.mastery).length, 0);
  const avgScore = totalScored > 0 ? Math.round(subjectsWithMastery.reduce((s, x) => s + x.topics.reduce((ts, t) => ts + (t.mastery?.score ?? 0), 0), 0) / totalScored) : 0;

  if (loading) return (
    <div className="glass rounded-xl p-4">
      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><Target className="w-4 h-4 text-[#7C3AED]" /> Topic Mastery</h3>
      <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-8 bg-secondary/50 rounded-lg animate-pulse" />)}</div>
    </div>
  );

  return (
    <div className="glass rounded-xl p-4">
      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
        <Target className="w-4 h-4 text-[#7C3AED]" /> Topic Mastery
      </h3>
      <div className="grid grid-cols-3 gap-2 mb-4 text-center">
        <div className="bg-secondary/50 rounded-lg p-2">
          <p className="text-lg font-bold">{subjectsWithMastery.length}</p>
          <p className="text-[10px] text-muted-foreground">Subjects</p>
        </div>
        <div className="bg-secondary/50 rounded-lg p-2">
          <p className="text-lg font-bold">{totalTopics}</p>
          <p className="text-[10px] text-muted-foreground">Topics</p>
        </div>
        <div className="bg-secondary/50 rounded-lg p-2">
          <p className="text-lg font-bold">{avgScore}%</p>
          <p className="text-[10px] text-muted-foreground">Avg Mastery</p>
        </div>
      </div>
      <div className="flex gap-1.5 mb-3">
        <input value={newSubject} onChange={e => setNewSubject(e.target.value)} placeholder="New subject..."
          onKeyDown={e => e.key === 'Enter' && newSubject.trim() && (onAddSubject(newSubject.trim()), setNewSubject(''))}
          className="flex-1 bg-secondary/50 rounded-md px-2 py-1.5 text-xs border border-border/50 outline-none focus:border-primary/60" />
        <button onClick={() => { if (newSubject.trim()) { onAddSubject(newSubject.trim()); setNewSubject(''); } }}
          className="px-2 py-1.5 rounded-md bg-[#7C3AED]/15 text-[#7C3AED] hover:bg-[#7C3AED]/25 transition-colors">
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
      {subjectsWithMastery.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-4">Add subjects and topics to start tracking mastery.</p>
      ) : (
        <div className="space-y-2">
          {subjectsWithMastery.map(({ subject, topics, overallScore }) => {
            const isExp = expanded === subject.id;
            const lvl = getMasteryLevel(overallScore);
            return (
              <div key={subject.id} className="rounded-lg bg-secondary/30 border border-border/30 overflow-hidden group">
                <div className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-secondary/40 transition-colors"
                  onClick={() => setExpanded(isExp ? null : subject.id)}>
                  <div className="flex items-center gap-2 min-w-0">
                    {isExp ? <ChevronDown className="w-3.5 h-3.5 shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 shrink-0" />}
                    <span className="text-xs font-medium truncate">{subject.name}</span>
                    <span className="text-[10px] text-muted-foreground">({topics.length})</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-bold" style={{color:lvl.color}}>{overallScore}%</span>
                    <button onClick={e => { e.stopPropagation(); onRemoveSubject(subject.id); }}
                      className="p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-red-500/20 text-red-400 transition-all">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                {isExp && (
                  <div className="px-3 pb-2 space-y-1.5">
                    <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${getMasteryBarColor(overallScore)}`} style={{width:`${overallScore}%`}} />
                    </div>
                    {topics.map(({ topic, mastery }) => {
                      const sc = mastery?.score ?? 0;
                      const tl = getMasteryLevel(sc);
                      return (
                        <div key={topic.id} className="flex items-center justify-between px-2 py-1 rounded-md hover:bg-secondary/40 group/t">
                          <span className="text-[11px] text-muted-foreground truncate">{topic.name}</span>
                          <div className="flex items-center gap-2 shrink-0">
                            <div className="w-16 h-1 bg-secondary rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${getMasteryBarColor(sc)}`} style={{width:`${sc}%`}} />
                            </div>
                            <span className="text-[10px] font-semibold w-8 text-right" style={{color:tl.color}}>{sc}%</span>
                            <button onClick={() => onRemoveTopic(topic.id)}
                              className="opacity-0 group-hover/t:opacity-100 p-0.5 hover:bg-red-500/20 rounded text-red-400 transition-all">
                              <Trash2 className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    {addingTo === subject.id ? (
                      <div className="flex gap-1 mt-1">
                        <input value={newTopic} onChange={e => setNewTopic(e.target.value)} placeholder="Topic name..." autoFocus
                          onKeyDown={e => e.key === 'Enter' && newTopic.trim() && (onAddTopic({name:newTopic.trim(),subjectId:subject.id}), setNewTopic(''), setAddingTo(null))}
                          className="flex-1 bg-background/40 rounded px-2 py-1 text-[11px] border border-border/50 outline-none" />
                        <button onClick={() => { if (newTopic.trim()) { onAddTopic({name:newTopic.trim(),subjectId:subject.id}); setNewTopic(''); setAddingTo(null); } }}
                          className="px-2 py-1 rounded bg-[#7C3AED]/20 text-[#7C3AED] text-[11px]">Add</button>
                        <button onClick={() => { setAddingTo(null); setNewTopic(''); }}
                          className="px-2 py-1 rounded text-muted-foreground text-[11px]">X</button>
                      </div>
                    ) : (
                      <button onClick={() => setAddingTo(subject.id)}
                        className="text-[11px] text-[#7C3AED] hover:text-[#C084FC] flex items-center gap-1 mt-1">
                        <Plus className="w-3 h-3" /> Add topic
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
export default MasteryPanel;
