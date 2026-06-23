import { useEffect, useState } from 'react';
import { getAppSettings, type AppSettings } from '../../../api/admin';
import { useAdminPageState } from '../../../hooks/useAdminPageState';
import { Alert, DetailRow, PanelSection } from '../../ui';

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
    <div className="grid gap-6">
      {error && <Alert>{error}</Alert>}

      <PanelSection title="Application settings" description="Live platform configuration including role registry snapshot.">
        {loading && !settings ? (
          <p className="m-0 text-sm text-vantage-muted">Loading settings...</p>
        ) : settings ? (
          <div className="grid gap-6">
            <dl className="grid gap-3 sm:grid-cols-2">
              <DetailRow label="SPA client ID" value={settings.spaClientId} />
              <DetailRow label="Token lifetime (hours)" value={String(settings.tokenLifetimeHours)} />
              <DetailRow label="Local auth enabled" value={settings.localAuthEnabled ? 'Yes' : 'No'} />
            </dl>

            <p className="m-0 text-xs text-vantage-muted">
              Manage roles in the Roles section. Values below reflect the live role registry.
            </p>

            <div>
              <p className="m-0 text-sm font-bold text-vantage-fg">Super admin emails</p>
              <ul className="mt-2 grid gap-1 text-sm text-vantage-muted">
                {settings.superAdminEmails.map((email) => (
                  <li key={email}>{email}</li>
                ))}
              </ul>
            </div>

            <div>
              <p className="m-0 text-sm font-bold text-vantage-fg">Tenant admins</p>
              <div className="mt-2 grid gap-3">
                {Object.entries(settings.tenantAdmins).map(([tenantId, emails]) => (
                  <div key={tenantId} className="rounded-xl border border-vantage-border px-3 py-2">
                    <p className="m-0 text-sm font-semibold text-vantage-fg">{tenantId}</p>
                    <p className="m-0 mt-1 text-xs text-vantage-muted">{emails.join(', ') || 'None'}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </PanelSection>
    </div>
  );
}
