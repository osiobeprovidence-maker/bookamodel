/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { cn } from '../../lib/utils';

export const TableSkeleton = ({ rows = 5 }: { rows?: number }) => (
  <div className="space-y-0">
    {Array.from({ length: rows }).map((_, i) => (
      <div
        key={i}
        className={cn(
          'flex items-center gap-4 px-6 py-4',
          'border-b border-gray-100 dark:border-gray-800'
        )}
      >
        <div className="h-4 w-4 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
        <div className="h-4 flex-1 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
        <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
        <div className="h-4 w-20 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
        <div className="h-4 w-16 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
      </div>
    ))}
  </div>
);

export const StatsSkeleton = ({ cards = 4 }: { cards?: number }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
    {Array.from({ length: cards }).map((_, i) => (
      <div
        key={i}
        className={cn(
          'bg-white dark:bg-gray-900 backdrop-blur-sm',
          'border border-gray-100 dark:border-gray-800',
          'rounded-2xl p-6 space-y-4'
        )}
      >
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
          <div className="h-4 w-20 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
        </div>
        <div className="h-8 w-28 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
        <div className="h-3 w-16 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
      </div>
    ))}
  </div>
);
