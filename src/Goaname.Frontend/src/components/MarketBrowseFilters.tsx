import {
  categoriesMatch,
  formatCategoryLabel,
} from '../api/categories';
import type { MarketDto } from '../api/markets';
import { inputClass } from './ui/classes';

export type CategoryFilter = 'all' | string;

interface MarketBrowseFiltersProps {
  categories: string[];
  searchQuery: string;
  selectedCategory: CategoryFilter;
  onSearchChange: (value: string) => void;
  onCategoryChange: (category: CategoryFilter) => void;
}

export function MarketBrowseFilters({
  categories,
  searchQuery,
  selectedCategory,
  onSearchChange,
  onCategoryChange,
}: MarketBrowseFiltersProps) {
  return (
    <div className="mb-6 grid gap-4">
      <input
        type="search"
        value={searchQuery}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Search markets..."
        className={inputClass}
      />

      <div className="flex flex-wrap gap-2">
        <CategoryChip
          label="All"
          active={selectedCategory === 'all'}
          onClick={() => onCategoryChange('all')}
        />
        {categories.map((category) => (
          <CategoryChip
            key={category}
            label={formatCategoryLabel(category)}
            active={selectedCategory === category}
            onClick={() => onCategoryChange(category)}
          />
        ))}
      </div>
    </div>
  );
}

function CategoryChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`cursor-pointer whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold transition ${
        active
          ? 'border-blue-500 bg-blue-500 text-white'
          : 'border-slate-600 bg-slate-800 text-slate-100 hover:border-slate-500'
      }`}
    >
      {label}
    </button>
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
