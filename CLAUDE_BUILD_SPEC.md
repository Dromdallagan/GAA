# CLAUDE.md - ClubOS Build Specification
## Comprehensive Build Plan for Claude Code

---

## PROJECT OVERVIEW

**ClubOS** is an AI-powered GAA club management platform that will revolutionize how Derry GAA operates. This document provides exhaustive specifications for building a production-grade, zero-downtime system.

**Developed by:** QED Digitalisation

### Mission
Eliminate 70% of volunteer administrative burden through intelligent automation via WhatsApp, with real-time results, membership management, lotto, and supporter subscriptions.

### 🎯 MAXIMUM OFFLOAD PHILOSOPHY

> **"Every line of code we write is a line we must maintain, a potential bug, something we must test. 
> Offload EVERYTHING possible to battle-tested services."**

We build the MINIMUM code necessary. These services do the heavy lifting:

| Service | Heavy Lifting | Our Code |
|---------|--------------|----------|
| **Twilio Studio** | Message routing, menus, keywords | Zero |
| **Twilio Conversations** | Session state, 24hr tracking | Zero |
| **Supabase Auto-API** | REST endpoints for all tables | Zero |
| **Stripe Payment Links** | Checkout, receipts, PCI compliance | Zero |
| **Stripe Customer Portal** | Subscription management | Zero |
| **Inngest** | Background jobs, cron, retries | Minimal |
| **Resend** | Transactional email | 5 lines |
| **Upstash** | Rate limiting | 5 lines |
| **Sentry** | Error tracking, alerts | 3 lines |
| **Vercel** | Deploy, CDN, scaling | Zero |

**Result: ~2,000 lines of custom code instead of ~15,000**

### Core Principles
1. **Maximum Offload** - Use services, not custom code
2. **Reliability First** - Supporters expect instant results; any downtime is unacceptable
3. **Security by Default** - Row Level Security on every table, no exceptions
4. **WhatsApp First** - Members interact via WhatsApp, not apps or logins
5. **Type Safety** - TypeScript strict mode throughout
6. **Observable** - Every action logged, every error captured

---

## TECH STACK SPECIFICATION

### Framework & Runtime
```
Next.js 16.x (App Router)
├── React 19.x with Server Components
├── TypeScript 5.4+ (strict mode)
├── Tailwind CSS 4.x
└── shadcn/ui components
```

**Why Next.js 16:**
- Turbopack for fast builds
- Server Actions for form handling
- Edge Runtime for global performance
- Built-in security headers

### Database
```
Supabase (PostgreSQL 16+)
├── Row Level Security (RLS) mandatory
├── Auto-generated REST API (NO custom endpoints!)
├── Realtime subscriptions for live updates
├── Edge Functions (Deno) for webhooks
├── Auth for admin login
└── Storage for files
```

### 🏗️ MAXIMUM OFFLOAD SERVICE STACK

```
┌─────────────────────────────────────────────────────────────────┐
│                     CLUBOS SERVICE ARCHITECTURE                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  MESSAGING LAYER (Twilio)                                       │
│  ├── Studio          → Visual routing (NO CODE)                 │
│  ├── Conversations   → State management (AUTOMATIC)             │
│  ├── Verify          → OTP/2FA (3 lines)                        │
│  └── Content Builder → Templates (NO CODE)                      │
│                                                                  │
│  DATABASE LAYER (Supabase)                                      │
│  ├── PostgreSQL      → Storage                                  │
│  ├── Auto-API        → REST endpoints (NO CODE)                 │
│  ├── RLS             → Security (SQL policies)                  │
│  ├── Auth            → Admin login (CONFIGURE)                  │
│  └── Realtime        → Live updates (SUBSCRIBE)                 │
│                                                                  │
│  PAYMENTS LAYER (Stripe)                                        │
│  ├── Payment Links   → Checkout (NO CODE)                       │
│  ├── Customer Portal → Billing mgmt (NO CODE)                   │
│  ├── Billing         → Subscriptions (CONFIGURE)                │
│  └── Webhooks        → Events (SIMPLE HANDLER)                  │
│                                                                  │
│  BACKGROUND JOBS (Inngest)                                      │
│  ├── Cron            → Scheduled tasks                          │
│  ├── Events          → Triggered workflows                      │
│  ├── Retries         → Auto-retry on failure                    │
│  └── Observability   → Job monitoring                           │
│                                                                  │
│  SUPPORTING SERVICES                                            │
│  ├── Resend          → Transactional email                      │
│  ├── Upstash         → Rate limiting                            │
│  ├── Sentry          → Error tracking                           │
│  ├── Vercel          → Hosting & deployment                     │
│  └── Claude AI       → Natural language                         │
│                                                                  │
│  WHAT WE BUILD (~2,000 lines)                                   │
│  ├── Claude AI prompts & tools                                  │
│  ├── Webhook handlers (Twilio, Stripe)                          │
│  ├── Inngest function definitions                               │
│  ├── Dashboard UI (Next.js + shadcn)                            │
│  └── Supabase schema & RLS policies                             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### External Services Configuration

```
Twilio (Messaging)
├── WhatsApp Business API
├── Studio for conversation routing (visual, no code)
├── Conversations for state management
├── Verify for OTP/admin auth
└── Content Template Builder

Stripe (Payments)
├── Payment Links (no checkout code)
├── Customer Portal (no billing UI code)
├── Subscription billing
├── Webhook events
└── GBP/EUR currencies

Inngest (Background Jobs)
├── Cron jobs (lotto draws, reminders)
├── Event-driven workflows
├── Automatic retries
└── Visual debugging UI

Resend (Email)
├── Transactional email
├── React Email templates
├── Delivery tracking
└── 100 emails/day free

Upstash (Rate Limiting)
├── Serverless Redis
├── Rate limiting library
├── Works on Edge
└── 10,000 requests/day free

Anthropic Claude (AI)
├── claude-sonnet-4-5 for conversation
├── @anthropic-ai/sdk (TypeScript)
└── Tool use for structured extraction
```

### Deployment
```
Vercel
├── Automatic deployment from Git
├── Edge Functions
├── Automatic HTTPS
├── Preview deployments
├── Cron jobs (vercel.json)
└── Analytics & Web Vitals
```

### Monitoring & Observability
```
Sentry - Error tracking, performance monitoring (3 lines setup)
Inngest Dashboard - Background job monitoring
Vercel Analytics - Core Web Vitals
Stripe Dashboard - Payment monitoring
Twilio Console - Message delivery tracking
```

---

## 🎯 ROLE AUTOMATION PATTERNS

### Volunteer Time Savings Target

| Role | Before | After | Automation |
|------|--------|-------|------------|
| **Secretary** | 15-20 hrs/week | 4-5 hrs | 75% |
| **Treasurer** | 10-15 hrs/week | 2-3 hrs | 80% |
| **PRO** | 8-12 hrs/week | 2-4 hrs | 70% |
| **Registrar** | 5-10 hrs/week | 1-2 hrs | 85% |
| **Chairman** | 5-8 hrs/week | 3-4 hrs | 50% |
| **TOTAL** | ~50 hrs/week | ~15 hrs | **72%** |

### Pattern 1: Query → Claude AI → Response (Secretary Automation)

```typescript
// Member asks question via WhatsApp
// Claude answers automatically - Secretary does NOTHING

// Twilio Studio routes to webhook when keyword not matched
// Our webhook handler:

export async function handleQuery(message: string, memberId: string) {
  // Get context from Supabase
  const { data: member } = await supabase
    .from('members')
    .select('*, organization:organizations(*)')
    .eq('id', memberId)
    .single();

  // Claude answers with context
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250514',
    max_tokens: 500,
    system: `You are the helpful assistant for ${member.organization.name} GAA club.
             Answer questions about fixtures, membership, events.
             Be friendly and concise. Use GAA terminology.`,
    tools: claudeTools, // lookup_fixture, check_membership, etc.
    messages: [{ role: 'user', content: message }]
  });

  return response;
}

// Examples Claude handles automatically:
// "When's the U14 match?" → Looks up fixture, responds
// "Am I registered?" → Checks membership, responds
// "What's the lotto jackpot?" → Checks current jackpot, responds
// Secretary saved: ~5 hours/week
```

### Pattern 2: Payment Link → Stripe → Auto-Receipt (Treasurer Automation)

```typescript
// NO CHECKOUT CODE - Stripe Payment Links handle everything

// Create payment link in Stripe Dashboard or via API:
const paymentLink = await stripe.paymentLinks.create({
  line_items: [{ price: 'price_membership_adult', quantity: 1 }],
  after_completion: {
    type: 'redirect',
    redirect: { url: 'https://clubos.ie/thanks' }
  },
  metadata: {
    member_id: memberId,
    type: 'membership'
  }
});

// Send via WhatsApp (Twilio)
await sendWhatsApp(phoneNumber, {
  template: 'payment_link',
  variables: { 
    name: member.first_name,
    amount: '€50',
    link: paymentLink.url 
  }
});

// Stripe webhook handles the rest:
// - Payment processed
// - Receipt sent automatically
// - Supabase updated via our webhook
// Treasurer does NOTHING
```

### Pattern 3: Scheduled Task → Inngest → Multi-Channel (All Roles)

```typescript
// inngest/functions/lotto-draw.ts

import { inngest } from './client';

export const weeklyLottoDraw = inngest.createFunction(
  { id: 'weekly-lotto-draw' },
  { cron: 'TZ=Europe/Dublin 0 20 * * 0' }, // Sunday 8pm Dublin time
  async ({ step }) => {
    // Step 1: Get active draw
    const draw = await step.run('get-draw', async () => {
      const { data } = await supabase
        .from('lotto_draws')
        .select('*')
        .eq('status', 'open')
        .single();
      return data;
    });

    // Step 2: Generate winning numbers
    const numbers = await step.run('pick-numbers', async () => {
      return pickRandomNumbers(4, 32);
    });

    // Step 3: Find winners (auto-retries on failure)
    const winners = await step.run('check-winners', async () => {
      const { data } = await supabase
        .from('lotto_entries')
        .select('*, member:members(*)')
        .eq('draw_id', draw.id)
        .contains('numbers', numbers);
      return data;
    });

    // Step 4: Update draw
    await step.run('update-draw', async () => {
      await supabase
        .from('lotto_draws')
        .update({ 
          winning_numbers: numbers,
          status: 'complete',
          winners: winners.map(w => w.member_id)
        })
        .eq('id', draw.id);
    });

    // Step 5: Broadcast results via WhatsApp
    await step.run('broadcast-results', async () => {
      await twilioClient.messages.create({
        contentSid: 'HX_lotto_results_template',
        contentVariables: JSON.stringify({
          numbers: numbers.join(', '),
          jackpot: draw.jackpot_amount,
          winners: winners.length
        }),
        from: process.env.TWILIO_WHATSAPP_NUMBER,
        to: 'whatsapp:broadcast_list'
      });
    });

    // Step 6: Notify winners individually
    for (const winner of winners) {
      await step.run(`notify-winner-${winner.id}`, async () => {
        await twilioClient.messages.create({
          contentSid: 'HX_lotto_winner_template',
          contentVariables: JSON.stringify({
            name: winner.member.first_name,
            prize: calculatePrize(winner)
          }),
          from: process.env.TWILIO_WHATSAPP_NUMBER,
          to: `whatsapp:${winner.member.phone_number}`
        });
      });
    }

    return { draw_id: draw.id, numbers, winner_count: winners.length };
  }
);

// Runs automatically every Sunday
// Auto-retries each step on failure
// Visual debugging in Inngest dashboard
// Treasurer/Secretary do NOTHING
```

### Pattern 4: Result Submission → Claude Parse → Multi-Publish (PRO Automation)

```typescript
// Manager texts: "Senior men beat Slaughtneil 2-14 to 1-10"
// Claude parses, validates, and triggers multi-channel publish

