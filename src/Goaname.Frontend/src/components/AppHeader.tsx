import { formatMoney } from '../api/users';
import type { UserProfile, Wallet } from '../api/users';

interface AppHeaderProps {
  user: UserProfile;
  wallet: Wallet | null;
  onLogout: () => void;
}

export function AppHeader({ user, wallet, onLogout }: AppHeaderProps) {
  const balance = wallet?.balance ?? 0;

  return (
    <header style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 'var(--gn-space-8)',
      gap: 'var(--gn-space-4)',
      flexWrap: 'wrap',
    }}>
      <h1 style={{ color: 'var(--gn-color-primary)', margin: 0 }}>Goaname Markets</h1>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--gn-space-4)' }}>
        <div style={{
          padding: 'var(--gn-space-2) var(--gn-space-4)',
          borderRadius: 'var(--gn-radius-md)',
          border: '1px solid var(--gn-color-success)',
          color: 'var(--gn-color-success)',
          fontWeight: 'var(--gn-font-weight-bold)',
        }}>
          {formatMoney(balance, user.preferredCurrency)}
        </div>

        <div style={{ color: 'var(--gn-color-text-secondary)', fontSize: 'var(--gn-font-size-sm)' }}>
          {user.displayName}
        </div>

        <button type="button" onClick={onLogout} style={{
          backgroundColor: 'transparent',
          color: 'var(--gn-color-text-primary)',
          border: '1px solid var(--gn-border-color)',
          padding: 'var(--gn-space-2) var(--gn-space-4)',
          borderRadius: 'var(--gn-radius-md)',
          cursor: 'pointer',
        }}>
          Logout
        </button>
      </div>
    </header>
  );
}
