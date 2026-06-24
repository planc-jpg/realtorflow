# RealtorFlow

RealtorFlow is a real estate CRM and operations dashboard for solo agents and small teams. It helps teams manage listings, clients, leads, appointments, team membership, and invite-based onboarding from a single Supabase-backed React app.

The current AI listing page uses an in-app mock generator. The repository includes the Anthropic SDK dependency and product planning notes for a server-side Claude integration, but no real Anthropic API call is wired into the shipped client.

## Features

- Email/password authentication with Supabase Auth.
- Team workspaces with owner/admin/member roles.
- Invite links for onboarding teammates through Supabase RPC functions.
- Team-scoped dashboard counts for properties, clients, leads, and appointments.
- Property listing CRUD with detail pages, status badges, and linked leads/appointments.
- Client CRM cards with buyer/seller status and edit/delete workflows.
- Lead pipeline board with New, Contacted, and Closed columns.
- Appointment scheduling linked to clients and properties.
- Mock AI listing description generator with copy-to-clipboard support.
- Row-level security policies and SQL migrations for the Supabase schema.
- Vercel rewrite config for single-page app routing.

## Tech Stack

- React 19
- Vite 6
- TypeScript configuration with TSX source files
- Tailwind CSS 4 via `@tailwindcss/vite`
- Supabase Auth, Postgres, PostgREST, RPC, and RLS
- React Router 7
- Radix UI/shadcn-style primitives
- Lucide React and Tabler icons
- Recharts
- Vercel-ready static frontend

## Project Structure

```text
.
├── frontend/              # React/Vite app
│   ├── src/auth/          # Auth provider, guards, and auth constants
│   ├── src/components/    # Layout and shared UI components
│   ├── src/lib/           # Supabase client and utilities
│   └── src/pages/         # Dashboard, CRM pages, auth pages, team pages
├── supabase/
│   ├── migrations/        # Database schema, RLS, triggers, RPCs
│   ├── config.toml        # Local Supabase configuration
│   └── _schema_snapshot.sql
├── docs/                  # Product, architecture, task, and prompt notes
└── package.json           # Root dev dependency metadata
```

## Prerequisites

- Node.js 20 or newer.
- npm.
- A Supabase project, or the Supabase CLI if you want to run migrations locally.

## Environment Variables

Create `frontend/.env.local` from `frontend/.env.example`:

```bash
cd frontend
cp .env.example .env.local
```

| Variable | Required | Description |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | Yes | Your Supabase project URL. This is safe to expose in the browser. |
| `VITE_SUPABASE_ANON_KEY` | Yes | Your Supabase anon public key. This is safe to expose in the browser when RLS is configured correctly. |

Do not put Supabase service-role keys, Anthropic keys, OpenAI keys, or other private credentials in `VITE_*` variables. Browser-exposed Vite variables are bundled into the frontend.

## Setup

Install frontend dependencies:

```bash
cd frontend
npm install
```

Configure Supabase:

1. Create a Supabase project.
2. Copy the project URL and anon key into `frontend/.env.local`.
3. Apply the SQL migrations in `supabase/migrations` to your database.
4. In Supabase Auth settings, add your local and deployed URLs to allowed redirect URLs:
   - `http://localhost:5173`
   - `http://localhost:5173/reset-password`
   - `http://localhost:5173/accept-invite`
   - Your production equivalents.

Start the development server:

```bash
cd frontend
npm run dev
```

Build for production:

```bash
cd frontend
npm run build
```

Preview the production build:

```bash
cd frontend
npm run preview
```

Run linting:

```bash
cd frontend
npm run lint
```

## Usage Guide

1. Sign up with an email address and password.
2. Create a team workspace from the welcome screen.
3. Add properties with address, price, bed/bath count, square footage, and status.
4. Add clients and leads, then connect leads and appointments to properties where relevant.
5. Use the Team page to rename the workspace, invite members, and manage roles.
6. Share an invite link with a teammate. The recipient signs in or signs up, then accepts the invite through `/accept-invite?token=...`.
7. Use the AI Listing page to draft mock listing copy from property details and copy the result.

## Deployment Notes

- The frontend is a static Vite app and can be deployed to Vercel.
- `frontend/vercel.json` rewrites all routes to `index.html` so React Router routes work after refresh.
- Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in your hosting provider's environment settings.
- Keep any future AI provider keys on a server-side endpoint or Supabase Edge Function. Do not call private AI APIs directly from this browser client.

## Security Notes

- The repository is configured to ignore `.env`, `.env.*`, and local Supabase env files while allowing `.env.example` files.
- Supabase anon keys are public by design, but RLS must stay enabled and tested before production use.
- The migrations enable RLS on app tables and scope reads/writes by team membership.
- Invite tokens are generated server-side through RPC functions and expire after seven days.

## Release Cleanup Notes

- `backend/`, `screenshots/`, and `docs/image/` are currently empty local directories and do not need to be included in a public repository unless they gain real content.
- `frontend/src/assets/react.svg` and `frontend/src/assets/vite.svg` appear to be starter assets and are not referenced by the app.
- `docs/PROJECT_SPEC.md` has local uncommitted changes at the time of this review; inspect them before publishing.

## License

This project is released under the MIT License. See [LICENSE](LICENSE).
