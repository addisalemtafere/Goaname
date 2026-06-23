import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react';
import { cn } from './cn';

const fieldClass = 'grid gap-2 text-sm text-vantage-muted';

const controlClass =
  'w-full rounded-xl border border-vantage-border bg-vantage-elevated px-4 py-3.5 text-vantage-fg outline-none placeholder:text-vantage-muted focus:border-vantage-accent/50 disabled:cursor-not-allowed disabled:opacity-50';

interface FieldProps {
  label: string;
  children: ReactNode;
  className?: string;
}

export function Field({ label, children, className }: FieldProps) {
  return (
    <label className={cn(fieldClass, className)}>
      {label}
      {children}
    </label>
  );
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(controlClass, className)} {...props} />;
}

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(controlClass, className)} {...props}>
      {children}
    </select>
  );
}
