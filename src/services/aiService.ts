import { supabase } from '@/integrations/supabase/client';

const MODEL = 'openai/gpt-4o-mini';

interface ChatOptions {
  systemPrompt: string;
  userPrompt: string;
}

function extractJson<T>(content: string): T {
  let cleaned = content.trim();

  // Strip Markdown code fences if present
  if (cleaned.startsWith('```')) {
    const firstNewline = cleaned.indexOf('\n');
    const fenceEnd = cleaned.lastIndexOf('```');
    if (firstNewline !== -1 && fenceEnd !== -1 && fenceEnd > firstNewline) {
      cleaned = cleaned.slice(firstNewline + 1, fenceEnd).trim();
    }
  }

  // Find first JSON brace/bracket and last matching closing brace/bracket
  const firstBrace = cleaned.indexOf('{');
  const firstBracket = cleaned.indexOf('[');
  let start = -1;
  if (firstBrace !== -1 && firstBracket !== -1) {
    start = Math.min(firstBrace, firstBracket);
  } else {
    start = firstBrace !== -1 ? firstBrace : firstBracket;
  }

  if (start > 0) {
    cleaned = cleaned.slice(start);
  }

  const lastBrace = cleaned.lastIndexOf('}');
  const lastBracket = cleaned.lastIndexOf(']');
  let end = -1;
  if (lastBrace !== -1 && lastBracket !== -1) {
    end = Math.max(lastBrace, lastBracket);
  } else {
    end = lastBrace !== -1 ? lastBrace : lastBracket;
  }
  if (end !== -1 && end < cleaned.length - 1) {
    cleaned = cleaned.slice(0, end + 1);
  }

  try {
    return JSON.parse(cleaned) as T;
  } catch (err) {
    console.error('Failed to parse JSON from model response. Raw content:', content);
    console.error('Cleaned content used for JSON.parse:', cleaned);
    throw new Error('AI response was not valid JSON');
  }
}

async function callOpenRouter({ systemPrompt, userPrompt }: ChatOptions): Promise<string> {
  const { data, error } = await supabase.functions.invoke('openrouter-proxy', {
    body: { systemPrompt, userPrompt, model: MODEL },
  });

  if (error) {
    console.error('Edge Function error:', error);
    throw new Error(`AI Service Error: ${error.message}`);
  }

  if (!data || !data.choices?.[0]?.message?.content) {
    console.error('Unexpected AI response:', data);
    throw new Error('AI service returned an empty or invalid response');
  }

  return data.choices[0].message.content;
}

// ---------- AI Auto Study Planner ----------

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

  const content = await callOpenRouter({
    systemPrompt:
      'You are an expert study planner. Always respond with strict JSON only, no extra text. ' +
      'JSON shape: { "exam": string, "days": [ { "day": string, "title": string, "topics": string[] } ] }. ' +
      'The "days" array MUST have exactly the requested number of elements, and "day" MUST be labels like "Day 1", "Day 2", ... (no calendar dates).',
    userPrompt: `
Exam name: ${examName}
Number of days for this plan: ${days}
Subjects: ${subjects}
Topics: ${topics}
Difficulty: ${difficulty}

Create a 100% JSON plan that distributes topics across the given number of days. 
Include focused days for practice, revision, mock tests, weak-topic review, and light review on the last day.
`,
  });

  return extractJson<AiStudyPlan>(content);
}

// ---------- AI Question Generator ----------

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

  const content = await callOpenRouter({
    systemPrompt:
      'You are a helpful tutor. Always respond with pure JSON only. ' +
      'JSON shape: { "topic": string, "difficulty": string, "questions": string[] }',
    userPrompt: `
Topic: ${topic}
Difficulty: ${difficulty}

Generate 5 diverse practice questions (mix of conceptual, short answer, and problem solving) for this topic.
`,
  });

  return extractJson<AiQuestions>(content);
}

// ---------- AI Notes Summarizer ----------

export interface AiNoteSummary {
  summary: string;
  key_points: string[];
  flashcards: { question: string; answer: string }[];
}

export async function summarizeNoteContent(noteText: string): Promise<AiNoteSummary> {
  const content = await callOpenRouter({
    systemPrompt:
      'You are an expert at summarizing technical notes for students. Always respond with strict JSON only. ' +
      'JSON shape: { "summary": string, "key_points": string[], "flashcards": [ { "question": string, "answer": string } ] }',
    userPrompt: `
Summarize the following study notes. Focus on clarity and exam-oriented understanding.

Notes:
"""${noteText}"""
`,
  });

  return extractJson<AiNoteSummary>(content);
}

