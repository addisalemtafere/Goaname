import type { ReactNode } from 'react';
import type { UserProfile } from '../../api/users';
import { BrandLogo, cn, IconButton } from '../ui';
import type { AdminSection } from '../../context/AdminContext';
import { AdminNav } from './AdminNav';
import { adminGhostBtn, adminOutlineBtn } from './adminButtons';

interface AdminSidenavProps {
  user: UserProfile;
  tenantId: string;
  permissions: string[];
  isSuperAdmin: boolean;
  activeSection: AdminSection;
  onNavigate: (section: AdminSection) => void;
  onBackToSite: () => void;
  onLogout: () => void;
  tenantSwitcher?: ReactNode;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function AdminSidenav({
  user,
  tenantId,
  permissions,
  isSuperAdmin,
  activeSection,
  onNavigate,
  onBackToSite,
  onLogout,
  tenantSwitcher,
  mobileOpen = false,
  onMobileClose,
}: AdminSidenavProps) {
  const initials =
    user.displayName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || 'U';

  function handleNavigate(section: AdminSection) {
    onNavigate(section);
    onMobileClose?.();
  }

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={cn(
          'admin-sidenav fixed inset-y-0 left-0 z-50 flex w-[var(--admin-sidebar-width)] flex-col border-r border-vantage-border bg-vantage-surface transition-transform duration-200',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        <div className="flex items-center justify-between gap-2 border-b border-vantage-border px-3 py-3">
          <BrandLogo admin size="sm" />
          {onMobileClose && <IconButton label="Close menu" onClick={onMobileClose} className="lg:hidden" />}
        </div>

        <div className="border-b border-vantage-border px-3 py-2">
          <button
            type="button"
            onClick={() => {
              onBackToSite();
              onMobileClose?.();
            }}
            className={cn('flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-[11px]', adminGhostBtn)}
          >
            <BackIcon />
            Back to site
          </button>
        </div>

        {tenantSwitcher && (
          <div className="border-b border-vantage-border px-3 py-2.5">{tenantSwitcher}</div>
        )}

        <div className="flex-1 overflow-y-auto px-2 py-2">
          <AdminNav
            activeSection={activeSection}
            permissions={permissions}
            onNavigate={handleNavigate}
          />
        </div>

        <div className="border-t border-vantage-border px-3 py-2.5">
          <div className="flex items-center gap-2 rounded-md px-1 py-1">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-vantage-accent text-[10px] font-bold text-white">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="m-0 truncate text-xs font-semibold text-vantage-fg">{user.displayName}</p>
              <p className="m-0 truncate text-[10px] text-vantage-muted">
                {isSuperAdmin ? 'Super admin' : 'Tenant admin'} · {tenantId}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className={cn('mt-2 w-full px-2 py-1.5 text-[11px]', adminOutlineBtn)}
          >
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}

function BackIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  );
}
