import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarIcon, MapPinIcon } from "lucide-react";

export const metadata: Metadata = { title: "Fixtures | ClubOS" };
export const dynamic = "force-dynamic";

export default async function PublicFixturesPage() {
  const supabase = createAdminClient();

  const { data: fixtures } = await supabase
    .from("fixtures")
    .select(`
      id, scheduled_at,
      teams!fixtures_home_team_id_fkey ( name ),
      away:teams!fixtures_away_team_id_fkey ( name ),
      competitions ( name ),
      venues ( name, address )
    `)
    .eq("status", "scheduled")
    .gte("scheduled_at", new Date().toISOString())
    .order("scheduled_at")
    .limit(30);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Upcoming Fixtures</h1>
      {(fixtures ?? []).length === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">No upcoming fixtures.</p>
      ) : (
        <div className="grid gap-3">
          {(fixtures ?? []).map((f) => {
            const home = (f.teams as { name: string } | null)?.name ?? "Home";
            const away = (f.away as { name: string } | null)?.name ?? "Away";
            const comp = (f.competitions as { name: string } | null)?.name;
            const venue = f.venues as { name: string; address: string | null } | null;
            const date = new Date(f.scheduled_at);
            const dateStr = date.toLocaleDateString("en-GB", {
              weekday: "short", day: "numeric", month: "short",
            });
            const timeStr = date.toLocaleTimeString("en-GB", {
              hour: "2-digit", minute: "2-digit",
            });

            return (
              <Card key={f.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{home} vs {away}</p>
                    {comp && <span className="text-xs text-muted-foreground">{comp}</span>}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <CalendarIcon className="h-3 w-3" />
                      {dateStr} at {timeStr}
                    </span>
                    {venue && (
                      <span className="flex items-center gap-1">
                        <MapPinIcon className="h-3 w-3" />
                        {venue.name}
                      </span>
                    )}
                    <a
                      href={`/api/calendar/${f.id}`}
                      className="text-primary hover:underline"
                    >
                      Add to calendar
                    </a>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
