'use client';

import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';

import { Input } from '@nertura/ui';

export interface AdminColumn<T> {
  key: string;
  header: string;
  /** Optional — defaults to String(row[key]) */
  render?: (row: T) => ReactNode;
  className?: string;
}

interface AdminDataListProps<T> {
  title: string;
  description: string;
  columns: AdminColumn<T>[];
  rows: T[];
  searchPlaceholder?: string;
  searchKeys?: (keyof T)[];
  emptyMessage?: string;
  pageSize?: number;
  toolbar?: ReactNode;
}

export function AdminDataList<T extends { id?: string }>({
  title,
  description,
  columns,
  rows,
  searchPlaceholder = 'Search…',
  searchKeys = [],
  emptyMessage = 'No records found.',
  pageSize = 20,
  toolbar,
}: AdminDataListProps<T>) {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) =>
      searchKeys.some((key) => String(row[key] ?? '').toLowerCase().includes(q))
    );
  }, [query, rows, searchKeys]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages - 1);
  const pageRows = filtered.slice(safePage * pageSize, safePage * pageSize + pageSize);

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-void">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        </div>
        {toolbar}
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(0);
          }}
          placeholder={searchPlaceholder}
          className="max-w-sm"
        />
        <p className="text-xs text-muted-foreground">
          {filtered.length} record{filtered.length === 1 ? '' : 's'}
        </p>
      </div>

      <div className="mt-4 overflow-x-auto rounded-lg border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className={`px-4 py-3 font-medium ${col.className ?? ''}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center text-muted-foreground">
                  {emptyMessage}
                </td>
              </tr>
            )}
            {pageRows.map((row, i) => (
              <tr key={row.id ?? i} className="border-b last:border-0">
                {columns.map((col) => (
                  <td key={col.key} className={`px-4 py-3 ${col.className ?? ''}`}>
                    {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? '—')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <button
            type="button"
            className="rounded-md border px-3 py-1 disabled:opacity-40"
            disabled={safePage <= 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >
            Previous
          </button>
          <span className="text-muted-foreground">
            Page {safePage + 1} of {totalPages}
          </span>
          <button
            type="button"
            className="rounded-md border px-3 py-1 disabled:opacity-40"
            disabled={safePage >= totalPages - 1}
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
