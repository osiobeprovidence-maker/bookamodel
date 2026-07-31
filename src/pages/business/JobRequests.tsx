import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase, Plus, Search, Eye, Trash2,
  Users, Send, Calendar, MapPin, Wallet,
  X, FileText, ChevronDown,
} from 'lucide-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useUser } from '../../contexts/UserContext';
import { cn } from '../../lib/utils';
import { useToast } from '../../components/ui/Toast';

type FilterTab = 'all' | 'draft' | 'active' | 'closed' | 'completed' | 'cancelled';

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  active: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  draft: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  completed: { bg: 'bg-blue-100', text: 'text-blue-700' },
  cancelled: { bg: 'bg-red-100', text: 'text-red-700' },
  expired: { bg: 'bg-gray-100', text: 'text-gray-500' },
};

const STAT_LABELS = ['Active', 'Draft', 'Completed', 'Cancelled', 'Expired'];

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'draft', label: 'Draft' },
  { key: 'active', label: 'Active' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

export default function JobRequests() {
  const { convexUser } = useUser();
  const { toast } = useToast();
  const categories = useQuery(api.categories.listActive);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewJob, setViewJob] = useState<any>(null);

  const [form, setForm] = useState({
    title: '', brand: '', category: '', description: '', gender: '',
    minAge: '', maxAge: '', height: '', experience: '',
    location: '', budget: '', paymentType: 'Fixed',
    shootDate: '', deadline: '',
  });

  const jobRequests = useQuery(
    api.jobRequests.listByBusiness,
    convexUser ? { businessUserId: convexUser._id as any } : 'skip'
  );
  const createJob = useMutation(api.jobRequests.create);
  const deleteJob = useMutation(api.jobRequests.remove);

  if (!jobRequests) return null;

  const filteredJobs = jobRequests.filter((job) => {
    const statusFilter = activeFilter === 'all' || job.status === activeFilter;
    if (!statusFilter) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return job.title.toLowerCase().includes(q) || (job.category || '').toLowerCase().includes(q);
  });

  const getStatusCount = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'active') return jobRequests.filter(j => j.status === 'active' || j.status === 'open').length;
    if (s === 'expired') return 0;
    return jobRequests.filter(j => j.status === s).length;
  };

  const handleCreate = async (status: 'draft' | 'active') => {
    if (!convexUser) return;
    try {
      await createJob({
        businessUserId: convexUser._id as any,
        title: form.title || 'Untitled Campaign',
        description: form.description || '',
        category: form.category || '',
        location: form.location || '',
        date: form.shootDate || '',
        time: undefined,
        duration: undefined,
        budget: form.budget || undefined,
        modelsNeeded: undefined,
        genderRequirement: form.gender || undefined,
        visibility: 'public',
        status,
      });
      setShowCreateModal(false);
      setForm({ title: '', brand: '', category: '', description: '', gender: '', minAge: '', maxAge: '', height: '', experience: '', location: '', budget: '', paymentType: 'Fixed', shootDate: '', deadline: '' });
      toast(status === 'draft' ? 'Job saved as draft' : 'Job published successfully!', 'success');
    } catch {
      toast('Failed to create job', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#111111]">Job Requests</h1>
            <p className="text-gray-500 text-sm mt-1">Create and manage jobs.</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-[#D4AF37] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#C5A028] transition-all"
          >
            <Plus size={16} />
            Create Job
          </button>
        </div>

        <div className="flex flex-wrap gap-3 mb-8">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 border border-gray-200 bg-white text-gray-700 px-4 py-2.5 rounded-xl text-sm font-medium hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all"
          >
            <Plus size={14} />
            Create Job
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {STAT_LABELS.map((label) => {
            const count = getStatusCount(label);
            const colorMap: Record<string, string> = {
              Active: 'text-emerald-600', Draft: 'text-yellow-600', Completed: 'text-blue-600',
              Cancelled: 'text-red-600', Expired: 'text-gray-500',
            };
            const borderMap: Record<string, string> = {
              Active: 'border-emerald-100', Draft: 'border-yellow-100', Completed: 'border-blue-100',
              Cancelled: 'border-red-100', Expired: 'border-gray-100',
            };
            return (
              <div key={label} className={cn('bg-white rounded-2xl border p-5 shadow-sm', borderMap[label] || 'border-gray-100')}>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{label}</p>
                <p className={cn('text-2xl font-bold', colorMap[label] || 'text-gray-500')}>{count}</p>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text" placeholder="Search jobs..." value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-gray-100 focus:border-[#D4AF37] outline-none transition-all text-sm"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {FILTER_TABS.map((tab) => (
            <button key={tab.key} onClick={() => setActiveFilter(tab.key)}
              className={cn('px-4 py-2 rounded-full text-sm font-medium transition-all',
                activeFilter === tab.key ? 'bg-[#D4AF37] text-white' : 'bg-white text-gray-500 border border-gray-200 hover:border-[#D4AF37] hover:text-[#D4AF37]'
              )}>
              {tab.label}
            </button>
          ))}
        </div>

        {filteredJobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <Briefcase size={32} className="text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-500 mb-2">No active casting requests</h3>
            <p className="text-sm text-gray-400 mb-8">Create your first job to start finding models.</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 bg-[#D4AF37] text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-[#C5A028] transition-all"
            >
              <Plus size={16} />
              Create Your First Job
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filteredJobs.map((job, index) => {
              const statusStyle = STATUS_COLORS[job.status] || { bg: 'bg-gray-100', text: 'text-gray-600' };
              return (
                <motion.div key={job._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: index * 0.04 }} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-base font-bold text-[#111111] truncate">{job.title}</h3>
                        <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap', statusStyle.bg, statusStyle.text)}>{job.status}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-500">
                        <span className="flex items-center gap-1.5"><Users size={14} /> 0 Applications</span>
                        <span className="flex items-center gap-1.5"><Send size={14} /> 0 Invited</span>
                        {job.budget && <span className="flex items-center gap-1.5"><Wallet size={14} /> ₦{Number(job.budget).toLocaleString()}</span>}
                        {job.location && <span className="flex items-center gap-1.5"><MapPin size={14} /> {job.location}</span>}
                        {job.date && <span className="flex items-center gap-1.5"><Calendar size={14} /> {job.date}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => setViewJob(job)} title="View" className="p-2 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-all"><Eye size={16} /></button>
                      <button onClick={async () => { await deleteJob({ jobRequestId: job._id }); toast('Job deleted', 'info'); }} title="Delete" className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"><Trash2 size={16} /></button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showCreateModal && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
            <motion.div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }}>
              <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-6 py-5 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center"><FileText size={18} className="text-[#D4AF37]" /></div>
                  <div><h2 className="text-lg font-bold text-[#111111]">Create New Job</h2><p className="text-xs text-gray-400">Fill in the details to post a new model job.</p></div>
                </div>
                <button onClick={() => setShowCreateModal(false)} className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"><X size={18} /></button>
              </div>

              <div className="px-6 py-6 space-y-5">
                <div><label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Campaign Name</label>
                  <input type="text" placeholder="e.g. Summer Fashion Shoot" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full px-4 py-3 bg-white rounded-xl border border-gray-100 focus:border-[#D4AF37] outline-none transition-all text-sm" /></div>

                <div><label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Category</label>
                  <div className="relative">
                    <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full px-4 py-3 bg-white rounded-xl border border-gray-100 focus:border-[#D4AF37] outline-none transition-all text-sm appearance-none">
                      <option value="">Select category</option>
                      {(categories ?? []).map(cat => <option key={cat._id} value={cat.slug}>{cat.name}</option>)}
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div><label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Description</label>
                  <textarea rows={4} placeholder="Describe the job requirements..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full px-4 py-3 bg-white rounded-xl border border-gray-100 focus:border-[#D4AF37] outline-none transition-all text-sm resize-none" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div><label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Gender</label>
                    <div className="relative">
                      <select value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))} className="w-full px-4 py-3 bg-white rounded-xl border border-gray-100 focus:border-[#D4AF37] outline-none transition-all text-sm appearance-none">
                        <option value="">Any</option><option value="Male">Male</option><option value="Female">Female</option>
                      </select>
                      <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  <div><label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Min Age</label>
                    <input type="number" placeholder="18" value={form.minAge} onChange={e => setForm(f => ({ ...f, minAge: e.target.value }))} className="w-full px-4 py-3 bg-white rounded-xl border border-gray-100 focus:border-[#D4AF37] outline-none transition-all text-sm" /></div>
                  <div><label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Max Age</label>
                    <input type="number" placeholder="35" value={form.maxAge} onChange={e => setForm(f => ({ ...f, maxAge: e.target.value }))} className="w-full px-4 py-3 bg-white rounded-xl border border-gray-100 focus:border-[#D4AF37] outline-none transition-all text-sm" /></div>
                </div>

                <div><label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Location</label>
                  <input type="text" placeholder="e.g. Lagos, Nigeria" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} className="w-full px-4 py-3 bg-white rounded-xl border border-gray-100 focus:border-[#D4AF37] outline-none transition-all text-sm" /></div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Budget (₦)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">₦</span>
                      <input type="text" placeholder="0.00" value={form.budget} onChange={e => setForm(f => ({ ...f, budget: e.target.value }))} className="w-full pl-8 pr-4 py-3 bg-white rounded-xl border border-gray-100 focus:border-[#D4AF37] outline-none transition-all text-sm" />
                    </div>
                  </div>
                  <div><label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Shoot Date</label>
                    <input type="date" value={form.shootDate} onChange={e => setForm(f => ({ ...f, shootDate: e.target.value }))} className="w-full px-4 py-3 bg-white rounded-xl border border-gray-100 focus:border-[#D4AF37] outline-none transition-all text-sm" /></div>
                </div>
              </div>

              <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex items-center justify-end gap-3 rounded-b-2xl">
                <button onClick={() => { setShowCreateModal(false); toast('Preview coming soon', 'info'); }} className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-all">Preview</button>
                <button onClick={() => handleCreate('draft')} className="px-5 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-200 transition-all">Save Draft</button>
                <button onClick={() => handleCreate('active')} className="px-5 py-2.5 bg-[#D4AF37] text-white rounded-xl text-sm font-semibold hover:bg-[#C5A028] transition-all">Publish</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {viewJob && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setViewJob(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-lg bg-white rounded-2xl p-6 sm:p-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[#111111]">Job Details</h2>
                <button onClick={() => setViewJob(null)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4">
                <div><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Campaign</p><p className="font-bold text-[#111111]">{viewJob.title}</p></div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1"><Users size={14} /> 0 Applications</span>
                  <span className="flex items-center gap-1"><Send size={14} /> 0 Invited</span>
                </div>
                {viewJob.budget && <div className="flex items-center gap-2 text-sm text-gray-500"><Wallet size={14} /> {viewJob.budget}</div>}
                {viewJob.location && <div className="flex items-center gap-2 text-sm text-gray-500"><MapPin size={14} /> {viewJob.location}</div>}
                {viewJob.date && <div className="flex items-center gap-2 text-sm text-gray-500"><Calendar size={14} /> {viewJob.date}</div>}
                {viewJob.description && <div><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Description</p><p className="text-sm text-gray-600">{viewJob.description}</p></div>}
                <div><span className={cn('px-2 py-0.5 rounded-full text-xs font-bold', STATUS_COLORS[viewJob.status]?.bg, STATUS_COLORS[viewJob.status]?.text)}>{viewJob.status}</span></div>
              </div>
              <div className="flex justify-end mt-6"><button onClick={() => setViewJob(null)} className="px-5 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-200 transition-all">Close</button></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
