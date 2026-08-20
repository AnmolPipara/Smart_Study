# Smart Study Buddy

Smart Study Buddy is a study-planning application with a React/Vite client and a Supabase server.

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

## Run locally

1. Copy `client/.env.example` to `client/.env` and fill in the Supabase public values.
2. Install the client dependencies: `npm run client:install`.
3. Start the client: `npm run dev`.

The site runs at `http://localhost:3000`.

## Server setup

The OpenRouter key is kept on the server, never in a `VITE_*` variable. See [server/README.md](server/README.md) for deployment and secret setup.

## Useful commands

```bash
npm run dev
npm run build
npm run lint
npm run test
npm run server:deploy
```
