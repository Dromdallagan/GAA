"use client";

import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { AppSidebar } from "@/components/app-sidebar";

interface AdminShellProps {
  orgName: string;
  orgNameIrish: string | null;
  userEmail: string;
  userAvatarUrl: string | null;
  children: React.ReactNode;
}

export function AdminShell({
  orgName,
  orgNameIrish,
  userEmail,
  userAvatarUrl,
  children,
}: AdminShellProps) {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar
          orgName={orgName}
          orgNameIrish={orgNameIrish}
          userEmail={userEmail}
          userAvatarUrl={userAvatarUrl}
        />
        <SidebarInset>
          <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
          </header>
          <main className="flex-1 overflow-auto p-4 md:p-6">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
