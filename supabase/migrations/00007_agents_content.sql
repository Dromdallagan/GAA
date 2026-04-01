-- Agent runs (proactive AI agent audit trail)
CREATE TABLE agent_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  agent_type TEXT NOT NULL CHECK (agent_type IN (
    'registration_guardian', 'revenue_sentinel', 'fixture_intelligence',
    'member_retention', 'content_engine', 'smart_scheduler'
  )),
  status TEXT DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed')),
  findings JSONB DEFAULT '{}',
  actions_taken JSONB[] DEFAULT '{}',
  ran_at TIMESTAMPTZ DEFAULT NOW(),
  next_run_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_agent_runs_org ON agent_runs(organization_id);
CREATE INDEX idx_agent_runs_type ON agent_runs(agent_type);

ALTER TABLE agent_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org users can read agent_runs"
  ON agent_runs FOR SELECT
  USING (organization_id IN (SELECT get_user_org_ids(auth.uid())));

-- Content queue (PRO approval workflow)
CREATE TABLE content_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'match_report', 'social_post', 'weekly_roundup', 'press_release'
  )),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  status TEXT DEFAULT 'draft' CHECK (status IN (
    'draft', 'pending_approval', 'approved', 'published', 'rejected'
  )),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_content_queue_org ON content_queue(organization_id);
CREATE INDEX idx_content_queue_status ON content_queue(status);

ALTER TABLE content_queue ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER content_queue_updated_at
  BEFORE UPDATE ON content_queue
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE POLICY "Org users can read content_queue"
  ON content_queue FOR SELECT
  USING (organization_id IN (SELECT get_user_org_ids(auth.uid())));
