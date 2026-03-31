# ClubOS — Design Specification

**Date:** 2026-03-31
**Author:** QED Digitalisation
**Status:** Draft — pending user review
**Repo:** https://github.com/Dromdallagan/GAA.git
**Branch:** master (production), develop (preview)

---

## 1. Product Vision

ClubOS is a **multi-tenant SaaS platform** that gives every GAA county board in Ireland an AI-powered operating system for club management — delivered entirely through WhatsApp and a world-class admin dashboard.

**The core promise:** Volunteers become approvers, not doers. The system thinks for itself, acts proactively, and uses WhatsApp as both the member AND admin interface. The web dashboard exists for reporting and complex tasks.

**First customer:** Derry GAA (pilot). **Target market:** All 32 GAA county boards. **Business model:** QED takes 10% margin on operational revenue via Stripe Connect.

### World-Class Differentiators

1. **Match Day Experience** — LiveScore for local GAA. Managers send voice/text updates during matches → live scores broadcast via WhatsApp Channel (free) + real-time public scoreboard (Supabase Realtime). Before: auto fixture reminder with location pin, calendar link, weather forecast. After: AI-generated match report, branded score graphic, auto-published to socials.

2. **Proactive AI Agents** — Six autonomous agents running 24/7 via Inngest + Claude AI. Registration Guardian, Revenue Sentinel, Fixture Intelligence, Member Retention AI, Content Engine, Smart Scheduler. Nobody asks them to run — they notice problems and act.

3. **WhatsApp Admin Interface** — Officers manage the club via WhatsApp conversation with the AI. Secretary texts "Cancel the U16 match tomorrow" → done. Treasurer asks "How are memberships?" → gets stats + can trigger reminders. Dashboard is for reporting; daily operations happen through conversation.

---

## 2. Maximum Offload Architecture

### Philosophy

> Every line of code we write is a line we must maintain, a potential bug, something we must test. Offload EVERYTHING possible to battle-tested services.

**Custom code target: ~1,500 lines.** We are the orchestration brain. The platforms are the muscle.

### Service Stack

| Service | Heavy Lifting | Our Code |
|---------|--------------|----------|
| **WhatsApp (Meta)** | Flows (forms), Channels (free broadcasts), Carousel templates, Location messages, Voice notes, Interactive buttons/lists | Zero — configure in Meta Business Manager |
| **Twilio** | Studio (visual routing), Conversations (state), Verify (OTP), Content Builder (templates) | ~50 lines (webhook handler + signature validation) |
| **Supabase** | PostgreSQL, Auto-API (zero endpoints), RLS (data isolation), Auth (admin login), Realtime (live dashboard), Storage (files), pgvector (semantic search), Database Webhooks (event triggers) | Schema + RLS policies only |
| **Stripe Connect** | Payment Links (checkout), Customer Portal (billing), Billing (subscriptions), Tax, Invoicing, Auto revenue splitting (QED 10% margin), Express dashboard for county boards | ~100 lines (webhook handler) |
| **Inngest** | Cron jobs, event-driven workflows, automatic retries, fan-out, sleep/wake, step functions, visual debugging | ~400 lines (function definitions) |
| **Claude AI** | Tool use (structured queries), Vision (read images), Audio transcription (voice notes), Content generation (reports), Streaming, Prompt caching | ~200 lines (prompts + tool definitions) |
| **Resend** | React Email templates, delivery tracking, open/click analytics | ~30 lines |
| **Upstash** | Rate limiting, caching, session storage | ~20 lines |
| **Sentry** | Error tracking, performance monitoring, session replay, release health, alerts | 3 lines (init) |
| **Vercel** | Deploy, CDN, Edge, OG image generation (@vercel/og), Analytics, Speed Insights, Cron, Custom domains | Zero — git push to deploy |

### What Platforms Handle That We Don't Build

- Message routing logic (Twilio Studio — visual, no code)
- Conversation state management (Twilio Conversations — automatic)
- REST API endpoints (Supabase Auto-API — automatic for every table)
- Checkout forms (Stripe Payment Links — hosted, PCI compliant)
- Billing management UI (Stripe Customer Portal — self-serve)
- Revenue splitting and payouts (Stripe Connect — automatic)
- Background job queues (Inngest — serverless, auto-retry)
- Email infrastructure and deliverability (Resend)
- Rate limiting and caching (Upstash)
- Error tracking and alerting (Sentry)
- Deployment pipeline and scaling (Vercel)
- Form UI in WhatsApp (Meta WhatsApp Flows)
- Free broadcasting (WhatsApp Channels)
- Live data updates to browsers (Supabase Realtime)
- Event triggering from data changes (Supabase Database Webhooks)

