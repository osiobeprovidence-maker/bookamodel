/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { DollarSign, TrendingUp, ArrowDownCircle, ArrowUpCircle, Download } from 'lucide-react';
import { adminTransactions, adminStats } from '../../data/adminData';
import { AdminStatsCard } from '../../components/admin/AdminStatsCard';
import { AdminDataTable } from '../../components/admin/AdminDataTable';
import { useToast } from '../../components/ui/Toast';
import { cn } from '../../lib/utils';

type Transaction = (typeof adminTransactions)[number];

const typeColors: Record<string, string> = {
  booking_fee: 'bg-green-100 text-green-700',
  withdrawal: 'bg-blue-100 text-blue-700',
  refund: 'bg-red-100 text-red-700',
};

const statusColors: Record<string, string> = {
  Completed: 'bg-green-100 text-green-700',
  Pending: 'bg-yellow-100 text-yellow-700',
  Failed: 'bg-red-100 text-red-700',
};

const typeLabels: Record<string, string> = {
  booking_fee: 'Booking Fee',
  withdrawal: 'Withdrawal',
  refund: 'Refund',
};

const filters = ['All', 'booking_fee', 'withdrawal', 'refund'];

export default function AdminPayments() {
  const { toast } = useToast();
  const [activeFilter, setActiveFilter] = useState('All');
  const [localTransactions] = useState<Transaction[]>(adminTransactions);

  const filtered = useMemo(() => {
    if (activeFilter === 'All') return localTransactions;
    return localTransactions.filter((t) => t.type === activeFilter);
  }, [localTransactions, activeFilter]);

  const totalBookingFees = localTransactions
    .filter((t) => t.type === 'booking_fee' && t.status === 'Completed')
    .reduce((sum, t) => sum + parseInt(t.amount.replace(/[₦,]/g, '')), 0);

  const totalWithdrawals = localTransactions
    .filter((t) => t.type === 'withdrawal' && t.status === 'Completed')
    .reduce((sum, t) => sum + parseInt(t.amount.replace(/[₦,]/g, '')), 0);

  const pendingPayouts = localTransactions
    .filter((t) => t.type === 'withdrawal' && t.status === 'Pending')
    .reduce((sum, t) => sum + parseInt(t.amount.replace(/[₦,]/g, '')), 0);

  const monthlyData = adminStats.monthlyRevenue;
  const maxRevenue = Math.max(...monthlyData.map((m) => m.revenue));

  const columns = [
    { key: 'id', label: 'ID', sortable: true },
    {
      key: 'type',
      label: 'Type',
      render: (val: string) => (
        <span className={cn('inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold', typeColors[val] || 'bg-gray-100 text-gray-700')}>
          {typeLabels[val] || val}
        </span>
      ),
    },
    { key: 'amount', label: 'Amount', sortable: true },
    { key: 'modelName', label: 'Model', sortable: true },
    { key: 'businessName', label: 'Business', sortable: true },
    { key: 'date', label: 'Date', sortable: true },
    {
      key: 'status',
      label: 'Status',
      render: (val: string) => (
        <span className={cn('inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold', statusColors[val] || 'bg-gray-100 text-gray-700')}>
          {val}
        </span>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#111111] dark:text-white">Payments & Revenue</h1>
        <button
          onClick={() => toast('Export feature coming soon', 'info')}
          className={cn(
            'inline-flex items-center gap-2 rounded-xl px-4 py-2.5',
            'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700',
            'text-sm font-bold text-gray-700 dark:text-gray-300',
            'hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors'
          )}
        >
          <Download className="h-4 w-4" />
          Export
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatsCard title="Total Revenue" value={adminStats.totalRevenue} icon={DollarSign} color="bg-green-500/10 text-green-500" change="+12% this month" changeType="positive" />
        <AdminStatsCard title="Booking Fees" value={`₦${totalBookingFees.toLocaleString()}`} icon={TrendingUp} color="bg-[#D4AF37]/10 text-[#D4AF37]" change={`${localTransactions.filter((t) => t.type === 'booking_fee').length} transactions`} changeType="neutral" />
        <AdminStatsCard title="Withdrawals" value={`₦${totalWithdrawals.toLocaleString()}`} icon={ArrowDownCircle} color="bg-blue-500/10 text-blue-500" change={`${localTransactions.filter((t) => t.type === 'withdrawal').length} withdrawals`} changeType="neutral" />
        <AdminStatsCard title="Pending Payouts" value={`₦${pendingPayouts.toLocaleString()}`} icon={ArrowUpCircle} color="bg-yellow-500/10 text-yellow-500" change={`${localTransactions.filter((t) => t.type === 'withdrawal' && t.status === 'Pending').length} pending`} changeType="negative" />
      </div>

      <div className={cn('bg-white dark:bg-gray-900 backdrop-blur-sm border border-gray-100 dark:border-gray-800 rounded-2xl p-6')}>
        <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-6">Monthly Revenue</h2>
        <div className="flex items-end gap-3 h-48">
          {monthlyData.map((m) => (
            <div key={m.month} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full flex justify-center">
                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500">₦{(m.revenue / 1_000_000).toFixed(1)}M</span>
              </div>
              <div
                className="w-full rounded-t-lg bg-[#D4AF37] hover:bg-[#C5A028] transition-colors"
                style={{ height: `${(m.revenue / maxRevenue) * 120}px` }}
                title={`₦${m.revenue.toLocaleString()}`}
              />
              <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500">{m.month}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-4">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={cn(
                'px-4 py-2 rounded-xl text-sm font-bold transition-colors',
                activeFilter === f
                  ? 'bg-[#D4AF37] text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              )}
            >
              {f === 'All' ? 'All' : typeLabels[f]}
            </button>
          ))}
        </div>
        <AdminDataTable columns={columns} data={filtered} searchPlaceholder="Search by model or business name..." searchKey="modelName" emptyMessage="No transactions found." />
      </div>
    </div>
  );
}
