import type { ReactNode } from 'react';
import { cn } from './cn';

export interface DataTableColumn<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  selectedKey?: string | null;
  compact?: boolean;
  dense?: boolean;
  bordered?: boolean;
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  emptyMessage = 'No records found.',
  onRowClick,
  selectedKey,
  compact = false,
  dense = false,
  bordered = true,
}: DataTableProps<T>) {
  if (rows.length === 0) {
    return (
      <div className="px-3 py-8 text-center text-xs text-vantage-muted">
        {emptyMessage}
      </div>
    );
  }

  const cellPad = dense ? 'px-2.5 py-1.5' : compact ? 'px-3 py-2' : 'px-4 py-3';
  const headPad = dense ? 'px-2.5 py-1.5' : compact ? 'px-3 py-2' : 'px-4 py-3';
  const textSize = dense ? 'text-xs' : 'text-sm';

  return (
    <div className={cn('overflow-x-auto', bordered && 'rounded-md border border-vantage-border')}>
      <table className={cn('min-w-full border-collapse text-left', textSize)}>
        <thead className="border-b border-vantage-border bg-[var(--color-vantage-hover)]/50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={cn(
                  headPad,
                  'text-[10px] font-semibold tracking-wider text-vantage-muted uppercase',
                  column.className,
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const key = rowKey(row);
            const selected = selectedKey === key;

            return (
              <tr
                key={key}
                className={cn(
                  'border-b border-vantage-border/70 last:border-b-0 transition-colors',
                  onRowClick && 'cursor-pointer hover:bg-[var(--color-vantage-hover)]/60',
                  selected && 'bg-vantage-accent/[0.08] shadow-[inset_3px_0_0_0] shadow-vantage-accent',
                )}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
              >
                {columns.map((column) => (
                  <td key={column.key} className={cn(cellPad, 'align-middle text-vantage-fg', column.className)}>
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
}

export function StatCard({ label, value, hint }: StatCardProps) {
  return (
    <div className="admin-stat-card rounded-md border border-vantage-border bg-vantage-surface px-3 py-3">
      <p className="m-0 text-[10px] font-semibold tracking-wider text-vantage-muted uppercase">{label}</p>
      <p className="m-0 mt-1.5 text-xl font-semibold tabular-nums tracking-tight text-vantage-fg">{value}</p>
      {hint && <p className="m-0 mt-1 text-[11px] leading-snug text-vantage-muted">{hint}</p>}
    </div>
  );
}
