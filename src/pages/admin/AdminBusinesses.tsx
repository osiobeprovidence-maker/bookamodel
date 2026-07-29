/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { Building2, Search, X, MoreHorizontal, Eye, Ban, Trash2, CreditCard, CalendarCheck, UserCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { adminBusinesses } from '../../data/adminData';
import { AdminDataTable } from '../../components/admin/AdminDataTable';
import { AdminStatsCard } from '../../components/admin/AdminStatsCard';
import { AdminConfirmModal } from '../../components/admin/AdminConfirmModal';
import { useToast } from '../../components/ui/Toast';

const AdminBusinesses = () => {
  const { toast } = useToast();
  const [localBusinesses, setLocalBusinesses] = useState(adminBusinesses);
  const [selectedBusiness, setSelectedBusiness] = useState<any>(null);
  const [showConfirm, setShowConfirm] = useState<{ type: string; business: any } | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const stats = useMemo(() => ({
    total: localBusinesses.length,
    active: localBusinesses.filter((b) => b.isActive && !b.isSuspended).length,
    suspended: localBusinesses.filter((b) => b.isSuspended).length,
    totalSpend: localBusinesses.reduce((sum, b) => {
      const num = parseInt(b.totalSpend.replace(/[₦,]/g, ''), 10);
      return sum + num;
    }, 0),
  }), [localBusinesses]);

  const filteredData = useMemo(() => {
    if (statusFilter === 'all') return localBusinesses;
    if (statusFilter === 'active') return localBusinesses.filter((b) => b.isActive && !b.isSuspended);
    return localBusinesses.filter((b) => b.isSuspended);
  }, [localBusinesses, statusFilter]);

  const handleSuspend = (business: any) => {
    setLocalBusinesses((prev) =>
      prev.map((b) =>
        b.id === business.id ? { ...b, isSuspended: !b.isSuspended } : b
      )
    );
    toast(`Business ${business.isSuspended ? 'reactivated' : 'suspended'} successfully`);
  };

  const handleDelete = (business: any) => {
    setLocalBusinesses((prev) => prev.filter((b) => b.id !== business.id));
    toast('Business deleted successfully');
  };

  const columns = [
    {
      key: 'name',
      label: 'Business',
      sortable: true,
      render: (_: any, row: any) => (
        <div className="flex items-center gap-3">
          <img
            src={row.avatar}
            alt={row.name}
            className="h-9 w-9 rounded-full object-cover"
          />
          <span className="font-bold text-sm">{row.name}</span>
        </div>
      ),
    },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'industry', label: 'Industry', sortable: true },
    { key: 'city', label: 'City', sortable: true },
    {
      key: 'status',
      label: 'Status',
      sortable: false,
      render: (_: any, row: any) => (
        <span
          className={cn(
            'inline-flex items-center rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider',
            row.isSuspended
              ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
              : row.isActive
                ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
          )}
        >
          {row.isSuspended ? 'Suspended' : row.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'totalSpend',
      label: 'Total Spend',
      sortable: true,
      render: (val: string) => (
        <span className="font-bold text-[#D4AF37]">{val}</span>
      ),
    },
    {
      key: 'totalBookings',
      label: 'Bookings',
      sortable: true,
    },
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
                onClick={() => { setSelectedBusiness(row); setOpenMenuId(null); }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[#111111] dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                <Eye className="h-4 w-4" /> View Profile
              </button>
              <button
                onClick={() => { setShowConfirm({ type: 'suspend', business: row }); setOpenMenuId(null); }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[#111111] dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                {row.isSuspended ? <UserCheck className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                {row.isSuspended ? 'Reactivate' : 'Suspend'}
              </button>
              <button
                onClick={() => { setShowConfirm({ type: 'delete', business: row }); setOpenMenuId(null); }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                <Trash2 className="h-4 w-4" /> Delete
              </button>
              <button
                onClick={() => { toast(`Viewing bookings for ${row.name}`); setOpenMenuId(null); }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[#111111] dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                <CalendarCheck className="h-4 w-4" /> View Bookings
              </button>
              <button
                onClick={() => { toast(`Viewing spending for ${row.name}`); setOpenMenuId(null); }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[#111111] dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                <CreditCard className="h-4 w-4" /> View Spending
              </button>
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#111111] dark:text-white">Businesses</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage all business accounts</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatsCard title="Total Businesses" value={stats.total} icon={Building2} />
        <AdminStatsCard title="Active" value={stats.active} icon={Building2} color="bg-green-50 text-green-500" />
        <AdminStatsCard title="Suspended" value={stats.suspended} icon={Building2} color="bg-red-50 text-red-500" />
        <AdminStatsCard title="Total Spend" value={`₦${stats.totalSpend.toLocaleString()}`} icon={CreditCard} color="bg-[#D4AF37]/10 text-[#D4AF37]" />
      </div>

      <div className="flex items-center gap-2">
        {(['all', 'active', 'suspended'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setStatusFilter(f)}
            className={cn(
              'px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors',
              statusFilter === f
                ? 'bg-[#111111] dark:bg-white text-white dark:text-[#111111]'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <AdminDataTable
        columns={columns}
        data={filteredData}
        searchKey="name"
        searchPlaceholder="Search businesses..."
      />

      <AnimatePresence>
        {selectedBusiness && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setSelectedBusiness(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-2xl"
            >
              <button
                onClick={() => setSelectedBusiness(null)}
                className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
              <div className="flex items-center gap-4 mb-6">
                <img src={selectedBusiness.avatar} alt={selectedBusiness.name} className="h-16 w-16 rounded-full object-cover" />
                <div>
                  <h3 className="text-lg font-bold text-[#111111] dark:text-white">{selectedBusiness.name}</h3>
                  <p className="text-sm text-gray-500">{selectedBusiness.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-gray-400">Industry</span><p className="font-bold text-[#111111] dark:text-white">{selectedBusiness.industry}</p></div>
                <div><span className="text-gray-400">City</span><p className="font-bold text-[#111111] dark:text-white">{selectedBusiness.city}</p></div>
                <div><span className="text-gray-400">Status</span><p className="font-bold text-[#111111] dark:text-white">{selectedBusiness.isSuspended ? 'Suspended' : 'Active'}</p></div>
                <div><span className="text-gray-400">Joined</span><p className="font-bold text-[#111111] dark:text-white">{selectedBusiness.joinedDate}</p></div>
                <div><span className="text-gray-400">Total Spend</span><p className="font-bold text-[#D4AF37]">{selectedBusiness.totalSpend}</p></div>
                <div><span className="text-gray-400">Bookings</span><p className="font-bold text-[#111111] dark:text-white">{selectedBusiness.totalBookings}</p></div>
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
          if (showConfirm.type === 'suspend') handleSuspend(showConfirm.business);
          else handleDelete(showConfirm.business);
        }}
        title={showConfirm?.type === 'suspend' ? 'Suspend Business' : 'Delete Business'}
        message={
          showConfirm?.type === 'suspend'
            ? `Are you sure you want to ${showConfirm?.business.isSuspended ? 'reactivate' : 'suspend'} ${showConfirm?.business.name}?`
            : `Are you sure you want to permanently delete ${showConfirm?.business.name}? This action cannot be undone.`
        }
        confirmLabel={showConfirm?.type === 'suspend' ? (showConfirm?.business.isSuspended ? 'Reactivate' : 'Suspend') : 'Delete'}
        variant={showConfirm?.type === 'delete' ? 'danger' : 'warning'}
      />
    </div>
  );
};

export default AdminBusinesses;
