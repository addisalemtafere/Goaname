import type { ReactNode } from 'react';
import { cn } from '../ui';

interface AdminPageProps {
  title: string;
  description?: string;
  toolbar?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function AdminPage({ title, description, toolbar, children, className }: AdminPageProps) {
  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-vantage-border pb-3">
        <div className="min-w-0">
          <h2 className="m-0 text-sm font-semibold tracking-tight text-vantage-fg">{title}</h2>
          {description && <p className="m-0 mt-0.5 text-xs leading-relaxed text-vantage-muted">{description}</p>}
        </div>
        {toolbar}
      </div>
      {children}
    </div>
  );
}

interface AdminSplitLayoutProps {
  main: ReactNode;
  aside: ReactNode;
  asideEmpty?: ReactNode;
  showAside?: boolean;
}

export function AdminSplitLayout({ main, aside, asideEmpty, showAside = true }: AdminSplitLayoutProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-vantage-border bg-vantage-surface">
      <div className="grid lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0 border-b border-vantage-border lg:border-r lg:border-b-0">{main}</div>
        <aside className="min-w-0 bg-vantage-bg/40">
          {showAside ? aside : (asideEmpty ?? aside)}
        </aside>
      </div>
    </div>
  );
}

interface AdminDetailPanelProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AdminDetailPanel({ title, subtitle, children, footer }: AdminDetailPanelProps) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b border-vantage-border px-4 py-3.5">
        <h3 className="m-0 line-clamp-2 text-sm font-semibold leading-snug text-vantage-fg">{title}</h3>
        {subtitle && <p className="m-0 mt-1 truncate text-xs text-vantage-muted">{subtitle}</p>}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">{children}</div>
      {footer && <div className="border-t border-vantage-border px-4 py-3.5">{footer}</div>}
    </div>
  );
}

export function AdminEmptyAside({ message }: { message: string }) {
  return (
    <div className="flex h-full min-h-[280px] items-center justify-center px-8 py-12 text-center">
      <p className="m-0 max-w-[280px] text-sm leading-relaxed text-vantage-muted">{message}</p>
    </div>
  );
}
