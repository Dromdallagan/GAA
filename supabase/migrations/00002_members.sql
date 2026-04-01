CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL,
  phone_hash TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  date_of_birth DATE,
  membership_type TEXT CHECK (membership_type IN ('adult', 'youth', 'student', 'family', 'social')),
  membership_status TEXT DEFAULT 'pending' CHECK (membership_status IN ('pending', 'active', 'expired', 'suspended')),
  membership_expires_at DATE,
  foireann_id TEXT,
  stripe_customer_id TEXT,
  engagement_score INTEGER DEFAULT 50 CHECK (engagement_score BETWEEN 0 AND 100),
  last_interaction_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, phone_hash)
);

CREATE INDEX idx_members_org ON members(organization_id);
CREATE INDEX idx_members_phone_hash ON members(phone_hash);
CREATE INDEX idx_members_status ON members(membership_status);
CREATE INDEX idx_members_engagement ON members(engagement_score);

ALTER TABLE members ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER members_updated_at
  BEFORE UPDATE ON members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE POLICY "Org users can read their org members"
  ON members FOR SELECT
  USING (organization_id IN (SELECT get_user_org_ids(auth.uid())));

CREATE POLICY "Org admins can manage members"
  ON members FOR ALL
  USING (
    has_role_on_org(auth.uid(), organization_id,
      ARRAY['super_admin', 'owner', 'admin', 'secretary', 'registrar'])
  );
