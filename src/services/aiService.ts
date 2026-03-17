import { supabase } from '@/integrations/supabase/client';

// ---------- JSON Extractor ----------

function extractJson<T>(content: string): T {
  let cleaned = content.trim();

  // Remove markdown ``` blocks
  if (cleaned.startsWith('```')) {
    const firstNewline = cleaned.indexOf('\n');
    const fenceEnd = cleaned.lastIndexOf('```');
    if (firstNewline !== -1 && fenceEnd !== -1 && fenceEnd > firstNewline) {
      cleaned = cleaned.slice(firstNewline + 1, fenceEnd).trim();
    }
  }

  // Extract JSON portion
  const firstBrace = cleaned.indexOf('{');
  const firstBracket = cleaned.indexOf('[');

  let start = -1;
  if (firstBrace !== -1 && firstBracket !== -1) {
    start = Math.min(firstBrace, firstBracket);
  } else {
    start = firstBrace !== -1 ? firstBrace : firstBracket;
  }

  if (start > 0) cleaned = cleaned.slice(start);

  const lastBrace = cleaned.lastIndexOf('}');
  const lastBracket = cleaned.lastIndexOf(']');

  let end = -1;
  if (lastBrace !== -1 && lastBracket !== -1) {
    end = Math.max(lastBrace, lastBracket);
  } else {
    end = lastBrace !== -1 ? lastBrace : lastBracket;
  }

  if (end !== -1) cleaned = cleaned.slice(0, end + 1);

  try {
    return JSON.parse(cleaned) as T;
  } catch (err) {
    console.error('Raw:', content);
    console.error('Cleaned:', cleaned);
    throw new Error('AI response was not valid JSON');
  }
}

// ---------- API CALL (FIXED) ----------

async function callOpenRouter(prompt: string): Promise<string> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("User not logged in. Please login first.");
  }

  const { data, error } = await supabase.functions.invoke('openrouter-proxy', {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
    body: { prompt },
  });

  if (error) {
    // Supabase returns a generic message for non-2xx responses; surface details when available.
    const anyErr = error as unknown as { message?: string; context?: unknown };
    console.error('Edge Function error full details:', anyErr);

    let details = '';
    try {
      // @ts-expect-error - context shape depends on runtime
      const ctx = anyErr?.context;
      // @ts-expect-error - response may exist on context
      const body = ctx?.response?.body;
      if (typeof body === 'string') details = body;
      // @ts-expect-error - response json may exist on context
      if (!details && typeof ctx?.response?.json === 'function') {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const j = await ctx.response.json();
        details = JSON.stringify(j);
      }
    } catch {
      // ignore
    }

    const msg = anyErr?.message || 'Unknown error';
    throw new Error(`AI Error: ${details ? `${msg} — ${details}` : msg}`);
  }

  if (!data || !data.choices?.[0]?.message?.content) {
    console.error('Invalid response:', data);
    throw new Error('Invalid AI response');
  }

  return data.choices[0].message.content;
}

// ---------- STUDY PLAN ----------

export interface AiPlanDay {
  day: string;
  title: string;
  topics: string[];
}

export interface AiStudyPlan {
  exam: string;
  days: AiPlanDay[];
}

export async function generateStudyPlan(params: {
  examName: string;
  days: number;
  subjects: string;
  topics: string;
  difficulty: 'easy' | 'medium' | 'hard';
}): Promise<AiStudyPlan> {
  const { examName, days, subjects, topics, difficulty } = params;

  const prompt = `
You are an expert study planner. Respond ONLY in JSON.

Format:
{
  "exam": string,
  "days": [
    { "day": "Day 1", "title": string, "topics": string[] }
  ]
}

Exam: ${examName}
Days: ${days}
Subjects: ${subjects}
Topics: ${topics}
Difficulty: ${difficulty}

Distribute topics evenly. Include revision, mock tests, and final review.
`;

  const content = await callOpenRouter(prompt);
  return extractJson<AiStudyPlan>(content);
}

// ---------- QUESTIONS ----------

export interface AiQuestions {
  topic: string;
  difficulty: string;
  questions: string[];
}

export async function generateQuestions(params: {
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
}): Promise<AiQuestions> {
  const { topic, difficulty } = params;

  const prompt = `
Generate 5 ${difficulty} level questions for the topic below.

Respond ONLY in JSON:
{
  "topic": string,
  "difficulty": string,
  "questions": string[]
}

Topic: ${topic}
`;

  const content = await callOpenRouter(prompt);
  return extractJson<AiQuestions>(content);
}

// ---------- NOTES SUMMARY ----------

export interface AiNoteSummary {
  summary: string;
  key_points: string[];
  flashcards: { question: string; answer: string }[];
}

export async function summarizeNoteContent(noteText: string): Promise<AiNoteSummary> {
  const prompt = `
Summarize the notes below.

Respond ONLY in JSON:
{
  "summary": string,
  "key_points": string[],
  "flashcards": [
    { "question": string, "answer": string }
  ]
}

Notes:
${noteText}
`;

  const content = await callOpenRouter(prompt);
  return extractJson<AiNoteSummary>(content);
}