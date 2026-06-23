import { GoanameRoles } from '../../api/auth';
import type { RoleRegistry } from '../../api/admin';
import { useAdminContext } from '../../context/AdminContext';
import { Button, Field, Input, Modal } from '../ui';
import { adminControlClass } from './adminLayout';
import type { SystemRole } from './roles/shared';
import { formatAdminEmail } from './roles/shared';

interface RoleAssignmentsModalProps {
  role: SystemRole;
  registry: RoleRegistry | null;
  loading: boolean;
  superAdminEmail: string;
  tenantAdminEmail: string;
  tenantAdminTenantId: string;
  onSuperAdminEmailChange: (value: string) => void;
  onTenantAdminEmailChange: (value: string) => void;
  onTenantAdminTenantIdChange: (value: string) => void;
  onGrantSuperAdmin: () => void;
  onRevokeSuperAdmin: (email: string) => void;
  onGrantTenantAdmin: () => void;
  onRevokeTenantAdmin: (tenant: string, email: string) => void;
  onClose: () => void;
}

export function RoleAssignmentsModal({
  role,
  registry,
  loading,
  superAdminEmail,
  tenantAdminEmail,
  tenantAdminTenantId,
  onSuperAdminEmailChange,
  onTenantAdminEmailChange,
  onTenantAdminTenantIdChange,
  onGrantSuperAdmin,
  onRevokeSuperAdmin,
  onGrantTenantAdmin,
  onRevokeTenantAdmin,
  onClose,
}: RoleAssignmentsModalProps) {
  const { tenantId } = useAdminContext();

  return (
    <Modal open onClose={onClose} maxWidthClass="max-w-lg">
      <div className="rounded-lg border border-vantage-border bg-vantage-surface p-4">
        <div className="mb-4 border-b border-vantage-border pb-3">
          <h3 className="m-0 text-sm font-semibold text-vantage-fg">Edit — {role.name}</h3>
          <p className="m-0 mt-0.5 text-xs text-vantage-muted">
            Assign users by email. Changes apply on next login.
          </p>
        </div>

        {role.key === GoanameRoles.SuperAdmin && (
          <div className="space-y-4">
            <div className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-end">
              <Field label="Email">
                <Input
                  value={superAdminEmail}
                  onChange={(event) => onSuperAdminEmailChange(event.target.value)}
                  placeholder="admin@example.com"
                  className={adminControlClass}
                />
              </Field>
              <Button size="sm" disabled={loading} onClick={onGrantSuperAdmin}>
                Grant
              </Button>
            </div>
            <AssignmentList
              emptyMessage="No super admins assigned."
              items={registry?.superAdminEmails.map((email) => ({
                key: email,
                label: formatAdminEmail(email),
                onRevoke: () => onRevokeSuperAdmin(email),
              })) ?? []}
              loading={loading}
            />
          </div>
        )}

        {role.key === GoanameRoles.TenantAdmin && (
          <div className="space-y-4">
            <div className="grid gap-2 sm:grid-cols-3">
              <Field label="Tenant ID">
                <Input
                  value={tenantAdminTenantId || tenantId}
                  onChange={(event) => onTenantAdminTenantIdChange(event.target.value)}
                  className={adminControlClass}
                />
              </Field>
              <Field label="Email">
                <Input
                  value={tenantAdminEmail}
                  onChange={(event) => onTenantAdminEmailChange(event.target.value)}
                  placeholder="admin@example.com"
                  className={adminControlClass}
                />
              </Field>
              <div className="flex items-end">
                <Button className="w-full" size="sm" disabled={loading} onClick={onGrantTenantAdmin}>
                  Grant
                </Button>
              </div>
            </div>
            <div className="grid gap-2">
              {registry && Object.keys(registry.tenantAdmins).length === 0 && (
                <p className="m-0 text-xs text-vantage-muted">No tenant admins assigned.</p>
              )}
              {registry &&
                Object.entries(registry.tenantAdmins).map(([tenant, emails]) => (
                  <div key={tenant} className="rounded border border-vantage-border p-2.5">
                    <p className="m-0 text-xs font-semibold text-vantage-fg">{tenant}</p>
                    <ul className="m-0 mt-1.5 grid list-none gap-1 p-0">
                      {emails.map((email) => (
                        <li key={email} className="flex items-center justify-between text-xs text-vantage-muted">
                          <span>{formatAdminEmail(email)}</span>
                          <Button
                            variant="secondary"
                            size="sm"
                            disabled={loading}
                            onClick={() => onRevokeTenantAdmin(tenant, email)}
                          >
                            Revoke
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
            </div>
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function AssignmentList({
  emptyMessage,
  items,
  loading,
}: {
  emptyMessage: string;
  items: Array<{ key: string; label: string; onRevoke: () => void }>;
  loading: boolean;
}) {
  if (items.length === 0) {
    return <p className="m-0 text-xs text-vantage-muted">{emptyMessage}</p>;
  }

  return (
    <ul className="m-0 grid list-none gap-1.5 p-0">
      {items.map((item) => (
        <li
          key={item.key}
          className="flex items-center justify-between rounded border border-vantage-border px-2.5 py-1.5 text-xs"
        >
          <span>{item.label}</span>
          <Button variant="secondary" size="sm" disabled={loading} onClick={item.onRevoke}>
            Revoke
          </Button>
        </li>
      ))}
    </ul>
  );
}
