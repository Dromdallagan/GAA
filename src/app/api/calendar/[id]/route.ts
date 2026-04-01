import { NextRequest, NextResponse } from "next/server";
import ical, { ICalCalendarMethod } from "ical-generator";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data: fixture } = await supabase
    .from("fixtures")
    .select(`
      id, scheduled_at,
      teams!fixtures_home_team_id_fkey ( name ),
      away:teams!fixtures_away_team_id_fkey ( name ),
      competitions ( name ),
      venues ( name, address, latitude, longitude )
    `)
    .eq("id", id)
    .single();

  if (!fixture) {
    return NextResponse.json({ error: "Fixture not found" }, { status: 404 });
  }

  const home = (fixture.teams as { name: string } | null)?.name ?? "Home";
  const away = (fixture.away as { name: string } | null)?.name ?? "Away";
  const comp = (fixture.competitions as { name: string } | null)?.name ?? "";
  const venue = fixture.venues as { name: string; address: string | null; latitude: number | null; longitude: number | null } | null;

  const start = new Date(fixture.scheduled_at);
  const end = new Date(start.getTime() + 90 * 60 * 1000); // 90 min match

  const cal = ical({ name: "ClubOS Fixtures", method: ICalCalendarMethod.PUBLISH });
  cal.createEvent({
    start,
    end,
    summary: `${home} vs ${away}`,
    description: comp ? `${comp}\n\nPowered by ClubOS` : "Powered by ClubOS",
    location: venue
      ? {
          title: venue.name,
          address: venue.address ?? undefined,
          geo: venue.latitude && venue.longitude
            ? { lat: venue.latitude, lon: venue.longitude }
            : undefined,
        }
      : undefined,
    url: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:5555"}/fixtures`,
  });

  return new NextResponse(cal.toString(), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${home}-vs-${away}.ics"`,
    },
  });
}
