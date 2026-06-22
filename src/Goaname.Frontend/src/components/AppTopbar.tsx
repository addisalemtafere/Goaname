interface AppTopbarProps {
  title: string;
  subtitle: string;
  badge?: string;
}

export function AppTopbar({ title, subtitle, badge }: AppTopbarProps) {
  return (
    <header className="sticky top-0 z-10 flex h-[72px] shrink-0 items-center justify-between gap-4 border-b border-slate-700/50 bg-slate-900/80 px-8 backdrop-blur-md">
      <div>
        <h1 className="m-0 text-2xl font-bold tracking-tight text-slate-100">{title}</h1>
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      </div>
      {badge && (
        <span className="whitespace-nowrap rounded-full border border-blue-500/25 bg-blue-500/10 px-4 py-2 text-xs font-semibold text-blue-400">
          {badge}
        </span>
      )}
    </header>
  );
}
