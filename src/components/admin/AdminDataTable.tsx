/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, type ReactNode } from 'react';
import { Search, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

interface Column {
  key: string;
  label: string;
  render?: (value: any, row: any) => ReactNode;
  sortable?: boolean;
  className?: string;
}

interface AdminDataTableProps {
  columns: Column[];
  data: any[];
  searchPlaceholder?: string;
  searchKey?: string;
  loading?: boolean;
  emptyMessage?: string;
}

const ITEMS_PER_PAGE = 10;

export const AdminDataTable = ({
  columns,
  data,
  searchPlaceholder = 'Search...',
  searchKey,
  loading = false,
  emptyMessage = 'No results found.',
}: AdminDataTableProps) => {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (!search || !searchKey) return data;
    const q = search.toLowerCase();
    return data.filter((row) =>
      String(row[searchKey]).toLowerCase().includes(q)
    );
  }, [data, search, searchKey]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const aVal = a[sortKey] ?? '';
      const bVal = b[sortKey] ?? '';
      const cmp = String(aVal).localeCompare(String(bVal), undefined, {
        numeric: true,
      });
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / ITEMS_PER_PAGE));
  const paged = sorted.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-900 backdrop-blur-sm',
        'border border-gray-100 dark:border-gray-800',
        'rounded-2xl overflow-hidden'
      )}
    >
      {searchKey && (
        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className={cn(
                'w-full pl-10 pr-4 py-2.5 rounded-xl',
                'bg-gray-50 dark:bg-gray-800',
                'border border-gray-200 dark:border-gray-700',
                'text-sm text-[#111111] dark:text-white',
                'placeholder:text-gray-400',
                'focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37]',
                'transition-all'
              )}
            />
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    'px-6 py-3 text-left',
                    'text-[10px] font-bold uppercase tracking-widest',
                    'text-gray-400 dark:text-gray-500',
                    'border-b border-gray-100 dark:border-gray-800',
                    col.sortable &&
                      'cursor-pointer select-none hover:text-[#111111] dark:hover:text-white',
                    col.className
                  )}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <span className="inline-flex items-center gap-1.5">
                    {col.label}
                    {col.sortable && (
                      <ArrowUpDown
                        className={cn(
                          'h-3 w-3',
                          sortKey === col.key
                            ? 'text-[#D4AF37]'
                            : 'opacity-30'
                        )}
                      />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <tr
                    key={`skel-${i}`}
                    className="border-b border-gray-100 dark:border-gray-800"
                  >
                    {columns.map((col) => (
                      <td key={col.key} className="px-6 py-4">
                        <div className="h-4 w-full max-w-[120px] rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              : paged.length === 0
                ? (
                    <tr>
                      <td
                        colSpan={columns.length}
                        className="px-6 py-16 text-center"
                      >
                        <p className="text-sm text-gray-400 dark:text-gray-500">
                          {emptyMessage}
                        </p>
                      </td>
                    </tr>
                  )
                : paged.map((row, i) => (
                    <tr
                      key={i}
                      className={cn(
                        'border-b border-gray-100 dark:border-gray-800',
                        'hover:bg-gray-50 dark:hover:bg-gray-800/50',
                        'transition-colors'
                      )}
                    >
                      {columns.map((col) => (
                        <td
                          key={col.key}
                          className={cn(
                            'px-6 py-4 text-sm',
                            'text-[#111111] dark:text-white',
                            col.className
                          )}
                        >
                          {col.render
                            ? col.render(row[col.key], row)
                            : row[col.key]}
                        </td>
                      ))}
                    </tr>
                  ))}
          </tbody>
        </table>
      </div>

      {sorted.length > ITEMS_PER_PAGE && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-gray-800">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            {sorted.length} result{sorted.length !== 1 && 's'}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className={cn(
                'flex items-center justify-center h-8 w-8 rounded-lg',
                'text-gray-400 hover:text-[#111111] dark:hover:text-white',
                'hover:bg-gray-100 dark:hover:bg-gray-800',
                'disabled:opacity-30 disabled:pointer-events-none',
                'transition-colors'
              )}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs font-bold text-gray-400 dark:text-gray-500">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className={cn(
                'flex items-center justify-center h-8 w-8 rounded-lg',
                'text-gray-400 hover:text-[#111111] dark:hover:text-white',
                'hover:bg-gray-100 dark:hover:bg-gray-800',
                'disabled:opacity-30 disabled:pointer-events-none',
                'transition-colors'
              )}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