export async function handleResultSubmission(
  message: string, 
  managerId: string
) {
  // Claude extracts structured data
  const result = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250514',
    max_tokens: 500,
    tools: [{
      name: 'submit_result',
      description: 'Submit a match result',
      input_schema: {
        type: 'object',
        properties: {
          home_team: { type: 'string' },
          away_team: { type: 'string' },
          home_goals: { type: 'number' },
          home_points: { type: 'number' },
          away_goals: { type: 'number' },
          away_points: { type: 'number' },
          competition: { type: 'string' },
          scorers: { type: 'array', items: { type: 'string' } }
        },
        required: ['home_team', 'away_team', 'home_goals', 'home_points', 'away_goals', 'away_points']
      }
    }],
    messages: [{ role: 'user', content: message }]
  });

  // Trigger multi-channel publish via Inngest
  await inngest.send({
    name: 'result/submitted',
    data: {
      result: result.content[0].input,
      submitted_by: managerId
    }
  });
}

// Inngest function handles the fan-out:
export const publishResult = inngest.createFunction(
  { id: 'publish-result' },
  { event: 'result/submitted' },
  async ({ event, step }) => {
    const { result } = event.data;

    // Update database
    await step.run('update-fixture', async () => {
      await supabase.from('fixtures').update({
        home_score_goals: result.home_goals,
        home_score_points: result.home_points,
        away_score_goals: result.away_goals,
        away_score_points: result.away_points,
        status: 'complete'
      }).eq('id', result.fixture_id);
    });

    // Post to social media
    await step.run('post-social', async () => {
      // Auto-post to Facebook, Twitter via their APIs
    });

    // Notify supporters
    await step.run('notify-supporters', async () => {
      await twilioClient.messages.create({
        contentSid: 'HX_result_notification',
        // ... broadcast to subscribers
      });
    });

    // Generate match report draft
    await step.run('generate-report', async () => {
      const report = await anthropic.messages.create({
        model: 'claude-sonnet-4-5-20250514',
        messages: [{
          role: 'user',
          content: `Write a 50-word match report for: ${JSON.stringify(result)}`
        }]
      });
      // Save draft for PRO approval
    });
  }
);

// PRO reviews in 10 seconds instead of writing for 20 minutes
```

### Pattern 5: Registration Flow → WhatsApp Flow → Auto-Process (Registrar Automation)

```typescript
// WhatsApp Flow JSON (configured in Meta Business Manager)
// NO CODE - visual builder

const registrationFlow = {
  screens: [
    {
      id: 'personal_info',
      title: 'Registration',
      data: [
        { type: 'TextInput', name: 'first_name', label: 'First Name', required: true },
        { type: 'TextInput', name: 'last_name', label: 'Last Name', required: true },
        { type: 'DatePicker', name: 'dob', label: 'Date of Birth', required: true },
        { type: 'TextInput', name: 'email', label: 'Email', inputType: 'email' }
      ]
    },
    {
      id: 'guardian_info',
      title: 'Guardian (if under 18)',
      data: [
        { type: 'TextInput', name: 'guardian_name', label: 'Guardian Name' },
        { type: 'TextInput', name: 'guardian_phone', label: 'Guardian Phone' }
      ]
    },
    {
      id: 'membership_type',
      title: 'Membership',
      data: [
        { 
          type: 'RadioButtonsGroup', 
          name: 'membership_type',
          label: 'Select Type',
          options: [
            { id: 'adult', title: 'Adult - €50' },
            { id: 'youth', title: 'Youth - €30' },
            { id: 'family', title: 'Family - €100' }
          ]
        }
      ]
    }
  ]
};

// Webhook receives completed flow data
export async function handleRegistrationComplete(flowData: any) {
  // Create member in Supabase
  const { data: member } = await supabase
    .from('members')
    .insert({
      first_name: flowData.first_name,
      last_name: flowData.last_name,
      date_of_birth: flowData.dob,
      email: flowData.email,
      membership_type: flowData.membership_type,
      phone_number: flowData.wa_phone_number,
      membership_status: 'pending'
    })
    .select()
    .single();

  // Generate Stripe Payment Link
  const paymentLink = await stripe.paymentLinks.create({
    line_items: [{ 
      price: getPriceId(flowData.membership_type), 
      quantity: 1 
    }],
    metadata: { member_id: member.id }
  });

  // Send payment link via WhatsApp
  await twilioClient.messages.create({
    to: `whatsapp:${flowData.wa_phone_number}`,
    from: process.env.TWILIO_WHATSAPP_NUMBER,
    contentSid: 'HX_payment_link',
    contentVariables: JSON.stringify({
      name: flowData.first_name,
      link: paymentLink.url
    })
  });

  return member;
}

// Registrar just does weekly Foireann upload
// Registration, payment, confirmation all automatic
```

### Pattern 6: Reminder Sequences → Inngest Sleep → Auto-Chase (Treasurer Automation)

```typescript
// Auto-chase unpaid memberships - Treasurer does NOTHING

export const membershipReminderSequence = inngest.createFunction(
  { id: 'membership-reminder-sequence' },
  { event: 'membership/payment-pending' },
  async ({ event, step }) => {
    const { memberId } = event.data;

    // Wait 7 days
    await step.sleep('wait-7-days', '7d');

    // Check if still unpaid
    const stillUnpaid = await step.run('check-day-7', async () => {
      const { data } = await supabase
        .from('members')
        .select('membership_status')
        .eq('id', memberId)
        .single();
      return data.membership_status === 'pending';
    });

    if (!stillUnpaid) return { status: 'paid' };

    // Send reminder 1
    await step.run('send-reminder-1', async () => {
      await sendWhatsAppReminder(memberId, 'friendly_reminder');
    });

    // Wait another 7 days
    await step.sleep('wait-14-days', '7d');

    // Check again
    const stillUnpaid2 = await step.run('check-day-14', async () => {
      const { data } = await supabase
        .from('members')
        .select('membership_status')
        .eq('id', memberId)
        .single();
      return data.membership_status === 'pending';
    });

    if (!stillUnpaid2) return { status: 'paid' };

    // Send reminder 2 (more urgent)
    await step.run('send-reminder-2', async () => {
      await sendWhatsAppReminder(memberId, 'urgent_reminder');
    });

    // Wait final 7 days
    await step.sleep('wait-21-days', '7d');

    // Final check and warning
    const stillUnpaid3 = await step.run('check-day-21', async () => {
      const { data } = await supabase
        .from('members')
        .select('membership_status')
        .eq('id', memberId)
        .single();
      return data.membership_status === 'pending';
    });

    if (!stillUnpaid3) return { status: 'paid' };

    // Final warning
    await step.run('send-final-warning', async () => {
      await sendWhatsAppReminder(memberId, 'final_warning');
    });

    return { status: 'warned', member_id: memberId };
  }
);

// Entire 3-week chase sequence runs automatically
// Survives server restarts
// Visual tracking in Inngest dashboard
// Treasurer does NOTHING (no awkward phone calls!)
```

---

## 📱 TWILIO STUDIO SETUP (Visual Routing - NO CODE)

### Why Twilio Studio?

Twilio Studio is a **visual drag-and-drop builder**. It handles:
- ✅ Keyword detection ("lotto", "fixtures", "help")
- ✅ Menu systems ("Reply 1 for..., 2 for...")
- ✅ Conditional routing (is this an admin?)
- ✅ Variable storage (user's name during session)
- ✅ Error handling ("Sorry, I didn't understand")
- ✅ Fallback to webhook (when Claude AI needed)

**We write ZERO routing code. It's all visual.**

### Studio Flow Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                     CLUBOS STUDIO FLOW                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐                                                │
│  │   TRIGGER   │  ← Incoming WhatsApp message                   │
│  │  (Incoming) │                                                │
│  └──────┬──────┘                                                │
│         │                                                        │
│         ▼                                                        │
│  ┌─────────────────────────┐                                    │
│  │   SPLIT: First Message? │                                    │
│  └─────────────┬───────────┘                                    │
│         │      │                                                │
│    YES  │      │ NO (returning user)                            │
│         ▼      ▼                                                │
│  ┌──────────┐  ┌──────────────────┐                             │
│  │ Welcome  │  │ SPLIT: Keyword?  │                             │
│  │ Message  │  └────────┬─────────┘                             │
│  └────┬─────┘           │                                       │
│       │     ┌───────────┼───────────┬───────────┬─────────┐    │
│       │     ▼           ▼           ▼           ▼         ▼    │
│       │ "lotto"    "fixture"   "result"    "register"  default │
│       │     │           │           │           │         │    │
│       │     ▼           ▼           ▼           ▼         ▼    │
│       │ ┌───────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌───────┐│
│       │ │ Send  │ │  HTTP   │ │  HTTP   │ │  Send   │ │ HTTP  ││
│       │ │ WA    │ │ Request │ │ Request │ │  WA     │ │Request││
│       │ │ Flow  │ │ to API  │ │ to API  │ │  Flow   │ │Claude ││
│       │ │(lotto)│ │/fixture │ │/result  │ │(regist.)│ │  AI   ││
│       │ └───────┘ └─────────┘ └─────────┘ └─────────┘ └───────┘│
│       │                                                         │
│       └──────────────────────────────────────────────────────→ │
│                          END                                    │
└─────────────────────────────────────────────────────────────────┘
```

### Setting Up Studio Flow

1. **Go to Twilio Console → Studio → Create Flow**
2. **Add Trigger widget** (already there)
3. **Add Split Based On widget** for keyword detection:

```json
// Split conditions (configured in UI)
{
  "conditions": [
    { "friendly_name": "Lotto", "argument": "{{trigger.message.Body}}", "type": "matches_any_of", "value": ["lotto", "play", "numbers", "jackpot"] },
    { "friendly_name": "Fixtures", "argument": "{{trigger.message.Body}}", "type": "matches_any_of", "value": ["fixture", "fixtures", "match", "game", "when"] },
    { "friendly_name": "Results", "argument": "{{trigger.message.Body}}", "type": "matches_any_of", "value": ["result", "results", "score", "won", "lost"] },
    { "friendly_name": "Register", "argument": "{{trigger.message.Body}}", "type": "matches_any_of", "value": ["register", "join", "signup", "sign up", "membership"] },
    { "friendly_name": "Help", "argument": "{{trigger.message.Body}}", "type": "matches_any_of", "value": ["help", "menu", "options", "?"] }
  ]
}
```

4. **Add HTTP Request widgets** for our API:

```json
// HTTP Request to Claude AI endpoint
{
  "method": "POST",
  "url": "https://clubos.ie/api/webhooks/twilio/ai",
  "headers": {
    "Content-Type": "application/json",
    "X-Twilio-Signature": "{{trigger.request.header.x-twilio-signature}}"
  },
  "body": {
    "message": "{{trigger.message.Body}}",
    "from": "{{trigger.message.From}}",
    "to": "{{trigger.message.To}}"
  }
}
```

5. **Add Send Message widgets** for direct responses
6. **Connect to WhatsApp Flows** for forms (lotto, registration)

### WhatsApp Flows Integration

WhatsApp Flows (Meta feature) works through Studio:

```typescript
// Studio widget configuration for WhatsApp Flow
{
  "widget_type": "send-message",
  "attributes": {
    "content_sid": "HX_lotto_flow", // WhatsApp Flow template SID
    "from": "{{flow.channel.address}}",
    "to": "{{contact.channel.address}}"
  }
}
```

### Studio Flow Export (JSON)

```json
// You can export/import entire flows as JSON
// This is the ClubOS base flow - import into Studio

{
  "description": "ClubOS WhatsApp Handler",
  "states": [
    {
      "name": "Trigger",
      "type": "trigger",
      "transitions": [
        { "next": "check_keyword", "event": "incomingMessage" }
      ]
    },
    {
      "name": "check_keyword",
      "type": "split-based-on",
      "properties": {
        "input": "{{trigger.message.Body}}",
        "offset": { "x": 0, "y": 200 }
      },
      "transitions": [
        { "next": "handle_lotto", "event": "match", "conditions": [{"friendly_name": "Lotto", "arguments": ["lotto", "play", "numbers"]}] },
        { "next": "handle_fixtures", "event": "match", "conditions": [{"friendly_name": "Fixtures", "arguments": ["fixture", "match", "when"]}] },
        { "next": "handle_ai", "event": "noMatch" }
      ]
    },
    {
      "name": "handle_lotto",
      "type": "send-message",
      "properties": {
        "content_sid": "HX_lotto_flow_template"
      },
      "transitions": [
        { "next": "end", "event": "sent" }
      ]
    },
    {
      "name": "handle_fixtures",
      "type": "make-http-request",
      "properties": {
        "method": "POST",
        "url": "https://clubos.ie/api/fixtures/upcoming"
      },
      "transitions": [
        { "next": "send_fixtures_response", "event": "success" }
      ]
    },
    {
      "name": "handle_ai",
      "type": "make-http-request",
      "properties": {
        "method": "POST",
        "url": "https://clubos.ie/api/webhooks/twilio/ai"
      },
      "transitions": [
        { "next": "send_ai_response", "event": "success" }
      ]
    }
  ]
}
```

