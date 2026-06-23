import { cn } from './cn';

interface ChipProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

export function Chip({ label, active = false, onClick, className }: ChipProps) {
  const Tag = onClick ? 'button' : 'span';

  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={cn(
        'shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition',
        onClick && 'cursor-pointer',
        active
          ? 'game-chip-active text-white'
          : 'border border-transparent bg-vantage-elevated text-vantage-muted hover:border-vantage-border hover:text-vantage-fg',
        className,
      )}
    >
      {label}
    </Tag>
  );
}

interface TagProps {
  children: React.ReactNode;
  onRemove?: () => void;
  removeDisabled?: boolean;
  removeLabel?: string;
}

export function Tag({ children, onRemove, removeDisabled, removeLabel }: TagProps) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-vantage-border bg-vantage-elevated px-3 py-2 text-sm text-vantage-fg">
      {children}
      {onRemove && (
        <button
          type="button"
          disabled={removeDisabled}
          onClick={onRemove}
          aria-label={removeLabel}
          className="cursor-pointer border-none bg-transparent p-0 text-lg leading-none text-vantage-muted hover:text-vantage-fg disabled:cursor-not-allowed disabled:opacity-40"
        >
          ×
        </button>
      )}
    </span>
  );
}
