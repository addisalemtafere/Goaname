import { useCallback, useEffect, useState } from 'react';
import {
  addCategory,
  formatCategoryLabel,
  listCategories,
  removeCategory,
} from '../api/categories';
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
} from '../api/markets';
import { btnPrimary, btnSecondary, inputClass, labelClass } from './ui/classes';

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
    <section className="mb-8 grid gap-6 rounded-xl border border-slate-700 bg-slate-800 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="m-0 text-xl font-bold text-slate-100">Manage Markets</h2>
          <p className="mt-2 text-sm text-slate-400">
            Create drafts, publish to the public catalog, and inspect odds. A dedicated admin dashboard will replace this later.
          </p>
        </div>
        <button type="button" onClick={() => void loadMarkets()} className={btnSecondary}>
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500 bg-red-500/10 px-4 py-3 text-red-400">
          {error}
        </div>
      )}

      <section className="grid gap-4 rounded-lg border border-slate-700 bg-slate-900/50 p-5">
        <h3 className="m-0 text-lg font-semibold text-slate-100">Manage categories</h3>
        <p className="m-0 mb-4 text-sm text-slate-400">
          Categories available when creating markets. At least one category must remain.
        </p>

        {categoriesLoading && (
          <div className="mb-4 text-slate-400">Loading categories...</div>
        )}

        {!categoriesLoading && categories.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {categories.map((category) => (
              <span
                key={category}
                className="inline-flex items-center gap-2 rounded-full border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-slate-200"
              >
                {formatCategoryLabel(category)}
                <button
                  type="button"
                  disabled={categories.length <= 1 || removingCategory === category}
                  onClick={() => void handleRemoveCategory(category)}
                  aria-label={`Remove ${category}`}
                  className="cursor-pointer border-none bg-transparent p-0 text-lg leading-none text-slate-500 hover:text-slate-300 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        <form
          onSubmit={(event) => void handleAddCategory(event)}
          className="flex flex-wrap items-end gap-3"
        >
          <label className={`${labelClass} min-w-[220px] flex-1`}>
            New category
            <input
              value={newCategoryName}
              onChange={(event) => setNewCategoryName(event.target.value)}
              placeholder="e.g. world-cup"
              maxLength={100}
              className={inputClass}
            />
          </label>
          <button
            type="submit"
            disabled={addingCategory || !newCategoryName.trim()}
            className={btnPrimary}
          >
            {addingCategory ? 'Adding...' : 'Add category'}
          </button>
        </form>
      </section>

      <form
        onSubmit={(event) => void handleCreate(event)}
        className="grid gap-4 rounded-lg border border-slate-700 bg-slate-900/50 p-5"
      >
        <h3 className="m-0 text-lg font-semibold text-slate-100">Create market</h3>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
          <label className={labelClass}>
            Title
            <input
              required
              minLength={3}
              maxLength={200}
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              placeholder="Will it rain tomorrow?"
              className={inputClass}
            />
          </label>

          <label className={labelClass}>
            Category
            <select
              required
              value={form.category}
              disabled={categoriesLoading || categories.length === 0}
              onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
              className={inputClass}
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
            </select>
          </label>

          <label className={labelClass}>
            Trading ends
            <input
              required
              type="datetime-local"
              value={form.tradingEndsAt}
              onChange={(event) => setForm((current) => ({ ...current, tradingEndsAt: event.target.value }))}
              className={inputClass}
            />
          </label>

          <label className={labelClass}>
            Liquidity (optional)
            <input
              type="number"
              min="1"
              step="1"
              value={form.liquidityParameter}
              onChange={(event) => setForm((current) => ({ ...current, liquidityParameter: event.target.value }))}
              placeholder="Uses tenant default"
              className={inputClass}
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={creating || categories.length === 0}
          className={`${btnPrimary} w-fit`}
        >
          {creating ? 'Creating...' : 'Create draft'}
        </button>
      </form>

      <div className="grid gap-4">
        <h3 className="m-0 text-lg font-semibold text-slate-100">All markets</h3>

        {loading && (
          <div className="text-slate-400">Loading markets...</div>
        )}

        {!loading && markets.length === 0 && (
          <div className="rounded-lg border border-dashed border-slate-600 p-4 text-slate-400">
            No markets yet. Create a draft above.
          </div>
        )}

        {!loading && markets.length > 0 && (
          <div className="grid gap-3">
            {markets.map((market) => (
              <article
                key={market.id}
                className={`flex flex-wrap items-center justify-between gap-4 rounded-lg border bg-slate-900/50 p-4 ${
                  selectedMarketId === market.id ? 'border-blue-500' : 'border-slate-700'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <strong className="text-slate-100">{market.title}</strong>
                    <StatusBadge status={market.status} visible={market.isVisible} />
                  </div>
                  <div className="mt-2 break-all text-sm text-slate-500">
                    {market.category} · ends {new Date(market.tradingEndsAt).toLocaleString()} · {market.id}
                  </div>
                  <div className="mt-2 text-sm text-slate-500">
                    {toCardPercent(market.yesProbability)}% Yes · {market.yesMultiplier.toFixed(2)}x /
                    {' '}{toCardPercent(market.noProbability)}% No · {market.noMultiplier.toFixed(2)}x
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedMarketId(market.id)}
                    className={btnSecondary}
                  >
                    Details
                  </button>
                  {isDraftMarket(market) && (
                    <button
                      type="button"
                      disabled={publishingId === market.id}
                      onClick={() => void handlePublish(market.id)}
                      className={btnPrimary}
                    >
                      {publishingId === market.id ? 'Publishing...' : 'Publish'}
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {selectedMarket && (
        <aside className="rounded-lg border border-slate-700 bg-slate-900/50 p-5">
          <h3 className="m-0 text-lg font-semibold text-slate-100">Market details</h3>
          <dl className="mb-4 mt-4 grid grid-cols-[120px_1fr] gap-x-4 gap-y-2">
            <DetailRow label="Title" value={selectedMarket.title} />
            <DetailRow label="Status" value={formatMarketStatus(selectedMarket.status)} />
            <DetailRow label="Visible" value={selectedMarket.isVisible ? 'Yes' : 'No'} />
            <DetailRow label="Volume" value={`$${selectedMarket.totalVolume.toFixed(2)}`} />
            <DetailRow label="Traders" value={String(selectedMarket.uniqueTraders)} />
          </dl>

          {oddsLoading && (
            <div className="text-sm text-slate-400">Loading live odds...</div>
          )}

          {!oddsLoading && selectedOdds && (
            <div className="grid gap-2 text-sm text-slate-400">
              <div>Yes: {toCardPercent(selectedOdds.yesProbability)}% ({selectedOdds.yesMultiplier.toFixed(2)}x)</div>
              <div>No: {toCardPercent(selectedOdds.noProbability)}% ({selectedOdds.noMultiplier.toFixed(2)}x)</div>
            </div>
          )}
        </aside>
      )}
    </section>
  );
}

function StatusBadge({ status, visible }: { status: MarketDto['status']; visible: boolean }) {
  const label = formatMarketStatus(status);
  const isDraft = status === 0;

  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
        isDraft
          ? 'bg-amber-500/15 text-amber-400'
          : 'bg-emerald-500/15 text-emerald-400'
      }`}
    >
      {label}{visible ? ' · Live' : ''}
    </span>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt className="m-0 text-sm text-slate-500">{label}</dt>
      <dd className="m-0 text-sm text-slate-200">{value}</dd>
    </>
  );
}
