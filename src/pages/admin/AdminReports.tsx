/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { AlertTriangle, Eye, X, ShieldAlert, Ban, AlertCircle } from 'lucide-react';
import { adminReports } from '../../data/adminData';
import { AdminConfirmModal } from '../../components/admin/AdminConfirmModal';
import { AdminEmptyState } from '../../components/admin/AdminEmptyState';
import { useToast } from '../../components/ui/Toast';
import { cn } from '../../lib/utils';

type Report = (typeof adminReports)[number];

type ConfirmAction = {
  type: 'warn' | 'suspend' | 'ban';
  reportId: string;
  targetUser: string;
};

const statusColors: Record<string, string> = {
  Open: 'bg-yellow-100 text-yellow-700',
  Investigating: 'bg-blue-100 text-blue-700',
  Closed: 'bg-gray-100 text-gray-600',
};

const filters = ['All', 'Open', 'Investigating', 'Closed'];

export default function AdminReports() {
  const { toast } = useToast();
  const [localReports, setLocalReports] = useState<Report[]>(adminReports);
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);

  const filtered = localReports.filter((r) => activeFilter === 'All' || r.status === activeFilter);

  const stats = {
    open: localReports.filter((r) => r.status === 'Open').length,
    investigating: localReports.filter((r) => r.status === 'Investigating').length,
    closed: localReports.filter((r) => r.status === 'Closed').length,
  };

  const openConfirm = (type: ConfirmAction['type'], reportId: string, targetUser: string) => {
    setConfirmAction({ type, reportId, targetUser });
    setShowConfirm(true);
  };

  const handleConfirm = () => {
    if (!confirmAction) return;
    const { type, reportId, targetUser } = confirmAction;

    if (type === 'warn') {
      toast(`Warning sent to ${targetUser}`, 'success');
    } else if (type === 'suspend') {
      toast(`${targetUser} has been suspended`, 'success');
    } else if (type === 'ban') {
      toast(`${targetUser} has been banned`, 'success');
      setLocalReports(localReports.map((r) => r.id === reportId ? { ...r, status: 'Closed' as const } : r));
    }

    setConfirmAction(null);
  };

  const closeReport = (reportId: string) => {
    setLocalReports(localReports.map((r) => r.id === reportId ? { ...r, status: 'Closed' as const } : r));
    toast('Report closed', 'success');
    setSelectedReport(null);
  };

  const confirmModalProps = confirmAction
    ? {
        title: confirmAction.type === 'warn' ? 'Warn User' : confirmAction.type === 'suspend' ? 'Suspend Account' : 'Ban Account',
        message: confirmAction.type === 'warn'
          ? `Send a warning to ${confirmAction.targetUser}? They will be notified of this action.`
          : confirmAction.type === 'suspend'
            ? `Suspend ${confirmAction.targetUser}'s account? They will not be able to accept bookings until unsuspended.`
            : `Permanently ban ${confirmAction.targetUser}? This action cannot be undone.`,
        confirmLabel: confirmAction.type === 'warn' ? 'Send Warning' : confirmAction.type === 'suspend' ? 'Suspend' : 'Ban Account',
        variant: confirmAction.type === 'warn' ? 'warning' as const : 'danger' as const,
      }
    : null;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-[#111111] dark:text-white">User Reports</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={cn('bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6')}>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">Open</p>
          <p className="text-3xl font-bold text-yellow-500 mt-2">{stats.open}</p>
        </div>
        <div className={cn('bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6')}>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">Investigating</p>
          <p className="text-3xl font-bold text-blue-500 mt-2">{stats.investigating}</p>
        </div>
        <div className={cn('bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6')}>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">Closed</p>
          <p className="text-3xl font-bold text-gray-400 mt-2">{stats.closed}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
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
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <AdminEmptyState icon={AlertCircle} title="No reports found" description="There are no reports matching your current filter." />
      ) : (
        <div className="space-y-4">
          {filtered.map((report) => (
            <div
              key={report.id}
              className={cn(
                'bg-white dark:bg-gray-900 backdrop-blur-sm',
                'border border-gray-100 dark:border-gray-800',
                'rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300'
              )}
            >
              <div className="p-6">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-[#111111] dark:text-white">{report.reporterName}</span>
                    <span className="text-gray-300 dark:text-gray-600">→</span>
                    <span className="text-sm font-bold text-[#111111] dark:text-white">{report.reportedUser}</span>
                  </div>
                  <span className={cn('inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold shrink-0', statusColors[report.status])}>
                    {report.status}
                  </span>
                </div>

                <div className="mb-3">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-500 bg-red-50 dark:bg-red-900/20 px-2.5 py-1 rounded-full">
                    <ShieldAlert className="h-3 w-3" />
                    {report.reason}
                  </span>
                </div>

                {selectedReport === report.id ? (
                  <div className="mt-4 space-y-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">Full Description</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-3 rounded-xl">{report.description}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-400 dark:text-gray-500">{report.date}</p>
                      <button
                        onClick={() => setSelectedReport(null)}
                        className={cn(
                          'inline-flex items-center gap-1.5 text-xs font-bold',
                          'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors'
                        )}
                      >
                        <X className="h-3 w-3" />
                        Collapse
                      </button>
                    </div>

                    {report.status !== 'Closed' && (
                      <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-gray-100 dark:border-gray-800">
                        <button
                          onClick={() => openConfirm('warn', report.id, report.reportedUser)}
                          className={cn(
                            'inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold',
                            'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition-colors'
                          )}
                        >
                          <AlertTriangle className="h-3.5 w-3.5" />
                          Warn User
                        </button>
                        <button
                          onClick={() => openConfirm('suspend', report.id, report.reportedUser)}
                          className={cn(
                            'inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold',
                            'bg-orange-100 text-orange-700 hover:bg-orange-200 transition-colors'
                          )}
                        >
                          <ShieldAlert className="h-3.5 w-3.5" />
                          Suspend Account
                        </button>
                        <button
                          onClick={() => openConfirm('ban', report.id, report.reportedUser)}
                          className={cn(
                            'inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold',
                            'bg-red-100 text-red-700 hover:bg-red-200 transition-colors'
                          )}
                        >
                          <Ban className="h-3.5 w-3.5" />
                          Ban Account
                        </button>
                        <button
                          onClick={() => closeReport(report.id)}
                          className={cn(
                            'inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold',
                            'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors'
                          )}
                        >
                          Close Report
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1 flex-1">{report.description}</p>
                    <div className="flex items-center gap-3 ml-4 shrink-0">
                      <span className="text-xs text-gray-400 dark:text-gray-500">{report.date}</span>
                      <button
                        onClick={() => setSelectedReport(report.id)}
                        className={cn(
                          'inline-flex items-center gap-1.5 text-xs font-bold',
                          'text-[#D4AF37] hover:text-[#C5A028] transition-colors'
                        )}
                      >
                        <Eye className="h-3.5 w-3.5" />
                        View
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {confirmAction && confirmModalProps && (
        <AdminConfirmModal
          isOpen={showConfirm}
          onClose={() => { setShowConfirm(false); setConfirmAction(null); }}
          onConfirm={handleConfirm}
          title={confirmModalProps.title}
          message={confirmModalProps.message}
          confirmLabel={confirmModalProps.confirmLabel}
          variant={confirmModalProps.variant}
        />
      )}
    </div>
  );
}