### Our Webhook (Minimal Code)

```typescript
// src/app/api/webhooks/twilio/ai/route.ts
// This is called by Studio when Claude AI is needed

import { NextResponse } from 'next/server';
import { validateTwilioSignature } from '@/lib/twilio';
import { askClaude } from '@/lib/claude';

export async function POST(request: Request) {
  // Validate Twilio signature
  if (!await validateTwilioSignature(request)) {
    return new Response('Unauthorized', { status: 401 });
  }

  const body = await request.json();
  const { message, from } = body;

  // Rate limit
  const { success } = await aiRatelimit.limit(from);
  if (!success) {
    return NextResponse.json({
      response: "I'm getting a lot of questions. Please try again in a minute!"
    });
  }

  // Ask Claude
  const response = await askClaude(message, from);

  // Return response for Studio to send
  return NextResponse.json({ response });
}
```

### What This Means

| Routing Task | How It's Handled |
|--------------|------------------|
| "lotto" keyword | Studio routes to WhatsApp Flow |
| "fixtures" keyword | Studio calls our API, sends response |
| "help" keyword | Studio sends static help menu |
| Unknown message | Studio calls Claude AI endpoint |
| Admin commands | Studio checks phone number, routes to admin flow |

**Zero routing code. All visual. All in Twilio Console.**

---

## MCP SERVERS & TOOLS FOR CLAUDE CODE

### Recommended MCP Configuration

```json
// .mcp.json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_TOKEN}"
      }
    },
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "DATABASE_URL": "${DATABASE_URL}"
      }
    },
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "--root", "."]
    }
  }
}
```

### Claude Code CLI Commands

```bash
# Session management
claude --continue              # Resume last session
claude --resume <session-id>   # Resume specific session

# Output control
claude -p "task"               # Print mode (non-interactive)
claude --output-format json    # JSON output

# Debugging
claude --debug "api,mcp"       # Debug specific categories
claude --verbose               # Full turn-by-turn output

# Background tasks
claude "& npm run dev"         # Run in background
/tasks                         # View background tasks
/kill <task-id>                # Kill background task
```

### CLAUDE.md Best Practices

```markdown
# Project: ClubOS

## Critical Context (Read First)
- Language: TypeScript + Node.js 20 LTS
- Framework: Next.js 16 (App Router)
- Database: Supabase PostgreSQL with RLS
- Testing: Vitest + Playwright

## Commands That Work
npm run dev          # Start dev server (port 3000)
npm test             # Run unit tests
npm run test:e2e     # Run Playwright tests
npm run lint         # ESLint check
npm run typecheck    # TypeScript validation
npm run db:migrate   # Run Supabase migrations
npm run db:types     # Generate TypeScript types

## Important Patterns
- All API routes in /src/app/api
- Database queries use Supabase client
- Auth uses Supabase Auth
- Webhooks in /src/app/api/webhooks

## Gotchas & What NOT to Do
- DON'T expose service_role key to client
- DON'T skip RLS policies on any table
- ALWAYS validate Twilio webhook signatures
- ALWAYS validate Stripe webhook signatures
- DON'T store card numbers or sensitive data
- ALWAYS use parameterized queries (Supabase handles this)

## File Structure
/src
  /app
    /(admin)      # Admin portal routes
    /(public)     # Public pages
    /api          # API routes
      /webhooks   # Twilio, Stripe webhooks
      /inngest    # Inngest webhook endpoint
  /lib            # Shared utilities
    /claude.ts    # Claude AI client
    /supabase     # Supabase clients
    /twilio.ts    # Twilio helpers
    /stripe.ts    # Stripe helpers
    /email.ts     # Resend email
    /ratelimit.ts # Upstash rate limiting
  /inngest        # Background job functions
  /components     # React components
  /types          # TypeScript types
/supabase
  /migrations     # Database migrations
```

---

## 🚫 WHAT WE DON'T BUILD (Maximum Offload)

### Never Write Code For:

| Feature | Why We Don't Build It | Use Instead |
|---------|----------------------|-------------|
| **Message routing** | Complex, error-prone | Twilio Studio (visual) |
| **Conversation state** | Hard to manage | Twilio Conversations |
| **REST API endpoints** | Boilerplate | Supabase Auto-API |
| **Checkout forms** | PCI compliance nightmare | Stripe Payment Links |
| **Billing portal** | Complex UI | Stripe Customer Portal |
| **Job queues** | Infrastructure overhead | Inngest |
| **Email infrastructure** | Deliverability issues | Resend |
| **Rate limiting** | Edge cases | Upstash |
| **Error tracking** | Build vs buy | Sentry |
| **Deployment pipeline** | DevOps overhead | Vercel |

### Lines of Code Comparison

```
WITHOUT Maximum Offload:
├── Message routing logic       ~800 lines
├── Conversation state mgmt     ~600 lines
├── REST API CRUD               ~1,500 lines
├── Checkout forms              ~400 lines
├── Billing management UI       ~800 lines
├── Job queue system            ~600 lines
├── Email templates/sending     ~300 lines
├── Rate limiting middleware    ~200 lines
├── Error handling/tracking     ~400 lines
├── Deployment scripts          ~200 lines
└── TOTAL                       ~5,800 lines (just infrastructure!)

WITH Maximum Offload:
├── Claude AI prompts/tools     ~200 lines
├── Webhook handlers            ~250 lines
├── Inngest function defs       ~400 lines
├── Dashboard UI                ~800 lines
├── Supabase schema + RLS       ~350 lines
└── TOTAL                       ~2,000 lines (all business logic!)
```

### The Golden Rule

> **Before writing ANY code, ask: "Can a service do this for us?"**
> 
> If yes → Use the service
> If no → Write minimal code
> If unsure → Research services first

---

## DATABASE SCHEMA

### Core Tables

