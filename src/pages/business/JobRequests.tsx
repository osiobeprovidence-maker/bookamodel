/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Briefcase,
  Plus,
  Copy,
  Search,
  Filter,
  Edit3,
  Eye,
  Trash2,
  Users,
  Send,
  Calendar,
  MapPin,
  Wallet,
  X,
  FileText,
  Upload,
  ChevronDown,
} from 'lucide-react';
import { jobRequests } from '../../data/businessData';
import { cn } from '../../lib/utils';
import { useToast } from '../../components/ui/Toast';

type FilterTab = 'all' | 'draft' | 'open' | 'closed' | 'completed' | 'cancelled';

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  Open: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  Draft: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  Completed: { bg: 'bg-blue-100', text: 'text-blue-700' },
  Closed: { bg: 'bg-gray-100', text: 'text-gray-600' },
  Cancelled: { bg: 'bg-red-100', text: 'text-red-700' },
};

const STAT_COLORS = [
  { label: 'Active', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
  { label: 'Draft', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-100' },
  { label: 'Completed', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
  { label: 'Cancelled', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100' },
  { label: 'Expired', color: 'text-gray-500', bg: 'bg-gray-50', border: 'border-gray-100' },
];

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'draft', label: 'Draft' },
  { key: 'open', label: 'Open' },
  { key: 'closed', label: 'Closed' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

const CATEGORIES = ['Fashion', 'Commercial', 'Runway', 'Beauty', 'Fitness', 'Lifestyle'];

export default function JobRequests() {
  const { toast } = useToast();
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [localJobs, setLocalJobs] = useState(jobRequests);
  const [viewJob, setViewJob] = useState<typeof jobRequests[number] | null>(null);

  const filteredJobs = localJobs.filter((job) => {
    const matchesFilter =
      activeFilter === 'all' || job.status?.toLowerCase() === activeFilter;
    const matchesSearch =
      !searchQuery ||
      job.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.category?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusCount = (status: string) => {
    if (status === 'Active') {
      return localJobs.filter((j) => j.status === 'Open').length;
    }
    if (status === 'Expired') {
      return 0;
    }
    return localJobs.filter((j) => j.status === status).length;
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
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

        {/* Action Buttons Row */}
        <div className="flex flex-wrap gap-3 mb-8">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 border border-gray-200 bg-white text-gray-700 px-4 py-2.5 rounded-xl text-sm font-medium hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all"
          >
            <Plus size={14} />
            Create Job
          </button>
          <button className="flex items-center gap-2 border border-gray-200 bg-white text-gray-700 px-4 py-2.5 rounded-xl text-sm font-medium hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all" onClick={() => toast('Import Brief coming soon', 'info')}>
            <Upload size={14} />
            Import Brief
          </button>
          <button className="flex items-center gap-2 border border-gray-200 bg-white text-gray-700 px-4 py-2.5 rounded-xl text-sm font-medium hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all" onClick={() => toast('Select a job to duplicate', 'info')}>
            <Copy size={14} />
            Duplicate Job
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {STAT_COLORS.map((stat) => {
            const count = getStatusCount(stat.label);
            return (
              <div
                key={stat.label}
                className={cn(
                  'bg-white rounded-2xl border p-5 shadow-sm',
                  stat.border
                )}
              >
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                  {stat.label}
                </p>
                <p className={cn('text-2xl font-bold', stat.color)}>{count}</p>
              </div>
            );
          })}
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-gray-100 focus:border-[#D4AF37] outline-none transition-all text-sm"
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium transition-all',
                activeFilter === tab.key
                  ? 'bg-[#D4AF37] text-white'
                  : 'bg-white text-gray-500 border border-gray-200 hover:border-[#D4AF37] hover:text-[#D4AF37]'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Job Cards */}
        {filteredJobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Briefcase size={48} className="mb-4 opacity-40" />
            <p className="text-lg font-semibold text-gray-500">No jobs found</p>
            <p className="text-sm text-gray-400 mt-1">
              Try adjusting your filters or create a new job.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filteredJobs.map((job, index) => {
              const statusStyle = STATUS_COLORS[job.status] || {
                bg: 'bg-gray-100',
                text: 'text-gray-600',
              };
              return (
                <motion.div
                  key={job.id || index}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.04 }}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-base font-bold text-[#111111] truncate">
                          {job.name || 'Untitled Campaign'}
                        </h3>
                        <span
                          className={cn(
                            'px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap',
                            statusStyle.bg,
                            statusStyle.text
                          )}
                        >
                          {job.status}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-500">
                        <span className="flex items-center gap-1.5">
                          <Users size={14} />
                          {job.applications ?? 0} Applications
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Send size={14} />
                          {job.invited ?? 0} Invited
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Wallet size={14} />
                          {job.budget ? `₦${Number(job.budget).toLocaleString()}` : '—'}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MapPin size={14} />
                          {job.location || '—'}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Calendar size={14} />
                          {job.date || '—'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => toast('Job editing coming soon', 'info')}
                        title="Edit"
                        className="p-2 rounded-lg text-gray-400 hover:text-[#D4AF37] hover:bg-yellow-50 transition-all"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => setViewJob(job)}
                        title="View"
                        className="p-2 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-all"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => {
                          const newJob = { ...job, id: `${job.id}-copy-${Date.now()}`, name: `${job.name} (Copy)`, applications: 0, invited: 0, status: 'Draft' as const };
                          setLocalJobs((prev) => [...prev, newJob]);
                          toast(`Duplicated "${job.name}"`, 'success');
                        }}
                        title="Duplicate"
                        className="p-2 rounded-lg text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 transition-all"
                      >
                        <Copy size={16} />
                      </button>
                      <button
                        onClick={() => {
                          setLocalJobs((prev) => prev.filter((j) => j.id !== job.id));
                          toast(`Deleted "${job.name}"`, 'info');
                        }}
                        title="Delete"
                        className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Job Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowCreateModal(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            <motion.div
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-6 py-5 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center">
                    <FileText size={18} className="text-[#D4AF37]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-[#111111]">
                      Create New Job
                    </h2>
                    <p className="text-xs text-gray-400">
                      Fill in the details to post a new model job.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="px-6 py-6 space-y-5">
                {/* Campaign Name */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                    Campaign Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Summer Fashion Shoot"
                    className="w-full px-4 py-3 bg-white rounded-xl border border-gray-100 focus:border-[#D4AF37] outline-none transition-all text-sm"
                  />
                </div>

                {/* Brand */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                    Brand
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. StyleHouse Lagos"
                    className="w-full px-4 py-3 bg-white rounded-xl border border-gray-100 focus:border-[#D4AF37] outline-none transition-all text-sm"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                    Category
                  </label>
                  <div className="relative">
                    <select className="w-full px-4 py-3 bg-white rounded-xl border border-gray-100 focus:border-[#D4AF37] outline-none transition-all text-sm appearance-none">
                      <option value="">Select category</option>
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={16}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                    Description
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Describe the job requirements, expectations, and any special instructions..."
                    className="w-full px-4 py-3 bg-white rounded-xl border border-gray-100 focus:border-[#D4AF37] outline-none transition-all text-sm resize-none"
                  />
                </div>

                {/* Gender & Age Range */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                      Gender
                    </label>
                    <div className="relative">
                      <select className="w-full px-4 py-3 bg-white rounded-xl border border-gray-100 focus:border-[#D4AF37] outline-none transition-all text-sm appearance-none">
                        <option value="">Any</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                      <ChevronDown
                        size={16}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                      Min Age
                    </label>
                    <input
                      type="number"
                      placeholder="18"
                      min={16}
                      max={80}
                      className="w-full px-4 py-3 bg-white rounded-xl border border-gray-100 focus:border-[#D4AF37] outline-none transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                      Max Age
                    </label>
                    <input
                      type="number"
                      placeholder="35"
                      min={16}
                      max={80}
                      className="w-full px-4 py-3 bg-white rounded-xl border border-gray-100 focus:border-[#D4AF37] outline-none transition-all text-sm"
                    />
                  </div>
                </div>

                {/* Height & Experience */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                      Height
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 5'8 - 6'0"
                      className="w-full px-4 py-3 bg-white rounded-xl border border-gray-100 focus:border-[#D4AF37] outline-none transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                      Experience
                    </label>
                    <div className="relative">
                      <select className="w-full px-4 py-3 bg-white rounded-xl border border-gray-100 focus:border-[#D4AF37] outline-none transition-all text-sm appearance-none">
                        <option value="">Any</option>
                        <option value="Entry">Entry</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Experienced">Experienced</option>
                      </select>
                      <ChevronDown
                        size={16}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Lagos, Nigeria"
                    className="w-full px-4 py-3 bg-white rounded-xl border border-gray-100 focus:border-[#D4AF37] outline-none transition-all text-sm"
                  />
                </div>

                {/* Budget & Payment Type */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                      Budget (₦)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">
                        ₦
                      </span>
                      <input
                        type="text"
                        placeholder="0.00"
                        className="w-full pl-8 pr-4 py-3 bg-white rounded-xl border border-gray-100 focus:border-[#D4AF37] outline-none transition-all text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                      Payment Type
                    </label>
                    <div className="relative">
                      <select className="w-full px-4 py-3 bg-white rounded-xl border border-gray-100 focus:border-[#D4AF37] outline-none transition-all text-sm appearance-none">
                        <option value="Fixed">Fixed</option>
                        <option value="Hourly">Hourly</option>
                        <option value="Day Rate">Day Rate</option>
                      </select>
                      <ChevronDown
                        size={16}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                      Shoot Dates
                    </label>
                    <input
                      type="date"
                      className="w-full px-4 py-3 bg-white rounded-xl border border-gray-100 focus:border-[#D4AF37] outline-none transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                      Application Deadline
                    </label>
                    <input
                      type="date"
                      className="w-full px-4 py-3 bg-white rounded-xl border border-gray-100 focus:border-[#D4AF37] outline-none transition-all text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex items-center justify-end gap-3 rounded-b-2xl">
                <button
                  onClick={() => { setShowCreateModal(false); toast('Preview coming soon', 'info'); }}
                  className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-all"
                >
                  Preview
                </button>
                <button
                  onClick={() => { setShowCreateModal(false); toast('Job saved as draft', 'success'); }}
                  className="px-5 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-200 transition-all"
                >
                  Save Draft
                </button>
                <button
                  onClick={() => {
                    const newJob = {
                      id: `job-${Date.now()}`,
                      name: 'New Campaign',
                      category: 'Fashion',
                      status: 'Open' as const,
                      applications: 0,
                      invited: 0,
                      budget: '₦0',
                      location: 'Lagos',
                      date: new Date().toISOString().split('T')[0],
                      description: 'New campaign job.',
                    };
                    setLocalJobs((prev) => [...prev, newJob]);
                    setShowCreateModal(false);
                    toast('Job published successfully!', 'success');
                  }}
                  className="px-5 py-2.5 bg-[#D4AF37] text-white rounded-xl text-sm font-semibold hover:bg-[#C5A028] transition-all"
                >
                  Publish
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Job Modal */}
      <AnimatePresence>
        {viewJob && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={() => setViewJob(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-white rounded-2xl p-6 sm:p-8 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[#111111]">Job Details</h2>
                <button onClick={() => setViewJob(null)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Campaign</p>
                  <p className="font-bold text-[#111111]">{viewJob.name}</p>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1"><Users size={14} /> {viewJob.applications} Applications</span>
                  <span className="flex items-center gap-1"><Send size={14} /> {viewJob.invited} Invited</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1"><Wallet size={14} /> {viewJob.budget}</span>
                  <span className="flex items-center gap-1"><MapPin size={14} /> {viewJob.location}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1"><Calendar size={14} /> {viewJob.date}</span>
                  <span className={cn('px-2 py-0.5 rounded-full text-xs font-bold', STATUS_COLORS[viewJob.status]?.bg, STATUS_COLORS[viewJob.status]?.text)}>{viewJob.status}</span>
                </div>
                {viewJob.description && (
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Description</p>
                    <p className="text-sm text-gray-600">{viewJob.description}</p>
                  </div>
                )}
              </div>
              <div className="flex justify-end mt-6">
                <button onClick={() => setViewJob(null)} className="px-5 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-200 transition-all">Close</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
