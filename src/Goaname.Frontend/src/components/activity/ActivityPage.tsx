import { Badge, Card, cn } from '../ui';
import { mockActivityFeed, type ActivityFeedItem, type ActivityKind } from './mockActivityFeed';

export function ActivityPage() {
  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap gap-2">
        <Badge variant="live">Live feed</Badge>
        <Badge>Mock data</Badge>
      </div>

      <Card className="divide-y divide-vantage-border overflow-hidden rounded-2xl">
        <ul className="m-0 list-none p-0">
          {mockActivityFeed.map((item) => (
            <ActivityRow key={item.id} item={item} />
          ))}
        </ul>
      </Card>
    </div>
  );
}

function ActivityRow({ item }: { item: ActivityFeedItem }) {
  const action = formatAction(item);

  return (
    <li className="flex flex-wrap items-start justify-between gap-4 px-5 py-4 transition hover:bg-vantage-elevated/40">
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <span className="font-mono text-sm text-vantage-muted">{item.wallet}</span>
          <span className={cn('text-sm font-semibold', action.toneClass)}>{action.label}</span>
          {item.shares && (
            <span className="text-xs text-vantage-muted">{item.shares} shares</span>
          )}
        </div>
        <p className="m-0 truncate text-sm font-medium text-vantage-fg">{item.market}</p>
      </div>

      <div className="text-right">
        {item.amount > 0 && (
          <p className="m-0 text-sm font-bold text-vantage-yes">${item.amount.toLocaleString()}</p>
        )}
        <p className="m-0 text-xs text-vantage-muted">{item.timeAgo}</p>
      </div>
    </li>
  );
}

function formatAction(item: ActivityFeedItem): { label: string; toneClass: string } {
  const map: Record<ActivityKind, { label: string; toneClass: string }> = {
    buy_yes: { label: 'bought Yes', toneClass: 'text-vantage-yes' },
    buy_no: { label: 'bought No', toneClass: 'text-vantage-no' },
    sell: { label: 'sold position', toneClass: 'text-vantage-muted' },
    market_open: { label: 'opened market', toneClass: 'text-vantage-accent' },
  };

  return map[item.kind];
}
