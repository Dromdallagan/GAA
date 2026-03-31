# ClubOS Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a multi-tenant SaaS platform for GAA county boards with WhatsApp AI, live scoring, proactive agents, and a world-class admin dashboard — launching with Derry GAA in 4 weeks.

**Architecture:** Single Next.js 16 app on Vercel. Multi-tenant via custom domains, resolved in proxy.ts. Supabase for data + auth + realtime. Twilio for WhatsApp. Stripe Connect for payments with automatic 10% QED margin. Inngest for background jobs + AI agents. ~1,500 lines of custom code orchestrating 10+ platforms.

**Tech Stack:** Next.js 16, TypeScript strict, Tailwind 4, shadcn/ui, Motion, Supabase, Twilio, Stripe Connect, Inngest, Claude AI, Resend, Upstash, Sentry, Vercel

**Spec:** `docs/superpowers/specs/2026-03-31-clubos-design.md`

---

## File Structure

```
src/
├── app/
│   ├── (admin)/
│   │   ├── layout.tsx                    # Admin layout: sidebar + tenant context
│   │   ├── dashboard/page.tsx            # Bento grid dashboard (tier 2/3)
│   │   ├── fixtures/
│   │   │   ├── page.tsx                  # Fixture list + management
│   │   │   └── [id]/page.tsx             # Fixture detail
│   │   ├── results/page.tsx              # Results + submission
│   │   ├── competitions/
│   │   │   ├── page.tsx                  # Competition list
│   │   │   └── [id]/page.tsx             # Competition detail + tables
│   │   ├── members/
│   │   │   ├── page.tsx                  # Member list + filters
│   │   │   └── [id]/page.tsx             # Member detail
│   │   ├── clubs/page.tsx                # Club list (county board view)
│   │   ├── revenue/page.tsx              # Revenue reporting
│   │   ├── content/page.tsx              # Content queue + PRO approval
│   │   ├── agents/page.tsx               # AI agent activity log
│   │   ├── live/page.tsx                 # Live scores admin view
│   │   └── settings/page.tsx             # Org settings, branding, integrations
│   ├── (public)/
│   │   ├── layout.tsx                    # Public layout (minimal, branded)
│   │   ├── page.tsx                      # Public landing / latest results
│   │   ├── live/page.tsx                 # Public live scoreboard
│   │   ├── results/page.tsx              # Public results archive
│   │   ├── fixtures/page.tsx             # Public upcoming fixtures
│   │   └── subscribe/page.tsx            # Supporter subscription page
│   ├── (auth)/
│   │   ├── login/page.tsx                # Supabase Auth login
│   │   └── callback/route.ts             # OAuth callback
│   ├── api/
│   │   ├── webhooks/
│   │   │   ├── twilio/route.ts           # Main Twilio webhook
│   │   │   ├── twilio/ai/route.ts        # Claude AI endpoint
│   │   │   ├── twilio/voice/route.ts     # Voice note transcription
│   │   │   └── stripe/route.ts           # Stripe Connect webhook
│   │   ├── inngest/route.ts              # Inngest serve endpoint
│   │   ├── og/[...slug]/route.tsx        # Dynamic OG images
│   │   └── health/route.ts               # Health check
│   ├── layout.tsx                        # Root layout (fonts, theme, providers)
│   └── globals.css                       # Tailwind 4 + OKLCH theme tokens
├── lib/
│   ├── supabase/
│   │   ├── client.ts                     # Browser Supabase client
│   │   ├── server.ts                     # Server component Supabase client
│   │   └── admin.ts                      # Service role client (webhooks only)
│   ├── twilio/
│   │   ├── client.ts                     # Twilio REST client
│   │   └── webhook.ts                    # Signature validation
│   ├── stripe/
│   │   ├── client.ts                     # Stripe client
│   │   └── webhook.ts                    # Webhook signature validation
│   ├── claude/
│   │   ├── client.ts                     # Anthropic client
│   │   ├── tools.ts                      # Tool definitions (member + admin)
│   │   └── prompts.ts                    # System prompts per role
│   ├── inngest/
│   │   ├── client.ts                     # Inngest client
│   │   └── functions/
│   │       ├── fixture-broadcast.ts      # Broadcast fixture to members
│   │       ├── result-publish.ts         # Multi-channel result publishing
│   │       ├── payment-reminders.ts      # Chase unpaid memberships
│   │       ├── welcome-sequence.ts       # New member welcome flow
│   │       ├── registration-guardian.ts  # Proactive: unregistered player alerts
│   │       ├── revenue-sentinel.ts       # Proactive: revenue tracking + digest
│   │       ├── fixture-intelligence.ts   # Proactive: clashes + weather
│   │       ├── content-engine.ts         # Proactive: weekly roundup + reports
│   │       ├── member-retention.ts       # Proactive: churn prediction
│   │       └── smart-scheduler.ts        # Proactive: calendar-aware scheduling
│   ├── email/
│   │   ├── client.ts                     # Resend client
│   │   └── templates/
│   │       ├── welcome.tsx               # React Email: welcome
│   │       ├── receipt.tsx               # React Email: payment receipt
│   │       └── reminder.tsx              # React Email: payment reminder
│   ├── ratelimit.ts                      # Upstash rate limiter
│   ├── tenant/
│   │   ├── resolve.ts                    # Hostname → org_id resolution
│   │   └── context.tsx                   # React context for current tenant
│   └── utils/
│       ├── phone.ts                      # E.164 formatting + SHA256 hashing
│       ├── calendar.ts                   # .ics file generation
│       ├── errors.ts                     # AppError class + Sentry integration
│       └── cn.ts                         # clsx + tailwind-merge (shadcn util)
├── components/
│   ├── ui/                               # shadcn/ui primitives (auto-installed)
│   ├── motion/
│   │   ├── stagger-children.tsx          # Stagger reveal wrapper
│   │   ├── number-morph.tsx              # Animated counter
│   │   ├── page-transition.tsx           # Route transition wrapper
│   │   └── card-hover.tsx               # Hover lift + spring
│   ├── dashboard/
│   │   ├── bento-grid.tsx                # Asymmetric grid layout
│   │   ├── kpi-card.tsx                  # KPI with sparkline + morph
│   │   ├── live-scores-widget.tsx        # Real-time match scores
│   │   ├── agent-alerts.tsx              # AI agent alert feed
│   │   ├── content-queue-preview.tsx     # Content awaiting approval
│   │   └── command-palette.tsx           # CMD+K search everything
│   ├── fixtures/
│   │   ├── fixture-card.tsx              # Fixture display card
│   │   ├── fixture-form.tsx              # Create/edit fixture
│   │   └── result-form.tsx              # Submit result
│   ├── members/
│   │   ├── member-table.tsx              # TanStack Table for members
│   │   └── member-detail.tsx             # Member profile view
│   ├── live/
│   │   ├── scoreboard.tsx                # Real-time scoreboard
│   │   ├── match-timeline.tsx            # Live event timeline
│   │   └── score-card.tsx               # Individual match score
│   └── layout/
│       ├── app-sidebar.tsx               # shadcn Sidebar (collapsible)
│       ├── tenant-header.tsx             # County crest + name
│       └── powered-by-footer.tsx         # "Powered by ClubOS"
├── types/
│   └── database.ts                       # Generated from Supabase
├── proxy.ts                              # Tenant resolution middleware
└── instrumentation.ts                    # Sentry init
```

