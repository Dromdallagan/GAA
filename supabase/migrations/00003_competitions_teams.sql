-- Venues with GPS
CREATE TABLE venues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  latitude DECIMAL(10, 7),
  longitude DECIMAL(10, 7),
  capacity INTEGER,
  facilities JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE venues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org users can read venues"
  ON venues FOR SELECT
  USING (organization_id IN (SELECT get_user_org_ids(auth.uid())));

-- Competitions
CREATE TABLE competitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL CHECK (code IN ('football', 'hurling', 'camogie', 'lgfa')),
  level TEXT NOT NULL CHECK (level IN (
    'senior', 'intermediate', 'junior', 'u21', 'minor', 'u16', 'u14', 'u12'
  )),
  type TEXT NOT NULL CHECK (type IN ('championship', 'league', 'cup')),
  season INTEGER NOT NULL,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed')),
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE competitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org users can read competitions"
  ON competitions FOR SELECT
  USING (organization_id IN (SELECT get_user_org_ids(auth.uid())));

-- Teams
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  club_id UUID REFERENCES organizations(id),
  name TEXT NOT NULL,
  code TEXT NOT NULL CHECK (code IN ('football', 'hurling', 'camogie', 'lgfa')),
  level TEXT NOT NULL CHECK (level IN (
    'senior', 'intermediate', 'junior', 'u21', 'minor', 'u16', 'u14', 'u12'
  )),
  manager_id UUID REFERENCES org_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org users can read teams"
  ON teams FOR SELECT
  USING (organization_id IN (SELECT get_user_org_ids(auth.uid())));
