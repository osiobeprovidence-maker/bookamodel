/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

interface AdminConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export const AdminConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  variant = 'danger',
}: AdminConfirmModalProps) => {
  const variantStyles = {
    danger: 'bg-red-500 hover:bg-red-600',
    warning: 'bg-orange-500 hover:bg-orange-600',
    info: 'bg-[#D4AF37] hover:bg-[#C5A028]',
  };

  const iconColor = {
    danger: 'text-red-500',
    warning: 'text-orange-500',
    info: 'text-[#D4AF37]',
  };

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={cn(
              'relative w-full max-w-md',
              'bg-white dark:bg-gray-900',
              'border border-gray-100 dark:border-gray-800',
              'rounded-2xl p-6',
              'shadow-2xl'
            )}
          >
            <button
              onClick={onClose}
              className={cn(
                'absolute top-4 right-4',
                'flex items-center justify-center h-8 w-8',
                'rounded-lg text-gray-400 hover:text-gray-600',
                'hover:bg-gray-100 dark:hover:bg-gray-800',
                'transition-colors'
              )}
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div
                className={cn(
                  'flex items-center justify-center',
                  'h-10 w-10 rounded-full',
                  'bg-gray-100 dark:bg-gray-800',
                  iconColor[variant]
                )}
              >
                <span className="text-lg font-bold">!</span>
              </div>
              <h3 className="text-lg font-bold text-[#111111] dark:text-white">
                {title}
              </h3>
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              {message}
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={onClose}
                className={cn(
                  'px-4 py-2 rounded-xl text-sm font-bold',
                  'text-gray-600 dark:text-gray-400',
                  'hover:bg-gray-100 dark:hover:bg-gray-800',
                  'transition-colors'
                )}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={cn(
                  'px-4 py-2 rounded-xl text-sm font-bold text-white',
                  'transition-colors active:scale-95',
                  variantStyles[variant]
                )}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
