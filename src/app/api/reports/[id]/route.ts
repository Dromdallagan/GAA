import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Generate a treasurer's report as downloadable HTML.
 * In production, this can be converted to PDF via a headless browser service
 * or @react-pdf/renderer. For now, generates a print-ready HTML page.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: orgId } = await params;
  const supabase = createAdminClient();

  // Fetch org
  const { data: org } = await supabase
    .from("organizations")
    .select("name")
    .eq("id", orgId)
    .single();

  if (!org) {
    return NextResponse.json({ error: "Organisation not found" }, { status: 404 });
  }

  // Fetch revenue reports
  const { data: reports } = await supabase
    .from("revenue_reports")
    .select("*")
    .eq("organization_id", orgId)
    .order("period_start", { ascending: false })
    .limit(12);

  // Fetch member counts
  const { count: totalMembers } = await supabase
    .from("members")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", orgId);

  const { count: activeMembers } = await supabase
    .from("members")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", orgId)
    .eq("membership_status", "active");

  const { count: pendingMembers } = await supabase
    .from("members")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", orgId)
    .eq("membership_status", "pending");

  // Calculate totals
  const totals = (reports ?? []).reduce(
    (acc, r) => ({
      gross: acc.gross + (r.gross_revenue ?? 0),
      fees: acc.fees + (r.stripe_fees ?? 0),
      twilio: acc.twilio + (r.twilio_costs ?? 0),
      margin: acc.margin + (r.qed_margin_amount ?? 0),
      net: acc.net + (r.net_to_organization ?? 0),
    }),
    { gross: 0, fees: 0, twilio: 0, margin: 0, net: 0 }
  );

  const today = new Date().toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Treasurer's Report — ${org.name}</title>
<style>
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; color: #1a1a1a; }
  h1 { font-size: 24px; margin: 0 0 4px; }
  h2 { font-size: 16px; margin: 24px 0 8px; border-bottom: 2px solid #e5e5e5; padding-bottom: 4px; }
  .subtitle { color: #666; font-size: 14px; margin: 0 0 24px; }
  .kpi-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin: 16px 0; }
  .kpi { background: #f9f9f9; border-radius: 8px; padding: 12px; }
  .kpi-label { font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; }
  .kpi-value { font-size: 22px; font-weight: 700; margin-top: 2px; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; margin: 8px 0; }
  th { text-align: left; padding: 8px 6px; border-bottom: 2px solid #ddd; font-size: 11px; text-transform: uppercase; color: #888; }
  td { padding: 8px 6px; border-bottom: 1px solid #eee; }
  .right { text-align: right; }
  .total td { border-top: 2px solid #333; font-weight: 700; }
  .green { color: #059669; }
  .red { color: #dc2626; }
  .footer { margin-top: 40px; font-size: 11px; color: #999; border-top: 1px solid #eee; padding-top: 12px; }
</style>
</head>
<body>
<h1>${org.name}</h1>
<p class="subtitle">Treasurer's Report — Generated ${today}</p>

<div class="kpi-row">
  <div class="kpi"><div class="kpi-label">Total Members</div><div class="kpi-value">${totalMembers ?? 0}</div></div>
  <div class="kpi"><div class="kpi-label">Active</div><div class="kpi-value green">${activeMembers ?? 0}</div></div>
  <div class="kpi"><div class="kpi-label">Pending</div><div class="kpi-value">${pendingMembers ?? 0}</div></div>
  <div class="kpi"><div class="kpi-label">Net Revenue</div><div class="kpi-value green">&pound;${totals.net.toFixed(2)}</div></div>
</div>

<h2>Revenue Summary</h2>
<table>
  <tr><th>Period</th><th class="right">Gross</th><th class="right">Stripe Fees</th><th class="right">Platform Fee</th><th class="right">Net</th><th class="right">Status</th></tr>
  ${(reports ?? []).map((r) => `
  <tr>
    <td>${new Date(r.period_start).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}</td>
    <td class="right">&pound;${(r.gross_revenue ?? 0).toFixed(2)}</td>
    <td class="right red">&pound;${(r.stripe_fees ?? 0).toFixed(2)}</td>
    <td class="right red">&pound;${(r.qed_margin_amount ?? 0).toFixed(2)}</td>
    <td class="right green">&pound;${(r.net_to_organization ?? 0).toFixed(2)}</td>
    <td class="right">${r.settled ? "Settled" : "Pending"}</td>
  </tr>`).join("")}
  <tr class="total">
    <td>Total</td>
    <td class="right">&pound;${totals.gross.toFixed(2)}</td>
    <td class="right red">&pound;${totals.fees.toFixed(2)}</td>
    <td class="right red">&pound;${totals.margin.toFixed(2)}</td>
    <td class="right green">&pound;${totals.net.toFixed(2)}</td>
    <td></td>
  </tr>
</table>

<h2>Fee Breakdown</h2>
<table>
  <tr><td>Gross Revenue</td><td class="right">&pound;${totals.gross.toFixed(2)}</td></tr>
  <tr><td>Stripe Processing Fees</td><td class="right red">-&pound;${totals.fees.toFixed(2)}</td></tr>
  <tr><td>WhatsApp Messaging Costs</td><td class="right red">-&pound;${totals.twilio.toFixed(2)}</td></tr>
  <tr><td>Platform Fee (10%)</td><td class="right red">-&pound;${totals.margin.toFixed(2)}</td></tr>
  <tr class="total"><td>Net to Organisation</td><td class="right green">&pound;${totals.net.toFixed(2)}</td></tr>
</table>

<div class="footer">
  <p>This report was automatically generated by ClubOS. For queries, contact your ClubOS administrator.</p>
  <p>ClubOS — AI-powered GAA club management</p>
</div>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `inline; filename="${org.name.replace(/[^a-zA-Z0-9]/g, "-")}-report.html"`,
    },
  });
}
