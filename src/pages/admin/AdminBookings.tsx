/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect } from 'react';
import { CalendarCheck, X, MoreHorizontal, Eye, Ban, RotateCcw, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { cn } from '../../lib/utils';
import { AdminDataTable } from '../../components/admin/AdminDataTable';
import { AdminStatsCard } from '../../components/admin/AdminStatsCard';
import { AdminConfirmModal } from '../../components/admin/AdminConfirmModal';
import { useToast } from '../../components/ui/Toast';

type BookingStatus = 'All' | 'Pending' | 'Accepted' | 'Completed' | 'Cancelled' | 'Refunded';

const statusBadgeColor: Record<string, string> = {
  Pending: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400',
  Accepted: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
  Completed: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
  Cancelled: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
  Refunded: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
};

const AdminBookings = () => {
  const { toast } = useToast();
  const data = useQuery(api.admin.listBookings);
  const updateStatus = useMutation(api.bookings.updateStatus);
  const [localBookings, setLocalBookings] = useState<any[] | null>(null);
  useEffect(() => {
    if (data && localBookings === null) setLocalBookings(data);
  }, [data, localBookings]);
  const bookings = localBookings ?? [];
  const [activeFilter, setActiveFilter] = useState<BookingStatus>('All');
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [showConfirm, setShowConfirm] = useState<{ type: string; booking: any } | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const stats = useMemo(() => ({
    total: bookings.length,
    pending: bookings.filter((b) => b.status === 'Pending').length,
    completed: bookings.filter((b) => b.status === 'Completed').length,
    cancelled: bookings.filter((b) => b.status === 'Cancelled').length,
    refunded: bookings.filter((b) => b.status === 'Refunded').length,
  }), [bookings]);

  const filteredData = useMemo(() => {
    if (activeFilter === 'All') return bookings;
    return bookings.filter((b) => b.status === activeFilter);
  }, [bookings, activeFilter]);

  const handleForceCancel = (booking: any) => {
    setLocalBookings((prev) =>
      prev ? prev.map((b) => (b.id === booking.id ? { ...b, status: 'Cancelled' as const } : b)) : prev
    );
    updateStatus({ bookingId: booking.id, status: 'cancelled' });
    toast(`Booking #${String(booking.id).slice(-6)} has been cancelled`);
  };

  const handleRefund = (booking: any) => {
    setLocalBookings((prev) =>
      prev ? prev.map((b) => (b.id === booking.id ? { ...b, status: 'Refunded' as const } : b)) : prev
    );
    toast(`Booking #${String(booking.id).slice(-6)} has been refunded`);
  };

  const columns = [
    {
      key: 'id',
      label: 'Booking ID',
      sortable: true,
      render: (val: string) => <span className="font-bold text-[#D4AF37]">#{val}</span>,
    },
    { key: 'modelName', label: 'Model', sortable: true },
    { key: 'businessName', label: 'Business', sortable: true },
    { key: 'category', label: 'Category', sortable: true },
    { key: 'date', label: 'Date', sortable: true },
    {
      key: 'amount',
      label: 'Amount',
      sortable: true,
      render: (val: string) => <span className="font-bold">{val}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      sortable: false,
      render: (val: string) => (
        <span className={cn('inline-flex items-center rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider', statusBadgeColor[val])}>
          {val}
        </span>
      ),
    },
    { key: 'location', label: 'Location', sortable: false },
    {
      key: 'actions',
      label: '',
      render: (_: any, row: any) => (
        <div className="relative">
          <button
            onClick={() => setOpenMenuId(openMenuId === row.id ? null : row.id)}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <MoreHorizontal className="h-4 w-4 text-gray-400" />
          </button>
          {openMenuId === row.id && (
            <div className="absolute right-0 top-full mt-1 z-40 w-48 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-xl py-1">
              <button
                onClick={() => { setSelectedBooking(row); setOpenMenuId(null); }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[#111111] dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                <Eye className="h-4 w-4" /> View Details
              </button>
              {(row.status === 'Pending' || row.status === 'Accepted') && (
                <button
                  onClick={() => { setShowConfirm({ type: 'cancel', booking: row }); setOpenMenuId(null); }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  <Ban className="h-4 w-4" /> Force Cancel
                </button>
              )}
              {row.status === 'Completed' && (
                <button
                  onClick={() => { setShowConfirm({ type: 'refund', booking: row }); setOpenMenuId(null); }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[#111111] dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  <RotateCcw className="h-4 w-4" /> Refund
                </button>
              )}
              <button
                onClick={() => { toast(`Resolving dispute for Booking #${row.id}`); setOpenMenuId(null); }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[#111111] dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                <AlertTriangle className="h-4 w-4" /> Resolve Dispute
              </button>
            </div>
          )}
        </div>
      ),
    },
  ];

  const filterTabs: BookingStatus[] = ['All', 'Pending', 'Accepted', 'Completed', 'Cancelled', 'Refunded'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#111111] dark:text-white">Bookings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage all bookings across the platform</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <AdminStatsCard title="Total" value={stats.total} icon={CalendarCheck} />
        <AdminStatsCard title="Pending" value={stats.pending} icon={CalendarCheck} color="bg-yellow-50 text-yellow-500" />
        <AdminStatsCard title="Completed" value={stats.completed} icon={CalendarCheck} color="bg-green-50 text-green-500" />
        <AdminStatsCard title="Cancelled" value={stats.cancelled} icon={CalendarCheck} color="bg-red-50 text-red-500" />
        <AdminStatsCard title="Refunded" value={stats.refunded} icon={CalendarCheck} color="bg-purple-50 text-purple-500" />
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {filterTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={cn(
              'px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors',
              activeFilter === tab
                ? 'bg-[#111111] dark:bg-white text-white dark:text-[#111111]'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <AdminDataTable
        columns={columns}
        data={filteredData}
        searchKey="modelName"
        searchPlaceholder="Search by model name..."
      />

      <AnimatePresence>
        {selectedBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setSelectedBooking(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-2xl"
            >
              <button
                onClick={() => setSelectedBooking(null)}
                className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
              <h3 className="text-lg font-bold text-[#111111] dark:text-white mb-1">Booking Details</h3>
              <p className="text-sm text-[#D4AF37] font-bold mb-6">#{selectedBooking.id}</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-gray-400">Model</span><p className="font-bold text-[#111111] dark:text-white">{selectedBooking.modelName}</p></div>
                <div><span className="text-gray-400">Business</span><p className="font-bold text-[#111111] dark:text-white">{selectedBooking.businessName}</p></div>
                <div><span className="text-gray-400">Category</span><p className="font-bold text-[#111111] dark:text-white">{selectedBooking.category}</p></div>
                <div><span className="text-gray-400">Date</span><p className="font-bold text-[#111111] dark:text-white">{selectedBooking.date}</p></div>
                <div><span className="text-gray-400">Amount</span><p className="font-bold text-[#D4AF37]">{selectedBooking.amount}</p></div>
                <div><span className="text-gray-400">Status</span><p className="font-bold text-[#111111] dark:text-white">{selectedBooking.status}</p></div>
                <div className="col-span-2"><span className="text-gray-400">Location</span><p className="font-bold text-[#111111] dark:text-white">{selectedBooking.location}</p></div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AdminConfirmModal
        isOpen={!!showConfirm}
        onClose={() => setShowConfirm(null)}
        onConfirm={() => {
          if (!showConfirm) return;
          if (showConfirm.type === 'cancel') handleForceCancel(showConfirm.booking);
          else handleRefund(showConfirm.booking);
        }}
        title={showConfirm?.type === 'cancel' ? 'Force Cancel Booking' : 'Refund Booking'}
        message={
          showConfirm?.type === 'cancel'
            ? `Are you sure you want to cancel Booking #${showConfirm?.booking.id} for ${showConfirm?.booking.modelName}? This will cancel the booking regardless of status.`
            : `Are you sure you want to refund ${showConfirm?.booking.amount} for Booking #${showConfirm?.booking.id}?`
        }
        confirmLabel={showConfirm?.type === 'cancel' ? 'Force Cancel' : 'Refund'}
        variant="danger"
      />
    </div>
  );
};

export default AdminBookings;
