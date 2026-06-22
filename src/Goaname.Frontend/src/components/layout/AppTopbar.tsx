import { pageBgClass, PageHeader } from '../ui';

interface AppTopbarProps {
  title: string;
  subtitle: string;
  badge?: string;
}

export function AppTopbar({ title, subtitle, badge }: AppTopbarProps) {
  return (
    <header className={`sticky top-0 z-10 shrink-0 border-b border-vantage-border px-6 py-4 shadow-sm lg:px-8 ${pageBgClass}`}>
      <PageHeader title={title} subtitle={subtitle} badge={badge} size="default" />
    </header>
  );
}
