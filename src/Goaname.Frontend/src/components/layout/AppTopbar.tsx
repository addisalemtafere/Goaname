import { IconButton, pageBgClass, PageHeader } from '../ui';

interface AppTopbarProps {
  title: string;
  subtitle: string;
  badge?: string;
  onMenuClick?: () => void;
}

export function AppTopbar({ title, subtitle, badge, onMenuClick }: AppTopbarProps) {
  return (
    <header className={`sticky top-0 z-20 shrink-0 border-b border-vantage-border px-4 py-3 shadow-sm sm:px-6 sm:py-4 lg:px-8 ${pageBgClass}`}>
      <div className="flex items-start gap-3">
        {onMenuClick && (
          <IconButton
            label="Open menu"
            onClick={onMenuClick}
            className="mt-0.5 shrink-0 lg:hidden"
          >
            <MenuIcon />
          </IconButton>
        )}
        <PageHeader title={title} subtitle={subtitle} badge={badge} size="default" className="min-w-0 flex-1" />
      </div>
    </header>
  );
}

function MenuIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}
