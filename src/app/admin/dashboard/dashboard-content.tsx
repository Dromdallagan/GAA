"use client";

import { type ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  StaggerChildren,
  StaggerItem,
} from "@/components/motion/stagger-children";
import { KpiCard } from "@/components/dashboard/kpi-card";
import {
  LiveScoresWidget,
  type LiveMatch,
} from "@/components/dashboard/live-scores-widget";
import {
  AgentAlerts,
  type AgentAlert,
} from "@/components/dashboard/agent-alerts";
import {
  ContentQueuePreview,
  type ContentItem,
} from "@/components/dashboard/content-queue-preview";
import {
  Users,
  PoundSterling,
  CalendarDays,
  Activity,
  MapPin,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Mock data — will be replaced with Supabase queries
// ---------------------------------------------------------------------------

const SPARKLINE_MEMBERS = [1720, 1735, 1750, 1768, 1790, 1810, 1825, 1847];
const SPARKLINE_REVENUE = [18200, 19400, 20100, 21300, 22000, 22800, 23100, 23450];
const SPARKLINE_FIXTURES = [18, 16, 14, 15, 13, 12, 12, 12];
const SPARKLINE_ENGAGEMENT = [72, 71, 73, 74, 75, 76, 77, 78];

const LIVE_MATCHES: LiveMatch[] = [
  {
    id: "1",
    homeTeam: "Glen",
    awayTeam: "Slaughtneil",
    homeScore: "1-09",
    awayScore: "0-12",
    status: "live",
    time: "47'",
    competition: "Senior Football Championship",
  },
  {
    id: "2",
    homeTeam: "Ballinascreen",
    awayTeam: "Bellaghy",
    homeScore: "2-04",
    awayScore: "1-08",
    status: "ht",
    time: "",
    competition: "Senior Football League",
  },
  {
    id: "3",
    homeTeam: "Magherafelt",
    awayTeam: "Lavey",
    homeScore: "0-00",
    awayScore: "0-00",
    status: "upcoming",
    time: "Sun 3:00pm",
    competition: "Senior Football Championship",
  },
];

const AGENT_ALERTS_DATA: AgentAlert[] = [
  {
    id: "1",
    agent: "Fixture Intelligence",
    message:
      "Venue clash detected: Celtic Park double-booked for 15th April. Two Senior Championship matches scheduled.",
    severity: "critical",
    timestamp: "35 min ago",
  },
  {
    id: "2",
    agent: "Registration Guardian",
    message:
      "3 unregistered players detected in Dungiven U-16 squad for upcoming championship match.",
    severity: "warning",
    timestamp: "2 hours ago",
  },
  {
    id: "3",
    agent: "Revenue Sentinel",
    message:
      "Weekly revenue up 15% — £4,230 collected across 12 clubs. Membership renewals driving growth.",
    severity: "info",
    timestamp: "5 hours ago",
  },
  {
    id: "4",
    agent: "Content Engine",
    message:
      "Match report generated for Glen vs Dungiven. Awaiting PRO approval in content queue.",
    severity: "info",
    timestamp: "1 day ago",
  },
];

const CONTENT_ITEMS: ContentItem[] = [
  {
    id: "1",
    type: "match_report",
    title: "Glen 2-14 Dungiven 0-09 — Championship Rd 3",
    status: "pending",
    generatedAt: "2 hours ago",
  },
  {
    id: "2",
    type: "weekly_roundup",
    title: "Derry GAA Weekly Championship Roundup",
    status: "pending",
    generatedAt: "5 hours ago",
  },
  {
    id: "3",
    type: "social_post",
    title: "U-16 Championship Preview: Key Matchups",
    status: "approved",
    generatedAt: "1 day ago",
  },
];

interface UpcomingFixture {
  id: string;
  homeTeam: string;
  awayTeam: string;
  date: string;
  venue: string;
  competition: string;
}

const UPCOMING_FIXTURES: UpcomingFixture[] = [
  {
    id: "1",
    homeTeam: "Magherafelt",
    awayTeam: "Lavey",
    date: "Sun 6 Apr, 3:00pm",
    venue: "Páirc Chríost Rí",
    competition: "SFC",
  },
  {
    id: "2",
    homeTeam: "Dungiven",
    awayTeam: "Banagher",
    date: "Sat 12 Apr, 2:00pm",
    venue: "O'Cahan Park",
    competition: "SFC",
  },
  {
    id: "3",
    homeTeam: "Swatragh",
    awayTeam: "Claudy",
    date: "Sun 13 Apr, 3:30pm",
    venue: "Davitt Park",
    competition: "SFL",
  },
];

// ---------------------------------------------------------------------------
// Formatters
// ---------------------------------------------------------------------------

function formatCurrency(n: number): string {
  return `£${Math.round(n).toLocaleString()}`;
}

function formatPercent(n: number): string {
  return `${Math.round(n)}%`;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function DashboardCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-border/50 bg-card p-5",
        "transition-all duration-200 hover:border-border/80",
        className
      )}
    >
      {children}
    </div>
  );
}

