import { useState } from 'react';
import { generateQuestions, evaluateAnswer, AiQuestions, AiAnswerEvaluation } from '@/services/aiService';
import { recordMasteryFromRating } from '@/services/masteryService';
import { useAuth } from '@/contexts/AuthContext';
import { PerformanceRating } from '@/types/mastery';
import { X, Send, CheckCircle2, AlertCircle, Award } from 'lucide-react';
import { toast } from 'sonner';

interface RevisionQuizProps {
  topicId: string;
  topicName: string;
  subjectName: string;
  currentMastery: number;
  onClose: () => void;
  onComplete: () => void;
}

const RevisionQuiz = ({ topicId, topicName, subjectName, currentMastery, onClose, onComplete }: RevisionQuizProps) => {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<AiQuestions | null>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answer, setAnswer] = useState('');
  const [evaluation, setEvaluation] = useState<AiAnswerEvaluation | null>(null);
  const [scores, setScores] = useState<number[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [loadingEval, setLoadingEval] = useState(false);
  const [finished, setFinished] = useState(false);

  const handleGenerate = async () => {
    setLoadingQuestions(true);
    try {
      const result = await generateQuestions({ topic: topicName, difficulty: 'medium' });
      setQuestions(result);
    } catch (err: any) { toast.error(err.message || 'Failed to generate questions'); }
    finally { setLoadingQuestions(false); }
  };

  const handleEvaluate = async () => {
    if (!answer.trim() || !questions) return;
    setLoadingEval(true);
    try {
      const result = await evaluateAnswer({ question: questions.questions[currentQ], answer: answer.trim(), topic: topicName });
      setEvaluation(result);
      setScores(prev => [...prev, result.score]);
    } catch (err: any) { toast.error(err.message || 'Failed to evaluate'); }
    finally { setLoadingEval(false); }
  };

  const handleNext = async () => {
    if (!questions) return;
    setEvaluation(null); setAnswer('');
    if (currentQ + 1 >= questions.questions.length) {
      const avg = scores.length > 0 ? Math.round(scores.reduce((a,b)=>a+b,0)/scores.length) : 0;
      const rating: PerformanceRating = avg >= 80 ? 'easy' : avg >= 60 ? 'good' : avg >= 40 ? 'hard' : 'again';
      if (user?.id) {
        try { await recordMasteryFromRating(topicId, user.id, rating, avg >= 50, avg); toast.success('Quiz complete! Mastery updated.'); }
        catch { toast.error('Failed to update mastery'); }
      }
      setFinished(true); onComplete();
    } else { setCurrentQ(currentQ + 1); }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass rounded-xl w-full max-w-lg shadow-card max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <div>
            <h2 className="text-sm font-semibold">Practice Quiz</h2>
            <p className="text-[10px] text-muted-foreground">{subjectName} - {topicName} | Mastery: {currentMastery}%</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <div className="flex-1 overflow-auto p-4">
          {!questions && !loadingQuestions && (
            <div className="text-center py-8">
              <Award className="w-10 h-10 text-[#7C3AED] mx-auto mb-3" />
              <p className="text-sm font-medium mb-1">Ready to test your knowledge?</p>
              <p className="text-xs text-muted-foreground mb-4">Generate 5 practice questions for this topic.</p>
              <button onClick={handleGenerate} className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#7C3AED] to-[#C084FC] text-white text-xs font-semibold hover:opacity-90 transition-opacity">Generate Questions</button>
            </div>
          )}
          {loadingQuestions && <div className="text-center py-8"><p className="text-xs text-muted-foreground animate-pulse">Generating questions...</p></div>}
          {questions && !finished && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-[#7C3AED] rounded-full transition-all" style={{width:`${((currentQ + (evaluation ? 1 : 0)) / questions.questions.length) * 100}%`}} />
                </div>
                <span className="text-[10px] text-muted-foreground">{currentQ + 1}/{questions.questions.length}</span>
              </div>
              <div className="rounded-lg bg-secondary/30 border border-border/30 p-4">
                <p className="text-xs font-semibold mb-3">Q{currentQ + 1}: {questions.questions[currentQ]}</p>
                <textarea value={answer} onChange={e => setAnswer(e.target.value)} placeholder="Type your answer..."
                  className="w-full bg-background/40 rounded-lg px-3 py-2 text-xs border border-border/50 outline-none focus:border-primary/60 resize-none h-24"
                  disabled={!!evaluation} />
                {!evaluation && (
                  <button onClick={handleEvaluate} disabled={!answer.trim() || loadingEval}
                    className="mt-2 px-3 py-1.5 rounded-lg bg-[#7C3AED] text-white text-xs font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center gap-1.5">
                    {loadingEval ? 'Evaluating...' : <><Send className="w-3 h-3" /> Submit Answer</>}
                  </button>
                )}
              </div>
              {evaluation && (
                <div className="rounded-lg bg-secondary/30 border border-border/30 p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold" style={{color:evaluation.score>=70?'#22C55E':evaluation.score>=40?'#EAB308':'#EF4444'}}>{evaluation.score}%</span>
                    <span className="text-xs font-medium">{evaluation.feedback}</span>
                  </div>
                  {evaluation.strengths.length > 0 && <div className="flex items-start gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-green-400 mt-0.5 shrink-0" /><p className="text-[10px] text-muted-foreground">{evaluation.strengths.join('. ')}</p></div>}
                  {evaluation.improvements.length > 0 && <div className="flex items-start gap-1.5"><AlertCircle className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" /><p className="text-[10px] text-muted-foreground">{evaluation.improvements.join('. ')}</p></div>}
                  <button onClick={handleNext} className="w-full mt-2 px-3 py-1.5 rounded-lg bg-secondary text-foreground text-xs font-semibold hover:bg-secondary/80 transition-colors">
                    {currentQ + 1 >= questions.questions.length ? 'Finish Quiz' : 'Next Question'}
                  </button>
                </div>
              )}
            </div>
          )}
          {finished && (
            <div className="text-center py-8">
              <Award className="w-12 h-12 text-[#22C55E] mx-auto mb-3" />
              <p className="text-lg font-bold mb-1">Quiz Complete!</p>
              <p className="text-xs text-muted-foreground mb-3">Average score: {scores.length > 0 ? Math.round(scores.reduce((a,b)=>a+b,0)/scores.length) : 0}%</p>
              <p className="text-[10px] text-muted-foreground mb-4">Your mastery score has been updated based on your performance.</p>
              <button onClick={onClose} className="px-4 py-2 rounded-lg bg-[#7C3AED] text-white text-xs font-semibold hover:opacity-90 transition-opacity">Done</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RevisionQuiz;

