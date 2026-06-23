import { useEffect, useMemo, useState } from 'react';
import {
  adjustUserWallet,
  getAdminUser,
  grantTenantAdminForTenant,
  listAdminUsers,
  revokeTenantAdminForTenant,
  setUserKycStatus,
  type AdminUser,
  type KycStatus,
  type UserSummary,
} from '../../../api/admin';
import { getEffectiveRole, GoanamePermissions, GoanameRoles, hasPermission, isPlayerRole } from '../../../api/auth';
import { useAdminContext } from '../../../context/AdminContext';
import { useAdminPageState } from '../../../hooks/useAdminPageState';
import { AdminEmptyAside } from '../AdminPage';
import {
  AdminPageShell,
  AdminPane,
  AdminPaneBody,
  AdminPaneHeader,
  AdminSplitGrid,
  AdminWorkspace,
  adminControlClass,
} from '../adminLayout';
import { formatAdminEmail } from '../roles/shared';
import {
  AdminMoney,
  Alert,
  Badge,
  Button,
  DataTable,
  DetailRow,
  Field,
  Input,
  Select,
  type DataTableColumn,
} from '../../ui';

interface UsersPageProps {
  permissions: string[];
}

const DEPOSIT_PRESETS = [10, 50, 100, 500] as const;
const PAGE_SIZE = 10;

type RoleFilter = 'all' | 'player' | 'tenantAdmin' | 'superAdmin';

function roleBadgeVariant(role: string): 'live' | 'draft' | 'accent' {
  if (role === GoanameRoles.SuperAdmin) {
    return 'live';
  }
  if (role === GoanameRoles.TenantAdmin) {
    return 'draft';
  }
  return 'accent';
}

function roleLabel(role: string): string {
  if (role === GoanameRoles.User) {
    return 'Player';
  }

  return role;
}

function matchesRoleFilter(role: string, filter: RoleFilter): boolean {
  if (filter === 'all') {
    return true;
  }
  if (filter === 'player') {
    return role === GoanameRoles.User;
  }
  if (filter === 'tenantAdmin') {
    return role === GoanameRoles.TenantAdmin;
  }
  return role === GoanameRoles.SuperAdmin;
}

