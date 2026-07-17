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

## Client-side AI (no backend)

- **Engine:** Transformers.js (`@xenova/transformers`)
- **Model:** `Xenova/all-MiniLM-L6-v2` (embeddings, quantized)
- **Where it runs:** User browser only (first visit downloads the model once)
- **Service:** `src/lib/clientAi.ts` · hook: `src/hooks/useClientAi.ts`
- **Removed:** Ollama, server actions for AI, API keys

## Deploy on Vercel

1. Import GitHub repo on [vercel.com/new](https://vercel.com/new).
2. Framework: **Next.js** · Node **20+**.
3. Optional env: `NEXT_PUBLIC_SITE_URL=https://your-app.vercel.app`
4. Deploy — **no AI keys required**. Model loads in the visitor’s browser.

```bash
npx vercel --prod
```

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