```sql
-- Enable RLS on ALL tables
ALTER TABLE <table_name> ENABLE ROW LEVEL SECURITY;

-- ============================================
-- ORGANIZATIONS (County Boards & Clubs)
-- ============================================
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('county_board', 'club')),
  parent_id UUID REFERENCES organizations(id),
  phone_number TEXT,              -- WhatsApp number
  twilio_phone_sid TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for slug lookups
CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_organizations_parent ON organizations(parent_id);

-- RLS: Users can read their organization and children
CREATE POLICY "Users can read own organization"
  ON organizations FOR SELECT
  USING (
    id IN (
      SELECT org_id FROM organization_members 
      WHERE user_id = auth.uid()
    )
    OR parent_id IN (
      SELECT org_id FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- ORGANIZATION MEMBERS (Staff/Admins)
-- ============================================
CREATE TABLE organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'secretary', 'treasurer', 'manager', 'pro')),
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);

CREATE INDEX idx_org_members_user ON organization_members(user_id);
CREATE INDEX idx_org_members_org ON organization_members(organization_id);

-- RLS: Users can read their own memberships
CREATE POLICY "Users can read own memberships"
  ON organization_members FOR SELECT
  USING (user_id = auth.uid());

-- ============================================
-- MEMBERS (Club Members)
-- ============================================
CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL,     -- E.164 format
  phone_hash TEXT NOT NULL,       -- SHA256 for lookups
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  date_of_birth DATE,
  membership_type TEXT CHECK (membership_type IN ('adult', 'youth', 'student', 'family', 'social')),
  membership_status TEXT DEFAULT 'pending' CHECK (membership_status IN ('pending', 'active', 'expired', 'suspended')),
  membership_expires_at DATE,
  foireann_id TEXT,               -- Foireann system ID
  stripe_customer_id TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, phone_hash)
);

CREATE INDEX idx_members_org ON members(organization_id);
CREATE INDEX idx_members_phone_hash ON members(phone_hash);
CREATE INDEX idx_members_status ON members(membership_status);

-- RLS: Org members can read their org's members
CREATE POLICY "Org members can read members"
  ON members FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- CONVERSATIONS (WhatsApp Sessions)
-- ============================================
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  member_id UUID REFERENCES members(id) ON DELETE SET NULL,
  phone_number TEXT NOT NULL,
  twilio_conversation_sid TEXT,
  state TEXT DEFAULT 'active' CHECK (state IN ('active', 'waiting', 'closed')),
  context JSONB DEFAULT '{}',     -- Conversation context for AI
  last_message_at TIMESTAMPTZ,
  service_window_expires_at TIMESTAMPTZ,  -- 24hr WhatsApp window
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_conversations_phone ON conversations(phone_number);
CREATE INDEX idx_conversations_org ON conversations(organization_id);
CREATE INDEX idx_conversations_member ON conversations(member_id);

-- ============================================
-- MESSAGES (Conversation History)
-- ============================================
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'template', 'media')),
  template_name TEXT,
  template_params JSONB,
  twilio_message_sid TEXT,
  twilio_status TEXT,
  cost_category TEXT CHECK (cost_category IN ('marketing', 'utility', 'service', 'authentication')),
  cost_amount DECIMAL(10, 6),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_created ON messages(created_at);

-- ============================================
-- FIXTURES
-- ============================================
CREATE TABLE fixtures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  competition_id UUID REFERENCES competitions(id),
  home_team_id UUID REFERENCES organizations(id),
  away_team_id UUID REFERENCES organizations(id),
  venue TEXT,
  scheduled_at TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'completed', 'postponed', 'cancelled')),
  home_score_goals INTEGER,
  home_score_points INTEGER,
  away_score_goals INTEGER,
  away_score_points INTEGER,
  match_report TEXT,
  scorers JSONB,
  man_of_match TEXT,
  submitted_by UUID REFERENCES auth.users(id),
  submitted_at TIMESTAMPTZ,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_fixtures_org ON fixtures(organization_id);
CREATE INDEX idx_fixtures_date ON fixtures(scheduled_at);
CREATE INDEX idx_fixtures_status ON fixtures(status);

-- ============================================
-- COMPETITIONS
-- ============================================
CREATE TABLE competitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL CHECK (code IN ('football', 'hurling', 'camogie', 'lgfa')),
  level TEXT NOT NULL CHECK (level IN ('senior', 'intermediate', 'junior', 'u21', 'minor', 'u16', 'u14', 'u12')),
  type TEXT NOT NULL CHECK (type IN ('championship', 'league', 'cup')),
  season INTEGER NOT NULL,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed')),
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- LOTTO SYSTEM (Dual: County Board + Club)
-- ============================================

-- Lotto Configurations (per organization)
CREATE TABLE lotto_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,                          -- "Derry GAA County Lotto" or "Glen GAA Lotto"
  lotto_type TEXT NOT NULL CHECK (lotto_type IN ('county', 'club')),
  numbers_range_min INTEGER DEFAULT 1,
  numbers_range_max INTEGER DEFAULT 32,
  numbers_to_pick INTEGER DEFAULT 4,
  price_per_line DECIMAL(10, 2) DEFAULT 2.00,
  max_lines_per_entry INTEGER DEFAULT 5,
  draw_day TEXT CHECK (draw_day IN ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')),
  draw_time TIME,
  jackpot_seed DECIMAL(10, 2) DEFAULT 1000.00, -- Starting jackpot
  rollover_amount DECIMAL(10, 2) DEFAULT 100.00, -- Added each week if no winner
  match_3_prize DECIMAL(10, 2) DEFAULT 25.00,
  match_2_prize DECIMAL(10, 2) DEFAULT 0.00,   -- Optional
  stripe_product_id TEXT,
  stripe_price_id TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id)
);

-- Lotto Draws
CREATE TABLE lotto_draws (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_id UUID NOT NULL REFERENCES lotto_configs(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  lotto_type TEXT NOT NULL CHECK (lotto_type IN ('county', 'club')),
  draw_number INTEGER NOT NULL,                -- Sequential draw number
  draw_date DATE NOT NULL,
  jackpot_amount DECIMAL(10, 2) NOT NULL,
  winning_numbers INTEGER[],                   -- NULL until drawn
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed', 'drawing', 'drawn', 'paid')),
  
  -- Entry stats
  total_entries INTEGER DEFAULT 0,
  total_lines INTEGER DEFAULT 0,
  total_revenue DECIMAL(10, 2) DEFAULT 0,
  
  -- Winner tracking
  jackpot_won BOOLEAN DEFAULT FALSE,
  jackpot_winner_ids UUID[],                   -- Can be multiple if split
  match_3_winner_ids UUID[],
  match_2_winner_ids UUID[],
  
  -- Financials
  prize_pool DECIMAL(10, 2) DEFAULT 0,
  rollover_to_next DECIMAL(10, 2) DEFAULT 0,
  
  -- Revenue split (calculated after draw)
  gross_revenue DECIMAL(10, 2) DEFAULT 0,
  twilio_costs DECIMAL(10, 2) DEFAULT 0,
  qed_margin DECIMAL(10, 2) DEFAULT 0,         -- QED Digitalisation margin
  net_to_organization DECIMAL(10, 2) DEFAULT 0,
  
  -- Audit
  drawn_at TIMESTAMPTZ,
  drawn_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES auth.users(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(config_id, draw_number)
);

CREATE INDEX idx_lotto_draws_org ON lotto_draws(organization_id);
CREATE INDEX idx_lotto_draws_status ON lotto_draws(status);
CREATE INDEX idx_lotto_draws_date ON lotto_draws(draw_date);
CREATE INDEX idx_lotto_draws_type ON lotto_draws(lotto_type);

-- Lotto Entries
CREATE TABLE lotto_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draw_id UUID NOT NULL REFERENCES lotto_draws(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  member_id UUID REFERENCES members(id),
  phone_number TEXT NOT NULL,
  phone_hash TEXT NOT NULL,
  
  -- Entry details
  numbers INTEGER[4] NOT NULL,
  entry_type TEXT DEFAULT 'manual' CHECK (entry_type IN ('manual', 'lucky_dip', 'subscription')),
  line_number INTEGER DEFAULT 1,               -- Which line in multi-line entry
  entry_group_id UUID,                         -- Groups multi-line entries together
  
  -- Payment
  amount DECIMAL(10, 2) NOT NULL DEFAULT 2.00,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded', 'expired')),
  stripe_checkout_session_id TEXT,
  stripe_payment_intent_id TEXT,
  payment_method TEXT,                         -- 'card', 'apple_pay', 'google_pay'
  paid_at TIMESTAMPTZ,
  
  -- Results (populated after draw)
  matched_numbers INTEGER DEFAULT 0,
  prize_amount DECIMAL(10, 2) DEFAULT 0,
  prize_paid BOOLEAN DEFAULT FALSE,
  prize_paid_at TIMESTAMPTZ,
  
  -- Message tracking
  confirmation_sent BOOLEAN DEFAULT FALSE,
  result_sent BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_lotto_entries_draw ON lotto_entries(draw_id);
CREATE INDEX idx_lotto_entries_phone ON lotto_entries(phone_hash);
CREATE INDEX idx_lotto_entries_payment ON lotto_entries(payment_status);
CREATE INDEX idx_lotto_entries_group ON lotto_entries(entry_group_id);

-- Lotto Subscriptions (Weekly recurring entries)
CREATE TABLE lotto_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_id UUID NOT NULL REFERENCES lotto_configs(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  member_id UUID REFERENCES members(id),
  phone_number TEXT NOT NULL,
  phone_hash TEXT NOT NULL,
  
  -- Subscription details
  numbers INTEGER[4],                          -- NULL if lucky_dip
  entry_type TEXT DEFAULT 'fixed' CHECK (entry_type IN ('fixed', 'lucky_dip')),
  lines_per_draw INTEGER DEFAULT 1 CHECK (lines_per_draw BETWEEN 1 AND 5),
  
  -- Stripe
  stripe_customer_id TEXT NOT NULL,
  stripe_subscription_id TEXT NOT NULL,
  stripe_price_id TEXT,
  
  -- Billing
  amount_per_draw DECIMAL(10, 2) NOT NULL,     -- lines × £2
  billing_period TEXT DEFAULT 'monthly' CHECK (billing_period IN ('weekly', 'monthly')),
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled', 'past_due')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  
  -- Stats
  total_draws_entered INTEGER DEFAULT 0,
  total_spent DECIMAL(10, 2) DEFAULT 0,
  total_won DECIMAL(10, 2) DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_lotto_subs_org ON lotto_subscriptions(organization_id);
CREATE INDEX idx_lotto_subs_phone ON lotto_subscriptions(phone_hash);
CREATE INDEX idx_lotto_subs_status ON lotto_subscriptions(status);

-- Lotto Revenue Tracking (Monthly reconciliation)
CREATE TABLE lotto_revenue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  lotto_type TEXT NOT NULL CHECK (lotto_type IN ('county', 'club')),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  -- Revenue breakdown
  total_entries INTEGER DEFAULT 0,
  gross_revenue DECIMAL(10, 2) DEFAULT 0,
  
  -- Costs
  twilio_message_count INTEGER DEFAULT 0,
  twilio_costs DECIMAL(10, 2) DEFAULT 0,
  stripe_fees DECIMAL(10, 2) DEFAULT 0,
  
  -- QED Digitalisation margin
  qed_margin_rate DECIMAL(5, 4) DEFAULT 0.10,  -- 10% default
  qed_margin_amount DECIMAL(10, 2) DEFAULT 0,
  
  -- Prizes paid
  prizes_paid DECIMAL(10, 2) DEFAULT 0,
  
  -- Net to organization
  net_revenue DECIMAL(10, 2) DEFAULT 0,
  
  -- Settlement
  settled BOOLEAN DEFAULT FALSE,
  settled_at TIMESTAMPTZ,
  settlement_reference TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(organization_id, lotto_type, period_start)
);

-- ============================================
-- SUBSCRIPTIONS (Supporter Subscriptions)
-- ============================================
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL,
  phone_hash TEXT NOT NULL,
  member_id UUID REFERENCES members(id),
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

CREATE INDEX idx_subscriptions_phone ON subscriptions(phone_hash);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_stripe ON subscriptions(stripe_subscription_id);

-- ============================================
-- MESSAGE COSTS (Usage Tracking)
-- ============================================
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
```

### Database Functions

```sql
-- Function to check if user has role on organization
CREATE OR REPLACE FUNCTION has_role_on_org(
  _user_id UUID,
  _org_id UUID,
  _roles TEXT[] DEFAULT ARRAY['owner', 'admin', 'secretary', 'treasurer', 'manager', 'pro']
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM organization_members
    WHERE user_id = _user_id
      AND organization_id = _org_id
      AND role = ANY(_roles)
  );
END;
$$;

-- Function to update message costs atomically
CREATE OR REPLACE FUNCTION increment_message_cost(
  _org_id UUID,
  _category TEXT,
  _cost DECIMAL
)
RETURNS VOID
LANGUAGE plpgsql
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
  )
  USING _cost, _org_id, _period_start;
END;
$$;

-- Trigger to update updated_at
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

CREATE TRIGGER members_updated_at
  BEFORE UPDATE ON members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER fixtures_updated_at
  BEFORE UPDATE ON fixtures
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

---

## API ARCHITECTURE

### Directory Structure

```
src/
├── app/
│   ├── (admin)/
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── members/
│   │   │   └── page.tsx
│   │   ├── fixtures/
│   │   │   └── page.tsx
│   │   ├── lotto/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (public)/
│   │   ├── page.tsx
│   │   ├── results/
│   │   │   └── page.tsx
│   │   └── subscribe/
│   │       └── page.tsx
│   ├── api/
│   │   ├── webhooks/
│   │   │   ├── twilio/
│   │   │   │   └── route.ts
│   │   │   └── stripe/
│   │   │       └── route.ts
│   │   ├── messages/
│   │   │   └── route.ts
│   │   ├── fixtures/
│   │   │   └── route.ts
│   │   └── health/
│   │       └── route.ts
│   ├── layout.tsx
│   └── globals.css
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── admin.ts
│   ├── twilio/
│   │   ├── client.ts
│   │   ├── webhook.ts
│   │   └── templates.ts
│   ├── stripe/
│   │   ├── client.ts
│   │   └── webhook.ts
│   ├── claude/
│   │   ├── client.ts
│   │   ├── tools.ts
│   │   └── prompts.ts
│   ├── utils/
│   │   ├── phone.ts
│   │   ├── hash.ts
│   │   └── errors.ts
│   └── constants.ts
├── components/
│   ├── ui/                    # shadcn/ui components
│   ├── dashboard/
│   ├── fixtures/
│   └── members/
├── types/
│   ├── database.ts            # Generated from Supabase
│   ├── twilio.ts
│   └── stripe.ts
└── middleware.ts
```

### Webhook Security

#### Twilio Webhook Validation

```typescript
// src/lib/twilio/webhook.ts
import { validateRequest } from 'twilio';
import { headers } from 'next/headers';

export async function validateTwilioWebhook(
  request: Request,
  body: string
): Promise<boolean> {
  const headersList = headers();
  const signature = headersList.get('x-twilio-signature');
  
  if (!signature) {
    console.error('Missing Twilio signature');
    return false;
  }

  const url = process.env.TWILIO_WEBHOOK_URL!;
  const authToken = process.env.TWILIO_AUTH_TOKEN!;
  
  // Parse body as form data
  const params = Object.fromEntries(new URLSearchParams(body));
  
  const isValid = validateRequest(authToken, signature, url, params);
  
  if (!isValid) {
    console.error('Invalid Twilio signature', { url, params: Object.keys(params) });
  }
  
  return isValid;
}
```

#### Stripe Webhook Validation

```typescript
// src/lib/stripe/webhook.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
});

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
  } catch (err) {
    console.error('Stripe webhook signature verification failed', err);
    return null;
  }
}
```

### Error Handling

```typescript
// src/lib/utils/errors.ts
import * as Sentry from '@sentry/nextjs';

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export function handleError(error: unknown, context?: Record<string, unknown>) {
  if (error instanceof AppError && error.isOperational) {
    // Expected operational error
    console.error(`[${error.code}] ${error.message}`, context);
    return;
  }

  // Unexpected error - capture in Sentry
  Sentry.captureException(error, {
    extra: context,
  });
  
  console.error('Unexpected error:', error);
}

// Error codes
export const ErrorCodes = {
  // Twilio
  TWILIO_SEND_FAILED: 'TWILIO_SEND_FAILED',
  TWILIO_INVALID_SIGNATURE: 'TWILIO_INVALID_SIGNATURE',
  TWILIO_RATE_LIMITED: 'TWILIO_RATE_LIMITED',
  
  // Stripe
  STRIPE_PAYMENT_FAILED: 'STRIPE_PAYMENT_FAILED',
  STRIPE_INVALID_SIGNATURE: 'STRIPE_INVALID_SIGNATURE',
  
  // Claude
  CLAUDE_API_ERROR: 'CLAUDE_API_ERROR',
  CLAUDE_RATE_LIMITED: 'CLAUDE_RATE_LIMITED',
  
  // Database
  DB_CONNECTION_ERROR: 'DB_CONNECTION_ERROR',
  DB_QUERY_ERROR: 'DB_QUERY_ERROR',
  
  // Auth
  AUTH_UNAUTHORIZED: 'AUTH_UNAUTHORIZED',
  AUTH_FORBIDDEN: 'AUTH_FORBIDDEN',
} as const;
```

---

## CLAUDE AI INTEGRATION

### Client Setup

```typescript
// src/lib/claude/client.ts
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function processMessage(
  userMessage: string,
  context: ConversationContext
): Promise<AIResponse> {
  const systemPrompt = buildSystemPrompt(context);
  
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 1024,
    system: systemPrompt,
    messages: [
      ...context.history,
      { role: 'user', content: userMessage }
    ],
    tools: getAvailableTools(context),
  });

  return processResponse(response, context);
}

