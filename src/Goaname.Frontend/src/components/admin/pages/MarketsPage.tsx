import { MarketAdminPanel } from '../MarketAdminPanel';
import { useAdminContext } from '../../../context/AdminContext';

interface MarketsPageProps {
  onMarketsChanged: () => void;
}

export function MarketsPage({ onMarketsChanged }: MarketsPageProps) {
  const { tenantId } = useAdminContext();

  return <MarketAdminPanel tenantId={tenantId} onMarketsChanged={onMarketsChanged} />;
}
