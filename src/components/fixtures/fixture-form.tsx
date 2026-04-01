"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import {
  createFixture,
  updateFixture,
  type FixtureActionState,
} from "@/app/admin/fixtures/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Loader2 } from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Option {
  id: string;
  name: string;
}

interface FixtureDefaults {
  id: string;
  competition_id: string;
  home_team_id: string;
  away_team_id: string;
  venue_id: string;
  scheduled_at: string;
}

interface FixtureFormProps {
  mode: "create" | "edit";
  defaults?: FixtureDefaults;
  teams: Option[];
  competitions: Option[];
  venues: Option[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toDatetimeLocal(iso: string): string {
  const date = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function FieldError({ errors, field }: { errors?: Record<string, string[]>; field: string }) {
  const messages = errors?.[field];
  if (!messages?.length) return null;
  return <p className="text-xs text-destructive">{messages[0]}</p>;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function FixtureForm({
  mode,
  defaults,
  teams,
  competitions,
  venues,
}: FixtureFormProps) {
  const action = mode === "create" ? createFixture : updateFixture;
  const initialState: FixtureActionState = {};
  const [state, formAction, pending] = useActionState(action, initialState);

  const [competitionId, setCompetitionId] = useState(
    defaults?.competition_id ?? ""
  );
  const [homeTeamId, setHomeTeamId] = useState(defaults?.home_team_id ?? "");
  const [awayTeamId, setAwayTeamId] = useState(defaults?.away_team_id ?? "");
  const [venueId, setVenueId] = useState(defaults?.venue_id ?? "");

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" render={<Link href="/admin/fixtures" />}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {mode === "create" ? "New Fixture" : "Edit Fixture"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {mode === "create"
              ? "Schedule a new match."
              : "Update fixture details."}
          </p>
        </div>
      </div>

      {/* Error banner */}
      {state.message ? (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {state.message}
        </div>
      ) : null}

      {/* Form */}
      <form
        action={formAction}
        className="space-y-5 rounded-xl border border-border/50 bg-card p-6"
      >
        {/* Hidden inputs for select values + fixture ID */}
        <input type="hidden" name="competition_id" value={competitionId} />
        <input type="hidden" name="home_team_id" value={homeTeamId} />
        <input type="hidden" name="away_team_id" value={awayTeamId} />
        <input type="hidden" name="venue_id" value={venueId} />
        {defaults?.id ? (
          <input type="hidden" name="fixture_id" value={defaults.id} />
        ) : null}

        {/* Competition */}
        <div className="space-y-2">
          <Label htmlFor="competition">Competition</Label>
          <Select
            value={competitionId}
            onValueChange={(val) => setCompetitionId(val as string)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select competition…" />
            </SelectTrigger>
            <SelectContent>
              {competitions.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError errors={state.errors} field="competition_id" />
        </div>

        {/* Home Team / Away Team side-by-side */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="home_team">Home Team</Label>
            <Select
              value={homeTeamId}
              onValueChange={(val) => setHomeTeamId(val as string)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select home team…" />
              </SelectTrigger>
              <SelectContent>
                {teams.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError errors={state.errors} field="home_team_id" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="away_team">Away Team</Label>
            <Select
              value={awayTeamId}
              onValueChange={(val) => setAwayTeamId(val as string)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select away team…" />
              </SelectTrigger>
              <SelectContent>
                {teams.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError errors={state.errors} field="away_team_id" />
          </div>
        </div>

        {/* Venue */}
        <div className="space-y-2">
          <Label htmlFor="venue">Venue</Label>
          <Select
            value={venueId}
            onValueChange={(val) => setVenueId(val as string)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select venue (optional)…" />
            </SelectTrigger>
            <SelectContent>
              {venues.map((v) => (
                <SelectItem key={v.id} value={v.id}>
                  {v.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError errors={state.errors} field="venue_id" />
        </div>

        {/* Date & Time */}
        <div className="space-y-2">
          <Label htmlFor="scheduled_at">Date &amp; Time</Label>
          <Input
            id="scheduled_at"
            name="scheduled_at"
            type="datetime-local"
            defaultValue={
              defaults?.scheduled_at
                ? toDatetimeLocal(defaults.scheduled_at)
                : undefined
            }
            className="w-full"
          />
          <FieldError errors={state.errors} field="scheduled_at" />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="outline" render={<Link href="/admin/fixtures" />}>
            Cancel
          </Button>
          <Button type="submit" disabled={pending}>
            {pending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : null}
            {mode === "create" ? "Create Fixture" : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
