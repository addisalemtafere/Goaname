import { formatMoney } from '../../api/users';
import type { UserProfile, Wallet } from '../../api/users';
import { BrandLogo, Button, Card } from '../ui';
import type { AppView } from './viewMeta';

interface NavItem {
  id: AppView;
  label: string;
  description: string;
  icon: React.ReactNode;
}

interface AppSidenavProps {
  activeView: AppView;
  onNavigate: (view: AppView) => void;
  user: UserProfile;
  wallet: Wallet | null;
  onLogout: () => void;
  tenantId: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'browse', label: 'Markets', description: 'Browse and place bets', icon: <BrowseIcon /> },
  { id: 'leaderboard', label: 'Leaderboard', description: 'Top traders this week', icon: <LeaderboardIcon /> },
  { id: 'activity', label: 'Activity', description: 'Live bets and market moves', icon: <ActivityIcon /> },
  { id: 'manage', label: 'Manage markets', description: 'Create, publish, categories', icon: <ManageIcon /> },
];

export function AppSidenav({
  activeView,
  onNavigate,
  user,
  wallet,
  onLogout,
  tenantId,
}: AppSidenavProps) {
  const balance = wallet?.balance ?? 0;
  const initials = user.displayName.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? '').join('') || 'U';

  return (
    <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col overflow-hidden border-r border-vantage-border">
      <Card variant="elevated" className="flex h-full flex-col rounded-none border-r-0 border-t-0 border-b-0 border-l-0">
        <div className="border-b border-vantage-border bg-vantage-bg px-5 py-6">
          <BrandLogo admin subtitle={tenantId} />
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <ul className="m-0 grid list-none gap-1 p-0">
            {NAV_ITEMS.map((item) => {
              const isActive = activeView === item.id;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => onNavigate(item.id)}
                    className={`flex w-full items-center gap-3 rounded-xl border-none px-3 py-3 text-left ${
                      isActive
                        ? 'bg-vantage-accent/15 text-vantage-accent shadow-[inset_3px_0_0_0] shadow-vantage-accent'
                        : 'text-vantage-muted hover:bg-vantage-bg hover:text-vantage-fg'
                    }`}
                  >
                    <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${isActive ? 'bg-vantage-accent/20' : 'bg-vantage-bg'}`}>
                      {item.icon}
                    </span>
                    <span>
                      <span className="block text-sm font-bold">{item.label}</span>
                      <span className="block text-xs opacity-70">{item.description}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="border-t border-vantage-border p-4">
          <div className="mb-3 flex justify-between rounded-xl border border-vantage-yes/20 bg-vantage-yes/10 p-3 text-xs">
            <span className="text-vantage-muted">Wallet</span>
            <span className="font-bold text-vantage-yes">{formatMoney(balance, user.preferredCurrency)}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-vantage-accent text-sm font-bold text-white">{initials}</div>
            <div className="min-w-0 flex-1 truncate text-sm font-bold">{user.displayName}</div>
            <Button variant="secondary" onClick={onLogout}>Logout</Button>
          </div>
        </div>
      </Card>
    </aside>
  );
}

function BrowseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function ManageIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 20h9" /><path d="M12 4h9" /><path d="M3 12h18" /><path d="M3 20h.01" /><path d="M3 4h.01" />
    </svg>
  );
}

function LeaderboardIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M8 21V10" /><path d="M12 21V3" /><path d="M16 21v-6" />
    </svg>
  );
}

function ActivityIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}
