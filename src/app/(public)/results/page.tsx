import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = { title: "Results | ClubOS" };
export const dynamic = "force-dynamic";

export default async function PublicResultsPage() {
  const supabase = createAdminClient();

  const { data: fixtures } = await supabase
    .from("fixtures")
    .select(`
      id, scheduled_at,
      home_score_goals, home_score_points,
      away_score_goals, away_score_points,
      match_report,
      teams!fixtures_home_team_id_fkey ( name ),
      away:teams!fixtures_away_team_id_fkey ( name ),
      competitions ( name )
    `)
    .eq("status", "completed")
    .order("scheduled_at", { ascending: false })
    .limit(30);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Results</h1>
      {(fixtures ?? []).length === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">No results yet.</p>
      ) : (
        <div className="grid gap-3">
          {(fixtures ?? []).map((f) => {
            const homeScore = `${f.home_score_goals ?? 0}-${String(f.home_score_points ?? 0).padStart(2, "0")}`;
            const awayScore = `${f.away_score_goals ?? 0}-${String(f.away_score_points ?? 0).padStart(2, "0")}`;
            const home = (f.teams as { name: string } | null)?.name ?? "Home";
            const away = (f.away as { name: string } | null)?.name ?? "Away";
            const comp = (f.competitions as { name: string } | null)?.name;
            const date = new Date(f.scheduled_at).toLocaleDateString("en-GB", {
              day: "numeric", month: "short", year: "numeric",
            });

            return (
              <Card key={f.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{home}</span>
                        <span className="font-bold tabular-nums">{homeScore}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{away}</span>
                        <span className="font-bold tabular-nums">{awayScore}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{date}</span>
                    {comp && <span>— {comp}</span>}
                  </div>
                  {f.match_report && (
                    <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{f.match_report}</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
