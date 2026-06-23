import { useEffect, useState } from 'react';
import { getBackOfficeOverview, type BackOfficeOverview } from '../../../api/admin';
import { useAdminContext } from '../../../context/AdminContext';
import { useAdminPageState } from '../../../hooks/useAdminPageState';
import { AdminPageShell, AdminPane, AdminPaneBody, AdminPaneHeader, AdminSplitGrid, AdminWorkspace } from '../adminLayout';
import { Alert, DetailRow, StatCard } from '../../ui';

export function OverviewPage() {
  const { tenantId } = useAdminContext();
  const { loading, error, run } = useAdminPageState();
  const [overview, setOverview] = useState<BackOfficeOverview | null>(null);

  useEffect(() => {
    void run(async () => {
      const data = await getBackOfficeOverview(tenantId);
      setOverview(data);
      return data;
    });
  }, [tenantId, run]);

  return (
    <AdminPageShell error={error}>
      {loading && !overview ? (
        <p className="m-0 text-xs text-vantage-muted">Loading overview...</p>
      ) : overview ? (
        <AdminWorkspace>
          <div className="border-b border-vantage-border px-4 py-3">
            <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <DetailRow label="Scope" value={tenantId} />
              <DetailRow label="Tenants" value={String(overview.tenantCount)} />
              <DetailRow label="Users in scope" value={String(overview.userCount)} />
              <DetailRow label="OAuth clients" value={String(overview.oauthClientCount ?? 0)} />
            </dl>
          </div>

          <AdminSplitGrid className="min-h-0 lg:grid-cols-1">
            <AdminPane bordered="none">
              <AdminPaneHeader
                title="Key metrics"
                description="Live counts across tenants, users, and OAuth clients."
              />
              <AdminPaneBody>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  <StatCard label="Tenants" value={overview.tenantCount} hint="Initialized platform tenants" />
                  <StatCard label="Users" value={overview.userCount} hint={`Registered in ${tenantId}`} />
                  <StatCard label="OAuth clients" value={overview.oauthClientCount ?? 0} hint="OpenIddict applications" />
                </div>
              </AdminPaneBody>
            </AdminPane>
          </AdminSplitGrid>
        </AdminWorkspace>
      ) : (
        <Alert>No overview data available.</Alert>
      )}
    </AdminPageShell>
  );
}