---

## 3. Tech Stack

```
Next.js 16 (App Router)
├── React 19 with Server Components
├── TypeScript 5.4+ (strict mode, zero `any`)
├── Tailwind CSS 4.x (OKLCH color space)
├── shadcn/ui (Radix primitives)
├── Motion (ex-Framer Motion) for animations
├── Motion Primitives + Animate UI for premium motion
├── shadcn Charts (Recharts v3, 53 variants)
├── TanStack Table + Tablecn for data tables
├── cmdk for CMD+K command palette
├── Geist Sans (UI) + Geist Mono (data/scores)
├── React Email (branded email templates)
└── @vercel/og (dynamic OG score graphics)

Supabase (PostgreSQL 16+)
├── Row Level Security (mandatory on every table)
├── Auto-generated REST API (zero custom endpoints)
├── Realtime subscriptions (live scoreboard)
├── Auth (admin dashboard login)
├── Storage (crests, team photos, documents)
├── pgvector (semantic search for AI queries)
├── Database Webhooks (trigger Inngest on data changes)
└── Edge Functions (if needed for complex logic)

Deployment
├── Vercel (auto-deploy from git)
├── master → production
├── develop → preview/staging
├── Feature branches → PR preview URLs
└── Custom domains per county board
```

---

## 4. Tenant Architecture

### Hierarchy

```
QED Platform (super_admin)
└── County Board (type: 'county_board')
    ├── domain: app.derrygaa.ie
    ├── twilio_phone_sid: dedicated WhatsApp number
    ├── stripe_connect_id: Express connected account
    ├── theme: { accent: '#ef4444', crest_url: '...' }
    └── Club (type: 'club', parent_id → county)
        └── Teams (Senior Football, U16 Hurling, etc.)
```

### Tenant Resolution

**Dashboard access:**
1. Browser hits custom domain (e.g., `app.derrygaa.ie`)
2. Vercel routes to ClubOS app
3. `proxy.ts` resolves hostname → looks up `organizations` table by `domain` field
4. Sets `x-org-id` header + cookie
5. All Supabase queries scoped by `organization_id`
6. RLS enforces isolation even if code has bugs

**WhatsApp access:**
1. Member sends WhatsApp message to county board's number
2. Twilio receives → fires webhook to ClubOS
3. Webhook resolves "To" phone number → looks up org by `twilio_phone_sid`
4. All processing scoped to that org

**Stripe payments:**
1. Member clicks Stripe Payment Link
2. Payment processed by Stripe → split via Connect
3. QED platform takes 10% margin automatically
4. County board's Express account receives remainder
5. Webhook fires → ClubOS updates Supabase

### Branding

- Each county board has: `accent_color`, `crest_url`, `name`, `name_irish`
- OKLCH tokens generated from accent color
- Dashboard renders with county board's crest and colours
- "Powered by ClubOS" in footer (co-branded)
- Semantic colours (success/warning/error) never change per-tenant

---

## 5. Database Schema

### Core Tables

**organizations** — The tenant table
- `id`, `name`, `name_irish`, `slug`, `type` (county_board | club)
- `parent_id` (self-referencing for county → club hierarchy)
- `domain` (custom domain for dashboard access)
- `twilio_phone_sid`, `twilio_studio_flow_sid`
- `stripe_connect_id` (Stripe Express connected account)
- `theme` JSONB (`accent_color`, `crest_url`, `secondary_color`)
- `settings` JSONB (lotto config, notification prefs, feature flags)
- RLS: users see only their own org and children

**org_users** — Dashboard admins and WhatsApp officers
- `id`, `organization_id`, `user_id` (→ auth.users)
- `role`: super_admin | owner | admin | secretary | treasurer | registrar | pro | manager
- `phone_number` (for WhatsApp admin interface — identifies officer role)
- `permissions` JSONB
- RLS: users see their own memberships

