# CareerForge

Bilingual resume analysis, explainable ATS scoring, job matching, editing, interview coaching, and career planning by SoftBridge Solutions.

## Stack

- Next.js 16 App Router, React 19, strict TypeScript
- Tailwind CSS 4, Zustand, Lucide
- Supabase Auth with Google OAuth and cookie-based SSR sessions
- Browser-local resume parsing, ATS analysis, and workspace persistence

## Local development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3001](http://localhost:3001). Without Supabase variables, the full local/demo product remains usable and the login page shows a configuration state.

## Supabase and Google login setup

The app needs only a Supabase Project URL and publishable key. The Google Client Secret is stored in Supabase, never in this repository or in a `NEXT_PUBLIC_` variable.

### 1. Create the Supabase project

1. Create a project at [Supabase](https://supabase.com/dashboard).
2. Open the project's **Connect** dialog.
3. Copy **Project URL** and **Publishable key** into `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_YOUR_KEY
NEXT_PUBLIC_SITE_URL=http://localhost:3001
```

Do not use the `service_role` key. `.env.local` is gitignored.

### 2. Create the Google OAuth client

1. Open [Google Auth Platform](https://console.cloud.google.com/auth/overview) and select or create a project.
2. Configure **Branding** and **Audience**. During testing, add the Google accounts that may sign in as test users.
3. Under **Data Access**, keep only `openid`, email, and profile scopes.
4. Open **Clients**, create an OAuth Client ID, and choose **Web application**.
5. Add these **Authorized JavaScript origins**:
   - `http://localhost:3001`
   - `https://softbridge-career-forge-full-stack-brown.vercel.app`
6. In Supabase, open **Authentication → Sign In / Providers → Google** and copy the callback URL shown there.
7. Add that exact Supabase URL to Google's **Authorized redirect URIs**. It normally looks like:

```text
https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
```

The Google redirect URI points to Supabase, not to `/auth/callback` in this Next.js app.

### 3. Enable Google in Supabase

1. Copy the Google **Client ID** and **Client Secret**.
2. Paste both into **Supabase → Authentication → Sign In / Providers → Google**.
3. Enable the provider and save.
4. Open **Authentication → URL Configuration**.
5. Set **Site URL** to the production URL:

```text
https://softbridge-career-forge-full-stack-brown.vercel.app
```

6. Add these **Redirect URLs**:

```text
http://localhost:3001/auth/callback
https://softbridge-career-forge-full-stack-brown.vercel.app/auth/callback
```

For Vercel previews, add a branch-specific callback or a controlled preview wildcard in Supabase. Keep the production callback exact.

### 4. Add Vercel environment variables

In **Vercel → Project Settings → Environment Variables**, add the following to Production, Preview, and Development:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
NEXT_PUBLIC_SITE_URL
```

Use the production site URL for `NEXT_PUBLIC_SITE_URL` in Production. Redeploy after changing environment variables.

## Authentication architecture

- `src/proxy.ts` refreshes Supabase session cookies but is not the authorization gate.
- `src/app/auth/callback/route.ts` exchanges the Google PKCE code for a session.
- `src/app/account/page.tsx` validates the user again on the server.
- `/login`, `/privacy`, and `/terms` support the complete sign-in and consent experience.
- Resume and ATS data remain in browser `localStorage`; sign-in currently provides identity, not cloud resume sync.

## Quality commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the app on port 3001 |
| `npm run lint` | Run ESLint |
| `npx tsc --noEmit` | Run strict type-checking |
| `npm run build` | Create the production build |
| `npm audit` | Review dependency advisories |

## Product routes

- `/` — product-first landing and demo entry
- `/dashboard` — operational career workspace
- `/forge` — resume and target-role analysis
- `/resume` — live resume editor and PDF preview
- `/jobs` — explained sample job matches
- `/coach` — resume-grounded career and interview coach
- `/paths` — career roadmaps
- `/login` and `/account` — Supabase/Google session flow

Production is deployed from the GitHub `main` branch on Vercel.
