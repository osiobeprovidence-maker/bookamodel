/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Send, CheckCircle, Clock, XCircle, AlertCircle,
  Trophy, Calendar, MapPin, Wallet, MessageSquare,
  X, Eye, Edit3, RotateCcw, Ban,
} from 'lucide-react';
import { businessInvitations } from '../../data/businessData';
import { cn } from '../../lib/utils';
import { useToast } from '../../components/ui/Toast';

const statusFilters = ['All', 'Pending', 'Accepted', 'Declined', 'Expired', 'Completed'] as const;
type FilterStatus = (typeof statusFilters)[number];

const statusColors: Record<string, { bg: string; text: string }> = {
  Pending: { bg: 'bg-yellow-50', text: 'text-yellow-700' },
  Accepted: { bg: 'bg-green-50', text: 'text-green-700' },
  Declined: { bg: 'bg-red-50', text: 'text-red-700' },
  Expired: { bg: 'bg-gray-100', text: 'text-gray-500' },
};

export default function BusinessInvitations() {
  const { toast } = useToast();
  const [activeFilter, setActiveFilter] = useState<FilterStatus>('All');
  const [selectedInvitation, setSelectedInvitation] = useState<typeof businessInvitations[number] | null>(null);
  const [localInvitations, setLocalInvitations] = useState(businessInvitations);

  const filtered = activeFilter === 'All'
    ? localInvitations
    : localInvitations.filter((inv) => inv.status === activeFilter);

  const counts = {
    all: localInvitations.length,
    pending: localInvitations.filter((i) => i.status === 'Pending').length,
    accepted: localInvitations.filter((i) => i.status === 'Accepted').length,
    declined: localInvitations.filter((i) => i.status === 'Declined').length,
    expired: localInvitations.filter((i) => i.status === 'Expired').length,
    completed: localInvitations.filter((i) => i.status === 'Accepted').length,
  };

  const stats = [
    { label: 'SENT', value: String(counts.all), icon: Send, bg: 'bg-blue-50', color: 'text-blue-500' },
    { label: 'ACCEPTED', value: String(counts.accepted), icon: CheckCircle, bg: 'bg-green-50', color: 'text-green-500' },
    { label: 'PENDING', value: String(counts.pending), icon: Clock, bg: 'bg-yellow-50', color: 'text-yellow-500' },
    { label: 'DECLINED', value: String(counts.declined), icon: XCircle, bg: 'bg-red-50', color: 'text-red-500' },
    { label: 'EXPIRED', value: String(counts.expired), icon: AlertCircle, bg: 'bg-gray-100', color: 'text-gray-400' },
    { label: 'COMPLETED', value: '15', icon: Trophy, bg: 'bg-purple-50', color: 'text-purple-500' },
  ];

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-black tracking-tight text-[#111111]">Invitations</h1>
        <p className="text-gray-400 font-medium text-sm mt-1">Manage invitations sent to models.</p>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <div className={cn("p-2 rounded-xl", stat.bg)}>
                <stat.icon className={cn("w-4 h-4", stat.color)} />
              </div>
            </div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
            <p className="text-xl font-extrabold tracking-tight">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        {statusFilters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={cn(
              "px-4 py-2 rounded-full text-xs font-bold transition-all",
              activeFilter === filter
                ? "bg-[#111111] text-white"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            )}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((inv, i) => (
          <motion.div
            key={inv.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <img src={inv.modelImage} className="w-12 h-12 rounded-full object-cover" alt={inv.modelName} />
              <div>
                <h4 className="font-bold text-sm tracking-tight">{inv.modelName}</h4>
                <p className="text-xs text-gray-400">{inv.campaign}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-gray-500 mb-4">
              <div className="flex items-center gap-1.5"><Calendar className="w-3 h-3 text-gray-400" />{inv.date}</div>
              <div className="flex items-center gap-1.5"><MapPin className="w-3 h-3 text-gray-400" />{inv.location}</div>
              <div className="flex items-center gap-1.5"><Wallet className="w-3 h-3 text-gray-400" />{inv.payment}</div>
            </div>

            <p className="text-xs text-gray-500 mb-4">{inv.message}</p>

            <div className="flex items-center justify-between border-t border-gray-100 pt-4">
              <span className={cn(
                "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                statusColors[inv.status]?.bg || 'bg-gray-100',
                statusColors[inv.status]?.text || 'text-gray-500'
              )}>
                {inv.status}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedInvitation(inv)}
                  className="p-2 text-gray-400 hover:text-[#111111] hover:bg-gray-50 rounded-lg transition-all"
                  title="View"
                >
                  <Eye className="w-4 h-4" />
                </button>
                {inv.status === 'Pending' && (
                  <>
                    <button
                      onClick={() => toast('Invitation editing coming soon', 'info')}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Edit"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setLocalInvitations((prev) => prev.filter((i) => i.id !== inv.id));
                        toast('Invitation cancelled', 'success');
                      }}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Cancel"
                    >
                      <Ban className="w-4 h-4" />
                    </button>
                  </>
                )}
                {(inv.status === 'Expired' || inv.status === 'Declined') && (
                  <button
                    onClick={() => {
                      setLocalInvitations((prev) => prev.map((i) => i.id === inv.id ? { ...i, status: 'Pending' as const } : i));
                      toast(`Invitation resent to ${inv.modelName}`, 'success');
                    }}
                    className="p-2 text-gray-400 hover:text-[#D4AF37] hover:bg-[#D4AF37]/5 rounded-lg transition-all" title="Resend"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <Send className="w-10 h-10 text-gray-300 mx-auto mb-4" />
          <p className="text-sm font-bold text-gray-400">No invitations found</p>
        </div>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedInvitation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={() => setSelectedInvitation(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mx-4 w-full max-w-lg bg-white rounded-2xl p-8 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[#111111]">Invitation Details</h2>
                <button onClick={() => setSelectedInvitation(null)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-3 mb-6">
                <img src={selectedInvitation.modelImage} className="w-14 h-14 rounded-full object-cover" alt="" />
                <div>
                  <p className="font-bold text-[#111111]">{selectedInvitation.modelName}</p>
                  <p className="text-sm text-gray-400">{selectedInvitation.campaign}</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-500"><Calendar className="w-4 h-4 text-gray-400" />{selectedInvitation.date}</div>
                <div className="flex items-center gap-2 text-sm text-gray-500"><MapPin className="w-4 h-4 text-gray-400" />{selectedInvitation.location}</div>
                <div className="flex items-center gap-2 text-sm text-gray-500"><Wallet className="w-4 h-4 text-gray-400" />{selectedInvitation.payment}</div>
                <div className="flex items-center gap-2 text-sm text-gray-500"><MessageSquare className="w-4 h-4 text-gray-400" />{selectedInvitation.message}</div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Contract Details</p>
                <p className="text-xs text-gray-500">Standard BOOKAMODEL contract applies. Full usage rights for digital and print media for 12 months.</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Requirements</p>
                <div className="flex flex-wrap gap-2">
                  {['Professional', 'Punctual', 'Experienced', 'Portfolio Required'].map((r) => (
                    <span key={r} className="px-3 py-1 bg-white rounded-full text-[10px] font-medium text-gray-500 border border-gray-100">{r}</span>
                  ))}
                </div>
              </div>

              <div className="flex justify-end border-t border-gray-100 pt-4">
                <span className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                  statusColors[selectedInvitation.status]?.bg || 'bg-gray-100',
                  statusColors[selectedInvitation.status]?.text || 'text-gray-500'
                )}>
                  {selectedInvitation.status}
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