```
supabase/
├── migrations/
│   ├── 00001_organizations.sql           # Organizations + org_users
│   ├── 00002_members.sql                 # Members table
│   ├── 00003_competitions_teams.sql      # Competitions, teams, venues
│   ├── 00004_fixtures.sql                # Fixtures + match_events
│   ├── 00005_subscriptions.sql           # Subscriptions table
│   ├── 00006_conversations.sql           # Conversations table
│   ├── 00007_agents_content.sql          # Agent runs + content queue
│   ├── 00008_financials.sql              # Message costs + revenue reports
│   ├── 00009_audit_log.sql               # Audit log
│   └── 00010_rls_policies.sql            # All RLS policies
└── seed.sql                              # Derry GAA seed data
```

---

## Phase 1: Foundation (Week 1)

### Task 1: Scaffold Next.js 16 Project

**Files:**
- Create: `package.json`, `next.config.ts`, `tsconfig.json`, `tailwind.config.ts`, `.env.local.example`
- Create: `src/app/layout.tsx`, `src/app/globals.css`, `src/app/page.tsx`

- [ ] **Step 1: Create Next.js 16 app with TypeScript**

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --turbopack
```

Expected: Next.js 16 scaffolded in current directory with App Router, TypeScript, Tailwind 4.

- [ ] **Step 2: Install core dependencies**

```bash
npm install @supabase/supabase-js @supabase/ssr stripe @anthropic-ai/sdk twilio inngest @upstash/ratelimit @upstash/redis resend @sentry/nextjs
```

- [ ] **Step 3: Install UI dependencies**

```bash
npm install motion cmdk sonner lucide-react @vercel/og @vercel/analytics @vercel/speed-insights
npx shadcn@latest init
```

When prompted: style=new-york, base-color=zinc, css-variables=yes.

- [ ] **Step 4: Install Geist fonts**

```bash
npm install geist
```

Update `src/app/layout.tsx`:

```typescript
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

export const metadata = {
  title: "ClubOS",
  description: "AI-powered GAA club management",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable} dark`}
      style={{ colorScheme: "dark" }}
    >
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

- [ ] **Step 5: Configure OKLCH dark theme in globals.css**

Replace `src/app/globals.css` with:

```css
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: oklch(0.08 0.01 250);
  --color-foreground: oklch(0.95 0.01 250);
  --color-card: oklch(0.13 0.01 250);
  --color-card-foreground: oklch(0.95 0.01 250);
  --color-popover: oklch(0.13 0.01 250);
  --color-popover-foreground: oklch(0.95 0.01 250);
  --color-primary: oklch(0.65 0.2 25);
  --color-primary-foreground: oklch(0.98 0.005 250);
  --color-secondary: oklch(0.18 0.01 250);
  --color-secondary-foreground: oklch(0.95 0.01 250);
  --color-muted: oklch(0.18 0.01 250);
  --color-muted-foreground: oklch(0.6 0.01 250);
  --color-accent: oklch(0.18 0.01 250);
  --color-accent-foreground: oklch(0.95 0.01 250);
  --color-destructive: oklch(0.55 0.2 25);
  --color-border: oklch(0.2 0.01 250);
  --color-input: oklch(0.2 0.01 250);
  --color-ring: oklch(0.65 0.2 25);
  --color-success: oklch(0.65 0.2 145);
  --color-warning: oklch(0.75 0.15 75);
  --color-info: oklch(0.6 0.15 250);
  --radius: 0.625rem;
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

body {
  font-variant-numeric: tabular-nums;
}
```

- [ ] **Step 6: Create .env.local.example**

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Twilio
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WEBHOOK_URL=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Claude AI
ANTHROPIC_API_KEY=

# Inngest
INNGEST_SIGNING_KEY=
INNGEST_EVENT_KEY=

# Resend
RESEND_API_KEY=

# Upstash
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Sentry
SENTRY_DSN=
SENTRY_AUTH_TOKEN=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
CRON_SECRET=
```

- [ ] **Step 7: Verify build**

```bash
npx tsc --noEmit && npm run build
```

Expected: Clean build, no errors.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: scaffold Next.js 16 with shadcn/ui, OKLCH theme, Geist fonts"
```

---

### Task 2: Supabase Schema — Organizations & Auth

**Files:**
- Create: `supabase/migrations/00001_organizations.sql`
- Create: `src/lib/supabase/client.ts`
- Create: `src/lib/supabase/server.ts`
- Create: `src/lib/supabase/admin.ts`
- Create: `src/types/database.ts`

- [ ] **Step 1: Initialize Supabase locally**

```bash
npx supabase init
npx supabase link --project-ref <your-project-ref>
```

- [ ] **Step 2: Create organizations migration**

Create `supabase/migrations/00001_organizations.sql`:

```sql
-- Organizations: county boards and clubs
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_irish TEXT,
  slug TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('county_board', 'club')),
  parent_id UUID REFERENCES organizations(id),
  domain TEXT UNIQUE,
  twilio_phone_sid TEXT,
  twilio_studio_flow_sid TEXT,
  stripe_connect_id TEXT,
  theme JSONB DEFAULT '{"accent_color": "#ef4444"}',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_organizations_parent ON organizations(parent_id);
CREATE INDEX idx_organizations_domain ON organizations(domain);
CREATE INDEX idx_organizations_twilio ON organizations(twilio_phone_sid);

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Org users: dashboard admins and WhatsApp officers
CREATE TABLE org_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN (
    'super_admin', 'owner', 'admin', 'secretary',
    'treasurer', 'registrar', 'pro', 'manager'
  )),
  phone_number TEXT,
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);

