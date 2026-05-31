# RealtorFlow — Product Requirements Document

_Last updated: 2026-05-21_

This document is implementation-oriented. It describes what RealtorFlow is today, the shape of the system, and where it's going. Anything not on the roadmap is intentionally not being built.

---

## 1. Product Vision

RealtorFlow is a focused operations dashboard for residential real-estate agents and small teams. It replaces the typical patchwork of spreadsheets, Notes, group chats, and disconnected CRMs with a single place to manage listings, clients, leads, and appointments — plus AI-assisted marketing tools that remove the worst grunt work of the job (writing listing copy, polishing photos, drafting follow-ups).

The product is opinionated:
- Optimized for solo agents and 2–10 person teams. Not a brokerage-scale CRM.
- Web-first, mobile-friendly. Not a native app.
- Built around team-scoped data with strong tenant isolation from day one.
- AI features are additive — every workflow must work without them.

The success metric is whether an agent can run their daily book of business — listings, pipeline, today's appointments — without needing a second tool.

---

## 2. Target Users

**Solo realtors.** Primary persona. Currently juggling 10–40 active leads, 3–15 listings, and ad-hoc appointments across Google Calendar, a spreadsheet, and their phone. Time-poor, not technical, lives on mobile. Will pay for anything that demonstrably saves them an hour a week.

**Small teams (2–10 agents).** A team lead plus associate agents, sometimes a transaction coordinator. They share clients and listings, need visibility into each other's pipelines, and want clean handoffs. They are the reason the data model is team-scoped from day one.

**Team admins / owners.** Manage team membership, invite new agents, remove departed ones, and (eventually) view team-level reporting. Usually also an active agent themselves — not a dedicated ops role.

We are explicitly **not** targeting: brokerages with 50+ agents, MLS administrators, mortgage brokers, or buyer-side-only shops with no listings.

---

## 3. Current Completed Features (Phase 0 + Phase 1)

### Phase 0 — Scaffold
- React 19 + Vite + Tailwind 4 frontend.
- Supabase project with `properties`, `clients`, `leads`, `appointments` tables.
- Sidebar-driven dashboard layout (`DashboardLayout`).
- Pages: Dashboard, Properties, Clients, Leads, Appointments, AI Listing.
- Stat cards on Dashboard backed by live counts.
- AI Listing generator (mock — local `setTimeout`, no API call yet).

### Phase 1A — Multi-tenancy foundation (database)
Migrations `20260521120001` through `20260521120011`:
- Wiped demo data so `NOT NULL team_id` could be attached cleanly.
- Added `profiles`, `teams`, `team_members` (role enum: `owner | admin | member`), `team_invites`.
- Attached `team_id` and `created_by` to every domain table with cascading FKs and per-team indexes.
- `SECURITY DEFINER` helpers `is_team_member(uuid)` and `team_role_for(uuid)` to avoid recursive RLS evaluation.
- Triggers: auto-create `profiles` row on `auth.users` insert; auto-add team creator as `owner` in `team_members`.
- RLS enabled on every table with team-scoped read/write policies.
- `accept_invite(token)` RPC as the only path for a non-member to join a team (validates token, expiry, and email match).
- Grants fixes (`...009`, `...010`, `...011`) so `authenticated` role can actually exercise the policies.

### Phase 1B — Frontend auth + team context
- `AuthProvider` manages session, profile, team memberships, and active team.
- `last_team_id` persisted on `profiles` so the active team survives refresh.
- `ProtectedRoute` / `PublicRoute` / `TeamGate` route guards.
- Pages for `Login`, `Signup`, `AcceptInvite`, `NoTeam` (create-team-or-accept-invite onboarding).
- All domain pages filter by `activeTeamId` and stamp `team_id` on inserts.
- `ConfirmModal` for destructive actions across Properties, Clients, Leads, Appointments.

### Phase 1C — Migration baseline repair
Added `20260521120000_baseline_domain_tables.sql` to establish the four domain tables as the canonical baseline. Patched `20260521120003_attach_team_ownership` to use `ADD COLUMN IF NOT EXISTS` and idempotent FK constraints. Migration chain now supports clean db reset.

### Phase 2D — Team management UI
- `/team` page: member list with roles and join dates.
- Invite flow: `create_invite` RPC (`20260521120012`) generates a token, frontend builds the accept-invite URL and copies it to clipboard.
- Role change: owners/admins can update any other member's role inline.
- Remove member: owners/admins can remove members with confirmation modal.
- Current user's own row is protected from self-demotion and self-removal.

---

