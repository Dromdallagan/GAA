"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  Users,
  CreditCard,
  TrendingUp,
  Clock,
} from "lucide-react";

interface RevenueReport {
  id: string;
  period_start: string;
  period_end: string;
  gross_revenue: number | null;
  stripe_fees: number | null;
  twilio_costs: number | null;
  qed_margin_rate: number | null;
  qed_margin_amount: number | null;
  net_to_organization: number | null;
  settled: boolean | null;
  settled_at: string | null;
}

interface RevenueContentProps {
  reports: RevenueReport[];
  activeMembers: number;
  activeSubscriptions: number;
  pendingMembers: number;
}

function formatCurrency(amount: number | null): string {
  if (amount == null) return "£0.00";
  return `£${amount.toFixed(2)}`;
}

function formatPeriod(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  return `${s.toLocaleDateString("en-GB", { month: "short", year: "numeric" })} — ${e.toLocaleDateString("en-GB", { month: "short", year: "numeric" })}`;
}

function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold tracking-tight">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function RevenueContent({
  reports,
  activeMembers,
  activeSubscriptions,
  pendingMembers,
}: RevenueContentProps) {
  // Calculate totals from reports
  const totals = reports.reduce(
    (acc, r) => ({
      gross: acc.gross + (r.gross_revenue ?? 0),
      fees: acc.fees + (r.stripe_fees ?? 0),
      twilio: acc.twilio + (r.twilio_costs ?? 0),
      margin: acc.margin + (r.qed_margin_amount ?? 0),
      net: acc.net + (r.net_to_organization ?? 0),
    }),
    { gross: 0, fees: 0, twilio: 0, margin: 0, net: 0 }
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Revenue</h1>
        <p className="text-sm text-muted-foreground">
          Financial overview and payment tracking.
        </p>
      </div>

      {/* KPI Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Net Revenue"
          value={formatCurrency(totals.net)}
          subtitle="After fees & platform margin"
          icon={DollarSign}
        />
        <KpiCard
          title="Active Members"
          value={String(activeMembers)}
          subtitle={`${pendingMembers} pending payment`}
          icon={Users}
        />
        <KpiCard
          title="Active Subscriptions"
          value={String(activeSubscriptions)}
          subtitle="Recurring supporters"
          icon={CreditCard}
        />
        <KpiCard
          title="Gross Revenue"
          value={formatCurrency(totals.gross)}
          subtitle={`${formatCurrency(totals.fees)} in fees`}
          icon={TrendingUp}
        />
      </div>

      {/* Revenue breakdown */}
      {reports.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Revenue Reports</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Table header */}
            <div className="hidden border-b border-border/50 pb-2 text-xs font-medium text-muted-foreground md:grid md:grid-cols-[1fr_100px_100px_100px_100px_80px]">
              <span>Period</span>
              <span className="text-right">Gross</span>
              <span className="text-right">Fees</span>
              <span className="text-right">Platform</span>
              <span className="text-right">Net</span>
              <span className="text-right">Status</span>
            </div>

            <div className="divide-y divide-border/30">
              {reports.map((r) => (
                <div
                  key={r.id}
                  className="flex flex-col gap-1 py-3 md:grid md:grid-cols-[1fr_100px_100px_100px_100px_80px] md:items-center md:gap-0"
                >
                  <span className="text-sm font-medium">
                    {formatPeriod(r.period_start, r.period_end)}
                  </span>
                  <span className="text-right text-sm tabular-nums">
                    {formatCurrency(r.gross_revenue)}
                  </span>
                  <span className="text-right text-sm tabular-nums text-muted-foreground">
                    {formatCurrency(r.stripe_fees)}
                  </span>
                  <span className="text-right text-sm tabular-nums text-muted-foreground">
                    {formatCurrency(r.qed_margin_amount)}
                  </span>
                  <span className="text-right text-sm font-medium tabular-nums text-emerald-400">
                    {formatCurrency(r.net_to_organization)}
                  </span>
                  <div className="text-right">
                    {r.settled ? (
                      <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/20 text-[10px]">
                        Settled
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[10px]">
                        Pending
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Clock className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium">No revenue reports yet</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Reports are generated monthly once payments start flowing.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Fee breakdown */}
      {totals.gross > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Fee Breakdown (All Time)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Gross Revenue</span>
                <span className="font-medium">{formatCurrency(totals.gross)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Stripe Processing Fees</span>
                <span className="text-red-400">-{formatCurrency(totals.fees)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Twilio Messaging Costs</span>
                <span className="text-red-400">-{formatCurrency(totals.twilio)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Platform Fee (10%)</span>
                <span className="text-red-400">-{formatCurrency(totals.margin)}</span>
              </div>
              <hr className="border-border/50" />
              <div className="flex items-center justify-between text-sm font-semibold">
                <span>Net to Organisation</span>
                <span className="text-emerald-400">{formatCurrency(totals.net)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
