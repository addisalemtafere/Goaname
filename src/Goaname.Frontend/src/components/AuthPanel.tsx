import { FormEvent, useState } from 'react';

interface AuthPanelProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (displayName: string, email: string, password: string) => Promise<void>;
}

export function AuthPanel({ onLogin, onRegister }: AuthPanelProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (mode === 'login') {
        await onLogin(email, password);
      } else {
        await onRegister(displayName, email, password);
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Authentication failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      maxWidth: '420px',
      margin: '0 auto',
      padding: 'var(--gn-space-8)',
      backgroundColor: 'var(--gn-color-bg-surface)',
      borderRadius: 'var(--gn-radius-lg)',
      border: '1px solid var(--gn-border-color)',
    }}>
      <h1 style={{ marginTop: 0, color: 'var(--gn-color-primary)' }}>Goaname</h1>
      <p style={{ color: 'var(--gn-color-text-secondary)', marginBottom: 'var(--gn-space-6)' }}>
        {mode === 'login' ? 'Sign in to your account' : 'Create an account to start trading'}
      </p>

      <div style={{ display: 'flex', gap: 'var(--gn-space-2)', marginBottom: 'var(--gn-space-6)' }}>
        <button
          type="button"
          onClick={() => setMode('login')}
          style={tabStyle(mode === 'login')}
        >
          Login
        </button>
        <button
          type="button"
          onClick={() => setMode('register')}
          style={tabStyle(mode === 'register')}
        >
          Register
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 'var(--gn-space-4)' }}>
        {mode === 'register' && (
          <label style={labelStyle}>
            Display name
            <input
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              required
              style={inputStyle}
            />
          </label>
        )}

        <label style={labelStyle}>
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            style={inputStyle}
          />
        </label>

        <label style={labelStyle}>
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={8}
            style={inputStyle}
          />
        </label>

        {error && (
          <div style={{ color: 'var(--gn-color-danger)', fontSize: 'var(--gn-font-size-sm)' }}>
            {error}
          </div>
        )}

        <button type="submit" disabled={submitting} style={submitStyle}>
          {submitting ? 'Please wait...' : mode === 'login' ? 'Login' : 'Register'}
        </button>
      </form>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'grid',
  gap: 'var(--gn-space-2)',
  color: 'var(--gn-color-text-secondary)',
  fontSize: 'var(--gn-font-size-sm)',
};

const inputStyle: React.CSSProperties = {
  padding: 'var(--gn-space-3)',
  borderRadius: 'var(--gn-radius-md)',
  border: '1px solid var(--gn-border-color)',
  backgroundColor: 'var(--gn-color-bg-base)',
  color: 'var(--gn-color-text-primary)',
};

const submitStyle: React.CSSProperties = {
  padding: 'var(--gn-space-3)',
  borderRadius: 'var(--gn-radius-md)',
  border: 'none',
  backgroundColor: 'var(--gn-color-success)',
  color: '#fff',
  fontWeight: 'var(--gn-font-weight-bold)',
  cursor: 'pointer',
};

function tabStyle(active: boolean): React.CSSProperties {
  return {
    flex: 1,
    padding: 'var(--gn-space-2) var(--gn-space-3)',
    borderRadius: 'var(--gn-radius-md)',
    border: '1px solid var(--gn-border-color)',
    backgroundColor: active ? 'var(--gn-color-primary)' : 'transparent',
    color: active ? '#fff' : 'var(--gn-color-text-primary)',
    cursor: 'pointer',
  };
}
