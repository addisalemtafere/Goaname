import { cn } from './cn';

interface LiveIndicatorProps {
  count: number;
  className?: string;
}

export function LiveIndicator({ count, className }: LiveIndicatorProps) {
  return (
    <span
      className={cn(
        'game-live hidden items-center gap-2 text-xs font-bold tracking-[0.12em] uppercase sm:inline-flex',
        className,
      )}
    >
      <span className="relative flex h-2.5 w-2.5">
        <span className="vantage-pulse-ring absolute inline-flex h-full w-full rounded-full bg-vantage-live" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-vantage-live shadow-[0_0_8px_rgba(0,230,118,0.8)]" />
      </span>
      {count.toLocaleString()} Live
    </span>
  );
}
