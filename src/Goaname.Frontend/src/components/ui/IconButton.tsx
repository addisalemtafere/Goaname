import type { ButtonHTMLAttributes } from 'react';
import { cn } from './cn';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  size?: 'sm' | 'md';
}

export function IconButton({ label, size = 'md', className, children, ...props }: IconButtonProps) {
  const sizeClass = size === 'sm' ? 'h-8 w-8 text-lg' : 'h-9 w-9 text-xl';

  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        'flex shrink-0 cursor-pointer items-center justify-center rounded-full border border-vantage-border bg-[var(--color-vantage-control)] leading-none text-vantage-muted hover:bg-[var(--color-vantage-control-hover)] hover:text-vantage-fg disabled:cursor-not-allowed disabled:opacity-50',
        sizeClass,
        className,
      )}
      {...props}
    >
      {children ?? '×'}
    </button>
  );
}
