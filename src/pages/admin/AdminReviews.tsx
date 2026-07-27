/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { Star, Eye, EyeOff, Trash2, MessageSquare, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { adminReviews } from '../../data/adminData';
import { AdminDataTable } from '../../components/admin/AdminDataTable';
import { AdminConfirmModal } from '../../components/admin/AdminConfirmModal';
import { AdminStatsCard } from '../../components/admin/AdminStatsCard';
import { useToast } from '../../components/ui/Toast';

const filters = ['All', 'Visible', 'Hidden'] as const;

const AdminReviews = () => {
  const { toast } = useToast();
  const [localReviews, setLocalReviews] = useState(adminReviews);
  const [selectedReview, setSelectedReview] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<(typeof filters)[number]>('All');

  const filteredReviews = useMemo(() => {
    if (activeFilter === 'Visible') return localReviews.filter((r) => r.isVisible);
    if (activeFilter === 'Hidden') return localReviews.filter((r) => !r.isVisible);
    return localReviews;
  }, [localReviews, activeFilter]);

  const visibleCount = localReviews.filter((r) => r.isVisible).length;
  const hiddenCount = localReviews.filter((r) => !r.isVisible).length;
  const avgRating = localReviews.length
    ? (localReviews.reduce((sum, r) => sum + r.rating, 0) / localReviews.length).toFixed(1)
    : '0';

  const selectedReviewData = localReviews.find((r) => r.id === selectedReview);

  const handleToggleVisibility = (id: string) => {
    setLocalReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isVisible: !r.isVisible } : r))
    );
    const review = localReviews.find((r) => r.id === id);
    toast(review?.isVisible ? 'Review hidden' : 'Review is now visible');
  };

  const handleDelete = (id: string) => {
    setLocalReviews((prev) => prev.filter((r) => r.id !== id));
    setSelectedReview(null);
    toast('Review deleted successfully');
  };

  const renderStars = (rating: number, size: 'sm' | 'lg' = 'sm') => {
    const sizeClass = size === 'lg' ? 'h-5 w-5' : 'h-3.5 w-3.5';
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn(sizeClass, i < rating ? 'text-[#D4AF37] fill-[#D4AF37]' : 'text-gray-200 dark:text-gray-700')}
          />
        ))}
      </div>
    );
  };

  const columns = [
    {
      key: 'reviewerName',
      label: 'Reviewer',
      sortable: true,
      render: (val: string) => (
        <span className="font-bold">{val}</span>
      ),
    },
    {
      key: 'modelName',
      label: 'Model',
      sortable: true,
    },
    {
      key: 'rating',
      label: 'Rating',
      sortable: true,
      render: (val: number) => renderStars(val),
    },
    {
      key: 'comment',
      label: 'Comment',
      render: (val: string) => (
        <span className="text-gray-500 dark:text-gray-400 max-w-[200px] truncate inline-block" title={val}>
          {val.length > 50 ? `${val.substring(0, 50)}...` : val}
        </span>
      ),
    },
    {
      key: 'date',
      label: 'Date',
      sortable: true,
    },
    {
      key: 'isVisible',
      label: 'Visibility',
      render: (val: boolean) => (
        <span className={cn(
          'inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider',
          val
            ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400'
            : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
        )}>
          {val ? 'Visible' : 'Hidden'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: (_: any, row: any) => (
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedReview(row.id);
            }}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="View full review"
          >
            <Eye className="h-3.5 w-3.5 text-gray-400" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggleVisibility(row.id);
            }}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title={row.isVisible ? 'Hide review' : 'Show review'}
          >
            {row.isVisible ? (
              <EyeOff className="h-3.5 w-3.5 text-gray-400" />
            ) : (
              <Eye className="h-3.5 w-3.5 text-gray-400" />
            )}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowConfirm(row.id);
            }}
            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            title="Delete review"
          >
            <Trash2 className="h-3.5 w-3.5 text-red-400" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#111111] dark:text-white">Reviews</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage model reviews and visibility</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <AdminStatsCard
          title="Total Reviews"
          value={localReviews.length}
          icon={MessageSquare}
          color="bg-[#D4AF37]/10 text-[#D4AF37]"
        />
        <AdminStatsCard
          title="Visible"
          value={visibleCount}
          icon={Eye}
          color="bg-green-50 text-green-500"
          change={`${Math.round((visibleCount / localReviews.length) * 100)}%`}
          changeType="positive"
        />
        <AdminStatsCard
          title="Hidden"
          value={hiddenCount}
          icon={EyeOff}
          color="bg-gray-100 text-gray-500"
          change={`${Math.round((hiddenCount / localReviews.length) * 100)}%`}
          changeType="negative"
        />
        <AdminStatsCard
          title="Average Rating"
          value={avgRating}
          icon={Star}
          color="bg-yellow-50 text-yellow-500"
          change={`${localReviews.length} reviews`}
          changeType="neutral"
        />
      </div>

      <div className="flex items-center gap-2">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-bold transition-all',
              activeFilter === filter
                ? 'bg-[#D4AF37] text-white shadow-lg shadow-[#D4AF37]/20'
                : 'bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-gray-500 hover:text-[#111111] dark:hover:text-white hover:border-[#D4AF37]/30'
            )}
          >
            {filter}
          </button>
        ))}
      </div>

      <AdminDataTable
        columns={columns}
        data={filteredReviews}
        searchKey="modelName"
        searchPlaceholder="Search by model name..."
        emptyMessage="No reviews found for this filter."
      />

      <AnimatePresence>
        {selectedReviewData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setSelectedReview(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className={cn(
                'relative w-full max-w-lg',
                'bg-white dark:bg-gray-900',
                'border border-gray-100 dark:border-gray-800',
                'rounded-2xl p-6',
                'shadow-2xl'
              )}
            >
              <button
                onClick={() => setSelectedReview(null)}
                className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>

              <div className="mb-4">
                <h3 className="text-lg font-bold text-[#111111] dark:text-white mb-1">Full Review</h3>
                <p className="text-xs text-gray-400">{selectedReviewData.date}</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Reviewer</p>
                    <p className="text-sm font-bold text-[#111111] dark:text-white">{selectedReviewData.reviewerName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400 mb-0.5">Model</p>
                    <p className="text-sm font-bold text-[#111111] dark:text-white">{selectedReviewData.modelName}</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-center gap-2 mb-3">
                    {renderStars(selectedReviewData.rating, 'lg')}
                    <span className="text-sm font-bold text-[#111111] dark:text-white">{selectedReviewData.rating}/5</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{selectedReviewData.comment}</p>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className={cn(
                    'inline-flex items-center px-3 py-1 rounded-full text-xs font-bold',
                    selectedReviewData.isVisible
                      ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                  )}>
                    {selectedReviewData.isVisible ? 'Visible' : 'Hidden'}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleVisibility(selectedReviewData.id)}
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors',
                        'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700',
                        'text-gray-600 dark:text-gray-400'
                      )}
                    >
                      {selectedReviewData.isVisible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      {selectedReviewData.isVisible ? 'Hide' : 'Show'}
                    </button>
                    <button
                      onClick={() => {
                        setShowConfirm(selectedReviewData.id);
                      }}
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors',
                        'bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30',
                        'text-red-600 dark:text-red-400'
                      )}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AdminConfirmModal
        isOpen={!!showConfirm}
        onClose={() => setShowConfirm(null)}
        onConfirm={() => {
          if (showConfirm) handleDelete(showConfirm);
        }}
        title="Delete Review"
        message="Are you sure you want to delete this review? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
};

export default AdminReviews;
