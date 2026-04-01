-- Organizations: county boards and clubs
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_irish TEXT,
  slug TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('county_board', 'club')),
  parent_id UUID REFERENCES organizations(id),
  domain TEXT UNIQUE,
  twilio_phone_sid TEXT,
  twilio_studio_flow_sid TEXT,
  stripe_connect_id TEXT,
  theme JSONB DEFAULT '{"accent_color": "#ef4444"}',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_organizations_parent ON organizations(parent_id);
CREATE INDEX idx_organizations_domain ON organizations(domain);
CREATE INDEX idx_organizations_twilio ON organizations(twilio_phone_sid);

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Org users: dashboard admins and WhatsApp officers
CREATE TABLE org_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN (
    'super_admin', 'owner', 'admin', 'secretary',
    'treasurer', 'registrar', 'pro', 'manager'
  )),
  phone_number TEXT,
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);

CREATE INDEX idx_org_users_user ON org_users(user_id);
CREATE INDEX idx_org_users_org ON org_users(organization_id);
CREATE INDEX idx_org_users_phone ON org_users(phone_number);

ALTER TABLE org_users ENABLE ROW LEVEL SECURITY;

-- Helper function: check if user has role on org
CREATE OR REPLACE FUNCTION has_role_on_org(
  _user_id UUID,
  _org_id UUID,
  _roles TEXT[] DEFAULT ARRAY[
    'super_admin', 'owner', 'admin', 'secretary',
    'treasurer', 'registrar', 'pro', 'manager'
  ]
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM org_users
    WHERE user_id = _user_id
      AND organization_id = _org_id
      AND role = ANY(_roles)
  );
END;
$$;

-- Helper function: get user's org IDs
CREATE OR REPLACE FUNCTION get_user_org_ids(_user_id UUID)
RETURNS SETOF UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT organization_id FROM org_users WHERE user_id = _user_id;
$$;

-- Trigger: auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS policies
CREATE POLICY "Users can read own organizations"
  ON organizations FOR SELECT
  USING (
    id IN (SELECT get_user_org_ids(auth.uid()))
    OR parent_id IN (SELECT get_user_org_ids(auth.uid()))
  );

CREATE POLICY "Users can read own org_users"
  ON org_users FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage org_users"
  ON org_users FOR ALL
  USING (
    has_role_on_org(auth.uid(), organization_id, ARRAY['super_admin', 'owner', 'admin'])
  );
