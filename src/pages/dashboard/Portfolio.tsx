import { useState, useRef, type ChangeEvent } from 'react';
import { motion } from 'motion/react';
import { Upload, Video, FolderPlus, Camera, Folder, Eye, Globe, Lock, MoreVertical, Pencil, Trash2, Download, Image as ImageIcon, X, Loader2 } from 'lucide-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useUser } from '../../contexts/UserContext';

const filters = ['All', 'Photos', 'Videos', 'Runway', 'Editorial', 'Commercial', 'Beauty', 'Lifestyle', 'Fitness'];

export default function Portfolio() {
  const { convexUser } = useUser();
  const portfolioItems = useQuery(
    api.portfolio.getByUser,
    convexUser ? { userId: convexUser._id as any } : 'skip'
  );
  const modelProfile = useQuery(
    api.users.getModelProfile,
    convexUser ? { userId: convexUser._id as any } : 'skip'
  );
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);
  const addPortfolioItem = useMutation(api.portfolio.add);
  const removePortfolioItem = useMutation(api.portfolio.remove);
  const [activeFilter, setActiveFilter] = useState('All');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState('portrait');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredItems = !portfolioItems ? [] :
    activeFilter === 'All'
      ? portfolioItems
      : portfolioItems.filter((item) => item.category.toLowerCase() === activeFilter.toLowerCase());

  const photoCount = portfolioItems?.filter(i => i.type === 'image' || !i.type).length ?? 0;
  const videoCount = portfolioItems?.filter(i => i.type === 'video').length ?? 0;

  const stats = [
    { label: 'TOTAL PHOTOS', value: String(photoCount), icon: Camera, bg: 'bg-blue-50', color: 'text-blue-500' },
    { label: 'TOTAL VIDEOS', value: String(videoCount), icon: Video, bg: 'bg-purple-50', color: 'text-purple-500' },
    { label: 'ALBUMS', value: '0', icon: Folder, bg: 'bg-orange-50', color: 'text-orange-500' },
    { label: 'PORTFOLIO VIEWS', value: portfolioItems?.reduce((s, i) => s + (Number((i as any).views) || 0), 0).toLocaleString() || '0', icon: Eye, bg: 'bg-green-50', color: 'text-green-500' },
  ];

  if (!portfolioItems && !convexUser) {
    return <SkeletonLoading />;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold" style={{ color: '#111111' }}>Portfolio</h1>
        <p className="mt-1 text-gray-400">Showcase your best work.</p>
      </div>

      <div className="mb-8 flex flex-wrap justify-end gap-3">
        <button onClick={() => setIsUploadOpen(true)} className="flex items-center gap-2 rounded-full bg-[#D4AF37] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#c9a430]">
          <Upload size={16} /> Upload Photos
        </button>
        <button className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50">
          <Video size={16} /> Upload Videos
        </button>
        <button className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50">
          <FolderPlus size={16} /> Create Album
        </button>
      </div>

      {portfolioItems && portfolioItems.length > 0 ? (
        <>
          <div className="mb-8 grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-widest text-gray-400">{stat.label}</p>
                    <p className="mt-2 text-3xl font-bold" style={{ color: '#111111' }}>{stat.value}</p>
                  </div>
                  <div className={`rounded-xl p-3 ${stat.bg}`}><stat.icon size={22} className={stat.color} /></div>
                </div>
              </div>
            ))}
          </div>

          <div className="mb-8 flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button key={filter} onClick={() => setActiveFilter(filter)}
                className={`rounded-full px-4 py-2 text-xs font-medium transition-colors ${activeFilter === filter ? 'bg-black text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                {filter}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
            {filteredItems.map((item, index) => (
              <motion.div key={item._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: index * 0.06 }}
                className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                <div className="relative aspect-[3/4] overflow-hidden">
                  <img src={item.imageUrl} alt={item.title || ''} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute right-3 top-3 rounded-full bg-black/50 p-1.5 backdrop-blur-sm">
                    <Globe size={14} className="text-white" />
                  </div>
                  <div className="absolute left-3 top-3 rounded-full bg-black/50 px-3 py-1 backdrop-blur-sm">
                    <span className="text-[10px] font-medium uppercase tracking-widest text-white">{item.category}</span>
                  </div>
                  <div className="absolute right-3 top-3 mt-7">
                    <button onClick={() => setOpenMenuId(openMenuId === item._id ? null : item._id)}
                      className="rounded-full bg-black/50 p-1.5 backdrop-blur-sm transition-colors hover:bg-black/70">
                      <MoreVertical size={14} className="text-white" />
                    </button>
                    {openMenuId === item._id && (
                      <div className="absolute right-0 z-10 mt-1 w-44 rounded-xl border border-gray-100 bg-white py-1 shadow-lg">
                        <button className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50"><Pencil size={14} /> Edit</button>
                        <button className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50"><ImageIcon size={14} /> Set as Cover</button>
                        <button className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50"><Download size={14} /> Download</button>
                        <button onClick={async () => { try { await removePortfolioItem({ portfolioId: item._id as any }); } catch (err) { console.error('Delete error:', err); } }} className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50"><Trash2 size={14} /> Delete</button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="truncate text-sm font-semibold" style={{ color: '#111111' }}>{item.title || 'Untitled'}</h3>
                  <p className="mt-1 text-xs text-gray-400">Uploaded {new Date(item._creationTime).toLocaleDateString()}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <ImageIcon className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="text-lg font-bold text-[#111111] mb-2">No portfolio yet</h3>
          <p className="text-sm text-gray-400 mb-6">Upload your first portfolio item to showcase your work.</p>
          <button
            onClick={() => setIsUploadOpen(true)}
            className="inline-flex items-center gap-2 bg-[#D4AF37] text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#c9a430] transition-all"
          >
            <Upload size={16} /> Upload Portfolio
          </button>
        </div>
      )}

      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.25 }}
            className="mx-4 w-full max-w-lg rounded-2xl bg-white p-8 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold" style={{ color: '#111111' }}>Upload Photos</h2>
              <button onClick={() => setIsUploadOpen(false)} className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"><X size={20} /></button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Title</label>
                <input type="text" value={uploadTitle} onChange={(e) => setUploadTitle(e.target.value)} placeholder="Portfolio item title" className="w-full px-4 py-3 bg-white rounded-xl border border-gray-100 outline-none text-sm font-medium" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Category</label>
                <select value={uploadCategory} onChange={(e) => setUploadCategory(e.target.value)} className="w-full px-4 py-3 bg-white rounded-xl border border-gray-100 outline-none text-sm font-medium appearance-none">
                  <option value="portrait">Portrait</option>
                  <option value="fashion">Fashion</option>
                  <option value="commercial">Commercial</option>
                  <option value="editorial">Editorial</option>
                  <option value="fitness">Fitness</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={async (e: ChangeEvent<HTMLInputElement>) => {
              const file = e.target.files?.[0];
              if (!file || !convexUser || !modelProfile) return;
              setUploading(true);
              try {
                const uploadUrl = await generateUploadUrl();
                const result = await fetch(uploadUrl, { method: 'POST', body: file });
                if (!result.ok) {
                  const text = await result.text();
                  throw new Error(`Upload failed (${result.status}): ${text.slice(0, 200)}`);
                }
                const { storageId } = await result.json();
                if (!storageId) throw new Error('No storageId in upload response');
                const imageUrl = `${import.meta.env.VITE_CONVEX_URL}/api/storage/${storageId}`;
                await addPortfolioItem({
                  modelProfileId: modelProfile._id as any,
                  userId: convexUser._id as any,
                  imageUrl,
                  title: uploadTitle || undefined,
                  category: uploadCategory as any,
                });
                setIsUploadOpen(false);
                setUploadTitle('');
                setUploadCategory('portrait');
              } catch (err) {
                console.error('Upload error:', err);
              } finally {
                if (e.target) e.target.value = '';
                setUploading(false);
              }
            }} />

            <div onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-[#F8F8F8] px-6 py-16 transition-colors hover:border-[#D4AF37] cursor-pointer">
              {uploading ? (
                <Loader2 size={32} className="text-gray-400 animate-spin" />
              ) : (
                <>
                  <div className="mb-4 rounded-2xl bg-gray-100 p-4"><Upload size={32} className="text-gray-400" /></div>
                  <p className="text-sm font-medium" style={{ color: '#111111' }}>Click to select a photo</p>
                  <p className="mt-1 text-xs text-gray-400">JPG, PNG or WebP</p>
                </>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setIsUploadOpen(false)} className="rounded-full border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50">Cancel</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function SkeletonLoading() {
  return (
    <div className="p-4 sm:p-6 lg:p-10 animate-pulse">
      <div className="h-8 w-32 bg-gray-200 rounded-lg mb-8" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100"><div className="h-10 w-10 bg-gray-200 rounded-xl mb-4" /><div className="h-3 w-20 bg-gray-200 rounded mb-2" /><div className="h-8 w-12 bg-gray-200 rounded" /></div>
        ))}
      </div>
    </div>
  );
}
