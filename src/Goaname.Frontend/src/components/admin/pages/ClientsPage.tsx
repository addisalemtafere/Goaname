import { useEffect, useState } from 'react';
import {
  createOAuthClient,
  deleteOAuthClient,
  listOAuthClients,
  updateOAuthClient,
  type CreateOAuthClientRequest,
  type OAuthClient,
} from '../../../api/admin';
import { useAdminPageState } from '../../../hooks/useAdminPageState';
import {
  Alert,
  Button,
  DataTable,
  Field,
  Input,
  PanelSection,
  type DataTableColumn,
} from '../../ui';

export function ClientsPage() {
  const { loading, error, message, run } = useAdminPageState();
  const [clients, setClients] = useState<OAuthClient[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [form, setForm] = useState<CreateOAuthClientRequest>({
    clientId: '',
    displayName: '',
    clientType: 'public',
    redirectUris: [],
    permissions: [],
  });
  const [redirectUrisText, setRedirectUrisText] = useState('');
  const [permissionsText, setPermissionsText] = useState('');

  async function refreshClients() {
    const data = await listOAuthClients();
    setClients(data);
  }

  useEffect(() => {
    void run(refreshClients);
  }, [run]);

  const selectedClient = clients.find((client) => client.clientId === selectedClientId) ?? null;

  useEffect(() => {
    if (!selectedClient) {
      return;
    }

    setForm({
      clientId: selectedClient.clientId,
      displayName: selectedClient.displayName,
      clientType: selectedClient.clientType,
      redirectUris: selectedClient.redirectUris,
      permissions: selectedClient.permissions,
    });
    setRedirectUrisText(selectedClient.redirectUris.join('\n'));
    setPermissionsText(selectedClient.permissions.join('\n'));
  }, [selectedClient]);

  const columns: DataTableColumn<OAuthClient>[] = [
    { key: 'clientId', header: 'Client ID', render: (row) => row.clientId },
    { key: 'name', header: 'Display name', render: (row) => row.displayName },
    { key: 'type', header: 'Type', render: (row) => row.clientType },
    { key: 'permissions', header: 'Permissions', render: (row) => String(row.permissions.length) },
  ];

  async function handleCreate() {
    const payload: CreateOAuthClientRequest = {
      clientId: form.clientId.trim(),
      displayName: form.displayName.trim(),
      clientType: form.clientType,
      redirectUris: redirectUrisText.split('\n').map((line) => line.trim()).filter(Boolean),
      permissions: permissionsText.split('\n').map((line) => line.trim()).filter(Boolean),
    };

    await run(async () => {
      await createOAuthClient(payload);
      await refreshClients();
      setSelectedClientId(payload.clientId);
      setForm({ clientId: '', displayName: '', clientType: 'public', redirectUris: [], permissions: [] });
      setRedirectUrisText('');
      setPermissionsText('');
    }, 'OAuth client created.');
  }

  async function handleUpdate() {
    if (!selectedClientId) {
      return;
    }

    await run(async () => {
      await updateOAuthClient(selectedClientId, {
        displayName: form.displayName.trim(),
        redirectUris: redirectUrisText.split('\n').map((line) => line.trim()).filter(Boolean),
        permissions: permissionsText.split('\n').map((line) => line.trim()).filter(Boolean),
      });
      await refreshClients();
    }, 'OAuth client updated.');
  }

  async function handleDelete() {
    if (!selectedClientId) {
      return;
    }

    await run(async () => {
      await deleteOAuthClient(selectedClientId);
      setSelectedClientId(null);
      await refreshClients();
    }, 'OAuth client deleted.');
  }

  return (
    <div className="grid gap-6">
      {error && <Alert>{error}</Alert>}
      {message && <Alert variant="accent">{message}</Alert>}

      <PanelSection title="OAuth clients" description="Manage OpenIddict applications used by frontends and integrations.">
        <DataTable
          columns={columns}
          rows={clients}
          rowKey={(row) => row.clientId}
          selectedKey={selectedClientId}
          onRowClick={(row) => setSelectedClientId(row.clientId)}
        />
      </PanelSection>

      <PanelSection title={selectedClient ? `Edit ${selectedClient.clientId}` : 'Create client'} description="Configure client metadata, redirect URIs, and permissions.">
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Client ID">
            <Input
              value={form.clientId}
              disabled={Boolean(selectedClient)}
              onChange={(e) => setForm((current) => ({ ...current, clientId: e.target.value }))}
            />
          </Field>
          <Field label="Display name">
            <Input value={form.displayName} onChange={(e) => setForm((current) => ({ ...current, displayName: e.target.value }))} />
          </Field>
        </div>

        <Field label="Redirect URIs (one per line)" className="mt-3">
          <textarea
            className="min-h-24 w-full rounded-xl border border-vantage-border bg-vantage-bg px-3 py-2 text-sm text-vantage-fg"
            value={redirectUrisText}
            onChange={(e) => setRedirectUrisText(e.target.value)}
          />
        </Field>

        <Field label="Permissions (one per line)" className="mt-3">
          <textarea
            className="min-h-24 w-full rounded-xl border border-vantage-border bg-vantage-bg px-3 py-2 text-sm text-vantage-fg"
            value={permissionsText}
            onChange={(e) => setPermissionsText(e.target.value)}
          />
        </Field>

        <div className="mt-4 flex flex-wrap gap-2">
          {!selectedClient && (
            <Button disabled={loading || !form.clientId || !form.displayName} onClick={() => void handleCreate()}>
              Create client
            </Button>
          )}
          {selectedClient && (
            <>
              <Button disabled={loading} onClick={() => void handleUpdate()}>Save changes</Button>
              <Button variant="secondary" disabled={loading} onClick={() => void handleDelete()}>Delete client</Button>
              <Button variant="secondary" onClick={() => setSelectedClientId(null)}>Create new</Button>
            </>
          )}
        </div>
      </PanelSection>
    </div>
  );
}
