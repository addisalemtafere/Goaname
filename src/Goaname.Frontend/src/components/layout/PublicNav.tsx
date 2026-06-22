import { Button, BrandLogo, LiveIndicator, NavTab, stickyHeaderClass } from '../ui';
import type { PublicPage } from './viewMeta';

interface PublicNavProps {
  activePage: PublicPage;
  onNavigate: (page: PublicPage) => void;
  liveCount: number;
  onSignIn: () => void;
}

const NAV_ITEMS: { id: PublicPage; label: string }[] = [
  { id: 'markets', label: 'Markets' },
  { id: 'leaderboard', label: 'Leaderboard' },
  { id: 'activity', label: 'Activity' },
];

export function PublicNav({ activePage, onNavigate, liveCount, onSignIn }: PublicNavProps) {
  return (
    <header className={stickyHeaderClass}>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4 lg:px-8">
        <button
          type="button"
          onClick={() => onNavigate('markets')}
          className="cursor-pointer border-none bg-transparent p-0"
        >
          <BrandLogo size="sm" />
        </button>

        <nav className="hidden items-center gap-8 border-b border-transparent pb-4 md:flex">
          {NAV_ITEMS.map((item) => (
            <NavTab
              key={item.id}
              active={activePage === item.id}
              onClick={() => onNavigate(item.id)}
            >
              {item.label}
            </NavTab>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <LiveIndicator count={liveCount} />
          <Button variant="connect" onClick={onSignIn}>
            Connect Wallet
          </Button>
        </div>
      </div>
    </header>
  );
}
