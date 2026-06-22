import type { ReactNode } from 'react';
import { cn } from './cn';

interface PanelSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function PanelSection({ title, description, children, className }: PanelSectionProps) {
  return (
    <section className={cn('grid gap-4 rounded-xl border border-vantage-border bg-vantage-bg/60 p-5', className)}>
      <div>
        <h3 className="m-0 text-lg font-bold text-vantage-fg">{title}</h3>
        {description && <p className="m-0 mt-2 text-sm text-vantage-muted">{description}</p>}
      </div>
      {children}
    </section>
  );
}

interface DetailRowProps {
  label: string;
  value: string;
}

export function DetailRow({ label, value }: DetailRowProps) {
  return (
    <>
      <dt className="m-0 text-sm text-vantage-muted">{label}</dt>
      <dd className="m-0 text-sm font-medium text-vantage-fg">{value}</dd>
    </>
  );
}
