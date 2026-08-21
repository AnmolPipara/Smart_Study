import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

// ─── Environment Variables ───────────────────────────────────────────────────
const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const DEMO_MODE = Deno.env.get("DEMO_MODE") === "true";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// ─── Demo / Fallback Responses ───────────────────────────────────────────────

function demoResponse(prompt: string): string {
  // Return realistic-looking JSON based on what the prompt likely asks for
  const lower = prompt.toLowerCase();

  if (lower.includes("study plan") || lower.includes("day") && lower.includes("topics")) {
    return JSON.stringify({
      exam: "Study Plan (Demo Mode)",
      days: [
        { day: "Day 1", title: "Introduction & Fundamentals", topics: ["Overview of syllabus", "Core concepts review", "Key terminology"] },
        { day: "Day 2", title: "Deep Dive — Part 1", topics: ["Advanced topics", "Practice problems", "Self-assessment quiz"] },
        { day: "Day 3", title: "Deep Dive — Part 2", topics: ["Case studies", "Edge cases", "Common mistakes"] },
        { day: "Day 4", title: "Review & Practice", topics: ["Past paper questions", "Timed mock test", "Review weak areas"] },
        { day: "Day 5", title: "Final Revision", topics: ["Quick-fire flashcards", "Concept map", "Final confidence check"] },
      ],
    });
  }

  if (lower.includes("questions") || lower.includes("generate")) {
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

  if (lower.includes("summarize") || lower.includes("summary") || lower.includes("notes")) {
    return JSON.stringify({
      summary: "This is a demo summary. Connect a valid AI API key to get real AI-powered summaries of your notes.",
      key_points: [
        "Key point one — replace with real AI output",
        "Key point two — requires an active API key",
        "Key point three — see README for setup instructions",
      ],
      flashcards: [
        { question: "What is this feature?", answer: "AI-powered note summarization with flashcard generation." },
        { question: "How do I enable it?", answer: "Set up an OPENROUTER_API_KEY or GROQ_API_KEY in your Supabase Edge Function secrets." },
      ],
    });
  }

  // Generic fallback
  return JSON.stringify({
    response: "This is a demo response. The AI service is currently unavailable. Please check your API key configuration.",
    demo_mode: true,
  });
}

// ─── Provider Callers ────────────────────────────────────────────────────────

interface ProviderResult {
  content: string;
  provider: string;
}

function buildMessages(prompt: string) {
  return [
    { role: "system", content: "You are a helpful AI tutor. Always respond in JSON format." },
    { role: "user", content: prompt },
  ];
}

async function callOpenRouter(prompt: string): Promise<ProviderResult> {
  if (!OPENROUTER_API_KEY) throw new Error("OPENROUTER_API_KEY not configured");

  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "X-Title": "Smart Study Planner",
    },
    body: JSON.stringify({
      model: "google/gemma-4-31b-it:free",
      messages: buildMessages(prompt),
      temperature: 0.4,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error("OpenRouter returned empty content");
  return { content, provider: "openrouter" };
}

async function callGroq(prompt: string): Promise<ProviderResult> {
  if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY not configured");

  const response = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: buildMessages(prompt),
      temperature: 0.4,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error("Groq returned empty content");
  return { content, provider: "groq" };
}

async function callGemini(prompt: string): Promise<ProviderResult> {
  if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not configured");

  const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: `You are a helpful AI tutor. Always respond in JSON format.\n\n${prompt}` }] }],
      generationConfig: { temperature: 0.4 },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const content = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!content) throw new Error("Gemini returned empty content");
  return { content, provider: "gemini" };
}

// ─── Fallback Chain ──────────────────────────────────────────────────────────

const providers = [callOpenRouter, callGroq, callGemini];

async function callWithFallback(prompt: string): Promise<ProviderResult> {
  const errors: string[] = [];

  for (const provider of providers) {
    try {
      const result = await provider(prompt);
      console.log(`✓ Success with provider: ${result.provider}`);
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`✗ Provider failed: ${msg}`);
      errors.push(msg);
    }
  }

  // All providers failed — use demo mode
  console.warn("All AI providers failed. Falling back to demo mode.");
  return { content: demoResponse(prompt), provider: "demo" };
}

// ─── Main Handler ────────────────────────────────────────────────────────────

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 🔐 REQUIRE AUTH
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: corsHeaders,
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: corsHeaders,
      });
    }

    // Parse request body
    let body: unknown = null;
    try { body = await req.json(); } catch { body = null; }

    const parsed = (body ?? {}) as { prompt?: string; topic?: string; model?: string; force_demo?: boolean };
    const prompt = (parsed.prompt ?? parsed.topic ?? "").trim();

    if (!prompt) {
      return new Response(JSON.stringify({ error: "Prompt is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 🎯 DEMO MODE: if explicitly requested or env says so, skip live providers
    let result: ProviderResult;

    if (DEMO_MODE || parsed.force_demo) {
      result = { content: demoResponse(prompt), provider: "demo" };
      console.log("Demo mode active — returning demo response");
    } else {
      result = await callWithFallback(prompt);
    }

    // Parse the AI content so we can attach metadata
    let aiData: unknown;
    try {
      aiData = JSON.parse(result.content);
    } catch {
      aiData = { raw: result.content };
    }

    return new Response(JSON.stringify({
      choices: [{ message: { content: result.content } }],
      _meta: {
        provider: result.provider,
        demo_mode: result.provider === "demo",
      },
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (err) {
    const error = err as Error;
    console.error("Proxy Exception:", error.message);
    return new Response(JSON.stringify({ error: "Internal Server Error", details: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
