import { cn } from './cn';

type BadgeVariant = 'accent' | 'draft' | 'live';

const variantClass: Record<BadgeVariant, string> = {
  accent: 'bg-vantage-accent/15 text-vantage-accent',
  draft: 'bg-amber-500/15 text-amber-400',
  live: 'bg-vantage-yes/15 text-vantage-yes',
};

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = 'accent', children, className }: BadgeProps) {
  return (
    <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-semibold', variantClass[variant], className)}>
      {children}
    </span>
  );
}
