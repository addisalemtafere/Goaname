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
import { AdminEmptyAside } from '../AdminPage';
import {
  AdminPageShell,
  AdminPane,
  AdminPaneBody,
  AdminPaneFooter,
  AdminPaneHeader,
  AdminSplitGrid,
  AdminWorkspace,
  adminControlClass,
  adminTextareaClass,
} from '../adminLayout';
import {
  Button,
  DataTable,
  Field,
  Input,
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
  const [isCreating, setIsCreating] = useState(false);

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
    { key: 'clientId', header: 'Client ID', render: (row) => <span className="font-medium">{row.clientId}</span> },
    { key: 'name', header: 'Display name', render: (row) => row.displayName },
    { key: 'type', header: 'Type', render: (row) => row.clientType },
    { key: 'permissions', header: 'Permissions', className: 'tabular-nums', render: (row) => String(row.permissions.length) },
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
      setIsCreating(false);
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

  function startCreate() {
    setSelectedClientId(null);
    setIsCreating(true);
    setForm({ clientId: '', displayName: '', clientType: 'public', redirectUris: [], permissions: [] });
    setRedirectUrisText('');
    setPermissionsText('');
  }

  const showEditor = Boolean(selectedClient) || isCreating;

  return (
    <AdminPageShell
      description="Manage OpenIddict applications used by frontends and integrations."
      error={error}
      message={message}
    >
      <AdminWorkspace>
        <AdminSplitGrid>
          <AdminPane>
            <AdminPaneHeader
              title="OAuth clients"
              description="Select a client to edit or create a new one."
              action={
                <Button variant="secondary" size="sm" onClick={startCreate}>
                  New client
                </Button>
              }
            />
            <AdminPaneBody>
              <DataTable
                columns={columns}
                rows={clients}
                rowKey={(row) => row.clientId}
                selectedKey={selectedClientId}
                onRowClick={(row) => {
                  setIsCreating(false);
                  setSelectedClientId(row.clientId);
                }}
                dense
                emptyMessage="No OAuth clients configured."
              />
            </AdminPaneBody>
          </AdminPane>

          <AdminPane bordered="none">
            {showEditor ? (
              <div className="flex h-full min-h-0 flex-col">
                <AdminPaneHeader
                  title={selectedClient ? `Edit ${selectedClient.clientId}` : 'Create client'}
                  description="Configure client metadata, redirect URIs, and permissions."
                />
                <AdminPaneBody>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Client ID">
                      <Input
                        className={adminControlClass}
                        value={form.clientId}
                        disabled={Boolean(selectedClient)}
                        onChange={(e) => setForm((current) => ({ ...current, clientId: e.target.value }))}
                      />
                    </Field>
                    <Field label="Display name">
                      <Input
                        className={adminControlClass}
                        value={form.displayName}
                        onChange={(e) => setForm((current) => ({ ...current, displayName: e.target.value }))}
                      />
                    </Field>
                  </div>

                  <Field label="Redirect URIs (one per line)" className="mt-3">
                    <textarea
                      className={adminTextareaClass}
                      value={redirectUrisText}
                      onChange={(e) => setRedirectUrisText(e.target.value)}
                    />
                  </Field>

                  <Field label="Permissions (one per line)" className="mt-3">
                    <textarea
                      className={adminTextareaClass}
                      value={permissionsText}
                      onChange={(e) => setPermissionsText(e.target.value)}
                    />
                  </Field>
                </AdminPaneBody>
                <AdminPaneFooter>
                  <div className="flex flex-wrap gap-2">
                    {!selectedClient && (
                      <Button
                        size="sm"
                        disabled={loading || !form.clientId || !form.displayName}
                        onClick={() => void handleCreate()}
                      >
                        Create client
                      </Button>
                    )}
                    {selectedClient && (
                      <>
                        <Button size="sm" disabled={loading} onClick={() => void handleUpdate()}>
                          Save changes
                        </Button>
                        <Button variant="secondary" size="sm" disabled={loading} onClick={() => void handleDelete()}>
                          Delete client
                        </Button>
                      </>
                    )}
                  </div>
                </AdminPaneFooter>
              </div>
            ) : (
              <AdminEmptyAside message="Select a client from the directory or create a new one." />
            )}
          </AdminPane>
        </AdminSplitGrid>
      </AdminWorkspace>
    </AdminPageShell>
  );
}