CREATE INDEX idx_org_users_user ON org_users(user_id);
CREATE INDEX idx_org_users_org ON org_users(organization_id);
CREATE INDEX idx_org_users_phone ON org_users(phone_number);

ALTER TABLE org_users ENABLE ROW LEVEL SECURITY;

-- Helper function: check if user has role on org
CREATE OR REPLACE FUNCTION has_role_on_org(
  _user_id UUID,
  _org_id UUID,
  _roles TEXT[] DEFAULT ARRAY[
    'super_admin', 'owner', 'admin', 'secretary',
    'treasurer', 'registrar', 'pro', 'manager'
  ]
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM org_users
    WHERE user_id = _user_id
      AND organization_id = _org_id
      AND role = ANY(_roles)
  );
END;
$$;

-- Helper function: get user's org IDs
CREATE OR REPLACE FUNCTION get_user_org_ids(_user_id UUID)
RETURNS SETOF UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT organization_id FROM org_users WHERE user_id = _user_id;
$$;

-- Trigger: auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS policies
CREATE POLICY "Users can read own organizations"
  ON organizations FOR SELECT
  USING (
    id IN (SELECT get_user_org_ids(auth.uid()))
    OR parent_id IN (SELECT get_user_org_ids(auth.uid()))
  );

CREATE POLICY "Users can read own org_users"
  ON org_users FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage org_users"
  ON org_users FOR ALL
  USING (
    has_role_on_org(auth.uid(), organization_id, ARRAY['super_admin', 'owner', 'admin'])
  );
```

- [ ] **Step 3: Run migration**

```bash
npx supabase db push
```

Expected: Migration applied successfully.

- [ ] **Step 4: Generate TypeScript types**

```bash
npx supabase gen types typescript --project-id <your-project-ref> > src/types/database.ts
```

- [ ] **Step 5: Create Supabase clients**

Create `src/lib/supabase/client.ts`:

```typescript
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

Create `src/lib/supabase/server.ts`:

```typescript
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        },
      },
    }
  );
}
```

Create `src/lib/supabase/admin.ts`:

```typescript
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
```

- [ ] **Step 6: Verify types compile**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: Supabase schema for organizations + org_users with RLS"
```

---

### Task 3: Supabase Schema — Members, Teams, Competitions, Venues, Fixtures

**Files:**
- Create: `supabase/migrations/00002_members.sql`
- Create: `supabase/migrations/00003_competitions_teams.sql`
- Create: `supabase/migrations/00004_fixtures.sql`

- [ ] **Step 1: Create members migration**

Create `supabase/migrations/00002_members.sql`:

```sql
CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL,
  phone_hash TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  date_of_birth DATE,
  membership_type TEXT CHECK (membership_type IN ('adult', 'youth', 'student', 'family', 'social')),
  membership_status TEXT DEFAULT 'pending' CHECK (membership_status IN ('pending', 'active', 'expired', 'suspended')),
  membership_expires_at DATE,
  foireann_id TEXT,
  stripe_customer_id TEXT,
  engagement_score INTEGER DEFAULT 50 CHECK (engagement_score BETWEEN 0 AND 100),
  last_interaction_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, phone_hash)
);

CREATE INDEX idx_members_org ON members(organization_id);
CREATE INDEX idx_members_phone_hash ON members(phone_hash);
CREATE INDEX idx_members_status ON members(membership_status);
CREATE INDEX idx_members_engagement ON members(engagement_score);

ALTER TABLE members ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER members_updated_at
  BEFORE UPDATE ON members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE POLICY "Org users can read their org members"
  ON members FOR SELECT
  USING (organization_id IN (SELECT get_user_org_ids(auth.uid())));

CREATE POLICY "Org admins can manage members"
  ON members FOR ALL
  USING (
    has_role_on_org(auth.uid(), organization_id,
      ARRAY['super_admin', 'owner', 'admin', 'secretary', 'registrar'])
  );
```

- [ ] **Step 2: Create competitions, teams, venues migration**

Create `supabase/migrations/00003_competitions_teams.sql`:

```sql
-- Venues with GPS
CREATE TABLE venues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  latitude DECIMAL(10, 7),
  longitude DECIMAL(10, 7),
  capacity INTEGER,
  facilities JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE venues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org users can read venues"
  ON venues FOR SELECT
  USING (organization_id IN (SELECT get_user_org_ids(auth.uid())));

-- Competitions
CREATE TABLE competitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL CHECK (code IN ('football', 'hurling', 'camogie', 'lgfa')),
  level TEXT NOT NULL CHECK (level IN (
    'senior', 'intermediate', 'junior', 'u21', 'minor', 'u16', 'u14', 'u12'
  )),
  type TEXT NOT NULL CHECK (type IN ('championship', 'league', 'cup')),
  season INTEGER NOT NULL,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed')),
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE competitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org users can read competitions"
  ON competitions FOR SELECT
  USING (organization_id IN (SELECT get_user_org_ids(auth.uid())));

-- Teams
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  club_id UUID REFERENCES organizations(id),
  name TEXT NOT NULL,
  code TEXT NOT NULL CHECK (code IN ('football', 'hurling', 'camogie', 'lgfa')),
  level TEXT NOT NULL CHECK (level IN (
    'senior', 'intermediate', 'junior', 'u21', 'minor', 'u16', 'u14', 'u12'
  )),
  manager_id UUID REFERENCES org_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org users can read teams"
  ON teams FOR SELECT
  USING (organization_id IN (SELECT get_user_org_ids(auth.uid())));
```

- [ ] **Step 3: Create fixtures + match_events migration**

Create `supabase/migrations/00004_fixtures.sql`:

```sql
-- Fixtures
CREATE TABLE fixtures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  competition_id UUID REFERENCES competitions(id),
  home_team_id UUID REFERENCES teams(id),
  away_team_id UUID REFERENCES teams(id),
  venue_id UUID REFERENCES venues(id),
  scheduled_at TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN (
    'scheduled', 'live', 'completed', 'postponed', 'cancelled'
  )),
  home_score_goals INTEGER DEFAULT 0,
  home_score_points INTEGER DEFAULT 0,
  away_score_goals INTEGER DEFAULT 0,
  away_score_points INTEGER DEFAULT 0,
  match_report TEXT,
  scorers JSONB,
  man_of_match TEXT,
  weather_forecast JSONB,
  submitted_by UUID REFERENCES auth.users(id),
  submitted_at TIMESTAMPTZ,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_fixtures_org ON fixtures(organization_id);
