import type { HTMLAttributes } from 'react';
import { cn } from './cn';

type CardVariant = 'surface' | 'elevated' | 'auth';

const variantClass: Record<CardVariant, string> = {
  surface: 'border border-vantage-border bg-vantage-surface',
  elevated: 'border border-vantage-border bg-vantage-elevated',
  auth: 'rounded-2xl border border-vantage-border bg-vantage-surface shadow-2xl shadow-black/60',
};

interface CardProps extends HTMLAttributes<HTMLElement> {
  variant?: CardVariant;
  as?: 'article' | 'div' | 'section' | 'aside';
}

export function Card({ variant = 'surface', as: Tag = 'div', className, ...props }: CardProps) {
  return <Tag className={cn(variantClass[variant], className)} {...props} />;
}
