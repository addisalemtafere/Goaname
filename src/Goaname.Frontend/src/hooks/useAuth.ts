import { useCallback, useEffect, useState } from 'react';
import { getAccessToken, login, logout, register } from '../api/auth';
import { getCurrentUser, getWallet, updateCurrency, type UserProfile, type Wallet } from '../api/users';

interface AuthState {
  user: UserProfile | null;
  wallet: Wallet | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    wallet: null,
    loading: true,
    error: null,
  });

  const refresh = useCallback(async () => {
    if (!getAccessToken()) {
      setState({ user: null, wallet: null, loading: false, error: null });
      return;
    }

    setState((current) => ({ ...current, loading: true, error: null }));
    try {
      let user = await getCurrentUser();
      if (user.preferredCurrency.toUpperCase() === 'KES') {
        user = await updateCurrency('USD');
      }
      const wallet = await getWallet();
      setState({ user, wallet, loading: false, error: null });
    } catch (error) {
      setState({
        user: null,
        wallet: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load user',
      });
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const signIn = useCallback(async (email: string, password: string) => {
    await login(email, password);
    await refresh();
  }, [refresh]);

  const signUp = useCallback(async (displayName: string, email: string, password: string) => {
    await register(displayName, email, password);
    await refresh();
  }, [refresh]);

  const signOut = useCallback(() => {
    logout();
    setState({ user: null, wallet: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    isAuthenticated: Boolean(state.user),
    refresh,
    signIn,
    signUp,
    signOut,
  };
}
