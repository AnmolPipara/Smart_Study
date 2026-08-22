import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const DEMO_MODE = Deno.env.get("DEMO_MODE") === "true";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent";

const ALLOWED_ORIGINS = [
  "https://smart-study-planner.vercel.app",
  "https://smart-study-planner-git-main.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
];

function getCorsHeaders(origin: string | null) {
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin || '') ? (origin || ALLOWED_ORIGINS[0]) : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Credentials": "true",
  };
}

// --- Demo / Fallback Responses ---

function demoResponse(prompt: string): string {
  const lower = prompt.toLowerCase();

  // Note summary - check FIRST because note content often contains "day" and "topics"
  if (lower.includes("summarize the notes") || lower.includes('"summary"') || lower.includes("flashcards")) {
    return JSON.stringify({
      summary: "This is a demo summary. Connect a valid AI provider key (OpenRouter, Groq, or Gemini) to get real AI-powered summaries of your notes.",
      key_points: [
        "The classroom is a shared space where students learn, grow, and form lasting friendships.",
        "Teachers play a crucial role in guiding students both academically and morally.",
        "Challenges like tests and mistakes help students build resilience and confidence.",
      ],
      flashcards: [
        { question: "What makes a classroom special?", answer: "It is a place where memories are created, friendships grow, and lessons for life begin." },
        { question: "How do teachers contribute to classroom life?", answer: "They guide students, explain difficult topics, and teach values like honesty and teamwork." },
        { question: "What role do challenges play?", answer: "They help students become stronger, more responsible, and more confident." },
      ],
    });
  }

  // Study plan
  if (lower.includes("expert study planner") || (lower.includes("exam") && lower.includes("days"))) {
    return JSON.stringify({
      exam: "Study Plan (Demo Mode)",
      days: [
        { day: "Day 1", title: "Introduction & Fundamentals", topics: ["Overview of syllabus", "Core concepts review", "Key terminology"] },
        { day: "Day 2", title: "Deep Dive - Part 1", topics: ["Advanced topics", "Practice problems", "Self-assessment quiz"] },
        { day: "Day 3", title: "Deep Dive - Part 2", topics: ["Case studies", "Edge cases", "Common mistakes"] },
        { day: "Day 4", title: "Review & Practice", topics: ["Past paper questions", "Timed mock test", "Review weak areas"] },
        { day: "Day 5", title: "Final Revision", topics: ["Quick-fire flashcards", "Concept map", "Final confidence check"] },
      ],
    });
  }

  // Practice questions
  if (lower.includes("generate 5") || lower.includes('"topic"')) {
    return JSON.stringify({
      topic: "Demo Topic",
      difficulty: "medium",
      questions: [
        "Explain the core concept behind this topic with a real-world example.",
        "What are the advantages and disadvantages of this approach?",
        "Compare and contrast with an alternative method.",
        "How would you apply this concept in a practical scenario?",
        "What are common pitfalls to avoid when working with this topic?",
      ],
    });
  }

  // Generic fallback
  return JSON.stringify({
    response: "This is a demo response. The AI service is currently unavailable.",
    demo_mode: true,
  });
}

// --- Provider Callers ---

function buildMessages(prompt: string) {
  return [
    { role: "system", content: "You are a helpful AI tutor. Always respond in JSON format." },
    { role: "user", content: prompt },
  ];
}

async function callOpenRouter(prompt: string): Promise<{content: string; provider: string}> {
  if (!OPENROUTER_API_KEY) throw new Error("OPENROUTER_API_KEY not configured");
  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer " + OPENROUTER_API_KEY, "X-Title": "Studora" },
    body: JSON.stringify({ model: "google/gemma-4-26b-a4b-it:free", messages: buildMessages(prompt), temperature: 0.4 }),
  });
  if (!response.ok) { const t = await response.text(); throw new Error("OpenRouter " + response.status + ": " + t); }
  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error("OpenRouter returned empty content");
  return { content, provider: "openrouter" };
}

async function callGroq(prompt: string): Promise<{content: string; provider: string}> {
  if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY not configured");
  const response = await fetch(GROQ_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer " + GROQ_API_KEY },
    body: JSON.stringify({ model: "openai/gpt-oss-20b", messages: buildMessages(prompt), temperature: 0.4 }),
  });
  if (!response.ok) { const t = await response.text(); throw new Error("Groq " + response.status + ": " + t); }
  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error("Groq returned empty content");
  return { content, provider: "groq" };
}

async function callGemini(prompt: string): Promise<{content: string; provider: string}> {
  if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not configured");
  const response = await fetch(GEMINI_URL + "?key=" + GEMINI_API_KEY, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: "You are a helpful AI tutor. Always respond in JSON format.\n\n" + prompt }] }],
      generationConfig: { temperature: 0.4 },
    }),
  });
  if (!response.ok) { const t = await response.text(); throw new Error("Gemini " + response.status + ": " + t); }
  const data = await response.json();
  const content = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!content) throw new Error("Gemini returned empty content");
  return { content, provider: "gemini" };
}

// --- Fallback Chain ---

const providers = [callOpenRouter, callGroq, callGemini];

async function callWithFallback(prompt: string) {
  for (const provider of providers) {
    try {
      const result = await provider(prompt);
      console.log("OK: " + result.provider);
      return result;
    } catch (err) {
      console.warn("FAIL: " + ((err as Error).message || String(err)));
    }
  }
  console.warn("All AI providers failed. Falling back to demo mode.");
  return { content: demoResponse(prompt), provider: "demo" };
}

// --- Main Handler ---

serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req.headers.get("Origin"));
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });

    const token = authHeader.replace("Bearer ", "");
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData?.user) return new Response(JSON.stringify({ error: "Invalid token" }), { status: 401, headers: corsHeaders });

    let body: unknown = null;
    try { body = await req.json(); } catch (_e) { body = null; }

    const parsed = (body ?? {}) as { prompt?: string; topic?: string; model?: string; force_demo?: boolean };
    const prompt = (parsed.prompt ?? parsed.topic ?? "").trim();

    if (!prompt) return new Response(JSON.stringify({ error: "Prompt is required" }), { status: 400, headers: Object.assign({}, corsHeaders, { "Content-Type": "application/json" }) });

    let result;
    if (DEMO_MODE || parsed.force_demo) {
      result = { content: demoResponse(prompt), provider: "demo" };
    } else {
      result = await callWithFallback(prompt);
    }

    return new Response(JSON.stringify({
      choices: [{ message: { content: result.content } }],
      _meta: { provider: result.provider, demo_mode: result.provider === "demo" },
    }), { headers: Object.assign({}, corsHeaders, { "Content-Type": "application/json" }), status: 200 });

  } catch (err) {
    const error = err as Error;
    console.error("Proxy Exception:", error.message);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { headers: Object.assign({}, corsHeaders, { "Content-Type": "application/json" }), status: 500 });
  }
});
