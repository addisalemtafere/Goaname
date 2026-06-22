import { formatMoney, normalizeCurrency } from '../../api/users';
import type { UserProfile, Wallet } from '../../api/users';
import { BrandLogo, Button, Card, cn, IconButton } from '../ui';

interface AppSidenavProps {
  user: UserProfile;
  wallet: Wallet | null;
  onBackToSite: () => void;
  onLogout: () => void;
  tenantId: string;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function AppSidenav({
  user,
  wallet,
  onBackToSite,
  onLogout,
  tenantId,
  mobileOpen = false,
  onMobileClose,
}: AppSidenavProps) {
  const balance = wallet?.balance ?? 0;
  const initials = user.displayName.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? '').join('') || 'U';

  function handleBack() {
    onBackToSite();
    onMobileClose?.();
  }

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={cn(
          'z-50 flex h-screen shrink-0 flex-col overflow-hidden border-r border-vantage-border transition-transform duration-200',
          'max-lg:fixed max-lg:inset-y-0 max-lg:left-0 max-lg:w-[min(100vw-3rem,18rem)]',
          mobileOpen ? 'max-lg:translate-x-0' : 'max-lg:-translate-x-full',
          'lg:sticky lg:top-0 lg:z-auto lg:w-64 lg:translate-x-0',
        )}
      >
        <Card variant="elevated" className="flex h-full flex-col rounded-none border-r-0 border-t-0 border-b-0 border-l-0">
          <div className="flex items-start justify-between border-b border-vantage-border bg-vantage-bg px-4 py-5 sm:px-5 sm:py-6">
            <BrandLogo admin subtitle={tenantId} />
            {onMobileClose && (
              <IconButton label="Close menu" onClick={onMobileClose} className="lg:hidden" />
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-5">
            <button
              type="button"
              onClick={handleBack}
              className="mb-4 flex w-full cursor-pointer items-center gap-2 rounded-xl border border-vantage-border bg-vantage-bg px-3 py-2.5 text-sm font-semibold text-vantage-muted hover:text-vantage-fg"
            >
              ← Back to site
            </button>

            <div className="rounded-xl bg-vantage-accent/15 px-3 py-3 shadow-[inset_3px_0_0_0] shadow-vantage-accent">
              <p className="m-0 text-sm font-bold text-vantage-accent">Manage markets</p>
              <p className="m-0 mt-1 text-xs text-vantage-muted">Create, publish, and manage categories</p>
            </div>

            <p className="mt-6 mb-2 text-[11px] font-bold tracking-wider text-vantage-muted uppercase">
              Public pages
            </p>
            <p className="m-0 text-xs leading-relaxed text-vantage-muted">
              Markets, Leaderboard, and Activity are on the public site — use Back to site to view them.
            </p>
          </div>

          <div className="border-t border-vantage-border p-4">
            <div className="mb-3 flex justify-between rounded-xl border border-vantage-yes/20 bg-vantage-yes/10 p-3 text-xs">
              <span className="text-vantage-muted">Wallet</span>
              <span className="font-bold text-vantage-yes">
                {formatMoney(balance, normalizeCurrency(user.preferredCurrency))}
              </span>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-vantage-accent text-sm font-bold text-white">{initials}</div>
                <div className="min-w-0 truncate text-sm font-bold">{user.displayName}</div>
              </div>
              <Button variant="secondary" onClick={onLogout} className="w-full sm:w-auto">Logout</Button>
            </div>
          </div>
        </Card>
      </aside>
    </>
  );
}
