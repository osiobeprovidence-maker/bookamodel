import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mail,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  MapPin,
  Wallet,
  X,
} from 'lucide-react';
import { invitations } from '../../data/dashboardData';

const filters = ['New', 'Accepted', 'Declined', 'Expired', 'All'] as const;

type FilterStatus = (typeof filters)[number];

const statusColors: Record<string, { bg: string; text: string }> = {
  New: { bg: 'bg-blue-50', text: 'text-blue-700' },
  Accepted: { bg: 'bg-green-50', text: 'text-green-700' },
  Declined: { bg: 'bg-red-50', text: 'text-red-700' },
  Expired: { bg: 'bg-gray-100', text: 'text-gray-500' },
};

export default function Invitations() {
  const [activeFilter, setActiveFilter] = useState<FilterStatus>('All');
  const [selectedInvitation, setSelectedInvitation] = useState<typeof invitations[number] | null>(null);

  const filtered =
    activeFilter === 'All'
      ? invitations
      : invitations.filter((inv) => inv.status === activeFilter);

  const stats = [
    { label: 'NEW INVITATIONS', value: '5', icon: Mail, bg: 'bg-blue-50', color: 'text-blue-500' },
    { label: 'ACCEPTED', value: '3', icon: CheckCircle, bg: 'bg-green-50', color: 'text-green-500' },
    { label: 'DECLINED', value: '2', icon: XCircle, bg: 'bg-red-50', color: 'text-red-500' },
    { label: 'EXPIRED', value: '1', icon: Clock, bg: 'bg-gray-100', color: 'text-gray-400' },
  ];

  return (
    <div className="p-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold" style={{ color: '#111111' }}>
          Invitations
        </h1>
        <p className="mt-1 text-gray-400">Manage your casting invitations.</p>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-widest text-gray-400">
                  {stat.label}
                </p>
                <p className="mt-2 text-3xl font-bold" style={{ color: '#111111' }}>
                  {stat.value}
                </p>
              </div>
              <div className={`rounded-xl p-3 ${stat.bg}`}>
                <stat.icon size={22} className={stat.color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="mb-8 flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`rounded-full px-4 py-2 text-xs font-medium transition-colors ${
              activeFilter === filter
                ? 'bg-black text-white'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Invitation Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {filtered.map((inv, index) => (
          <motion.div
            key={inv.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.06 }}
            className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
          >
            {/* Brand Header */}
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#D4AF37] text-sm font-bold text-white">
                {inv.brandName.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: '#111111' }}>
                  {inv.brandName}
                </p>
                <p className="text-xs text-gray-400">{inv.campaign}</p>
              </div>
            </div>

            {/* Details Row */}
            <div className="mb-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-gray-500">
              <div className="flex items-center gap-1.5">
                <Calendar size={13} className="text-gray-400" />
                {inv.date}
              </div>
              <div className="flex items-center gap-1.5">
                <Clock size={13} className="text-gray-400" />
                {inv.time} · {inv.duration}
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin size={13} className="text-gray-400" />
                {inv.location}
              </div>
              <div className="flex items-center gap-1.5">
                <Wallet size={13} className="text-gray-400" />
                ₦{inv.pay.toLocaleString()}
              </div>
            </div>

            {/* Description */}
            <p className="mb-4 text-sm text-gray-500">{inv.description}</p>

            {/* Requirements */}
            <div className="mb-4 flex flex-wrap gap-2">
              {inv.requirements.map((req) => (
                <span
                  key={req}
                  className="rounded-full bg-gray-100 px-3 py-1 text-[10px] font-medium text-gray-500"
                >
                  {req}
                </span>
              ))}
            </div>

            {/* Status & Actions */}
            <div className="flex items-center justify-between border-t border-gray-100 pt-4">
              <span
                className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-widest ${statusColors[inv.status].bg} ${statusColors[inv.status].text}`}
              >
                {inv.status}
              </span>
              <div className="flex gap-2">
                {inv.status === 'New' ? (
                  <>
                    <button className="rounded-full bg-[#D4AF37] px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-[#c9a430]">
                      Accept
                    </button>
                    <button className="rounded-full bg-gray-100 px-4 py-2 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-200">
                      Decline
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setSelectedInvitation(inv)}
                    className="rounded-full border border-gray-200 px-4 py-2 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50"
                  >
                    View Details
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

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
              transition={{ duration: 0.25 }}
              className="mx-4 w-full max-w-lg rounded-2xl bg-white p-8 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold" style={{ color: '#111111' }}>
                  Invitation Details
                </h2>
                <button
                  onClick={() => setSelectedInvitation(null)}
                  className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#D4AF37] text-lg font-bold text-white">
                  {selectedInvitation.brandName.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold" style={{ color: '#111111' }}>
                    {selectedInvitation.brandName}
                  </p>
                  <p className="text-sm text-gray-400">{selectedInvitation.campaign}</p>
                </div>
              </div>

              <div className="mb-4 space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar size={15} className="text-gray-400" />
                  {selectedInvitation.date}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock size={15} className="text-gray-400" />
                  {selectedInvitation.time} · {selectedInvitation.duration}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <MapPin size={15} className="text-gray-400" />
                  {selectedInvitation.location}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Wallet size={15} className="text-gray-400" />
                  ₦{selectedInvitation.pay.toLocaleString()}
                </div>
              </div>

              <p className="mb-4 text-sm text-gray-500">{selectedInvitation.description}</p>

              <div className="mb-6 flex flex-wrap gap-2">
                {selectedInvitation.requirements.map((req) => (
                  <span
                    key={req}
                    className="rounded-full bg-gray-100 px-3 py-1 text-[10px] font-medium text-gray-500"
                  >
                    {req}
                  </span>
                ))}
              </div>

              <div className="flex justify-end border-t border-gray-100 pt-4">
                <span
                  className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-widest ${statusColors[selectedInvitation.status].bg} ${statusColors[selectedInvitation.status].text}`}
                >
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
