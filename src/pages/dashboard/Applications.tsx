import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Send, CheckCircle, Clock, XCircle, Trophy, X, FileText, MapPin, DollarSign, Calendar, ExternalLink } from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useUser } from '../../contexts/UserContext';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-50 text-yellow-700',
  accepted: 'bg-green-50 text-green-700',
  rejected: 'bg-red-50 text-red-700',
  withdrawn: 'bg-gray-100 text-gray-500',
};

const filters = ['All', 'Pending', 'Accepted', 'Rejected'];

export default function Applications() {
  const { convexUser } = useUser();
  const applications = useQuery(
    api.applications.listByModel,
    convexUser ? { modelUserId: convexUser._id as any } : 'skip'
  );
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedApplication, setSelectedApplication] = useState<any | null>(null);

  const applicationList = applications ?? [];

  const filtered = applicationList.filter((app) => {
    const matchesSearch = app._id.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = activeFilter === 'All' || app.status.toLowerCase() === activeFilter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const stats = [
    { label: 'Applications', value: applicationList.length, icon: Send, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Accepted', value: applicationList.filter(a => a.status === 'accepted').length, icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50' },
    { label: 'Pending', value: applicationList.filter(a => a.status === 'pending').length, icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-50' },
    { label: 'Rejected', value: applicationList.filter(a => a.status === 'rejected').length, icon: XCircle, color: 'text-red-500', bg: 'bg-red-50' },
    { label: 'Withdrawn', value: applicationList.filter(a => a.status === 'withdrawn').length, icon: Trophy, color: 'text-gray-500', bg: 'bg-gray-100' },
  ];

  if (!convexUser) return <SkeletonLoading />;

  return (
    <div className="p-4 sm:p-6 lg:p-10">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-2xl font-bold text-[#111111]">Applications</h1>
        <p className="text-gray-400 mt-1">Track every application you've submitted.</p>
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mt-8">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: i * 0.07 }}
              className="bg-white rounded-2xl p-5 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-gray-400">{stat.label}</p>
                  <p className="text-2xl font-bold text-[#111111] mt-1">{stat.value}</p>
                </div>
                <div className={`${stat.bg} rounded-xl p-3`}><Icon size={20} className={stat.color} /></div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {applicationList.length > 0 ? (
        <>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }}
            className="bg-white rounded-2xl p-5 border border-gray-100 mt-6">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#D4AF37] transition-colors" />
              </div>
              <div className="flex gap-2">
                {filters.map((f) => (
                  <button key={f} onClick={() => setActiveFilter(f)}
                    className={`px-4 py-2 rounded-xl text-xs font-medium transition-colors ${activeFilter === f ? 'bg-black text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.45 }}
            className="bg-white rounded-2xl border border-gray-100 mt-6 overflow-hidden hidden lg:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-5 py-4 text-[10px] uppercase tracking-widest text-gray-400 font-medium">Job ID</th>
                  <th className="text-left px-5 py-4 text-[10px] uppercase tracking-widest text-gray-400 font-medium">Applied Date</th>
                  <th className="text-left px-5 py-4 text-[10px] uppercase tracking-widest text-gray-400 font-medium">Status</th>
                  <th className="text-left px-5 py-4 text-[10px] uppercase tracking-widest text-gray-400 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((app, i) => (
                  <motion.tr key={app._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25, delay: i * 0.03 }}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 text-sm font-semibold text-[#111111]">{app._id.slice(0, 8)}...</td>
                    <td className="px-5 py-4 text-sm text-gray-500">{new Date(app.createdAt).toLocaleDateString()}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${statusColors[app.status.toLowerCase()] || 'bg-gray-100 text-gray-500'}`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button onClick={() => setSelectedApplication(app)} className="text-xs font-bold text-[#D4AF37] hover:underline transition-colors">View</button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <div className="py-12 text-center text-gray-400 text-sm">No applications match your search.</div>}
          </motion.div>

          <div className="lg:hidden mt-6 space-y-4">
            {filtered.map((app, i) => (
              <motion.div key={app._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.05 }}
                className="bg-white rounded-2xl p-5 border border-gray-100">
                <div className="flex items-start justify-between">
                  <div><p className="font-semibold text-[#111111]">{app._id.slice(0, 8)}...</p></div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[app.status] || 'bg-gray-100 text-gray-500'}`}>{app.status}</span>
                </div>
                <div className="mt-3 space-y-1">
                  <p className="text-sm text-gray-500 flex items-center gap-2"><Calendar size={13} /> {new Date(app.createdAt).toLocaleDateString()}</p>
                </div>
                <button onClick={() => setSelectedApplication(app)} className="mt-4 text-xs font-bold text-[#D4AF37] hover:underline">View Details</button>
              </motion.div>
            ))}
            {filtered.length === 0 && <div className="py-12 text-center text-gray-400 text-sm">No applications found.</div>}
          </div>
        </>
      ) : (
        <div className="mt-8 text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Send className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="text-lg font-bold text-[#111111] mb-2">No applications yet</h3>
          <p className="text-sm text-gray-400">Start applying for opportunities to see them here.</p>
        </div>
      )}

      <AnimatePresence>
        {selectedApplication && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedApplication(null)} className="fixed inset-0 bg-black/30 z-40" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-[#111111]">Application Details</h2>
                  <button onClick={() => setSelectedApplication(null)} className="p-2 rounded-xl hover:bg-gray-100 transition-colors"><X size={18} className="text-gray-400" /></button>
                </div>
                <div className="space-y-6">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">Status</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${statusColors[selectedApplication.status] || 'bg-gray-100 text-gray-500'}`}>
                      {selectedApplication.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">Applied</p>
                    <p className="font-medium text-[#111111]">{new Date(selectedApplication.createdAt).toLocaleString()}</p>
                  </div>
                  {selectedApplication.message && (
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">Message</p>
                      <p className="text-sm text-gray-600">{selectedApplication.message}</p>
                    </div>
                  )}
                  <button onClick={() => setSelectedApplication(null)}
                    className="w-full py-3 rounded-xl bg-[#D4AF37] text-white font-bold text-sm hover:bg-[#c9a432] transition-colors flex items-center justify-center gap-2">
                    <ExternalLink size={14} /> Close
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function SkeletonLoading() {
  return (
    <div className="p-4 sm:p-6 lg:p-10 animate-pulse">
      <div className="h-8 w-40 bg-gray-200 rounded-lg mb-6" />
      <div className="grid grid-cols-5 gap-4 mb-6">
        {[1, 2, 3, 4, 5].map((i) => (<div key={i} className="bg-white p-5 rounded-2xl border border-gray-100"><div className="h-10 w-10 bg-gray-200 rounded-xl mb-4" /><div className="h-3 w-16 bg-gray-200 rounded mb-2" /><div className="h-8 w-8 bg-gray-200 rounded" /></div>))}
      </div>
    </div>
  );
}
