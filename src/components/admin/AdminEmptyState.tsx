/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { type LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface AdminEmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const AdminEmptyState = ({
  icon: Icon,
  title,
  description,
  action,
}: AdminEmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div
        className={cn(
          'flex items-center justify-center',
          'h-20 w-20 rounded-full',
          'bg-gray-100 dark:bg-gray-800'
        )}
      >
        <Icon className="h-10 w-10 text-gray-300 dark:text-gray-600" />
      </div>
      <h3 className="mt-6 text-lg font-bold text-[#111111] dark:text-white">
        {title}
      </h3>
      <p className="mt-2 max-w-sm text-sm text-gray-500 dark:text-gray-400">
        {description}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className={cn(
            'mt-6 inline-flex items-center gap-2',
            'rounded-xl bg-[#D4AF37] px-6 py-2.5',
            'text-sm font-bold text-white uppercase tracking-widest',
            'hover:bg-[#C5A028] transition-colors',
            'active:scale-95'
          )}
        >
          {action.label}
        </button>
      )}
    </div>
  );
};
