import type { ReactNode } from 'react';
import { cn } from './cn';
import { Card } from './Card';

interface EmptyStateProps {
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
}

export function EmptyState({ title, description, children, className }: EmptyStateProps) {
  return (
    <Card
      variant="surface"
      className={cn('rounded-2xl border-dashed px-6 py-12 text-center', className)}
    >
      <p className="m-0 font-bold text-vantage-fg">{title}</p>
      {description && <p className="mt-2 text-sm text-vantage-muted">{description}</p>}
      {children}
    </Card>
  );
}
