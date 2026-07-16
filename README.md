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
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

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