function buildSystemPrompt(context: ConversationContext): string {
  return `You are ClubOS, a helpful AI assistant for ${context.organizationName} GAA club.

Current date: ${new Date().toISOString().split('T')[0]}
User phone: ${context.phoneNumber}
Member status: ${context.memberStatus || 'unknown'}

You help members with:
- Fixture queries ("When's the next match?")
- Registration and membership renewal
- Lotto entry
- Results and tables
- General club queries

IMPORTANT RULES:
1. Be friendly and concise - WhatsApp messages should be short
2. Use emojis sparingly but appropriately
3. If you need information, use the available tools
4. For payments, provide Stripe checkout links
5. Never make up fixture times or results - always check the database
6. If unsure, ask for clarification

Available information:
- Organization ID: ${context.organizationId}
- Current competitions: ${context.competitions?.join(', ') || 'Unknown'}
`;
}
```

### Tool Definitions

```typescript
// src/lib/claude/tools.ts
import { Tool } from '@anthropic-ai/sdk/resources';

export const tools: Tool[] = [
  {
    name: 'get_next_fixture',
    description: 'Get the next upcoming fixture for a team',
    input_schema: {
      type: 'object',
      properties: {
        team_id: {
          type: 'string',
          description: 'The team/organization ID'
        },
        competition_type: {
          type: 'string',
          enum: ['football', 'hurling', 'all'],
          description: 'Filter by sport type'
        }
      },
      required: ['team_id']
    }
  },
  {
    name: 'get_recent_results',
    description: 'Get recent match results',
    input_schema: {
      type: 'object',
      properties: {
        team_id: { type: 'string' },
        limit: { type: 'number', default: 5 }
      },
      required: ['team_id']
    }
  },
  {
    name: 'get_member_status',
    description: 'Check membership status for a phone number',
    input_schema: {
      type: 'object',
      properties: {
        phone_number: { type: 'string' },
        organization_id: { type: 'string' }
      },
      required: ['phone_number', 'organization_id']
    }
  },
  {
    name: 'create_registration_link',
    description: 'Generate a Stripe checkout link for membership registration',
    input_schema: {
      type: 'object',
      properties: {
        phone_number: { type: 'string' },
        organization_id: { type: 'string' },
        membership_type: {
          type: 'string',
          enum: ['adult', 'youth', 'student', 'family']
        }
      },
      required: ['phone_number', 'organization_id', 'membership_type']
    }
  },
  {
    name: 'submit_result',
    description: 'Submit a match result (admin only)',
    input_schema: {
      type: 'object',
      properties: {
        fixture_id: { type: 'string' },
        home_goals: { type: 'number' },
        home_points: { type: 'number' },
        away_goals: { type: 'number' },
        away_points: { type: 'number' },
        scorers: { type: 'string' },
        man_of_match: { type: 'string' }
      },
      required: ['fixture_id', 'home_goals', 'home_points', 'away_goals', 'away_points']
    }
  },
  {
    name: 'enter_lotto',
    description: 'Process a lotto entry',
    input_schema: {
      type: 'object',
      properties: {
        phone_number: { type: 'string' },
        numbers: {
          type: 'array',
          items: { type: 'number' },
          minItems: 4,
          maxItems: 4
        }
      },
      required: ['phone_number', 'numbers']
    }
  },
  {
    name: 'get_championship_table',
    description: 'Get current championship standings',
    input_schema: {
      type: 'object',
      properties: {
        competition_id: { type: 'string' },
        group: { type: 'string' }
      },
      required: ['competition_id']
    }
  }
];
```

---

## LOTTO SYSTEM (Complete Specification)

The platform administers **two types of lotto**: County Board Lotto and Club Lotto. Both are fully managed via WhatsApp with Stripe payments.

### Dual Lotto Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     LOTTO REVENUE FLOW                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  COUNTY BOARD LOTTO (Derry GAA)                                │
│  ├── Entry: £2/line via WhatsApp                               │
│  ├── Payment: Stripe Checkout                                   │
│  ├── Draw: Weekly (e.g., Sunday 8pm)                           │
│  └── Revenue split:                                             │
│      ├── Prizes paid out                                        │
│      ├── Twilio costs (messages)                                │
│      ├── QED Digitalisation margin (10%)                        │
│      └── Net → Derry GAA County Board                          │
│                                                                 │
│  CLUB LOTTO (e.g., Glen GAA)                                   │
│  ├── Entry: £2/line via WhatsApp                               │
│  ├── Payment: Stripe Checkout                                   │
│  ├── Draw: Weekly (club chooses day/time)                      │
│  └── Revenue split:                                             │
│      ├── Prizes paid out                                        │
│      ├── Twilio costs (messages)                                │
│      ├── QED Digitalisation margin (10%)                        │
│      └── Net → Club                                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Revenue Split Calculation

```typescript
// src/lib/lotto/revenue.ts

interface LottoRevenueSplit {
  grossRevenue: number;          // Total collected
  prizesPaid: number;            // Jackpot + match prizes
  stripeFees: number;            // ~2.9% + 20p per transaction
  twilioMessageCosts: number;    // Entry confirmations + results
  qedMargin: number;             // 10% of (gross - prizes - stripe)
  netToOrganization: number;     // What county/club receives
}

export function calculateLottoRevenue(
  draw: LottoDraw,
  entries: LottoEntry[],
  messages: MessageCost[]
): LottoRevenueSplit {
  const grossRevenue = entries
    .filter(e => e.payment_status === 'paid')
    .reduce((sum, e) => sum + e.amount, 0);

  const prizesPaid = calculatePrizesPaid(draw);
  
  // Stripe fees: 2.9% + £0.20 per successful charge
  const uniquePayments = new Set(entries.map(e => e.stripe_payment_intent_id)).size;
  const stripeFees = (grossRevenue * 0.029) + (uniquePayments * 0.20);

  // Twilio costs for this draw
  const twilioMessageCosts = messages.reduce((sum, m) => sum + m.cost, 0);

  // QED margin: 10% of operational revenue (after prizes and payment fees)
  const operationalRevenue = grossRevenue - prizesPaid - stripeFees;
  const qedMarginRate = 0.10;
  const qedMargin = operationalRevenue * qedMarginRate;

  // Net to organization
  const netToOrganization = operationalRevenue - twilioMessageCosts - qedMargin;

  return {
    grossRevenue,
    prizesPaid,
    stripeFees,
    twilioMessageCosts,
    qedMargin,
    netToOrganization,
  };
}

// Example calculation:
// 500 entries × £2 = £1,000 gross
// Jackpot: £0 (no winner), Match-3 prizes: £75 (3 × £25)
// Stripe: (£1,000 × 2.9%) + (400 transactions × £0.20) = £29 + £80 = £109
// Operational: £1,000 - £75 - £109 = £816
// QED margin: £816 × 10% = £81.60
// Twilio: 600 messages × £0.004 avg = £2.40
// Net to County/Club: £816 - £81.60 - £2.40 = £732
```

### WhatsApp Lotto Flows

#### Subscriber Entry Flow

```
Subscriber: "Lotto"

ClubOS: "🍀 DERRY GAA COUNTY LOTTO

This week's jackpot: £10,000!
📅 Draw: Sunday 8pm

Pick 4 numbers (1-32):
£2 per line, max 5 lines

Reply with your numbers:
• '3 15 22 31' for one line
• '3 15 22 31, 7 14 21 28' for two
• 'Lucky dip' for random numbers"

Subscriber: "3 15 22 31, 7 14 21 28"

ClubOS: "Your Derry GAA Lotto entries:

🎱 Line 1: 3 - 15 - 22 - 31
🎱 Line 2: 7 - 14 - 21 - 28

💰 Total: £4.00

Pay securely:
→ pay.clubos.ie/lotto/derry/abc123

⏱️ Link expires in 30 minutes
Good luck! 🍀"

[Subscriber pays via Stripe Checkout]

ClubOS: "✅ ENTRY CONFIRMED

Derry GAA County Lotto
📅 Draw #47 - Sunday 16th March, 8pm
🏆 Jackpot: £10,000

Your numbers:
🎱 3 - 15 - 22 - 31
🎱 7 - 14 - 21 - 28

We'll message you with results!
Good luck! 🍀"
```

#### Club Lotto (Different Branding)

```
Member: "Glen lotto"

ClubOS: "🍀 GLEN GAA CLUB LOTTO

This week's jackpot: £4,200!
📅 Draw: Saturday 9pm

Pick 4 numbers (1-32):
£2 per line

Reply with your numbers or 'lucky dip'"

Member: "Lucky dip 3"

ClubOS: "🎲 Your Glen GAA lucky dip:

🎱 Line 1: 4 - 11 - 19 - 27
🎱 Line 2: 2 - 8 - 23 - 30
🎱 Line 3: 6 - 15 - 21 - 32

💰 Total: £6.00

Pay here:
→ pay.clubos.ie/lotto/glen/xyz789"
```

#### Admin Draw Flow (Club Secretary)

```
Secretary: "Run Glen lotto"

ClubOS: "🎰 GLEN GAA LOTTO - DRAW #52

Ready to draw for Saturday 15th March?

📊 Stats:
• Entries: 312 lines from 198 players
• Revenue: £624.00
• Current jackpot: £4,200

⚠️ This action cannot be undone.

Reply DRAW to generate winning numbers."

Secretary: "DRAW"

ClubOS: "🎰 DRAWING...

━━━━━━━━━━━━━━━━━━━━━━━━━
🏆 WINNING NUMBERS
━━━━━━━━━━━━━━━━━━━━━━━━━

     7  -  14  -  21  -  28

━━━━━━━━━━━━━━━━━━━━━━━━━

Checking 312 entries...

RESULTS:
❌ No JACKPOT winner (4 numbers)

🎉 Match 3 winners (3 numbers):
   • +447xxx1234 - £25
   • +447xxx5678 - £25
   • +447xxx9012 - £25

📊 FINANCIAL SUMMARY:
   Gross revenue: £624.00
   Prizes: £75.00
   Stripe fees: £25.10
   Twilio costs: £1.88
   QED margin: £52.20
   ━━━━━━━━━━━━━━━━
   Net to Glen GAA: £469.82

Next jackpot: £4,300 (+£100 rollover)

[Notify Winners] [View Full Report] [Publish Results]"

Secretary: "Notify winners"

ClubOS: "✅ Winners notified!

WhatsApp sent to:
• +447xxx1234 ✓
• +447xxx5678 ✓
• +447xxx9012 ✓

Reply PUBLISH to announce results to all."

Secretary: "Publish"

ClubOS: "✅ Results published!

Broadcast sent to:
• 487 Glen GAA members
• Draft ready for social media

Tonight's results posted to:
→ glen.clubos.ie/lotto/results"
```

#### Winner Notification

```
ClubOS → Winner:

"🎉 CONGRATULATIONS!

You matched 3 numbers in tonight's
Glen GAA Lotto Draw #52!

Your entry: 7 - 14 - 19 - 28
Winning:    7 - 14 - 21 - 28
Matched:    7, 14, 28 ✓

🏆 You've won £25!

Reply CLAIM to arrange collection,
or we'll contact you within 48 hours.

Well done! 🍀"
```

### Lotto Subscription (Recurring Weekly)

```
Subscriber: "I want to play every week"

ClubOS: "🍀 WEEKLY LOTTO SUBSCRIPTION

Never miss a draw! Same numbers every week.

Choose your lotto:
1️⃣ Derry GAA County Lotto (Sun 8pm)
2️⃣ Glen GAA Club Lotto (Sat 9pm)

Reply 1 or 2"

Subscriber: "1"

ClubOS: "📅 DERRY GAA WEEKLY SUBSCRIPTION

Your numbers from last entry:
🎱 3 - 15 - 22 - 31

Or reply with new numbers / 'lucky dip'

