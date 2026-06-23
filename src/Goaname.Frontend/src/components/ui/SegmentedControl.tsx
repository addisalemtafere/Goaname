import { cn } from './cn';

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
  className?: string;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div
      className={cn(
        'grid gap-1 rounded-xl border border-vantage-border bg-vantage-bg p-1',
        options.length === 2 && 'grid-cols-2',
        className,
      )}
      role="tablist"
      aria-label={ariaLabel}
    >
      {options.map((option) => {
        const active = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.value)}
            className={cn(
              'cursor-pointer rounded-lg py-2.5 text-sm font-semibold transition',
              active
                ? 'bg-vantage-accent font-bold text-white'
                : 'text-vantage-muted hover:text-vantage-fg',
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