CREATE INDEX idx_fixtures_date ON fixtures(scheduled_at);
CREATE INDEX idx_fixtures_status ON fixtures(status);
CREATE INDEX idx_fixtures_competition ON fixtures(competition_id);

ALTER TABLE fixtures ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER fixtures_updated_at
  BEFORE UPDATE ON fixtures
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE POLICY "Org users can read fixtures"
  ON fixtures FOR SELECT
  USING (organization_id IN (SELECT get_user_org_ids(auth.uid())));

CREATE POLICY "Org admins can manage fixtures"
  ON fixtures FOR ALL
  USING (
    has_role_on_org(auth.uid(), organization_id,
      ARRAY['super_admin', 'owner', 'admin', 'secretary', 'manager'])
  );

-- Match events for live scoring
CREATE TABLE match_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fixture_id UUID NOT NULL REFERENCES fixtures(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  event_type TEXT NOT NULL CHECK (event_type IN (
    'goal', 'point', 'wide', 'yellow_card', 'red_card',
    'substitution', 'half_time', 'full_time'
  )),
  team TEXT NOT NULL CHECK (team IN ('home', 'away')),
  player_name TEXT,
  minute INTEGER,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_match_events_fixture ON match_events(fixture_id);
CREATE INDEX idx_match_events_created ON match_events(created_at);

ALTER TABLE match_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org users can read match_events"
  ON match_events FOR SELECT
  USING (organization_id IN (SELECT get_user_org_ids(auth.uid())));

-- Enable Realtime for match_events (live scoreboard)
ALTER PUBLICATION supabase_realtime ADD TABLE match_events;
ALTER PUBLICATION supabase_realtime ADD TABLE fixtures;
```

- [ ] **Step 4: Push migrations**

```bash
npx supabase db push
```

- [ ] **Step 5: Regenerate types**

```bash
npx supabase gen types typescript --project-id <your-project-ref> > src/types/database.ts
npx tsc --noEmit
```

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: schema for members, teams, competitions, venues, fixtures, match_events"
```

---

### Task 4: Supabase Schema — Remaining Tables

**Files:**
- Create: `supabase/migrations/00005_subscriptions.sql`
- Create: `supabase/migrations/00006_conversations.sql`
- Create: `supabase/migrations/00007_agents_content.sql`
- Create: `supabase/migrations/00008_financials.sql`
- Create: `supabase/migrations/00009_audit_log.sql`

- [ ] **Step 1: Create subscriptions migration**

Create `supabase/migrations/00005_subscriptions.sql`:

```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  member_id UUID REFERENCES members(id),
  phone_number TEXT NOT NULL,
  phone_hash TEXT NOT NULL,
  stripe_customer_id TEXT NOT NULL,
  stripe_subscription_id TEXT NOT NULL,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('monthly', 'annual', 'family')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'past_due', 'cancelled', 'expired')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_org ON subscriptions(organization_id);
CREATE INDEX idx_subscriptions_phone ON subscriptions(phone_hash);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_stripe ON subscriptions(stripe_subscription_id);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE POLICY "Org users can read subscriptions"
  ON subscriptions FOR SELECT
  USING (organization_id IN (SELECT get_user_org_ids(auth.uid())));
```

- [ ] **Step 2: Create conversations migration**

Create `supabase/migrations/00006_conversations.sql`:

```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  member_id UUID REFERENCES members(id) ON DELETE SET NULL,
  phone_number TEXT NOT NULL,
  is_admin_session BOOLEAN DEFAULT FALSE,
  context JSONB DEFAULT '{}',
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_conversations_org ON conversations(organization_id);
CREATE INDEX idx_conversations_phone ON conversations(phone_number);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE POLICY "Org users can read conversations"
  ON conversations FOR SELECT
  USING (organization_id IN (SELECT get_user_org_ids(auth.uid())));
```

- [ ] **Step 3: Create agents + content queue migration**

Create `supabase/migrations/00007_agents_content.sql`:

```sql
-- Agent runs (proactive AI agent audit trail)
CREATE TABLE agent_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  agent_type TEXT NOT NULL CHECK (agent_type IN (
    'registration_guardian', 'revenue_sentinel', 'fixture_intelligence',
    'member_retention', 'content_engine', 'smart_scheduler'
  )),
  status TEXT DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed')),
  findings JSONB DEFAULT '{}',
  actions_taken JSONB[] DEFAULT '{}',
  ran_at TIMESTAMPTZ DEFAULT NOW(),
  next_run_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_agent_runs_org ON agent_runs(organization_id);
CREATE INDEX idx_agent_runs_type ON agent_runs(agent_type);

ALTER TABLE agent_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org users can read agent_runs"
  ON agent_runs FOR SELECT
  USING (organization_id IN (SELECT get_user_org_ids(auth.uid())));

-- Content queue (PRO approval workflow)
CREATE TABLE content_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'match_report', 'social_post', 'weekly_roundup', 'press_release'
  )),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  status TEXT DEFAULT 'draft' CHECK (status IN (
    'draft', 'pending_approval', 'approved', 'published', 'rejected'
  )),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_content_queue_org ON content_queue(organization_id);
CREATE INDEX idx_content_queue_status ON content_queue(status);

ALTER TABLE content_queue ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER content_queue_updated_at
  BEFORE UPDATE ON content_queue
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE POLICY "Org users can read content_queue"
  ON content_queue FOR SELECT
  USING (organization_id IN (SELECT get_user_org_ids(auth.uid())));
```

- [ ] **Step 4: Create financials migration**

Create `supabase/migrations/00008_financials.sql`:

```sql
-- Message costs (Twilio usage tracking per org per month)
CREATE TABLE message_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  marketing_count INTEGER DEFAULT 0,
  marketing_cost DECIMAL(10, 4) DEFAULT 0,
  utility_count INTEGER DEFAULT 0,
  utility_cost DECIMAL(10, 4) DEFAULT 0,
  service_count INTEGER DEFAULT 0,
  service_cost DECIMAL(10, 4) DEFAULT 0,
  total_cost DECIMAL(10, 4) DEFAULT 0,
  billed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, period_start)
);

ALTER TABLE message_costs ENABLE ROW LEVEL SECURITY;

-- Revenue reports (monthly financial per org)
CREATE TABLE revenue_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  gross_revenue DECIMAL(10, 2) DEFAULT 0,
  stripe_fees DECIMAL(10, 2) DEFAULT 0,
  twilio_costs DECIMAL(10, 2) DEFAULT 0,
  qed_margin_rate DECIMAL(5, 4) DEFAULT 0.10,
  qed_margin_amount DECIMAL(10, 2) DEFAULT 0,
  net_to_organization DECIMAL(10, 2) DEFAULT 0,
  settled BOOLEAN DEFAULT FALSE,
  settled_at TIMESTAMPTZ,
  settlement_reference TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, period_start)
);

ALTER TABLE revenue_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org users can read message_costs"
  ON message_costs FOR SELECT
  USING (organization_id IN (SELECT get_user_org_ids(auth.uid())));

CREATE POLICY "Org users can read revenue_reports"
  ON revenue_reports FOR SELECT
  USING (organization_id IN (SELECT get_user_org_ids(auth.uid())));

-- Helper: increment message cost atomically
CREATE OR REPLACE FUNCTION increment_message_cost(
  _org_id UUID,
  _category TEXT,
  _cost DECIMAL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  _period_start DATE := date_trunc('month', NOW())::DATE;
  _period_end DATE := (date_trunc('month', NOW()) + INTERVAL '1 month')::DATE;
BEGIN
  INSERT INTO message_costs (organization_id, period_start, period_end)
  VALUES (_org_id, _period_start, _period_end)
  ON CONFLICT (organization_id, period_start) DO NOTHING;

  EXECUTE format(
    'UPDATE message_costs SET %I_count = %I_count + 1, %I_cost = %I_cost + $1, total_cost = total_cost + $1 WHERE organization_id = $2 AND period_start = $3',
    _category, _category, _category, _category
  ) USING _cost, _org_id, _period_start;
END;
$$;
```

- [ ] **Step 5: Create audit log migration**

Create `supabase/migrations/00009_audit_log.sql`:

```sql
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_log_org ON audit_log(organization_id);
CREATE INDEX idx_audit_log_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_log_created ON audit_log(created_at);

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org admins can read audit_log"
  ON audit_log FOR SELECT
  USING (
    has_role_on_org(auth.uid(), organization_id,
      ARRAY['super_admin', 'owner', 'admin'])
  );
```

- [ ] **Step 6: Push all migrations + regenerate types**

```bash
npx supabase db push
npx supabase gen types typescript --project-id <your-project-ref> > src/types/database.ts
npx tsc --noEmit
```

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: complete schema — subscriptions, conversations, agents, content, financials, audit"
```

---

### Task 5: Tenant Resolution + Proxy

**Files:**
- Create: `src/lib/tenant/resolve.ts`
- Create: `src/lib/tenant/context.tsx`
- Create: `src/proxy.ts`

- [ ] **Step 1: Create tenant resolver**

Create `src/lib/tenant/resolve.ts`:

```typescript
import { createAdminClient } from "@/lib/supabase/admin";

export interface Tenant {
  id: string;
  name: string;
  nameIrish: string | null;
  slug: string;
  type: "county_board" | "club";
  parentId: string | null;
  domain: string | null;
  theme: {
    accent_color: string;
    crest_url?: string;
    secondary_color?: string;
  };
}

const tenantCache = new Map<string, { tenant: Tenant; expires: number }>();
const CACHE_TTL = 60_000; // 1 minute

export async function resolveTenantByDomain(
  hostname: string
): Promise<Tenant | null> {
  const cached = tenantCache.get(hostname);
  if (cached && cached.expires > Date.now()) {
    return cached.tenant;
  }

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("organizations")
    .select("id, name, name_irish, slug, type, parent_id, domain, theme")
    .eq("domain", hostname)
    .single();

  if (!data) return null;

  const tenant: Tenant = {
    id: data.id,
    name: data.name,
    nameIrish: data.name_irish,
    slug: data.slug,
    type: data.type as Tenant["type"],
    parentId: data.parent_id,
    domain: data.domain,
    theme: data.theme as Tenant["theme"],
  };

  tenantCache.set(hostname, { tenant, expires: Date.now() + CACHE_TTL });
  return tenant;
}

export async function resolveTenantByTwilioNumber(
  phoneNumber: string
): Promise<Tenant | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("organizations")
    .select("id, name, name_irish, slug, type, parent_id, domain, theme")
    .eq("twilio_phone_sid", phoneNumber)
    .single();

  if (!data) return null;

  return {
    id: data.id,
    name: data.name,
    nameIrish: data.name_irish,
    slug: data.slug,
    type: data.type as Tenant["type"],
    parentId: data.parent_id,
    domain: data.domain,
    theme: data.theme as Tenant["theme"],
  };
}
```

- [ ] **Step 2: Create tenant React context**

Create `src/lib/tenant/context.tsx`:

```typescript
"use client";

