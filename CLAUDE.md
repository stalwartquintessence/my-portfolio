# CLAUDE.md

@AGENTS.md

## Critical: bundled Next.js docs are the source of truth

This repo pins a specific Next.js (`next@16.2.7`) whose APIs and conventions may differ from training data. **Before writing or changing any Next.js code, read the relevant guide under `node_modules/next/dist/docs/`** (`01-app`, `02-pages`, `03-architecture`, `index.md`) and obey deprecation notices there. Do not rely on remembered Next.js APIs.

## Project Identity

Personal portfolio for Abhi — CS student and Teaching Assistant at Northeastern University Miami.
Targeting Full Stack Developer / SDE roles. Built to impress hiring managers and recruiting talent.
Stack: Next.js 16, TypeScript, Tailwind CSS v4, Three.js / React Three Fiber, GSAP, Framer Motion,
Supabase, Anthropic API (Claude), Resend. Deployed on Vercel.

## Commands

- `npm run dev` — start the dev server (http://localhost:3000)
- `npm run build` — production build
- `npm run start` — serve the production build
- `npm run lint` — run ESLint
- `npm run typecheck` — tsc --noEmit (add this script if missing)

There is no test setup yet.

## Architecture

- **App Router** (`src/app/`). `layout.tsx` is the root layout; `page.tsx` is the route for `/`.
- **Styling: Tailwind CSS v4** — configured entirely in `src/app/globals.css` via `@import "tailwindcss"`. There is **no `tailwind.config.js`**. Theme tokens and dark mode live in that CSS file.
- **TypeScript**: `strict` mode; import alias `@/*` maps to `src/*`. No `any` types ever.
- **ESLint**: flat config (`eslint.config.mjs`).
- **Three.js scenes**: wrapped in React Three Fiber (`<Canvas>`), always lazy-loaded with `dynamic({ ssr: false })`.
- **Supabase client**: singleton in `src/lib/supabase.ts`.
- **API routes**: live in `src/app/api/`. Use Edge Runtime where possible.

## Code Style

- ES modules (import/export) only, never CommonJS (require)
- React functional components only, hooks for all state
- Tailwind for all styling — no inline styles, no CSS modules except for Three.js canvas wrappers
- File naming: kebab-case for files, PascalCase for component names
- Every component in its own file under `src/components/`
- Server Components by default — add `'use client'` only when interactivity or browser APIs are needed

## Design Language

- Apple-inspired liquid glass aesthetic: backdrop-blur, frosted glass cards, subtle border gradients
- Dark background (near-black `#0a0a0a`), accent colors: electric blue and soft white/cream text
- Smooth 60fps animations — performance is non-negotiable
- Mobile responsive, mobile-first
- Accessibility: semantic HTML, aria-labels on all interactive elements

## Performance Rules

- Three.js / R3F scenes must always lazy-load: `dynamic(() => import(...), { ssr: false })`
- Images always via `next/image`
- Fonts always via `next/font/google`, never a CDN `<link>`
- Target Lighthouse score above 90
- Never block the main thread with heavy computation — use Web Workers if needed

## Security Rules

- Never commit secrets or API keys
- All secrets in `.env.local`, referenced via `process.env.VARIABLE_NAME`
- Supabase anon key is safe to expose; service role key is never exposed to the client
- Anthropic API key is server-side only, never in client components

## Git Workflow

- One branch per feature: `feat/hero-scene`, `feat/ai-chat`, `feat/contact-form`, etc.
- Commit message prefixes: `feat:`, `fix:`, `chore:`, `style:`, `refactor:`
- Run `npm run lint` and `npm run typecheck` before committing
- Use `/compact` after completing each phase to keep context fresh

## Sections to Build (in order)

1. **Hero** — Three.js / R3F scene with liquid glass name card, GSAP text reveal
2. **About** — Glass card, animated stats (student, TA, hackathon finalist)
3. **Projects** — Filterable grid, Doly platform and NUGIC finalist featured prominently
4. **Skills** — Animated tech stack visualization
5. **Experience** — TA timeline (CS5800 Algorithms, OOD under Prof. Zhu at Northeastern Miami)
6. **AI Chat** — "Ask Claude about Abhi" recruiter-facing AI powered by Anthropic API
7. **Contact** — Form with Resend email delivery, submissions logged to Supabase

## Environment Variables Needed

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
RESEND_API_KEY=
```