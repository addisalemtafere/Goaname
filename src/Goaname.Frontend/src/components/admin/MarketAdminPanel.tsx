import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  addCategory,
  categoriesMatch,
  formatCategoryLabel,
  listCategories,
  removeCategory,
  sortCategories,
} from '../../api/categories';
import {
  closeMarket,
  createMarket,
  defaultTradingEndsAt,
  formatMarketStatus,
  isClosingMarket,
  isDraftMarket,
  isOpenMarket,
  isResolvedMarket,
  listAdminMarkets,
  normalizeMarketStatus,
  publishMarket,
  resolveMarket,
  settleMarket,
  toCardPercent,
  type MarketDto,
  type Outcome,
} from '../../api/markets';
import { useMarketDetails } from '../../hooks/useMarketDetails';
import { AdminDetailPanel, AdminEmptyAside } from './AdminPage';
import { MarketDetailsPanel } from './MarketDetailsPanel';
import { adminListBtn } from './adminButtons';
import {
  Alert,
  Badge,
  Button,
  Chip,
  EmptyState,
  Field,
  Input,
  PanelSection,
  Select,
  Tag,
  cn,
} from '../ui';

type MarketFilter = 'all' | 'active' | 'settled' | 'draft';

function matchesMarketFilter(market: MarketDto, filter: MarketFilter): boolean {
  const status = normalizeMarketStatus(market.status);

  switch (filter) {
    case 'active':
      return status === 'Open' || status === 'Closing';
    case 'settled':
      return status === 'Settled' || status === 'Resolved' || status === 'Cancelled';
    case 'draft':
      return status === 'Draft';
    default:
      return true;
  }
}

interface CreateFormState {
  title: string;
  category: string;
  tradingEndsAt: string;
  liquidityParameter: string;
}

const emptyFormState = (): CreateFormState => ({
  title: '',
  category: '',
  tradingEndsAt: defaultTradingEndsAt().slice(0, 16),
  liquidityParameter: '',
});

interface MarketAdminPanelProps {
  tenantId: string;
  onMarketsChanged?: () => void;
}

