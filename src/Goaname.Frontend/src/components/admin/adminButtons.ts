import { cn } from '../ui';

/** Ghost / text button for admin chrome (nav, back links). */
export const adminGhostBtn =
  'cursor-pointer font-medium text-vantage-muted transition-colors hover:bg-[var(--color-vantage-hover)] hover:text-vantage-fg';

/** Bordered control button (sign out, compact actions). */
export const adminOutlineBtn =
  'cursor-pointer rounded border border-vantage-border bg-[var(--color-vantage-control)] font-medium text-vantage-muted transition-colors hover:border-vantage-muted hover:bg-[var(--color-vantage-control-hover)] hover:text-vantage-fg';

/** Sidebar / modal list item button. */
export function adminListBtn(active: boolean, className?: string) {
  return cn(
    'cursor-pointer rounded text-left text-xs transition-colors',
    active
      ? 'bg-[var(--admin-nav-active-bg)] font-medium text-[var(--admin-nav-active-fg)]'
      : cn(adminGhostBtn, 'text-vantage-muted'),
    className,
  );
}

/** Icon-only close / utility button. */
export const adminIconBtn =
  'cursor-pointer rounded p-1 text-vantage-muted transition-colors hover:bg-[var(--color-vantage-hover)] hover:text-vantage-fg';

/** Dropdown menu item. */
export const adminMenuItemBtn =
  'block w-full cursor-pointer px-3 py-1.5 text-left text-xs text-vantage-fg transition-colors hover:bg-[var(--color-vantage-hover)]';
