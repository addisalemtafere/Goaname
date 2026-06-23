import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { TENANT_ID } from '../api/auth';

const STORAGE_KEY = 'goaname.admin.tenantId';
const THEME_STORAGE_KEY = 'goaname.admin.theme';

export type AdminTheme = 'dark' | 'light';

export type AdminSection =
  | 'overview'
  | 'markets'
  | 'tenants'
  | 'users'
  | 'roles'
  | 'clients'
  | 'settings';

interface AdminContextValue {
  tenantId: string;
  setTenantId: (tenantId: string) => void;
  section: AdminSection;
  setSection: (section: AdminSection) => void;
  theme: AdminTheme;
  setTheme: (theme: AdminTheme) => void;
  toggleTheme: () => void;
}

const AdminContext = createContext<AdminContextValue | null>(null);

function readStoredTenantId(): string {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored?.trim() || TENANT_ID;
}

function readStoredTheme(): AdminTheme {
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === 'dark') {
    return 'dark';
  }

  if (stored === 'light') {
    return 'light';
  }

  return 'light';
}

export function AdminProvider({ children }: { children: ReactNode }) {
  const [tenantId, setTenantIdState] = useState(readStoredTenantId);
  const [section, setSection] = useState<AdminSection>('overview');
  const [theme, setThemeState] = useState<AdminTheme>(readStoredTheme);

  const setTenantId = useCallback((value: string) => {
    const normalized = value.trim();
    if (!normalized) {
      return;
    }

    localStorage.setItem(STORAGE_KEY, normalized);
    setTenantIdState(normalized);
  }, []);

  const setTheme = useCallback((value: AdminTheme) => {
    localStorage.setItem(THEME_STORAGE_KEY, value);
    setThemeState(value);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((current) => {
      const next = current === 'light' ? 'dark' : 'light';
      localStorage.setItem(THEME_STORAGE_KEY, next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ tenantId, setTenantId, section, setSection, theme, setTheme, toggleTheme }),
    [tenantId, setTenantId, section, theme, setTheme, toggleTheme],
  );

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdminContext(): AdminContextValue {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdminContext must be used within AdminProvider');
  }

  return context;
}
