import { formatCategoryLabel } from '../../api/categories';
import { formatVolume, type ActivityFeedItem } from '../../api/activity';
import { useActivityData } from '../../hooks/useActivityData';

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
    <div className="fixed right-0 bottom-0 left-0 z-20 hidden overflow-hidden border-t border-vantage-border bg-vantage-bg/95 py-2.5 backdrop-blur-md md:block">
      <div className="vantage-marquee-track flex w-max gap-10 whitespace-nowrap px-6">
        {doubled.map((item, index) => (
          <TickerItem key={`${item.key}-${index}`} item={item} />
        ))}
      </div>
    </div>
  );
}

function TickerItem({ item }: { item: TickerItemData }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs">
      <span className="font-mono text-vantage-muted">{item.wallet}</span>
      <span className="text-vantage-muted">{item.action}</span>
      <span className="font-bold text-vantage-yes">{item.amount}</span>
      <span className="text-vantage-muted">on</span>
      <span className="font-medium text-vantage-no">{item.event}</span>
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
