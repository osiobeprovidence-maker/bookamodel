import { useState } from 'react';
import { motion } from 'motion/react';
import {
  Upload,
  Video,
  FolderPlus,
  Camera,
  Folder,
  Eye,
  Globe,
  Lock,
  MoreVertical,
  Pencil,
  Trash2,
  Download,
  Image,
  X,
} from 'lucide-react';
import { portfolioItems } from '../../data/dashboardData';

const filters = ['All', 'Photos', 'Videos', 'Runway', 'Editorial', 'Commercial', 'Beauty', 'Lifestyle', 'Fitness'];

export default function Portfolio() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const filteredItems =
    activeFilter === 'All'
      ? portfolioItems
      : portfolioItems.filter((item) => item.category === activeFilter);

  const stats = [
    { label: 'TOTAL PHOTOS', value: '47', icon: Camera, bg: 'bg-blue-50', color: 'text-blue-500' },
    { label: 'TOTAL VIDEOS', value: '12', icon: Video, bg: 'bg-purple-50', color: 'text-purple-500' },
    { label: 'ALBUMS', value: '6', icon: Folder, bg: 'bg-orange-50', color: 'text-orange-500' },
    { label: 'PORTFOLIO VIEWS', value: '2,847', icon: Eye, bg: 'bg-green-50', color: 'text-green-500' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold" style={{ color: '#111111' }}>
          Portfolio
        </h1>
        <p className="mt-1 text-gray-400">Showcase your best work.</p>
      </div>

      {/* Top Actions */}
      <div className="mb-8 flex flex-wrap justify-end gap-3">
        <button
          onClick={() => setIsUploadOpen(true)}
          className="flex items-center gap-2 rounded-full bg-[#D4AF37] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#c9a430]"
        >
          <Upload size={16} />
          Upload Photos
        </button>
        <button className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50">
          <Video size={16} />
          Upload Videos
        </button>
        <button className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50">
          <FolderPlus size={16} />
          Create Album
        </button>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid grid-cols-2 lg:grid-cols-4 gap-6">
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

      {/* Gallery Grid */}
      <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
        {filteredItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.06 }}
            className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
          >
            <div className="relative aspect-[3/4] overflow-hidden">
              <img
                src={item.image}
                alt={item.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />

              {/* Visibility Badge */}
              <div className="absolute right-3 top-3 rounded-full bg-black/50 p-1.5 backdrop-blur-sm">
                {item.visibility === 'Public' ? (
                  <Globe size={14} className="text-white" />
                ) : (
                  <Lock size={14} className="text-white" />
                )}
              </div>

              {/* Category Badge */}
              <div className="absolute left-3 top-3 rounded-full bg-black/50 px-3 py-1 backdrop-blur-sm">
                <span className="text-[10px] font-medium uppercase tracking-widest text-white">
                  {item.category}
                </span>
              </div>

              {/* Three-dot Menu */}
              <div className="absolute right-3 top-3 mt-7">
                <button
                  onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
                  className="rounded-full bg-black/50 p-1.5 backdrop-blur-sm transition-colors hover:bg-black/70"
                >
                  <MoreVertical size={14} className="text-white" />
                </button>
                {openMenuId === item.id && (
                  <div className="absolute right-0 z-10 mt-1 w-44 rounded-xl border border-gray-100 bg-white py-1 shadow-lg">
                    <button className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50">
                      <Pencil size={14} /> Edit
                    </button>
                    <button className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50">
                      <Image size={14} /> Set as Cover
                    </button>
                    <button className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50">
                      <Download size={14} /> Download
                    </button>
                    <button className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50">
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Card Footer */}
            <div className="p-4">
              <h3 className="truncate text-sm font-semibold" style={{ color: '#111111' }}>
                {item.title}
              </h3>
              <p className="mt-1 text-xs text-gray-400">
                Uploaded {item.dateUploaded}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Upload Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25 }}
            className="mx-4 w-full max-w-lg rounded-2xl bg-white p-8 shadow-2xl"
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold" style={{ color: '#111111' }}>
                Upload Photos
              </h2>
              <button
                onClick={() => setIsUploadOpen(false)}
                className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-[#F8F8F8] px-6 py-16 transition-colors hover:border-[#D4AF37]">
              <div className="mb-4 rounded-2xl bg-gray-100 p-4">
                <Upload size={32} className="text-gray-400" />
              </div>
              <p className="text-sm font-medium" style={{ color: '#111111' }}>
                Drag and drop your photos here
              </p>
              <p className="mt-1 text-xs text-gray-400">
                or click to browse files
              </p>
              <p className="mt-3 text-[10px] uppercase tracking-widest text-gray-400">
                JPG, PNG or WebP up to 10MB
              </p>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setIsUploadOpen(false)}
                className="rounded-full border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
              >
                Cancel
              </button>
              <button className="rounded-full bg-[#D4AF37] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#c9a430]">
                Upload
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