import { createContext, useContext } from "react";
import type { Tenant } from "./resolve";

const TenantContext = createContext<Tenant | null>(null);

export function TenantProvider({
  tenant,
  children,
}: {
  tenant: Tenant;
  children: React.ReactNode;
}) {
  return (
    <TenantContext.Provider value={tenant}>{children}</TenantContext.Provider>
  );
}

export function useTenant(): Tenant {
  const tenant = useContext(TenantContext);
  if (!tenant) {
    throw new Error("useTenant must be used within a TenantProvider");
  }
  return tenant;
}
```

- [ ] **Step 3: Create proxy.ts for tenant resolution**

Create `src/proxy.ts`:

```typescript
import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const hostname = request.headers.get("host") || "";
  const { pathname } = request.nextUrl;

  // Skip API routes and static files
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  // Set hostname header for server components to resolve tenant
  const response = NextResponse.next();
  response.headers.set("x-tenant-hostname", hostname);
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
```

- [ ] **Step 4: Verify types compile**

```bash
npx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: tenant resolution — proxy.ts, domain resolver, React context"
```

---

### Task 6: Utility Libraries

**Files:**
- Create: `src/lib/utils/phone.ts`
- Create: `src/lib/utils/calendar.ts`
- Create: `src/lib/utils/errors.ts`
- Create: `src/lib/utils/cn.ts`
- Create: `src/lib/ratelimit.ts`

- [ ] **Step 1: Create phone utilities**

Create `src/lib/utils/phone.ts`:

```typescript
import { createHash } from "crypto";

export function formatE164(phone: string, defaultCountry = "+44"): string {
  let cleaned = phone.replace(/[\s\-\(\)]/g, "");
  if (cleaned.startsWith("00")) {
    cleaned = "+" + cleaned.slice(2);
  }
  if (!cleaned.startsWith("+")) {
    if (cleaned.startsWith("0")) {
      cleaned = defaultCountry + cleaned.slice(1);
    } else {
      cleaned = defaultCountry + cleaned;
    }
  }
  return cleaned;
}

