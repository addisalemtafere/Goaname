import { useEffect, useState } from 'react';
import { getAppSettings, type AppSettings } from '../../../api/admin';
import { useAdminPageState } from '../../../hooks/useAdminPageState';
import {
  AdminPageShell,
  AdminPane,
  AdminPaneBody,
  AdminPaneHeader,
  AdminSplitGrid,
  AdminWorkspace,
} from '../adminLayout';
import { Alert, DetailRow } from '../../ui';

export function SettingsPage() {
  const { loading, error, run } = useAdminPageState();
  const [settings, setSettings] = useState<AppSettings | null>(null);

  useEffect(() => {
    void run(async () => {
      const data = await getAppSettings();
      setSettings(data);
      return data;
    });
  }, [run]);

  return (
    <AdminPageShell
      description="Live platform configuration including role registry snapshot."
      error={error}
    >
      {loading && !settings ? (
        <p className="m-0 text-xs text-vantage-muted">Loading settings...</p>
      ) : settings ? (
        <AdminWorkspace>
          <AdminSplitGrid>
            <AdminPane>
              <AdminPaneHeader title="Application" description="Auth and token configuration." />
              <AdminPaneBody>
                <dl className="grid gap-3 sm:grid-cols-2">
                  <DetailRow label="SPA client ID" value={settings.spaClientId} />
                  <DetailRow label="Token lifetime (hours)" value={String(settings.tokenLifetimeHours)} />
                  <DetailRow label="Local auth enabled" value={settings.localAuthEnabled ? 'Yes' : 'No'} />
                </dl>
                <p className="mt-4 mb-0 text-xs text-vantage-muted">
                  Manage roles in the Roles section. Values below reflect the live role registry.
                </p>
              </AdminPaneBody>
            </AdminPane>

            <AdminPane bordered="none">
              <AdminPaneHeader title="Role assignments" description="Super admins and tenant-scoped admins." />
              <AdminPaneBody className="space-y-4">
                <div>
                  <p className="m-0 text-xs font-semibold text-vantage-fg">Super admin emails</p>
                  <ul className="mt-2 grid gap-1 text-xs text-vantage-muted">
                    {settings.superAdminEmails.length > 0 ? (
                      settings.superAdminEmails.map((email) => <li key={email}>{email}</li>)
                    ) : (
                      <li>None configured</li>
                    )}
                  </ul>
                </div>

                <div>
                  <p className="m-0 text-xs font-semibold text-vantage-fg">Tenant admins</p>
                  <div className="mt-2 grid gap-2">
                    {Object.entries(settings.tenantAdmins).map(([tenantId, emails]) => (
                      <div key={tenantId} className="rounded-md border border-vantage-border px-3 py-2">
                        <p className="m-0 text-xs font-semibold text-vantage-fg">{tenantId}</p>
                        <p className="m-0 mt-1 text-xs text-vantage-muted">{emails.join(', ') || 'None'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </AdminPaneBody>
            </AdminPane>
          </AdminSplitGrid>
        </AdminWorkspace>
      ) : (
        <Alert>Settings unavailable.</Alert>
      )}
    </AdminPageShell>
  );
}
