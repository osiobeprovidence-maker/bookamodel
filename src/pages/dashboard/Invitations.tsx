import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, CheckCircle, XCircle, Clock, Calendar, MapPin, Wallet, X } from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useUser } from '../../contexts/UserContext';

const filters = ['All', 'pending', 'accepted', 'declined', 'expired', 'cancelled'] as const;

const statusColors: Record<string, { bg: string; text: string }> = {
  pending: { bg: 'bg-blue-50', text: 'text-blue-700' },
  accepted: { bg: 'bg-green-50', text: 'text-green-700' },
  declined: { bg: 'bg-red-50', text: 'text-red-700' },
  expired: { bg: 'bg-gray-100', text: 'text-gray-500' },
  cancelled: { bg: 'bg-gray-100', text: 'text-gray-500' },
};

export default function Invitations() {
  const { convexUser } = useUser();
  const invitations = useQuery(
    api.invitations.listByModel,
    convexUser ? { modelUserId: convexUser._id as any } : 'skip'
  );
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [selectedInvitation, setSelectedInvitation] = useState<any | null>(null);

  const invitationList = invitations ?? [];

  const filtered = activeFilter === 'All'
    ? invitationList
    : invitationList.filter((inv) => inv.status === activeFilter);

  const stats = [
    { label: 'NEW INVITATIONS', value: invitationList.filter(i => i.status === 'pending').length, icon: Mail, bg: 'bg-blue-50', color: 'text-blue-500' },
    { label: 'ACCEPTED', value: invitationList.filter(i => i.status === 'accepted').length, icon: CheckCircle, bg: 'bg-green-50', color: 'text-green-500' },
    { label: 'DECLINED', value: invitationList.filter(i => i.status === 'declined').length, icon: XCircle, bg: 'bg-red-50', color: 'text-red-500' },
    { label: 'EXPIRED', value: invitationList.filter(i => i.status === 'expired' || i.status === 'cancelled').length, icon: Clock, bg: 'bg-gray-100', color: 'text-gray-400' },
  ];

  if (!convexUser) return <SkeletonLoading />;

  return (
    <div className="p-4 sm:p-6 lg:p-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold" style={{ color: '#111111' }}>Invitations</h1>
        <p className="mt-1 text-gray-400">Manage your casting invitations.</p>
      </div>

      <div className="mb-8 grid grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-widest text-gray-400">{stat.label}</p>
                <p className="mt-2 text-3xl font-bold" style={{ color: '#111111' }}>{stat.value}</p>
              </div>
              <div className={`rounded-xl p-3 ${stat.bg}`}><stat.icon size={22} className={stat.color} /></div>
            </div>
          </div>
        ))}
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button key={filter} onClick={() => setActiveFilter(filter)}
            className={`rounded-full px-4 py-2 text-xs font-medium capitalize transition-colors ${activeFilter === filter ? 'bg-black text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
            {filter}
          </button>
        ))}
      </div>

      {invitationList.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {filtered.map((inv, index) => (
            <motion.div key={inv._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: index * 0.06 }}
              className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#D4AF37] text-sm font-bold text-white">
                  {inv.title?.charAt(0) || '?'}
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#111111' }}>{inv.title}</p>
                  <p className="text-xs text-gray-400">{inv.proposedDate ? new Date(inv.proposedDate).toLocaleDateString() : 'Date TBD'}</p>
                </div>
              </div>
              {inv.message && <p className="mb-4 text-sm text-gray-500">{inv.message}</p>}
              <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                <span className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-widest ${statusColors[inv.status]?.bg || 'bg-gray-100'} ${statusColors[inv.status]?.text || 'text-gray-500'}`}>
                  {inv.status}
                </span>
                <div className="flex gap-2">
                  {inv.status === 'pending' ? (
                    <>
                      <button className="rounded-full bg-[#D4AF37] px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-[#c9a430]">Accept</button>
                      <button className="rounded-full bg-gray-100 px-4 py-2 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-200">Decline</button>
                    </>
                  ) : (
                    <button onClick={() => setSelectedInvitation(inv)} className="rounded-full border border-gray-200 px-4 py-2 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50">View Details</button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="text-lg font-bold text-[#111111] mb-2">No invitations yet</h3>
          <p className="text-sm text-gray-400">Complete your profile to start receiving casting invitations.</p>
        </div>
      )}

      <AnimatePresence>
        {selectedInvitation && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setSelectedInvitation(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.25 }}
              className="mx-4 w-full max-w-lg rounded-2xl bg-white p-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold" style={{ color: '#111111' }}>Invitation Details</h2>
                <button onClick={() => setSelectedInvitation(null)} className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"><X size={20} /></button>
              </div>
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#D4AF37] text-lg font-bold text-white">
                  {selectedInvitation.title?.charAt(0) || '?'}
                </div>
                <div>
                  <p className="font-semibold" style={{ color: '#111111' }}>{selectedInvitation.title}</p>
                  <p className="text-sm text-gray-400">{selectedInvitation.proposedDate ? new Date(selectedInvitation.proposedDate).toLocaleDateString() : 'Date TBD'}</p>
                </div>
              </div>
              {selectedInvitation.message && <p className="mb-4 text-sm text-gray-500">{selectedInvitation.message}</p>}
              {selectedInvitation.proposedRate && (
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4"><Wallet size={15} className="text-gray-400" /> {selectedInvitation.proposedRate}</div>
              )}
              <div className="flex justify-end border-t border-gray-100 pt-4">
                <span className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-widest ${statusColors[selectedInvitation.status]?.bg || 'bg-gray-100'} ${statusColors[selectedInvitation.status]?.text || 'text-gray-500'}`}>
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

function SkeletonLoading() {
  return (
    <div className="p-4 sm:p-6 lg:p-10 animate-pulse">
      <div className="h-8 w-36 bg-gray-200 rounded-lg mb-8" />
      <div className="grid grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (<div key={i} className="bg-white p-6 rounded-2xl border border-gray-100"><div className="h-10 w-10 bg-gray-200 rounded-xl mb-4" /><div className="h-3 w-20 bg-gray-200 rounded mb-2" /><div className="h-8 w-8 bg-gray-200 rounded" /></div>))}
      </div>
    </div>
  );
}
