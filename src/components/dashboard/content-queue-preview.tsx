import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { FileText, Newspaper, Share2, type LucideIcon } from "lucide-react";

export interface ContentItem {
  id: string;
  type: "match_report" | "weekly_roundup" | "social_post";
  title: string;
  status: "pending" | "approved" | "rejected";
  generatedAt: string;
}

const TYPE_ICONS: Record<ContentItem["type"], LucideIcon> = {
  match_report: FileText,
  weekly_roundup: Newspaper,
  social_post: Share2,
};

const TYPE_LABELS: Record<ContentItem["type"], string> = {
  match_report: "Match Report",
  weekly_roundup: "Roundup",
  social_post: "Social",
};

const STATUS_STYLES: Record<ContentItem["status"], string> = {
  pending: "bg-warning/10 text-warning border-warning/20",
  approved: "bg-success/10 text-success border-success/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
};

interface ContentQueuePreviewProps {
  items: ContentItem[];
  className?: string;
}

export function ContentQueuePreview({
  items,
  className,
}: ContentQueuePreviewProps) {
  const pendingCount = items.filter((i) => i.status === "pending").length;

  return (
    <div className={cn("flex h-full flex-col", className)}>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Content Queue</h3>
        <span className="text-[10px] text-muted-foreground">
          {pendingCount} pending
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2">
        {items.map((item) => {
          const Icon = TYPE_ICONS[item.type];
          return (
            <div
              key={item.id}
              className="flex items-start gap-2.5 rounded-lg border border-border/30 bg-background/50 p-2.5"
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted">
                <Icon className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium">{item.title}</p>
                <div className="mt-1 flex items-center gap-1.5">
                  <Badge
                    variant="outline"
                    className={cn(
                      "h-4 px-1 text-[10px]",
                      STATUS_STYLES[item.status]
                    )}
                  >
                    {item.status}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">
                    {TYPE_LABELS[item.type]}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
