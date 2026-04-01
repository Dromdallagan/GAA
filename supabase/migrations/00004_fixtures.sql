-- Fixtures
CREATE TABLE fixtures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  competition_id UUID REFERENCES competitions(id),
  home_team_id UUID REFERENCES teams(id),
  away_team_id UUID REFERENCES teams(id),
  venue_id UUID REFERENCES venues(id),
  scheduled_at TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN (
    'scheduled', 'live', 'completed', 'postponed', 'cancelled'
  )),
  home_score_goals INTEGER DEFAULT 0,
  home_score_points INTEGER DEFAULT 0,
  away_score_goals INTEGER DEFAULT 0,
  away_score_points INTEGER DEFAULT 0,
  match_report TEXT,
  scorers JSONB,
  man_of_match TEXT,
  weather_forecast JSONB,
  submitted_by UUID REFERENCES auth.users(id),
  submitted_at TIMESTAMPTZ,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_fixtures_org ON fixtures(organization_id);
CREATE INDEX idx_fixtures_date ON fixtures(scheduled_at);
CREATE INDEX idx_fixtures_status ON fixtures(status);
CREATE INDEX idx_fixtures_competition ON fixtures(competition_id);

ALTER TABLE fixtures ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER fixtures_updated_at
  BEFORE UPDATE ON fixtures
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE POLICY "Org users can read fixtures"
  ON fixtures FOR SELECT
  USING (organization_id IN (SELECT get_user_org_ids(auth.uid())));

CREATE POLICY "Org admins can manage fixtures"
  ON fixtures FOR ALL
  USING (
    has_role_on_org(auth.uid(), organization_id,
      ARRAY['super_admin', 'owner', 'admin', 'secretary', 'manager'])
  );

-- Match events for live scoring
CREATE TABLE match_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fixture_id UUID NOT NULL REFERENCES fixtures(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  event_type TEXT NOT NULL CHECK (event_type IN (
    'goal', 'point', 'wide', 'yellow_card', 'red_card',
    'substitution', 'half_time', 'full_time'
  )),
  team TEXT NOT NULL CHECK (team IN ('home', 'away')),
  player_name TEXT,
  minute INTEGER,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_match_events_fixture ON match_events(fixture_id);
CREATE INDEX idx_match_events_created ON match_events(created_at);

ALTER TABLE match_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org users can read match_events"
  ON match_events FOR SELECT
  USING (organization_id IN (SELECT get_user_org_ids(auth.uid())));

-- Enable Realtime for match_events (live scoreboard)
ALTER PUBLICATION supabase_realtime ADD TABLE match_events;
ALTER PUBLICATION supabase_realtime ADD TABLE fixtures;
