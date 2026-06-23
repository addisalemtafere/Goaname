import { type FormEvent, useState } from 'react';
import {
  Alert,
  BrandLogo,
  Button,
  Card,
  Field,
  IconButton,
  Input,
  SegmentedControl,
} from '../ui';

interface AuthPanelProps {
  onClose?: () => void;
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (displayName: string, email: string, password: string) => Promise<void>;
}

const AUTH_MODES = [
  { value: 'login' as const, label: 'Login' },
  { value: 'register' as const, label: 'Register' },
];

export function AuthPanel({ onClose, onLogin, onRegister }: AuthPanelProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function switchMode(nextMode: 'login' | 'register') {
    setMode(nextMode);
    setError(null);
  }

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

  const isLogin = mode === 'login';

  return (
    <Card variant="auth" className="mx-auto w-full max-w-[420px] overflow-hidden">
      <div className="border-b border-vantage-border px-8 py-6">
        <div className="flex items-start justify-between gap-4">
          <BrandLogo
            subtitle={
              isLogin
                ? 'Sign in to bet and manage your wallet'
                : 'Create an account with a betting wallet'
            }
          />
          {onClose && <IconButton label="Close" onClick={onClose} />}
        </div>
      </div>

      <div className="px-8 py-6">
        <SegmentedControl
          options={AUTH_MODES}
          value={mode}
          onChange={switchMode}
          ariaLabel="Authentication mode"
          className="mb-6"
        />

        <form onSubmit={handleSubmit} className="grid gap-4">
          {!isLogin && (
            <Field label="Display name">
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                autoComplete="name"
                placeholder="Your name"
              />
            </Field>
          )}

          <Field label="Email">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="you@example.com"
            />
          </Field>

          <Field label="Password">
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              placeholder={isLogin ? 'Enter your password' : 'At least 8 characters'}
            />
          </Field>

          {error && <Alert>{error}</Alert>}

          <Button
            type="submit"
            variant={isLogin ? 'connect' : 'primary'}
            disabled={submitting}
            className="w-full"
          >
            {submitting ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
          </Button>
        </form>
      </div>
    </Card>
  );
}
