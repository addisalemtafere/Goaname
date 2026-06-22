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
      ? 'text-4xl font-extrabold tracking-tight'
      : size === 'compact'
        ? 'text-xl font-black'
        : 'text-2xl font-extrabold tracking-tight';

  return (
    <div className={cn('flex flex-wrap items-start justify-between gap-4', className)}>
      <div>
        <h1 className={cn('m-0 text-vantage-fg', titleClass)}>{title}</h1>
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
