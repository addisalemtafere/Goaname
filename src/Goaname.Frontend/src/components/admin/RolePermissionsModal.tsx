import { useEffect, useMemo, useRef, useState } from 'react';
import type { RolePermissionMatrix } from '../../api/admin';
import {
  areAllGranted,
  buildPermissionSections,
  countGrantedInSet,
  groupPermissionsByName,
  PERMISSION_DEFINITIONS,
  permissionsEqual,
  toggleAllGrants,
  togglePermissionGrant,
} from '../../api/permissionCatalog';
import { Button, Input, Modal, cn } from '../ui';
import { adminIconBtn, adminListBtn } from './adminButtons';
import { adminControlClass } from './adminLayout';

interface RolePermissionsModalProps {
  open: boolean;
  roleKey: string;
  roleName: string;
  matrix: RolePermissionMatrix;
  onClose: () => void;
}

const MODAL_HEIGHT = 'h-[min(600px,85vh)]';

export function RolePermissionsModal({
  open,
  roleKey,
  roleName,
  matrix,
  onClose,
}: RolePermissionsModalProps) {
  const grantedFromRole = matrix.rolePermissions[roleKey] ?? [];
  const groups = useMemo(() => groupPermissionsByName(matrix.permissions), [matrix.permissions]);

  const [filter, setFilter] = useState('');
  const [activeGroup, setActiveGroup] = useState(groups[0]?.[0] ?? '');
  const [draftGrants, setDraftGrants] = useState<string[]>([]);

  const groupSelectAllRef = useRef<HTMLInputElement>(null);
  const grantAllRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setFilter('');
      setActiveGroup(groups[0]?.[0] ?? '');
      setDraftGrants([...grantedFromRole]);
    }
  }, [open, roleKey, groups, grantedFromRole]);

  const activePermissions = useMemo(() => {
    const groupItems = groups.find(([name]) => name === activeGroup)?.[1] ?? [];
    const query = filter.trim().toLowerCase();
    if (!query) {
      return groupItems;
    }

    return groupItems.filter(
      (item) =>
        item.displayName.toLowerCase().includes(query) ||
        item.name.toLowerCase().includes(query),
    );
  }, [activeGroup, filter, groups]);

  const sections = useMemo(
    () => buildPermissionSections(activePermissions),
    [activePermissions],
  );

  const allGranted = areAllGranted(draftGrants, PERMISSION_DEFINITIONS);
  const allGrantedCount = countGrantedInSet(draftGrants, PERMISSION_DEFINITIONS);
  const groupAllGranted = areAllGranted(draftGrants, activePermissions);
  const groupGrantedCount = countGrantedInSet(draftGrants, activePermissions);
  const hasChanges = !permissionsEqual(draftGrants, grantedFromRole);

  useEffect(() => {
    const node = groupSelectAllRef.current;
    if (node) {
      node.indeterminate = groupGrantedCount > 0 && !groupAllGranted;
    }
  }, [groupGrantedCount, groupAllGranted]);

  useEffect(() => {
    const node = grantAllRef.current;
    if (node) {
      node.indeterminate = allGrantedCount > 0 && !allGranted;
    }
  }, [allGranted, allGrantedCount]);

  function handleTogglePermission(permissionName: string) {
    setDraftGrants((current) => togglePermissionGrant(current, permissionName));
  }

  function handleToggleGroupAll() {
    setDraftGrants((current) => toggleAllGrants(current, activePermissions));
  }

  function handleToggleGrantAll() {
    setDraftGrants((current) => toggleAllGrants(current, PERMISSION_DEFINITIONS));
  }

  function handleReset() {
    setDraftGrants([...grantedFromRole]);
  }

  return (
    <Modal open={open} onClose={onClose} maxWidthClass="max-w-4xl">
      <div
        className={cn(
          'flex w-full flex-col overflow-hidden rounded-lg border border-vantage-border bg-vantage-surface shadow-2xl',
          MODAL_HEIGHT,
        )}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-vantage-border px-4 py-3">
          <h3 className="m-0 text-sm font-semibold text-vantage-fg">Permissions — {roleName}</h3>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className={adminIconBtn}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex shrink-0 items-center gap-3 border-b border-vantage-border px-4 py-3">
          <Input
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            placeholder="Filter permissions..."
            className={cn(adminControlClass, 'min-w-0 flex-1')}
          />
          <label className="flex shrink-0 cursor-pointer items-center gap-2 whitespace-nowrap text-xs text-vantage-fg">
            <span className="hidden sm:inline">Grant all permissions</span>
            <span className="sm:hidden">Grant all</span>
            <input
              ref={grantAllRef}
              type="checkbox"
              checked={allGranted}
              onChange={handleToggleGrantAll}
              className="h-3.5 w-3.5 cursor-pointer rounded border-vantage-border accent-vantage-accent"
            />
          </label>
        </div>

        <div className="flex min-h-0 flex-1 overflow-hidden">
          <aside className="flex w-48 shrink-0 flex-col overflow-hidden border-r border-vantage-border bg-vantage-bg/50 sm:w-52">
            <p className="m-0 shrink-0 px-3 py-2 text-[10px] font-semibold tracking-wider text-vantage-muted uppercase">
              Permission groups
            </p>
            <ul className="m-0 min-h-0 flex-1 list-none space-y-0.5 overflow-y-auto px-2 pb-2">
              {groups.map(([groupName, groupPermissions]) => {
                const groupGranted = areAllGranted(draftGrants, groupPermissions);
                const active = activeGroup === groupName;
                const grantedCount = countGrantedInSet(draftGrants, groupPermissions);

                return (
                  <li key={groupName}>
                    <button
                      type="button"
                      onClick={() => setActiveGroup(groupName)}
                      className={adminListBtn(active, 'flex w-full items-center justify-between gap-2 px-2.5 py-2')}
                    >
                      <span className="truncate">{groupName}</span>
                      <span
                        className={cn(
                          'shrink-0 text-[10px] tabular-nums',
                          active ? 'text-[var(--admin-nav-active-fg)]/80' : 'text-vantage-muted',
                          groupGranted && 'text-vantage-accent',
                        )}
                      >
                        {groupGranted ? '✓' : `${grantedCount}/${groupPermissions.length}`}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </aside>

          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
            <div className="shrink-0 border-b border-vantage-border bg-vantage-surface px-4 py-2.5">
              <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-vantage-fg">
                <input
                  ref={groupSelectAllRef}
                  type="checkbox"
                  checked={groupAllGranted}
                  onChange={handleToggleGroupAll}
                  className="h-3.5 w-3.5 cursor-pointer rounded border-vantage-border accent-vantage-accent"
                />
                Select all in {activeGroup}
              </label>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
              {activePermissions.length === 0 ? (
                <div className="flex h-full min-h-[200px] items-center justify-center">
                  <p className="m-0 text-xs text-vantage-muted">No permissions match your filter.</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {sections.map((section) => (
                    <div key={section.title}>
                      <p className="m-0 mb-2 text-xs font-semibold text-vantage-fg">{section.title}</p>
                      <ul className="m-0 list-none space-y-2.5 p-0">
                        {section.permissions.map((permission) => (
                          <li key={permission.name}>
                            <label className="flex cursor-pointer items-start gap-2.5 rounded-md px-1 py-0.5 text-xs text-vantage-fg transition-colors hover:bg-[var(--color-vantage-hover)]">
                              <input
                                type="checkbox"
                                checked={draftGrants.includes(permission.name)}
                                onChange={() => handleTogglePermission(permission.name)}
                                className="mt-0.5 h-3.5 w-3.5 shrink-0 cursor-pointer rounded border-vantage-border accent-vantage-accent"
                              />
                              <span className="min-w-0">
                                <span className="font-medium">{permission.displayName}</span>
                                <span className="mt-0.5 block font-mono text-[10px] text-vantage-muted">
                                  {permission.name}
                                </span>
                              </span>
                            </label>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-vantage-border px-4 py-3">
          <p className="m-0 min-w-0 text-[11px] text-vantage-muted">
            {hasChanges
              ? 'Preview only — role permissions are defined in code and reset on close.'
              : 'Permissions are defined in code for each role.'}
          </p>
          <div className="flex shrink-0 gap-2">
            {hasChanges && (
              <Button variant="secondary" size="sm" onClick={handleReset}>
                Reset
              </Button>
            )}
            <Button variant="secondary" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
