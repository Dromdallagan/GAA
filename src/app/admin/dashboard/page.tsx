import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | ClubOS",
  description: "Club management dashboard overview",
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to ClubOS. Your club at a glance.
        </p>
      </div>

      {/* KPI cards placeholder - will be built in Task 8 */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm"
          >
            <div className="h-4 w-24 rounded bg-muted animate-pulse" />
            <div className="mt-3 h-8 w-16 rounded bg-muted animate-pulse" />
            <div className="mt-2 h-3 w-32 rounded bg-muted animate-pulse" />
          </div>
        ))}
      </div>

      {/* Bento grid placeholder - will be built in Task 8 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm"
          >
            <div className="h-4 w-32 rounded bg-muted animate-pulse" />
            <div className="mt-4 h-32 w-full rounded bg-muted animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
