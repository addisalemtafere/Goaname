import type { ReactNode } from 'react';
import { cn } from './cn';

interface PanelSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  flat?: boolean;
}

export function PanelSection({ title, description, children, className, flat = false }: PanelSectionProps) {
  return (
    <section
      className={cn(
        'grid gap-4',
        flat
          ? 'border-t border-vantage-border pt-3 first:border-t-0 first:pt-0'
          : 'admin-panel rounded-md border border-vantage-border bg-vantage-surface p-4',
        className,
      )}
    >
      <div>
        <h3 className="m-0 text-xs font-semibold uppercase tracking-wide text-vantage-fg">{title}</h3>
        {description && <p className="m-0 mt-0.5 text-[11px] leading-relaxed text-vantage-muted">{description}</p>}
      </div>
      {children}
    </section>
  );
}

interface DetailRowProps {
  label: string;
  value: ReactNode;
}

export function DetailRow({ label, value }: DetailRowProps) {
  return (
    <>
      <dt className="m-0 text-[11px] font-medium uppercase tracking-wide text-vantage-muted">{label}</dt>
      <dd className="m-0 text-sm font-medium tabular-nums text-vantage-fg">{value}</dd>
    </>
  );
}
