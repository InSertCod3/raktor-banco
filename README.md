## MayDove MVP

Visual-first mind mapping with platform-aware content generation (LinkedIn + Facebook + Instagram).

### Tech

- Next.js (App Router)
- React Flow (`@xyflow/react`)
- Tailwind CSS
- Prisma + PostgreSQL
- Gemini (for generation)

### Setup

- **Install**

```bash
npm install
```

- **Env**
  - Copy `env.example` → `.env` (or set env vars in your host)
  - Required:
    - `DATABASE_URL`
    - `GEMINI_API_KEY` (needed for generation)
  - Optional:
    - `GEMINI_MODEL` (defaults to `gemini-2.5-flash-lite`)
    - `GEMINI_BASE_URL` (defaults to `https://aiplatform.googleapis.com/v1`)

- **Database**

#### PostgreSQL

```bash
npm run prisma:migrate
```

- **Dev**

```bash
npm run dev
```

### App routes

- **Landing**: `/`
- **MayDove**: `/dashboard`
  - Create a map: `/dashboard/new`
  - Edit a map: `/dashboard/[mapId]`
