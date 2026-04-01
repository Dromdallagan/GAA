import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardContent } from "./dashboard-content";
import type { LiveMatch } from "@/components/dashboard/live-scores-widget";
import type { AgentAlert } from "@/components/dashboard/agent-alerts";
import type { ContentItem } from "@/components/dashboard/content-queue-preview";

export const metadata: Metadata = {
  title: "Dashboard | ClubOS",
  description: "Club management dashboard overview",
};

function formatGaaScore(goals: number | null, points: number | null): string {
  return `${goals ?? 0}-${String(points ?? 0).padStart(2, "0")}`;
}

function formatFixtureTime(scheduledAt: string): string {
  const date = new Date(scheduledAt);
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "pm" : "am";
  const h = hours % 12 || 12;
  const m = minutes.toString().padStart(2, "0");
  return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]}, ${h}:${m}${ampm}`;
}

function timeAgo(isoDate: string | null): string {
  if (!isoDate) return "";
  const now = Date.now();
  const then = new Date(isoDate).getTime();
  const diffMs = now - then;
  if (diffMs < 0) return "just now";
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHours = Math.floor(diffMs / 3_600_000);
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  const diffDays = Math.floor(diffMs / 86_400_000);
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
  return new Date(isoDate).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

const AGENT_TYPE_NAMES: Record<string, string> = {
  registration_guardian: "Registration Guardian",
  revenue_sentinel: "Revenue Sentinel",
  fixture_intelligence: "Fixture Intelligence",
  content_engine: "Content Engine",
  member_retention: "Member Retention",
  smart_scheduler: "Smart Scheduler",
};

const VALID_CONTENT_TYPES = new Set(["match_report", "weekly_roundup", "social_post"]);

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: orgUser } = await supabase
    .from("org_users")
    .select("organization_id")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (!orgUser) {
    redirect("/login?error=no_org");
  }

  const orgId = orgUser.organization_id;

  // Run all queries in parallel
  const [membersResult, fixturesResult, agentRunsResult, contentQueueResult] =
    await Promise.all([
      supabase
        .from("members")
        .select("id, engagement_score")
        .eq("organization_id", orgId),
      supabase
        .from("fixtures")
        .select(
          `
          id,
          scheduled_at,
          status,
          home_score_goals,
          home_score_points,
          away_score_goals,
          away_score_points,
          competition:competitions(name, code),
          home_team:teams!fixtures_home_team_id_fkey(name),
          away_team:teams!fixtures_away_team_id_fkey(name),
          venue:venues(name)
        `
        )
        .eq("organization_id", orgId)
        .order("scheduled_at", { ascending: true }),
      supabase
        .from("agent_runs")
        .select("id, agent_type, findings, status, ran_at")
        .eq("organization_id", orgId)
        .order("ran_at", { ascending: false })
        .limit(10),
      supabase
        .from("content_queue")
        .select("id, type, content, status, created_at")
        .eq("organization_id", orgId)
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

  const members = membersResult.data ?? [];
  const fixtures = fixturesResult.data ?? [];
  const agentRuns = agentRunsResult.data ?? [];
  const contentQueue = contentQueueResult.data ?? [];

  // --- KPIs ---
  const totalMembers = members.length;
  const activeFixtures = fixtures.filter(
    (f) => f.status === "scheduled" || f.status === "live"
  ).length;
  const engagementScores = members
    .map((m) => m.engagement_score)
    .filter((s): s is number => s !== null);
  const avgEngagement =
    engagementScores.length > 0
      ? Math.round(
          engagementScores.reduce((a, b) => a + b, 0) /
            engagementScores.length
        )
      : 0;

  // --- Live Scores: live first, then upcoming, then recently completed ---
  const statusOrder: Record<string, number> = {
    live: 0,
    scheduled: 1,
    completed: 2,
  };
  const sortedForScores = [...fixtures].sort((a, b) => {
    const aOrder = statusOrder[a.status ?? "scheduled"] ?? 1;
    const bOrder = statusOrder[b.status ?? "scheduled"] ?? 1;
    if (aOrder !== bOrder) return aOrder - bOrder;
    return (
      new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
    );
  });

  const liveMatches: LiveMatch[] = sortedForScores.slice(0, 6).map((f) => {
    let status: LiveMatch["status"];
    let time = "";
    if (f.status === "live") {
      status = "live";
      time = "LIVE";
    } else if (f.status === "completed") {
      status = "ft";
    } else {
      status = "upcoming";
      time = formatFixtureTime(f.scheduled_at);
    }

    const homeTeam = f.home_team as { name: string } | null;
    const awayTeam = f.away_team as { name: string } | null;
    const competition = f.competition as { name: string; code: string } | null;

    return {
      id: f.id,
      homeTeam: homeTeam?.name ?? "TBC",
      awayTeam: awayTeam?.name ?? "TBC",
      homeScore: formatGaaScore(f.home_score_goals, f.home_score_points),
      awayScore: formatGaaScore(f.away_score_goals, f.away_score_points),
      status,
      time,
      competition: competition?.name ?? "",
    };
  });

  // --- Upcoming Fixtures (scheduled only) ---
  const upcomingFixtures = fixtures
    .filter((f) => f.status === "scheduled")
    .slice(0, 5)
    .map((f) => {
      const homeTeam = f.home_team as { name: string } | null;
      const awayTeam = f.away_team as { name: string } | null;
      const venue = f.venue as { name: string } | null;
      const competition = f.competition as { code: string } | null;

      return {
        id: f.id,
        homeTeam: homeTeam?.name ?? "TBC",
        awayTeam: awayTeam?.name ?? "TBC",
        date: formatFixtureTime(f.scheduled_at),
        venue: venue?.name ?? "",
        competition: competition?.code ?? "",
      };
    });

  // --- Agent Alerts from agent_runs ---
  const agentAlerts: AgentAlert[] = agentRuns
    .filter((r) => r.findings !== null)
    .map((r) => {
      const findings = r.findings as Record<string, unknown> | null;
      return {
        id: r.id,
        agent: AGENT_TYPE_NAMES[r.agent_type] ?? r.agent_type,
        message:
          (findings?.message as string) ??
          (findings?.summary as string) ??
          "Agent run completed",
        severity: (
          ["info", "warning", "critical"].includes(
            findings?.severity as string
          )
            ? (findings?.severity as string)
            : "info"
        ) as AgentAlert["severity"],
        timestamp: timeAgo(r.ran_at),
      };
    });

  // --- Content Queue ---
  const contentItems: ContentItem[] = contentQueue.map((c) => ({
    id: c.id,
    type: (VALID_CONTENT_TYPES.has(c.type)
      ? c.type
      : "match_report") as ContentItem["type"],
    title:
      c.content.length > 80 ? c.content.slice(0, 80) + "\u2026" : c.content,
    status: (
      ["pending", "approved", "rejected"].includes(c.status ?? "")
        ? c.status
        : "pending"
    ) as ContentItem["status"],
    generatedAt: timeAgo(c.created_at),
  }));

  return (
    <DashboardContent
      totalMembers={totalMembers}
      monthlyRevenue={0}
      activeFixtures={activeFixtures}
      engagement={avgEngagement}
      liveMatches={liveMatches}
      agentAlerts={agentAlerts}
      contentItems={contentItems}
      upcomingFixtures={upcomingFixtures}
    />
  );
}
