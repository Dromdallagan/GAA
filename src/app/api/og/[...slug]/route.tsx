import { ImageResponse } from "@vercel/og";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "edge";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await params;
  const fixtureId = slug?.[0];

  if (!fixtureId) {
    return new Response("Missing fixture ID", { status: 400 });
  }

  const supabase = createAdminClient();
  const { data: fixture } = await supabase
    .from("fixtures")
    .select(`
      status,
      home_score_goals, home_score_points,
      away_score_goals, away_score_points,
      scheduled_at,
      teams!fixtures_home_team_id_fkey ( name ),
      away:teams!fixtures_away_team_id_fkey ( name ),
      competitions ( name )
    `)
    .eq("id", fixtureId)
    .single();

  if (!fixture) {
    return new Response("Fixture not found", { status: 404 });
  }

  const home = (fixture.teams as { name: string } | null)?.name ?? "Home";
  const away = (fixture.away as { name: string } | null)?.name ?? "Away";
  const comp = (fixture.competitions as { name: string } | null)?.name ?? "";
  const isCompleted = fixture.status === "completed" || fixture.status === "live";
  const homeScore = isCompleted
    ? `${fixture.home_score_goals ?? 0}-${String(fixture.home_score_points ?? 0).padStart(2, "0")}`
    : "";
  const awayScore = isCompleted
    ? `${fixture.away_score_goals ?? 0}-${String(fixture.away_score_points ?? 0).padStart(2, "0")}`
    : "";
  const date = new Date(fixture.scheduled_at).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "1200px",
          height: "630px",
          backgroundColor: "#0a0a0a",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: "20px", color: "#888", marginBottom: "16px", display: "flex" }}>
          {comp}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "48px" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
            <div style={{ fontSize: "36px", fontWeight: 700, display: "flex" }}>{home}</div>
            {isCompleted && (
              <div style={{ fontSize: "64px", fontWeight: 800, color: "#10b981", display: "flex" }}>
                {homeScore}
              </div>
            )}
          </div>
          <div style={{ fontSize: "32px", color: "#555", display: "flex" }}>vs</div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
            <div style={{ fontSize: "36px", fontWeight: 700, display: "flex" }}>{away}</div>
            {isCompleted && (
              <div style={{ fontSize: "64px", fontWeight: 800, color: "#10b981", display: "flex" }}>
                {awayScore}
              </div>
            )}
          </div>
        </div>
        <div style={{ fontSize: "18px", color: "#666", marginTop: "24px", display: "flex" }}>
          {date}
        </div>
        <div style={{ fontSize: "14px", color: "#444", marginTop: "32px", display: "flex" }}>
          ClubOS
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
