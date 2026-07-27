import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Search, Send, CheckCircle, Clock, XCircle, Trophy, X, FileText, MapPin, DollarSign, Calendar, ExternalLink } from 'lucide-react'
import { applications } from '../../data/dashboardData'

type Application = (typeof applications)[number]

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-50 text-yellow-700',
  accepted: 'bg-green-50 text-green-700',
  rejected: 'bg-red-50 text-red-700',
  completed: 'bg-blue-50 text-blue-700',
}

const stats = [
  { label: 'Applications', value: 24, icon: Send, color: 'text-blue-500', bg: 'bg-blue-50' },
  { label: 'Accepted', value: 8, icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50' },
  { label: 'Pending', value: 10, icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-50' },
  { label: 'Rejected', value: 4, icon: XCircle, color: 'text-red-500', bg: 'bg-red-50' },
  { label: 'Completed', value: 2, icon: Trophy, color: 'text-purple-500', bg: 'bg-purple-50' },
]

const filters = ['All', 'Pending', 'Accepted', 'Rejected', 'Completed']

export default function Applications() {
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('All')
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)

  const filtered = applications.filter((app) => {
    const matchesSearch = app.brand.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = activeFilter === 'All' || app.status.toLowerCase() === activeFilter.toLowerCase()
    return matchesSearch && matchesFilter
  })

  return (
    <div className="p-10">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-2xl font-bold text-[#111111]">Applications</h1>
        <p className="text-gray-400 mt-1">Track every application you've submitted.</p>
      </motion.div>

      {/* Statistics */}
      <div className="grid grid-cols-5 gap-4 mt-8">
        {stats.map((stat, i) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.07 }}
              className="bg-white rounded-2xl p-5 border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-gray-400">{stat.label}</p>
                  <p className="text-2xl font-bold text-[#111111] mt-1">{stat.value}</p>
                </div>
                <div className={`${stat.bg} rounded-xl p-3`}>
                  <Icon size={20} className={stat.color} />
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Search & Filter */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="bg-white rounded-2xl p-5 border border-gray-100 mt-6"
      >
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by brand..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#D4AF37] transition-colors"
            />
          </div>
          <div className="flex gap-2">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-4 py-2 rounded-xl text-xs font-medium transition-colors ${
                  activeFilter === f
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Desktop Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.45 }}
        className="bg-white rounded-2xl border border-gray-100 mt-6 overflow-hidden hidden lg:block"
      >
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-5 py-4 text-[10px] uppercase tracking-widest text-gray-400 font-medium">Brand</th>
              <th className="text-left px-5 py-4 text-[10px] uppercase tracking-widest text-gray-400 font-medium">Campaign</th>
              <th className="text-left px-5 py-4 text-[10px] uppercase tracking-widest text-gray-400 font-medium">Location</th>
              <th className="text-left px-5 py-4 text-[10px] uppercase tracking-widest text-gray-400 font-medium">Applied Date</th>
              <th className="text-left px-5 py-4 text-[10px] uppercase tracking-widest text-gray-400 font-medium">Status</th>
              <th className="text-left px-5 py-4 text-[10px] uppercase tracking-widest text-gray-400 font-medium">Payment</th>
              <th className="text-left px-5 py-4 text-[10px] uppercase tracking-widest text-gray-400 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((app, i) => (
              <motion.tr
                key={app.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.25, delay: i * 0.03 }}
                className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
              >
                <td className="px-5 py-4 text-sm font-semibold text-[#111111]">{app.brand}</td>
                <td className="px-5 py-4 text-sm text-gray-500">{app.campaign}</td>
                <td className="px-5 py-4 text-sm text-gray-500">{app.location}</td>
                <td className="px-5 py-4 text-sm text-gray-500">{app.appliedDate}</td>
                <td className="px-5 py-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${statusColors[app.status.toLowerCase()]}`}>
                    {app.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-sm text-gray-500">{app.payment}</td>
                <td className="px-5 py-4">
                  <button
                    onClick={() => setSelectedApplication(app)}
                    className="text-xs font-bold text-[#D4AF37] hover:underline transition-colors"
                  >
                    View
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-gray-400 text-sm">No applications found.</div>
        )}
      </motion.div>

      {/* Mobile Cards */}
      <div className="lg:hidden mt-6 space-y-4">
        {filtered.map((app, i) => (
          <motion.div
            key={app.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className="bg-white rounded-2xl p-5 border border-gray-100"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-[#111111]">{app.brand}</p>
                <p className="text-sm text-gray-400 mt-0.5">{app.campaign}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[app.status.toLowerCase()]}`}>
                {app.status}
              </span>
            </div>
            <div className="mt-3 space-y-1">
              <p className="text-sm text-gray-500 flex items-center gap-2"><MapPin size={13} /> {app.location}</p>
              <p className="text-sm text-gray-500 flex items-center gap-2"><Calendar size={13} /> {app.appliedDate}</p>
              <p className="text-sm text-gray-500 flex items-center gap-2"><DollarSign size={13} /> {app.payment}</p>
            </div>
            <button
              onClick={() => setSelectedApplication(app)}
              className="mt-4 text-xs font-bold text-[#D4AF37] hover:underline"
            >
              View Details
            </button>
          </motion.div>
        ))}
        {filtered.length === 0 && (
          <div className="py-12 text-center text-gray-400 text-sm">No applications found.</div>
        )}
      </div>

      {/* Slide-in Panel */}
      <AnimatePresence>
        {selectedApplication && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedApplication(null)}
              className="fixed inset-0 bg-black/30 z-40"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-[#111111]">Application Details</h2>
                  <button
                    onClick={() => setSelectedApplication(null)}
                    className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <X size={18} className="text-gray-400" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">Brand</p>
                    <p className="text-lg font-bold text-[#111111]">{selectedApplication.brand}</p>
                  </div>

                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">Campaign</p>
                    <p className="font-medium text-[#111111]">{selectedApplication.campaign}</p>
                  </div>

                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">Status</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${statusColors[selectedApplication.status.toLowerCase()]}`}>
                      {selectedApplication.status}
                    </span>
                  </div>

                  <hr className="border-gray-100" />

                  <div className="space-y-3">
                    <p className="text-[10px] uppercase tracking-widest text-gray-400">Requirements</p>
                    {['Portfolio with 10+ images', 'Previous campaign experience', 'Social media presence (5k+)', 'Professional headshot'].map((req) => (
                      <div key={req} className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
                        <FileText size={14} className="text-gray-400 shrink-0" />
                        <p className="text-sm text-gray-600">{req}</p>
                      </div>
                    ))}
                  </div>

                  <hr className="border-gray-100" />

                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-2">Payment Info</p>
                    <div className="bg-[#F8F8F8] rounded-xl p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Amount</span>
                        <span className="text-sm font-bold text-[#111111]">{selectedApplication.payment}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Location</span>
                        <span className="text-sm text-[#111111]">{selectedApplication.location}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Applied</span>
                        <span className="text-sm text-[#111111]">{selectedApplication.appliedDate}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedApplication(null)}
                    className="w-full py-3 rounded-xl bg-[#D4AF37] text-white font-bold text-sm hover:bg-[#c9a432] transition-colors flex items-center justify-center gap-2"
                  >
                    <ExternalLink size={14} /> View Full Application
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
