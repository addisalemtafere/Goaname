import { formatCategoryLabel } from '../../api/categories';
import { formatVolume, type ActivityFeedItem } from '../../api/activity';
import { useActivityData } from '../../hooks/useActivityData';
import { cn } from '../ui';

interface ActivityTickerProps {
  refreshKey?: number;
}

export function ActivityTicker({ refreshKey = 0 }: ActivityTickerProps) {
  const { feedItems } = useActivityData({ refreshKey, feedLimit: 20 });

  const tickerItems = feedItems.map(toTickerItem);
  if (tickerItems.length === 0) {
    return null;
  }

  const doubled = [...tickerItems, ...tickerItems];

  return (
    <div className="game-ticker game-ticker--inline relative overflow-hidden rounded-xl border py-2.5">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex w-16 items-center bg-gradient-to-r from-[rgba(8,8,12,0.98)] to-transparent pl-3">
        <span className="relative flex h-2 w-2">
          <span className="vantage-pulse-ring absolute inline-flex h-full w-full rounded-full bg-vantage-live" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-vantage-live" />
        </span>
      </div>
      <div className="vantage-marquee-track flex w-max gap-10 whitespace-nowrap px-10">
        {doubled.map((item, index) => (
          <TickerItem key={`${item.key}-${index}`} item={item} />
        ))}
      </div>
    </div>
  );
}

function TickerItem({ item }: { item: TickerItemData }) {
  const isNo = item.action.toLowerCase().includes('no');

  return (
    <span className="inline-flex items-center gap-1.5 text-xs">
      <span className="font-mono text-vantage-muted">{item.wallet}</span>
      <span className="text-vantage-muted">{item.action}</span>
      <span className="font-bold text-vantage-yes">{item.amount}</span>
      <span className="text-vantage-muted">on</span>
      <span className={cn('font-medium', isNo ? 'text-vantage-no' : 'text-vantage-accent')}>{item.event}</span>
    </span>
  );
}

interface TickerItemData {
  key: string;
  wallet: string;
  action: string;
  amount: string;
  event: string;
}

function toTickerItem(item: ActivityFeedItem): TickerItemData {
  const title = item.marketTitle.length > 32 ? `${item.marketTitle.slice(0, 32)}…` : item.marketTitle;
  const category = formatCategoryLabel(item.category);

  return {
    key: item.id,
    wallet: item.traderLabel,
    action: item.kind === 'buy_no' ? 'bought No' : 'bought Yes',
    amount: formatVolume(item.amount),
    event: category === title ? title : `${category} · ${title}`,
  };
}