export function hashPhone(phone: string): string {
  const e164 = formatE164(phone);
  return createHash("sha256").update(e164).digest("hex");
}

export function maskPhone(phone: string): string {
  if (phone.length <= 6) return "***" + phone.slice(-3);
  return phone.slice(0, 4) + "***" + phone.slice(-3);
}
```

- [ ] **Step 2: Create calendar utility**

Create `src/lib/utils/calendar.ts`:

```typescript
export function generateICS(event: {
  title: string;
  description: string;
  location: string;
  start: Date;
  end: Date;
  url?: string;
}): string {
  const formatDate = (d: Date) =>
    d
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}/, "");

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//ClubOS//EN",
    "BEGIN:VEVENT",
    `DTSTART:${formatDate(event.start)}`,
    `DTEND:${formatDate(event.end)}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.description}`,
    `LOCATION:${event.location}`,
    event.url ? `URL:${event.url}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");
}
```

- [ ] **Step 3: Create error utilities**

Create `src/lib/utils/errors.ts`:

```typescript
import * as Sentry from "@sentry/nextjs";

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function handleError(
  error: unknown,
  context?: Record<string, unknown>
): void {
  if (error instanceof AppError && error.isOperational) {
    console.error(`[${error.code}] ${error.message}`);
    return;
  }
  Sentry.captureException(error, { extra: context });
  console.error("Unexpected error:", error);
}

export const ErrorCodes = {
  TWILIO_INVALID_SIGNATURE: "TWILIO_INVALID_SIGNATURE",
  TWILIO_SEND_FAILED: "TWILIO_SEND_FAILED",
  STRIPE_INVALID_SIGNATURE: "STRIPE_INVALID_SIGNATURE",
  STRIPE_PAYMENT_FAILED: "STRIPE_PAYMENT_FAILED",
  CLAUDE_API_ERROR: "CLAUDE_API_ERROR",
  TENANT_NOT_FOUND: "TENANT_NOT_FOUND",
  UNAUTHORIZED: "UNAUTHORIZED",
  RATE_LIMITED: "RATE_LIMITED",
} as const;
```

- [ ] **Step 4: Create cn utility (shadcn standard)**

Create `src/lib/utils/cn.ts`:

```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 5: Create rate limiter**

Create `src/lib/ratelimit.ts`:

```typescript
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

export const webhookRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, "1 m"),
  prefix: "ratelimit:webhook",
});

export const aiRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, "1 m"),
  prefix: "ratelimit:ai",
});
```

- [ ] **Step 6: Verify types compile**

```bash
npx tsc --noEmit
```

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: utility libraries — phone, calendar, errors, rate limiting"
```

---

### Task 7: Service Clients (Twilio, Stripe, Claude, Resend, Inngest)

**Files:**
- Create: `src/lib/twilio/client.ts`
- Create: `src/lib/twilio/webhook.ts`
- Create: `src/lib/stripe/client.ts`
- Create: `src/lib/stripe/webhook.ts`
- Create: `src/lib/claude/client.ts`
- Create: `src/lib/email/client.ts`
- Create: `src/lib/inngest/client.ts`

- [ ] **Step 1: Create Twilio client + webhook validation**

Create `src/lib/twilio/client.ts`:

```typescript
import twilio from "twilio";

export const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);
```

Create `src/lib/twilio/webhook.ts`:

```typescript
import { validateRequest } from "twilio";

export async function validateTwilioWebhook(
  request: Request
): Promise<{ valid: boolean; params: Record<string, string> }> {
  const signature = request.headers.get("x-twilio-signature");
  if (!signature) return { valid: false, params: {} };

  const body = await request.text();
  const params = Object.fromEntries(new URLSearchParams(body));
  const url = process.env.TWILIO_WEBHOOK_URL!;

  const valid = validateRequest(
    process.env.TWILIO_AUTH_TOKEN!,
    signature,
    url,
    params
  );

  return { valid, params };
}
```

- [ ] **Step 2: Create Stripe client + webhook validation**

Create `src/lib/stripe/client.ts`:

```typescript
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-12-18.acacia",
  typescript: true,
});
```

Create `src/lib/stripe/webhook.ts`:

```typescript
import Stripe from "stripe";
import { stripe } from "./client";

export async function constructStripeEvent(
  body: string,
  signature: string
): Promise<Stripe.Event | null> {
  try {
    return stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return null;
  }
}
```

- [ ] **Step 3: Create Claude AI client**

Create `src/lib/claude/client.ts`:

```typescript
import Anthropic from "@anthropic-ai/sdk";

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});
```

- [ ] **Step 4: Create Resend email client**

Create `src/lib/email/client.ts`:

```typescript
import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY!);
```

- [ ] **Step 5: Create Inngest client**

Create `src/lib/inngest/client.ts`:

```typescript
import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "clubos",
  schemas: new EventSchemas().fromRecord<{
    "fixture/created": { data: { fixtureId: string; orgId: string } };
    "fixture/updated": { data: { fixtureId: string; orgId: string } };
    "result/submitted": { data: { fixtureId: string; orgId: string; submittedBy: string } };
    "member/created": { data: { memberId: string; orgId: string } };
    "payment/confirmed": { data: { memberId: string; orgId: string; amount: number; type: string } };
    "membership/payment-pending": { data: { memberId: string; orgId: string } };
    "content/approved": { data: { contentId: string; orgId: string } };
  }>(),
});
```

Wait — the EventSchemas import needs to come from inngest. Let me fix that:

```typescript
import { Inngest, EventSchemas } from "inngest";

export const inngest = new Inngest({
  id: "clubos",
  schemas: new EventSchemas().fromRecord<{
    "fixture/created": { data: { fixtureId: string; orgId: string } };
    "fixture/updated": { data: { fixtureId: string; orgId: string } };
    "result/submitted": { data: { fixtureId: string; orgId: string; submittedBy: string } };
    "member/created": { data: { memberId: string; orgId: string } };
    "payment/confirmed": { data: { memberId: string; orgId: string; amount: number; type: string } };
    "membership/payment-pending": { data: { memberId: string; orgId: string } };
    "content/approved": { data: { contentId: string; orgId: string } };
  }>(),
});
```

- [ ] **Step 6: Verify types compile**

