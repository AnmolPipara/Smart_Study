import { useState, useEffect, useRef } from 'react';
import { StudyNote } from '@/types/study';
import { Bold, Code2, Heading, Image as ImageIcon, Italic, Sparkles, HelpCircle, FileText, ListOrdered } from 'lucide-react';
import { generateQuestions, summarizeNoteContent, AiNoteSummary, AiQuestions } from '@/services/aiService';
import { toast } from 'sonner';

interface NotesEditorProps {
  note: StudyNote | null;
  onChange: (note: StudyNote) => void;
}

const defaultTemplate = `# New Note

Write your study notes here in **Markdown**.

- Use bullet lists
- Add code:
\`\`\`ts
const example = true;
\`\`\`

Math (LaTeX-style) is supported conceptually, e.g. $O(n \\log n)$.
`;

const NotesEditor = ({ note, onChange }: NotesEditorProps) => {
  const [title, setTitle] = useState(note?.title ?? '');
  const [content, setContent] = useState(note?.content ?? defaultTemplate);
  const [summary, setSummary] = useState<AiNoteSummary | null>(null);
  const [questions, setQuestions] = useState<AiQuestions | null>(null);
  const [activeTab, setActiveTab] = useState<'summary' | 'questions'>('summary');
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    setTitle(note?.title ?? '');
    setContent(note?.content ?? defaultTemplate);
    setSummary(null);
    setQuestions(null);
    setTopic('');
  }, [note?.id]);

  if (!note) {
    return (
      <div className="flex-1 flex items-center justify-center text-xs text-muted-foreground">
        Select a note from the sidebar or create a new one.
      </div>
    );
  }

  const pushChange = (next: Partial<StudyNote>) => {
    onChange({
      ...note,
      ...next,
    });
  };

  const handleSummarize = async () => {
    if (!content.trim()) {
      toast.error('Add some note content first.');
      return;
    }
    setLoadingSummary(true);
    setSummary(null);
    try {
      const result = await summarizeNoteContent(content);
      setSummary(result);
      setActiveTab('summary');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to summarize note');
    } finally {
      setLoadingSummary(false);
    }
  };

  const handleGenerateQuestions = async () => {
    const topicValue = topic.trim() || title.trim();
    if (!topicValue) {
      toast.error('Enter a topic or title to base questions on.');
      return;
    }
    setLoadingQuestions(true);
    setQuestions(null);
    try {
      const result = await generateQuestions({ topic: topicValue, difficulty });
      setQuestions(result);
      setActiveTab('questions');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to generate questions');
    } finally {
      setLoadingQuestions(false);
    }
  };

  const applyInlineFormatting = (wrapper: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart ?? 0;
    const end = textarea.selectionEnd ?? 0;
    const before = content.slice(0, start);
    const selected = content.slice(start, end) || 'text';
    const after = content.slice(end);
    const updated = `${before}${wrapper}${selected}${wrapper}${after}`;
    setContent(updated);
    pushChange({ content: updated });
  };

  const applyHeading = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart ?? 0;
    const before = content.slice(0, start);
    const after = content.slice(start);
    const prefix = before.endsWith('\n') || start === 0 ? '# ' : '\n# ';
    const updated = `${before}${prefix}${after}`;
    setContent(updated);
    pushChange({ content: updated });
  };

  const applyCodeBlock = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart ?? 0;
    const end = textarea.selectionEnd ?? 0;
    const before = content.slice(0, start);
    const selected = content.slice(start, end) || 'code';
    const after = content.slice(end);
    const block = `\`\`\`\n${selected}\n\`\`\``;
    const updated = `${before}${block}${after}`;
    setContent(updated);
    pushChange({ content: updated });
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row">
      <div className="flex-1 flex flex-col border-b md:border-b-0 md:border-r border-border/40">
        <div className="px-4 py-3 border-b border-border/40 flex items-center justify-between">
        <input
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            pushChange({ title: e.target.value });
          }}
          placeholder="Note title"
          className="bg-transparent text-sm font-semibold outline-none placeholder:text-muted-foreground"
        />
        <div className="flex items-center gap-1 text-muted-foreground">
          <button className="p-1.5 rounded-md hover:bg-secondary/80" type="button" onClick={applyHeading}>
            <Heading className="w-3.5 h-3.5" />
          </button>
          <button className="p-1.5 rounded-md hover:bg-secondary/80" type="button" onClick={() => applyInlineFormatting('**')}>
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button className="p-1.5 rounded-md hover:bg-secondary/80" type="button" onClick={() => applyInlineFormatting('*')}>
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button className="p-1.5 rounded-md hover:bg-secondary/80" type="button" onClick={applyCodeBlock}>
            <Code2 className="w-3.5 h-3.5" />
          </button>
          <button className="p-1.5 rounded-md hover:bg-secondary/80" type="button">
            <ImageIcon className="w-3.5 h-3.5" />
          </button>
        </div>
        </div>
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            pushChange({ content: e.target.value });
          }}
          className="flex-1 w-full bg-transparent px-4 py-3 text-xs resize-none outline-none placeholder:text-muted-foreground"
        />
      </div>

      <aside className="w-full md:w-96 flex flex-col bg-secondary/40">
        <div className="px-3 py-2 border-b border-border/40 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="font-semibold">AI Assistant</span>
          </div>
          <button
            type="button"
            onClick={handleSummarize}
            disabled={loadingSummary}
            className="px-2.5 py-1 rounded-md text-xs bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-colors"
          >
            {loadingSummary ? 'Summarizing…' : 'Summarize'}
          </button>
        </div>

        <div className="px-3 py-2 border-b border-border/40 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <HelpCircle className="w-3 h-3" />
              <span>Practice questions</span>
            </div>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
              className="bg-background/40 border border-border/50 rounded-md text-xs px-1.5 py-0.5"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Topic (e.g., Banker's Algorithm)"
            className="w-full bg-background/40 rounded-md px-2 py-1.5 text-xs border border-border/50 outline-none"
          />
          <button
            type="button"
            onClick={handleGenerateQuestions}
            disabled={loadingQuestions}
            className="w-full text-xs bg-secondary text-primary rounded-md py-1.5 border border-primary/40 hover:bg-secondary/80 disabled:opacity-60 transition-colors"
          >
            {loadingQuestions ? 'Generating…' : 'Generate Questions'}
          </button>
        </div>

        {(summary || questions) && (
          <div className="flex border-b border-border/30">
            <button
              type="button"
              onClick={() => setActiveTab('summary')}
              className={`flex-1 px-3 py-2 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                activeTab === 'summary'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <FileText className="w-3 h-3" />
              Summary
              {summary && <span className="w-1.5 h-1.5 rounded-full bg-primary ml-0.5" />}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('questions')}
              className={`flex-1 px-3 py-2 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                activeTab === 'questions'
                  ? 'text-green-400 border-b-2 border-green-500'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <ListOrdered className="w-3 h-3" />
              Questions
              {questions && <span className="w-1.5 h-1.5 rounded-full bg-green-500 ml-0.5" />}
            </button>
          </div>
        )}

        <div className="flex-1 overflow-auto text-xs">
          {!summary && !questions && (
            <div className="px-3 py-4">
              <p className="text-muted-foreground/70">
                Use <span className="font-semibold">Summarize</span> to get a short overview, key points,
                and flashcards for this note, or generate practice questions for a specific topic.
              </p>
            </div>
          )}

          {summary && activeTab === 'summary' && (
            <div className="px-3 py-3">
              <p className="text-muted-foreground leading-relaxed mb-3">{summary.summary}</p>
              {summary.key_points.length > 0 && (
                <div className="mb-3">
                  <p className="font-semibold text-foreground mb-1.5">Key Points</p>
                  <ul className="space-y-1">
                    {summary.key_points.map((kp) => (
                      <li key={kp} className="flex items-start gap-1.5 text-muted-foreground">
                        <span className="text-primary mt-0.5">•</span>
                        <span>{kp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {summary.flashcards.length > 0 && (
                <div>
                  <p className="font-semibold text-foreground mb-1.5">Flashcards</p>
                  <ul className="space-y-1.5">
                    {summary.flashcards.map((fc) => (
                      <li key={fc.question} className="bg-background/40 rounded-md px-2.5 py-2 border border-border/30">
                        <p className="text-primary font-medium mb-1">Q: {fc.question}</p>
                        <p className="text-green-400">A: {fc.answer}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {questions && activeTab === 'questions' && (
            <div className="px-3 py-3">
              <p className="text-muted-foreground text-[10px] mb-2">
                {questions.topic} — {questions.difficulty}
              </p>
              <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                {questions.questions.map((q) => (
                  <li key={q} className="bg-background/40 rounded-md px-2.5 py-2 border border-border/30">
                    {q}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {summary && activeTab === 'questions' && !questions && (
            <div className="px-3 py-4 text-center">
              <p className="text-muted-foreground/70">Generate questions to see them here.</p>
            </div>
          )}
          {questions && activeTab === 'summary' && !summary && (
            <div className="px-3 py-4 text-center">
              <p className="text-muted-foreground/70">Summarize this note to see the summary here.</p>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
};

export default NotesEditor;

