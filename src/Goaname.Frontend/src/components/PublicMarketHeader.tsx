import { btnPrimary, logoMarkClass } from './ui/classes';

interface PublicMarketHeaderProps {
  tenantId: string;
  marketCount: number;
  onSignIn: () => void;
}

export function PublicMarketHeader({
  tenantId,
  marketCount,
  onSignIn,
}: PublicMarketHeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-4 border-b border-slate-700/50 bg-slate-900/80 px-8 py-5 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <div className={logoMarkClass} aria-hidden="true">G</div>
        <div>
          <p className="m-0 text-xl font-bold tracking-tight text-slate-100">Goaname</p>
          <p className="mt-0.5 text-xs text-slate-500">{tenantId} · {marketCount} live markets</p>
        </div>
      </div>

      <button type="button" className={btnPrimary} onClick={onSignIn}>
        Sign in
      </button>
    </header>
  );
}
