import {
  categoriesMatch,
  formatCategoryLabel,
} from '../../api/categories';
import type { MarketDto } from '../../api/markets';
import { Chip, Input } from '../ui';

export type CategoryFilter = 'all' | string;

interface MarketBrowseFiltersProps {
  categories: string[];
  searchQuery: string;
  selectedCategory: CategoryFilter;
  onSearchChange: (value: string) => void;
  onCategoryChange: (category: CategoryFilter) => void;
  resultCount?: number;
}

export function MarketBrowseFilters({
  categories,
  searchQuery,
  selectedCategory,
  onSearchChange,
  onCategoryChange,
  resultCount,
}: MarketBrowseFiltersProps) {
  return (
    <div className="mb-8 grid gap-5">
      <div className="relative">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-vantage-muted" />
        <Input
          type="search"
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search markets..."
          className="game-search py-3.5 pr-4 pl-11 sm:py-4 sm:pr-28"
        />
        {resultCount !== undefined && (
          <span className="pointer-events-none absolute top-1/2 right-4 hidden -translate-y-1/2 text-xs font-bold tracking-wider text-vantage-muted uppercase sm:inline">
            {resultCount} Results
          </span>
        )}
      </div>

      <div className="-mx-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex gap-2 px-1 pb-1">
          <Chip label="All" active={selectedCategory === 'all'} onClick={() => onCategoryChange('all')} />
          {categories.map((category) => (
            <Chip
              key={category}
              label={formatCategoryLabel(category)}
              active={selectedCategory === category}
              onClick={() => onCategoryChange(category)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3-3" />
    </svg>
  );
}

export function filterMarkets(
  markets: MarketDto[],
  searchQuery: string,
  selectedCategory: CategoryFilter,
): MarketDto[] {
  const query = searchQuery.trim().toLowerCase();

  return markets.filter((market) => {
    const matchesCategory = selectedCategory === 'all'
      || categoriesMatch(market.category, selectedCategory);

    if (!matchesCategory) {
      return false;
    }

    if (!query) {
      return true;
    }

    return market.title.toLowerCase().includes(query)
      || market.category.toLowerCase().includes(query);
  });
}
