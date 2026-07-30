import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MapPin, Star, CheckCircle2, Heart, Award, Check, Mail, Calendar, Phone, Globe, X,
  ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Share2, ShieldCheck, Clock, Wallet, Send,
  Loader2, Play, Film, Folder, Image as ImageIcon, Eye, Edit3, Smartphone, Monitor, Copy, AlertCircle, Percent, ExternalLink,
} from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { useUser } from '../../contexts/UserContext';
import { useToast } from '../../components/ui/Toast';
import VideoPlayer from '../../components/ui/VideoPlayer';

const COMPLETION_FIELDS: { key: string; label: string }[] = [
  { key: 'imageUrl', label: 'Profile Photo' },
  { key: 'bio', label: 'Bio' },
  { key: 'height', label: 'Height' },
  { key: 'eyeColor', label: 'Eye Color' },
  { key: 'hairColor', label: 'Hair Color' },
  { key: 'bust', label: 'Bust' },
  { key: 'waist', label: 'Waist' },
  { key: 'hips', label: 'Hips' },
  { key: 'dressSize', label: 'Dress Size' },
  { key: 'shoeSize', label: 'Shoe Size' },
  { key: 'skinTone', label: 'Skin Tone' },
  { key: 'categories', label: 'Categories' },
  { key: 'city', label: 'City' },
  { key: 'state', label: 'State' },
  { key: 'country', label: 'Country' },
];

function computeCompletion(profile: Record<string, unknown>): { percent: number; filled: number; total: number; missing: { key: string; label: string }[] } {
  const total = COMPLETION_FIELDS.length;
  const missing: { key: string; label: string }[] = [];
  for (const field of COMPLETION_FIELDS) {
    const val = profile[field.key];
    const isEmpty = val === undefined || val === null || val === '' || (Array.isArray(val) && val.length === 0);
    if (isEmpty) missing.push(field);
  }
  const filled = total - missing.length;
  return { percent: Math.round((filled / total) * 100), filled, total, missing };
}

