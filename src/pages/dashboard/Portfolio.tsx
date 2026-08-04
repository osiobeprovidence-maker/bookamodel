import React, { useState, useRef, useEffect, type ChangeEvent } from 'react';
import { motion } from 'framer-motion';
import { Upload, Video, FolderPlus, Camera, Folder, Eye, Globe, Lock, MoreVertical, Pencil, Trash2, Download, Image as ImageIcon, X, Loader2, Play, AlertCircle, Plus, Check, Film, RefreshCw } from 'lucide-react';
import { useQuery, useMutation, useAction } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useUser } from '../../contexts/UserContext';
import VideoPlayer from '../../components/ui/VideoPlayer';

const VIDEO_MAX_SIZE = 500 * 1024 * 1024;
const SUPPORTED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm', 'video/x-matroska'];

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
  const albums = useQuery(
    api.albums.listByUser,
    convexUser ? { userId: convexUser._id as any } : 'skip'
  );
  const categoryOptions = useQuery(api.categories.listActive);
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);
  const generateMuxUploadUrl = useAction(api.mux.generateMuxUploadUrl);
  const getMuxUploadStatus = useAction(api.mux.getUploadStatus);
  const addPortfolioItem = useMutation(api.portfolio.add);
  const addVideoPortfolioItem = useMutation(api.portfolio.addVideo);
  const updatePortfolioItem = useMutation(api.portfolio.update);
  const removePortfolioItem = useMutation(api.portfolio.remove);
  const deleteMuxAsset = useAction(api.mux.deleteAsset);
  const createAlbum = useMutation(api.albums.create);
  const updateAlbum = useMutation(api.albums.update);
  const deleteAlbum = useMutation(api.albums.remove);
  const addMediaToAlbum = useMutation(api.albums.addMediaToAlbum);
  const removeMediaFromAlbum = useMutation(api.albums.removeMediaFromAlbum);

  const [activeFilter, setActiveFilter] = useState('All');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [openAlbumMenuId, setOpenAlbumMenuId] = useState<string | null>(null);

  const [isPhotoUploadOpen, setIsPhotoUploadOpen] = useState(false);
  const [isVideoUploadOpen, setIsVideoUploadOpen] = useState(false);
  const [isAlbumOpen, setIsAlbumOpen] = useState(false);
  const [isAlbumPickerOpen, setIsAlbumPickerOpen] = useState(false);
  const [pickerPortfolioId, setPickerPortfolioId] = useState<string | null>(null);

  const [uploading, setUploading] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState('portrait');
  const [uploadVisibility, setUploadVisibility] = useState('public');
  const [uploadAlbumId, setUploadAlbumId] = useState('');

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [albumTitle, setAlbumTitle] = useState('');
  const [albumDescription, setAlbumDescription] = useState('');
  const [albumCategory, setAlbumCategory] = useState('portrait');
  const [albumVisibility, setAlbumVisibility] = useState('public');
  const [editingAlbum, setEditingAlbum] = useState<string | null>(null);

  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const [inlinePlayingId, setInlinePlayingId] = useState<string | null>(null);
  const [processingVideos, setProcessingVideos] = useState<string[]>([]);
  const checkVideoStatus = useAction(api.mux.checkAndUpdateStatus);

  useEffect(() => {
    if (!portfolioItems) return;
    const processing = portfolioItems.filter((i) => i.type === 'video' && i.status === 'processing');
    if (processing.length === 0) return;
    const interval = setInterval(async () => {
      for (const item of processing) {
        if (!item.muxUploadId) continue;
        try {
          const result = await checkVideoStatus({
            portfolioId: item._id as any,
            muxUploadId: item.muxUploadId,
          });
          if ((result as any).updated) {
            setProcessingVideos((prev) => prev.filter((id) => id !== item.muxUploadId));
          }
        } catch (err) {
          // polling error — will retry on next interval
        }
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [portfolioItems, checkVideoStatus]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const filteredItems = !portfolioItems ? [] :
    activeFilter === 'All' ? portfolioItems
    : activeFilter === 'Photos' ? portfolioItems.filter((i) => i.type !== 'video')
    : activeFilter === 'Videos' ? portfolioItems.filter((i) => i.type === 'video')
    : portfolioItems.filter((i) => (i.category || '').toLowerCase() === activeFilter.toLowerCase());

  const filterChips = ['All', 'Photos', 'Videos', ...(categoryOptions ?? []).map((c) => c.name)];

  const photoCount = portfolioItems?.filter(i => i.type !== 'video').length ?? 0;
  const videoCount = portfolioItems?.filter(i => i.type === 'video').length ?? 0;
  const albumCount = albums?.length ?? 0;
  const viewsCount = portfolioItems?.reduce((s, i) => s + (Number((i as any).views) || 0), 0) ?? 0;

  const stats = [
    { label: 'TOTAL PHOTOS', value: String(photoCount), icon: Camera, bg: 'bg-blue-50', color: 'text-blue-500' },
    { label: 'TOTAL VIDEOS', value: String(videoCount), icon: Film, bg: 'bg-purple-50', color: 'text-purple-500' },
    { label: 'ALBUMS', value: String(albumCount), icon: Folder, bg: 'bg-orange-50', color: 'text-orange-500' },
    { label: 'PORTFOLIO VIEWS', value: viewsCount.toLocaleString(), icon: Eye, bg: 'bg-green-50', color: 'text-green-500' },
  ];

  const resetUploadState = () => {
    setUploadTitle('');
    setUploadCategory('portrait');
    setUploadVisibility('public');
    setUploadAlbumId('');
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleImageUpload = async () => {
    if (!selectedFile || !convexUser || !modelProfile || uploading) return;
    setUploading(true);
    try {
      const uploadUrl = await generateUploadUrl();
      const result = await fetch(uploadUrl, { method: 'POST', body: selectedFile });
      if (!result.ok) {
        const text = await result.text();
        throw new Error(`Upload failed (${result.status}): ${text.slice(0, 200)}`);
      }
      const { storageId } = await result.json();
      if (!storageId) throw new Error('No storageId in upload response');
      await addPortfolioItem({
        modelProfileId: modelProfile._id as any,
        userId: convexUser._id as any,
        imageUrl: previewUrl || '',
        imageStorageId: storageId,
        title: uploadTitle || undefined,
        category: uploadCategory as any,
        visibility: uploadVisibility as any,
        albumId: (uploadAlbumId as any) || undefined,
      });
      setIsPhotoUploadOpen(false);
      resetUploadState();
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleVideoUpload = async () => {
    if (!selectedFile || !convexUser || !modelProfile || uploading) return;
    setUploading(true);
    try {
      const { uploadUrl, uploadId } = await generateMuxUploadUrl({
        corsOrigin: window.location.origin,
        playbackPolicy: 'public',
      });
      const result = await fetch(uploadUrl, {
        method: 'PUT',
        body: selectedFile,
        headers: { 'Content-Type': selectedFile.type },
      });
      if (!result.ok) {
        const text = await result.text();
        throw new Error(`Mux upload failed (${result.status}): ${text.slice(0, 200)}`);
      }
      await addVideoPortfolioItem({
        modelProfileId: modelProfile._id as any,
        userId: convexUser._id as any,
        muxUploadId: uploadId,
        title: uploadTitle || undefined,
        category: uploadCategory as any,
        visibility: uploadVisibility as any,
        albumId: (uploadAlbumId as any) || undefined,
      });
      setIsVideoUploadOpen(false);
      resetUploadState();
      setProcessingVideos((prev) => [...prev, uploadId]);
    } catch (err) {
      console.error('Video upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (item: any) => {
    try {
      const args: any = { portfolioId: item._id as any };
      if (item.imageStorageId) args.storageId = item.imageStorageId;
      if (item.muxAssetId) {
        args.muxAssetId = item.muxAssetId;
        deleteMuxAsset({ assetId: item.muxAssetId }).catch(console.error);
      }
      await removePortfolioItem(args);
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleAlbumCreate = async () => {
    if (!albumTitle.trim() || !convexUser || !modelProfile) return;
    try {
      await createAlbum({
        modelProfileId: modelProfile._id as any,
        userId: convexUser._id as any,
        title: albumTitle.trim(),
        description: albumDescription.trim() || undefined,
        category: albumCategory as any,
        visibility: albumVisibility as any,
      });
      setIsAlbumOpen(false);
      setAlbumTitle('');
      setAlbumDescription('');
      setAlbumCategory('portrait');
      setAlbumVisibility('public');
      setEditingAlbum(null);
    } catch (err) {
      console.error('Album create error:', err);
    }
  };

  const handleAlbumUpdate = async () => {
    if (!editingAlbum || !albumTitle.trim()) return;
    try {
      await updateAlbum({
        albumId: editingAlbum as any,
        title: albumTitle.trim(),
        description: albumDescription.trim() || undefined,
        category: albumCategory as any,
        visibility: albumVisibility as any,
      });
      setIsAlbumOpen(false);
      setAlbumTitle('');
      setAlbumDescription('');
      setAlbumCategory('portrait');
      setAlbumVisibility('public');
      setEditingAlbum(null);
    } catch (err) {
      console.error('Album update error:', err);
    }
  };

  const handleAddToAlbum = async (portfolioId: string, albumId: string) => {
    try {
      await addMediaToAlbum({ portfolioId: portfolioId as any, albumId: albumId as any });
      setIsAlbumPickerOpen(false);
      setPickerPortfolioId(null);
    } catch (err) {
      console.error('Add to album error:', err);
    }
  };

  const handleRemoveFromAlbum = async (portfolioId: string, albumId: string) => {
    try {
      await removeMediaFromAlbum({ portfolioId: portfolioId as any, albumId: albumId as any });
    } catch (err) {
      console.error('Remove from album error:', err);
    }
  };

  if (!portfolioItems && !convexUser) {
    return <SkeletonLoading />;
  }

  const isLoading = !portfolioItems;

  return (
    <div className="p-4 sm:p-6 lg:p-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold" style={{ color: '#111111' }}>Portfolio</h1>
        <p className="mt-1 text-gray-400">Showcase your best work.</p>
      </div>

      <div className="mb-8 flex flex-wrap justify-end gap-3">
        <button onClick={() => setIsPhotoUploadOpen(true)} className="flex items-center gap-2 rounded-full bg-[#D4AF37] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#c9a430]">
          <Upload size={16} /> Upload Photos
        </button>
        <button onClick={() => setIsVideoUploadOpen(true)} className="flex items-center gap-2 rounded-full bg-[#D4AF37] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#c9a430]">
          <Video size={16} /> Upload Videos
        </button>
        <button onClick={() => { setEditingAlbum(null); setAlbumTitle(''); setAlbumDescription(''); setIsAlbumOpen(true); }} className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50">
          <FolderPlus size={16} /> Create Album
        </button>
      </div>

      {(albumCount > 0) && (
        <div className="mb-8">
          <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">Albums</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {albums?.map((album) => (
              <div key={album._id} className="group relative rounded-2xl border border-gray-100 bg-white shadow-sm overflow-visible">
                <div className="aspect-[4/3] bg-gray-50 flex items-center justify-center">
                  {album.coverImageUrl ? (
                    <img src={album.coverImageUrl} alt={album.title} className="w-full h-full object-cover" />
                  ) : (
                    <Folder size={32} className="text-gray-300" />
                  )}
                </div>
                <div className="p-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold truncate" style={{ color: '#111111' }}>{album.title}</h3>
                    <div className="relative">
                      <button onClick={() => setOpenAlbumMenuId(openAlbumMenuId === album._id ? null : album._id)} className="p-1 rounded-full hover:bg-gray-100"><MoreVertical size={14} className="text-gray-400" /></button>
                      {openAlbumMenuId === album._id && (
                        <div className="absolute right-0 z-[9999] mt-1 w-40 rounded-xl border border-gray-100 bg-white py-1 shadow-lg">
                          <button onClick={() => { setEditingAlbum(album._id); setAlbumTitle(album.title); setAlbumDescription(album.description || ''); setAlbumCategory(album.category as any); setAlbumVisibility(album.visibility as any); setIsAlbumOpen(true); setOpenAlbumMenuId(null); }} className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50"><Pencil size={14} /> Rename</button>
                          <button onClick={async () => { try { await deleteAlbum({ albumId: album._id as any }); } catch (err) { console.error(err); } setOpenAlbumMenuId(null); }} className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50"><Trash2 size={14} /> Delete</button>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-1 capitalize">{album.visibility}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse rounded-2xl border border-gray-100 bg-white overflow-hidden">
              <div className="aspect-[3/4] bg-gray-200" />
              <div className="p-4"><div className="h-4 bg-gray-200 rounded w-2/3 mb-2" /><div className="h-3 bg-gray-200 rounded w-1/3" /></div>
            </div>
          ))}
        </div>
      ) : portfolioItems && portfolioItems.length > 0 ? (
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
            {filterChips.map((filter) => (
              <button key={filter} onClick={() => setActiveFilter(filter)}
                className={`rounded-full px-4 py-2 text-xs font-medium transition-colors ${activeFilter === filter ? 'bg-black text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                {filter}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
            {filteredItems.map((item, index) => (
              <motion.div key={item._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: index * 0.06 }}
                className="group relative rounded-2xl border border-gray-100 bg-white shadow-sm">
                <div className="relative aspect-[3/4] overflow-hidden">
                  {item.type === 'video' ? (
                    item.status === 'ready' && item.playbackId ? (
                      inlinePlayingId === item._id ? (
                        <div className="relative w-full h-full bg-black">
                          <VideoPlayer
                            playbackId={item.playbackId}
                            className="w-full h-full object-contain"
                            controls
                            autoPlay
                            muted
                            playsInline
                          />
                          <div className="absolute top-2 right-2 flex gap-1">
                            <button onClick={() => { setInlinePlayingId(null); setPlayingVideo(item.playbackId!); }}
                              className="rounded-full bg-black/60 p-1.5 backdrop-blur-sm text-white/80 hover:text-white z-10">
                              <Eye size={12} />
                            </button>
                            <button onClick={() => setInlinePlayingId(null)}
                              className="rounded-full bg-black/60 p-1.5 backdrop-blur-sm text-white/80 hover:text-white z-10">
                              <X size={12} />
                            </button>
                          </div>
                        </div>
                      ) : (
                      <div className="relative w-full h-full group/video">
                        <img
                          src={`https://image.mux.com/${item.playbackId}/thumbnail.jpg?width=640`}
                          alt={item.title || 'Video thumbnail'}
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).src = `https://image.mux.com/${item.playbackId}/thumbnail.jpg`; }}
                        />
                        <div onClick={() => setInlinePlayingId(item._id)}
                          className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover/video:bg-black/30 transition-all duration-300 cursor-pointer">
                          <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg transform group-hover/video:scale-110 transition-transform duration-300">
                            <Play size={22} className="text-black ml-0.5" fill="black" />
                          </div>
                        </div>
                      </div>
                      )
                    ) : item.status === 'processing' || !item.status ? (
                      <div className="relative w-full h-full bg-gray-100">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <Loader2 size={24} className="text-gray-400 animate-spin mx-auto mb-2" />
                          </div>
                        </div>
                        <div className="absolute top-2 left-2 rounded-full bg-black/60 px-2.5 py-1 backdrop-blur-sm flex items-center gap-1.5">
                          <Loader2 size={10} className="text-white animate-spin" />
                          <span className="text-[10px] text-white font-medium">Processing</span>
                        </div>
                      </div>
                    ) : item.status === 'errored' ? (
                      <div className="relative w-full h-full bg-red-50 flex flex-col items-center justify-center gap-2">
                        <AlertCircle size={24} className="text-red-400" />
                        <p className="text-xs text-red-500 font-medium">Processing failed</p>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(item); }}
                          className="text-[10px] text-red-400 underline hover:text-red-600"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <Film size={32} className="text-gray-300" />
                      </div>
                    )
                  ) : (
                    <>
                      <img src={item.imageUrl} alt={item.title || ''} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => { (e.target as HTMLImageElement).classList.add('hidden'); (e.target as HTMLImageElement).parentElement!.querySelector('.img-fallback')?.classList.remove('hidden'); }} />
                      <div className="img-fallback hidden absolute inset-0 flex items-center justify-center bg-gray-100"><ImageIcon size={40} className="text-gray-300" /></div>
                    </>
                  )}
                  {inlinePlayingId !== item._id && (
                    <div className="absolute right-3 top-3 rounded-full bg-black/50 p-1.5 backdrop-blur-sm">
                      {item.visibility === 'public' ? <Globe size={14} className="text-white" /> : <Lock size={14} className="text-white" />}
                    </div>
                  )}
                  {item.type === 'video' && item.status === 'ready' && inlinePlayingId !== item._id && (
                    <div className="absolute left-3 top-3 rounded-full bg-black/50 px-2 py-0.5 backdrop-blur-sm flex items-center gap-1">
                      <Play size={10} className="text-white" fill="white" />
                      <span className="text-[10px] text-white font-medium">Video</span>
                    </div>
                  )}
                  {inlinePlayingId !== item._id && (
                  <div className="absolute left-3 top-3 mt-7 rounded-full bg-black/50 px-3 py-1 backdrop-blur-sm">
                    <span className="text-[10px] font-medium uppercase tracking-widest text-white">{item.category}</span>
                  </div>
                  )}
                </div>
                {/* Menu moved outside overflow-hidden container so dropdown is never clipped */}
                <div className="absolute right-3 top-[2.5rem]">
                  <button onClick={() => setOpenMenuId(openMenuId === item._id ? null : item._id)}
                    className="rounded-full bg-black/50 p-1.5 backdrop-blur-sm transition-colors hover:bg-black/70">
                    <MoreVertical size={14} className="text-white" />
                  </button>
                  {openMenuId === item._id && (
                    <div className="absolute right-0 z-[9999] mt-1 w-44 rounded-xl border border-gray-100 bg-white py-1 shadow-lg">
                      <button onClick={() => { setIsAlbumPickerOpen(true); setPickerPortfolioId(item._id); setOpenMenuId(null); }} className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50"><Plus size={14} /> Add to Album</button>
                      {item.albumId && (
                        <button onClick={async () => { await handleRemoveFromAlbum(item._id, item.albumId!); setOpenMenuId(null); }} className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50"><X size={14} /> Remove from Album</button>
                      )}
                      <button onClick={() => { window.open(`/profile/${modelProfile?._id}`, '_blank'); setOpenMenuId(null); }} className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50"><Eye size={14} /> View Page</button>
                      <button onClick={() => setOpenMenuId(null)} className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50"><Download size={14} /> Download</button>
                      <button onClick={() => handleDelete(item)} className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50"><Trash2 size={14} /> Delete</button>
                    </div>
                  )}
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
          <button onClick={() => setIsPhotoUploadOpen(true)} className="inline-flex items-center gap-2 bg-[#D4AF37] text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#c9a430] transition-all">
            <Upload size={16} /> Upload Portfolio
          </button>
        </div>
      )}

      {/* Photo Upload Modal */}
      {isPhotoUploadOpen && (
        <UploadModal title="Upload Photos" onClose={() => { setIsPhotoUploadOpen(false); resetUploadState(); }} uploading={uploading}>
          <div className="space-y-4 mb-6">
            <FormField label="Title">
              <input type="text" value={uploadTitle} onChange={(e) => setUploadTitle(e.target.value)} placeholder="Portfolio item title" className="w-full px-4 py-3 bg-white rounded-xl border border-gray-100 outline-none text-sm font-medium" />
            </FormField>
            <FormField label="Category">
              <select value={uploadCategory} onChange={(e) => setUploadCategory(e.target.value)} className="w-full px-4 py-3 bg-white rounded-xl border border-gray-100 outline-none text-sm font-medium appearance-none">
                {(categoryOptions ?? []).map((cat) => <option key={cat._id} value={cat.name}>{cat.name}</option>)}
              </select>
            </FormField>
            <FormField label="Visibility">
              <select value={uploadVisibility} onChange={(e) => setUploadVisibility(e.target.value)} className="w-full px-4 py-3 bg-white rounded-xl border border-gray-100 outline-none text-sm font-medium appearance-none">
                <option value="public">Public</option>
                <option value="private">Private</option>
                <option value="hidden">Hidden</option>
              </select>
            </FormField>
            {albums && albums.length > 0 && (
              <FormField label="Album (optional)">
                <select value={uploadAlbumId} onChange={(e) => setUploadAlbumId(e.target.value)} className="w-full px-4 py-3 bg-white rounded-xl border border-gray-100 outline-none text-sm font-medium appearance-none">
                  <option value="">None</option>
                  {albums.map((a) => <option key={a._id} value={a._id}>{a.title}</option>)}
                </select>
              </FormField>
            )}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e: ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
          }} />
          {previewUrl ? (
            <div className="relative rounded-2xl overflow-hidden bg-gray-100 mb-6">
              <img src={previewUrl} alt="Preview" className="w-full h-64 object-cover" />
              <button onClick={() => { setSelectedFile(null); setPreviewUrl(null); if (fileInputRef.current) fileInputRef.current.value = ''; }} className="absolute top-2 right-2 rounded-full bg-black/50 p-1.5 backdrop-blur-sm text-white hover:bg-black/70"><X size={16} /></button>
            </div>
          ) : (
            <div onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-[#F8F8F8] px-6 py-16 transition-colors hover:border-[#D4AF37] cursor-pointer mb-6">
              <div className="mb-4 rounded-2xl bg-gray-100 p-4"><Upload size={32} className="text-gray-400" /></div>
              <p className="text-sm font-medium" style={{ color: '#111111' }}>Click to select a photo</p>
              <p className="mt-1 text-xs text-gray-400">JPG, PNG or WebP</p>
            </div>
          )}
          <div className="flex justify-end gap-3">
            <button onClick={handleImageUpload} disabled={!selectedFile || uploading} className={`rounded-full px-5 py-2.5 text-sm font-medium transition-colors ${!selectedFile || uploading ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-[#D4AF37] text-white hover:bg-[#c9a430]'}`}>
              {uploading ? <><Loader2 size={16} className="animate-spin mr-2 inline" /> Uploading...</> : 'Upload'}
            </button>
            <button onClick={() => { setIsPhotoUploadOpen(false); resetUploadState(); }} className="rounded-full border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50">Cancel</button>
          </div>
        </UploadModal>
      )}

      {/* Video Upload Modal */}
      {isVideoUploadOpen && (
        <UploadModal title="Upload Videos" onClose={() => { setIsVideoUploadOpen(false); resetUploadState(); }} uploading={uploading}>
          <div className="space-y-4 mb-6">
            <FormField label="Title">
              <input type="text" value={uploadTitle} onChange={(e) => setUploadTitle(e.target.value)} placeholder="Portfolio video title" className="w-full px-4 py-3 bg-white rounded-xl border border-gray-100 outline-none text-sm font-medium" />
            </FormField>
            <FormField label="Category">
              <select value={uploadCategory} onChange={(e) => setUploadCategory(e.target.value)} className="w-full px-4 py-3 bg-white rounded-xl border border-gray-100 outline-none text-sm font-medium appearance-none">
                {(categoryOptions ?? []).map((cat) => <option key={cat._id} value={cat.name}>{cat.name}</option>)}
              </select>
            </FormField>
            <FormField label="Visibility">
              <select value={uploadVisibility} onChange={(e) => setUploadVisibility(e.target.value)} className="w-full px-4 py-3 bg-white rounded-xl border border-gray-100 outline-none text-sm font-medium appearance-none">
                <option value="public">Public</option>
                <option value="private">Private</option>
                <option value="hidden">Hidden</option>
              </select>
            </FormField>
            {albums && albums.length > 0 && (
              <FormField label="Album (optional)">
                <select value={uploadAlbumId} onChange={(e) => setUploadAlbumId(e.target.value)} className="w-full px-4 py-3 bg-white rounded-xl border border-gray-100 outline-none text-sm font-medium appearance-none">
                  <option value="">None</option>
                  {albums.map((a) => <option key={a._id} value={a._id}>{a.title}</option>)}
                </select>
              </FormField>
            )}
          </div>
          <input ref={videoInputRef} type="file" accept="video/mp4,video/quicktime,video/x-msvideo,video/webm,video/x-matroska" className="hidden" onChange={(e: ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (!file) return;
            if (!SUPPORTED_VIDEO_TYPES.includes(file.type)) {
              alert('Unsupported video format. Please use MP4, MOV, AVI, WebM, or MKV.');
              e.target.value = '';
              return;
            }
            if (file.size > VIDEO_MAX_SIZE) {
              alert('Video is too large. Maximum size is 500MB.');
              e.target.value = '';
              return;
            }
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
          }} />
          {previewUrl ? (
            <div className="relative rounded-2xl overflow-hidden bg-black mb-6">
              <video src={previewUrl} className="w-full h-64 object-contain" controls />
              <button onClick={() => { setSelectedFile(null); setPreviewUrl(null); if (videoInputRef.current) videoInputRef.current.value = ''; }} className="absolute top-2 right-2 rounded-full bg-black/50 p-1.5 backdrop-blur-sm text-white hover:bg-black/70"><X size={16} /></button>
            </div>
          ) : (
            <div onClick={() => videoInputRef.current?.click()} className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-[#F8F8F8] px-6 py-16 transition-colors hover:border-[#D4AF37] cursor-pointer mb-6">
              <div className="mb-4 rounded-2xl bg-gray-100 p-4"><Video size={32} className="text-gray-400" /></div>
              <p className="text-sm font-medium" style={{ color: '#111111' }}>Click to select a video</p>
              <p className="mt-1 text-xs text-gray-400">MP4, MOV, WebM or MKV (max 500MB)</p>
            </div>
          )}
          <div className="flex justify-end gap-3">
            <button onClick={handleVideoUpload} disabled={!selectedFile || uploading} className={`rounded-full px-5 py-2.5 text-sm font-medium transition-colors ${!selectedFile || uploading ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-[#D4AF37] text-white hover:bg-[#c9a430]'}`}>
              {uploading ? <><Loader2 size={16} className="animate-spin mr-2 inline" /> Uploading to Mux...</> : 'Upload'}
            </button>
            <button onClick={() => { setIsVideoUploadOpen(false); resetUploadState(); }} className="rounded-full border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50">Cancel</button>
          </div>
        </UploadModal>
      )}

      {/* Album Modal */}
      {isAlbumOpen && (
        <UploadModal title={editingAlbum ? 'Edit Album' : 'Create Album'} onClose={() => { setIsAlbumOpen(false); setAlbumTitle(''); setAlbumDescription(''); setEditingAlbum(null); }} uploading={false}>
          <div className="space-y-4 mb-6">
            <FormField label="Title">
              <input type="text" value={albumTitle} onChange={(e) => setAlbumTitle(e.target.value)} placeholder="Album title" className="w-full px-4 py-3 bg-white rounded-xl border border-gray-100 outline-none text-sm font-medium" />
            </FormField>
            <FormField label="Description">
              <textarea value={albumDescription} onChange={(e) => setAlbumDescription(e.target.value)} placeholder="Album description (optional)" rows={3} className="w-full px-4 py-3 bg-white rounded-xl border border-gray-100 outline-none text-sm font-medium resize-none" />
            </FormField>
            <FormField label="Category">
              <select value={albumCategory} onChange={(e) => setAlbumCategory(e.target.value)} className="w-full px-4 py-3 bg-white rounded-xl border border-gray-100 outline-none text-sm font-medium appearance-none">
                {(categoryOptions ?? []).map((cat) => <option key={cat._id} value={cat.name}>{cat.name}</option>)}
              </select>
            </FormField>
            <FormField label="Visibility">
              <select value={albumVisibility} onChange={(e) => setAlbumVisibility(e.target.value)} className="w-full px-4 py-3 bg-white rounded-xl border border-gray-100 outline-none text-sm font-medium appearance-none">
                <option value="public">Public</option>
                <option value="private">Private</option>
                <option value="hidden">Hidden</option>
              </select>
            </FormField>
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={editingAlbum ? handleAlbumUpdate : handleAlbumCreate} disabled={!albumTitle.trim()} className={`rounded-full px-5 py-2.5 text-sm font-medium transition-colors ${!albumTitle.trim() ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-[#D4AF37] text-white hover:bg-[#c9a430]'}`}>
              {editingAlbum ? 'Save' : 'Create'}
            </button>
            <button onClick={() => { setIsAlbumOpen(false); setAlbumTitle(''); setAlbumDescription(''); setEditingAlbum(null); }} className="rounded-full border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50">Cancel</button>
          </div>
        </UploadModal>
      )}

      {/* Album Picker Modal */}
      {isAlbumPickerOpen && albums && albums.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.25 }}
            className="mx-4 w-full max-w-sm rounded-2xl bg-white p-8 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold" style={{ color: '#111111' }}>Add to Album</h2>
              <button onClick={() => { setIsAlbumPickerOpen(false); setPickerPortfolioId(null); }} className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {albums.map((album) => (
                <button key={album._id} onClick={() => handleAddToAlbum(pickerPortfolioId!, album._id)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center"><Folder size={18} className="text-gray-400" /></div>
                  <div><p className="text-sm font-medium" style={{ color: '#111111' }}>{album.title}</p><p className="text-xs text-gray-400 capitalize">{album.visibility}</p></div>
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {/* Video Player Modal */}
      {playingVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
          onClick={() => setPlayingVideo(null)}>
          <div className="relative w-full max-w-5xl mx-4"
            onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setPlayingVideo(null)}
              className="absolute -top-10 right-0 text-white/60 hover:text-white text-sm font-medium uppercase tracking-widest z-10">
              Close
            </button>
            <div className="rounded-2xl overflow-hidden bg-black shadow-2xl" style={{ maxHeight: '85vh' }}>
              <VideoPlayer
                key={playingVideo}
                playbackId={playingVideo}
                className="w-full h-full"
                controls
                autoPlay
                muted
                playsInline
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function UploadModal({ title, onClose, uploading, children }: { title: string; onClose: () => void; uploading: boolean; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.25 }}
        className="mx-4 w-full max-w-lg rounded-2xl bg-white p-8 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold" style={{ color: '#111111' }}>{title}</h2>
          <button onClick={onClose} disabled={uploading} className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"><X size={20} /></button>
        </div>
        {children}
      </motion.div>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{label}</label>
      {children}
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
