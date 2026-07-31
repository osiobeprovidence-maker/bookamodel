import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useUser } from '../../contexts/UserContext';
import { useToast } from '../../components/ui/Toast';
import { FileText, Check, X, Eye, Search, User, MapPin, Briefcase, Star, MessageCircle } from 'lucide-react';

const ApplicationsPage = () => {
  const { convexUser } = useUser();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedApp, setSelectedApp] = useState<any>(null);

  const jobRequests = useQuery(
    api.jobRequests.listByBusiness,
    convexUser ? { businessUserId: convexUser._id as any } : 'skip'
  );
  const updateAppStatus = useMutation(api.applications.updateStatus);

  const allApplications = useMemo(() => {
    if (!jobRequests) return [];
    return jobRequests.flatMap((job: any) => ({
      ...job,
      applications: [], // We'll fetch these individually
    }));
  }, [jobRequests]);

  // Fetch applications for each job
  const jobAppQueries = useMemo(() => {
    if (!jobRequests) return [];
    return jobRequests.map((job: any) => ({
      job,
      apps: [] as any[],
    }));
  }, [jobRequests]);

  // We'll use a simpler approach: query all apps per job
  const JobsApplications = () => {
    const [expandedJob, setExpandedJob] = useState<string | null>(null);

    if (!jobRequests) return <div className="text-center py-20 text-gray-500">Loading...</div>;

    return (
      <div className="space-y-6">
        {jobRequests.length === 0 ? (
          <div className="text-center py-20">
            <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No job requests yet</h3>
            <p className="text-gray-500">Create a job request to start receiving applications.</p>
          </div>
        ) : (
          jobRequests.map((job: any) => (
            <JobSection key={job._id} job={job} expandedJob={expandedJob} setExpandedJob={setExpandedJob}
              searchQuery={searchQuery} statusFilter={statusFilter} updateAppStatus={updateAppStatus} toast={toast}
              setSelectedApp={setSelectedApp}
            />
          ))
        )}
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Applications</h1>
        <p className="text-gray-400 mt-1">Review applications from models for your job requests.</p>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search applications..." className="w-full pl-10 pr-4 py-2.5 bg-white/[0.05] border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37]" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-white/[0.05] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-[#D4AF37]">
          <option value="All">All Status</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <JobsApplications />

      {/* Application Detail Modal */}
      <AnimatePresence>
        {selectedApp && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setSelectedApp(null)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="w-full max-w-lg bg-[#111] border border-white/10 rounded-2xl p-6" onClick={e => e.stopPropagation()}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                  <User className="w-6 h-6 text-gray-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">{selectedApp.modelProfile?.displayName || selectedApp.model?.name || 'Model'}</h2>
                  <p className="text-sm text-gray-400">Applied for: {selectedApp.job?.title || 'Job'}</p>
                </div>
              </div>
              {selectedApp.message && (
                <div className="p-3 bg-white/[0.03] rounded-xl mb-4">
                  <p className="text-sm text-gray-400 font-medium mb-1">Message:</p>
                  <p className="text-sm text-gray-300">{selectedApp.message}</p>
                </div>
              )}
              <div className="flex gap-3 mt-4">
                {selectedApp.status === 'pending' && (
                  <>
                    <button onClick={async () => {
                      await updateAppStatus({ applicationId: selectedApp._id, status: 'accepted' });
                      toast('Application accepted', 'success');
                      setSelectedApp(null);
                    }} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-green-500/10 text-green-400 border border-green-500/20 rounded-xl text-xs font-bold hover:bg-green-500/20">
                      <Check className="w-4 h-4" /> Accept
                    </button>
                    <button onClick={async () => {
                      await updateAppStatus({ applicationId: selectedApp._id, status: 'rejected' });
                      toast('Application rejected', 'info');
                      setSelectedApp(null);
                    }} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl text-xs font-bold hover:bg-red-500/20">
                      <X className="w-4 h-4" /> Reject
                    </button>
                  </>
                )}
                <button onClick={() => setSelectedApp(null)} className="flex-1 px-3 py-2.5 bg-white/5 text-gray-300 rounded-xl text-xs font-bold hover:bg-white/10">Close</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

function JobSection({ job, expandedJob, setExpandedJob, searchQuery, statusFilter, updateAppStatus, toast, setSelectedApp }: any) {
  const applications = useQuery(
    api.applications.listByJob,
    { jobRequestId: job._id }
  );

  const filtered = useMemo(() => {
    let result = applications ?? [];
    if (statusFilter !== 'All') result = result.filter((a: any) => a.status === statusFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((a: any) =>
        a.modelProfile?.displayName?.toLowerCase().includes(q) ||
        a.model?.name?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [applications, statusFilter, searchQuery]);

  const isOpen = expandedJob === job._id;

  return (
    <div className="bg-white/[0.03] border border-white/5 rounded-2xl overflow-hidden">
      <button onClick={() => setExpandedJob(isOpen ? null : job._id)}
        className="w-full flex items-center justify-between p-5 hover:bg-white/[0.03] transition-colors"
      >
        <div className="flex items-center gap-3">
          <Briefcase className="w-5 h-5 text-[#D4AF37]" />
          <div className="text-left">
            <h3 className="font-semibold text-white">{job.title}</h3>
            <p className="text-xs text-gray-500">{job.location} · {applications?.length || 0} application{(applications?.length || 0) !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold ${
          job.status === 'active' ? 'bg-green-500/10 text-green-400' :
          job.status === 'draft' ? 'bg-yellow-500/10 text-yellow-400' :
          'bg-gray-500/10 text-gray-400'
        }`}>{job.status}</span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="px-5 pb-5 space-y-2 border-t border-white/5 pt-4">
              {applications === undefined ? (
                <p className="text-sm text-gray-500 py-4 text-center">Loading applications...</p>
              ) : filtered.length === 0 ? (
                <p className="text-sm text-gray-500 py-4 text-center">No applications match your criteria.</p>
              ) : filtered.map((app: any) => (
                <div key={app._id} className="flex items-center justify-between p-3 bg-white/[0.02] rounded-xl hover:bg-white/[0.04] transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{app.modelProfile?.displayName || app.model?.name || 'Model'}</p>
                      <p className="text-xs text-gray-500">{new Date(app._creationTime).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold ${
                      app.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400' :
                      app.status === 'accepted' ? 'bg-green-500/10 text-green-400' :
                      'bg-red-500/10 text-red-400'
                    }`}>{app.status}</span>
                    {app.status === 'pending' && (
                      <>
                        <button onClick={async () => { await updateAppStatus({ applicationId: app._id, status: 'accepted' }); toast('Accepted', 'success'); }}
                          className="p-1.5 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20"><Check className="w-3.5 h-3.5" /></button>
                        <button onClick={async () => { await updateAppStatus({ applicationId: app._id, status: 'rejected' }); toast('Rejected', 'info'); }}
                          className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20"><X className="w-3.5 h-3.5" /></button>
                      </>
                    )}
                    <button onClick={() => setSelectedApp(app)} className="p-1.5 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10"><Eye className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ApplicationsPage;