export default function MyPortfolio() {
  const navigate = useNavigate();
  const { convexUser } = useUser();
  const { toast } = useToast();
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [lightboxZoom, setLightboxZoom] = useState(false);
  const [showVerifyTooltip, setShowVerifyTooltip] = useState(false);

  const modelProfile = useQuery(
    api.users.getModelProfile,
    convexUser ? { userId: convexUser._id as any } : 'skip'
  );
  const modelProfileWithUser = useQuery(
    api.users.getModelProfileById,
    modelProfile ? { modelProfileId: modelProfile._id } : 'skip'
  );
  const portfolioItems = useQuery(
    api.portfolio.list,
    modelProfile ? { modelProfileId: modelProfile._id } : 'skip'
  );
  const albums = useQuery(
    api.albums.listPublicByModelProfile,
    modelProfile ? { modelProfileId: modelProfile._id } : 'skip'
  );

  const profile = modelProfileWithUser as (Record<string, unknown> & { user?: { name?: string; email?: string; imageUrl?: string } | null }) | null | undefined;
  const modelName = (profile?.user as { name?: string } | null | undefined)?.name || 'Model';
  const location = [profile?.city, profile?.state, profile?.country].filter(Boolean).join(', ') || 'Nigeria';

  const images = (portfolioItems as unknown as Record<string, unknown>[] | undefined)?.filter(i => (i as Record<string, unknown>).type !== 'video') ?? [];
  const videos = (portfolioItems as unknown as Record<string, unknown>[] | undefined)?.filter(i => (i as Record<string, unknown>).type === 'video' && (i as Record<string, unknown>).status === 'ready') ?? [];

  const completion = profile ? computeCompletion(profile as Record<string, unknown>) : { percent: 0, filled: 0, total: 0, missing: [] };
  const publicProfileUrl = profile?._id ? `${window.location.origin}/profile/${profile._id}` : '';

  if (!convexUser || profile === undefined) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 size={32} className="text-gray-400 animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <ImageIcon size={48} className="text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Profile not found</p>
          <p className="text-gray-400 text-sm mt-2">Create a model profile to get started</p>
          <Link to="/create-profile" className="text-[#D4AF37] text-sm mt-4 inline-block hover:underline">Create Profile</Link>
        </div>
      </div>
    );
  }

  const profileContent = (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <section className="px-4 sm:px-6 py-8 sm:py-12 border-b border-gray-100">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8 md:gap-12 items-start">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            className="w-full md:w-1/3 lg:w-1/4 shrink-0">
            <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl shadow-black/5 ring-1 ring-black/5 bg-gray-50 flex items-center justify-center">
              {profile.imageUrl ? (
                <img src={profile.imageUrl} alt={modelName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <ImageIcon size={48} className="text-gray-300" />
              )}
            </div>
          </motion.div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-6">
              {profile.isVerified && (
                <div className="relative" onMouseEnter={() => setShowVerifyTooltip(true)} onMouseLeave={() => setShowVerifyTooltip(false)}>
                  <Badge variant="gold" className="rounded-full cursor-help">Verified Talent</Badge>
                  {showVerifyTooltip && (
                    <div className="absolute bottom-full left-0 mb-2 w-64 p-3 bg-[#111111] text-white text-xs rounded-xl shadow-xl z-10">
                      <p className="font-bold mb-1">Verified Talent</p>
                      <ul className="space-y-1 text-gray-400">
                        <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-[#D4AF37]" /> Identity verified</li>
                        <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-[#D4AF37]" /> Portfolio verified</li>
                        <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-[#D4AF37]" /> Trusted professional</li>
                      </ul>
                      <div className="absolute top-full left-6 w-2 h-2 bg-[#111111] rotate-45 -mt-1" />
                    </div>
                  )}
                </div>
              )}
              {profile.isAvailable && <Badge variant="success">Available Today</Badge>}
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold tracking-tight text-black mb-4 uppercase">
              {modelName}
            </h1>

            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-gray-400 mb-6 sm:mb-8">
              <button onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`, '_blank')} className="flex items-center gap-2 hover:text-[#D4AF37] transition-colors">
                <MapPin className="w-4 h-4" />
                <span className="text-sm font-bold uppercase tracking-widest">{location}</span>
              </button>
              <span className="flex items-center gap-2">
                <Star className="w-4 h-4 text-[#D4AF37] fill-[#D4AF37]" />
                <span className="text-sm font-bold">{(profile.rating as number)?.toFixed(1) || '0.0'} <span className="opacity-50 font-medium">({profile.reviewCount || 0} Reviews)</span></span>
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span className="text-sm font-bold">{profile.completedJobs || 0} Jobs Done</span>
              </span>
            </div>

            <p className="text-base sm:text-lg text-gray-500 max-w-2xl leading-relaxed mb-8 sm:mb-10">
              {profile.bio || 'No bio provided yet.'}
            </p>

            <div className="flex flex-wrap gap-3 sm:gap-4">
              <Button onClick={() => navigate('/model-dashboard/profile')} size="lg" className="rounded-xl px-6 sm:px-10 py-4 font-bold uppercase text-xs tracking-[0.2em] shadow-xl shadow-black/5">
                <Edit3 className="w-4 h-4 mr-2" /> Edit Profile
              </Button>
              <Button variant="outline" size="lg" onClick={() => { navigator.clipboard.writeText(publicProfileUrl); toast('Public profile link copied!', 'success'); }}
                className="rounded-xl px-6 sm:px-8 font-bold uppercase text-xs tracking-widest">
                <Share2 className="w-4 h-4 mr-2" /> Copy Public Link
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Content + Sidebar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          {/* Main */}
          <div className="lg:col-span-8 space-y-16 sm:space-y-24">
            {videos.length > 0 && (
              <section>
                <div className="flex items-end justify-between mb-8 sm:mb-12">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-gray-400 tracking-[0.3em] mb-2">Motion</div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight uppercase">Videos</h2>
                  </div>
                  <div className="text-xs font-bold text-gray-300 uppercase tracking-widest">{videos.length} Videos</div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {videos.map((video) => {
                    const v = video as Record<string, unknown>;
                    return (
                      <motion.div key={v._id as string} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                        className="rounded-2xl overflow-hidden bg-black group relative aspect-video">
                        {v.playbackId ? (
                          <VideoPlayer playbackId={v.playbackId as string} className="w-full h-full" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-900">
                            <Film size={32} className="text-white/40" />
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </section>
            )}

            <section>
              <div className="flex items-end justify-between mb-8 sm:mb-12">
                <div>
                  <div className="text-[10px] uppercase font-bold text-gray-400 tracking-[0.3em] mb-2">Visuals</div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight uppercase">Portfolio</h2>
                </div>
                <div className="text-xs font-bold text-gray-300 uppercase tracking-widest">
                  {images.length} High-Res Captures
                </div>
              </div>
              {images.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {images.map((img, i) => {
                    const image = img as Record<string, unknown>;
                    return (
                      <motion.div key={image._id as string} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                        onClick={() => { setLightboxIndex(i); setLightboxZoom(false); }}
                        className={cn("rounded-2xl overflow-hidden bg-gray-50 cursor-pointer group relative", i % 3 === 0 ? "sm:col-span-2 aspect-video" : "aspect-[4/5]")}>
                        <img src={image.imageUrl as string} alt={(image.title as string) || 'Portfolio'} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" referrerPolicy="no-referrer"
                          onError={(e) => { (e.target as HTMLImageElement).src = ''; (e.target as HTMLImageElement).parentElement!.classList.add('bg-gray-100'); }} />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <div className="bg-white/90 backdrop-blur-sm rounded-full p-3"><ZoomIn className="w-5 h-5 text-[#111111]" /></div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-16 bg-gray-50 rounded-2xl">
                  <ImageIcon size={40} className="text-gray-300 mx-auto mb-4" />
                  <p className="text-sm text-gray-400">No portfolio images yet</p>
                  <Button variant="outline" size="sm" onClick={() => navigate('/model-dashboard/portfolio')} className="mt-4 rounded-xl text-xs font-bold">
                    Add Portfolio Items
                  </Button>
                </div>
              )}
            </section>

            {albums && (albums as unknown[]).length > 0 && (
              <section>
                <div className="flex items-end justify-between mb-8 sm:mb-12">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-gray-400 tracking-[0.3em] mb-2">Collections</div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight uppercase">Albums</h2>
                  </div>
                  <div className="text-xs font-bold text-gray-300 uppercase tracking-widest">{(albums as unknown[]).length} Albums</div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
                  {(albums as unknown[]).map((album) => {
                    const a = album as Record<string, unknown>;
                    return (
                      <motion.div key={a._id as string} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                        className="rounded-2xl overflow-hidden bg-gray-50 group relative aspect-[4/3]">
                        {a.coverImageUrl ? (
                          <img src={a.coverImageUrl as string} alt={a.title as string} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><Folder size={40} className="text-gray-300" /></div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4">
                          <div>
                            <h3 className="text-white font-bold text-sm">{a.title as string}</h3>
                            <p className="text-white/60 text-xs">{a.category as string}</p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-8 sm:space-y-12">
            <div className="lg:sticky lg:top-32">
              {/* Profile Completion */}
              <div className="bg-gray-50 rounded-2xl p-6 mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <Percent className="w-5 h-5 text-[#D4AF37]" />
                  <div>
                    <h3 className="text-sm font-bold text-black">Profile Completion</h3>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">{completion.filled}/{completion.total} fields</p>
                  </div>
                  <span className="ml-auto text-2xl font-extrabold text-black">{completion.percent}%</span>
                </div>
                <div className="w-full h-2 bg-white rounded-full overflow-hidden mb-4">
                  <div className={cn("h-full rounded-full transition-all duration-500", completion.percent === 100 ? "bg-green-500" : "bg-[#D4AF37]")}
                    style={{ width: `${completion.percent}%` }} />
                </div>
                {completion.missing.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Missing fields</p>
                    {completion.missing.slice(0, 5).map((field) => (
                      <div key={field.key} className="flex items-center gap-2 text-xs text-gray-500">
                        <AlertCircle className="w-3 h-3 text-amber-500 shrink-0" />
                        <span>{field.label}</span>
                      </div>
                    ))}
                    {completion.missing.length > 5 && (
                      <p className="text-[10px] text-gray-400">+{completion.missing.length - 5} more</p>
                    )}
                  </div>
                )}
                <Button onClick={() => navigate('/model-dashboard/profile')} variant="outline" size="sm" className="w-full mt-4 rounded-xl text-xs font-bold">
                  Complete Profile
                </Button>
              </div>

              {/* Public Link */}
              <div className="bg-gray-50 rounded-2xl p-6 mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <Share2 className="w-5 h-5 text-[#D4AF37]" />
                  <h3 className="text-sm font-bold text-black">Public Profile Link</h3>
                </div>
                <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2.5 border border-gray-200">
                  <span className="text-xs text-gray-500 truncate flex-1">{publicProfileUrl || '—'}</span>
                  {publicProfileUrl && (
                    <button onClick={() => { navigator.clipboard.writeText(publicProfileUrl); toast('Link copied!', 'success'); }}
                      className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors shrink-0">
                      <Copy className="w-4 h-4 text-gray-400" />
                    </button>
                  )}
                </div>
                <a href={publicProfileUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-[#D4AF37] font-medium mt-2 hover:underline">
                  Open in new tab <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Preview Toggle */}
              <div className="bg-gray-50 rounded-2xl p-6 mb-8">
                <div className="text-[10px] uppercase font-bold text-gray-400 tracking-[0.3em] mb-3">Preview Mode</div>
                <div className="flex gap-2">
                  <button onClick={() => setPreviewDevice('desktop')}
                    className={cn("flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all", previewDevice === 'desktop' ? "bg-[#D4AF37] text-white shadow-lg shadow-[#D4AF37]/20" : "bg-white text-gray-500 hover:bg-gray-100 border border-gray-200")}>
                    <Monitor className="w-4 h-4" /> Desktop
                  </button>
                  <button onClick={() => setPreviewDevice('mobile')}
                    className={cn("flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all", previewDevice === 'mobile' ? "bg-[#D4AF37] text-white shadow-lg shadow-[#D4AF37]/20" : "bg-white text-gray-500 hover:bg-gray-100 border border-gray-200")}>
                    <Smartphone className="w-4 h-4" /> Mobile
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <Clock className="w-5 h-5 text-[#D4AF37] mx-auto mb-1" />
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Response</p>
                  <p className="text-sm font-bold">{profile.isAvailable ? 'Fast' : 'Slow'}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <Globe className="w-5 h-5 text-[#D4AF37] mx-auto mb-1" />
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Travel</p>
                  <p className="text-sm font-bold">{profile.country ? 'Available' : 'Local Only'}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <Award className="w-5 h-5 text-[#D4AF37] mx-auto mb-1" />
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pro</p>
                  <p className="text-sm font-bold">{profile.isPro ? 'Active' : '—'}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <ShieldCheck className="w-5 h-5 text-[#D4AF37] mx-auto mb-1" />
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Verified</p>
                  <p className="text-sm font-bold">{profile.isVerified ? 'Yes' : 'No'}</p>
                </div>
              </div>

              {/* Physical Attributes */}
              <div className="mb-8 sm:mb-12">
                <div className="text-[10px] uppercase font-bold text-gray-400 tracking-[0.3em] mb-4 sm:mb-6 border-b border-gray-100 pb-2">Physical Attributes</div>
                <div className="grid grid-cols-2 gap-y-4 sm:gap-y-6 gap-x-8 sm:gap-x-12">
                  {[
                    { label: 'Height', value: profile.height || '—' },
                    { label: 'Eyes', value: profile.eyeColor || '—' },
                    { label: 'Hair', value: profile.hairColor || '—' },
                    { label: 'Bust', value: profile.bust || '—' },
                    { label: 'Waist', value: profile.waist || '—' },
                    { label: 'Hips', value: profile.hips || '—' },
                    { label: 'Dress', value: profile.dressSize || '—' },
                    { label: 'Shoes', value: profile.shoeSize || '—' },
                    { label: 'Skin', value: profile.skinTone || '—' },
                  ].map((stat) => (
                    <div key={stat.label}>
                      <div className="text-[9px] uppercase font-bold text-gray-300 tracking-widest mb-1">{stat.label}</div>
                      <div className="text-sm font-extrabold text-black">{stat.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Expertise */}
              {profile.categories && (profile.categories as string[]).length > 0 && (
                <div className="mb-8 sm:mb-12">
                  <div className="text-[10px] uppercase font-bold text-gray-400 tracking-[0.3em] mb-4 sm:mb-6 border-b border-gray-100 pb-2">Expertise</div>
                  <div className="flex flex-wrap gap-2">
                    {(profile.categories as string[]).map((cat: string) => (
                      <span key={cat} className="px-3 py-1.5 bg-gray-100 rounded-lg text-[10px] font-bold text-gray-600 uppercase tracking-widest">{cat}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Socials */}
              {profile.socials && ((profile.socials as Record<string, string>).instagram || (profile.socials as Record<string, string>).tiktok) && (
                <div className="mb-8 sm:mb-12">
                  <div className="text-[10px] uppercase font-bold text-gray-400 tracking-[0.3em] mb-4 sm:mb-6 border-b border-gray-100 pb-2">Connect</div>
                  <div className="space-y-2">
                    {(profile.socials as Record<string, string>).instagram && (
                      <a href={`https://instagram.com/${(profile.socials as Record<string, string>).instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-sm text-gray-600 font-medium">
                        <Mail className="w-4 h-4 text-[#D4AF37]" /> {(profile.socials as Record<string, string>).instagram}
                      </a>
                    )}
                    {(profile.socials as Record<string, string>).tiktok && (
                      <a href={`https://tiktok.com/${(profile.socials as Record<string, string>).tiktok.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-sm text-gray-600 font-medium">
                        <Phone className="w-4 h-4 text-[#D4AF37]" /> {(profile.socials as Record<string, string>).tiktok}
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Book with Confidence */}
              <div className="p-6 sm:p-8 bg-[#111111] rounded-2xl text-white">
                <Award className="w-8 h-8 text-[#D4AF37] mb-4" />
                <h3 className="text-lg font-bold tracking-tight mb-2">Complete Your Profile</h3>
                <p className="text-xs text-gray-400 leading-relaxed mb-6">
                  Brands are looking for complete profiles. Fill in your details to get more bookings.
                </p>
                <Button onClick={() => navigate('/model-dashboard/profile')} className="w-full rounded-xl py-4 font-bold uppercase text-[10px] tracking-widest">
                  Edit Profile
                </Button>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && images[lightboxIndex] && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-black/95 flex items-center justify-center"
            onClick={() => { setLightboxIndex(null); setLightboxZoom(false); }}>
            <button onClick={(e) => { e.stopPropagation(); setLightboxIndex(null); setLightboxZoom(false); }} className="absolute top-6 right-6 p-2 text-white/70 hover:text-white transition-colors z-10"><X className="w-6 h-6" /></button>
            <button onClick={(e) => { e.stopPropagation(); setLightboxZoom(false); setLightboxIndex((prev) => prev !== null ? (prev - 1 + images.length) % images.length : 0); }} className="absolute left-4 sm:left-6 p-3 text-white/70 hover:text-white bg-white/10 rounded-full transition-all z-10"><ChevronLeft className="w-6 h-6" /></button>
            <div className="absolute top-6 left-1/2 -translate-x-1/2 text-white/60 text-sm font-medium z-10">{(lightboxIndex ?? 0) + 1} / {images.length}</div>
            <button onClick={(e) => { e.stopPropagation(); setLightboxZoom(false); setLightboxIndex((prev) => prev !== null ? (prev + 1) % images.length : 0); }} className="absolute right-4 sm:right-6 p-3 text-white/70 hover:text-white bg-white/10 rounded-full transition-all z-10"><ChevronRight className="w-6 h-6" /></button>
            <button onClick={(e) => { e.stopPropagation(); setLightboxZoom(!lightboxZoom); }} className="absolute bottom-6 left-1/2 -translate-x-1/2 p-3 text-white/70 hover:text-white bg-white/10 rounded-full transition-all z-10">{lightboxZoom ? <ZoomOut className="w-5 h-5" /> : <ZoomIn className="w-5 h-5" />}</button>
            <motion.img key={lightboxIndex} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: lightboxZoom ? 1.5 : 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.3 }}
              src={(images[lightboxIndex] as Record<string, unknown>).imageUrl as string} alt="Portfolio" className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg cursor-zoom-in"
              onClick={(e) => { e.stopPropagation(); setLightboxZoom(!lightboxZoom); }} referrerPolicy="no-referrer" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <div>
      {/* Preview Banner */}
      <div className="bg-gradient-to-r from-[#D4AF37]/10 via-[#D4AF37]/5 to-[#D4AF37]/10 border-b border-[#D4AF37]/20 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 text-sm font-medium text-[#8B7332]">
            <Eye className="w-4 h-4" />
            Preview Mode — This is how brands see your profile
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setPreviewDevice('desktop')}
              className={cn("p-2 rounded-lg transition-all", previewDevice === 'desktop' ? "bg-[#D4AF37]/20 text-[#8B7332]" : "text-[#8B7332]/50 hover:text-[#8B7332]")}>
              <Monitor className="w-4 h-4" />
            </button>
            <button onClick={() => setPreviewDevice('mobile')}
              className={cn("p-2 rounded-lg transition-all", previewDevice === 'mobile' ? "bg-[#D4AF37]/20 text-[#8B7332]" : "text-[#8B7332]/50 hover:text-[#8B7332]")}>
              <Smartphone className="w-4 h-4" />
            </button>
            <Button variant="outline" size="sm" onClick={() => navigate('/model-dashboard/profile')}
              className="text-xs rounded-lg border-[#D4AF37]/30 text-[#8B7332] hover:bg-[#D4AF37]/10 ml-2">
              <Edit3 className="w-3 h-3 mr-1.5" /> Edit Profile
            </Button>
          </div>
        </div>
      </div>

      {/* Wrapper for device preview */}
      <div className={cn(
        "mx-auto transition-all duration-300",
        previewDevice === 'mobile' ? "max-w-[390px] border-x border-gray-200 shadow-2xl my-6 rounded-2xl overflow-hidden" : "max-w-full"
      )}>
        {profileContent}
      </div>
    </div>
  );
}
