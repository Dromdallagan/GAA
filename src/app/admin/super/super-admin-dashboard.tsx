"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, DollarSign, Globe } from "lucide-react";

interface OrgStat {
  id: string;
  name: string;
  slug: string;
  hasStripe: boolean;
  memberCount: number;
  activeCount: number;
  createdAt: string | null;
}

interface SuperAdminDashboardProps {
  orgs: OrgStat[];
  totalMembers: number;
  totalMargin: number;
}

function KpiCard({ title, value, icon: Icon }: { title: string; value: string; icon: React.ComponentType<React.SVGProps<SVGSVGElement>> }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-violet-500/10">
          <Icon className="h-5 w-5 text-violet-400" />
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold tracking-tight">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function SuperAdminDashboard({ orgs, totalMembers, totalMargin }: SuperAdminDashboardProps) {
  const connectedOrgs = orgs.filter((o) => o.hasStripe).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">QED Platform Admin</h1>
        <p className="text-sm text-muted-foreground">
          Cross-organisation overview and platform health.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="County Boards" value={String(orgs.length)} icon={Building2} />
        <KpiCard title="Total Members" value={String(totalMembers)} icon={Users} />
        <KpiCard title="Stripe Connected" value={`${connectedOrgs}/${orgs.length}`} icon={Globe} />
        <KpiCard title="Platform Revenue" value={`£${totalMargin.toFixed(2)}`} icon={DollarSign} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Organisations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="hidden border-b border-border/50 pb-2 text-xs font-medium text-muted-foreground md:grid md:grid-cols-[1fr_80px_80px_100px_80px]">
            <span>Organisation</span>
            <span className="text-right">Members</span>
            <span className="text-right">Active</span>
            <span className="text-right">Stripe</span>
            <span className="text-right">Joined</span>
          </div>
          <div className="divide-y divide-border/30">
            {orgs.map((org) => (
              <div
                key={org.id}
                className="flex flex-col gap-1 py-3 md:grid md:grid-cols-[1fr_80px_80px_100px_80px] md:items-center md:gap-0"
              >
                <div>
                  <p className="text-sm font-medium">{org.name}</p>
                  <p className="text-xs text-muted-foreground">{org.slug}</p>
                </div>
                <span className="text-right text-sm tabular-nums">{org.memberCount}</span>
                <span className="text-right text-sm tabular-nums text-emerald-400">{org.activeCount}</span>
                <div className="text-right">
                  {org.hasStripe ? (
                    <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/20 text-[10px]">Connected</Badge>
                  ) : (
                    <Badge variant="secondary" className="text-[10px]">Pending</Badge>
                  )}
                </div>
                <span className="text-right text-xs text-muted-foreground">
                  {org.createdAt ? new Date(org.createdAt).toLocaleDateString("en-GB", { month: "short", year: "2-digit" }) : "—"}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
