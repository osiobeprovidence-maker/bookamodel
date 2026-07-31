import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export interface EmptyStateAction {
  label: string;
  onClick?: () => void;
  primary?: boolean;
  icon?: ReactNode;
}

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  actions?: EmptyStateAction[];
  footer?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, actions, footer, className }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={cn('bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-12 sm:px-12 text-center', className)}
    >
      <div className="relative w-16 h-16 mx-auto mb-5">
        <div className="absolute inset-0 rounded-2xl bg-[#D4AF37]/10 rotate-6 transition-transform duration-300" />
        <div className="absolute inset-0 rounded-2xl bg-[#D4AF37]/10 -rotate-6 transition-transform duration-300" />
        <div className="relative w-16 h-16 rounded-2xl bg-white border border-[#D4AF37]/20 flex items-center justify-center shadow-sm">
          <div className="text-[#D4AF37]">{icon}</div>
        </div>
      </div>

      <h3 className="text-lg sm:text-xl font-bold text-[#111111] mb-2">{title}</h3>
      <p className="text-sm text-gray-500 max-w-md mx-auto leading-relaxed">{description}</p>

      {actions && actions.length > 0 && (
        <div className="flex flex-wrap justify-center gap-3 mt-7">
          {actions.map((action) => (
            <button
              key={action.label}
              onClick={action.onClick}
              className={cn(
                'inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all active:scale-[0.98]',
                action.primary
                  ? 'bg-[#D4AF37] text-white shadow-sm shadow-[#D4AF37]/30 hover:bg-[#C5A028]'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              {action.icon}
              {action.label}
            </button>
          ))}
        </div>
      )}

      {footer && (
        <div className="mt-8 pt-6 border-t border-gray-100">{footer}</div>
      )}
    </motion.div>
  );
}

export function ListSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.08 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
        >
          <div className="h-4 w-1/3 bg-gray-200 rounded-lg mb-4 animate-pulse" />
          <div className="h-3 w-2/3 bg-gray-100 rounded-lg mb-2 animate-pulse" />
          <div className="h-3 w-1/2 bg-gray-100 rounded-lg animate-pulse" />
        </motion.div>
      ))}
    </div>
  );
}

export function StatSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="h-3 w-20 bg-gray-200 rounded-lg mb-4 animate-pulse" />
          <div className="h-7 w-10 bg-gray-100 rounded-lg animate-pulse" />
        </div>
      ))}
    </div>
  );
}
