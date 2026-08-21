# Smart Study Buddy

Smart Study Buddy is an AI-powered study-planning application with a React/Vite client and a Supabase backend.

## Features

- **AI Study Planner** — generate day-by-day study plans for any exam
- **AI Practice Questions** — auto-generate topic-based quizzes at adjustable difficulty
- **Note Summarization** — get summaries, key points, and flashcards from notes
- **Fallback AI Providers** — automatic failover: OpenRouter → Groq → Gemini → Demo Mode
- **Demo Mode** — the UI stays functional even when no API keys are configured
- **Authentication** — email/password and Google sign-in via Supabase Auth
- **Responsive UI** — works on desktop and mobile with dark/light themes

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Client | React, TypeScript, Vite, Tailwind CSS |
| Backend | Supabase Edge Functions (Deno), PostgreSQL |
| AI | OpenRouter, Groq, Gemini (with automatic fallback) |
| Auth | Supabase Auth (email + Google OAuth) |

## Structure

```
smart-study-buddy/
├── client/                 # React, TypeScript, Vite, Tailwind UI
│   ├── src/
│   ├── public/
│   └── .env                # local public Supabase configuration (not committed)
├── server/                 # Supabase migrations and Edge Functions
│   └── supabase/
├── package.json            # convenient repository-level scripts
└── README.md
```

## Environment Variables

### Client (`client/.env`)

Copy `client/.env.example` to `client/.env`:

```bash
VITE_SUPABASE_PROJECT_ID=your-project-id
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-anon-key
```

### Server (Supabase secrets)

Set these via `supabase secrets set` — never commit real keys:

```bash
# At least one AI provider key is required for live responses
OPENROUTER_API_KEY=your-openrouter-api-key
GROQ_API_KEY=your-groq-api-key
GEMINI_API_KEY=your-gemini-api-key

# Set to "true" to use demo responses instead of live AI
DEMO_MODE=false
```

See [server/README.md](server/README.md) for full provider documentation.

## Run Locally

1. Clone the repo and install dependencies:

```bash
git clone <repo-url>
cd smart-study-buddy
npm run client:install
```

2. Copy `client/.env.example` to `client/.env` and fill in your Supabase values.
3. Start the dev server:

```bash
npm run dev
```

The site runs at `http://localhost:3000`.

## Server Setup

The AI provider keys are kept on the server (Supabase Edge Function secrets), never in client-side `VITE_*` variables. See [server/README.md](server/README.md) for deployment, secrets, and fallback configuration.

## Architecture

```
┌──────────────┐       ┌──────────────────────┐       ┌─────────────────┐
│  React App   │──────▶│  Supabase Edge Func  │──────▶│  AI Providers   │
│  (client)    │       │  (openrouter-proxy)  │       │                 │
│              │       │                      │  ┌───▶│  OpenRouter     │
│              │       │  Fallback chain:     │  │    │  (primary)      │
│              │       │  1. OpenRouter       │──┤    └─────────────────┘
│              │       │  2. Groq             │  │    ┌─────────────────┐
│              │       │  3. Gemini           │──┤───▶│  Groq           │
│              │       │  4. Demo Mode        │  │    │  (fallback 1)   │
│              │       │                      │──┤    └─────────────────┘
│              │       │  _meta.provider      │  │    ┌─────────────────┐
│              │◀──────│  _meta.demo_mode     │◀─┴───│  Gemini         │
└──────────────┘       └──────────────────────┘       │  (fallback 2)   │
                                                     └─────────────────┘
                                                              │
                                                     ┌─────────────────┐
                                                     │  Demo Mode      │
                                                     │  (predefined)   │
                                                     └─────────────────┘
```

## Useful Commands

```bash
npm run dev              # Start client dev server
npm run build            # Build client for production
npm run lint             # Lint client code
npm run test             # Run client tests
npm run server:deploy    # Deploy Supabase Edge Function
```

## License

MIT
