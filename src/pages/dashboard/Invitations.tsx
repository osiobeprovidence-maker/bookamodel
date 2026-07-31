import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Check, X, Eye, Search, Calendar, Wallet, Briefcase, UserRound, CheckCircle2 } from 'lucide-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useUser } from '../../contexts/UserContext';
import { useToast } from '../../components/ui/Toast';
import { EmptyState, ListSkeleton } from '../../components/ui/EmptyState';

const statusTabs = ['All', 'pending', 'accepted', 'declined', 'expired', 'cancelled'] as const;

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-50 text-yellow-700',
  accepted: 'bg-green-50 text-green-700',
  declined: 'bg-red-50 text-red-700',
  expired: 'bg-gray-100 text-gray-500',
  cancelled: 'bg-gray-100 text-gray-500',
};

const Invitations = () => {
  const { convexUser } = useUser();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvite, setSelectedInvite] = useState<any>(null);

  const invitations = useQuery(
    api.invitations.listByModel,
    convexUser ? { modelUserId: convexUser._id as any } : 'skip'
  );
  const updateStatus = useMutation(api.invitations.updateStatus);

  const filteredInvitations = useMemo(() => {
    let result = invitations ?? [];
    if (activeTab !== 'All') result = result.filter((i: any) => i.status === activeTab);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((i: any) => i.title?.toLowerCase().includes(q) || i.businessProfile?.companyName?.toLowerCase().includes(q));
    }
    return result;
  }, [invitations, activeTab, searchQuery]);

  const stats = useMemo(() => {
    const list = invitations ?? [];
    return {
      total: list.length,
      pending: list.filter((i: any) => i.status === 'pending').length,
      accepted: list.filter((i: any) => i.status === 'accepted').length,
      declined: list.filter((i: any) => i.status === 'declined').length,
      expired: list.filter((i: any) => i.status === 'expired').length,
    };
  }, [invitations]);

  const handleAccept = async (invitationId: any) => {
    try {
      await updateStatus({ invitationId, status: 'accepted' });
      toast('Invitation accepted!', 'success');
    } catch { toast('Failed to accept invitation', 'error'); }
  };

  const handleDecline = async (invitationId: any) => {
    try {
      await updateStatus({ invitationId, status: 'declined' });
      toast('Invitation declined', 'info');
    } catch { toast('Failed to decline invitation', 'error'); }
  };

  const statCards = [
    { label: 'New Invitations', value: stats.pending, color: 'text-yellow-400' },
    { label: 'Accepted', value: stats.accepted, color: 'text-green-400' },
    { label: 'Declined', value: stats.declined, color: 'text-red-400' },
    { label: 'Expired', value: stats.expired, color: 'text-gray-400' },
  ];

  const StatusPill = ({ status }: { status: string }) => (
    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-500'}`}>
      {status}
    </span>
  );

  const companyName = (inv: any) => inv.businessProfile?.companyName || inv.business?.name || 'Business';

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#111111]">Invitations</h1>
        <p className="text-gray-400 mt-1">Manage job invitations from businesses.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.06 }}
            className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-400 mb-1">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {invitations === undefined ? (
        <ListSkeleton rows={4} />
      ) : (invitations ?? []).length === 0 ? (
        <EmptyState
          icon={<Mail className="w-7 h-7" />}
          title="No Invitations Yet"
          description="Businesses will invite you after reviewing your profile and applications."
          actions={[
            { label: 'Browse Jobs', primary: true, icon: <Briefcase className="w-4 h-4" />, onClick: () => navigate('/model-dashboard/jobs') },
            { label: 'View My Profile', icon: <UserRound className="w-4 h-4" />, onClick: () => navigate('/model-dashboard/profile') },
          ]}
          footer={
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">How to receive invitations</p>
              <div className="grid sm:grid-cols-2 gap-3 max-w-lg mx-auto">
                {[
                  'Complete your profile',
                  'Upload quality portfolio',
                  'Stay active',
                  'Become a Pro member',
                ].map(tip => (
                  <div key={tip} className="flex items-center gap-2.5 text-sm text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                    {tip}
                  </div>
                ))}
              </div>
            </div>
          }
        />
      ) : (
        <>
          {/* Search & Tabs */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search invitations..." className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-[#111111] placeholder-gray-400 focus:outline-none focus:border-[#D4AF37] transition-all" />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {statusTabs.map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    activeTab === tab ? 'bg-black text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {tab === 'All' ? 'All' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Recent Invitations */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-[#111111]">Recent Invitations</h3>
              <span className="text-xs text-gray-400">{filteredInvitations.length} total</span>
            </div>

            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-5 py-4 text-[10px] uppercase tracking-widest text-gray-400 font-medium">Business</th>
                    <th className="text-left px-5 py-4 text-[10px] uppercase tracking-widest text-gray-400 font-medium">Job</th>
                    <th className="text-left px-5 py-4 text-[10px] uppercase tracking-widest text-gray-400 font-medium">Date</th>
                    <th className="text-left px-5 py-4 text-[10px] uppercase tracking-widest text-gray-400 font-medium">Rate</th>
                    <th className="text-left px-5 py-4 text-[10px] uppercase tracking-widest text-gray-400 font-medium">Status</th>
                    <th className="text-left px-5 py-4 text-[10px] uppercase tracking-widest text-gray-400 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvitations.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center text-sm text-gray-400">No invitations match your search.</td>
                    </tr>
                  ) : filteredInvitations.map((inv: any, i: number) => (
                    <motion.tr key={inv._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25, delay: i * 0.03 }}
                      className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {inv.businessProfile?.logoUrl ? (
                            <img src={inv.businessProfile.logoUrl} alt="" className="w-8 h-8 rounded-lg object-cover bg-gray-100" />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                              <span className="text-xs font-bold text-[#D4AF37]">{companyName(inv)[0]}</span>
                            </div>
                          )}
                          <span className="text-sm font-medium text-[#111111]">{companyName(inv)}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600">{inv.title}</td>
                      <td className="px-5 py-4 text-sm text-gray-500">{inv.proposedDate || '—'}</td>
                      <td className="px-5 py-4 text-sm text-gray-500">{inv.proposedRate || '—'}</td>
                      <td className="px-5 py-4"><StatusPill status={inv.status} /></td>
                      <td className="px-5 py-4">
                        {inv.status === 'pending' ? (
                          <div className="flex gap-2">
                            <button onClick={() => handleAccept(inv._id)} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 border border-green-100 rounded-xl text-xs font-semibold hover:bg-green-100 transition-colors">
                              <Check className="w-3.5 h-3.5" /> Accept
                            </button>
                            <button onClick={() => handleDecline(inv._id)} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 border border-red-100 rounded-xl text-xs font-semibold hover:bg-red-100 transition-colors">
                              <X className="w-3.5 h-3.5" /> Decline
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => setSelectedInvite(inv)} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-xl text-xs font-semibold hover:bg-gray-200 transition-colors">
                            <Eye className="w-3.5 h-3.5" /> View
                          </button>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="lg:hidden divide-y divide-gray-50">
              {filteredInvitations.length === 0 ? (
                <div className="py-12 text-center text-sm text-gray-400">No invitations match your search.</div>
              ) : filteredInvitations.map((inv: any, i: number) => (
                <motion.div key={inv._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="p-5">
                  <div className="flex items-start gap-3 mb-3">
                    {inv.businessProfile?.logoUrl ? (
                      <img src={inv.businessProfile.logoUrl} alt="" className="w-10 h-10 rounded-xl object-cover bg-gray-100" />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                        <span className="text-lg font-bold text-[#D4AF37]">{companyName(inv)[0]}</span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-[#111111] text-sm">{inv.title}</h3>
                      <p className="text-xs text-gray-500">{companyName(inv)}</p>
                    </div>
                    <StatusPill status={inv.status} />
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-4">
                    {inv.proposedDate && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{inv.proposedDate}</span>}
                    {inv.proposedRate && <span className="flex items-center gap-1"><Wallet className="w-3 h-3" />{inv.proposedRate}</span>}
                  </div>
                  <div className="flex gap-2">
                    {inv.status === 'pending' ? (
                      <>
                        <button onClick={() => handleAccept(inv._id)} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-green-50 text-green-700 border border-green-100 rounded-xl text-xs font-semibold hover:bg-green-100 transition-colors">
                          <Check className="w-3.5 h-3.5" /> Accept
                        </button>
                        <button onClick={() => handleDecline(inv._id)} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-red-50 text-red-700 border border-red-100 rounded-xl text-xs font-semibold hover:bg-red-100 transition-colors">
                          <X className="w-3.5 h-3.5" /> Decline
                        </button>
                      </>
                    ) : (
                      <button onClick={() => setSelectedInvite(inv)} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-600 rounded-xl text-xs font-semibold hover:bg-gray-200 transition-colors">
                        <Eye className="w-3.5 h-3.5" /> View Details
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </>
      )}
      <AnimatePresence>
        {selectedInvite && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={() => setSelectedInvite(null)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="w-full max-w-md bg-white border border-gray-100 rounded-2xl p-6 shadow-xl" onClick={e => e.stopPropagation()}>
              <h2 className="text-lg font-bold text-[#111111] mb-4">{selectedInvite.title}</h2>
              <div className="space-y-3 text-sm">
                <p><span className="text-gray-500">From:</span> <span className="text-[#111111]">{companyName(selectedInvite)}</span></p>
                {selectedInvite.message && <p><span className="text-gray-500">Message:</span> <span className="text-gray-600">{selectedInvite.message}</span></p>}
                {selectedInvite.proposedDate && <p><span className="text-gray-500">Date:</span> <span className="text-gray-600">{selectedInvite.proposedDate}</span></p>}
                {selectedInvite.proposedRate && <p><span className="text-gray-500">Rate:</span> <span className="text-gray-600">{selectedInvite.proposedRate}</span></p>}
                <p><span className="text-gray-500">Status:</span> <StatusPill status={selectedInvite.status} /></p>
              </div>
              <button onClick={() => setSelectedInvite(null)} className="mt-6 w-full px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm hover:bg-gray-200">Close</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Invitations;
