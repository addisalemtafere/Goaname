import type { ButtonHTMLAttributes } from 'react';
import { cn } from './cn';

export type ButtonVariant = 'primary' | 'secondary' | 'connect' | 'buyYes' | 'buyNo';

const variantClass: Record<ButtonVariant, string> = {
  primary:
    'cursor-pointer rounded-md bg-vantage-accent font-semibold text-white hover:bg-vantage-accent-dim disabled:cursor-not-allowed disabled:opacity-50',
  secondary:
    'cursor-pointer rounded-md border border-vantage-border bg-[var(--color-vantage-control)] font-medium text-vantage-fg hover:border-vantage-muted hover:bg-[var(--color-vantage-control-hover)] disabled:cursor-not-allowed disabled:opacity-50',
  connect:
    'cursor-pointer rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-black hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-50',
  buyYes:
    'game-btn-yes w-full cursor-pointer rounded-xl py-3 text-sm font-bold text-vantage-yes transition disabled:cursor-not-allowed disabled:opacity-50',
  buyNo:
    'game-btn-no w-full cursor-pointer rounded-xl py-3 text-sm font-bold text-vantage-no transition disabled:cursor-not-allowed disabled:opacity-50',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: 'default' | 'sm';
}

const sizeClass = {
  default: 'px-4 py-2.5 text-sm',
  sm: 'px-2.5 py-1.5 text-xs',
};

export function Button({ variant = 'primary', size = 'default', className, type = 'button', ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(variantClass[variant], sizeClass[size], className)}
      {...props}
    />
  );
}
