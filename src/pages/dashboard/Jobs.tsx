import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useUser } from '../../contexts/UserContext';
import { useToast } from '../../components/ui/Toast';
import { Briefcase, MapPin, DollarSign, Search, Send, X, Calendar, Bookmark, Sparkles, RotateCw, UserRound, CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { EmptyState, ListSkeleton, StatSkeleton } from '../../components/ui/EmptyState';

const SAVED_JOBS_KEY = 'bam:savedJobs';

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
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem(SAVED_JOBS_KEY) || '[]'));
    } catch {
      return new Set();
    }
  });

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

  const stats = useMemo(() => [
    { label: 'Available Jobs', value: jobs?.length ?? 0, icon: Briefcase, color: 'text-[#D4AF37]', bg: 'bg-[#D4AF37]/10' },
    { label: 'Saved Jobs', value: savedJobIds.size, icon: Bookmark, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'Applied Jobs', value: myApplications?.length ?? 0, icon: Send, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Recommended', value: (jobs ?? []).filter(j => !appliedJobIds.has(j._id)).length, icon: Sparkles, color: 'text-purple-600', bg: 'bg-purple-50' },
  ], [jobs, savedJobIds, myApplications, appliedJobIds]);

  const toggleSaveJob = (id: string) => {
    setSavedJobIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      try {
        localStorage.setItem(SAVED_JOBS_KEY, JSON.stringify([...next]));
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const handleRefresh = () => {
    setSearchQuery('');
    setCategoryFilter('All');
    setLocationFilter('All');
    toast('Jobs refreshed', 'info');
  };

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
        <h1 className="text-2xl font-bold text-[#111111]">Available Jobs</h1>
        <p className="text-gray-400 mt-1">Find modelling opportunities that match your profile.</p>
      </div>

      {jobs === undefined ? (
        <>
          <StatSkeleton />
          <ListSkeleton />
        </>
      ) : (
        <>
          {/* Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div key={stat.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.06 }}
                  className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
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

          {/* Search & Filters */}
          {jobs.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search jobs by title, description, or location..." className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-[#111111] placeholder-gray-400 focus:outline-none focus:border-[#D4AF37] transition-all" />
                {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#111111]"><X className="w-4 h-4" /></button>}
              </div>
              <div className="flex flex-wrap gap-3">
                <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-700 focus:outline-none focus:border-[#D4AF37]">
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select value={locationFilter} onChange={e => setLocationFilter(e.target.value)} className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-700 focus:outline-none focus:border-[#D4AF37]">
                  {locations.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </motion.div>
          )}

          {/* Jobs List or Empty State */}
          {filteredJobs.length === 0 ? (
            <EmptyState
              icon={<Briefcase className="w-7 h-7" />}
              title="No Jobs Available Yet"
              description="We couldn't find any modelling opportunities matching your profile right now."
              actions={[
                { label: 'Complete Your Profile', primary: true, icon: <UserRound className="w-4 h-4" />, onClick: () => navigate('/model-dashboard/profile') },
                { label: 'Refresh Jobs', icon: <RotateCw className="w-4 h-4" />, onClick: handleRefresh },
              ]}
              footer={
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Tips to receive more jobs</p>
                  <div className="grid sm:grid-cols-2 gap-3 max-w-lg mx-auto">
                    {[
                      'Upload professional photos',
                      'Add measurements',
                      'Add portfolio videos',
                      'Upgrade to Pro',
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
            <div className="space-y-4">
              {filteredJobs.map((job, i) => {
                const hasApplied = appliedJobIds.has(job._id);
                const hasInvite = invitedJobIds.has(job._id);
                const isSaved = savedJobIds.has(job._id);
                return (
                  <motion.div key={job._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                    className="bg-white border border-gray-100 rounded-2xl p-6 hover:bg-gray-50 hover:shadow-md shadow-sm transition-all cursor-pointer"
                    onClick={() => setSelectedJob(selectedJob?._id === job._id ? null : job)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-[#111111] mb-1">{job.title}</h3>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                          <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{job.location}</span>
                          <span className="flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5" />{job.category}</span>
                          {job.date && <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{job.date}</span>}
                          {job.budget && <span className="flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5" />{job.budget}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button onClick={e => { e.stopPropagation(); toggleSaveJob(job._id); }} aria-label={isSaved ? 'Remove from saved' : 'Save job'}
                          className={cn('p-2.5 rounded-xl border transition-colors', isSaved ? 'border-[#D4AF37]/40 bg-[#D4AF37]/10 text-[#D4AF37]' : 'border-gray-200 text-gray-400 hover:text-[#D4AF37] hover:border-[#D4AF37]/40')}>
                          <Bookmark className={cn('w-4 h-4', isSaved && 'fill-current')} />
                        </button>
                        {hasApplied ? (
                          <span className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-green-50 text-green-700">Applied</span>
                        ) : hasInvite ? (
                          <span className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-yellow-50 text-yellow-700">Invited</span>
                        ) : (
                          <button onClick={e => { e.stopPropagation(); setApplyModal(job); }} className="px-4 py-2 rounded-xl bg-[#D4AF37] text-white text-xs font-bold hover:bg-[#C5A028] transition-colors">Apply</button>
                        )}
                      </div>
                    </div>
                    <AnimatePresence>
                      {selectedJob?._id === job._id && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                          <div className="pt-4 mt-4 border-t border-gray-100 space-y-3">
                            <p className="text-gray-600 text-sm leading-relaxed">{job.description || 'No description provided.'}</p>
                            {job.genderRequirement && <p className="text-sm text-gray-500"><span className="text-gray-400">Gender:</span> {job.genderRequirement}</p>}
                            {job.duration && <p className="text-sm text-gray-500"><span className="text-gray-400">Duration:</span> {job.duration}</p>}
                            {job.modelsNeeded && <p className="text-sm text-gray-500"><span className="text-gray-400">Models needed:</span> {job.modelsNeeded}</p>}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Apply Modal */}
      <AnimatePresence>
        {applyModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={() => { setApplyModal(null); setApplyMessage(''); }}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="w-full max-w-md bg-white border border-gray-100 rounded-2xl p-6 shadow-xl" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-[#111111]">Apply for Job</h2>
                <button onClick={() => { setApplyModal(null); setApplyMessage(''); }} className="p-1 text-gray-400 hover:text-[#111111]"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl mb-4">
                <p className="font-semibold text-[#111111]">{applyModal?.title}</p>
                <p className="text-sm text-gray-500">{applyModal?.location} · {applyModal?.category}</p>
              </div>
              <textarea rows={4} value={applyMessage} onChange={e => setApplyMessage(e.target.value)} placeholder="Add a message to the business (optional)..." className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-[#111111] placeholder-gray-400 focus:outline-none focus:border-[#D4AF37] resize-none mb-4" />
              <div className="flex gap-3">
                <button onClick={() => { setApplyModal(null); setApplyMessage(''); }} className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50">Cancel</button>
                <button onClick={handleApply} className="flex-1 px-4 py-2.5 bg-[#D4AF37] text-white rounded-xl text-sm font-bold hover:bg-[#C5A028] flex items-center justify-center gap-2">
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
