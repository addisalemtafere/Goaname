import { useState } from 'react';
import { depositFunds } from '../../api/users';
import { formatMoney, normalizeCurrency, type UserProfile, type Wallet } from '../../api/users';
import { Alert, Button, Card, Field, IconButton, Input } from '../ui';

const QUICK_AMOUNTS = [50, 100, 500] as const;

interface DepositPanelProps {
  user: UserProfile;
  wallet: Wallet | null;
  onClose: () => void;
  onDeposited: () => void;
}

export function DepositPanel({ user, wallet, onClose, onDeposited }: DepositPanelProps) {
  const [amount, setAmount] = useState('100');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currency = normalizeCurrency(user.preferredCurrency);
  const parsedAmount = parseAmount(amount);

  async function handleDeposit() {
    if (parsedAmount === null || parsedAmount <= 0) {
      setError('Enter a valid deposit amount.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await depositFunds(parsedAmount);
      onDeposited();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Deposit failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card variant="elevated" className="rounded-2xl p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="m-0 text-lg font-bold text-vantage-fg">Add funds</h2>
          <p className="mt-1 mb-0 text-sm text-vantage-muted">
            Demo deposit — credits your wallet instantly for betting.
          </p>
        </div>
        <IconButton label="Close deposit panel" size="sm" onClick={onClose} />
      </div>

      {wallet && (
        <p className="mb-4 text-sm text-vantage-muted">
          Current balance:{' '}
          <span className="font-semibold text-vantage-yes">
            {formatMoney(wallet.balance, currency)}
          </span>
        </p>
      )}

      <div className="mb-4 flex flex-wrap gap-2">
        {QUICK_AMOUNTS.map((value) => (
          <Button
            key={value}
            variant="secondary"
            type="button"
            className="px-3 py-2 text-xs"
            disabled={submitting}
            onClick={() => setAmount(String(value))}
          >
            {formatMoney(value, currency)}
          </Button>
        ))}
      </div>

      <Field label="Amount">
        <Input
          type="number"
          min={0.01}
          step={0.01}
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={submitting}
          placeholder="100.00"
        />
      </Field>

      {error && <Alert className="mt-4">{error}</Alert>}

      <Button
        variant="primary"
        className="mt-5 w-full"
        disabled={submitting || parsedAmount === null || parsedAmount <= 0}
        onClick={() => void handleDeposit()}
      >
        {submitting ? 'Adding funds…' : `Add ${parsedAmount !== null ? formatMoney(parsedAmount, currency) : 'funds'}`}
      </Button>
    </Card>
  );
}

function parseAmount(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}
