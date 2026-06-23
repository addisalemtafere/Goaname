import type { UserProfile } from '../../api/users';
import { IconButton } from '../ui';
import { useAdminContext } from '../../context/AdminContext';
import { getAdminSectionMeta } from './AdminNav';
import type { AdminSection } from '../../context/AdminContext';

interface AdminTopbarProps {
  section: AdminSection;
  tenantId: string;
  user: UserProfile;
  isSuperAdmin: boolean;
  onMenuClick?: () => void;
}

export function AdminTopbar({ section, tenantId, user, isSuperAdmin, onMenuClick }: AdminTopbarProps) {
  const meta = getAdminSectionMeta(section);
  const { theme, toggleTheme } = useAdminContext();

  const initials =
    user.displayName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || 'U';

  return (
    <header className="admin-topbar sticky top-0 z-30 flex h-12 shrink-0 items-center gap-3 border-b border-vantage-border bg-vantage-surface/95 px-4 backdrop-blur-sm">
      {onMenuClick && (
        <IconButton label="Open menu" onClick={onMenuClick} className="shrink-0 lg:hidden">
          <MenuIcon />
        </IconButton>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2 text-[11px] text-vantage-muted">
          <span>Admin</span>
          <span className="text-vantage-muted/40">/</span>
          <span className="truncate">{meta.title}</span>
        </div>
        <h1 className="m-0 truncate text-sm font-semibold text-vantage-fg">{meta.title}</h1>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <span className="hidden rounded-md border border-vantage-border bg-[var(--color-vantage-control)] px-2 py-1 text-[10px] font-semibold tracking-wide text-vantage-muted uppercase sm:inline">
          {tenantId}
        </span>

        <IconButton
          label={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
          onClick={toggleTheme}
          className="shrink-0"
        >
          {theme === 'light' ? <MoonIcon /> : <SunIcon />}
        </IconButton>

        <div
          className="hidden items-center gap-2 rounded-md border border-vantage-border bg-[var(--color-vantage-control)] px-2 py-1 sm:flex"
          title={user.email}
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-vantage-accent/90 text-[9px] font-bold text-white">
            {initials}
          </span>
          <span className="max-w-[7rem] truncate text-xs font-medium text-vantage-fg">{user.displayName}</span>
          <span className="text-[10px] text-vantage-muted">{isSuperAdmin ? 'Super' : 'Admin'}</span>
        </div>
      </div>
    </header>
  );
}

function MenuIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}