Billing: £8/month (4 draws × £2)
Cancel anytime via WhatsApp.

Set up subscription:
→ pay.clubos.ie/lotto-sub/derry/abc123"
```

### County Board Lotto vs Club Lotto

| Feature | County Board Lotto | Club Lotto |
|---------|-------------------|------------|
| **Operator** | Derry GAA | Individual club |
| **Jackpot range** | £5,000 - £50,000 | £1,000 - £10,000 |
| **Draw frequency** | Weekly (Sunday) | Weekly (club chooses) |
| **Entry price** | £2/line | £2/line |
| **Audience** | All Derry supporters | Club members + supporters |
| **Revenue to** | Derry GAA County Board | Individual club |
| **Admin** | County Board officers | Club secretary |

### Lotto Tool Implementation

```typescript
// src/lib/claude/tools/lotto.ts
import { supabase } from '@/lib/supabase/client';
import { createLottoCheckout } from '@/lib/lotto/checkout';

export const lottoTools = [
  {
    name: 'get_active_lottos',
    description: 'Get all active lottos the user can enter (county + their club)',
    input_schema: {
      type: 'object',
      properties: {
        phone_number: { type: 'string' },
      },
      required: ['phone_number']
    }
  },
  {
    name: 'process_lotto_entry',
    description: 'Process lotto number selection and create payment link',
    input_schema: {
      type: 'object',
      properties: {
        phone_number: { type: 'string' },
        lotto_config_id: { type: 'string' },
        numbers: {
          type: 'array',
          items: {
            type: 'array',
            items: { type: 'number', minimum: 1, maximum: 32 },
            minItems: 4,
            maxItems: 4
          },
          description: 'Array of number lines'
        },
        lucky_dip_count: {
          type: 'number',
          minimum: 1,
          maximum: 5,
          description: 'Number of lucky dip lines (instead of manual numbers)'
        }
      },
      required: ['phone_number', 'lotto_config_id']
    }
  },
  {
    name: 'get_lotto_results',
    description: 'Get recent lotto results for county or club',
    input_schema: {
      type: 'object',
      properties: {
        organization_id: { type: 'string' },
        lotto_type: { 
          type: 'string',
          enum: ['county', 'club']
        },
        limit: { type: 'number', default: 5 }
      },
      required: ['organization_id']
    }
  },
  {
    name: 'check_my_entries',
    description: 'Check user\'s lotto entries and any winnings',
    input_schema: {
      type: 'object',
      properties: {
        phone_number: { type: 'string' },
        include_history: { type: 'boolean', default: false }
      },
      required: ['phone_number']
    }
  },
  {
    name: 'run_lotto_draw',
    description: 'Execute lotto draw (admin only)',
    input_schema: {
      type: 'object',
      properties: {
        draw_id: { type: 'string' },
        admin_user_id: { type: 'string' }
      },
      required: ['draw_id', 'admin_user_id']
    }
  },
  {
    name: 'create_lotto_subscription',
    description: 'Set up weekly recurring lotto entry',
    input_schema: {
      type: 'object',
      properties: {
        phone_number: { type: 'string' },
        lotto_config_id: { type: 'string' },
        numbers: {
          type: 'array',
          items: { type: 'number' },
          minItems: 4,
          maxItems: 4
        },
        entry_type: {
          type: 'string',
          enum: ['fixed', 'lucky_dip']
        },
        lines_per_draw: { type: 'number', minimum: 1, maximum: 5 }
      },
      required: ['phone_number', 'lotto_config_id', 'entry_type']
    }
  }
];

// Tool handler
export async function handleLottoTool(
  toolName: string,
  params: Record<string, unknown>
): Promise<ToolResult> {
  switch (toolName) {
    case 'process_lotto_entry':
      return await processLottoEntry(params);
    case 'run_lotto_draw':
      return await runLottoDraw(params);
    // ... other handlers
  }
}

async function processLottoEntry(params: {
  phone_number: string;
  lotto_config_id: string;
  numbers?: number[][];
  lucky_dip_count?: number;
}): Promise<ToolResult> {
  // 1. Get lotto config and current draw
  const { data: config } = await supabase
    .from('lotto_configs')
    .select('*, organizations(*)')
    .eq('id', params.lotto_config_id)
    .single();

  if (!config || !config.is_active) {
    return { success: false, message: 'This lotto is not currently active.' };
  }

  const { data: currentDraw } = await supabase
    .from('lotto_draws')
    .select('*')
    .eq('config_id', params.lotto_config_id)
    .eq('status', 'open')
    .order('draw_date', { ascending: true })
    .limit(1)
    .single();

  if (!currentDraw) {
    return { success: false, message: 'No open draw available. Check back soon!' };
  }

  // 2. Generate or validate numbers
  let numberLines: number[][] = [];
  
  if (params.lucky_dip_count) {
    for (let i = 0; i < params.lucky_dip_count; i++) {
      numberLines.push(generateRandomNumbers(
        config.numbers_range_min,
        config.numbers_range_max,
        config.numbers_to_pick
      ));
    }
  } else if (params.numbers) {
    // Validate each line
    for (const line of params.numbers) {
      if (!validateNumbers(line, config)) {
        return {
          success: false,
          message: `Invalid numbers. Pick ${config.numbers_to_pick} different numbers between ${config.numbers_range_min} and ${config.numbers_range_max}.`
        };
      }
      numberLines.push(line.sort((a, b) => a - b));
    }
  } else {
    return { success: false, message: 'Please provide numbers or request a lucky dip.' };
  }

  if (numberLines.length > config.max_lines_per_entry) {
    return {
      success: false,
      message: `Maximum ${config.max_lines_per_entry} lines per entry.`
    };
  }

  // 3. Create entry records
  const entryGroupId = crypto.randomUUID();
  const phoneHash = hashPhone(params.phone_number);
  const entries: LottoEntry[] = [];

  for (let i = 0; i < numberLines.length; i++) {
    const { data: entry } = await supabase
      .from('lotto_entries')
      .insert({
        draw_id: currentDraw.id,
        organization_id: config.organization_id,
        phone_number: params.phone_number,
        phone_hash: phoneHash,
        numbers: numberLines[i],
        entry_type: params.lucky_dip_count ? 'lucky_dip' : 'manual',
        line_number: i + 1,
        entry_group_id: entryGroupId,
        amount: config.price_per_line,
      })
      .select()
      .single();
    
    entries.push(entry);
  }

  // 4. Create Stripe checkout
  const totalAmount = numberLines.length * config.price_per_line;
  const checkoutUrl = await createLottoCheckout({
    entryGroupId,
    entries,
    config,
    draw: currentDraw,
    totalAmount,
  });

  return {
    success: true,
    lotto_name: config.name,
    lotto_type: config.lotto_type,
    draw_date: currentDraw.draw_date,
    jackpot: currentDraw.jackpot_amount,
    entries: numberLines.map((nums, i) => ({
      line: i + 1,
      numbers: nums,
      type: params.lucky_dip_count ? 'lucky_dip' : 'manual',
    })),
    total_amount: totalAmount,
    currency: 'GBP',
    checkout_url: checkoutUrl,
    expires_in_minutes: 30,
  };
}

function generateRandomNumbers(min: number, max: number, count: number): number[] {
  const numbers: number[] = [];
  while (numbers.length < count) {
    const num = Math.floor(Math.random() * (max - min + 1)) + min;
    if (!numbers.includes(num)) {
      numbers.push(num);
    }
  }
  return numbers.sort((a, b) => a - b);
}

function validateNumbers(numbers: number[], config: LottoConfig): boolean {
  if (numbers.length !== config.numbers_to_pick) return false;
  if (new Set(numbers).size !== numbers.length) return false; // Duplicates
  return numbers.every(n => 
    n >= config.numbers_range_min && n <= config.numbers_range_max
  );
}
```

### Stripe Webhook for Lotto Payments

```typescript
// src/app/api/webhooks/stripe/route.ts

async function handleLottoPayment(session: Stripe.Checkout.Session) {
  const { entry_group_id } = session.metadata!;

  // Update all entries in this group
  const { data: entries } = await supabase
    .from('lotto_entries')
    .update({
      payment_status: 'paid',
      stripe_payment_intent_id: session.payment_intent as string,
      paid_at: new Date().toISOString(),
    })
    .eq('entry_group_id', entry_group_id)
    .select();

  // Update draw stats
  const draw_id = entries[0].draw_id;
  await supabase.rpc('increment_draw_stats', {
    _draw_id: draw_id,
    _entries: entries.length,
    _revenue: entries.reduce((sum, e) => sum + e.amount, 0),
  });

  // Send confirmation via WhatsApp
  await sendLottoConfirmation(entries);

  // Track message cost
  await trackMessageCost(entries[0].organization_id, 'utility', 0.004);
}
```

---

## BUILD PHASES

### Phase 0: Foundation (Week 1)
**Goal: Project scaffold with CI/CD**

```bash
# Day 1-2: Project Setup
npx create-next-app@latest clubos --typescript --tailwind --app --src-dir
cd clubos
npm install @supabase/supabase-js @anthropic-ai/sdk twilio stripe
npm install -D @types/node typescript vitest @playwright/test

# Configure TypeScript strict mode
# tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

**Deliverables:**
- [ ] GitHub repository created
- [ ] Next.js 16 project initialized
- [ ] TypeScript strict mode configured
- [ ] Vercel deployment connected
- [ ] Environment variables template
- [ ] Basic CI/CD pipeline (lint, typecheck, test)

### Phase 1: Database & Auth (Week 2)
**Goal: Supabase setup with RLS**

**Deliverables:**
- [ ] Supabase project created
- [ ] All migrations written and tested
- [ ] RLS policies on all tables
- [ ] Supabase Auth configured
- [ ] Type generation pipeline
- [ ] Database seeding script

### Phase 2: Twilio Integration (Week 3)
**Goal: Send/receive WhatsApp messages**

**Deliverables:**
- [ ] Twilio account with WhatsApp sandbox
- [ ] Webhook endpoint with signature validation
- [ ] Message sending function
- [ ] Conversation state management
- [ ] Service window tracking
- [ ] Message cost tracking

### Phase 3: Claude AI (Week 4)
**Goal: Intelligent conversation handling**

**Deliverables:**
- [ ] Claude client with error handling
- [ ] System prompt engineering
- [ ] Tool implementations
- [ ] Conversation history management
- [ ] Rate limiting
- [ ] Fallback responses

### Phase 4: Core Features (Weeks 5-6)
**Goal: Fixtures, results, members**

**Deliverables:**
- [ ] Fixture queries via WhatsApp
- [ ] Result submission (admin via WhatsApp)
- [ ] Automatic result broadcasting
- [ ] Membership status checks
- [ ] Registration flow with Stripe

### Phase 5: Lotto System (Week 7)
**Goal: Complete lotto flow**

**Deliverables:**
- [ ] Lotto entry via WhatsApp
- [ ] Payment processing
- [ ] Draw management
- [ ] Winner notification
- [ ] Jackpot rollover logic

### Phase 6: Supporter Subscriptions (Week 8)
**Goal: Revenue model implementation**

**Deliverables:**
- [ ] Stripe subscription products
- [ ] Checkout flow
- [ ] Subscription management
- [ ] Webhook handling for renewals/cancellations
- [ ] Subscriber broadcasting

### Phase 7: Admin Dashboard (Weeks 9-10)
**Goal: Web interface for admins**

**Deliverables:**
- [ ] Dashboard with key metrics
- [ ] Member management
- [ ] Fixture management
- [ ] Lotto management
- [ ] Message history/analytics

### Phase 8: County Board Features (Weeks 11-12)
**Goal: Multi-club aggregation**

**Deliverables:**
- [ ] Live results dashboard
- [ ] Championship tables (auto-updated)
- [ ] County-wide fixture calendar
- [ ] Aggregate membership stats
- [ ] Supporter broadcast channel

### Phase 9: Testing & Hardening (Weeks 13-14)
**Goal: Production readiness**

**Deliverables:**
- [ ] Comprehensive E2E tests
- [ ] Load testing (1000 concurrent users)
- [ ] Security audit
- [ ] Error monitoring with Sentry
- [ ] Uptime monitoring
- [ ] Runbook documentation

