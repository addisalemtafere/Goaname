import { formatCategoryLabel } from '../../api/categories';
import type { MarketDto } from '../../api/markets';

interface ActivityTickerProps {
  markets: MarketDto[];
}

export function ActivityTicker({ markets }: ActivityTickerProps) {
  const items = buildTickerItems(markets);
  if (items.length === 0) {
    return null;
  }

  const doubled = [...items, ...items];

  return (
    <div className="fixed right-0 bottom-0 left-0 z-20 overflow-hidden border-t border-vantage-border bg-vantage-bg/95 py-2.5 backdrop-blur-md">
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
      <span className="text-vantage-muted">bet</span>
      <span className="font-bold text-vantage-yes">{item.amount}</span>
      <span className="text-vantage-muted">on</span>
      <span className="font-medium text-vantage-no">{item.event}</span>
    </span>
  );
}

interface TickerItemData {
  key: string;
  wallet: string;
  amount: string;
  event: string;
}

function buildTickerItems(markets: MarketDto[]): TickerItemData[] {
  const wallets = ['0x9f...44', '0x3a...b2', '0x7c...91', '0x1e...ff', '0x8b...23', '0x4d...67'];

  return markets.slice(0, 10).map((market, index) => {
    const seed = market.id.charCodeAt(0) + index;
    const amount = `$${((seed * 137) % 9000 + 100).toLocaleString()}.00`;
    const title = market.title.length > 28 ? `${market.title.slice(0, 28)}…` : market.title;

    return {
      key: market.id,
      wallet: wallets[index % wallets.length],
      amount,
      event: formatCategoryLabel(market.category) === title ? title : `${formatCategoryLabel(market.category)} · ${title}`,
    };
  });
}
