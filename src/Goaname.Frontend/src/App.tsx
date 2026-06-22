import { useEffect } from 'react';
import { AuthPanel } from './components/AuthPanel';
import { AppHeader } from './components/AppHeader';
import { useAuth } from './hooks/useAuth';
import { mockMarkets } from './data/mockMarkets';
import { TENANT_ID } from './api/users';

async function ensureDemoTenant() {
  await fetch(`/api/tenants/${TENANT_ID}/initialize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Demo Markets', currency: 'USD' }),
  }).catch(() => undefined);
}

function App() {
  const { user, wallet, loading, error, isAuthenticated, signIn, signUp, signOut } = useAuth();

  useEffect(() => {
    void ensureDemoTenant();
  }, []);

  if (loading) {
    return <div style={{ padding: 'var(--gn-space-8)', color: 'var(--gn-color-text-secondary)' }}>Loading...</div>;
  }

  if (!isAuthenticated || !user) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 'var(--gn-space-8)' }}>
        <AuthPanel onLogin={signIn} onRegister={signUp} />
      </div>
    );
  }

  return (
    <div style={{ padding: 'var(--gn-space-8)', maxWidth: '1200px', margin: '0 auto' }}>
      <AppHeader user={user} wallet={wallet} onLogout={signOut} />

      {user.kycStatus !== 'Verified' && (
        <div style={{
          backgroundColor: 'var(--gn-color-success)',
          color: '#fff',
          padding: 'var(--gn-space-3) var(--gn-space-4)',
          borderRadius: 'var(--gn-radius-md)',
          marginBottom: 'var(--gn-space-6)',
        }}>
          Link your payout account to enable instant withdrawals.
        </div>
      )}

      {error && (
        <div style={{ color: 'var(--gn-color-danger)', marginBottom: 'var(--gn-space-4)' }}>{error}</div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 'var(--gn-space-4)',
      }}>
        {mockMarkets.map((market) => (
          <div key={market.id} style={{
            backgroundColor: 'var(--gn-card-bg)',
            border: 'var(--gn-card-border)',
            borderRadius: 'var(--gn-card-radius)',
            padding: 'var(--gn-space-5)',
          }}>
            <div style={{ fontSize: 'var(--gn-font-size-sm)', color: 'var(--gn-color-text-muted)' }}>
              {market.tag} • {market.category} • {market.daysLeft}d
            </div>
            <h2 style={{ fontSize: 'var(--gn-font-size-lg)', margin: 'var(--gn-space-3) 0' }}>
              {market.emoji} {market.question}
            </h2>
            <div style={{ display: 'flex', gap: 'var(--gn-space-3)' }}>
              <button type="button" style={yesButtonStyle}>Yes {market.yesOdds}x</button>
              <button type="button" style={noButtonStyle}>No {market.noOdds}x</button>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: 'var(--gn-space-4)',
              fontSize: 'var(--gn-font-size-sm)',
              color: 'var(--gn-color-text-secondary)',
            }}>
              <span>Vol: ${market.volume}</span>
              <span>{market.traders} Traders</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const yesButtonStyle: React.CSSProperties = {
  flex: 1,
  backgroundColor: 'var(--gn-color-odds-yes-bg)',
  color: 'var(--gn-color-odds-yes)',
  border: '1px solid var(--gn-color-odds-yes)',
  padding: 'var(--gn-space-3)',
  borderRadius: 'var(--gn-radius-md)',
  fontWeight: 'var(--gn-font-weight-bold)',
  cursor: 'pointer',
};

const noButtonStyle: React.CSSProperties = {
  flex: 1,
  backgroundColor: 'var(--gn-color-odds-no-bg)',
  color: 'var(--gn-color-odds-no)',
  border: '1px solid var(--gn-color-odds-no)',
  padding: 'var(--gn-space-3)',
  borderRadius: 'var(--gn-radius-md)',
  fontWeight: 'var(--gn-font-weight-bold)',
  cursor: 'pointer',
};

export default App;
