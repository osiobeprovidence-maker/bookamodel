import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Send, CheckCircle, Clock, XCircle, AlertCircle,
  Trophy, Calendar, MapPin, Wallet, MessageSquare,
  X, Eye, Ban, RotateCcw,
} from 'lucide-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useUser } from '../../contexts/UserContext';
import { cn } from '../../lib/utils';
import { useToast } from '../../components/ui/Toast';

const statusFilters = ['All', 'Pending', 'Accepted', 'Declined', 'Expired'] as const;
type FilterStatus = (typeof statusFilters)[number];

const statusColors: Record<string, { bg: string; text: string }> = {
  pending: { bg: 'bg-yellow-50', text: 'text-yellow-700' },
  accepted: { bg: 'bg-green-50', text: 'text-green-700' },
  declined: { bg: 'bg-red-50', text: 'text-red-700' },
  expired: { bg: 'bg-gray-100', text: 'text-gray-500' },
  cancelled: { bg: 'bg-gray-100', text: 'text-gray-500' },
};

export default function BusinessInvitations() {
  const { convexUser } = useUser();
  const { toast } = useToast();
  const [activeFilter, setActiveFilter] = useState<FilterStatus>('All');
  const [selectedInvitation, setSelectedInvitation] = useState<any>(null);
  const updateStatus = useMutation(api.invitations.updateStatus);

  const invitations = useQuery(
    api.invitations.listByBusiness,
    convexUser ? { businessUserId: convexUser._id as any } : 'skip'
  );

  if (!invitations) return null;

  const filtered = activeFilter === 'All'
    ? invitations
    : invitations.filter((inv) => inv.status === activeFilter.toLowerCase());

  const stats = [
    { label: 'SENT', value: invitations.length, icon: Send, bg: 'bg-blue-50', color: 'text-blue-500' },
    { label: 'ACCEPTED', value: invitations.filter(i => i.status === 'accepted').length, icon: CheckCircle, bg: 'bg-green-50', color: 'text-green-500' },
    { label: 'PENDING', value: invitations.filter(i => i.status === 'pending').length, icon: Clock, bg: 'bg-yellow-50', color: 'text-yellow-500' },
    { label: 'DECLINED', value: invitations.filter(i => i.status === 'declined').length, icon: XCircle, bg: 'bg-red-50', color: 'text-red-500' },
    { label: 'EXPIRED', value: invitations.filter(i => i.status === 'expired' || i.status === 'cancelled').length, icon: AlertCircle, bg: 'bg-gray-100', color: 'text-gray-400' },
    { label: 'COMPLETED', value: 0, icon: Trophy, bg: 'bg-purple-50', color: 'text-purple-500' },
  ];

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-black tracking-tight text-[#111111]">Invitations</h1>
        <p className="text-gray-400 font-medium text-sm mt-1">Manage invitations sent to models.</p>
      </header>

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

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((inv, i) => (
            <motion.div
              key={inv._id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                  <Send className="w-5 h-5 text-gray-400" />
                </div>
                <div>
                  <h4 className="font-bold text-sm tracking-tight">{inv.title}</h4>
                  <p className="text-xs text-gray-400">{new Date(inv.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {inv.message && (
                <p className="text-xs text-gray-500 mb-4">{inv.message}</p>
              )}

              {inv.proposedDate && (
                <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
                  <Calendar className="w-3 h-3 text-gray-400" />
                  {inv.proposedDate}
                </div>
              )}

              {inv.proposedRate && (
                <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
                  <Wallet className="w-3 h-3 text-gray-400" />
                  {inv.proposedRate}
                </div>
              )}

              <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-4">
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
                  {inv.status === 'pending' && (
                    <button
                      onClick={async () => {
                        await updateStatus({ invitationId: inv._id, status: 'cancelled' });
                        toast('Invitation cancelled', 'success');
                      }}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      title="Cancel"
                    >
                      <Ban className="w-4 h-4" />
                    </button>
                  )}
                  {(inv.status === 'expired' || inv.status === 'declined') && (
                    <button
                      onClick={async () => {
                        await updateStatus({ invitationId: inv._id, status: 'pending' });
                        toast('Invitation resent', 'success');
                      }}
                      className="p-2 text-gray-400 hover:text-[#D4AF37] hover:bg-[#D4AF37]/5 rounded-lg transition-all"
                      title="Resend"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Send className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="text-lg font-bold text-gray-500 mb-2">No invitations yet</h3>
          <p className="text-sm text-gray-400 max-w-sm mx-auto">
            Invite models after creating a casting request.
          </p>
        </div>
      )}

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

            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Title</p>
                <p className="font-bold text-[#111111]">{selectedInvitation.title}</p>
              </div>

              {selectedInvitation.message && (
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Message</p>
                  <p className="text-sm text-gray-600">{selectedInvitation.message}</p>
                </div>
              )}

              {selectedInvitation.proposedDate && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  {selectedInvitation.proposedDate}
                </div>
              )}

              {selectedInvitation.proposedRate && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Wallet className="w-4 h-4 text-gray-400" />
                  {selectedInvitation.proposedRate}
                </div>
              )}

              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="w-4 h-4 text-gray-400" />
                Sent {new Date(selectedInvitation.createdAt).toLocaleDateString()}
              </div>
            </div>

            <div className="flex justify-end border-t border-gray-100 pt-4 mt-6">
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
    </div>
  );
}
