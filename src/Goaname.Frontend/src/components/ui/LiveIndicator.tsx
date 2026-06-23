interface LiveIndicatorProps {
  count: number;
  className?: string;
}

export function LiveIndicator({ count, className }: LiveIndicatorProps) {
  return (
    <span className={`hidden items-center gap-2 text-xs font-bold tracking-wide text-vantage-muted sm:inline-flex ${className ?? ''}`}>
      <span className="relative flex h-2 w-2">
        <span className="vantage-pulse-ring absolute inline-flex h-full w-full rounded-full bg-vantage-live" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-vantage-live" />
      </span>
      {count.toLocaleString()} LIVE
    </span>
  );
}