### Phase 10: Pilot Launch (Weeks 15-16)
**Goal: 3 pilot clubs live**

**Deliverables:**
- [ ] Pilot club onboarding
- [ ] Training materials
- [ ] Support channel (Slack/WhatsApp)
- [ ] Feedback collection
- [ ] Performance metrics

---

## TESTING STRATEGY

### Unit Tests (Vitest)

```typescript
// tests/unit/claude.test.ts
import { describe, it, expect, vi } from 'vitest';
import { processMessage } from '@/lib/claude/client';

describe('Claude AI', () => {
  it('should handle fixture queries', async () => {
    const response = await processMessage(
      "When's the next match?",
      mockContext
    );
    
    expect(response.intent).toBe('fixture_query');
    expect(response.toolCalls).toContainEqual(
      expect.objectContaining({ name: 'get_next_fixture' })
    );
  });

  it('should handle unknown queries gracefully', async () => {
    const response = await processMessage(
      "What's the meaning of life?",
      mockContext
    );
    
    expect(response.message).toContain("I can help you with");
  });
});
```

### Integration Tests

```typescript
// tests/integration/twilio.test.ts
import { describe, it, expect } from 'vitest';
import { POST } from '@/app/api/webhooks/twilio/route';

describe('Twilio Webhook', () => {
  it('should reject invalid signatures', async () => {
    const request = new Request('http://localhost/api/webhooks/twilio', {
      method: 'POST',
      headers: {
        'x-twilio-signature': 'invalid',
      },
      body: 'Body=Hello&From=whatsapp%3A%2B447123456789',
    });

    const response = await POST(request);
    expect(response.status).toBe(401);
  });

  it('should process valid messages', async () => {
    const request = createValidTwilioRequest('Hello');
    const response = await POST(request);
    
    expect(response.status).toBe(200);
    expect(await response.text()).toContain('<Response>');
  });
});
```

### E2E Tests (Playwright)

```typescript
// tests/e2e/admin-dashboard.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Admin Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'admin@test.com');
    await page.fill('[name="password"]', 'testpassword');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('should display fixture list', async ({ page }) => {
    await page.click('text=Fixtures');
    await expect(page.locator('table')).toBeVisible();
  });

  test('should submit result', async ({ page }) => {
    await page.click('text=Fixtures');
    await page.click('[data-testid="submit-result-btn"]');
    await page.fill('[name="home_goals"]', '2');
    await page.fill('[name="home_points"]', '14');
    await page.fill('[name="away_goals"]', '1');
    await page.fill('[name="away_points"]', '12');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('.toast-success')).toContainText('Result submitted');
  });
});
```

### Load Testing

```bash
# k6 load test
k6 run tests/load/webhook-load.js

# scripts/load/webhook-load.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 100 },
    { duration: '1m', target: 500 },
    { duration: '30s', target: 1000 },
    { duration: '1m', target: 1000 },
    { duration: '30s', target: 0 },
  ],
};

export default function () {
  const res = http.post(__ENV.WEBHOOK_URL, {
    Body: 'When is the next match?',
    From: 'whatsapp:+447123456789',
  });
  
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
  
  sleep(1);
}
```

---

## MONITORING & ALERTING

### Sentry Configuration

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1, // 10% of transactions
  profilesSampleRate: 0.1,
  environment: process.env.VERCEL_ENV || 'development',
  
  beforeSend(event) {
    // Don't send PII
    if (event.user) {
      delete event.user.email;
      delete event.user.ip_address;
    }
    return event;
  },
  
  ignoreErrors: [
    'ResizeObserver loop',
    'Non-Error promise rejection',
  ],
});
```

### Health Endpoint

```typescript
// src/app/api/health/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const checks: Record<string, boolean> = {};
  
  // Database check
  try {
    const supabase = createClient();
    const { error } = await supabase.from('organizations').select('id').limit(1);
    checks.database = !error;
  } catch {
    checks.database = false;
  }
  
  // Claude API check
  try {
    // Lightweight check - just verify API key format
    checks.claude = !!process.env.ANTHROPIC_API_KEY?.startsWith('sk-ant-');
  } catch {
    checks.claude = false;
  }
  
  // Twilio check
  try {
    checks.twilio = !!(
      process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN
    );
  } catch {
    checks.twilio = false;
  }
  
  // Stripe check
  try {
    checks.stripe = !!process.env.STRIPE_SECRET_KEY?.startsWith('sk_');
  } catch {
    checks.stripe = false;
  }
  
  const healthy = Object.values(checks).every(Boolean);
  
  return NextResponse.json(
    {
      status: healthy ? 'healthy' : 'unhealthy',
      checks,
      timestamp: new Date().toISOString(),
    },
    { status: healthy ? 200 : 503 }
  );
}
```

### Uptime Monitoring

```yaml
# uptime-robot.yml (conceptual)
monitors:
  - name: ClubOS Health
    url: https://clubos.ie/api/health
    interval: 60
    alert_contacts:
      - email: alerts@qeddigitalisation.com
      - slack: #clubos-alerts

  - name: ClubOS Homepage
    url: https://clubos.ie
    interval: 60
    
  - name: ClubOS Admin
    url: https://clubos.ie/dashboard
    interval: 300
```

---

## 🔄 INNGEST SETUP (Background Jobs)

### Installation & Configuration

```bash
npm install inngest
```

```typescript
// src/inngest/client.ts
import { Inngest } from 'inngest';

export const inngest = new Inngest({ 
  id: 'clubos',
  eventKey: process.env.INNGEST_EVENT_KEY 
});
```

```typescript
// src/app/api/inngest/route.ts
import { serve } from 'inngest/next';
import { inngest } from '@/inngest/client';
import { 
  weeklyLottoDraw,
  membershipReminderSequence,
  fixtureReminder,
  resultBroadcast,
  weeklyDigest
} from '@/inngest/functions';

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    weeklyLottoDraw,
    membershipReminderSequence,
    fixtureReminder,
    resultBroadcast,
    weeklyDigest
  ],
});
```

### All Inngest Functions

```typescript
// src/inngest/functions/index.ts

// =============================================
// LOTTO: Weekly Draw (Sunday 8pm)
// =============================================
export const weeklyLottoDraw = inngest.createFunction(
  { id: 'weekly-lotto-draw' },
  { cron: 'TZ=Europe/Dublin 0 20 * * 0' },
  async ({ step }) => {
    // See Pattern 3 in Role Automation section
  }
);

// =============================================
// MEMBERSHIP: Payment Reminder Sequence
// =============================================
export const membershipReminderSequence = inngest.createFunction(
  { id: 'membership-reminder-sequence' },
  { event: 'membership/payment-pending' },
  async ({ event, step }) => {
    // See Pattern 6 in Role Automation section
  }
);

// =============================================
// FIXTURES: 48hr Reminder
// =============================================
export const fixtureReminder = inngest.createFunction(
  { id: 'fixture-reminder' },
  { cron: 'TZ=Europe/Dublin 0 10 * * *' }, // Daily at 10am
  async ({ step }) => {
    // Get fixtures in next 48 hours
    const fixtures = await step.run('get-upcoming', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 2);
      
      const { data } = await supabase
        .from('fixtures')
        .select('*, home_team:organizations!home_team_id(*)')
        .gte('scheduled_time', new Date().toISOString())
        .lte('scheduled_time', tomorrow.toISOString())
        .eq('reminder_sent', false);
      
      return data;
    });

    // Send reminders for each fixture
    for (const fixture of fixtures) {
      await step.run(`remind-${fixture.id}`, async () => {
        await twilioClient.messages.create({
          contentSid: 'HX_fixture_reminder',
          contentVariables: JSON.stringify({
            home_team: fixture.home_team.name,
            away_team: fixture.away_team.name,
            time: formatTime(fixture.scheduled_time),
            venue: fixture.venue
          }),
          from: process.env.TWILIO_WHATSAPP_NUMBER,
          messagingServiceSid: 'MG_broadcast_service'
        });

        await supabase
          .from('fixtures')
          .update({ reminder_sent: true })
          .eq('id', fixture.id);
      });
    }
  }
);

// =============================================
// RESULTS: Multi-Channel Broadcast
// =============================================
export const resultBroadcast = inngest.createFunction(
  { id: 'result-broadcast' },
  { event: 'result/submitted' },
  async ({ event, step }) => {
    const { result, fixture_id } = event.data;

    // Update database
    await step.run('update-db', async () => {
      await supabase.from('fixtures').update({
        home_score_goals: result.home_goals,
        home_score_points: result.home_points,
        away_score_goals: result.away_goals,
        away_score_points: result.away_points,
        status: 'complete'
      }).eq('id', fixture_id);
    });

    // Broadcast to supporters
    await step.run('broadcast-whatsapp', async () => {
      await twilioClient.messages.create({
        contentSid: 'HX_result_notification',
        contentVariables: JSON.stringify({
          home: `${result.home_team} ${result.home_goals}-${result.home_points}`,
          away: `${result.away_team} ${result.away_goals}-${result.away_points}`
        }),
        from: process.env.TWILIO_WHATSAPP_NUMBER,
        messagingServiceSid: 'MG_broadcast_service'
      });
    });

    // Generate match report draft
    await step.run('generate-report', async () => {
      const report = await anthropic.messages.create({
        model: 'claude-sonnet-4-5-20250514',
        max_tokens: 300,
        messages: [{
          role: 'user',
          content: `Write a concise 50-word match report:
            ${result.home_team} ${result.home_goals}-${result.home_points}
            ${result.away_team} ${result.away_goals}-${result.away_points}
            ${result.competition}
            Scorers: ${result.scorers?.join(', ') || 'Not provided'}`
        }]
      });

      await supabase.from('match_reports').insert({
        fixture_id,
        content: report.content[0].text,
        status: 'draft'
      });
    });
  }
);

// =============================================
// WEEKLY DIGEST: Sunday 6pm
// =============================================
export const weeklyDigest = inngest.createFunction(
  { id: 'weekly-digest' },
  { cron: 'TZ=Europe/Dublin 0 18 * * 0' },
  async ({ step }) => {
    // Get this week's results
    const results = await step.run('get-results', async () => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const { data } = await supabase
        .from('fixtures')
        .select('*')
        .gte('scheduled_time', weekAgo.toISOString())
        .eq('status', 'complete');
      
      return data;
    });

    // Get next week's fixtures
    const upcoming = await step.run('get-upcoming', async () => {
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      
      const { data } = await supabase
        .from('fixtures')
        .select('*')
        .gte('scheduled_time', new Date().toISOString())
        .lte('scheduled_time', nextWeek.toISOString());
      
      return data;
    });

    // Generate digest with Claude
    const digest = await step.run('generate-digest', async () => {
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-5-20250514',
        max_tokens: 500,
        messages: [{
          role: 'user',
          content: `Create a friendly weekly GAA club digest:
            
            RESULTS THIS WEEK:
            ${results.map(r => `${r.home_team} ${r.home_score} vs ${r.away_team} ${r.away_score}`).join('\n')}
            
            FIXTURES NEXT WEEK:
            ${upcoming.map(f => `${f.home_team} vs ${f.away_team} - ${f.scheduled_time}`).join('\n')}
            
            Keep it concise and enthusiastic. Use GAA terminology.`
        }]
      });
      
      return response.content[0].text;
    });

    // Broadcast via WhatsApp
    await step.run('broadcast-digest', async () => {
      await twilioClient.messages.create({
        body: digest,
        from: process.env.TWILIO_WHATSAPP_NUMBER,
        messagingServiceSid: 'MG_broadcast_service'
      });
    });
  }
);

