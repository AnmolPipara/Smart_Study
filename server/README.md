# Server

This folder contains the Supabase backend:

- `supabase/migrations/` — database schema migrations.
- `supabase/functions/openrouter-proxy/` — AI proxy with automatic fallback chain.

## AI Provider Fallback Chain

The Edge Function tries providers in order and falls back automatically if one fails:

```
OpenRouter  →  Groq  →  Gemini  →  Demo Mode (predefined responses)
```

At least one provider API key is required for live AI responses. If all fail (or `DEMO_MODE=true`), the app returns realistic sample responses so the UI remains functional.

### Supported Providers

| Provider | Env Variable | Free Tier | Sign-up |
|----------|-------------|-----------|---------|
| OpenRouter | `OPENROUTER_API_KEY` | Yes (limited) | [openrouter.ai](https://openrouter.ai) |
| Groq | `GROQ_API_KEY` | Yes (generous) | [console.groq.com](https://console.groq.com) |
| Gemini | `GEMINI_API_KEY` | Yes (generous) | [aistudio.google.com](https://aistudio.google.com) |

## Setup

1. Copy `.env.example` to `.env` and fill in at least one API key.
2. Set secrets in Supabase:

```bash
supabase secrets set OPENROUTER_API_KEY=your-key --workdir server
supabase secrets set GROQ_API_KEY=your-key --workdir server
supabase secrets set GEMINI_API_KEY=your-key --workdir server
```

3. Deploy from the repository root:

```bash
npm run server:deploy
```

### Demo Mode

Set `DEMO_MODE=true` to skip live API calls and return predefined sample responses. The UI will show a "Demo Mode" banner.

```bash
supabase secrets set DEMO_MODE=true --workdir server
```

## Key Rotation

Because the proxy supports multiple providers, you can rotate keys by updating the Supabase secret without changing any source code:

```bash
supabase secrets set GROQ_API_KEY=new-key --workdir server
```

The service values supplied by Supabase (`SUPABASE_URL` and `SUPABASE_ANON_KEY`) are read by the Edge Function at runtime; do not add them to the client environment.
