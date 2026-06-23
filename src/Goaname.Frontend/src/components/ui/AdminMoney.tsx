import { formatPreciseMoney, normalizeCurrency } from '../../api/users';
import { cn } from './cn';

interface AdminMoneyProps {
  amount: number;
  currency: string;
  className?: string;
  muted?: boolean;
}

export function AdminMoney({ amount, currency, className, muted = false }: AdminMoneyProps) {
  return (
    <span
      className={cn(
        'inline-block font-medium tabular-nums tracking-tight',
        muted ? 'text-vantage-muted' : 'text-vantage-fg',
        className,
      )}
    >
      {formatPreciseMoney(amount, normalizeCurrency(currency))}
    </span>
  );
}
