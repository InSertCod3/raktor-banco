# agents.md

## Purpose

This document defines the responsibilities, boundaries, and collaboration rules for AI agents working on the **Maydove MVP** — a visual, LLM-powered content ideation and planning tool.

Agents must optimize for:
- Simplicity over feature bloat
- Visual-first workflows
- Fast iteration suitable for an MVP
- Clear separation of concerns

---

## Product Context

The application allows users to:
- Create a central idea node
- Expand ideas visually using a mind-map (React Flow)
- Generate platform-specific content (LinkedIn, Facebook, Instagram initially)
- Reuse idea graphs over time
- Eventually switch between **Content Mode** and **Product Roadmap Mode**

Tech stack:
- Next.js (App Router)
- React Flow
- Tailwind CSS
- Prisma
- PostgreSQL
- LLM APIs

---

## Agent Roles

### 1. Product Agent

**Responsibilities**
- Clarify user intent and workflows
- Prevent scope creep
- Ensure MVP features align with the core value proposition
- Define feature phases and exclusions

**Constraints**
- Must prioritize LinkedIn + Facebook + Instagram only for MVP
- Must reject features that dilute the visual mind-map experience

---

### 2. UX / UI Agent

**Responsibilities**
- Design node-based interactions using React Flow
- Keep the UI minimal, fast, and intuitive
- Enforce visual hierarchy (idea → branch → output)
- Optimize for clarity over customization

**Constraints**
- Tailwind only (no component libraries unless approved)
- No dense forms when nodes can express the same data visually
- Avoid “chat-style” interfaces as primary interaction

---

### 3. Frontend Engineering Agent

**Responsibilities**
- Implement React Flow nodes and edges
- Build Next.js pages, layouts, and client components
- Manage state for maps, nodes, and generations
- Ensure performance with large graphs

**Constraints**
- App Router only
- No premature optimization
- No UI logic inside LLM-related code

---

### 4. Backend / Data Agent

**Responsibilities**
- Design Prisma schema
- Manage Postgres data models
- Handle persistence of maps, nodes, and generations
- Enforce ownership and access control

**Core Models**
- User
- Map
- Node
- Edge
- GeneratedContent
- PlatformType

**Constraints**
- Schema must support reuse and regeneration history
- No platform-specific fields hardcoded into core tables

---

### 5. LLM / Prompt Agent

**Responsibilities**
- Design prompts for content generation
- Adapt tone and structure per platform
- Support regeneration and variation
- Keep outputs concise and platform-aware

**Constraints**
- No long-form essays unless explicitly requested
- Must respect platform limits (length, tone, intent)
- Prompts should be deterministic when possible

---

### 6. Integration Agent (Future)

**Responsibilities**
- Handle platform exports and APIs
- Manage YouTube, Shorts, TikTok expansions
- Enable scheduling or external publishing

**Constraints**
- Not active during MVP
- Must not affect core map functionality

---

## Collaboration Rules

- Agents must not overlap responsibilities
- Visual structure is the source of truth, not generated text
- Any new feature must answer:
  “Does this make the idea map more useful?”

If not, it is out of scope.

---

## MVP Definition of Done

The MVP is complete when users can:
1. Create a central idea
2. Expand ideas visually
3. Generate LinkedIn, Facebook, and Instagram posts per node
4. Regenerate variations
5. Reuse and edit maps over time

Anything beyond this requires explicit approval.

---

## Non-Goals (MVP)

- Scheduling posts
- Analytics
- Team collaboration
- Real-time multi-user editing
- All-platform support
- Advanced branding controls

---

## Guiding Principle

**The map is the product.  
AI exists to serve the map, not replace it.**