## 4. System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│ Browser (Vercel-hosted SPA)                                  │
│   React 19 + Vite + Tailwind 4 + React Router 7              │
│   - AuthProvider (session, profile, teams, activeTeamId)     │
│   - Route guards: ProtectedRoute / PublicRoute / TeamGate    │
│   - Pages talk to Supabase directly via @supabase/supabase-js│
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS (JWT in Authorization header)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ Supabase                                                     │
│   ├─ GoTrue (auth.users, email/password)                     │
│   ├─ PostgREST (auto-generated REST over Postgres)           │
│   ├─ Postgres                                                │
│   │    ├─ public.profiles, teams, team_members, invites      │
│   │    ├─ public.properties, clients, leads, appointments    │
│   │    ├─ RLS policies (team-scoped)                         │
│   │    ├─ SECURITY DEFINER helpers + accept_invite() RPC     │
│   │    └─ Triggers (handle_new_user, handle_new_team)        │
│   └─ Storage (planned, Phase 2C — listing photos)            │
└─────────────────────────────────────────────────────────────┘

(Planned, not yet built)
┌─────────────────────────────────────────────────────────────┐
│ Edge / serverless (Vercel functions or Supabase Edge)        │
│   - Anthropic API proxy (listing copy, follow-up drafts)     │
│   - Invite email sender                                      │
└─────────────────────────────────────────────────────────────┘
```

**Design choice:** the frontend talks to Supabase directly. There is no custom Node/Express backend yet, and there won't be one unless something specifically requires it (server-side AI calls, third-party API keys we can't ship to the browser, webhooks). The "Node.js / Express (planned)" line in `ARCHITECTURE.md` is aspirational and can be deferred indefinitely.

---

## 5. Current Database Model

### Tenancy
- `profiles (id PK → auth.users, full_name, avatar_url, last_team_id → teams)`
- `teams (id, name, slug UNIQUE, created_by → auth.users, created_at)`
- `team_members (team_id, user_id, role[owner|admin|member], joined_at)` — composite PK
- `team_invites (id, team_id, email citext, role, token UNIQUE, invited_by, expires_at, accepted_at)`

### Domain
Every domain table carries `team_id NOT NULL` (cascades on team delete) and `created_by` (sets null on user delete):
- `properties (address, price, beds, baths, sqft, status[active|pending|sold])`
- `clients (name, email, phone, type[Buyer|Seller], status[Active|Inactive])`
- `leads (name, email, phone, property_id -> properties, status[New|Contacted|Closed])`
- `appointments (title, client_id -> clients, property_id -> properties, date, time, type[Showing|Consultation|Closing|Follow Up])`

**Phase 2A relational integrity status:** `leads.property_id`, `appointments.client_id`, and `appointments.property_id` now reference the relevant domain tables. The old free-text columns were removed in `20260521120014_drop_text_fk_columns.sql`.

---

## 6. Auth / Team / RLS Overview

**Auth.** Supabase email + password. `auth.users` is the identity source; `public.profiles` is the app-owned mirror.

**Team selection.** A user can belong to multiple teams. `AuthProvider` loads all memberships and picks an active team — falling back from `profiles.last_team_id` → first membership → null. Active team is persisted back to `last_team_id` whenever the user switches.

**Onboarding paths.**
1. **New user, no team:** signs up → `TeamGate` redirects to `/welcome` → creates a team (trigger makes them `owner`).
2. **Invited user:** clicks invite link → `/accept-invite?token=…` → token stored in `localStorage` (`rf.pendingInviteToken`) → signs in or signs up → `accept_invite()` RPC validates token + email match + expiry → membership inserted.

**RLS model.** Every table has RLS enabled. The pattern is uniform:
- `select / insert / update / delete USING (is_team_member(team_id)) WITH CHECK (is_team_member(team_id))` on domain tables.
- `team_members` and `team_invites` writes gated to `owner | admin`.
- `accept_invite()` is the only way a non-member writes to `team_members` — it's `SECURITY DEFINER` and re-validates everything.

**Why `SECURITY DEFINER` helpers:** an RLS policy on `team_members` that reads `team_members` would recurse. The helpers run as definer, breaking the loop.

---

## 7. Roadmap from Phase 2 Onward

Phases are sized to be shippable in 1–2 weeks each. Each one adds visible user value, not just plumbing.

### Phase 2A — Relational integrity + listing detail
Relational integrity is partially complete: `20260521120013_add_fk_columns.sql` added nullable FK columns for leads and appointments, and `20260521120014_drop_text_fk_columns.sql` removed the old free-text columns after the frontend switched to FK dropdowns. Remaining work:
- A Property detail page (clicking a property card opens it).
- Activity log per property (who created, last edited, status changes).
- Broader cleanup around joined display/edit flows as detail pages land.

### Phase 2B — Real AI listing generator
Replaces the `setTimeout` mock with an actual Anthropic Claude call.
- Server-side proxy (Vercel function or Supabase Edge function) so the API key never ships to the browser.
- Prompt template that ingests structured property fields + free-text features + tone.
- Save generated copy back to the `properties` row (`description` column added).
- Regenerate / edit / version history (keep last N drafts).
- Prompt caching enabled to keep costs predictable.

### Phase 2C — Photos + media
- Supabase Storage bucket per team, RLS-gated by `team_members`.
- Upload, reorder, and delete photos on a property.
- Set a primary/hero photo, surfaced on the property card.
- Image optimization: client-side resize before upload to cap storage growth.
- _Stretch:_ AI photo enhancement (auto-crop, brightness, sky replacement) using a single external API — gated behind a feature flag.

### Phase 2D — Team management UI (complete)
- `/team` page: member list with roles and join dates.
- Invite flow: `create_invite` RPC (`20260521120012`) generates a token, frontend builds the accept-invite URL and copies it to clipboard.
- Role change: owners/admins can update any other member's role inline.
- Remove member: owners/admins can remove members with confirmation modal.
- Current user's own row is protected from self-demotion and self-removal.
- Team switcher in the sidebar for users on multiple teams.

### Phase 3A — Pipeline + analytics
- Kanban view for Leads (drag-and-drop between status columns).
- Dashboard widgets: pipeline value, conversion rate by stage, appointments this week, listings by status.
- Per-agent breakdown for team admins.

### Phase 3B — Calendar + reminders
- Connect Google Calendar (read + write) via OAuth so appointments sync both ways.
- Optional SMS / email reminders 24h and 1h before appointments (one external provider, behind feature flag).
- iCal export as a no-OAuth fallback.

### Phase 3C — AI follow-ups + content
- Draft follow-up email/SMS to a lead based on their last interaction.
- Listing social media blurbs (Instagram caption, Facebook post) generated from the listing description.
- All drafts are editable before send; nothing auto-sends.

### Phase 4 — MLS + public surfaces
This phase is intentionally vague until 2 + 3 land — MLS integration is a swamp and only worth entering once the core is sticky.
- Read-only MLS pull (one regional MLS to start) populates `properties` automatically.
- Public listing pages (`realtorflow.app/p/<slug>`) — shareable URL with the AI-generated copy and photos.
- Lead capture form on public listing → creates a `lead` tied to the property.

---

## 8. Feature Priorities

**Done:**
- Convert free-text `leads.property` / `appointments.client/property` to FKs.
- Team management UI (invite, role change, remove).
- Team switcher in sidebar.

**P0 (next up — Phase 2A/2B):**
1. Property detail page.
2. Real Anthropic-backed listing generator (with key on the server).

**P1 (Phase 2C):**
4. Photo uploads tied to properties.

**P2 (Phase 3):**
7. Lead pipeline kanban.
8. Dashboard analytics widgets.
9. Google Calendar sync.
10. AI follow-up drafts.

**P3 (Phase 4+):**
11. MLS integration (single region).
12. Public listing pages with lead capture.

---

## 9. Non-Goals

These are intentionally out of scope. If a user asks for them, redirect.

- **Brokerage-scale features.** No org-above-team hierarchy, no multi-team rollup reporting, no commission splits.
- **Accounting / commissions / 1099s.** Out of scope. Integrate with QuickBooks if needed; do not rebuild it.
- **Document management / e-signature.** No PDF redlining, no DocuSign clone. Link out.
- **Mortgage / loan calculators.** Not the product.
- **Native mobile app.** Responsive web only through Phase 4.
- **Marketplace / consumer-facing search.** RealtorFlow is for the agent, not the buyer.
- **Real-time chat between agents.** Slack exists.
- **White-label / multi-tenant resale.** Single SaaS surface only.

---

## 10. UX Principles

1. **Empty state ≠ broken.** Every list page must look intentional with zero rows — clear prompt, single primary CTA.
2. **One primary action per page.** Don't make the user hunt. The "+ New X" button is always top-right.
3. **Destructive actions confirm, non-destructive ones don't.** `ConfirmModal` for delete; no confirm for create/edit.
4. **Optimistic UI where safe.** Status changes, reorderings, drag-drops update locally before the round-trip.
5. **Avoid modals for anything that needs >6 fields.** Use a detail page or side panel instead.
6. **Mobile is a first-class layout, not a responsive afterthought.** Every page must be usable on a phone.
7. **AI is suggestion, never authority.** Generated content always lands in an editable field with an obvious "regenerate" and "use as-is" path.
8. **Speed budget: a list page must render in under 300ms on a warm cache.** If a query can't, paginate.

---

## 11. Technical Constraints

- **Stack is fixed for now:** React 19, Vite, Tailwind 4, Supabase, Anthropic Claude. No swapping unless there's a concrete blocker.
- **No second backend service yet.** Edge/serverless functions only where strictly required (API key handling, webhooks).
- **RLS is the security boundary.** Don't add server-side endpoints that bypass it without a documented reason.
- **All domain tables must carry `team_id` from creation.** No table without tenancy.
- **Migrations are append-only and timestamp-named.** Existing migrations are immutable; fixes are new migrations.
- **No PII beyond what's already in the data model.** Phone, email, name only. No SSN, no DOB, no financial data.
- **No third-party trackers/analytics in the SPA without an env-var flag.** Default off.
- **Bundle budget:** keep the SPA initial JS under ~250 KB gzipped. Lazy-load AI/analytics chunks.
- **Browser support:** evergreen Chrome, Safari, Firefox, Edge. No IE, no pre-2024 Safari.

---

## 12. Deployment Goals

- **Frontend:** Vercel. PR previews on every branch. `main` deploys to production on merge.
- **Database:** Supabase managed. Migrations applied via `supabase db push` from a CI step (not yet wired — currently manual).
- **Secrets:** Supabase URL + anon key are public (ship to browser). Service role and Anthropic key live in Vercel env vars and Supabase function secrets — never in the repo, never in the client bundle.
- **Environments:** `production` and `preview` only for now. A separate `staging` Supabase project is on the table once we have paid users.
- **Backups:** Supabase daily snapshots. Pre-Phase-4, that's enough; once MLS data lands, add a weekly logical dump to S3.
- **Observability:** Vercel logs + Supabase logs. Add Sentry (or equivalent) before the first paid user.
- **Cost ceiling for MVP:** stay on Vercel + Supabase free/hobby tiers through Phase 2. Upgrade triggered by traffic, not vibes.

---

## 13. Future AI / Photo / Team-Management Ideas

These are speculative — captured here so they're not lost, not committed.

**AI directions:**
- Voice-to-note: agent dictates after a showing, transcript becomes a structured update on the lead/client/property.
- Listing translation (Spanish, Mandarin, etc.) for the same property — one click, multiple stored versions.
- "Why did this lead go cold?" — Claude summarizes the activity log of a stalled lead and suggests next steps.
- Comparative market analysis assist: paste 3–5 comp addresses, get a structured pricing argument.
- Buyer matching: given a client's preferences in free text, rank the team's active listings.

**Photo / media directions:**
- AI virtual staging (empty room → furnished render).
- Auto sky / lawn replacement on exterior shots.
- Floor plan extraction from a photo.
- Short-form video generation: stitch property photos into a 15s reel with music + Ken-Burns pans.

**Team-management directions:**
- Lead round-robin assignment for teams that share inbound leads.
- "Cover for me" mode: temporarily reassign a member's pipeline to a teammate.
- Per-team templates (listing copy presets, email signatures, brand colors on public pages).
- Audit log surfaced to admins (who deleted what, when).
- SSO / Google Workspace login once we sell to a team with that requirement.

---

# Phased Roadmap (Concise)

A standalone summary view of section 7. Use this as the checklist.

## Phase 2A — Relational integrity + listing detail
- Convert `leads.property`, `appointments.client`, `appointments.property` from text to FKs. (complete)
- Dropdown pickers for client/property in lead and appointment forms. (complete)
- Property detail page (route, layout, activity log).

## Phase 2B — Real AI listing generator
- Server-side Anthropic proxy (Vercel function or Supabase Edge).
- Replace mock with real Claude call; structured prompt + tone.
- Save description on `properties`; keep last N drafts; regenerate + edit flow.
- Prompt caching enabled.

## Phase 2C — Photos + media
- Supabase Storage bucket per team, RLS-gated.
- Upload, reorder, delete, set hero photo on properties.
- Client-side resize before upload.
- _Stretch:_ AI photo enhancement behind a flag.

## Phase 2D — Team management UI (complete)
- `/team` page: member list with roles and join dates.
- Invite flow: `create_invite` RPC (`20260521120012`) generates a token, frontend builds the accept-invite URL and copies it to clipboard.
- Role change: owners/admins can update any other member's role inline.
- Remove member: owners/admins can remove members with confirmation modal.
- Current user's own row is protected from self-demotion and self-removal.
- Team switcher in the sidebar.

## Phase 3A — Pipeline + analytics
- Leads kanban (drag between New / Contacted / Closed).
- Dashboard widgets: pipeline value, conversion rate, weekly appointments.
- Per-agent breakdown for admins.

## Phase 3B — Calendar + reminders
- Google Calendar two-way sync.
- SMS/email reminders behind a flag.
- iCal export fallback.

## Phase 3C — AI follow-ups + content
- Draft follow-up email/SMS from lead activity.
- Social blurb generator (IG caption, FB post) from listing description.
- All AI output is editable; nothing auto-sends.

## Phase 4 — MLS + public surfaces
- Read-only MLS pull for one region.
- Public listing pages (`/p/<slug>`) with photos + AI copy.
- Lead capture form on public pages → creates a `lead`.
