/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, ChevronDown, ChevronUp, FileText, Camera, Link2, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { cn } from '../../lib/utils';
import { useToast } from '../../components/ui/Toast';
import { AdminConfirmModal } from '../../components/admin/AdminConfirmModal';
import { AdminStatsCard } from '../../components/admin/AdminStatsCard';

const AdminVerification = () => {
  const { toast } = useToast();
  const data = useQuery(api.admin.listVerificationRequests);
  const setVerificationStatus = useMutation(api.admin.setVerificationStatus);
  const [localQueue, setLocalQueue] = useState<any[] | null>(null);
  useEffect(() => {
    if (data && localQueue === null) setLocalQueue(data);
  }, [data, localQueue]);
  const queue = localQueue ?? [];
  const pendingQueue = queue.filter((item: any) => item.status === 'pending');
  const [selectedVerification, setSelectedVerification] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState<{ action: 'approve' | 'reject'; id: string } | null>(null);

  const pendingCount = pendingQueue.length;
  const approvedToday = queue.filter((item: any) => item.status === 'approved').length;
  const rejectedToday = queue.filter((item: any) => item.status === 'rejected').length;

  const expandedItem = pendingQueue.find((item: any) => item.id === selectedVerification);

  const handleApprove = (id: string) => {
    setVerificationStatus({ requestId: id, status: 'approved' });
    setLocalQueue((prev) => (prev ? prev.map((i) => (i.id === id ? { ...i, status: 'approved' } : i)) : prev));
    setSelectedVerification(null);
    toast('Verification approved successfully');
  };

  const handleReject = (id: string) => {
    setVerificationStatus({ requestId: id, status: 'rejected' });
    setLocalQueue((prev) => (prev ? prev.map((i) => (i.id === id ? { ...i, status: 'rejected' } : i)) : prev));
    setSelectedVerification(null);
    toast('Verification rejected', 'error');
  };

  const handleRequestInfo = (id: string) => {
    setVerificationStatus({ requestId: id, status: 'info_requested' });
    setLocalQueue((prev) => (prev ? prev.map((i) => (i.id === id ? { ...i, status: 'info_requested' } : i)) : prev));
    toast('Additional info request sent', 'info');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#111111] dark:text-white">Verification Centre</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Review and manage model verification requests</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <AdminStatsCard
          title="Pending"
          value={pendingCount}
          icon={Clock}
          color="bg-orange-50 text-orange-500"
          change={`${pendingCount} awaiting review`}
          changeType="neutral"
        />
        <AdminStatsCard
          title="Approved Today"
          value={approvedToday}
          icon={CheckCircle}
          color="bg-green-50 text-green-500"
          change="+3 from yesterday"
          changeType="positive"
        />
        <AdminStatsCard
          title="Rejected Today"
          value={rejectedToday}
          icon={XCircle}
          color="bg-red-50 text-red-500"
          change="1 rejected"
          changeType="negative"
        />
      </div>

      {pendingQueue.length === 0 ? (
        <div className={cn(
          'bg-white dark:bg-gray-900 rounded-2xl',
          'border border-gray-100 dark:border-gray-800',
          'p-16 text-center'
        )}>
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
              <CheckCircle className="h-7 w-7 text-green-500" />
            </div>
          </div>
          <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 mb-1">All caught up!</h3>
          <p className="text-xs text-gray-400 dark:text-gray-500">No pending verifications to review</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pendingQueue.map((item) => (
            <div key={item.id}>
              <motion.div
                layout
                className={cn(
                  'bg-white dark:bg-gray-900 rounded-2xl',
                  'border border-gray-100 dark:border-gray-800',
                  'overflow-hidden',
                  'hover:shadow-lg transition-all duration-300',
                  selectedVerification === item.id && 'ring-2 ring-[#D4AF37]/30 border-[#D4AF37]/30'
                )}
              >
                <button
                  onClick={() => setSelectedVerification(selectedVerification === item.id ? null : item.id)}
                  className="w-full p-5 text-left"
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={item.modelImage}
                      alt={item.modelName}
                      className="h-14 w-14 rounded-xl object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-[#111111] dark:text-white">{item.modelName}</h3>
                        {selectedVerification === item.id ? (
                          <ChevronUp className="h-4 w-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">Submitted {item.submittedDate}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                          {item.documents.idDocument}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400">
                          {item.documents.portfolio}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>

                <AnimatePresence>
                  {selectedVerification === item.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 border-t border-gray-100 dark:border-gray-800 pt-4">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Document Previews</h4>
                        <div className="grid grid-cols-3 gap-3 mb-4">
                          <div className="space-y-1.5">
                            <div className="aspect-[4/3] rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 flex items-center justify-center">
                              <FileText className="h-6 w-6 text-blue-400" />
                            </div>
                            <p className="text-[10px] font-bold text-gray-400 text-center">Government ID</p>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 text-center">{item.documents.idDocument}</p>
                          </div>
                          <div className="space-y-1.5">
                            <div className="aspect-[4/3] rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 flex items-center justify-center">
                              <Camera className="h-6 w-6 text-purple-400" />
                            </div>
                            <p className="text-[10px] font-bold text-gray-400 text-center">Portfolio</p>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 text-center">{item.documents.portfolio}</p>
                          </div>
                          <div className="space-y-1.5">
                            <div className="aspect-[4/3] rounded-xl bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 flex items-center justify-center">
                              <User className="h-6 w-6 text-green-400" />
                            </div>
                            <p className="text-[10px] font-bold text-gray-400 text-center">Face Photo</p>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 text-center">{item.documents.facePhoto}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mb-5 p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                          <Link2 className="h-4 w-4 text-gray-400 shrink-0" />
                          <span className="text-xs text-gray-500 dark:text-gray-400">Social: </span>
                          <span className="text-xs font-bold text-[#111111] dark:text-white">{item.documents.socialLinks}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowConfirm({ action: 'approve', id: item.id });
                            }}
                            className={cn(
                              'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl',
                              'bg-green-500 hover:bg-green-600',
                              'text-white text-sm font-bold',
                              'transition-colors active:scale-95'
                            )}
                          >
                            <CheckCircle className="h-4 w-4" />
                            Approve
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowConfirm({ action: 'reject', id: item.id });
                            }}
                            className={cn(
                              'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl',
                              'bg-red-500 hover:bg-red-600',
                              'text-white text-sm font-bold',
                              'transition-colors active:scale-95'
                            )}
                          >
                            <XCircle className="h-4 w-4" />
                            Reject
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRequestInfo(item.id);
                            }}
                            className={cn(
                              'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl',
                              'bg-yellow-500 hover:bg-yellow-600',
                              'text-white text-sm font-bold',
                              'transition-colors active:scale-95'
                            )}
                          >
                            <FileText className="h-4 w-4" />
                            Request Info
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          ))}
        </div>
      )}

      <AdminConfirmModal
        isOpen={!!showConfirm}
        onClose={() => setShowConfirm(null)}
        onConfirm={() => {
          if (!showConfirm) return;
          if (showConfirm.action === 'approve') {
            handleApprove(showConfirm.id);
          } else {
            handleReject(showConfirm.id);
          }
        }}
        title={showConfirm?.action === 'approve' ? 'Approve Verification' : 'Reject Verification'}
        message={
          showConfirm?.action === 'approve'
            ? 'Are you sure you want to approve this verification? The model will be granted verified status.'
            : 'Are you sure you want to reject this verification? The model will be notified and may resubmit.'
        }
        confirmLabel={showConfirm?.action === 'approve' ? 'Approve' : 'Reject'}
        variant={showConfirm?.action === 'approve' ? 'info' : 'danger'}
      />
    </div>
  );
};

export default AdminVerification;
