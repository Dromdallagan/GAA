"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import {
  CalendarDays,
  Users,
  Trophy,
  BarChart3,
  Settings,
  FileText,
  Bot,
  Radio,
  LayoutDashboard,
  Plus,
} from "lucide-react";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const navigate = useCallback(
    (path: string) => {
      setOpen(false);
      router.push(path);
    },
    [router]
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-8 items-center gap-2 rounded-lg border border-border/50 bg-muted/50 px-3 text-xs text-muted-foreground transition-colors hover:border-border hover:text-foreground"
      >
        <span>Search...</span>
        <kbd className="pointer-events-none ml-2 inline-flex h-5 items-center gap-0.5 rounded border border-border/50 bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command>
          <CommandInput placeholder="Search fixtures, members, commands..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Navigation">
              <CommandItem onSelect={() => navigate("/admin/dashboard")}>
                <LayoutDashboard />
                <span>Dashboard</span>
                <CommandShortcut>⌘D</CommandShortcut>
              </CommandItem>
              <CommandItem onSelect={() => navigate("/admin/fixtures")}>
                <CalendarDays />
                <span>Fixtures</span>
                <CommandShortcut>⌘F</CommandShortcut>
              </CommandItem>
              <CommandItem onSelect={() => navigate("/admin/members")}>
                <Users />
                <span>Members</span>
                <CommandShortcut>⌘M</CommandShortcut>
              </CommandItem>
              <CommandItem onSelect={() => navigate("/admin/competitions")}>
                <Trophy />
                <span>Competitions</span>
              </CommandItem>
              <CommandItem onSelect={() => navigate("/admin/revenue")}>
                <BarChart3 />
                <span>Revenue</span>
              </CommandItem>
              <CommandItem onSelect={() => navigate("/admin/content")}>
                <FileText />
                <span>Content Queue</span>
              </CommandItem>
              <CommandItem onSelect={() => navigate("/admin/agents")}>
                <Bot />
                <span>AI Agents</span>
              </CommandItem>
              <CommandItem onSelect={() => navigate("/admin/live")}>
                <Radio />
                <span>Live Scores</span>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Quick Actions">
              <CommandItem
                onSelect={() => navigate("/admin/fixtures?action=create")}
              >
                <Plus />
                <span>Create Fixture</span>
              </CommandItem>
              <CommandItem
                onSelect={() => navigate("/admin/members?action=add")}
              >
                <Plus />
                <span>Add Member</span>
              </CommandItem>
              <CommandItem onSelect={() => navigate("/admin/settings")}>
                <Settings />
                <span>Settings</span>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
