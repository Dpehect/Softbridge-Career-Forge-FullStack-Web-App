# Softbridge-Career-Forge-FullStack-Web-App

Career platform by **Softbridge Solutions** — curated jobs, skill paths, a resume forge, and a practical career coach.

## Stack

- Next.js 16 (App Router)
- React 19 + TypeScript
- Tailwind CSS 4
- Framer Motion, Zustand, Lucide

## Getting started

```bash
npm install
cp .env.example .env.local   # optional
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy on Vercel

1. Push this repo to GitHub (already: `Dpehect/Softbridge-Career-Forge-FullStack-Web-App`).
2. [vercel.com/new](https://vercel.com/new) → **Import** the GitHub repo.
3. Framework: **Next.js** (auto). Root directory: `.` · Node **20+**.
4. **Environment Variables** (Project → Settings → Environment Variables):

| Name | Value | Notes |
| ---- | ----- | ----- |
| `NEXT_PUBLIC_SITE_URL` | `https://your-domain.vercel.app` | Production URL (after first deploy, update) |
| `OLLAMA_BASE_URL` | *(optional)* | Public HTTPS Ollama endpoint only. **Do not use localhost on Vercel.** |
| `OLLAMA_MODEL` | `llama3` | Optional |

5. Deploy. Client-side CV analysis works without Ollama. Header AI light will show **offline** on Vercel unless you expose a remote Ollama URL.

```bash
# CLI alternative
npx vercel
npx vercel --prod
```

Config files: `vercel.json`, `.env.example`, `next.config.ts` (serverActions body limit).

## Scripts

| Command         | Description              |
| --------------- | ------------------------ |
| `npm run dev`   | Development server       |
| `npm run build` | Production build         |
| `npm run start` | Start production server  |
| `npm run lint`  | ESLint                   |

## Product surfaces

- **/** — Marketing landing
- **/forge** — Forge AI: CV parse, JD match, optimize, cover letter, ATS, chatbot, mock interview, history
- **/jobs** — Searchable job board
- **/paths** — Skill / career paths with module tracking
- **/resume** — Live resume editor + preview
- **/coach** — Career coach (demo)
- **/dashboard** — Saved jobs, applications, path progress

Progress and Forge history are persisted in the browser via Zustand + `localStorage` (local & private).
