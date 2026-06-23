import type { ReactNode } from 'react';
import { cn } from './cn';
import { Badge } from './Badge';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  action?: ReactNode;
  size?: 'default' | 'hero' | 'compact';
  className?: string;
}

export function PageHeader({ title, subtitle, badge, action, size = 'default', className }: PageHeaderProps) {
  const titleClass =
    size === 'hero'
      ? 'text-2xl font-extrabold tracking-tight sm:text-4xl'
      : size === 'compact'
        ? 'text-lg font-black sm:text-xl'
        : 'text-xl font-extrabold tracking-tight sm:text-2xl';

  return (
    <div className={cn('flex flex-wrap items-start justify-between gap-4', className)}>
      <div>
        <h1 className={cn('m-0 text-vantage-fg', size === 'hero' && 'game-hero-title', titleClass)}>{title}</h1>
        {subtitle && <p className="mt-2 text-sm text-vantage-muted">{subtitle}</p>}
      </div>
      {(badge || action) && (
        <div className="flex items-center gap-3">
          {badge && <Badge>{badge}</Badge>}
          {action}
        </div>
      )}
    </div>
  );
}