export function UsersPage({ permissions }: UsersPageProps) {
  const { tenantId } = useAdminContext();
  const { loading, error, message, run } = useAdminPageState();
  const canAdjustWallet = hasPermission(permissions, GoanamePermissions.TenantAdmin.UsersAdjustWallet);
  const canSetKyc = hasPermission(permissions, GoanamePermissions.TenantAdmin.UsersSetKyc);
  const canGrantAdmin = hasPermission(permissions, GoanamePermissions.TenantAdmin.UsersGrantAdmin);
  const canManageUsers = canAdjustWallet || canSetKyc || canGrantAdmin;
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [page, setPage] = useState(1);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [adjustAmount, setAdjustAmount] = useState('100');
  const [kycStatus, setKycStatus] = useState<KycStatus>('Verified');

  async function refreshUsers() {
    const data = await listAdminUsers(tenantId);
    setUsers(data);
  }

  async function loadUser(userId: string) {
    const data = await getAdminUser(tenantId, userId);
    setSelectedUser(data);
    setKycStatus(data.kycStatus);
  }

  useEffect(() => {
    void run(refreshUsers);
  }, [tenantId, run]);

  useEffect(() => {
    setPage(1);
    setSelectedUserId(null);
    setSelectedUser(null);
  }, [search, roleFilter, tenantId]);

  useEffect(() => {
    if (!selectedUserId) {
      setSelectedUser(null);
      return;
    }

    let cancelled = false;
    void getAdminUser(tenantId, selectedUserId)
      .then((data) => {
        if (!cancelled) {
          setSelectedUser(data);
          setKycStatus(data.kycStatus);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSelectedUser(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [selectedUserId, tenantId]);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return users.filter((user) => {
      const role = getEffectiveRole(user.roles);
      if (!matchesRoleFilter(role, roleFilter)) {
        return false;
      }

      if (!query) {
        return true;
      }

      return (
        user.displayName.toLowerCase().includes(query) ||
        formatAdminEmail(user.email).includes(query)
      );
    });
  }, [users, search, roleFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedUsers = filteredUsers.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const columns: DataTableColumn<UserSummary>[] = [
    {
      key: 'name',
      header: 'User name',
      render: (row) => <span className="font-medium">{row.displayName}</span>,
    },
    {
      key: 'email',
      header: 'Email address',
      render: (row) => <span className="text-vantage-muted">{formatAdminEmail(row.email)}</span>,
    },
    {
      key: 'roles',
      header: 'Roles',
      render: (row) => {
        const role = getEffectiveRole(row.roles);
        return <Badge variant={roleBadgeVariant(role)}>{roleLabel(role)}</Badge>;
      },
    },
    {
      key: 'balance',
      header: 'Balance',
      className: 'text-right tabular-nums',
      render: (row) => (
        <AdminMoney amount={row.balance} currency={row.currency} className="text-xs" />
      ),
    },
    {
      key: 'kyc',
      header: 'KYC',
      render: (row) => (
        <Badge variant={row.kycStatus === 'Verified' ? 'live' : 'draft'}>{row.kycStatus}</Badge>
      ),
    },
  ];

  async function handleAdjustWallet(amount = Number(adjustAmount)) {
    if (!selectedUserId) {
      return;
    }

    if (!Number.isFinite(amount) || amount === 0) {
      return;
    }

    await run(async () => {
      await adjustUserWallet(tenantId, selectedUserId, amount);
      await refreshUsers();
      await loadUser(selectedUserId);
    }, amount > 0 ? 'Deposit applied.' : 'Wallet adjusted.');
  }

  async function handleSetKyc() {
    if (!selectedUserId) {
      return;
    }

    await run(async () => {
      const updated = await setUserKycStatus(tenantId, selectedUserId, kycStatus);
      setSelectedUser(updated);
      await refreshUsers();
    }, 'KYC status updated.');
  }

  const selectedRole = selectedUser ? getEffectiveRole(selectedUser.roles) : GoanameRoles.User;
  const selectedIsPlayer = selectedUser ? isPlayerRole(selectedUser.roles) : false;
  const selectedIsTenantAdmin = selectedRole === GoanameRoles.TenantAdmin;
  const selectedIsSuperAdmin = selectedRole === GoanameRoles.SuperAdmin;

  async function handleGrantTenantAdminRole() {
    if (!selectedUser) {
      return;
    }

    await run(async () => {
      await grantTenantAdminForTenant(tenantId, selectedUser.email);
      await refreshUsers();
      if (selectedUserId) {
        await loadUser(selectedUserId);
      }
    }, 'Tenant admin granted. User must sign in again.');
  }

  async function handleRevokeTenantAdminRole() {
    if (!selectedUser) {
      return;
    }

    await run(async () => {
      await revokeTenantAdminForTenant(tenantId, selectedUser.email);
      await refreshUsers();
      if (selectedUserId) {
        await loadUser(selectedUserId);
      }
    }, 'Tenant admin revoked.');
  }

  return (
    <AdminPageShell
      description={`Manage user accounts for tenant ${tenantId} — wallets, KYC, and admin roles.`}
      error={error}
      message={message}
    >
      {!canManageUsers && (
        <Alert variant="info">You have read-only access to the user directory.</Alert>
      )}

      <AdminWorkspace>
        <AdminSplitGrid>
          <AdminPane>
            <AdminPaneHeader title="User directory" description="Search and select a user to manage." />
            <AdminPaneBody className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Search" className="min-w-0">
                  <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search by name or email..."
                    className={adminControlClass}
                  />
                </Field>
                <Field label="Role" className="min-w-0">
                  <Select
                    value={roleFilter}
                    onChange={(event) => setRoleFilter(event.target.value as RoleFilter)}
                    className={adminControlClass}
                  >
                    <option value="all">All roles</option>
                    <option value="player">Players</option>
                    <option value="tenantAdmin">Tenant admins</option>
                    <option value="superAdmin">Super admins</option>
                  </Select>
                </Field>
              </div>

              <DataTable
                columns={columns}
                rows={pagedUsers}
                rowKey={(row) => row.userId}
                selectedKey={selectedUserId}
                onRowClick={(row) => setSelectedUserId(row.userId)}
                emptyMessage="No users match your search."
                dense
              />

              {filteredUsers.length > PAGE_SIZE && (
                <div className="flex items-center justify-between border-t border-vantage-border pt-2 text-xs">
                  <span className="text-vantage-muted">
                    {filteredUsers.length} user{filteredUsers.length === 1 ? '' : 's'}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={currentPage <= 1}
                      onClick={() => setPage((value) => Math.max(1, value - 1))}
                    >
                      Previous
                    </Button>
                    <span className="text-vantage-muted">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={currentPage >= totalPages}
                      onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </AdminPaneBody>
          </AdminPane>

          <AdminPane bordered="none">
            {selectedUser ? (
              <div className="flex h-full min-h-0 flex-col">
                <AdminPaneHeader
                  title={selectedUser.displayName}
                  description={`${roleLabel(selectedRole)} · ${formatAdminEmail(selectedUser.email)}`}
                />
                <AdminPaneBody>
                  <dl className="grid gap-x-4 gap-y-3 sm:grid-cols-2">
                    <DetailRow label="User ID" value={selectedUser.userId} />
                    <DetailRow label="Role" value={roleLabel(selectedRole)} />
                    <DetailRow
                      label="Balance"
                      value={<AdminMoney amount={selectedUser.balance} currency={selectedUser.preferredCurrency} />}
                    />
                    <DetailRow
                      label="Total deposited"
                      value={<AdminMoney amount={selectedUser.totalDeposited} currency={selectedUser.preferredCurrency} />}
                    />
                    <DetailRow label="KYC" value={selectedUser.kycStatus} />
                  </dl>

                  {selectedIsPlayer && canAdjustWallet ? (
                    <div className="mt-5 space-y-3 border-t border-vantage-border pt-4">
                      <Field label="Deposit amount">
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={adjustAmount}
                            onChange={(event) => setAdjustAmount(event.target.value)}
                            className={adminControlClass}
                          />
                          <Button size="sm" disabled={loading} onClick={() => void handleAdjustWallet()}>
                            Deposit
                          </Button>
                        </div>
                      </Field>
                      <div className="flex flex-wrap gap-2">
                        {DEPOSIT_PRESETS.map((preset) => (
                          <Button
                            key={preset}
                            variant="secondary"
                            size="sm"
                            disabled={loading}
                            onClick={() => {
                              setAdjustAmount(String(preset));
                              void handleAdjustWallet(preset);
                            }}
                          >
                            +{preset}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ) : selectedIsPlayer ? (
                    <Alert variant="accent" className="mt-5">
                      You do not have permission to adjust player wallets.
                    </Alert>
                  ) : (
                    <Alert variant="accent" className="mt-5">
                      Wallet deposits apply to player accounts only.
                    </Alert>
                  )}

                  {canSetKyc && (
                    <div className="mt-4 grid gap-2">
                      <Field label="KYC status">
                        <div className="flex gap-2">
                          <Select
                            value={kycStatus}
                            onChange={(event) => setKycStatus(event.target.value as KycStatus)}
                            className={adminControlClass}
                          >
                            <option value="NotStarted">Not started</option>
                            <option value="Pending">Pending</option>
                            <option value="Verified">Verified</option>
                          </Select>
                          <Button variant="secondary" size="sm" disabled={loading} onClick={() => void handleSetKyc()}>
                            Update
                          </Button>
                        </div>
                      </Field>
                    </div>
                  )}

                  {canGrantAdmin && !selectedIsSuperAdmin && (
                    <div className="mt-5 flex flex-wrap gap-2 border-t border-vantage-border pt-4">
                      {!selectedIsTenantAdmin ? (
                        <Button size="sm" disabled={loading} onClick={() => void handleGrantTenantAdminRole()}>
                          Grant tenant admin
                        </Button>
                      ) : (
                        <Button variant="secondary" size="sm" disabled={loading} onClick={() => void handleRevokeTenantAdminRole()}>
                          Revoke tenant admin
                        </Button>
                      )}
                    </div>
                  )}
                </AdminPaneBody>
              </div>
            ) : selectedUserId ? (
              <AdminPaneBody>
                <p className="m-0 text-xs text-vantage-muted">Loading user...</p>
              </AdminPaneBody>
            ) : (
              <AdminEmptyAside message="Select a user from the directory to view details and manage wallet, KYC, or roles." />
            )}
          </AdminPane>
        </AdminSplitGrid>
      </AdminWorkspace>
    </AdminPageShell>
  );
}
