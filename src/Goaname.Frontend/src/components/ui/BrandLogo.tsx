import { cn } from './cn';

interface BrandLogoProps {
  subtitle?: string;
  admin?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export function BrandLogo({ subtitle, admin = false, size = 'md', className }: BrandLogoProps) {
  const markSize = size === 'sm' ? 'h-8 w-8 text-xs' : 'h-9 w-9 text-sm';
  const titleClass = size === 'sm' ? 'text-base' : 'text-lg';

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div
        className={cn(
          'flex shrink-0 items-center justify-center rounded-lg font-black text-white',
          admin
            ? 'bg-vantage-accent'
            : 'bg-gradient-to-br from-vantage-accent to-vantage-accent-dim shadow-[0_0_20px_rgba(124,92,255,0.45)]',
          markSize,
        )}
        aria-hidden="true"
      >
        G
      </div>
      <div>
        <p
          className={cn(
            'm-0 font-extrabold tracking-[0.08em] text-vantage-fg',
            !admin && 'font-[family-name:var(--font-display)]',
            titleClass,
          )}
        >
          {admin ? 'Goaname Admin' : 'Goaname'}
        </p>
        {subtitle && <p className="m-0 mt-1 text-xs text-vantage-muted">{subtitle}</p>}
      </div>
    </div>
  );
}
