# 📚 Smart Study Planner

> **Plan Smarter. Study Better – All In One Place!**

Smart Study Planner is a comprehensive, AI-powered study management application that helps students organize their workflow, track progress, and optimize study time with intelligent planning tools.

---

## ✨ Key Features

### 📋 Multi-View Task Management
Plan your study sessions with **five** flexible views, all in one dashboard:
| View | Description |
|------|-------------|
| **Daily Planner** | Hour-by-hour schedule for focused daily planning |
| **Weekly Planner** | Bird's-eye view of your entire week |
| **Calendar** | Month-level overview with date-based task mapping |
| **Kanban Board** | Drag-and-drop task progress tracking |
| **Timeline** | Chronological visualization of tasks and deadlines |

### 🤖 AI-Powered Study Tools
Powered by GPT-4o-mini via OpenRouter:
- **AI Study Planner** — Generate structured multi-day study plans based on exam name, subjects, topics, and difficulty level
- **AI Question Generator** — Create practice questions on any topic for self-assessment
- **AI Notes Summarizer** — Automatically summarize notes into key points and flashcards

### 📔 Hierarchical Note-Taking
- Create and organize notes in a **tree-structured** sidebar (parent/child relationships)
- Rich text editor with auto-save via Supabase
- AI-powered summarization of any note

### 📊 Analytics Dashboard
- Visualize task completion rates, study hours, and productivity trends
- Interactive charts powered by Recharts

### ⏰ Deadline & Progress Tracking
- Dedicated **Deadline Panel** for urgent and upcoming tasks
- **Study Progress** component showing completion stats at a glance

### 🔐 Authentication
- Email/password sign-up and sign-in
- Google OAuth (one-click login)
- Protected dashboard routes

---

## 🛠️ Technology Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 18, TypeScript, Vite |
| **Styling** | Tailwind CSS, shadcn/ui, Radix UI |
| **State & Data** | TanStack React Query |
| **Backend & Auth** | Supabase (PostgreSQL + Auth) |
| **AI** | OpenRouter API (GPT-4o-mini) |
| **Forms** | React Hook Form, Zod |
| **Charts** | Recharts |
| **Date Utilities** | date-fns |
| **Testing** | Vitest, Playwright, Testing Library |

---

## 📁 Project Structure

```
src/
├── pages/            # Landing, Auth, Dashboard, NotFound
├── components/       # UI components (planners, forms, notes, analytics)
│   ├── Notes/        # NotesSidebar, NotesEditor
│   └── ui/           # shadcn/ui primitives
├── services/         # aiService, taskService, noteService
├── contexts/         # AuthContext (Supabase auth state)
├── hooks/            # use-mobile, use-toast
├── integrations/     # Supabase client config & types
├── types/            # StudyTask, StudyNote, Priority
├── lib/              # Utilities
└── test/             # Vitest setup & example tests
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** ≥ 18
- A **Supabase** project (for database and auth)
- An **OpenRouter API key** (for AI features)

### Installation

```bash
# 1. Clone the repository
git clone <YOUR_GIT_URL>
cd smart-study-buddy

# 2. Install dependencies
npm install

# 3. Set up environment variables
#    Create a .env file in the root with:
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
VITE_OPENROUTER_API_KEY=<your-openrouter-api-key>

# 4. Start the development server
npm run dev
```

The app will be available at `http://localhost:3000`.

### Building for Production

```bash
npm run build
npm run preview   # Preview the production build
```

### Running Tests

```bash
npm run test          # Run tests once
npm run test:watch    # Run tests in watch mode
```

---

## 📄 License

This project is for educational and personal use.
