# DREADFRAME

An AI-powered horror story development and cinematic storyboard studio. Users journey from a face, photo, or idea through AI-generated horror concepts, story bibles, characters, arcs, storyboard sequences, shots, and cinematic frames.

## Run & Operate

- `pnpm --filter @workspace/dreadframe run dev` — run the frontend (port auto-assigned)
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string
- Required env: `AI_INTEGRATIONS_OPENAI_BASE_URL`, `AI_INTEGRATIONS_OPENAI_API_KEY` — Replit AI Integrations (auto-provisioned)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 19 + Vite + Tailwind CSS v4 + wouter routing + framer-motion
- API: Express 5 (shared `artifacts/api-server`)
- DB: PostgreSQL + Drizzle ORM (conversations/messages tables from OpenAI skill)
- AI: OpenAI via Replit AI Integrations — `gpt-5.6-terra` (text), `gpt-image-1` (images)
- Validation: Zod v3, drizzle-zod
- API codegen: Orval (from OpenAPI spec)
- State: React Context + useReducer + localStorage

## Where things live

- `artifacts/dreadframe/` — React frontend
  - `src/context/ProjectContext.tsx` — global project state (source of truth)
  - `src/pages/` — all pages (Landing, Studio sub-routes)
  - `src/index.css` — dark cinematic design system tokens
- `artifacts/api-server/src/routes/generate/` — all AI generation endpoints
- `lib/api-spec/openapi.yaml` — API contract (single source of truth)
- `lib/integrations-openai-ai-server/` — OpenAI server SDK wrapper
- `lib/integrations-openai-ai-react/` — OpenAI React hooks

## Architecture decisions

- **localStorage-first state**: Project state lives in `ProjectContext` backed by localStorage. No DB CRUD for projects yet — stateless AI generation endpoints only.
- **Stateless AI routes**: All `/api/generate/*` endpoints are stateless — they receive the full context and return generated content. No server-side project storage.
- **Image generation as base64**: `gpt-image-1` returns base64; frontend stores as `data:image/png;base64,...` data URLs in project state.
- **OpenAPI body naming**: All request bodies use entity-shaped names (`XxxInput`, `XxxOutput`) to avoid Orval TS2308 collision with auto-generated `XxxBody` names.
- **Zod v3 compat**: OpenAPI spec uses `type: number` (not `type: integer`) and avoids bare `type: object` to prevent Orval from generating Zod v4 APIs (`z.int`, `z.looseObject`).

## Product

DREADFRAME has two experiences:
1. **Landing page** (`/`) — cinematic marketing page with theme picker, How It Works, example story
2. **Studio** (`/studio/*`) — three-column creative workspace with:
   - Project: Overview / Story / Characters / Themes & Arcs
   - Storyboard: Sequences / Shots / Gallery / Endings
   - Director: Camera / Horror Lab / Visual Style + persistent Director AI panel

The full AI creative journey: Horror Lab → Story Bible → Character + Portrait → Character Arc → Sequences → Shots + Storyboard Frames → Alternate Endings

## User preferences

_Populate as you build._

## Gotchas

- After changing `lib/api-spec/openapi.yaml`, always run `pnpm --filter @workspace/api-spec run codegen`
- Do not use `type: integer` in the OpenAPI spec — use `type: number` instead (Zod v3 compat)
- Do not use bare `type: object` for freeform JSON fields — use `type: string` and serialize/parse JSON
- Director Action route (`/api/generate/director-action`) sends JSON as strings (`currentContentJson`, `contextJson`) and receives `modifiedJson` as a string — parse/stringify on both sides
