import type { ButtonHTMLAttributes } from 'react';
import { cn } from './cn';

export type ButtonVariant = 'primary' | 'secondary' | 'connect' | 'buyYes' | 'buyNo';

const variantClass: Record<ButtonVariant, string> = {
  primary:
    'cursor-pointer rounded-xl bg-vantage-accent px-4 py-2.5 text-sm font-bold text-white hover:bg-vantage-accent-dim disabled:cursor-not-allowed disabled:opacity-50',
  secondary:
    'cursor-pointer rounded-xl border border-vantage-border bg-vantage-elevated px-4 py-2.5 text-sm font-semibold text-vantage-fg hover:border-vantage-muted disabled:cursor-not-allowed disabled:opacity-50',
  connect:
    'cursor-pointer rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-black hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-50',
  buyYes:
    'w-full cursor-pointer rounded-xl bg-vantage-yes-dim py-3 text-sm font-bold text-vantage-yes transition hover:bg-vantage-yes hover:text-black disabled:cursor-not-allowed disabled:opacity-50',
  buyNo:
    'w-full cursor-pointer rounded-xl bg-vantage-no-dim py-3 text-sm font-bold text-vantage-no transition hover:bg-vantage-no hover:text-white disabled:cursor-not-allowed disabled:opacity-50',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export function Button({ variant = 'primary', className, type = 'button', ...props }: ButtonProps) {
  return <button type={type} className={cn(variantClass[variant], className)} {...props} />;
}
