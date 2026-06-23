import { useEffect, useState } from 'react';
import {
  listAdminTenants,
  updateTenantSettings,
  type TenantSettings,
  type TenantSummary,
} from '../../../api/admin';
import { getTenant, initializeTenant, type TenantDto } from '../../../api/tenants';
import { useAdminContext } from '../../../context/AdminContext';
import { useAdminPageState } from '../../../hooks/useAdminPageState';
import { AdminEmptyAside } from '../AdminPage';
import {
  AdminPageShell,
  AdminPane,
  AdminPaneBody,
  AdminPaneFooter,
  AdminPaneHeader,
  AdminSplitGrid,
  AdminWorkspace,
  ToggleOption,
  adminControlClass,
} from '../adminLayout';
import {
  Badge,
  Button,
  DataTable,
  Field,
  Input,
  PanelSection,
  Select,
  type DataTableColumn,
} from '../../ui';

const TOGGLE_LABELS: Record<'bettingEnabled' | 'depositsEnabled' | 'withdrawalsEnabled', string> = {
  bettingEnabled: 'Betting enabled',
  depositsEnabled: 'Deposits enabled',
  withdrawalsEnabled: 'Withdrawals enabled',
};

export function TenantsPage() {
  const { tenantId, setTenantId } = useAdminContext();
  const { loading, error, message, run } = useAdminPageState();
  const [tenants, setTenants] = useState<TenantSummary[]>([]);
  const [selectedId, setSelectedId] = useState(tenantId);
  const [tenant, setTenant] = useState<TenantDto | null>(null);
  const [newTenantId, setNewTenantId] = useState('demo');
  const [newTenantName, setNewTenantName] = useState('Demo Markets');
  const [newCurrency, setNewCurrency] = useState('USD');
  const [settings, setSettings] = useState<TenantSettings>({});
  const [showInitialize, setShowInitialize] = useState(false);

  async function refreshTenants() {
    const data = await listAdminTenants();
    setTenants(data);
  }

  async function loadTenant(id: string) {
    const data = await getTenant(id);
    setTenant(data);
    setSettings({
      name: data.name,
      operationalStatus: data.operationalStatus,
      bettingEnabled: data.bettingEnabled,
      depositsEnabled: data.depositsEnabled,
      withdrawalsEnabled: data.withdrawalsEnabled,
      platformFeePercent: data.platformFeePercent,
      maxBetAmount: data.maxBetAmount,
      defaultLiquidityParameter: data.defaultLiquidityParameter,
      themeKey: data.themeKey ?? '',
      suspensionReason: data.suspensionReason ?? '',
    });
  }

  useEffect(() => {
    setSelectedId(tenantId);
  }, [tenantId]);

  useEffect(() => {
    void run(async () => {
      await refreshTenants();
      await loadTenant(selectedId);
    });
  }, [selectedId, run]);

  const columns: DataTableColumn<TenantSummary>[] = [
    { key: 'id', header: 'Tenant', render: (row) => <span className="font-medium">{row.tenantId}</span> },
    { key: 'name', header: 'Name', render: (row) => row.name },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <Badge variant={row.bettingEnabled ? 'live' : 'draft'}>{row.operationalStatus}</Badge>,
    },
    { key: 'currency', header: 'Currency', className: 'tabular-nums', render: (row) => row.currency },
  ];

  async function handleInitialize() {
    const result = await run(async () => {
      const created = await initializeTenant({ name: newTenantName, currency: newCurrency }, newTenantId);
      await refreshTenants();
      setSelectedId(created.tenantId);
      setTenantId(created.tenantId);
      return created;
    }, `Tenant "${newTenantId}" initialized.`);

    if (result) {
      setTenant(result);
      setShowInitialize(false);
    }
  }

  async function handleSaveSettings() {
    await run(async () => {
      await updateTenantSettings(selectedId, {
        ...settings,
        themeKey: settings.themeKey || null,
        suspensionReason: settings.suspensionReason || null,
      });
      await loadTenant(selectedId);
      await refreshTenants();
    }, 'Tenant settings saved.');
  }

  function selectTenant(id: string) {
    setSelectedId(id);
    setTenantId(id);
  }

  return (
    <AdminPageShell
      description="Manage platform tenants, operational switches, and limits."
      error={error}
      message={message}
    >
      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button variant="secondary" size="sm" onClick={() => setShowInitialize((value) => !value)}>
          {showInitialize ? 'Hide initialize' : 'Initialize tenant'}
        </Button>
      </div>

      {showInitialize && (
        <PanelSection title="Initialize tenant" description="Create a new tenant workspace on the platform.">
          <div className="grid gap-3 md:grid-cols-3">
            <Field label="Tenant ID">
              <Input className={adminControlClass} value={newTenantId} onChange={(e) => setNewTenantId(e.target.value.trim())} />
            </Field>
            <Field label="Display name">
              <Input className={adminControlClass} value={newTenantName} onChange={(e) => setNewTenantName(e.target.value)} />
            </Field>
            <Field label="Currency">
              <Input className={adminControlClass} value={newCurrency} onChange={(e) => setNewCurrency(e.target.value.toUpperCase())} />
            </Field>
          </div>
          <Button className="mt-3" size="sm" disabled={loading} onClick={() => void handleInitialize()}>
            Initialize tenant
          </Button>
        </PanelSection>
      )}

      <AdminWorkspace>
        <AdminSplitGrid>
          <AdminPane>
            <AdminPaneHeader title="Tenant directory" description="Select a tenant to configure." />
            <AdminPaneBody>
              <DataTable
                columns={columns}
                rows={tenants}
                rowKey={(row) => row.tenantId}
                selectedKey={selectedId}
                onRowClick={(row) => selectTenant(row.tenantId)}
                dense
              />
            </AdminPaneBody>
          </AdminPane>

          <AdminPane bordered="none">
            {tenant ? (
              <div className="flex h-full min-h-0 flex-col">
                <AdminPaneHeader
                  title={`Configure ${selectedId}`}
                  description="Operational switches, fees, and limits."
                />
                <AdminPaneBody>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Name">
                      <Input className={adminControlClass} value={settings.name ?? ''} onChange={(e) => setSettings((c) => ({ ...c, name: e.target.value }))} />
                    </Field>
                    <Field label="Operational status">
                      <Select
                        className={adminControlClass}
                        value={settings.operationalStatus ?? 'Active'}
                        onChange={(e) => setSettings((c) => ({ ...c, operationalStatus: e.target.value as TenantSettings['operationalStatus'] }))}
                      >
                        <option value="Active">Active</option>
                        <option value="Suspended">Suspended</option>
                        <option value="Maintenance">Maintenance</option>
                      </Select>
                    </Field>
                    <Field label="Theme key">
                      <Input className={adminControlClass} value={settings.themeKey ?? ''} onChange={(e) => setSettings((c) => ({ ...c, themeKey: e.target.value }))} />
                    </Field>
                    <Field label="Platform fee %">
                      <Input className={adminControlClass} type="number" step="0.1" value={settings.platformFeePercent ?? 0} onChange={(e) => setSettings((c) => ({ ...c, platformFeePercent: Number(e.target.value) }))} />
                    </Field>
                    <Field label="Max bet">
                      <Input className={adminControlClass} type="number" value={settings.maxBetAmount ?? 0} onChange={(e) => setSettings((c) => ({ ...c, maxBetAmount: Number(e.target.value) }))} />
                    </Field>
                    <Field label="Default liquidity">
                      <Input className={adminControlClass} type="number" value={settings.defaultLiquidityParameter ?? 0} onChange={(e) => setSettings((c) => ({ ...c, defaultLiquidityParameter: Number(e.target.value) }))} />
                    </Field>
                  </div>

                  <div className="mt-4 grid gap-2 sm:grid-cols-3">
                    {(['bettingEnabled', 'depositsEnabled', 'withdrawalsEnabled'] as const).map((key) => (
                      <ToggleOption
                        key={key}
                        label={TOGGLE_LABELS[key]}
                        checked={settings[key] ?? false}
                        onChange={(checked) => setSettings((current) => ({ ...current, [key]: checked }))}
                      />
                    ))}
                  </div>

                  <Field label="Suspension reason" className="mt-4">
                    <Input className={adminControlClass} value={settings.suspensionReason ?? ''} onChange={(e) => setSettings((c) => ({ ...c, suspensionReason: e.target.value }))} />
                  </Field>
                </AdminPaneBody>
                <AdminPaneFooter>
                  <Button size="sm" disabled={loading} onClick={() => void handleSaveSettings()}>
                    Save tenant settings
                  </Button>
                </AdminPaneFooter>
              </div>
            ) : (
              <AdminEmptyAside message="Select a tenant from the directory to configure settings." />
            )}
          </AdminPane>
        </AdminSplitGrid>
      </AdminWorkspace>
    </AdminPageShell>
  );
}
