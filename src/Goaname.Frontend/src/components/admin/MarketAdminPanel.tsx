import { useCallback, useEffect, useState } from 'react';
import {
  addCategory,
  formatCategoryLabel,
  listCategories,
  removeCategory,
} from '../../api/categories';
import {
  createMarket,
  defaultTradingEndsAt,
  formatMarketStatus,
  getMarketOdds,
  isDraftMarket,
  listAdminMarkets,
  publishMarket,
  TENANT_ID,
  toCardPercent,
  type MarketDto,
  type OddsSnapshot,
} from '../../api/markets';
import {
  Alert,
  Badge,
  Button,
  Card,
  DetailRow,
  EmptyState,
  Field,
  Input,
  PageHeader,
  PanelSection,
  Select,
  Tag,
  cn,
} from '../ui';

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
  onMarketsChanged?: () => void;
}

export function MarketAdminPanel({ onMarketsChanged }: MarketAdminPanelProps) {
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
  const [selectedMarketId, setSelectedMarketId] = useState<string | null>(null);
  const [selectedOdds, setSelectedOdds] = useState<OddsSnapshot | null>(null);
  const [oddsLoading, setOddsLoading] = useState(false);

  const loadCategories = useCallback(async () => {
    setCategoriesLoading(true);

    try {
      const items = await listCategories();
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
  }, []);

  const loadMarkets = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const items = await listAdminMarkets();
      setMarkets(items);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load admin markets');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    void loadMarkets();
  }, [loadMarkets]);

  useEffect(() => {
    if (!selectedMarketId) {
      setSelectedOdds(null);
      return;
    }

    let cancelled = false;
    setOddsLoading(true);

    void getMarketOdds(TENANT_ID, selectedMarketId)
      .then((odds) => {
        if (!cancelled) {
          setSelectedOdds(odds);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSelectedOdds(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setOddsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [selectedMarketId]);

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
      });

      setForm({
        ...emptyFormState(),
        category: form.category,
      });
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
      await addCategory(name);
      setNewCategoryName('');
      await loadCategories();
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
      await removeCategory(category);
      await loadCategories();
      setForm((current) => ({
        ...current,
        category: current.category === category ? '' : current.category,
      }));
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
      await publishMarket(marketId);
      await loadMarkets();
      onMarketsChanged?.();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to publish market');
    } finally {
      setPublishingId(null);
    }
  }

  const selectedMarket = markets.find((market) => market.id === selectedMarketId) ?? null;

  return (
    <Card className="mb-8 grid gap-6 rounded-xl p-6 shadow-sm">
      <PageHeader
        title="Manage Markets"
        subtitle="Create drafts, publish to the public catalog, and inspect odds."
        size="compact"
        action={
          <Button variant="secondary" onClick={() => void loadMarkets()}>
            Refresh
          </Button>
        }
      />

      {error && <Alert>{error}</Alert>}

      <PanelSection
        title="Manage categories"
        description="Categories available when creating markets. At least one category must remain."
      >
        {categoriesLoading && (
          <p className="m-0 text-sm text-vantage-muted">Loading categories...</p>
        )}

        {!categoriesLoading && categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Tag
                key={category}
                removeLabel={`Remove ${category}`}
                removeDisabled={categories.length <= 1 || removingCategory === category}
                onRemove={() => void handleRemoveCategory(category)}
              >
                {formatCategoryLabel(category)}
              </Tag>
            ))}
          </div>
        )}

        <form
          onSubmit={(event) => void handleAddCategory(event)}
          className="flex flex-wrap items-end gap-3"
        >
          <Field label="New category" className="min-w-[220px] flex-1">
            <Input
              value={newCategoryName}
              onChange={(event) => setNewCategoryName(event.target.value)}
              placeholder="e.g. world-cup"
              maxLength={100}
            />
          </Field>
          <Button type="submit" disabled={addingCategory || !newCategoryName.trim()}>
            {addingCategory ? 'Adding...' : 'Add category'}
          </Button>
        </form>
      </PanelSection>

      <PanelSection title="Create market">
        <form onSubmit={(event) => void handleCreate(event)} className="grid gap-4">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
            <Field label="Title">
              <Input
                required
                minLength={3}
                maxLength={200}
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                placeholder="Will it rain tomorrow?"
              />
            </Field>

            <Field label="Category">
              <Select
                required
                value={form.category}
                disabled={categoriesLoading || categories.length === 0}
                onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
              >
                {categories.length === 0 ? (
                  <option value="">No categories available</option>
                ) : (
                  categories.map((category) => (
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
              />
            </Field>

            <Field label="Liquidity (optional)">
              <Input
                type="number"
                min="1"
                step="1"
                value={form.liquidityParameter}
                onChange={(event) => setForm((current) => ({ ...current, liquidityParameter: event.target.value }))}
                placeholder="Uses tenant default"
              />
            </Field>
          </div>

          <Button type="submit" disabled={creating || categories.length === 0} className="w-fit">
            {creating ? 'Creating...' : 'Create draft'}
          </Button>
        </form>
      </PanelSection>

      <div className="grid gap-4">
        <h3 className="m-0 text-lg font-bold text-vantage-fg">All markets</h3>

        {loading && (
          <p className="m-0 text-sm text-vantage-muted">Loading markets...</p>
        )}

        {!loading && markets.length === 0 && (
          <EmptyState
            title="No markets yet"
            description="Create a draft above."
            className="rounded-xl py-8"
          />
        )}

        {!loading && markets.length > 0 && (
          <div className="grid gap-3">
            {markets.map((market) => (
              <Card
                key={market.id}
                as="article"
                variant="elevated"
                className={cn(
                  'flex flex-wrap items-center justify-between gap-4 rounded-lg p-4',
                  selectedMarketId === market.id && 'border-vantage-accent',
                )}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <strong className="text-vantage-fg">{market.title}</strong>
                    <StatusBadge status={market.status} visible={market.isVisible} />
                  </div>
                  <p className="mt-2 break-all text-sm text-vantage-muted">
                    {market.category} · ends {new Date(market.tradingEndsAt).toLocaleString()} · {market.id}
                  </p>
                  <p className="mt-2 text-sm text-vantage-muted">
                    {toCardPercent(market.yesProbability)}% Yes · {market.yesMultiplier.toFixed(2)}x /
                    {' '}{toCardPercent(market.noProbability)}% No · {market.noMultiplier.toFixed(2)}x
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary" onClick={() => setSelectedMarketId(market.id)}>
                    Details
                  </Button>
                  {isDraftMarket(market) && (
                    <Button
                      disabled={publishingId === market.id}
                      onClick={() => void handlePublish(market.id)}
                    >
                      {publishingId === market.id ? 'Publishing...' : 'Publish'}
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {selectedMarket && (
        <PanelSection title="Market details">
          <dl className="mb-4 grid grid-cols-[120px_1fr] gap-x-4 gap-y-2">
            <DetailRow label="Title" value={selectedMarket.title} />
            <DetailRow label="Status" value={formatMarketStatus(selectedMarket.status)} />
            <DetailRow label="Visible" value={selectedMarket.isVisible ? 'Yes' : 'No'} />
            <DetailRow label="Volume" value={`$${selectedMarket.totalVolume.toFixed(2)}`} />
            <DetailRow label="Traders" value={String(selectedMarket.uniqueTraders)} />
          </dl>

          {oddsLoading && (
            <p className="m-0 text-sm text-vantage-muted">Loading live odds...</p>
          )}

          {!oddsLoading && selectedOdds && (
            <div className="grid gap-2 text-sm text-vantage-muted">
              <p className="m-0">Yes: {toCardPercent(selectedOdds.yesProbability)}% ({selectedOdds.yesMultiplier.toFixed(2)}x)</p>
              <p className="m-0">No: {toCardPercent(selectedOdds.noProbability)}% ({selectedOdds.noMultiplier.toFixed(2)}x)</p>
            </div>
          )}
        </PanelSection>
      )}
    </Card>
  );
}

function StatusBadge({ status, visible }: { status: MarketDto['status']; visible: boolean }) {
  const label = formatMarketStatus(status);
  const isDraft = status === 0;

  return (
    <Badge variant={isDraft ? 'draft' : 'accent'}>
      {label}{visible ? ' · Live' : ''}
    </Badge>
  );
}
