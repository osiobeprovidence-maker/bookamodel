/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { type LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface AdminStatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  color?: string;
}

export const AdminStatsCard = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  color = 'bg-[#D4AF37]/10 text-[#D4AF37]',
}: AdminStatsCardProps) => {
  const changeStyles = {
    positive: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
    negative: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
    neutral: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  };

  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-900 backdrop-blur-sm',
        'border border-gray-100 dark:border-gray-800',
        'rounded-2xl p-6',
        'hover:shadow-lg transition-all duration-300'
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'flex items-center justify-center',
            'h-12 w-12 rounded-full',
            color
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <span className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
          {title}
        </span>
      </div>

      <div className="mt-4">
        <p className="text-3xl font-bold text-[#111111] dark:text-white">
          {value}
        </p>
      </div>

      {change && (
        <div className="mt-3">
          <span
            className={cn(
              'inline-flex items-center rounded-lg px-2 py-1',
              'text-[10px] font-bold uppercase tracking-wider',
              changeStyles[changeType]
            )}
          >
            {change}
          </span>
        </div>
      )}
    </div>
  );
};
