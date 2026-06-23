import { useEffect, useState } from 'react';
import { getBackOfficeOverview, type BackOfficeOverview } from '../../../api/admin';
import { useAdminContext } from '../../../context/AdminContext';
import { useAdminPageState } from '../../../hooks/useAdminPageState';
import { AdminPage } from '../AdminPage';
import { Alert, StatCard } from '../../ui';

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
    <AdminPage title="Overview" description={`Platform snapshot for tenant ${tenantId}.`}>
      {error && <Alert>{error}</Alert>}

      {loading && !overview ? (
        <p className="m-0 text-sm text-vantage-muted">Loading overview...</p>
      ) : overview ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Tenants" value={overview.tenantCount} hint="Initialized platform tenants" />
          <StatCard label="Users" value={overview.userCount} hint={`Registered in ${tenantId}`} />
          <StatCard label="OAuth clients" value={overview.oauthClientCount} hint="OpenIddict applications" />
          <StatCard label="Active tenant" value={overview.activeTenantId} hint="Current admin scope" />
        </div>
      ) : null}
    </AdminPage>
  );
}
