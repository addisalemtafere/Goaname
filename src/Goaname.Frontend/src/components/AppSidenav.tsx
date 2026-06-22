import { formatMoney } from '../api/users';
import type { UserProfile, Wallet } from '../api/users';
import { btnSecondary, logoMarkClass } from './ui/classes';

export type AppView = 'browse' | 'manage';

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
  {
    id: 'browse',
    label: 'Markets',
    description: 'Browse and place bets',
    icon: <BrowseIcon />,
  },
  {
    id: 'manage',
    label: 'Manage markets',
    description: 'Create, publish, categories',
    icon: <ManageIcon />,
  },
];

const navLinkClass =
  'flex w-full items-center gap-3 rounded-lg border-none px-3 py-3 text-left text-slate-400 transition hover:bg-slate-800/50 hover:text-slate-100';

const navLinkActiveClass =
  'flex w-full items-center gap-3 rounded-lg border-none bg-blue-500/15 px-3 py-3 text-left text-blue-400 shadow-[inset_3px_0_0_0] shadow-blue-500';

export function AppSidenav({
  activeView,
  onNavigate,
  user,
  wallet,
  onLogout,
  tenantId,
}: AppSidenavProps) {
  const balance = wallet?.balance ?? 0;
  const initials = user.displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || 'U';

  return (
    <aside
      className="sticky top-0 flex h-screen w-64 shrink-0 flex-col overflow-hidden border-r border-slate-700/50 bg-gradient-to-b from-gray-900 to-slate-950"
      aria-label="Main navigation"
    >
      <div className="border-b border-slate-700/50 px-5 py-6">
        <div className="flex items-center gap-3">
          <div className={logoMarkClass} aria-hidden="true">G</div>
          <div>
            <p className="m-0 text-lg font-bold text-slate-100">Goaname</p>
            <p className="m-0 text-xs text-slate-500">{tenantId}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        <section>
          <h2 className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Navigation
          </h2>
          <ul className="m-0 grid list-none gap-1 p-0">
            {NAV_ITEMS.map((item) => {
              const isActive = activeView === item.id;

              return (
                <li key={item.id}>
                  <button
                    type="button"
                    className={isActive ? navLinkActiveClass : navLinkClass}
                    aria-current={isActive ? 'page' : undefined}
                    onClick={() => onNavigate(item.id)}
                  >
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                        isActive ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-800/80'
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span className="flex min-w-0 flex-col gap-0.5">
                      <span className={`text-sm font-semibold ${isActive ? '' : 'text-slate-200'}`}>
                        {item.label}
                      </span>
                      <span className="text-xs text-slate-500">{item.description}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      <div className="border-t border-slate-700/50 bg-slate-950/55 p-4">
        <div className="mb-3 flex items-center justify-between gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3">
          <span className="text-xs text-slate-500">Wallet balance</span>
          <span className="text-sm font-bold text-emerald-400">
            {formatMoney(balance, user.preferredCurrency)}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-600 to-slate-500 text-sm font-bold text-slate-100">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold text-slate-100">{user.displayName}</div>
            <div className="text-xs text-slate-500">{tenantId}</div>
          </div>
          <button type="button" className={btnSecondary} onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}

export function getManageTitle(): { title: string; subtitle: string } {
  return {
    title: 'Market administration',
    subtitle: 'Create drafts, manage categories, and publish markets',
  };
}

export function getBrowseTitle(isPublic: boolean): { title: string; subtitle: string } {
  return {
    title: 'Markets',
    subtitle: isPublic
      ? 'Public market catalog — sign in to place bets'
      : 'Browse live prediction markets and place bets',
  };
}

function BrowseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function ManageIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 20h9" />
      <path d="M12 4h9" />
      <path d="M3 12h18" />
      <path d="M3 20h.01" />
      <path d="M3 4h.01" />
    </svg>
  );
}
