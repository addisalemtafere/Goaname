import { cn } from './cn';

interface BrandLogoProps {
  subtitle?: string;
  admin?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

const markClass = 'flex shrink-0 items-center justify-center rounded-lg bg-vantage-accent font-black text-white';

export function BrandLogo({ subtitle, admin = false, size = 'md', className }: BrandLogoProps) {
  const markSize = size === 'sm' ? 'h-8 w-8 text-xs' : 'h-9 w-9 text-sm';
  const titleClass = size === 'sm' ? 'text-base' : 'text-lg';

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className={cn(markClass, markSize)} aria-hidden="true">
        G
      </div>
      <div>
        <p className={cn('m-0 font-extrabold tracking-[0.06em] text-vantage-fg', titleClass)}>
          {admin ? 'Goaname Admin' : 'Goaname'}
        </p>
        {subtitle && <p className="m-0 mt-1 text-xs text-vantage-muted">{subtitle}</p>}
      </div>
    </div>
  );
}
