import { type FormEvent, useState } from 'react';
import { btnPrimary, inputClass, labelClass } from './ui/classes';

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
    <div className="mx-auto max-w-[420px] rounded-xl border border-slate-700 bg-slate-800 p-8">
      <h1 className="mt-0 text-blue-400">Goaname</h1>
      <p className="mb-6 text-slate-400">
        {mode === 'login' ? 'Sign in to your account' : 'Create an account to start trading'}
      </p>

      <div className="mb-6 flex gap-2">
        <button
          type="button"
          onClick={() => setMode('login')}
          className={`flex-1 cursor-pointer rounded-lg border px-3 py-2 ${
            mode === 'login'
              ? 'border-blue-500 bg-blue-500 text-white'
              : 'border-slate-600 bg-transparent text-slate-100'
          }`}
        >
          Login
        </button>
        <button
          type="button"
          onClick={() => setMode('register')}
          className={`flex-1 cursor-pointer rounded-lg border px-3 py-2 ${
            mode === 'register'
              ? 'border-blue-500 bg-blue-500 text-white'
              : 'border-slate-600 bg-transparent text-slate-100'
          }`}
        >
          Register
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4">
        {mode === 'register' && (
          <label className={labelClass}>
            Display name
            <input
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              required
              className={inputClass}
            />
          </label>
        )}

        <label className={labelClass}>
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            className={inputClass}
          />
        </label>

        <label className={labelClass}>
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={8}
            className={inputClass}
          />
        </label>

        {error && <div className="text-sm text-red-400">{error}</div>}

        <button type="submit" disabled={submitting} className={`${btnPrimary} bg-emerald-500 hover:bg-emerald-600`}>
          {submitting ? 'Please wait...' : mode === 'login' ? 'Login' : 'Register'}
        </button>
      </form>
    </div>
  );
}
