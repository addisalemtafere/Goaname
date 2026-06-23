import { parseJsonResponse, readErrorMessage } from './client';
import { apiFetch } from './http';
import { TENANT_ID } from './auth';

export { TENANT_ID };

export const CATEGORY_DISPLAY_ORDER = [
  'world-cup',
  'celebrity',
  'events',
  'fights',
  'finance',
  'global',
  'mentions',
  'music',
  'nairobi-chronics',
  'politics',
  'sports',
  'weather',
] as const;

const CATEGORY_LABEL_OVERRIDES: Record<string, string> = {
  'world-cup': 'World Cup',
  'nairobi-chronics': 'Nairobi Chronics',
};

export function formatCategoryLabel(category: string): string {
  const key = category.trim().toLowerCase();
  if (CATEGORY_LABEL_OVERRIDES[key]) {
    return CATEGORY_LABEL_OVERRIDES[key];
  }

  return category
    .split(/[\s-_]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function sortCategories(categories: string[]): string[] {
  return [...categories].sort((left, right) => {
    const leftIndex = CATEGORY_DISPLAY_ORDER.indexOf(left.toLowerCase() as typeof CATEGORY_DISPLAY_ORDER[number]);
    const rightIndex = CATEGORY_DISPLAY_ORDER.indexOf(right.toLowerCase() as typeof CATEGORY_DISPLAY_ORDER[number]);

    if (leftIndex === -1 && rightIndex === -1) {
      return left.localeCompare(right);
    }

    if (leftIndex === -1) {
      return 1;
    }

    if (rightIndex === -1) {
      return -1;
    }

    return leftIndex - rightIndex;
  });
}

export function categoriesMatch(marketCategory: string, filterCategory: string): boolean {
  return marketCategory.localeCompare(filterCategory, undefined, { sensitivity: 'accent' }) === 0;
}

export async function listCategories(tenantId: string = TENANT_ID): Promise<string[]> {
  const response = await fetch(`/api/tenants/${tenantId}/categories`);
  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  const categories = await parseJsonResponse<string[]>(response);
  return sortCategories(categories);
}

export async function addCategory(name: string, tenantId: string = TENANT_ID): Promise<void> {
  await apiFetch<void>(`/api/tenants/${tenantId}/admin/categories`, {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
}

export async function removeCategory(name: string, tenantId: string = TENANT_ID): Promise<void> {
  await apiFetch<void>(
    `/api/tenants/${tenantId}/admin/categories/${encodeURIComponent(name)}`,
    { method: 'DELETE' },
  );
}
