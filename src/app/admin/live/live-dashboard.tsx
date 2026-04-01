"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Play, Plus, Radio, Clock } from "lucide-react";
import { startMatch, addMatchEvent } from "./actions";
import type { LiveActionState } from "./actions";

interface Fixture {
  id: string;
  scheduled_at: string;
  status: string | null;
  home_score_goals: number | null;
  home_score_points: number | null;
  away_score_goals: number | null;
  away_score_points: number | null;
  teams: { name: string } | null;
  away: { name: string } | null;
  venues: { name: string } | null;
}

interface LiveDashboardProps {
  fixtures: Fixture[];
}

const EVENT_TYPES = [
  { value: "goal", label: "Goal (3pts)" },
  { value: "point", label: "Point (1pt)" },
  { value: "wide", label: "Wide" },
  { value: "card", label: "Card" },
  { value: "substitution", label: "Substitution" },
  { value: "half_time", label: "Half Time" },
  { value: "full_time", label: "Full Time" },
];

function formatScore(goals: number | null, points: number | null): string {
  const g = goals ?? 0;
  const p = points ?? 0;
  return `${g}-${String(p).padStart(2, "0")}`;
}

function totalScore(goals: number | null, points: number | null): number {
  return (goals ?? 0) * 3 + (points ?? 0);
}

export function LiveDashboard({ fixtures }: LiveDashboardProps) {
  const [selectedFixture, setSelectedFixture] = useState<string | null>(
    fixtures.find((f) => f.status === "live")?.id ?? null
  );
  const [eventType, setEventType] = useState("");
  const [team, setTeam] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const liveFixtures = fixtures.filter((f) => f.status === "live");
  const scheduledFixtures = fixtures.filter((f) => f.status === "scheduled");
  const selected = fixtures.find((f) => f.id === selectedFixture);

  function handleStart(fixtureId: string) {
    setError(null);
    startTransition(async () => {
      const result = await startMatch(fixtureId);
      if (result.error) setError(result.error);
      else setSelectedFixture(fixtureId);
    });
  }

  function handleAddEvent(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result: LiveActionState = await addMatchEvent({}, formData);
      if (result.error) setError(result.error);
      else {
        setEventType("");
        setTeam("");
      }
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Live Scoring</h1>
        <p className="text-sm text-muted-foreground">
          Manage live match scores and events.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Live matches */}
      {liveFixtures.length > 0 && (
        <div className="space-y-3">
          <h2 className="flex items-center gap-2 text-sm font-medium">
            <Radio className="h-4 w-4 text-red-400 animate-pulse" /> Live Now
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {liveFixtures.map((f) => (
              <Card
                key={f.id}
                className={selectedFixture === f.id ? "ring-2 ring-primary" : "cursor-pointer hover:bg-muted/30"}
                onClick={() => setSelectedFixture(f.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{f.teams?.name ?? "Home"}</p>
                      <p className="text-sm font-medium">{f.away?.name ?? "Away"}</p>
                    </div>
                    <div className="space-y-1 text-right">
                      <p className="text-lg font-bold tabular-nums">
                        {formatScore(f.home_score_goals, f.home_score_points)}
                        <span className="ml-1 text-xs text-muted-foreground">({totalScore(f.home_score_goals, f.home_score_points)})</span>
                      </p>
                      <p className="text-lg font-bold tabular-nums">
                        {formatScore(f.away_score_goals, f.away_score_points)}
                        <span className="ml-1 text-xs text-muted-foreground">({totalScore(f.away_score_goals, f.away_score_points)})</span>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Score input panel for selected live match */}
      {selected && selected.status === "live" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Add Event — {selected.teams?.name} vs {selected.away?.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form action={handleAddEvent} className="space-y-4">
              <input type="hidden" name="fixture_id" value={selected.id} />
              <input type="hidden" name="event_type" value={eventType} />
              <input type="hidden" name="team" value={team} />

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label>Event</Label>
                  <Select value={eventType} onValueChange={(v) => setEventType(v as string)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select event…" />
                    </SelectTrigger>
                    <SelectContent>
                      {EVENT_TYPES.map((e) => (
                        <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label>Team</Label>
                  <Select value={team} onValueChange={(v) => setTeam(v as string)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select team…" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="home">{selected.teams?.name ?? "Home"}</SelectItem>
                      <SelectItem value="away">{selected.away?.name ?? "Away"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="minute">Minute</Label>
                  <Input id="minute" name="minute" type="number" min={0} max={100} placeholder="Min" />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="player_name">Player</Label>
                  <Input id="player_name" name="player_name" placeholder="Optional" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="description">Note</Label>
                  <Input id="description" name="description" placeholder="Optional" />
                </div>
              </div>

              <Button type="submit" disabled={isPending || !eventType || !team}>
                <Plus className="mr-2 h-4 w-4" />
                Add Event
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Scheduled today — can start */}
      {scheduledFixtures.length > 0 && (
        <div className="space-y-3">
          <h2 className="flex items-center gap-2 text-sm font-medium">
            <Clock className="h-4 w-4 text-muted-foreground" /> Today&apos;s Fixtures
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {scheduledFixtures.map((f) => (
              <Card key={f.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-sm font-medium">
                      {f.teams?.name ?? "Home"} vs {f.away?.name ?? "Away"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(f.scheduled_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                      {f.venues?.name ? ` — ${f.venues.name}` : ""}
                    </p>
                  </div>
                  <Button size="sm" onClick={() => handleStart(f.id)} disabled={isPending}>
                    <Play className="mr-1.5 h-3.5 w-3.5" />
                    Start
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {liveFixtures.length === 0 && scheduledFixtures.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Radio className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium">No matches today</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Live scoring will be available on match days.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
