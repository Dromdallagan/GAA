"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Users,
  Plus,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

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

const STATUS_FILTERS: { label: string; value: StatusFilter }[] = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Pending", value: "pending" },
  { label: "Expired", value: "expired" },
];

function getFullName(firstName: string | null, lastName: string | null): string {
  const parts = [firstName?.trim(), lastName?.trim()].filter(Boolean);
  return parts.length > 0 ? parts.join(" ") : "Unknown Member";
}

function getInitials(firstName: string | null, lastName: string | null): string {
  const f = firstName?.trim().charAt(0).toUpperCase() ?? "";
  const l = lastName?.trim().charAt(0).toUpperCase() ?? "";
  return f + l || "?";
}

function getStatusColor(status: string | null): string {
  switch (status) {
    case "active": return "bg-emerald-500/15 text-emerald-400 border-emerald-500/20";
    case "pending": return "bg-amber-500/15 text-amber-400 border-amber-500/20";
    case "expired": return "bg-red-500/15 text-red-400 border-red-500/20";
    default: return "bg-muted text-muted-foreground border-border";
  }
}

function getEngagementColor(score: number): string {
  if (score >= 70) return "bg-emerald-500";
  if (score >= 40) return "bg-amber-500";
  return "bg-red-500";
}

const col = createColumnHelper<Member>();

const columns = [
  col.display({
    id: "name",
    header: "Member",
    cell: ({ row }) => {
      const m = row.original;
      return (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
            {getInitials(m.first_name, m.last_name)}
          </div>
          <div>
            <span className="text-sm font-medium">{getFullName(m.first_name, m.last_name)}</span>
            {m.email && <p className="text-xs text-muted-foreground truncate max-w-[200px]">{m.email}</p>}
          </div>
        </div>
      );
    },
  }),
  col.accessor("membership_type", {
    header: "Type",
    cell: (info) => (
      <Badge variant="secondary" className="text-[11px] capitalize">
        {info.getValue() ?? "Unknown"}
      </Badge>
    ),
  }),
  col.accessor("membership_status", {
    header: "Status",
    cell: (info) => (
      <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize", getStatusColor(info.getValue()))}>
        {info.getValue() ?? "unknown"}
      </span>
    ),
  }),
  col.accessor("membership_expires_at", {
    header: "Expires",
    cell: (info) => {
      const val = info.getValue();
      if (!val) return <span className="text-xs text-muted-foreground">—</span>;
      return (
        <span className="text-xs text-muted-foreground">
          {new Date(val).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
        </span>
      );
    },
  }),
  col.accessor("engagement_score", {
    header: "Engagement",
    cell: (info) => {
      const score = info.getValue() ?? 0;
      return (
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
            <div
              className={cn("h-full rounded-full transition-all", getEngagementColor(score))}
              style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
            />
          </div>
          <span className="text-xs tabular-nums text-muted-foreground">{score}</span>
        </div>
      );
    },
  }),
];

export function MembersList({ members }: MembersListProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sorting, setSorting] = useState<SortingState>([]);

  const filtered = useMemo(() => {
    return members.filter((m) => {
      if (statusFilter !== "all" && m.membership_status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        const name = getFullName(m.first_name, m.last_name).toLowerCase();
        if (!name.includes(q)) return false;
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

  const table = useReactTable({
    data: filtered,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 20 } },
  });

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Members</h1>
          <p className="text-sm text-muted-foreground">
            {members.length} total member{members.length !== 1 ? "s" : ""} across your organisation.
          </p>
        </div>
        <Button render={<Link href="/admin/members/new" />}>
          <Plus className="mr-2 h-4 w-4" />
          Register Member
        </Button>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by name..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8" />
        </div>
        <div className="flex gap-1 rounded-lg bg-muted/50 p-0.5">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setStatusFilter(f.value)}
              className={cn(
                "rounded-md px-3 py-1 text-xs font-medium transition-colors",
                statusFilter === f.value ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {f.label}
              <span className="ml-1 tabular-nums text-[10px] opacity-60">{counts[f.value]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Users className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium">No members found</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {search || statusFilter !== "all" ? "Try adjusting your search or filter." : "Members will appear here once added."}
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border border-border/50 bg-card">
            <table className="w-full">
              <thead>
                {table.getHeaderGroups().map((hg) => (
                  <tr key={hg.id} className="border-b border-border/50">
                    {hg.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground"
                      >
                        {header.isPlaceholder ? null : (
                          <button
                            type="button"
                            className="flex items-center gap-1 hover:text-foreground transition-colors"
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {header.column.getCanSort() && <ArrowUpDown className="h-3 w-3" />}
                          </button>
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-border/30">
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="transition-colors hover:bg-muted/30">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {table.getPageCount() > 1 && (
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()} ({filtered.length} members)
              </span>
              <div className="flex gap-1">
                <Button size="sm" variant="outline" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
