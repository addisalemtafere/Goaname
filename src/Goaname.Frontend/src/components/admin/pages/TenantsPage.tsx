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
import {
  Alert,
  Badge,
  Button,
  DataTable,
  Field,
  Input,
  PanelSection,
  Select,
  type DataTableColumn,
} from '../../ui';

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
    { key: 'id', header: 'Tenant', render: (row) => row.tenantId },
    { key: 'name', header: 'Name', render: (row) => row.name },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <Badge variant={row.bettingEnabled ? 'live' : 'draft'}>{row.operationalStatus}</Badge>,
    },
    { key: 'currency', header: 'Currency', render: (row) => row.currency },
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
    }, 'Tenant settings saved.');
  }

  return (
    <div className="grid gap-6">
      {error && <Alert>{error}</Alert>}
      {message && <Alert variant="accent">{message}</Alert>}

      <PanelSection title="Initialize tenant" description="Create a new tenant workspace on the platform.">
        <div className="grid gap-3 md:grid-cols-3">
          <Field label="Tenant ID"><Input value={newTenantId} onChange={(e) => setNewTenantId(e.target.value.trim())} /></Field>
          <Field label="Display name"><Input value={newTenantName} onChange={(e) => setNewTenantName(e.target.value)} /></Field>
          <Field label="Currency"><Input value={newCurrency} onChange={(e) => setNewCurrency(e.target.value.toUpperCase())} /></Field>
        </div>
        <Button className="mt-4" disabled={loading} onClick={() => void handleInitialize()}>Initialize tenant</Button>
      </PanelSection>

      <PanelSection title="Tenant directory" description="Select a tenant to manage platform switches and limits.">
        <DataTable
          columns={columns}
          rows={tenants}
          rowKey={(row) => row.tenantId}
          selectedKey={selectedId}
          onRowClick={(row) => {
            setSelectedId(row.tenantId);
            setTenantId(row.tenantId);
          }}
        />
      </PanelSection>

      {tenant && (
        <PanelSection title={`Configure ${selectedId}`} description="Operational switches, fees, and limits.">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <Field label="Name"><Input value={settings.name ?? ''} onChange={(e) => setSettings((c) => ({ ...c, name: e.target.value }))} /></Field>
            <Field label="Operational status">
              <Select
                value={settings.operationalStatus ?? 'Active'}
                onChange={(e) => setSettings((c) => ({ ...c, operationalStatus: e.target.value as TenantSettings['operationalStatus'] }))}
              >
                <option value="Active">Active</option>
                <option value="Suspended">Suspended</option>
                <option value="Maintenance">Maintenance</option>
              </Select>
            </Field>
            <Field label="Theme key"><Input value={settings.themeKey ?? ''} onChange={(e) => setSettings((c) => ({ ...c, themeKey: e.target.value }))} /></Field>
            <Field label="Platform fee %"><Input type="number" step="0.1" value={settings.platformFeePercent ?? 0} onChange={(e) => setSettings((c) => ({ ...c, platformFeePercent: Number(e.target.value) }))} /></Field>
            <Field label="Max bet"><Input type="number" value={settings.maxBetAmount ?? 0} onChange={(e) => setSettings((c) => ({ ...c, maxBetAmount: Number(e.target.value) }))} /></Field>
            <Field label="Default liquidity"><Input type="number" value={settings.defaultLiquidityParameter ?? 0} onChange={(e) => setSettings((c) => ({ ...c, defaultLiquidityParameter: Number(e.target.value) }))} /></Field>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            {(['bettingEnabled', 'depositsEnabled', 'withdrawalsEnabled'] as const).map((key) => (
              <label key={key} className="flex items-center gap-2 rounded-xl border border-vantage-border px-3 py-2 text-sm">
                <input
                  type="checkbox"
                  checked={settings[key] ?? false}
                  onChange={(e) => setSettings((current) => ({ ...current, [key]: e.target.checked }))}
                />
                <span className="capitalize">{key.replace('Enabled', ' enabled')}</span>
              </label>
            ))}
          </div>

          <Field label="Suspension reason" className="mt-4">
            <Input value={settings.suspensionReason ?? ''} onChange={(e) => setSettings((c) => ({ ...c, suspensionReason: e.target.value }))} />
          </Field>

          <Button className="mt-4" disabled={loading} onClick={() => void handleSaveSettings()}>Save tenant settings</Button>
        </PanelSection>
      )}
    </div>
  );
}
