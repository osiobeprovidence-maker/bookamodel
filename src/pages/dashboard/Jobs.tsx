import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useUser } from '../../contexts/UserContext';
import { useToast } from '../../components/ui/Toast';
import { Briefcase, MapPin, Clock, DollarSign, Search, Send, X, Calendar, ChevronDown, User, Filter, ArrowRight } from 'lucide-react';

type JobVisibility = 'public' | 'open_to_all' | 'invitation_only';
type JobStatus = 'draft' | 'active' | 'completed' | 'cancelled' | 'expired';

export default function Jobs() {
  const { convexUser } = useUser();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [locationFilter, setLocationFilter] = useState('All');
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [applyModal, setApplyModal] = useState<any>(null);
  const [applyMessage, setApplyMessage] = useState('');

  const jobs = useQuery(api.jobRequests.listOpen);
  const myApplications = useQuery(
    api.applications.listByModel,
    convexUser ? { modelUserId: convexUser._id as any } : 'skip'
  );
  const myInvitations = useQuery(
    api.invitations.listByModel,
    convexUser ? { modelUserId: convexUser._id as any } : 'skip'
  );
  const sendApplication = useMutation(api.applications.create);

  const appliedJobIds = useMemo(() => new Set((myApplications ?? []).map((a: any) => a.jobRequestId)), [myApplications]);
  const invitedJobIds = useMemo(() => new Set((myInvitations ?? []).map((i: any) => i.jobRequestId)), [myInvitations]);

  const filteredJobs = useMemo(() => {
    let result = [...(jobs ?? [])];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(j => j.title?.toLowerCase().includes(q) || j.description?.toLowerCase().includes(q) || j.location?.toLowerCase().includes(q));
    }
    if (categoryFilter !== 'All') result = result.filter(j => j.category === categoryFilter);
    if (locationFilter !== 'All') result = result.filter(j => j.location?.toLowerCase().includes(locationFilter.toLowerCase()));
    return result;
  }, [jobs, searchQuery, categoryFilter, locationFilter]);

  const categories = useMemo(() => {
    const cats = new Set((jobs ?? []).map(j => j.category).filter(Boolean));
    return ['All', ...Array.from(cats)];
  }, [jobs]);

  const locations = useMemo(() => {
    const locs = new Set((jobs ?? []).map(j => j.location).filter(Boolean));
    return ['All', ...Array.from(locs)];
  }, [jobs]);

  const handleApply = async () => {
    if (!convexUser || !applyModal) return;
    try {
      await sendApplication({
        modelUserId: convexUser._id as any,
        jobRequestId: applyModal._id,
        message: applyMessage || undefined,
      });
      toast('Application submitted!', 'success');
      setApplyModal(null);
      setApplyMessage('');
    } catch {
      toast('Failed to submit application', 'error');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Available Jobs</h1>
        <p className="text-gray-400 mt-1">Find modelling opportunities that match your profile.</p>
      </div>

      {/* Search & Filters */}
      <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search jobs by title, description, or location..." className="w-full pl-12 pr-4 py-3 bg-white/[0.05] border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37] transition-all" />
          {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"><X className="w-4 h-4" /></button>}
        </div>
        <div className="flex flex-wrap gap-3">
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="bg-white/[0.05] border border-white/10 rounded-xl px-4 py-2 text-sm text-gray-300 focus:outline-none focus:border-[#D4AF37]">
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={locationFilter} onChange={e => setLocationFilter(e.target.value)} className="bg-white/[0.05] border border-white/10 rounded-xl px-4 py-2 text-sm text-gray-300 focus:outline-none focus:border-[#D4AF37]">
            {locations.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
      </div>

      {/* Jobs List */}
      {jobs === undefined ? (
        <div className="text-center py-20 text-gray-500">Loading jobs...</div>
      ) : filteredJobs.length === 0 ? (
        <div className="text-center py-20">
          <Briefcase className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No jobs available</h3>
          <p className="text-gray-500">Check back later for new opportunities.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredJobs.map((job, i) => {
            const hasApplied = appliedJobIds.has(job._id);
            const hasInvite = invitedJobIds.has(job._id);
            return (
              <motion.div key={job._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 hover:bg-white/[0.06] transition-colors cursor-pointer"
                onClick={() => setSelectedJob(selectedJob?._id === job._id ? null : job)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-white mb-1">{job.title}</h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-400">
                      <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{job.location}</span>
                      <span className="flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5" />{job.category}</span>
                      {job.date && <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{job.date}</span>}
                      {job.budget && <span className="flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5" />{job.budget}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {hasApplied ? (
                      <span className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-green-500/10 text-green-400 border border-green-500/20">Applied</span>
                    ) : hasInvite ? (
                      <span className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20">Invited</span>
                    ) : (
                      <button onClick={e => { e.stopPropagation(); setApplyModal(job); }} className="px-4 py-1.5 rounded-xl bg-[#D4AF37] text-black text-xs font-bold hover:bg-[#C5A032] transition-colors">Apply</button>
                    )}
                  </div>
                </div>
                <AnimatePresence>
                  {selectedJob?._id === job._id && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="pt-4 mt-4 border-t border-white/5 space-y-3">
                        <p className="text-gray-300 text-sm leading-relaxed">{job.description || 'No description provided.'}</p>
                        {job.genderRequirement && <p className="text-sm text-gray-400"><span className="text-gray-500">Gender:</span> {job.genderRequirement}</p>}
                        {job.duration && <p className="text-sm text-gray-400"><span className="text-gray-500">Duration:</span> {job.duration}</p>}
                        {job.modelsNeeded && <p className="text-sm text-gray-400"><span className="text-gray-500">Models needed:</span> {job.modelsNeeded}</p>}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Apply Modal */}
      <AnimatePresence>
        {applyModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => { setApplyModal(null); setApplyMessage(''); }}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="w-full max-w-md bg-[#111] border border-white/10 rounded-2xl p-6" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white">Apply for Job</h2>
                <button onClick={() => { setApplyModal(null); setApplyMessage(''); }} className="p-1 text-gray-500 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-3 bg-white/[0.03] rounded-xl mb-4">
                <p className="font-semibold text-white">{applyModal?.title}</p>
                <p className="text-sm text-gray-400">{applyModal?.location} · {applyModal?.category}</p>
              </div>
              <textarea rows={4} value={applyMessage} onChange={e => setApplyMessage(e.target.value)} placeholder="Add a message to the business (optional)..." className="w-full px-4 py-3 bg-white/[0.05] border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37] resize-none mb-4" />
              <div className="flex gap-3">
                <button onClick={() => { setApplyModal(null); setApplyMessage(''); }} className="flex-1 px-4 py-2.5 border border-white/10 text-gray-300 rounded-xl text-sm font-medium hover:bg-white/5">Cancel</button>
                <button onClick={handleApply} className="flex-1 px-4 py-2.5 bg-[#D4AF37] text-black rounded-xl text-sm font-bold hover:bg-[#C5A032] flex items-center justify-center gap-2">
                  <Send className="w-4 h-4" /> Submit Application
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
