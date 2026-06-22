import type { ReactNode } from 'react';
import { cn } from './cn';

type AlertVariant = 'error' | 'info' | 'accent';

const variantClass: Record<AlertVariant, string> = {
  error: 'border-vantage-no/30 bg-vantage-no/10 text-vantage-no',
  info: 'border-vantage-border bg-vantage-elevated text-vantage-muted',
  accent: 'border-vantage-accent/30 bg-vantage-accent/10 text-vantage-accent',
};

interface AlertProps {
  variant?: AlertVariant;
  children: ReactNode;
  className?: string;
}

export function Alert({ variant = 'error', children, className }: AlertProps) {
  return (
    <div
      className={cn(
        'rounded-xl border px-4 py-3 text-sm font-medium',
        variantClass[variant],
        className,
      )}
      role="alert"
    >
      {children}
    </div>
  );
}