export function MarketAdminPanel({ tenantId, onMarketsChanged }: MarketAdminPanelProps) {
  const [markets, setMarkets] = useState<MarketDto[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<CreateFormState>(emptyFormState);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [addingCategory, setAddingCategory] = useState(false);
  const [removingCategory, setRemovingCategory] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [closingId, setClosingId] = useState<string | null>(null);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [settlingId, setSettlingId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedMarketId, setSelectedMarketId] = useState<string | null>(null);
  const [marketFilter, setMarketFilter] = useState<MarketFilter>('all');
  const [marketSearch, setMarketSearch] = useState('');
  const [showTools, setShowTools] = useState(false);
  const marketDetails = useMarketDetails(selectedMarketId, tenantId);

  const sortedCategories = useMemo(() => sortCategories(categories), [categories]);

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const category of sortedCategories) {
      counts.set(category, 0);
    }

    for (const market of markets) {
      counts.set(market.category, (counts.get(market.category) ?? 0) + 1);
    }

    return counts;
  }, [markets, sortedCategories]);

  const filteredMarkets = useMemo(() => {
    const query = marketSearch.trim().toLowerCase();

    return markets.filter((market) => {
      if (selectedCategory && !categoriesMatch(market.category, selectedCategory)) {
        return false;
      }

      if (!matchesMarketFilter(market, marketFilter)) {
        return false;
      }

      if (!query) {
        return true;
      }

      return market.title.toLowerCase().includes(query)
        || market.id.toLowerCase().includes(query);
    });
  }, [markets, selectedCategory, marketFilter, marketSearch]);

  const selectedMarket = markets.find((market) => market.id === selectedMarketId) ?? null;

  const loadCategories = useCallback(async () => {
    setCategoriesLoading(true);

    try {
      const items = await listCategories(tenantId);
      setCategories(items);
      setForm((current) => ({
        ...current,
        category: current.category && items.includes(current.category)
          ? current.category
          : items[0] ?? '',
      }));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load categories');
    } finally {
      setCategoriesLoading(false);
    }
  }, [tenantId]);

  const loadMarkets = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const items = await listAdminMarkets(tenantId);
      setMarkets(items);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load admin markets');
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    void loadMarkets();
  }, [loadMarkets]);

  useEffect(() => {
    if (sortedCategories.length === 0) {
      setSelectedCategory(null);
      return;
    }

    if (!selectedCategory || !sortedCategories.includes(selectedCategory)) {
      setSelectedCategory(sortedCategories[0]);
    }
  }, [sortedCategories, selectedCategory]);

  useEffect(() => {
    if (!selectedMarketId) {
      return;
    }

    const stillVisible = filteredMarkets.some((market) => market.id === selectedMarketId);
    if (!stillVisible) {
      setSelectedMarketId(null);
    }
  }, [filteredMarkets, selectedMarketId]);

  function handleSelectCategory(category: string) {
    setSelectedCategory(category);
    setSelectedMarketId(null);
  }

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    setCreating(true);
    setError(null);

    try {
      const liquidity = form.liquidityParameter.trim()
        ? Number(form.liquidityParameter)
        : undefined;

      if (liquidity !== undefined && (Number.isNaN(liquidity) || liquidity <= 0)) {
        throw new Error('Liquidity must be a positive number.');
      }

      if (!form.category) {
        throw new Error('Select a category before creating a market.');
      }

      const tradingEndsAt = new Date(form.tradingEndsAt).toISOString();
      await createMarket({
        title: form.title.trim(),
        category: form.category,
        tradingEndsAt,
        liquidityParameter: liquidity,
      }, tenantId);

      setForm({
        ...emptyFormState(),
        category: form.category,
      });
      setSelectedCategory(form.category);
      await loadMarkets();
      onMarketsChanged?.();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create market');
    } finally {
      setCreating(false);
    }
  }

  async function handleAddCategory(event: React.FormEvent) {
    event.preventDefault();
    const name = newCategoryName.trim();
    if (!name) {
      return;
    }

    setAddingCategory(true);
    setError(null);

    try {
      await addCategory(name, tenantId);
      setNewCategoryName('');
      await loadCategories();
      setSelectedCategory(name);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to add category');
    } finally {
      setAddingCategory(false);
    }
  }

  async function handleRemoveCategory(category: string) {
    setRemovingCategory(category);
    setError(null);

    try {
      await removeCategory(category, tenantId);
      await loadCategories();
      setForm((current) => ({
        ...current,
        category: current.category === category ? '' : current.category,
      }));
      if (selectedCategory === category) {
        setSelectedCategory(null);
        setSelectedMarketId(null);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to remove category');
    } finally {
      setRemovingCategory(null);
    }
  }

  async function handlePublish(marketId: string) {
    setPublishingId(marketId);
    setError(null);

    try {
      await publishMarket(marketId, tenantId);
      await loadMarkets();
      onMarketsChanged?.();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to publish market');
    } finally {
      setPublishingId(null);
    }
  }

  async function handleClose(marketId: string) {
    setClosingId(marketId);
    setError(null);

    try {
      await closeMarket(marketId, tenantId);
      await loadMarkets();
      await marketDetails.refresh();
      onMarketsChanged?.();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to close market');
    } finally {
      setClosingId(null);
    }
  }

  async function handleResolve(marketId: string, winningOutcome: Outcome) {
    setResolvingId(marketId);
    setError(null);

    try {
      await resolveMarket(marketId, winningOutcome, tenantId);
      await loadMarkets();
      await marketDetails.refresh();
      onMarketsChanged?.();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to resolve market');
    } finally {
      setResolvingId(null);
    }
  }

  async function handleSettle(marketId: string) {
    setSettlingId(marketId);
    setError(null);

    try {
      await settleMarket(marketId, tenantId);
      await loadMarkets();
      await marketDetails.refresh();
      onMarketsChanged?.();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to settle market');
    } finally {
      setSettlingId(null);
    }
  }

  return (
    <div className="admin-markets-workspace grid gap-3">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button variant="secondary" size="sm" onClick={() => setShowTools((value) => !value)}>
          {showTools ? 'Hide tools' : 'Create & categories'}
        </Button>
        <Button variant="secondary" size="sm" onClick={() => void loadMarkets()}>
          Refresh
        </Button>
      </div>

      {error && <Alert>{error}</Alert>}

      {showTools && (
        <div className="admin-panel grid gap-4 rounded-lg border border-vantage-border bg-vantage-surface p-4 lg:grid-cols-2">
          <PanelSection title="Categories" flat>
            {categoriesLoading ? (
              <p className="m-0 text-xs text-vantage-muted">Loading categories...</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {sortedCategories.map((category) => (
                  <Tag
                    key={category}
                    removeLabel={`Remove ${category}`}
                    removeDisabled={sortedCategories.length <= 1 || removingCategory === category}
                    onRemove={() => void handleRemoveCategory(category)}
                  >
                    {formatCategoryLabel(category)}
                  </Tag>
                ))}
              </div>
            )}
            <form onSubmit={(event) => void handleAddCategory(event)} className="mt-3 flex flex-wrap items-end gap-2">
              <Field label="New category" className="min-w-[180px] flex-1">
                <Input
                  value={newCategoryName}
                  onChange={(event) => setNewCategoryName(event.target.value)}
                  placeholder="e.g. world-cup"
                  maxLength={100}
                  className="h-8 text-xs"
                />
              </Field>
              <Button type="submit" size="sm" disabled={addingCategory || !newCategoryName.trim()}>
                Add
              </Button>
            </form>
          </PanelSection>

          <PanelSection title="Create market" flat>
            <form onSubmit={(event) => void handleCreate(event)} className="grid gap-3">
              <Field label="Title">
                <Input
                  required
                  minLength={3}
                  maxLength={200}
                  value={form.title}
                  onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                  placeholder="Will it rain tomorrow?"
                  className="h-8 text-xs"
                />
              </Field>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Category">
                  <Select
                    required
                    value={form.category}
                    disabled={categoriesLoading || sortedCategories.length === 0}
                    onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
                    className="h-8 text-xs"
                  >
                    {sortedCategories.length === 0 ? (
                      <option value="">No categories</option>
                    ) : (
                      sortedCategories.map((category) => (
                        <option key={category} value={category}>
                          {formatCategoryLabel(category)}
                        </option>
                      ))
                    )}
                  </Select>
                </Field>
                <Field label="Trading ends">
                  <Input
                    required
                    type="datetime-local"
                    value={form.tradingEndsAt}
                    onChange={(event) => setForm((current) => ({ ...current, tradingEndsAt: event.target.value }))}
                    className="h-8 text-xs"
                  />
                </Field>
              </div>
              <Button type="submit" size="sm" disabled={creating || sortedCategories.length === 0} className="w-fit">
                {creating ? 'Creating...' : 'Create draft'}
              </Button>
            </form>
          </PanelSection>
        </div>
      )}

      <div className="admin-panel overflow-hidden rounded-lg border border-vantage-border bg-vantage-surface">
        <div className="admin-markets-grid">
          <aside className="admin-markets-pane border-b border-vantage-border bg-vantage-bg/30 lg:border-r lg:border-b-0">
            <div className="border-b border-vantage-border px-3 py-2.5">
              <p className="m-0 text-[11px] font-semibold tracking-[0.08em] text-vantage-muted uppercase">
                Categories
              </p>
            </div>
            <div className="admin-markets-scroll p-2">
              {categoriesLoading && (
                <p className="m-0 px-2 py-3 text-xs text-vantage-muted">Loading...</p>
              )}
              {!categoriesLoading && sortedCategories.length === 0 && (
                <p className="m-0 px-2 py-3 text-xs text-vantage-muted">No categories yet.</p>
              )}
              <ul className="m-0 list-none space-y-0.5 p-0">
                {sortedCategories.map((category) => {
                  const active = selectedCategory === category;
                  const count = categoryCounts.get(category) ?? 0;

                  return (
                    <li key={category}>
                      <button
                        type="button"
                        onClick={() => handleSelectCategory(category)}
                        className={adminListBtn(
                          active,
                          'flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-sm',
                        )}
                      >
                        <span className="truncate font-medium">{formatCategoryLabel(category)}</span>
                        <span className="shrink-0 rounded bg-vantage-bg/80 px-1.5 py-0.5 tabular-nums text-[11px] text-vantage-muted">
                          {count}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </aside>

          <section className="admin-markets-pane min-w-0 border-b border-vantage-border lg:border-r lg:border-b-0">
            <div className="border-b border-vantage-border px-4 py-2.5">
              <p className="m-0 truncate text-sm font-semibold text-vantage-fg">
                {selectedCategory ? formatCategoryLabel(selectedCategory) : 'Markets'}
              </p>
            </div>

            <div className="space-y-2.5 border-b border-vantage-border px-4 py-2.5">
              <div className="flex flex-wrap gap-2">
                <Chip label="All" active={marketFilter === 'all'} onClick={() => setMarketFilter('all')} />
                <Chip label="Active" active={marketFilter === 'active'} onClick={() => setMarketFilter('active')} />
                <Chip label="Settled" active={marketFilter === 'settled'} onClick={() => setMarketFilter('settled')} />
                <Chip label="Draft" active={marketFilter === 'draft'} onClick={() => setMarketFilter('draft')} />
              </div>
              <Input
                value={marketSearch}
                onChange={(event) => setMarketSearch(event.target.value)}
                placeholder="Find market..."
                className="h-8 w-full text-xs"
              />
            </div>

            <div className="admin-markets-scroll">
              {loading && (
                <p className="m-0 px-4 py-8 text-xs text-vantage-muted">Loading markets...</p>
              )}

              {!loading && filteredMarkets.length === 0 && (
                <EmptyState
                  title="No markets found"
                  description={
                    selectedCategory
                      ? `No markets in ${formatCategoryLabel(selectedCategory)} for this filter.`
                      : 'Select a category or create a draft.'
                  }
                  className="py-12"
                />
              )}

              {!loading && filteredMarkets.length > 0 && (
                <ul className="m-0 list-none divide-y divide-vantage-border/70 p-0">
                  {filteredMarkets.map((market) => {
                    const active = selectedMarketId === market.id;

                    return (
                      <li key={market.id}>
                        <button
                          type="button"
                          onClick={() => setSelectedMarketId(market.id)}
                          className={cn(
                            'block w-full cursor-pointer border-none px-4 py-3.5 text-left transition-colors',
                            active
                              ? 'bg-[var(--admin-nav-active-bg)]'
                              : 'bg-transparent hover:bg-[var(--color-vantage-hover)]',
                          )}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <p className={cn(
                              'm-0 line-clamp-2 text-sm font-semibold leading-snug',
                              active ? 'text-[var(--admin-nav-active-fg)]' : 'text-vantage-fg',
                            )}
                            >
                              {market.title}
                            </p>
                            <StatusBadge
                              status={market.status}
                              visible={market.isVisible}
                              winningOutcome={market.winningOutcome}
                            />
                          </div>
                          <p className="m-0 mt-1.5 text-xs text-vantage-muted">
                            {toCardPercent(market.yesProbability)}% Yes · {market.yesMultiplier.toFixed(2)}x
                            {' · '}
                            ends {new Date(market.tradingEndsAt).toLocaleDateString()}
                          </p>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </section>

          <aside className="admin-markets-pane min-w-0 bg-vantage-bg/20">
            {selectedMarket ? (
              <AdminDetailPanel
                title={selectedMarket.title}
                subtitle={formatCategoryLabel(selectedMarket.category)}
                footer={
                  <MarketAdminActions
                    market={selectedMarket}
                    publishingId={publishingId}
                    closingId={closingId}
                    resolvingId={resolvingId}
                    settlingId={settlingId}
                    onPublish={handlePublish}
                    onClose={handleClose}
                    onResolve={handleResolve}
                    onSettle={handleSettle}
                  />
                }
              >
                <MarketDetailsPanel
                  market={selectedMarket}
                  odds={marketDetails.odds}
                  bets={marketDetails.bets}
                  loading={marketDetails.loading}
                  error={marketDetails.error}
                  embedded
                />
              </AdminDetailPanel>
            ) : (
              <AdminEmptyAside message="Select a category, then click a market to view details and actions." />
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}

function MarketAdminActions({
  market,
  publishingId,
  closingId,
  resolvingId,
  settlingId,
  onPublish,
  onClose,
  onResolve,
  onSettle,
}: {
  market: MarketDto;
  publishingId: string | null;
  closingId: string | null;
  resolvingId: string | null;
  settlingId: string | null;
  onPublish: (id: string) => void;
  onClose: (id: string) => void;
  onResolve: (id: string, outcome: Outcome) => void;
  onSettle: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {isDraftMarket(market) && (
        <Button
          size="sm"
          disabled={publishingId === market.id}
          onClick={() => onPublish(market.id)}
        >
          {publishingId === market.id ? 'Publishing...' : 'Publish'}
        </Button>
      )}
      {isOpenMarket(market) && (
        <Button
          variant="secondary"
          size="sm"
          disabled={closingId === market.id}
          onClick={() => onClose(market.id)}
        >
          {closingId === market.id ? 'Closing...' : 'Close trading'}
        </Button>
      )}
      {isClosingMarket(market) && (
        <>
          <Button
            size="sm"
            disabled={resolvingId === market.id}
            onClick={() => onResolve(market.id, 'Yes')}
          >
            {resolvingId === market.id ? 'Resolving...' : 'Resolve Yes'}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            disabled={resolvingId === market.id}
            onClick={() => onResolve(market.id, 'No')}
          >
            Resolve No
          </Button>
        </>
      )}
      {isResolvedMarket(market) && (
        <Button
          size="sm"
          disabled={settlingId === market.id}
          onClick={() => onSettle(market.id)}
        >
          {settlingId === market.id ? 'Settling...' : 'Settle'}
        </Button>
      )}
    </div>
  );
}

function StatusBadge({
  status,
  visible,
  winningOutcome,
}: {
  status: MarketDto['status'];
  visible: boolean;
  winningOutcome?: MarketDto['winningOutcome'];
}) {
  const statusName = normalizeMarketStatus(status);
  const label = formatMarketStatus(status);
  const isDraft = statusName === 'Draft';
  const isLive = statusName === 'Open' || statusName === 'Closing';
  const isSettled = statusName === 'Settled' || statusName === 'Resolved';

  return (
    <Badge variant={isDraft ? 'draft' : isSettled ? 'draft' : 'accent'}>
      {label}
      {visible && isLive ? ' · Live' : ''}
      {isSettled && winningOutcome ? ` · ${winningOutcome}` : ''}
    </Badge>
  );
}
