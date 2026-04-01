import type { Metadata } from "next";
import { DashboardContent } from "./dashboard-content";

export const metadata: Metadata = {
  title: "Dashboard | ClubOS",
  description: "Club management dashboard overview",
};

export default function DashboardPage() {
  return <DashboardContent />;
}
