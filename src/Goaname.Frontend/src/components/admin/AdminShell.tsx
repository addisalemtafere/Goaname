import type { UserProfile } from '../../api/users';
import { AdminProvider, useAdminContext, type AdminSection } from '../../context/AdminContext';
import { AdminSidenav } from './AdminSidenav';
import { AdminTopbar } from './AdminTopbar';
import { canViewAdminSection } from './AdminNav';
import { ClientsPage } from './pages/ClientsPage';
import { MarketsPage } from './pages/MarketsPage';
import { OverviewPage } from './pages/OverviewPage';
import { RolesPage } from './pages/RolesPage';
import { SettingsPage } from './pages/SettingsPage';
import { TenantsPage } from './pages/TenantsPage';
import { UsersPage } from './pages/UsersPage';
import { Input, adminContentClass, cn, pageBgClass } from '../ui';

interface AdminShellProps {
  user: UserProfile;
  permissions: string[];
  isSuperAdmin: boolean;
  onBackToSite: () => void;
  onLogout: () => void;
  onMarketsChanged: () => void;
  mobileNavOpen: boolean;
  onMobileNavOpen: () => void;
  onMobileNavClose: () => void;
}

function AdminSectionContent({
  section,
  permissions,
  onMarketsChanged,
}: {
  section: AdminSection;
  permissions: string[];
  onMarketsChanged: () => void;
}) {
  if (!canViewAdminSection(section, permissions)) {
    return <OverviewPage />;
  }

  switch (section) {
    case 'markets':
      return <MarketsPage onMarketsChanged={onMarketsChanged} />;
    case 'tenants':
      return <TenantsPage />;
    case 'users':
      return <UsersPage permissions={permissions} />;
    case 'roles':
      return <RolesPage />;
    case 'clients':
      return <ClientsPage />;
    case 'settings':
      return <SettingsPage />;
    default:
      return <OverviewPage />;
  }
}

function AdminShellInner({
  user,
  permissions,
  isSuperAdmin,
  onBackToSite,
  onLogout,
  onMarketsChanged,
  mobileNavOpen,
  onMobileNavOpen,
  onMobileNavClose,
}: AdminShellProps) {
  const { tenantId, setTenantId, section, setSection, theme } = useAdminContext();

  return (
    <div
      className={cn(
        'admin-shell min-h-screen w-full',
        pageBgClass,
        theme === 'light' && 'admin-shell--light',
      )}
    >
      <AdminSidenav
        user={user}
        tenantId={tenantId}
        permissions={permissions}
        isSuperAdmin={isSuperAdmin}
        activeSection={section}
        onNavigate={setSection}
        onBackToSite={onBackToSite}
        onLogout={onLogout}
        mobileOpen={mobileNavOpen}
        onMobileClose={onMobileNavClose}
        tenantSwitcher={
          <label className="grid gap-1.5">
            <span className="text-[10px] font-semibold tracking-wider text-vantage-muted uppercase">
              Active tenant
            </span>
            <Input
              value={tenantId}
              onChange={(event) => setTenantId(event.target.value)}
              className="h-8 px-2.5 text-xs"
            />
          </label>
        }
      />

      <div className="admin-main flex min-h-screen min-w-0 flex-col">
        <AdminTopbar
          section={section}
          tenantId={tenantId}
          user={user}
          isSuperAdmin={isSuperAdmin}
          onMenuClick={onMobileNavOpen}
        />
        <main
          className={cn(
            adminContentClass,
            'flex-1',
            section === 'markets' && 'px-3 py-2 lg:px-4',
          )}
        >
          <AdminSectionContent
            section={section}
            permissions={permissions}
            onMarketsChanged={onMarketsChanged}
          />
        </main>
      </div>
    </div>
  );
}

export function AdminShell(props: AdminShellProps) {
  return (
    <AdminProvider>
      <AdminShellInner {...props} />
    </AdminProvider>
  );
}