```bash
npx tsc --noEmit
```

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: service clients — Twilio, Stripe, Claude, Resend, Inngest"
```

---

### Task 8: Sentry + Health Check + Inngest Endpoint

**Files:**
- Create: `src/instrumentation.ts`
- Create: `src/app/api/health/route.ts`
- Create: `src/app/api/inngest/route.ts`

- [ ] **Step 1: Initialize Sentry**

```bash
npx @sentry/wizard@latest -i nextjs
```

Follow prompts to connect to your Sentry project. This creates `src/instrumentation.ts` and configures Next.js.

- [ ] **Step 2: Create health check endpoint**

Create `src/app/api/health/route.ts`:

```typescript
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || "local",
  });
}
```

- [ ] **Step 3: Create Inngest serve endpoint**

Create `src/app/api/inngest/route.ts`:

```typescript
import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";

// Import all Inngest functions here as they're created
// import { fixtureBroadcast } from "@/lib/inngest/functions/fixture-broadcast";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    // fixtureBroadcast,
  ],
});
```

- [ ] **Step 4: Verify build**

```bash
npx tsc --noEmit && npm run build
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: Sentry monitoring, health check, Inngest serve endpoint"
```

---

### Task 9: Seed Data — Derry GAA

**Files:**
- Create: `supabase/seed.sql`

- [ ] **Step 1: Create Derry GAA seed data**

Create `supabase/seed.sql`:

```sql
-- Derry GAA County Board
INSERT INTO organizations (id, name, name_irish, slug, type, domain, theme, settings)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'Derry GAA',
  'CLG Dhoire',
  'derry-gaa',
  'county_board',
  'app.derrygaa.ie',
  '{"accent_color": "#ef4444", "crest_url": "/assets/derry-gaa-crest.png"}',
  '{}'
);

-- Sample clubs under Derry
INSERT INTO organizations (id, name, name_irish, slug, type, parent_id, theme) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'Glen', 'Gleann', 'glen', 'club', 'a0000000-0000-0000-0000-000000000001', '{"accent_color": "#16a34a"}'),
  ('b0000000-0000-0000-0000-000000000002', 'Slaughtneil', 'Sleacht Néill', 'slaughtneil', 'club', 'a0000000-0000-0000-0000-000000000001', '{"accent_color": "#dc2626"}'),
  ('b0000000-0000-0000-0000-000000000003', 'Dungiven', 'Dún Geimhin', 'dungiven', 'club', 'a0000000-0000-0000-0000-000000000001', '{"accent_color": "#2563eb"}'),
  ('b0000000-0000-0000-0000-000000000004', 'Ballinascreen', 'Baile na Scríne', 'ballinascreen', 'club', 'a0000000-0000-0000-0000-000000000001', '{"accent_color": "#9333ea"}'),
  ('b0000000-0000-0000-0000-000000000005', 'Magherafelt', 'Machaire Fíolta', 'magherafelt', 'club', 'a0000000-0000-0000-0000-000000000001', '{"accent_color": "#0891b2"}');

-- Sample venues
INSERT INTO venues (organization_id, name, address, latitude, longitude) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Celtic Park', 'Lone Moor Road, Derry', 54.9914, -7.3228),
  ('a0000000-0000-0000-0000-000000000001', 'Owenbeg', 'Owenbeg, Dungiven', 54.9667, -6.9167),
  ('b0000000-0000-0000-0000-000000000001', 'Watty Graham Park', 'Glen Road, Maghera', 54.8333, -6.7167),
  ('b0000000-0000-0000-0000-000000000002', 'Emmet Park', 'Slaughtneil', 54.8167, -6.7500);

-- Sample competitions (2026 season)
INSERT INTO competitions (organization_id, name, code, level, type, season, status) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Derry Senior Football Championship', 'football', 'senior', 'championship', 2026, 'active'),
  ('a0000000-0000-0000-0000-000000000001', 'Derry Senior Hurling Championship', 'hurling', 'senior', 'championship', 2026, 'active'),
  ('a0000000-0000-0000-0000-000000000001', 'Derry Minor Football Championship', 'football', 'minor', 'championship', 2026, 'upcoming'),
  ('a0000000-0000-0000-0000-000000000001', 'Derry Senior Football League', 'football', 'senior', 'league', 2026, 'active');
```

- [ ] **Step 2: Run seed**

```bash
npx supabase db reset
```

Or manually in Supabase SQL Editor.

- [ ] **Step 3: Regenerate types**

```bash
npx supabase gen types typescript --project-id <your-project-ref> > src/types/database.ts
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: Derry GAA seed data — county board, clubs, venues, competitions"
```

---

### Task 10: Dashboard Layout Shell

**Files:**
- Create: `src/components/layout/app-sidebar.tsx`
- Create: `src/components/layout/tenant-header.tsx`
- Create: `src/components/layout/powered-by-footer.tsx`
- Create: `src/app/(admin)/layout.tsx`
- Create: `src/app/(admin)/dashboard/page.tsx`
- Create: `src/app/(auth)/login/page.tsx`

This task builds the dashboard skeleton with shadcn Sidebar, tenant branding, and the admin layout. The full implementation with animations, bento grid, and data fetching comes in Phase 3.

- [ ] **Step 1: Install shadcn components needed for layout**

```bash
npx shadcn@latest add sidebar button avatar dropdown-menu separator tooltip skeleton card badge
```

- [ ] **Step 2: Create app sidebar**

Create `src/components/layout/app-sidebar.tsx`:

```typescript
"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useTenant } from "@/lib/tenant/context";
import {
  LayoutDashboard,
  Calendar,
  Trophy,
  Users,
  Building2,
  DollarSign,
  Megaphone,
  Bot,
  Radio,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Fixtures", href: "/fixtures", icon: Calendar },
  { title: "Results", href: "/results", icon: Trophy },
  { title: "Competitions", href: "/competitions", icon: Trophy },
  { title: "Members", href: "/members", icon: Users },
  { title: "Clubs", href: "/clubs", icon: Building2 },
  { title: "Revenue", href: "/revenue", icon: DollarSign },
  { title: "Content", href: "/content", icon: Megaphone },
  { title: "AI Agents", href: "/agents", icon: Bot },
  { title: "Live Scores", href: "/live", icon: Radio },
  { title: "Settings", href: "/settings", icon: Settings },
];

