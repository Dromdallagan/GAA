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
// Types
// ---------------------------------------------------------------------------

interface UpcomingFixture {
  id: string;
  homeTeam: string;
  awayTeam: string;
  date: string;
  venue: string;
  competition: string;
}

interface DashboardContentProps {
  totalMembers: number;
  monthlyRevenue: number;
  activeFixtures: number;
  engagement: number;
  liveMatches: LiveMatch[];
  agentAlerts: AgentAlert[];
  contentItems: ContentItem[];
  upcomingFixtures: UpcomingFixture[];
}

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
      {fixtures.length > 0 ? (
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
      ) : (
        <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
          No upcoming fixtures
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main dashboard
// ---------------------------------------------------------------------------

export function DashboardContent({
  totalMembers,
  monthlyRevenue,
  activeFixtures,
  engagement,
  liveMatches,
  agentAlerts,
  contentItems,
  upcomingFixtures,
}: DashboardContentProps) {
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
            value={totalMembers}
            icon={<Users className="h-4 w-4" />}
          />
        </StaggerItem>
        <StaggerItem>
          <KpiCard
            title="Monthly Revenue"
            value={monthlyRevenue}
            format={formatCurrency}
            icon={<PoundSterling className="h-4 w-4" />}
          />
        </StaggerItem>
        <StaggerItem>
          <KpiCard
            title="Active Fixtures"
            value={activeFixtures}
            icon={<CalendarDays className="h-4 w-4" />}
          />
        </StaggerItem>
        <StaggerItem>
          <KpiCard
            title="Engagement"
            value={engagement}
            format={formatPercent}
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
            <LiveScoresWidget matches={liveMatches} />
          </DashboardCard>
        </StaggerItem>

        {/* Agent Activity */}
        <StaggerItem className="sm:col-span-2">
          <DashboardCard className="h-full">
            <AgentAlerts alerts={agentAlerts} />
          </DashboardCard>
        </StaggerItem>

        {/* Content Queue */}
        <StaggerItem>
          <DashboardCard className="h-full">
            <ContentQueuePreview items={contentItems} />
          </DashboardCard>
        </StaggerItem>

        {/* Upcoming Fixtures */}
        <StaggerItem>
          <DashboardCard className="h-full">
            <UpcomingFixturesWidget fixtures={upcomingFixtures} />
          </DashboardCard>
        </StaggerItem>
      </StaggerChildren>
    </div>
  );
}