// =============================================
// LOTTO: Jackpot Rollover
// =============================================
export const lottoRollover = inngest.createFunction(
  { id: 'lotto-rollover' },
  { event: 'lotto/draw-complete' },
  async ({ event, step }) => {
    const { draw_id, has_winner } = event.data;

    if (!has_winner) {
      await step.run('rollover-jackpot', async () => {
        const { data: draw } = await supabase
          .from('lotto_draws')
          .select('*, config:lotto_configs(*)')
          .eq('id', draw_id)
          .single();

        const newJackpot = Math.min(
          draw.jackpot_amount + draw.config.rollover_increment,
          draw.config.max_jackpot
        );

        // Create next draw
        const nextDrawDate = new Date(draw.draw_date);
        nextDrawDate.setDate(nextDrawDate.getDate() + 7);

        await supabase.from('lotto_draws').insert({
          config_id: draw.config_id,
          organization_id: draw.organization_id,
          jackpot_amount: newJackpot,
          draw_date: nextDrawDate.toISOString(),
          status: 'open'
        });
      });
    }
  }
);
```

---

## 📧 RESEND SETUP (Email)

### Installation & Configuration

```bash
npm install resend
```

```typescript
// src/lib/email.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({
  to,
  subject,
  html,
  from = 'ClubOS <noreply@clubos.ie>'
}: {
  to: string;
  subject: string;
  html: string;
  from?: string;
}) {
  return resend.emails.send({ from, to, subject, html });
}

// Pre-built email functions
export async function sendWelcomeEmail(member: Member) {
  return sendEmail({
    to: member.email,
    subject: `Welcome to ${member.organization.name}!`,
    html: `
      <h1>Welcome, ${member.first_name}!</h1>
      <p>You're now registered with ${member.organization.name}.</p>
      <p>Text us on WhatsApp anytime for fixtures, results, and more.</p>
    `
  });
}

export async function sendPaymentReceipt(payment: Payment) {
  return sendEmail({
    to: payment.member.email,
    subject: `Payment Confirmed - ${payment.description}`,
    html: `
      <h1>Payment Received</h1>
      <p>Amount: £${(payment.amount / 100).toFixed(2)}</p>
      <p>Description: ${payment.description}</p>
      <p>Date: ${new Date(payment.created_at).toLocaleDateString()}</p>
    `
  });
}

export async function sendLottoEntry(entry: LottoEntry) {
  return sendEmail({
    to: entry.member.email,
    subject: `Lotto Entry Confirmed - ${entry.draw.draw_date}`,
    html: `
      <h1>Good Luck!</h1>
      <p>Your numbers: ${entry.numbers.join(', ')}</p>
      <p>Draw date: ${new Date(entry.draw.draw_date).toLocaleDateString()}</p>
      <p>Jackpot: £${entry.draw.jackpot_amount.toLocaleString()}</p>
    `
  });
}
```

---

## 🛡️ UPSTASH SETUP (Rate Limiting)

### Installation & Configuration

```bash
npm install @upstash/ratelimit @upstash/redis
```

```typescript
// src/lib/ratelimit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Different rate limits for different endpoints
export const webhookRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, '1 m'), // 100 requests per minute
  analytics: true,
  prefix: '@upstash/ratelimit:webhook',
});

export const aiRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, '1 m'), // 20 AI calls per minute
  analytics: true,
  prefix: '@upstash/ratelimit:ai',
});

export const loginRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '15 m'), // 5 attempts per 15 minutes
  analytics: true,
  prefix: '@upstash/ratelimit:login',
});
```

### Usage in API Routes

```typescript
// src/app/api/webhooks/twilio/route.ts
import { webhookRatelimit } from '@/lib/ratelimit';

export async function POST(request: Request) {
  // Rate limit by phone number
  const formData = await request.formData();
  const from = formData.get('From') as string;
  
  const { success, remaining } = await webhookRatelimit.limit(from);
  
  if (!success) {
    return new Response('Rate limited', { 
      status: 429,
      headers: { 'X-RateLimit-Remaining': remaining.toString() }
    });
  }

  // Process webhook...
}
```

```typescript
// src/lib/claude.ts
import { aiRatelimit } from '@/lib/ratelimit';

export async function askClaude(message: string, phoneNumber: string) {
  // Rate limit AI calls per user
  const { success } = await aiRatelimit.limit(phoneNumber);
  
  if (!success) {
    return {
      response: "I'm getting a lot of questions right now. Please try again in a minute!",
      rateLimited: true
    };
  }

  // Call Claude...
}
```

---

## ENVIRONMENT VARIABLES

```bash
# .env.local.example

# ===========================================
# SUPABASE
# ===========================================
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # Server-side only!

# ===========================================
# TWILIO (Messaging)
# ===========================================
TWILIO_ACCOUNT_SID=ACxxx
TWILIO_AUTH_TOKEN=xxx
TWILIO_PHONE_NUMBER=whatsapp:+14155238886
TWILIO_WEBHOOK_URL=https://clubos.ie/api/webhooks/twilio

# ===========================================
# STRIPE (Payments)
# ===========================================
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# ===========================================
# ANTHROPIC (AI)
# ===========================================
ANTHROPIC_API_KEY=sk-ant-xxx

# ===========================================
# INNGEST (Background Jobs)
# ===========================================
INNGEST_EVENT_KEY=xxx
INNGEST_SIGNING_KEY=xxx

# ===========================================
# RESEND (Email)
# ===========================================
RESEND_API_KEY=re_xxx

# ===========================================
# UPSTASH (Rate Limiting)
# ===========================================
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx

# ===========================================
# SENTRY (Monitoring)
# ===========================================
NEXT_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx
SENTRY_AUTH_TOKEN=xxx

# ===========================================
# APP
# ===========================================
NEXT_PUBLIC_APP_URL=https://clubos.ie
NODE_ENV=production
```

---

## DEPLOYMENT CHECKLIST

### Pre-Deploy
- [ ] All tests passing
- [ ] TypeScript compilation successful
- [ ] No console.log statements in production code
- [ ] Environment variables configured in Vercel

**Supabase:**
- [ ] Database migrations applied to production
- [ ] RLS policies tested
- [ ] Auth configured

**Twilio:**
- [ ] WhatsApp sender registered with Meta
- [ ] Studio flows deployed
- [ ] Webhook URLs updated for production
- [ ] Message templates approved

**Stripe:**
- [ ] Stripe webhooks configured for production
- [ ] Payment Links created for membership & lotto
- [ ] Customer Portal enabled
- [ ] Products & prices created

**Inngest:**
- [ ] Functions synced with Inngest Cloud
- [ ] Cron schedules verified
- [ ] Webhook endpoint registered

**Monitoring:**
- [ ] Sentry project created
- [ ] Upstash Redis created
- [ ] Rate limiting configured

### Post-Deploy
- [ ] Health endpoint responding
- [ ] Can send test WhatsApp message
- [ ] Can process test payment
- [ ] Dashboard loads correctly
- [ ] No errors in Sentry
- [ ] Inngest functions showing in dashboard
- [ ] Performance metrics acceptable

### Rollback Plan
```bash
# If issues detected:
vercel rollback  # Revert to previous deployment

# If database issues:
supabase db reset --linked  # Reset to last migration
```

---

## SUPPORT & DOCUMENTATION

### Runbooks

1. **Message Not Delivered**
   - Check Twilio logs for delivery status
   - Verify WhatsApp session window
   - Check for rate limiting

2. **Payment Failed**
   - Check Stripe dashboard for error
   - Verify customer payment method
   - Check for webhook delivery

3. **Claude Not Responding**
   - Check Anthropic API status
   - Verify API key validity
   - Check rate limits

4. **Database Errors**
   - Check Supabase status
   - Review slow query logs
   - Check connection pool

### Contact Points
- **Technical Issues**: dev@moyola.ai
- **Urgent Incidents**: PagerDuty escalation
- **Billing**: billing@moyola.ai

---

## QUALITY GATES

Every PR must pass:

1. **Linting**: `npm run lint`
2. **Type Check**: `npm run typecheck`
3. **Unit Tests**: `npm test`
4. **Build**: `npm run build`
5. **Preview Deployment**: Vercel preview

Before merging to main:

1. **E2E Tests**: Playwright on preview
2. **Security Scan**: Snyk/npm audit
3. **Performance Check**: Lighthouse CI

Before production deployment:

1. **Manual QA**: Test critical flows
2. **Stakeholder Approval**: Sign-off on features
3. **Load Test**: If significant changes

---

## 💰 MONTHLY SERVICE COSTS

### Per-Club Estimate (500 members)

| Service | Tier | Monthly Cost |
|---------|------|--------------|
| **Twilio** | Pay-as-go | ~£250-350 |
| **Supabase** | Pro | £20 |
| **Stripe** | 2.9% + 20p | Variable |
| **Vercel** | Pro | £16 |
| **Inngest** | Free tier | £0 |
| **Resend** | Free tier | £0 |
| **Upstash** | Free tier | £0 |
| **Sentry** | Team | £21 |
| **Anthropic** | Pay-as-go | ~£50-100 |
| **TOTAL** | | **~£360-510** |

### At Scale (40 clubs via County Board)

| Service | Tier | Monthly Cost |
|---------|------|--------------|
| **Twilio** | Volume discount | ~£8,000 |
| **Supabase** | Team | £550 |
| **Stripe** | 2.4% + 20p | Variable |
| **Vercel** | Pro | £16 |
| **Inngest** | Pro | £50 |
| **Resend** | Pro | £50 |
| **Upstash** | Pro | £40 |
| **Sentry** | Team | £80 |
| **Anthropic** | Volume | ~£1,500 |
| **TOTAL** | | **~£10,300** |

**Per-club cost at scale: ~£260/month**

---

## 📅 IMPLEMENTATION PHASES

### Phase 0: Foundation (Week 1-2)
- [ ] Project scaffold (Next.js 16, TypeScript, Tailwind)
- [ ] Supabase project setup
- [ ] Database schema migration
- [ ] RLS policies implemented
- [ ] Basic CI/CD pipeline (Vercel)
- [ ] Sentry integration

### Phase 1: Core Messaging (Week 3-4)
- [ ] Twilio account with WhatsApp sender
- [ ] Twilio Studio flows (keywords, routing)
- [ ] Twilio webhook endpoint
- [ ] Claude AI integration for queries
- [ ] Basic conversation logging

### Phase 2: Payments (Week 5-6)
- [ ] Stripe account and products
- [ ] Payment Links for membership
- [ ] Stripe webhook handler
- [ ] Customer Portal enabled
- [ ] Supabase payment sync

### Phase 3: Lotto System (Week 7-8)
- [ ] Lotto schema and RLS
- [ ] WhatsApp Flow for entry
- [ ] Inngest draw automation
- [ ] Stripe subscription for lotto
- [ ] Results broadcasting

### Phase 4: Admin Dashboard (Week 9-10)
- [ ] Supabase Auth for admins
- [ ] Dashboard layout (shadcn/ui)
- [ ] Member management views
- [ ] Fixture management
- [ ] Financial overview

### Phase 5: Automation (Week 11-12)
- [ ] Inngest reminder sequences
- [ ] Result submission flow
- [ ] Weekly digest automation
- [ ] Email notifications (Resend)
- [ ] Rate limiting (Upstash)

### Phase 6: Polish & Launch (Week 13-14)
- [ ] E2E testing (Playwright)
- [ ] Load testing
- [ ] Documentation
- [ ] Pilot with 3 clubs
- [ ] Feedback iteration

---

## 🎯 SUCCESS METRICS

### Technical Metrics
- **Uptime**: 99.9%+ (8.7 hours downtime/year max)
- **Response Time**: <500ms for 95% of requests
- **Error Rate**: <0.1% of requests
- **WhatsApp Delivery**: >98% delivery rate

### Business Metrics
- **Volunteer Time Saved**: 70%+ reduction
- **Payment Collection**: 90%+ auto-collected
- **Member Engagement**: 2x message response rate
- **Lotto Participation**: 50%+ of members

### Role-Specific Targets

| Role | Key Metric | Target |
|------|-----------|--------|
| **Secretary** | Queries auto-answered | 80% |
| **Treasurer** | Payments auto-processed | 95% |
| **PRO** | Results auto-published | 100% |
| **Registrar** | Registrations via Flow | 90% |
| **Chairman** | Meeting scheduling auto | 100% |

---

*This document is the single source of truth for the ClubOS build. Update it as the project evolves.*

**Version:** 2.0 (Maximum Offload Edition)
**Last Updated:** March 2026
**Author:** QED Digitalisation + Claude Code
