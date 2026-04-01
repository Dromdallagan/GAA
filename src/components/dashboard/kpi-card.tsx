"use client";

import { useId, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { NumberMorph } from "@/components/motion/number-morph";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";

interface KpiCardProps {
  title: string;
  value: number;
  format?: (n: number) => string;
  trend: number;
  sparklineData: number[];
  icon: ReactNode;
  className?: string;
}

export function KpiCard({
  title,
  value,
  format,
  trend,
  sparklineData,
  icon,
  className,
}: KpiCardProps) {
  const gradientId = useId().replace(/:/g, "");
  const trendPositive = trend > 0;
  const trendNeutral = trend === 0;
  const trendColor = trendPositive
    ? "text-success"
    : trendNeutral
      ? "text-muted-foreground"
      : "text-destructive";
  const TrendIcon = trendPositive
    ? TrendingUp
    : trendNeutral
      ? Minus
      : TrendingDown;
  const chartColor = trendPositive
    ? "var(--color-success)"
    : trendNeutral
      ? "var(--color-muted-foreground)"
      : "var(--color-destructive)";

  const data = sparklineData.map((v, i) => ({ value: v, i }));

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border/50 bg-card p-5",
        "transition-all duration-200 hover:border-border/80 hover:shadow-lg hover:shadow-black/20",
        className
      )}
    >
      {/* Background sparkline */}
      <div className="absolute inset-x-0 bottom-0 h-16 opacity-[0.15]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={chartColor} stopOpacity={0.6} />
                <stop offset="100%" stopColor={chartColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="value"
              stroke={chartColor}
              strokeWidth={1.5}
              fill={`url(#${gradientId})`}
              dot={false}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Content */}
      <div className="relative flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {title}
          </p>
          <NumberMorph
            value={value}
            format={format}
            className="block text-2xl font-bold tracking-tight font-mono"
          />
          <div
            className={cn(
              "flex items-center gap-1 text-xs font-medium",
              trendColor
            )}
          >
            <TrendIcon className="h-3 w-3" />
            <span>{Math.abs(trend)}%</span>
            <span className="text-muted-foreground">vs last month</span>
          </div>
        </div>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
      </div>
    </div>
  );
}
