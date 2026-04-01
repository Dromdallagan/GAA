"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { cancelFixture } from "@/app/admin/fixtures/actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  Pencil,
  Trophy,
  X,
  Loader2,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FixtureDetailProps {
  fixture: {
    id: string;
    scheduled_at: string;
    status: string;
    home_team: string;
    away_team: string;
    home_score_goals: number | null;
    home_score_points: number | null;
    away_score_goals: number | null;
    away_score_points: number | null;
    competition: string;
    competition_code: string;
    venue: string;
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatGaaScore(goals: number | null, points: number | null): string {
  const g = goals ?? 0;
  const p = points ?? 0;
  return `${g}-${String(p).padStart(2, "0")}`;
}

function gaaTotal(goals: number | null, points: number | null): number {
  return (goals ?? 0) * 3 + (points ?? 0);
}

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  scheduled: {
    label: "Scheduled",
    className: "bg-blue-500/15 text-blue-400 border-blue-500/25",
  },
  live: {
    label: "Live",
    className: "bg-red-500/15 text-red-400 border-red-500/25 animate-pulse",
  },
  completed: {
    label: "Completed",
    className: "bg-muted-foreground/15 text-muted-foreground border-muted-foreground/25",
  },
  postponed: {
    label: "Postponed",
    className: "bg-amber-500/15 text-amber-400 border-amber-500/25",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-red-500/15 text-red-400 border-red-500/25",
  },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function FixtureDetail({ fixture }: FixtureDetailProps) {
  const router = useRouter();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const status = STATUS_STYLES[fixture.status] ?? STATUS_STYLES.scheduled;
  const isScored = fixture.status === "completed" || fixture.status === "live";
  const canEdit = fixture.status === "scheduled" || fixture.status === "postponed";
  const canCancel = fixture.status === "scheduled" || fixture.status === "postponed";

  function handleCancel() {
    startTransition(async () => {
      await cancelFixture(fixture.id);
      router.push("/admin/fixtures");
    });
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" render={<Link href="/admin/fixtures" />}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Fixture Detail</h1>
        </div>
        <div className="flex items-center gap-2">
          {canEdit ? (
            <Button
              variant="outline"
              size="sm"
              render={<Link href={`/admin/fixtures/${fixture.id}?edit=true`} />}
            >
              <Pencil className="h-3.5 w-3.5" data-icon="inline-start" />
              Edit
            </Button>
          ) : null}
          {canCancel ? (
            <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
              <AlertDialogTrigger
                render={
                  <Button variant="destructive" size="sm">
                    <X className="h-3.5 w-3.5" data-icon="inline-start" />
                    Cancel Fixture
                  </Button>
                }
              />
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel this fixture?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will mark {fixture.home_team} vs {fixture.away_team} as
                    cancelled. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep Fixture</AlertDialogCancel>
                  <AlertDialogAction
                    variant="destructive"
                    onClick={handleCancel}
                    disabled={isPending}
                  >
                    {isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : null}
                    Cancel Fixture
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : null}
        </div>
      </div>

      {/* Match Card */}
      <div className="rounded-xl border border-border/50 bg-card p-6">
        {/* Competition + Status */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Trophy className="h-4 w-4" />
            <span>{fixture.competition}</span>
          </div>
          <Badge
            variant="outline"
            className={cn("text-xs", status.className)}
          >
            {status.label}
          </Badge>
        </div>

        {/* Score / Teams */}
        <div className="flex items-center justify-center gap-6 py-4">
          <div className="flex-1 text-right">
            <p className="text-lg font-bold">{fixture.home_team}</p>
            {isScored ? (
              <div className="mt-1 space-y-0.5">
                <p className="font-mono text-2xl font-bold tabular-nums">
                  {formatGaaScore(
                    fixture.home_score_goals,
                    fixture.home_score_points
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  ({gaaTotal(fixture.home_score_goals, fixture.home_score_points)}{" "}
                  pts)
                </p>
              </div>
            ) : null}
          </div>

          <div className="flex flex-col items-center">
            <span className="text-sm font-medium text-muted-foreground">
              {isScored ? "FT" : "vs"}
            </span>
          </div>

          <div className="flex-1 text-left">
            <p className="text-lg font-bold">{fixture.away_team}</p>
            {isScored ? (
              <div className="mt-1 space-y-0.5">
                <p className="font-mono text-2xl font-bold tabular-nums">
                  {formatGaaScore(
                    fixture.away_score_goals,
                    fixture.away_score_points
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  ({gaaTotal(fixture.away_score_goals, fixture.away_score_points)}{" "}
                  pts)
                </p>
              </div>
            ) : null}
          </div>
        </div>

        {/* Details */}
        <div className="mt-6 flex flex-col gap-2 border-t border-border/50 pt-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4 shrink-0" />
            <span>{formatDateTime(fixture.scheduled_at)}</span>
          </div>
          {fixture.venue ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 shrink-0" />
              <span>{fixture.venue}</span>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
