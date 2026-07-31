/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Download, Filter } from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { AdminDataTable } from '../../components/admin/AdminDataTable';
import { useToast } from '../../components/ui/Toast';
import { cn } from '../../lib/utils';

const actionColorMap: Record<string, string> = {
  create: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  update: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  delete: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  login: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

function getActionColor(action: string) {
  const lower = action.toLowerCase();
  if (lower.includes('suspend') || lower.includes('delete') || lower.includes('close') || lower.includes('flag') || lower.includes('reject')) {
    return actionColorMap.delete;
  }
  if (lower.includes('create') || lower.includes('add') || lower.includes('send') || lower.includes('register')) {
    return actionColorMap.create;
  }
  if (lower.includes('login') || lower.includes('sign')) {
    return actionColorMap.login;
  }
  return actionColorMap.update;
}

export default function AdminAudit() {
  const { toast } = useToast();
  const logs = useQuery(api.admin.listAuditLogs) ?? [];
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [adminFilter, setAdminFilter] = useState('');

  const adminNames = useMemo(
    () => [...new Set(logs.map((log) => log.adminName))],
    [logs]
  );

  const filteredData = useMemo(() => {
    return logs.filter((log) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesName = log.adminName.toLowerCase().includes(q);
        const matchesAction = log.action.toLowerCase().includes(q);
        if (!matchesName && !matchesAction) return false;
      }
      if (adminFilter && log.adminName !== adminFilter) return false;
      if (dateFrom && log.date < dateFrom) return false;
      if (dateTo && log.date > dateTo) return false;
      return true;
    });
  }, [searchQuery, adminFilter, dateFrom, dateTo, logs]);

  const columns = [
    {
      key: 'adminName',
      label: 'Admin',
      sortable: true,
    },
    {
      key: 'action',
      label: 'Action',
      sortable: true,
      render: (value: string) => (
        <span
          className={cn(
            'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
            getActionColor(value)
          )}
        >
          {value}
        </span>
      ),
    },
    { key: 'target', label: 'Target', sortable: true },
    { key: 'date', label: 'Date', sortable: true },
    { key: 'time', label: 'Time' },
    { key: 'device', label: 'Device' },
    {
      key: 'ip',
      label: 'IP Address',
      render: (value: string) => (
        <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md font-mono">
          {value}
        </code>
      ),
    },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#111111] dark:text-white flex items-center gap-3">
            <Shield className="h-6 w-6 text-[#D4AF37]" />
            Audit Logs
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Immutable record of all admin actions
          </p>
        </div>
        <button
          onClick={() => toast('Export feature coming soon!', 'info')}
          className={cn(
            'inline-flex items-center gap-2 px-4 py-2.5 rounded-xl',
            'bg-[#111111] dark:bg-white text-white dark:text-[#111111]',
            'text-sm font-medium hover:opacity-90 transition-opacity'
          )}
        >
          <Download className="h-4 w-4" />
          Export
        </button>
      </motion.div>

      <motion.div variants={item}>
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-4 w-4 text-gray-400" />
            <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
              Filters
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                Search Admin / Action
              </label>
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn(
                  'w-full px-4 py-2.5 rounded-xl text-sm',
                  'bg-gray-50 dark:bg-gray-800',
                  'border border-gray-200 dark:border-gray-700',
                  'text-[#111111] dark:text-white placeholder:text-gray-400',
                  'focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37]',
                  'transition-all'
                )}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                Admin Name
              </label>
              <select
                value={adminFilter}
                onChange={(e) => setAdminFilter(e.target.value)}
                className={cn(
                  'w-full px-4 py-2.5 rounded-xl text-sm',
                  'bg-gray-50 dark:bg-gray-800',
                  'border border-gray-200 dark:border-gray-700',
                  'text-[#111111] dark:text-white',
                  'focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37]',
                  'transition-all'
                )}
              >
                <option value="">All Admins</option>
                {adminNames.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                From Date
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className={cn(
                  'w-full px-4 py-2.5 rounded-xl text-sm',
                  'bg-gray-50 dark:bg-gray-800',
                  'border border-gray-200 dark:border-gray-700',
                  'text-[#111111] dark:text-white',
                  'focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37]',
                  'transition-all'
                )}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                To Date
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className={cn(
                  'w-full px-4 py-2.5 rounded-xl text-sm',
                  'bg-gray-50 dark:bg-gray-800',
                  'border border-gray-200 dark:border-gray-700',
                  'text-[#111111] dark:text-white',
                  'focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37]',
                  'transition-all'
                )}
              />
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={item}>
        <AdminDataTable
          columns={columns}
          data={filteredData}
          emptyMessage="No audit logs found matching your filters."
        />
      </motion.div>
    </motion.div>
  );
}
