import { cn } from './cn';

interface NavTabProps {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}

export function NavTab({ children, active = false, onClick }: NavTabProps) {
  const Tag = onClick ? 'button' : 'span';

  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={cn(
        'relative pb-0.5 text-sm font-medium',
        onClick && 'cursor-pointer border-none bg-transparent',
        active ? 'text-vantage-fg' : 'text-vantage-muted',
      )}
    >
      {children}
      {active && (
        <span className="absolute -bottom-4 left-0 h-0.5 w-full bg-vantage-accent" />
      )}
    </Tag>
  );
}
