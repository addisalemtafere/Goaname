import type { ReactNode } from 'react';
import { Alert, cn } from '../ui';

export const adminControlClass = 'h-8 px-2.5 text-xs';

export const adminTextareaClass =
  'min-h-24 w-full rounded-md border border-vantage-border bg-[var(--color-vantage-control)] px-2.5 py-2 text-xs text-vantage-fg outline-none placeholder:text-vantage-muted focus:border-vantage-accent/50';

interface AdminPageShellProps {
  children: ReactNode;
  description?: string;
  error?: string | null;
  message?: string | null;
}

export function AdminPageShell({ children, description, error, message }: AdminPageShellProps) {
  return (
    <div className="grid gap-3">
      {description && <p className="m-0 text-xs text-vantage-muted">{description}</p>}
      {error && <Alert>{error}</Alert>}
      {message && <Alert variant="accent">{message}</Alert>}
      {children}
    </div>
  );
}

interface AdminWorkspaceProps {
  children: ReactNode;
  className?: string;
}

export function AdminWorkspace({ children, className }: AdminWorkspaceProps) {
  return (
    <div className={cn('admin-panel overflow-hidden rounded-lg border border-vantage-border bg-vantage-surface', className)}>
      {children}
    </div>
  );
}

interface AdminPaneHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function AdminPaneHeader({ title, description, action }: AdminPaneHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-vantage-border px-4 py-2.5">
      <div className="min-w-0">
        <p className="m-0 text-sm font-semibold text-vantage-fg">{title}</p>
        {description && <p className="m-0 mt-0.5 text-xs text-vantage-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}

interface AdminSplitGridProps {
  children: ReactNode;
  className?: string;
}

export function AdminSplitGrid({ children, className }: AdminSplitGridProps) {
  return (
    <div className={cn('grid min-h-[520px] lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]', className)}>
      {children}
    </div>
  );
}

interface AdminPaneProps {
  children: ReactNode;
  className?: string;
  bordered?: 'right' | 'bottom' | 'none';
}

export function AdminPane({ children, className, bordered = 'right' }: AdminPaneProps) {
  return (
    <section
      className={cn(
        'flex min-h-0 min-w-0 flex-col',
        bordered === 'right' && 'border-b border-vantage-border lg:border-r lg:border-b-0',
        bordered === 'bottom' && 'border-b border-vantage-border',
        className,
      )}
    >
      {children}
    </section>
  );
}

export function AdminPaneBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('min-h-0 flex-1 overflow-y-auto p-3', className)}>{children}</div>;
}

export function AdminPaneFooter({ children }: { children: ReactNode }) {
  return <div className="border-t border-vantage-border px-4 py-3">{children}</div>;
}

interface ToggleOptionProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function ToggleOption({ label, checked, onChange }: ToggleOptionProps) {
  return (
    <label
      className={cn(
        'admin-toggle flex cursor-pointer items-center gap-2.5 rounded-md border px-3 py-2.5',
        checked
          ? 'border-vantage-accent/35 bg-[var(--admin-nav-active-bg)]'
          : 'border-vantage-border bg-[var(--color-vantage-control)]',
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 shrink-0 cursor-pointer rounded border-vantage-border accent-vantage-accent"
      />
      <span className="text-xs font-medium text-vantage-fg">{label}</span>
    </label>
  );
}
