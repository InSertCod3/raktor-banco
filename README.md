## Mind Mapper MVP

Visual-first mind mapping with platform-aware content generation (LinkedIn + Facebook).

### Tech

- Next.js (App Router)
- React Flow (`@xyflow/react`)
- Tailwind CSS
- Prisma + PostgreSQL
- OpenAI (for generation)

### Setup

- **Install**

```bash
npm install
```

- **Env**
  - Copy `env.example` → `.env` (or set env vars in your host)
  - Required:
    - `DATABASE_URL`
    - `OPENAI_API_KEY` (needed for generation)
  - Optional:
    - `OPENAI_MODEL` (defaults to `gpt-4o-mini`)

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
- **Mind Mapper**: `/app`
  - Create a map: `/app/new`
  - Edit a map: `/app/[mapId]`
