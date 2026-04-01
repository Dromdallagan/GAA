-- Message costs (Twilio usage tracking per org per month)
CREATE TABLE message_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  marketing_count INTEGER DEFAULT 0,
  marketing_cost DECIMAL(10, 4) DEFAULT 0,
  utility_count INTEGER DEFAULT 0,
  utility_cost DECIMAL(10, 4) DEFAULT 0,
  service_count INTEGER DEFAULT 0,
  service_cost DECIMAL(10, 4) DEFAULT 0,
  total_cost DECIMAL(10, 4) DEFAULT 0,
  billed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, period_start)
);

ALTER TABLE message_costs ENABLE ROW LEVEL SECURITY;

-- Revenue reports (monthly financial per org)
CREATE TABLE revenue_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  gross_revenue DECIMAL(10, 2) DEFAULT 0,
  stripe_fees DECIMAL(10, 2) DEFAULT 0,
  twilio_costs DECIMAL(10, 2) DEFAULT 0,
  qed_margin_rate DECIMAL(5, 4) DEFAULT 0.10,
  qed_margin_amount DECIMAL(10, 2) DEFAULT 0,
  net_to_organization DECIMAL(10, 2) DEFAULT 0,
  settled BOOLEAN DEFAULT FALSE,
  settled_at TIMESTAMPTZ,
  settlement_reference TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, period_start)
);

ALTER TABLE revenue_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org users can read message_costs"
  ON message_costs FOR SELECT
  USING (organization_id IN (SELECT get_user_org_ids(auth.uid())));

CREATE POLICY "Org users can read revenue_reports"
  ON revenue_reports FOR SELECT
  USING (organization_id IN (SELECT get_user_org_ids(auth.uid())));

-- Helper: increment message cost atomically
CREATE OR REPLACE FUNCTION increment_message_cost(
  _org_id UUID,
  _category TEXT,
  _cost DECIMAL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  _period_start DATE := date_trunc('month', NOW())::DATE;
  _period_end DATE := (date_trunc('month', NOW()) + INTERVAL '1 month')::DATE;
BEGIN
  INSERT INTO message_costs (organization_id, period_start, period_end)
  VALUES (_org_id, _period_start, _period_end)
  ON CONFLICT (organization_id, period_start) DO NOTHING;

  EXECUTE format(
    'UPDATE message_costs SET %I_count = %I_count + 1, %I_cost = %I_cost + $1, total_cost = total_cost + $1 WHERE organization_id = $2 AND period_start = $3',
    _category, _category, _category, _category
  ) USING _cost, _org_id, _period_start;
END;
$$;
