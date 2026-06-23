import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  getPermissionMatrix,
  getRoleRegistry,
  grantSuperAdmin,
  grantTenantAdmin,
  revokeSuperAdmin,
  revokeTenantAdmin,
  type RolePermissionMatrix,
  type RoleRegistry,
} from '../../../api/admin';
import { GoanameRoles } from '../../../api/auth';
import { useAdminContext } from '../../../context/AdminContext';
import { useAdminPageState } from '../../../hooks/useAdminPageState';
import { ActionsMenu } from '../ActionsMenu';
import { RoleAssignmentsModal } from '../RoleAssignmentsModal';
import { RolePermissionsModal } from '../RolePermissionsModal';
import {
  AdminPageShell,
  AdminPane,
  AdminPaneBody,
  AdminPaneHeader,
  AdminWorkspace,
  adminControlClass,
} from '../adminLayout';
import { countRoleAssignments, SYSTEM_ROLES, type SystemRole } from '../roles/shared';
import { Alert, DataTable, Field, Input, type DataTableColumn } from '../../ui';

export function RolesPage() {
  const { tenantId } = useAdminContext();
  const { loading, error, message, run, setError } = useAdminPageState();

  const [registry, setRegistry] = useState<RoleRegistry | null>(null);
  const [matrix, setMatrix] = useState<RolePermissionMatrix | null>(null);
  const [search, setSearch] = useState('');
  const [permissionsRole, setPermissionsRole] = useState<SystemRole | null>(null);
  const [assignmentsRole, setAssignmentsRole] = useState<SystemRole | null>(null);

  const [superAdminEmail, setSuperAdminEmail] = useState('');
  const [tenantAdminEmail, setTenantAdminEmail] = useState('');
  const [tenantAdminTenantId, setTenantAdminTenantId] = useState(tenantId);

  useEffect(() => {
    setTenantAdminTenantId(tenantId);
  }, [tenantId]);

  const refresh = useCallback(async () => {
    const [registryData, matrixData] = await Promise.all([
      getRoleRegistry(),
      getPermissionMatrix(),
    ]);
    setRegistry(registryData);
    setMatrix(matrixData);
  }, []);

  useEffect(() => {
    void run(refresh);
  }, [refresh, run]);

  const filteredRoles = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return SYSTEM_ROLES;
    }

    return SYSTEM_ROLES.filter(
      (role) =>
        role.name.toLowerCase().includes(query) ||
        role.description.toLowerCase().includes(query),
    );
  }, [search]);

  const columns: DataTableColumn<SystemRole>[] = [
    {
      key: 'actions',
      header: 'Actions',
      className: 'w-[110px]',
      render: (row) => (
        <ActionsMenu
          items={[
            { label: 'Permissions', onClick: () => setPermissionsRole(row) },
            {
              label: 'Edit',
              onClick: () => setAssignmentsRole(row),
              hidden: row.key === GoanameRoles.User,
            },
          ]}
        />
      ),
    },
    {
      key: 'name',
      header: 'Role name',
      render: (row) => (
        <div>
          <p className="m-0 text-xs font-semibold text-vantage-fg">{row.name}</p>
          <p className="m-0 mt-0.5 text-[11px] text-vantage-muted">{row.description}</p>
        </div>
      ),
    },
    {
      key: 'users',
      header: 'Users',
      className: 'tabular-nums',
      render: (row) => (
        <span className="text-xs text-vantage-muted">
          {row.key === GoanameRoles.User ? '—' : countRoleAssignments(row.key, registry)}
        </span>
      ),
    },
  ];

  async function handleGrantSuperAdmin() {
    const email = superAdminEmail.trim();
    if (!email) {
      setError('Enter an email address to grant super admin.');
      return;
    }

    await run(async () => {
      const updated = await grantSuperAdmin(email);
      setRegistry(updated);
      setSuperAdminEmail('');
    }, 'Super admin granted. User must sign in again for new token.');
  }

  async function handleRevokeSuperAdmin(email: string) {
    await run(async () => {
      setRegistry(await revokeSuperAdmin(email));
    }, 'Super admin revoked.');
  }

  async function handleGrantTenantAdmin() {
    const email = tenantAdminEmail.trim();
    const scopedTenantId = tenantAdminTenantId.trim();
    if (!scopedTenantId || !email) {
      setError('Enter both tenant ID and email to grant tenant admin.');
      return;
    }

    await run(async () => {
      const updated = await grantTenantAdmin(scopedTenantId, email);
      setRegistry(updated);
      setTenantAdminEmail('');
    }, 'Tenant admin granted. User must sign in again for new token.');
  }

  async function handleRevokeTenantAdmin(tenant: string, email: string) {
    await run(async () => {
      setRegistry(await revokeTenantAdmin(tenant, email));
    }, 'Tenant admin revoked.');
  }

  return (
    <AdminPageShell
      description="System roles, assignments, and permission definitions."
      error={error}
      message={message}
    >
      <Alert variant="info">
        Permissions are defined in code and mapped to roles. Use Actions → Permissions to review grants.
      </Alert>

      <AdminWorkspace>
        <AdminPane bordered="none">
          <AdminPaneHeader
            title="Role directory"
            description="Search and manage system roles."
            action={
              <Field label="Search" className="m-0 min-w-0 sm:w-48">
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search roles..."
                  className={adminControlClass}
                />
              </Field>
            }
          />
          <AdminPaneBody className="p-0">
            <DataTable
              columns={columns}
              rows={filteredRoles}
              rowKey={(row) => row.key}
              emptyMessage="No roles match your search."
              dense
              bordered={false}
            />
          </AdminPaneBody>
        </AdminPane>
      </AdminWorkspace>

      {permissionsRole && matrix && (
        <RolePermissionsModal
          open
          roleKey={permissionsRole.key}
          roleName={permissionsRole.name}
          matrix={matrix}
          onClose={() => setPermissionsRole(null)}
        />
      )}

      {assignmentsRole && (
        <RoleAssignmentsModal
          role={assignmentsRole}
          registry={registry}
          loading={loading}
          superAdminEmail={superAdminEmail}
          tenantAdminEmail={tenantAdminEmail}
          tenantAdminTenantId={tenantAdminTenantId}
          onSuperAdminEmailChange={setSuperAdminEmail}
          onTenantAdminEmailChange={setTenantAdminEmail}
          onTenantAdminTenantIdChange={setTenantAdminTenantId}
          onGrantSuperAdmin={() => void handleGrantSuperAdmin()}
          onRevokeSuperAdmin={(email) => void handleRevokeSuperAdmin(email)}
          onGrantTenantAdmin={() => void handleGrantTenantAdmin()}
          onRevokeTenantAdmin={(tenant, email) => void handleRevokeTenantAdmin(tenant, email)}
          onClose={() => setAssignmentsRole(null)}
        />
      )}
    </AdminPageShell>
  );
}
