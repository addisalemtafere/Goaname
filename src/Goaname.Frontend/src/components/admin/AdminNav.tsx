import type { AdminSection } from '../../context/AdminContext';
import { GoanamePermissions, hasPermission } from '../../api/auth';
import { cn } from '../ui';
import { adminListBtn } from './adminButtons';

export interface AdminNavItem {
  id: AdminSection;
  label: string;
  permission?: string;
}

export interface AdminNavGroup {
  label: string;
  items: AdminNavItem[];
}

export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  {
    label: 'Tenant administration',
    items: [
      { id: 'overview', label: 'Overview', permission: GoanamePermissions.TenantAdmin.Overview },
      { id: 'markets', label: 'Markets', permission: GoanamePermissions.TenantAdmin.Markets },
      { id: 'users', label: 'Users', permission: GoanamePermissions.TenantAdmin.Users },
    ],
  },
  {
    label: 'Identity management',
    items: [{ id: 'roles', label: 'Roles', permission: GoanamePermissions.Platform.Roles }],
  },
  {
    label: 'Platform',
    items: [
      { id: 'tenants', label: 'Tenants', permission: GoanamePermissions.Platform.Tenants },
      { id: 'clients', label: 'OAuth clients', permission: GoanamePermissions.Platform.Clients },
      { id: 'settings', label: 'Settings', permission: GoanamePermissions.Platform.Settings },
    ],
  },
];

const SECTION_META: Record<AdminSection, { title: string; subtitle: string }> = {
  overview: { title: 'Overview', subtitle: 'Platform snapshot for the active tenant' },
  markets: { title: 'Markets', subtitle: 'Create, publish, and resolve markets' },
  users: { title: 'Users', subtitle: 'Accounts, wallets, and compliance' },
  roles: { title: 'Roles', subtitle: 'Super admins, tenant admins, and permissions' },
  tenants: { title: 'Tenants', subtitle: 'Initialize and configure tenants' },
  clients: { title: 'OAuth clients', subtitle: 'OpenIddict applications' },
  settings: { title: 'Settings', subtitle: 'Auth and platform configuration' },
};

export const SECTION_PERMISSIONS: Partial<Record<AdminSection, string>> = ADMIN_NAV_GROUPS.reduce(
  (map, group) => {
    for (const item of group.items) {
      if (item.permission) {
        map[item.id] = item.permission;
      }
    }

    return map;
  },
  {} as Partial<Record<AdminSection, string>>,
);

export function canViewAdminSection(
  section: AdminSection,
  permissions: string[],
): boolean {
  const required = SECTION_PERMISSIONS[section];
  return !required || hasPermission(permissions, required);
}

export function getAdminSectionMeta(section: AdminSection) {
  return SECTION_META[section] ?? SECTION_META.overview;
}

interface AdminNavProps {
  activeSection: AdminSection;
  permissions: string[];
  onNavigate: (section: AdminSection) => void;
}

export function AdminNav({ activeSection, permissions, onNavigate }: AdminNavProps) {
  const groups = ADMIN_NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter(
      (item) => !item.permission || hasPermission(permissions, item.permission),
    ),
  })).filter((group) => group.items.length > 0);

  return (
    <nav className="grid gap-0.5">
      {groups.map((group) => (
        <div key={group.label} className="mb-2">
          <p className="mb-0.5 px-2 py-1 text-[10px] font-medium text-vantage-muted">{group.label}</p>
          <ul className="m-0 list-none space-y-0 p-0">
            {group.items.map((item) => {
              const active = item.id === activeSection;

              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => onNavigate(item.id)}
                    className={adminListBtn(active, 'flex w-full items-center gap-2 rounded-md py-2 pr-2 pl-2.5')}
                  >
                    <NavIcon section={item.id} active={active} />
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function NavIcon({ section, active }: { section: AdminSection; active: boolean }) {
  const className = cn(
    'shrink-0',
    active ? 'text-[var(--admin-nav-active-fg)]' : 'text-vantage-muted',
  );

  switch (section) {
    case 'overview':
      return (
        <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      );
    case 'markets':
      return (
        <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M3 3v18h18" />
          <path d="M7 16l4-8 4 5 5-7" />
        </svg>
      );
    case 'users':
      return (
        <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case 'roles':
      return (
        <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      );
    case 'tenants':
      return (
        <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6" />
        </svg>
      );
    case 'clients':
      return (
        <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <rect x="3" y="11" width="18" height="11" rx="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      );
    case 'settings':
      return (
        <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
      );
    default:
      return null;
  }
}
