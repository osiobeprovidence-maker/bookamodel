/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'gold' | 'outline' | 'pro' | 'verified';
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  key?: string | number;
}

export const Badge = ({ className, variant = 'default', children, ...props }: BadgeProps) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-500 text-white shadow-sm',
    warning: 'bg-orange-100 text-orange-700',
    gold: 'bg-[#D4AF37] text-white shadow-sm',
    pro: 'bg-[#D4AF37] text-black',
    verified: 'bg-blue-100 text-blue-700',
    outline: 'border border-gray-200 text-gray-600',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-lg px-2 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
