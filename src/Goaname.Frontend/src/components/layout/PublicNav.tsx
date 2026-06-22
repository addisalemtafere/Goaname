import type { UserProfile, Wallet } from '../../api/users';
import { formatMoney, normalizeCurrency } from '../../api/users';
import { Button, BrandLogo, LiveIndicator, NavTab, stickyHeaderClass } from '../ui';
import type { PublicPage } from './viewMeta';

interface PublicNavProps {
  activePage: PublicPage;
  onNavigate: (page: PublicPage) => void;
  liveCount: number;
  onSignIn: () => void;
  user?: UserProfile | null;
  wallet?: Wallet | null;
  onManage?: () => void;
  onLogout?: () => void;
}

const NAV_ITEMS: { id: PublicPage; label: string }[] = [
  { id: 'markets', label: 'Markets' },
  { id: 'leaderboard', label: 'Leaderboard' },
  { id: 'activity', label: 'Activity' },
];

export function PublicNav({
  activePage,
  onNavigate,
  liveCount,
  onSignIn,
  user,
  wallet,
  onManage,
  onLogout,
}: PublicNavProps) {
  const isAuthenticated = Boolean(user);
  const balance = wallet?.balance ?? 0;

  return (
    <header className={stickyHeaderClass}>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:gap-6 sm:px-6 sm:py-4 lg:px-8">
        <button
          type="button"
          onClick={() => onNavigate('markets')}
          className="cursor-pointer border-none bg-transparent p-0"
        >
          <BrandLogo size="sm" />
        </button>

        <nav className="hidden items-center gap-8 border-b border-transparent pb-4 md:flex" aria-label="Public pages">
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

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <LiveIndicator count={liveCount} className="hidden sm:inline-flex" />

          {isAuthenticated && user ? (
            <>
              <span className="hidden text-sm font-bold text-vantage-yes md:inline">
                {formatMoney(balance, normalizeCurrency(user.preferredCurrency))}
              </span>
              {onManage && (
                <Button variant="secondary" onClick={onManage} className="hidden px-3 py-2 text-xs sm:inline-flex sm:px-4 sm:text-sm">
                  Manage
                </Button>
              )}
              {onLogout && (
                <Button variant="connect" onClick={onLogout} className="px-3 py-2 text-xs sm:px-5 sm:py-2.5 sm:text-sm">
                  <span className="hidden sm:inline">Sign Out</span>
                  <span className="sm:hidden">Out</span>
                </Button>
              )}
            </>
          ) : (
            <Button variant="connect" onClick={onSignIn} className="px-3 py-2 text-xs sm:px-5 sm:py-2.5 sm:text-sm">
              <span className="hidden sm:inline">Connect Wallet</span>
              <span className="sm:hidden">Sign In</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
