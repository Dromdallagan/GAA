"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Users } from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Member {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  membership_type: string | null;
  membership_status: string | null;
  membership_expires_at: string | null;
  engagement_score: number | null;
  created_at: string | null;
}

type StatusFilter = "all" | "active" | "pending" | "expired";

interface MembersListProps {
  members: Member[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const STATUS_FILTERS: { label: string; value: StatusFilter }[] = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Pending", value: "pending" },
  { label: "Expired", value: "expired" },
];

function getInitials(firstName: string | null, lastName: string | null): string {
  const f = firstName?.trim().charAt(0).toUpperCase() ?? "";
  const l = lastName?.trim().charAt(0).toUpperCase() ?? "";
  return f + l || "?";
}

function getFullName(firstName: string | null, lastName: string | null): string {
  const parts = [firstName?.trim(), lastName?.trim()].filter(Boolean);
  return parts.length > 0 ? parts.join(" ") : "Unknown Member";
}

function truncateEmail(email: string | null, maxLength: number = 24): string {
  if (!email) return "--";
  return email.length > maxLength ? email.slice(0, maxLength) + "..." : email;
}

function getStatusColor(status: string | null): string {
  switch (status) {
    case "active":
      return "bg-emerald-500/15 text-emerald-400 border-emerald-500/20";
    case "pending":
      return "bg-amber-500/15 text-amber-400 border-amber-500/20";
    case "expired":
      return "bg-red-500/15 text-red-400 border-red-500/20";
    case "suspended":
      return "bg-muted text-muted-foreground border-border";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

function getTypeLabel(type: string | null): string {
  if (!type) return "Unknown";
  return type.charAt(0).toUpperCase() + type.slice(1);
}

function getEngagementColor(score: number): string {
  if (score >= 70) return "bg-emerald-500";
  if (score >= 40) return "bg-amber-500";
  return "bg-red-500";
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function MemberAvatar({ initials }: { initials: string }) {
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
      {initials}
    </div>
  );
}

function EngagementBar({ score }: { score: number | null }) {
  const value = score ?? 0;
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all", getEngagementColor(value))}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
      <span className="text-xs tabular-nums text-muted-foreground">{value}</span>
    </div>
  );
}

function EmptyState({ hasSearch }: { hasSearch: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <Users className="h-6 w-6 text-muted-foreground" />
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">No members found</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {hasSearch
            ? "Try adjusting your search or filter."
            : "Members will appear here once added."}
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function MembersList({ members }: MembersListProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim();

    return members.filter((m) => {
      // Status filter
      if (statusFilter !== "all" && m.membership_status !== statusFilter) {
        return false;
      }

      // Search filter (name match)
      if (query) {
        const fullName = getFullName(m.first_name, m.last_name).toLowerCase();
        return fullName.includes(query);
      }

      return true;
    });
  }, [members, search, statusFilter]);

  const counts = useMemo(() => {
    const result = { all: members.length, active: 0, pending: 0, expired: 0 };
    for (const m of members) {
      if (m.membership_status === "active") result.active++;
      else if (m.membership_status === "pending") result.pending++;
      else if (m.membership_status === "expired") result.expired++;
    }
    return result;
  }, [members]);

  return (
    <div className="space-y-3">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Members</h1>
        <p className="text-sm text-muted-foreground">
          {members.length} total member{members.length !== 1 ? "s" : ""} across
          your organisation.
        </p>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>

        <div className="flex gap-1 rounded-lg bg-muted/50 p-0.5">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setStatusFilter(f.value)}
              className={cn(
                "rounded-md px-3 py-1 text-xs font-medium transition-colors",
                statusFilter === f.value
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {f.label}
              <span className="ml-1 tabular-nums text-[10px] opacity-60">
                {counts[f.value]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState hasSearch={search.trim().length > 0 || statusFilter !== "all"} />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border/50 bg-card">
          {/* Table header */}
          <div className="hidden border-b border-border/50 px-4 py-2.5 text-xs font-medium text-muted-foreground md:grid md:grid-cols-[1fr_120px_100px_160px_100px]">
            <span>Member</span>
            <span>Type</span>
            <span>Status</span>
            <span>Email</span>
            <span>Engagement</span>
          </div>

          {/* Rows */}
          <div className="divide-y divide-border/30">
            {filtered.map((member) => (
              <div
                key={member.id}
                className="group flex flex-col gap-2 px-4 py-3 transition-colors hover:bg-muted/30 md:grid md:grid-cols-[1fr_120px_100px_160px_100px] md:items-center md:gap-0"
              >
                {/* Name + Avatar */}
                <div className="flex items-center gap-3">
                  <MemberAvatar initials={getInitials(member.first_name, member.last_name)} />
                  <span className="text-sm font-medium text-foreground">
                    {getFullName(member.first_name, member.last_name)}
                  </span>
                </div>

                {/* Type badge */}
                <div>
                  <Badge variant="secondary" className="text-[11px]">
                    {getTypeLabel(member.membership_type)}
                  </Badge>
                </div>

                {/* Status badge */}
                <div>
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize",
                      getStatusColor(member.membership_status)
                    )}
                  >
                    {member.membership_status ?? "unknown"}
                  </span>
                </div>

                {/* Email */}
                <span className="text-xs text-muted-foreground" title={member.email ?? undefined}>
                  {truncateEmail(member.email)}
                </span>

                {/* Engagement */}
                <EngagementBar score={member.engagement_score} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
