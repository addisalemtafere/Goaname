import { cn } from '../ui';
import type { PublicPage } from './viewMeta';

interface PublicBottomNavProps {
  activePage: PublicPage;
  onNavigate: (page: PublicPage) => void;
}

const ITEMS: { id: PublicPage; label: string; icon: React.ReactNode }[] = [
  { id: 'markets', label: 'Markets', icon: <GridIcon /> },
  { id: 'leaderboard', label: 'Leaderboard', icon: <ChartIcon /> },
  { id: 'activity', label: 'Activity', icon: <PulseIcon /> },
];

export function PublicBottomNav({ activePage, onNavigate }: PublicBottomNavProps) {
  return (
    <nav
      className="fixed right-0 bottom-0 left-0 z-30 border-t border-vantage-accent/15 bg-vantage-bg/95 backdrop-blur-md md:hidden"
      aria-label="Main navigation"
    >
      <ul className="m-0 grid list-none grid-cols-3 p-0 pb-[env(safe-area-inset-bottom,0px)]">
        {ITEMS.map((item) => {
          const active = activePage === item.id;
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onNavigate(item.id)}
                className={cn(
                  'flex w-full flex-col items-center gap-1 border-none px-2 py-3 text-[10px] font-bold tracking-wide uppercase',
                  active ? 'text-vantage-accent' : 'text-vantage-muted',
                )}
              >
                <span className={cn('flex h-8 w-8 items-center justify-center rounded-xl', active && 'bg-vantage-accent/20 shadow-[0_0_12px_rgba(124,92,255,0.25)]')}>
                  {item.icon}
                </span>
                {item.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function GridIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M8 21V10" /><path d="M12 21V3" /><path d="M16 21v-6" />
    </svg>
  );
}

function PulseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}