function UpcomingFixturesWidget({
  fixtures,
}: {
  fixtures: UpcomingFixture[];
}) {
  return (
    <div className="flex h-full flex-col">
      <h3 className="mb-3 text-sm font-semibold">Upcoming</h3>
      <div className="flex flex-1 flex-col gap-2">
        {fixtures.map((fixture) => (
          <div
            key={fixture.id}
            className="rounded-lg border border-border/30 bg-background/50 p-2.5"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium">{fixture.homeTeam}</span>
              <span className="text-[10px] font-medium text-muted-foreground">
                vs
              </span>
              <span className="font-medium">{fixture.awayTeam}</span>
            </div>
            <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <CalendarDays className="h-3 w-3" />
              <span>{fixture.date}</span>
            </div>
            <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span>{fixture.venue}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main dashboard
// ---------------------------------------------------------------------------

export function DashboardContent() {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Your county at a glance.
        </p>
      </div>

      {/* KPI Row */}
      <StaggerChildren className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StaggerItem>
          <KpiCard
            title="Total Members"
            value={1847}
            trend={5.2}
            sparklineData={SPARKLINE_MEMBERS}
            icon={<Users className="h-4 w-4" />}
          />
        </StaggerItem>
        <StaggerItem>
          <KpiCard
            title="Monthly Revenue"
            value={23450}
            format={formatCurrency}
            trend={12.8}
            sparklineData={SPARKLINE_REVENUE}
            icon={<PoundSterling className="h-4 w-4" />}
          />
        </StaggerItem>
        <StaggerItem>
          <KpiCard
            title="Active Fixtures"
            value={12}
            trend={-14.3}
            sparklineData={SPARKLINE_FIXTURES}
            icon={<CalendarDays className="h-4 w-4" />}
          />
        </StaggerItem>
        <StaggerItem>
          <KpiCard
            title="Engagement"
            value={78}
            format={formatPercent}
            trend={3.1}
            sparklineData={SPARKLINE_ENGAGEMENT}
            icon={<Activity className="h-4 w-4" />}
          />
        </StaggerItem>
      </StaggerChildren>

      {/* Bento Grid */}
      <StaggerChildren
        className="grid auto-rows-[minmax(200px,auto)] grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
        delay={0.25}
      >
        {/* Live Scores — largest card */}
        <StaggerItem className="sm:col-span-2 lg:row-span-2">
          <DashboardCard className="h-full">
            <LiveScoresWidget matches={LIVE_MATCHES} />
          </DashboardCard>
        </StaggerItem>

        {/* Agent Activity */}
        <StaggerItem className="sm:col-span-2">
          <DashboardCard className="h-full">
            <AgentAlerts alerts={AGENT_ALERTS_DATA} />
          </DashboardCard>
        </StaggerItem>

        {/* Content Queue */}
        <StaggerItem>
          <DashboardCard className="h-full">
            <ContentQueuePreview items={CONTENT_ITEMS} />
          </DashboardCard>
        </StaggerItem>

        {/* Upcoming Fixtures */}
        <StaggerItem>
          <DashboardCard className="h-full">
            <UpcomingFixturesWidget fixtures={UPCOMING_FIXTURES} />
          </DashboardCard>
        </StaggerItem>
      </StaggerChildren>
    </div>
  );
}
