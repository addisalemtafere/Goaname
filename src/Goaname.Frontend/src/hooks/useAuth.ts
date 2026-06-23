import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  evaluateCanAccessAdmin,
  clearPermissions,
  getAccessToken,
  getPermissions,
  getRoles,
  GoanameRoles,
  hasPermission as checkPermission,
  login,
  logout,
  register,
  resolvePermissionsForRoles,
  setPermissions,
  setRoles,
} from '../api/auth';
import { getCurrentUser, getWallet, updateCurrency, type UserProfile, type Wallet } from '../api/users';

interface AuthState {
  user: UserProfile | null;
  wallet: Wallet | null;
  roles: string[];
  permissions: string[];
  loading: boolean;
  error: string | null;
}

function resolveRoles(profileRoles?: string[]): string[] {
  if (profileRoles?.length) {
    return profileRoles;
  }

  return getRoles();
}

function hasRole(roles: string[], role: string): boolean {
  return roles.includes(role);
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    wallet: null,
    roles: getRoles(),
    permissions: getPermissions(),
    loading: true,
    error: null,
  });

  const refresh = useCallback(async () => {
    if (!getAccessToken()) {
      setState({ user: null, wallet: null, roles: [], permissions: [], loading: false, error: null });
      return;
    }

    setState((current) => ({ ...current, loading: true, error: null }));
    try {
      let user = await getCurrentUser();
      const roles = resolveRoles(user.roles);
      const permissions = user.permissions?.length
        ? user.permissions
        : resolvePermissionsForRoles(roles.length ? roles : getRoles());
      setRoles(roles);
      setPermissions(permissions);

      if (user.preferredCurrency.toUpperCase() === 'KES') {
        user = await updateCurrency('USD');
      }

      const wallet = await getWallet();
      setState({ user, wallet, roles, permissions, loading: false, error: null });
    } catch (error) {
      const hadToken = Boolean(getAccessToken());
      if (hadToken) {
        logout();
      }

      setState({
        user: null,
        wallet: null,
        roles: [],
        permissions: [],
        loading: false,
        error: hadToken
          ? 'Your session expired. Please sign in again.'
          : error instanceof Error
            ? error.message
            : 'Failed to load account',
      });
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const signIn = useCallback(async (email: string, password: string) => {
    const auth = await login(email, password);
    setRoles(auth.roles ?? []);
    await refresh();
  }, [refresh]);

  const signUp = useCallback(async (displayName: string, email: string, password: string) => {
    const auth = await register(displayName, email, password);
    setRoles(auth.roles ?? []);
    await refresh();
  }, [refresh]);

  const signOut = useCallback(() => {
    logout();
    clearPermissions();
    setState({ user: null, wallet: null, roles: [], permissions: [], loading: false, error: null });
  }, []);

  const roles = state.roles;
  const permissions = state.permissions;
  const access = useMemo(
    () => ({
      isSuperAdmin: hasRole(roles, GoanameRoles.SuperAdmin),
      isTenantAdmin:
        hasRole(roles, GoanameRoles.TenantAdmin) || hasRole(roles, GoanameRoles.SuperAdmin),
      canAccessAdmin: evaluateCanAccessAdmin(roles, permissions),
      hasPermission: (permission: string) => checkPermission(permissions, permission),
    }),
    [roles, permissions],
  );

  return {
    ...state,
    isAuthenticated: Boolean(state.user),
    ...access,
    refresh,
    signIn,
    signUp,
    signOut,
  };
}