**members** — Club members (identified by phone, not login)
- `id`, `organization_id`
- `phone_number` (E.164), `phone_hash` (SHA256 for lookups)
- `first_name`, `last_name`, `email`, `date_of_birth`
- `membership_type` (adult | youth | student | family | social)
- `membership_status` (pending | active | expired | suspended)
- `membership_expires_at`
- `foireann_id` (GAA's official registration system ID)
- `stripe_customer_id`
- `engagement_score` (0-100, updated by Retention AI agent)
- `last_interaction_at`
- UNIQUE on (organization_id, phone_hash)
- RLS: org users see their org's members

**teams** — Teams within clubs
- `id`, `organization_id`, `club_id` (→ organizations where type='club')
- `name`, `code` (football | hurling | camogie | lgfa)
- `level` (senior | intermediate | junior | u21 | minor | u16 | u14 | u12)
- `manager_id` (→ org_users)

**competitions** — Championships, leagues, cups
- `id`, `organization_id`
- `name`, `code`, `level`, `type` (championship | league | cup)
- `season`, `status` (upcoming | active | completed)
- `settings` JSONB (group structure, point rules)

**venues** — GAA grounds with GPS
- `id`, `organization_id`
- `name`, `address`, `latitude`, `longitude`
- `capacity`, `facilities` JSONB
- Used for location pins in WhatsApp messages

**fixtures** — Matches
- `id`, `organization_id`, `competition_id`
- `home_team_id`, `away_team_id` (→ teams or organizations)
- `venue_id` (→ venues)
- `scheduled_at`, `status` (scheduled | live | completed | postponed | cancelled)
- `home_score_goals`, `home_score_points`, `away_score_goals`, `away_score_points`
- `live_updates` JSONB[] (array of match events for live scoring)
- `match_report` TEXT (AI-generated, PRO-approved)
- `scorers` JSONB, `man_of_match`
- `submitted_by`, `submitted_at`, `verified` BOOLEAN
- `weather_forecast` JSONB (populated by Fixture Intelligence agent)
- RLS: org users see their org's fixtures

**match_events** — Live scoring events (pushed via Supabase Realtime)
- `id`, `fixture_id`, `organization_id`
- `event_type` (goal | point | wide | card | substitution | half_time | full_time)
- `team` (home | away), `player_name`
- `minute`, `description`
- `created_at`

**subscriptions** — Supporter subscriptions (Stripe manages lifecycle)
- `id`, `organization_id`, `member_id`
- `stripe_customer_id`, `stripe_subscription_id`
- `plan_type` (monthly | annual | family)
- `status` (active | past_due | cancelled | expired)
- `current_period_start`, `current_period_end`

**conversations** — WhatsApp conversation state for AI
- `id`, `organization_id`, `member_id`
- `phone_number`, `is_admin_session` BOOLEAN
- `context` JSONB (conversation history for Claude)
- `last_message_at`

**agent_runs** — Proactive AI agent audit trail
- `id`, `organization_id`
- `agent_type` (registration_guardian | revenue_sentinel | fixture_intelligence | member_retention | content_engine | smart_scheduler)
- `status` (running | completed | failed)
- `findings` JSONB (what the agent discovered)
- `actions_taken` JSONB[] (what it did about it)
- `ran_at`, `next_run_at`

**content_queue** — PRO approval workflow
- `id`, `organization_id`
- `type` (match_report | social_post | weekly_roundup | press_release)
- `content` TEXT (AI-generated content)
- `metadata` JSONB (fixture_id, platforms to publish to, etc.)
- `status` (draft | pending_approval | approved | published | rejected)
- `approved_by`, `approved_at`, `published_at`

**message_costs** — Twilio usage tracking per org per month
- `id`, `organization_id`
- `period_start`, `period_end`
- `marketing_count`, `marketing_cost`
- `utility_count`, `utility_cost`
- `service_count`, `service_cost`
- `total_cost`

**revenue_reports** — Monthly financial reports per org
- `id`, `organization_id`
- `period_start`, `period_end`
- `gross_revenue`, `stripe_fees`, `twilio_costs`
- `qed_margin_rate` (0.10), `qed_margin_amount`
- `net_to_organization`
- `settled` BOOLEAN, `settlement_reference`

**audit_log** — Every sensitive mutation
- `id`, `organization_id`, `user_id`
- `action`, `entity_type`, `entity_id`
- `old_values` JSONB, `new_values` JSONB
- `ip_address`, `created_at`

### Database Functions & Triggers

- `update_updated_at()` trigger on all tables with `updated_at`
- `has_role_on_org(user_id, org_id, roles[])` for RLS policies
- `increment_message_cost(org_id, category, cost)` atomic counter
- Database webhooks on `fixtures` (INSERT/UPDATE) → trigger Inngest broadcasts
- Database webhooks on `match_events` (INSERT) → trigger Supabase Realtime + Channel broadcast
- Database webhooks on `members` (INSERT) → trigger welcome sequence
- Database webhooks on `content_queue` (UPDATE to 'approved') → trigger multi-channel publish

---

## 6. WhatsApp Architecture

### Twilio Studio Flow (Visual, No Code)

```
Incoming WhatsApp Message
    ↓
Split: Is sender an officer? (check phone against org_users)
    ├── YES → Admin Flow (WhatsApp Admin Interface)
    │         Claude AI with admin tools (cancel fixture, send reminders, etc.)
    └── NO → Member Flow
              ↓
         Split: Keyword?
         ├── "lotto"      → WhatsApp Flow (number picker) [NICE-TO-HAVE]
         ├── "fixture"    → HTTP Request → /api/webhooks/twilio/fixtures
         ├── "register"   → WhatsApp Flow (registration form)
         ├── "help"       → Static help menu
         ├── Voice note   → HTTP Request → /api/webhooks/twilio/voice
         └── Default      → HTTP Request → /api/webhooks/twilio/ai (Claude)
```

### WhatsApp Features Used

| Feature | Use Case | Code Required |
|---------|----------|---------------|
| **WhatsApp Flows** | Registration forms, lotto number picker, feedback surveys | Zero — configure in Meta Business Manager |
| **WhatsApp Channels** | Free broadcasting: results, fixtures, news | Zero — one-time setup, post via API |
| **Carousel Templates** | Swipeable fixture cards with "Add to Calendar" CTA | Zero — configure template in Twilio Content Builder |
| **Interactive Buttons** | Quick replies (Yes/No), CTA buttons (Pay Now) | Zero — part of template |
| **Interactive Lists** | Pick a fixture from a list, select membership type | Zero — part of template |
| **Location Messages** | Venue pin with one-tap directions | 5 lines (send location with lat/lng from venues table) |
| **Voice Notes** | Manager sends voice → transcribe → parse result/report | ~30 lines (receive audio, transcribe, process) |
| **Media Messages** | Team photos, receipts (PDF), score graphics | ~20 lines (generate + send) |

### WhatsApp Admin Interface

Officers identified by phone number + role in `org_users`. When an officer messages, Twilio Studio routes to the admin flow. Claude AI has admin-level tools:

| Officer | Example Command | Claude Tools |
|---------|----------------|--------------|
| Secretary | "Cancel the U16 match tomorrow" | `cancel_fixture`, `notify_teams`, `update_channel` |
| Treasurer | "How are memberships looking?" | `get_membership_stats`, `send_payment_reminders` |
| Registrar | "Who's not registered for championship?" | `get_unregistered_players`, `send_registration_reminders` |
| PRO | "Write a post about yesterday's win" | `generate_social_post`, `queue_for_approval` |
| Manager | "We beat Slaughtneil 2-14 to 1-10" | `submit_result`, `trigger_publish_workflow` |

---

## 7. Proactive AI Agents

Six autonomous agents running on Inngest cron schedules + Claude AI. Each agent:
1. Queries Supabase for relevant data
2. Uses Claude AI to analyze and make decisions
3. Takes action (sends WhatsApp messages, creates content, flags issues)
4. Logs everything to `agent_runs` for audit trail
5. Officers can review what agents did in the dashboard

### Agent Definitions

**Registration Guardian** (runs daily)
- Scans all teams for unregistered players approaching championship deadlines
- Sends personalized WhatsApp reminders to players/parents
- Alerts registrar with summary: "12 U16 players unregistered, deadline in 9 days"
- Escalates to secretary if deadline is within 48 hours

**Revenue Sentinel** (runs daily)
- Tracks membership renewal rates vs same period last year
- Detects when revenue is falling behind target
- Generates treasurer's weekly digest (auto-sent every Monday)
- Suggests targeted campaigns for clubs with low renewal rates

**Fixture Intelligence** (runs daily + on fixture insert)
- Detects scheduling clashes across all teams and codes
- Checks weather forecast for upcoming weekend matches (weather API)
- Monitors venue availability (if venues are shared)
- Flags issues to secretary before they become problems

**Member Retention AI** (runs weekly)
- Calculates engagement score for every member (0-100) based on: last interaction, payment history, attendance, message response rate
- Identifies members likely to churn (engagement score dropping)
- Triggers personalized re-engagement: "We haven't seen you in a while — the U14s play Saturday at 10am in Owenbeg, fancy coming along?"

**Content Engine** (runs Sunday evening + on result submission)
- Auto-generates weekly roundup of all results
- Creates social media content for each result (text + OG image)
- Drafts press releases for notable wins
- Queues everything in `content_queue` for PRO approval

**Smart Scheduler** (runs monthly + context-aware)
- Knows the GAA calendar rhythm (pre-season, league, championship, off-season)
- Auto-creates future lotto draws (when lotto feature is enabled)
- Prepares AGM report data before AGM season
- Schedules registration reminder sequences at appropriate times

---

## 8. Match Day Experience

### Timeline

**48 hours before:**
1. Inngest cron triggers fixture reminder
2. WhatsApp message sent to subscribed members:
   - Fixture details (teams, time, competition)
   - Carousel card with "Add to Calendar" CTA
   - Location pin with venue GPS + one-tap directions
   - Weather forecast snippet
3. Posted to WhatsApp Channel (free)

**During match (manager sends updates via WhatsApp):**
1. Manager texts: "Goal McFaul 15th min" or sends voice note
2. Claude AI parses → creates structured `match_event`
3. `match_event` INSERT → Supabase Database Webhook → Inngest
4. Inngest fan-out:
   - Update fixture score in `fixtures` table
   - Supabase Realtime pushes to all connected browsers (public live scoreboard)
   - Post update to WhatsApp Channel (free broadcast)
   - Send push to subscribers who opted in for live updates
5. Public scoreboard page (`/live`) updates in real-time without refresh

**After full time:**
1. Manager sends final result (text or voice note)
2. Claude AI:
   - Extracts structured result (teams, scores, scorers)
   - Generates 50-100 word match report
   - Generates dynamic OG score graphic (@vercel/og)
3. Result stored in `fixtures` table
4. League tables auto-recalculated
5. Content queued for PRO approval:
   - Match report text
   - Score graphic
   - Social media post (Facebook, X, Instagram)
6. PRO approves via WhatsApp ("Looks good, publish") or dashboard
7. Auto-published to connected social accounts

---

## 9. Dashboard Design

### Design Principles

1. **Linear's restraint** — no decoration without purpose. Modular components, not ornamentation.
2. **Vercel's 200 invisible details** — hit targets (24px min, 44px mobile), loading timing (150ms skeleton delay), `font-variant-numeric: tabular-nums`, focus rings, scroll restoration.
3. **Stripe's trust** — precise typography, systematic OKLCH contrast, flawless data for a financial platform.
4. **Notion's progressive disclosure** — simple at first, deep on interaction. CMD+K command palette.

### Design System

**Colors:** OKLCH color space. Dark mode default.
- Base: `#020617` → Surface: `#0f172a` → Card: `#1e293b` → Elevated: `#334155`
- Text primary: `#f1f5f9` → Text secondary: `#94a3b8`
- Accent: per-county (Derry Red `#ef4444`, Cork Red/White, Dublin Blue, Kerry Green/Gold)
- Semantic: Success `#22c55e`, Warning `#f59e0b`, Error `#ef4444`, Info `#3b82f6`
- Semantic colors NEVER change per tenant — only brand accent

**Typography:** Geist Sans (UI text), Geist Mono (scores, revenue, IDs, timestamps, commands)

**Layout:** Bento grid (asymmetric, importance = size). 12px gaps. Base unit 80px. Cards: 1x1, 2x1, 2x2, 3x2.

**Components:** shadcn/ui (Radix), shadcn Charts (Recharts v3), TanStack Table, cmdk command palette, Sonner toasts, shadcn Sidebar (collapsible icon mode)

### Animation System (Motion)

| Pattern | Config | Where Used |
|---------|--------|------------|
| Page transitions | 400-600ms, opacity + 12px Y translate, direction-aware | All route changes |
| Stagger reveals | 50-100ms between items, 200ms delay before start | Dashboard cards, table rows, lists |
| Number morphing | 400-700ms, odometer-style rolling | Revenue counters, member counts, scores |
| Card hover | scale(1.02) + shadow lift, 200-300ms ease-out | All interactive cards |
| Card press | scale(0.98), 100ms | Click feedback |
| Spring physics | stiffness 300, damping 24 | All motion interactions |
| Live score pulse | Breathing red dot + score flash on update | Live scores widget |
| Skeleton loading | 150ms show-delay, 300ms min visible, shimmer wave | All data-dependent views |
| Scroll reveals | Fade in as viewport enters | Long pages, lists |

### Three Dashboard Tiers

**Tier 1: QED Super Admin** (`app.clubos.ie`)
- County board status (live, onboarding, pending)
- Cross-platform revenue (total QED margin)
- Agent activity across all tenants
- WhatsApp health (delivery rates, costs)
- Onboarding wizard for new county boards
- System health (Sentry, Vercel, Supabase)

**Tier 2: County Board Admin** (custom domain, e.g., `app.derrygaa.ie`)
- Bento grid dashboard with live scores (largest card)
- Fixture management (CRUD + broadcasting)
- Competition management (groups, draws, tables)
- Member overview across all clubs
- Revenue reporting (Stripe Connect dashboard embedded or custom)
- Content queue (AI-generated posts, PRO approval workflow)
- AI Agent alerts and activity log
- Club management
- Settings (branding, notifications, Twilio, Stripe)

**Tier 3: Club Officer** (same domain, scoped to club)
- Simplified dashboard (club's own data only)
- Submit results, manage members, view reports
- Content approval (if delegated by county board)
- 90% of daily operations happen via WhatsApp — dashboard is for reporting

### Key Dashboard Features

- **CMD+K command palette** — search fixtures, members, revenue, commands. Fuzzy search. Keyboard nav.
- **Inline sparklines** — trend lines next to every KPI (membership trend, revenue trend)
- **Progress rings** — registration completion %, renewal rate %
- **Drill-through** — click any metric to see underlying data (members, payments, fixtures)
- **Real-time updates** — Supabase Realtime pushes changes to dashboard without refresh
- **PDF export** — React-PDF for branded AGM reports, financial summaries, membership registers
- **Every state designed** — empty states (onboarding guidance), error states (resolution steps), loading states (exact-layout skeletons)

---

## 10. API Architecture

### Directory Structure

```
src/
├── app/
│   ├── (admin)/                  # Admin dashboard (all 3 tiers)
│   │   ├── dashboard/
│   │   ├── fixtures/
│   │   ├── results/
│   │   ├── competitions/
│   │   ├── members/
│   │   ├── clubs/
│   │   ├── revenue/
│   │   ├── content/
│   │   ├── agents/
│   │   ├── live/
│   │   ├── settings/
│   │   └── layout.tsx
│   ├── (public)/                 # Public pages
│   │   ├── page.tsx              # Landing / public results
│   │   ├── live/                 # Public live scoreboard
│   │   ├── results/
│   │   ├── fixtures/
│   │   └── subscribe/
│   ├── (auth)/                   # Supabase Auth pages
│   │   ├── login/
│   │   └── callback/
│   ├── api/
│   │   ├── webhooks/
│   │   │   ├── twilio/
│   │   │   │   ├── route.ts      # Main Twilio webhook
│   │   │   │   ├── ai/route.ts   # Claude AI endpoint (Studio calls this)
│   │   │   │   └── voice/route.ts # Voice note transcription
│   │   │   └── stripe/
│   │   │       └── route.ts      # Stripe Connect webhook
│   │   ├── inngest/
│   │   │   └── route.ts          # Inngest webhook endpoint
│   │   ├── og/
│   │   │   └── [...slug]/route.tsx # Dynamic OG score images
│   │   └── health/
│   │       └── route.ts
│   ├── layout.tsx
│   └── globals.css
├── lib/
│   ├── supabase/
│   │   ├── client.ts             # Browser client
│   │   ├── server.ts             # Server component client
│   │   └── admin.ts              # Service role client (webhooks only)
│   ├── twilio/
│   │   ├── client.ts
│   │   └── webhook.ts            # Signature validation
│   ├── stripe/
│   │   ├── client.ts
│   │   └── webhook.ts            # Signature validation
│   ├── claude/
│   │   ├── client.ts
│   │   ├── tools.ts              # Tool definitions (member + admin)
│   │   └── prompts.ts            # System prompts per role
│   ├── inngest/
│   │   ├── client.ts
│   │   └── functions/
│   │       ├── fixture-broadcast.ts
│   │       ├── result-publish.ts
│   │       ├── payment-reminders.ts
│   │       ├── registration-guardian.ts
│   │       ├── revenue-sentinel.ts
│   │       ├── fixture-intelligence.ts
│   │       ├── member-retention.ts
│   │       ├── content-engine.ts
│   │       └── smart-scheduler.ts
│   ├── email/
│   │   └── client.ts             # Resend client
│   ├── ratelimit/
│   │   └── client.ts             # Upstash rate limiter
│   ├── tenant/
│   │   ├── resolve.ts            # Hostname → org_id resolution
│   │   └── context.ts            # Tenant context provider
│   └── utils/
│       ├── phone.ts              # E.164 formatting + hashing
│       ├── calendar.ts           # .ics generation
│       └── errors.ts             # AppError + Sentry integration
├── components/
│   ├── ui/                       # shadcn/ui components
│   ├── motion/                   # Animated wrappers (stagger, morph, etc.)
│   ├── dashboard/                # Dashboard-specific components
│   ├── fixtures/
│   ├── members/
│   ├── live/                     # Live scoreboard components
│   └── charts/                   # Custom chart components
├── types/
│   ├── database.ts               # Generated from Supabase (npm run db:types)
│   ├── twilio.ts
│   └── stripe.ts
└── proxy.ts                      # Tenant resolution middleware
```

### Webhook Security

- **Twilio**: Validate `x-twilio-signature` header against auth token + URL + params
- **Stripe**: Validate webhook signature via `stripe.webhooks.constructEvent()`
- **Inngest**: Validated by Inngest SDK automatically
- All webhooks rate-limited via Upstash

---

## 11. Stripe Connect Integration

### Account Structure

- **QED Platform Account** — the main Stripe account
- **County Board Express Accounts** — one per county board, onboarded via Stripe-hosted flow
- **Payment flow:** Member pays → Stripe processes → QED takes 10% application fee → county board receives remainder
- **Payouts:** Automatic weekly to county board's bank account (configurable)

### What Stripe Handles

- Checkout UI (Payment Links — zero code)
- PCI compliance (we never see card numbers)
- 3D Secure / SCA authentication
- Apple Pay / Google Pay
- Receipt emails
- Subscription lifecycle (create, renew, cancel, failed payment dunning)
- Customer Portal (members manage their own billing)
- Tax calculation (if enabled)
- Revenue reporting (per connected account)
- Invoicing

---

## 12. Testing Strategy

### Layers

| Layer | Tool | What |
|-------|------|------|
| **Type checking** | `tsc --noEmit` | Run after every .ts/.tsx edit. Zero errors before commit. |
| **Unit tests** | Vitest | Business logic, utils, tool definitions, tenant resolution |
| **Integration tests** | Vitest + Supabase local | RLS policies, database functions, webhook handlers |
| **E2E tests** | Playwright | Full user flows: login, create fixture, submit result, view live |
| **Visual regression** | Playwright screenshots | Dashboard renders correctly per theme |

### Non-Negotiable Rules

- After every migration → regenerate TypeScript types (`npm run db:types`)
- After every .ts/.tsx edit → `npx tsc --noEmit`; fix ALL errors
- RLS on every table — test with 2+ tenants
- Webhook signature validation tested with valid AND invalid signatures
- All API boundaries have Zod validation

---

## 13. Deployment

### Environment Setup

```
master branch → Vercel Production (custom domains per county board)
develop branch → Vercel Preview (internal testing)
Feature branches → Automatic PR preview URLs
```

### Environment Variables

All managed via `vercel env` or Marketplace auto-provisioning:

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY

# Twilio
TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN
TWILIO_WEBHOOK_URL

# Stripe
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

# Claude AI
ANTHROPIC_API_KEY

# Inngest
INNGEST_SIGNING_KEY
INNGEST_EVENT_KEY

# Resend
RESEND_API_KEY

# Upstash
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN

# Sentry
SENTRY_DSN
SENTRY_AUTH_TOKEN

# App
NEXT_PUBLIC_APP_URL
CRON_SECRET
```

### Monitoring

- **Sentry**: Errors, performance, session replay, release health
- **Vercel Analytics**: Core Web Vitals, traffic
- **Vercel Speed Insights**: Real user performance
- **Inngest Dashboard**: Background job monitoring
- **Stripe Dashboard**: Payment monitoring
- **Twilio Console**: Message delivery tracking

---

## 14. MVP Phasing (Sprint to Derry)

### Week 1: Foundation
- [ ] Initialize Next.js 16 + TypeScript + Tailwind 4 + shadcn/ui
- [ ] Git repo setup (master + develop branches)
- [ ] Supabase schema migration (all core tables + RLS)
- [ ] Tenant resolution (proxy.ts + hostname lookup)
- [ ] Supabase Auth for dashboard login
- [ ] Dashboard skeleton (sidebar, layout, theme system, bento grid)
- [ ] Twilio webhook handler + signature validation
- [ ] Claude AI integration (member query answering with tools)
- [ ] Fixture management (CRUD in dashboard)

### Week 2: Revenue + Core Features
- [ ] Stripe Connect setup (QED platform + Derry Express account)
- [ ] Membership registration via WhatsApp Flow
- [ ] Stripe Payment Links for membership fees
- [ ] Supporter subscriptions (Stripe Billing)
- [ ] Stripe webhook handler (payment confirmed → update Supabase)
- [ ] Inngest setup + payment reminder sequences
- [ ] Result submission (text + voice note transcription)
- [ ] Fixture broadcasting (WhatsApp Channel + carousel template)
- [ ] Resend email notifications (welcome, receipt, reminders)
- [ ] Revenue reporting page

### Week 3: World-Class Polish + Match Day
- [ ] Live scoring (match_events + Supabase Realtime + public scoreboard)
- [ ] Dynamic OG score images (@vercel/og)
- [ ] Calendar integration (.ics links in fixture messages)
- [ ] Location messages (venue GPS pins)
- [ ] Content queue + PRO approval workflow
- [ ] WhatsApp admin interface (officer commands via Claude)
- [ ] CMD+K command palette
- [ ] Motion animations (stagger, morph, spring, transitions)
- [ ] Dashboard polish (sparklines, progress rings, skeleton loading)

### Week 4: Agents + Harden
- [ ] Registration Guardian agent
- [ ] Revenue Sentinel agent
- [ ] Fixture Intelligence agent (weather API integration)
- [ ] Content Engine agent (weekly roundup)
- [ ] QED Super Admin dashboard
- [ ] Sentry setup + error monitoring
- [ ] PDF report generation (React-PDF)
- [ ] E2E testing (Playwright)
- [ ] Deploy to production with Derry's custom domain

### Post-Launch (Nice-to-have)
- [ ] County lotto system
- [ ] Member Retention AI agent
- [ ] Smart Scheduler agent
- [ ] Social media auto-publishing (Meta API)
- [ ] Irish language support
- [ ] QR codes for membership/events
- [ ] Onboarding wizard for new county boards
- [ ] Club lotto (if requested)

---

## 15. Security

### Non-Negotiable

- RLS on every table — `organization_id` scoped, tested with 2+ tenants
- Webhook signature validation on ALL external webhooks (Twilio, Stripe)
- Rate limiting on all public endpoints (Upstash)
- No `service_role` key exposed to client — server-side only
- No PII in logs (mask emails, phone numbers, card data)
- Parameterized queries only (Supabase handles this)
- `CRON_SECRET` header validation on all cron endpoints
- Admin commands validated against officer role + org membership
- Audit log on all sensitive mutations

### Data Privacy

- Phone numbers stored as SHA256 hashes for lookups, E.164 for display (encrypted at rest by Supabase)
- No card numbers ever touch our system (Stripe handles all PCI)
- GDPR-compliant: members can request data deletion via WhatsApp
- Data isolation via RLS means county boards cannot see each other's data even with direct API access

---

## 16. Irish Language (Gaeilge) Support

- `name_irish` field on organizations (club and county board names in Irish)
- Claude AI can respond in Irish when asked ("Cad é an scór?")
- Dashboard labels support bilingual display (settings toggle)
- Competition names in both languages stored in JSONB
- WhatsApp templates in both English and Irish (Twilio Content Builder)

---

*Prepared for QED Digitalisation — March 2026*
*Spec version 1.0*