export function AppSidebar() {
  const tenant = useTenant();
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-border/50">
        <div className="flex items-center gap-3 px-2 py-1">
          {tenant.theme.crest_url && (
            <img
              src={tenant.theme.crest_url}
              alt={tenant.name}
              className="h-8 w-8 rounded"
            />
          )}
          <span className="font-semibold text-sm truncate group-data-[collapsible=icon]:hidden">
            {tenant.name}
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={item.title}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-border/50">
        <div className="px-2 py-2 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
          Powered by ClubOS
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
```

- [ ] **Step 3: Create admin layout**

Create `src/app/(admin)/layout.tsx`:

```typescript
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { TenantProvider } from "@/lib/tenant/context";
import { resolveTenantByDomain } from "@/lib/tenant/resolve";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const hostname = headersList.get("x-tenant-hostname") || "localhost:3000";

  // Auth check
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Resolve tenant
  const tenant = await resolveTenantByDomain(hostname);
  if (!tenant) redirect("/login");

  return (
    <TenantProvider tenant={tenant}>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-12 items-center gap-2 border-b border-border/50 px-4">
            <SidebarTrigger className="-ml-1" />
          </header>
          <main className="flex-1 p-6">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </TenantProvider>
  );
}
```

- [ ] **Step 4: Create placeholder dashboard page**

Create `src/app/(admin)/dashboard/page.tsx`:

```typescript
export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
      <p className="text-muted-foreground mt-1">
        Welcome to ClubOS. Dashboard content coming soon.
      </p>
    </div>
  );
}
```

- [ ] **Step 5: Create login page**

Create `src/app/(auth)/login/page.tsx`:

```typescript
"use client";

import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-sm space-y-6 p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">ClubOS</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Sign in to your dashboard
          </p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            required
          />
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Create auth callback route**

Create `src/app/(auth)/callback/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(`${origin}/dashboard`);
}
```

- [ ] **Step 7: Verify build**

```bash
npx tsc --noEmit
```

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: admin dashboard shell — sidebar, tenant branding, auth, login"
```

---

### Task 11: Push to GitHub + Deploy to Vercel

- [ ] **Step 1: Push to GitHub**

```bash
git push -u origin master
```

- [ ] **Step 2: Create develop branch**

```bash
git checkout -b develop
git push -u origin develop
git checkout master
```

- [ ] **Step 3: Connect to Vercel**

```bash
npm i -g vercel
vercel link
vercel env pull
```

- [ ] **Step 4: Deploy preview**

```bash
vercel deploy
```

- [ ] **Step 5: Deploy production**

```bash
vercel --prod
```

- [ ] **Step 6: Verify deployment health**

```bash
curl https://your-deployment-url/api/health
```

Expected: `{"status":"ok","timestamp":"...","version":"..."}`

- [ ] **Step 7: Commit any Vercel config changes**

```bash
git add -A
git commit -m "chore: Vercel deployment configuration"
git push
```

---

## Phase 2-4: Remaining Tasks (Summary)

> **Phase 2, 3, and 4 tasks follow the same granular pattern as Phase 1.** Due to the massive scope, they are summarized below. Each will be expanded into full step-by-step tasks when execution begins.

### Phase 2: Revenue + Core Features (Week 2)

- **Task 12:** Twilio webhook handler (signature validation, tenant resolution, routing)
- **Task 13:** Claude AI integration (system prompts, member tools, tool execution loop)
- **Task 14:** Fixture CRUD in dashboard (create, edit, cancel, with form validation)
- **Task 15:** Stripe Connect setup (platform account, Derry Express account, payment links)
- **Task 16:** Membership registration (WhatsApp Flow response handler, Stripe checkout)
- **Task 17:** Stripe webhook handler (payment confirmed → update member status)
- **Task 18:** Supporter subscriptions (Stripe Billing, recurring payments)
- **Task 19:** Inngest: payment reminder sequences (7/14/21 day chase)
- **Task 20:** Inngest: fixture broadcasting (WhatsApp Channel + carousel template)
- **Task 21:** Result submission handler (text parsing, voice note transcription)
- **Task 22:** Resend email integration (welcome, receipt, reminder templates)
- **Task 23:** Revenue reporting page (Stripe Connect data, QED margin calculation)

### Phase 3: World-Class Polish + Match Day (Week 3)

- **Task 24:** Motion animation system (stagger, morph, spring, page transitions)
- **Task 25:** Bento grid dashboard (KPI cards, sparklines, progress rings)
- **Task 26:** CMD+K command palette (search fixtures, members, commands)
- **Task 27:** Live scoring system (match_events + Supabase Realtime)
- **Task 28:** Public live scoreboard page (real-time, no auth)
- **Task 29:** Dynamic OG score images (@vercel/og)
- **Task 30:** Calendar integration (.ics links in fixture messages)
- **Task 31:** Location messages (venue GPS pins in WhatsApp)
- **Task 32:** Content queue + PRO approval workflow
- **Task 33:** WhatsApp admin interface (officer commands via Claude)
- **Task 34:** Dashboard polish (skeleton loading, empty states, error states)
- **Task 35:** Member table (TanStack Table, server-side pagination/filter)

### Phase 4: Agents + Harden (Week 4)

- **Task 36:** Registration Guardian agent (Inngest cron + Claude)
- **Task 37:** Revenue Sentinel agent (weekly digest)
- **Task 38:** Fixture Intelligence agent (weather API + clash detection)
- **Task 39:** Content Engine agent (weekly roundup generation)
- **Task 40:** QED Super Admin dashboard tier
- **Task 41:** PDF report generation (React-PDF for AGM reports)
- **Task 42:** E2E tests (Playwright: login, fixtures, results, live scoring)
- **Task 43:** Production hardening (error boundaries, Sentry alerts, monitoring)
- **Task 44:** Deploy production with Derry's custom domain

---

## Verification Checklist

Before marking the project as launch-ready:

- [ ] All Supabase migrations applied
- [ ] RLS policies tested with 2+ tenants
- [ ] TypeScript: zero errors (`npx tsc --noEmit`)
- [ ] Build passes (`npm run build`)
- [ ] Twilio webhook validates signatures correctly
- [ ] Stripe webhook validates signatures correctly
- [ ] Rate limiting active on all public endpoints
- [ ] Sentry capturing errors
- [ ] Health check returns 200
- [ ] Claude AI answering member queries
- [ ] Fixtures display correctly in dashboard
- [ ] Results can be submitted via WhatsApp
- [ ] Stripe payments processing
- [ ] Email notifications sending
- [ ] Live scoreboard updating in real-time
- [ ] Inngest functions running on schedule
- [ ] At least 1 proactive agent operational
- [ ] Custom domain resolving to correct tenant
- [ ] No PII in logs
- [ ] Audit log capturing mutations
