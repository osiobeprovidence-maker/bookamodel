import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin, Star, MessageSquare, CheckCircle2, Heart, Award, User,
  Check, Mail, Calendar, Phone, Globe, X, ChevronLeft, ChevronRight,
  ZoomIn, ZoomOut, Share2, ShieldCheck, Clock, Wallet, Send, Loader2, Play, Film, Folder, Image as ImageIcon, Eye, Edit3,
} from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import Avatar from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { useUser } from '../contexts/UserContext';
import { useToast } from '../components/ui/Toast';
import VideoPlayer from '../components/ui/VideoPlayer';

export const ModelProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, convexUser } = useUser();
  const { toast } = useToast();
  const bookingCategories = useQuery(api.categories.listActive);

  const myProfile = useQuery(
    api.users.getModelProfile,
    convexUser ? { userId: convexUser._id as any } : 'skip'
  );

  const modelProfileWithUser = useQuery(
    api.users.getModelProfileById,
    id ? { modelProfileId: id as any } : 'skip'
  );
  const portfolioItems = useQuery(
    api.portfolio.list,
    modelProfileWithUser ? { modelProfileId: id as any } : 'skip'
  );
  const albums = useQuery(
    api.albums.listPublicByModelProfile,
    modelProfileWithUser ? { modelProfileId: id as any } : 'skip'
  );
  const modelPrivacy = useQuery(
    api.settings.getPrivacyForUser,
    modelProfileWithUser ? { userId: modelProfileWithUser.userId as any } : 'skip'
  );

  const profile = modelProfileWithUser;
  const isOwnProfile = !!(myProfile && id && myProfile._id === id);
  const modelName = profile?.user?.name || 'Model';
  const location = [profile?.city, profile?.state, profile?.country].filter(Boolean).join(', ') || 'Nigeria';

  const [isSaved, setIsSaved] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [lightboxZoom, setLightboxZoom] = useState(false);
  const [showVerifyTooltip, setShowVerifyTooltip] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [bookingForm, setBookingForm] = useState({
    type: '', date: '', startTime: '', endTime: '', location: '', budget: '', notes: '', contactName: '', contactEmail: '', contactPhone: '',
  });

  const requireAuth = (action: string, callback: () => void) => {
    if (!user) {
      toast(`Please sign in to ${action}`, 'warning');
      navigate('/login');
      return;
    }
    callback();
  };

  const toggleSave = () => {
    requireAuth('save models', () => {
      setIsSaved(!isSaved);
      toast(isSaved ? 'Model removed from saved' : 'Model saved', 'success');
    });
  };

  const handleBookModel = () => {
    requireAuth('book models', () => {
      setShowBookingModal(true);
    });
  };

  const handleSendMessage = () => {
    requireAuth('message models', () => {
      toast(`Opening chat with ${modelName}`, 'success');
      navigate('/business-dashboard/messages');
    });
  };

  const handleSendBooking = () => {
    if (!bookingForm.type || !bookingForm.date || !bookingForm.contactName || !bookingForm.contactEmail) {
      toast('Please fill in all required fields', 'warning');
      return;
    }
    toast(`Booking request sent to ${modelName}!`, 'success');
    setShowBookingModal(false);
    setBookingForm({ type: '', date: '', startTime: '', endTime: '', location: '', budget: '', notes: '', contactName: '', contactEmail: '', contactPhone: '' });
  };

  const images = portfolioItems?.filter(i => i.type !== 'video') ?? [];
  const videos = portfolioItems?.filter(i => i.type === 'video' && i.status === 'ready') ?? [];
  const allMedia = portfolioItems ?? [];

  if (!profile) {
    return (
      <div className="bg-white min-h-screen pt-20 flex items-center justify-center">
        {modelProfileWithUser === undefined ? (
          <Loader2 size={32} className="text-gray-400 animate-spin" />
        ) : (
          <div className="text-center">
            <ImageIcon size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Model not found</p>
            <Link to="/explore" className="text-[#D4AF37] text-sm mt-2 inline-block hover:underline">Browse models</Link>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen pt-20">
      {isOwnProfile && (
        <div className="bg-gradient-to-r from-[#D4AF37]/10 via-[#D4AF37]/5 to-[#D4AF37]/10 border-b border-[#D4AF37]/20 px-4 sm:px-6 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 text-sm font-medium text-[#8B7332]">
              <Eye className="w-4 h-4" />
              Preview Mode — This is how businesses and brands see your profile
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/model-dashboard/profile')}
              className="text-xs rounded-lg border-[#D4AF37]/30 text-[#8B7332] hover:bg-[#D4AF37]/10">
              <Edit3 className="w-3 h-3 mr-1.5" /> Edit Profile
            </Button>
          </div>
        </div>
      )}
      {/* Header Section */}
      <section className="px-4 sm:px-6 py-8 sm:py-12 border-b border-gray-100">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8 md:gap-12 items-start">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full md:w-1/3 lg:w-1/4 shrink-0"
          >
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
                <span className="text-sm font-bold">{profile.rating?.toFixed(1) || '0.0'} <span className="opacity-50 font-medium">({profile.reviewCount || 0} Reviews)</span></span>
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
              {isOwnProfile ? (
                <>
                  <Button onClick={() => navigate('/model-dashboard/profile')} size="lg" className="rounded-xl px-6 sm:px-10 py-4 font-bold uppercase text-xs tracking-[0.2em] shadow-xl shadow-black/5">
                    <Edit3 className="w-4 h-4 mr-2" /> Edit Profile
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => { navigator.clipboard.writeText(window.location.href); toast('Profile link copied!', 'success'); }}
                    className="w-14 h-14 rounded-xl border border-gray-100 hover:border-[#D4AF37] hover:text-[#D4AF37]">
                    <Share2 className="w-5 h-5" />
                  </Button>
                </>
              ) : (
                <>
              <Button onClick={handleBookModel} size="lg" className="rounded-xl px-6 sm:px-10 py-4 font-bold uppercase text-xs tracking-[0.2em] shadow-xl shadow-black/5">
                <Calendar className="w-4 h-4 mr-2" /> Book Model
              </Button>
              <Button variant="outline" size="lg" onClick={handleSendMessage} className="rounded-xl px-6 sm:px-8 font-bold uppercase text-xs tracking-widest">
                <MessageSquare className="w-4 h-4 mr-2" /> Message
              </Button>
              <Button variant="ghost" size="icon" onClick={toggleSave}
                className={cn("w-14 h-14 rounded-xl border transition-all", isSaved ? "bg-red-50 border-red-200 text-red-500" : "border-gray-100 hover:text-red-500 hover:border-red-200")}>
                <Heart className={cn("w-5 h-5", isSaved && "fill-current")} />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => { navigator.clipboard.writeText(window.location.href); toast('Profile link copied!', 'success'); }}
                className="w-14 h-14 rounded-xl border border-gray-100 hover:border-[#D4AF37] hover:text-[#D4AF37]">
                <Share2 className="w-5 h-5" />
              </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-16 sm:space-y-24">
            {/* Videos Section */}
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
                  {videos.map((video) => (
                    <motion.div key={video._id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                      className="rounded-2xl overflow-hidden bg-black group relative aspect-video">
                      {video.playbackId ? (
                        <VideoPlayer
                          playbackId={video.playbackId}
                          className="w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-900">
                          <Film size={32} className="text-white/40" />
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {/* Portfolio */}
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
                  {images.map((img, i) => (
                    <motion.div key={img._id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                      onClick={() => { setLightboxIndex(i); setLightboxZoom(false); }}
                      className={cn("rounded-2xl overflow-hidden bg-gray-50 cursor-pointer group relative", i % 3 === 0 ? "sm:col-span-2 aspect-video" : "aspect-[4/5]")}>
                      <img src={img.imageUrl} alt={img.title || 'Portfolio'} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" referrerPolicy="no-referrer"
                        onError={(e) => { (e.target as HTMLImageElement).src = ''; (e.target as HTMLImageElement).parentElement!.classList.add('bg-gray-100'); }} />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="bg-white/90 backdrop-blur-sm rounded-full p-3"><ZoomIn className="w-5 h-5 text-[#111111]" /></div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-gray-50 rounded-2xl">
                  <ImageIcon size={40} className="text-gray-300 mx-auto mb-4" />
                  <p className="text-sm text-gray-400">No portfolio images yet</p>
                </div>
              )}
            </section>

            {/* Albums */}
            {albums && albums.length > 0 && (
              <section>
                <div className="flex items-end justify-between mb-8 sm:mb-12">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-gray-400 tracking-[0.3em] mb-2">Collections</div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight uppercase">Albums</h2>
                  </div>
                  <div className="text-xs font-bold text-gray-300 uppercase tracking-widest">{albums.length} Albums</div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
                  {albums.map((album) => (
                    <motion.div key={album._id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                      className="rounded-2xl overflow-hidden bg-gray-50 group relative aspect-[4/3]">
                      {album.coverImageUrl ? (
                        <img src={album.coverImageUrl} alt={album.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><Folder size={40} className="text-gray-300" /></div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4">
                        <div>
                          <h3 className="text-white font-bold text-sm">{album.title}</h3>
                          <p className="text-white/60 text-xs">{album.category}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar Stats */}
          <aside className="lg:col-span-4 space-y-8 sm:space-y-12">
            <div className="lg:sticky lg:top-32">
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
              </div>

              {isOwnProfile && (
                <div className="bg-gray-50 rounded-2xl p-6 mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <Share2 className="w-5 h-5 text-[#D4AF37]" />
                    <h3 className="text-sm font-bold text-black">Public Profile</h3>
                  </div>
                  <p className="text-xs text-gray-500 mb-3 break-all">{window.location.href}</p>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(window.location.href); toast('Link copied!', 'success'); }}
                      className="rounded-lg text-xs font-bold">
                      Copy Link
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => window.open(window.location.href, '_blank')}
                      className="rounded-lg text-xs font-bold">
                      Open Public Page
                    </Button>
                  </div>
                </div>
              )}
              <div className="mb-8 sm:mb-12">
                <div className="text-[10px] uppercase font-bold text-gray-400 tracking-[0.3em] mb-4 sm:mb-6 border-b border-gray-100 pb-2">Physical Attributes</div>
                <div className="grid grid-cols-2 gap-y-4 sm:gap-y-6 gap-x-8 sm:gap-x-12">
                  {[
                    ...(modelPrivacy?.hideMeasurements
                      ? []
                      : [
                          { label: 'Height', value: profile.height || '—' },
                          { label: 'Bust', value: profile.bust || '—' },
                          { label: 'Waist', value: profile.waist || '—' },
                          { label: 'Hips', value: profile.hips || '—' },
                          { label: 'Dress', value: profile.dressSize || '—' },
                          { label: 'Shoes', value: profile.shoeSize || '—' },
                        ]),
                    { label: 'Eyes', value: profile.eyeColor || '—' },
                    { label: 'Hair', value: profile.hairColor || '—' },
                    { label: 'Skin', value: profile.skinTone || '—' },
                  ].map((stat) => (
                    <div key={stat.label}>
                      <div className="text-[9px] uppercase font-bold text-gray-300 tracking-widest mb-1">{stat.label}</div>
                      <div className="text-sm font-extrabold text-black">{stat.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {profile.categories && profile.categories.length > 0 && (
                <div className="mb-8 sm:mb-12">
                  <div className="text-[10px] uppercase font-bold text-gray-400 tracking-[0.3em] mb-4 sm:mb-6 border-b border-gray-100 pb-2">Expertise</div>
                  <div className="flex flex-wrap gap-2">
                    {profile.categories.map(cat => (
                      <span key={cat} className="px-3 py-1.5 bg-gray-100 rounded-lg text-[10px] font-bold text-gray-600 uppercase tracking-widest">{cat}</span>
                    ))}
                  </div>
                </div>
              )}

              {modelPrivacy?.showSocialLinks !== false && profile.socials && (profile.socials.instagram || profile.socials.tiktok) && (
                <div className="mb-8 sm:mb-12">
                  <div className="text-[10px] uppercase font-bold text-gray-400 tracking-[0.3em] mb-4 sm:mb-6 border-b border-gray-100 pb-2">Connect</div>
                  <div className="space-y-2">
                    {profile.socials.instagram && (
                      <a href={`https://instagram.com/${profile.socials.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-sm text-gray-600 font-medium">
                        <Mail className="w-4 h-4 text-[#D4AF37]" /> {profile.socials.instagram}
                      </a>
                    )}
                    {profile.socials.tiktok && (
                      <a href={`https://tiktok.com/${profile.socials.tiktok.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-sm text-gray-600 font-medium">
                        <Phone className="w-4 h-4 text-[#D4AF37]" /> {profile.socials.tiktok}
                      </a>
                    )}
                  </div>
                </div>
              )}

              <div className="p-6 sm:p-8 bg-[#111111] rounded-2xl text-white">
                <Award className="w-8 h-8 text-[#D4AF37] mb-4" />
                {isOwnProfile ? (
                  <>
                    <h3 className="text-lg font-bold tracking-tight mb-2">Manage Your Profile</h3>
                    <p className="text-xs text-gray-400 leading-relaxed mb-6">
                      Keep your profile up to date to attract more bookings.
                    </p>
                    <Button onClick={() => navigate('/model-dashboard/profile')} className="w-full rounded-xl py-4 font-bold uppercase text-[10px] tracking-widest">
                      Edit Profile
                    </Button>
                  </>
                ) : (
                  <>
                <h3 className="text-lg font-bold tracking-tight mb-2">Book with Confidence</h3>
                <p className="text-xs text-gray-400 leading-relaxed mb-6">
                  This talent has completed over {profile.completedJobs || 0} projects.
                </p>
                <Button variant="gold" onClick={handleBookModel} className="w-full rounded-xl py-4 font-bold uppercase text-[10px] tracking-widest">
                  Request Booking
                </Button>
                  </>
                )}
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
            <div className="absolute top-6 left-1/2 -translate-x-1/2 text-white/60 text-sm font-medium z-10">{lightboxIndex + 1} / {images.length}</div>
            <button onClick={(e) => { e.stopPropagation(); setLightboxZoom(false); setLightboxIndex((prev) => prev !== null ? (prev + 1) % images.length : 0); }} className="absolute right-4 sm:right-6 p-3 text-white/70 hover:text-white bg-white/10 rounded-full transition-all z-10"><ChevronRight className="w-6 h-6" /></button>
            <button onClick={(e) => { e.stopPropagation(); setLightboxZoom(!lightboxZoom); }} className="absolute bottom-6 left-1/2 -translate-x-1/2 p-3 text-white/70 hover:text-white bg-white/10 rounded-full transition-all z-10">{lightboxZoom ? <ZoomOut className="w-5 h-5" /> : <ZoomIn className="w-5 h-5" />}</button>
            <motion.img key={lightboxIndex} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: lightboxZoom ? 1.5 : 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.3 }}
              src={images[lightboxIndex].imageUrl} alt="Portfolio" className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg cursor-zoom-in"
              onClick={(e) => { e.stopPropagation(); setLightboxZoom(!lightboxZoom); }} referrerPolicy="no-referrer" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Review Modal */}
      <AnimatePresence>
        {showReviewModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={() => setShowReviewModal(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-white rounded-2xl p-6 sm:p-8 shadow-2xl max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[#111111]">Reviews &amp; Ratings</h2>
                <button onClick={() => setShowReviewModal(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl"><X className="w-5 h-5" /></button>
              </div>
              <div className="flex items-center gap-6 mb-6 p-4 bg-gray-50 rounded-xl">
                <div className="text-center">
                  <p className="text-4xl font-extrabold text-[#111111]">{profile.rating?.toFixed(1) || '0.0'}</p>
                  <div className="flex gap-0.5 mt-1">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} className={cn("w-4 h-4", s <= Math.round(profile.rating || 0) ? "text-[#D4AF37] fill-[#D4AF37]" : "text-gray-200")} />
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{profile.reviewCount || 0} reviews</p>
                </div>
              </div>
              <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Leave a Review</p>
                <p className="text-xs text-gray-500">You can leave a review after completing a booking with this model.</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Booking Modal */}
      <AnimatePresence>
        {showBookingModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={() => setShowBookingModal(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}>
              <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-6 py-5 border-b border-gray-100 rounded-t-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center">
                    <Avatar src={profile.imageUrl} name={modelName} size={48} icon={User} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-[#111111]">Book {modelName}</h2>
                    <p className="text-xs text-gray-400">{profile.categories?.join(' · ') || 'Model'}</p>
                  </div>
                </div>
                <button onClick={() => setShowBookingModal(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl"><X className="w-5 h-5" /></button>
              </div>
              <div className="px-6 py-6 space-y-5">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Booking Type *</label>
                  <div className="flex flex-wrap gap-2">
                    {(bookingCategories ?? []).map((cat) => (
                      <button key={cat._id} onClick={() => setBookingForm({ ...bookingForm, type: cat.slug })}
                        className={cn("px-4 py-2 rounded-xl text-xs font-bold transition-all", bookingForm.type === cat.slug ? "bg-[#D4AF37] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200")}>
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Date *</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input type="date" value={bookingForm.date} onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                        className="w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Start</label>
                      <input type="time" value={bookingForm.startTime} onChange={(e) => setBookingForm({ ...bookingForm, startTime: e.target.value })}
                        className="w-full px-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">End</label>
                      <input type="time" value={bookingForm.endTime} onChange={(e) => setBookingForm({ ...bookingForm, endTime: e.target.value })}
                        className="w-full px-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]" />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Location</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input type="text" value={bookingForm.location} onChange={(e) => setBookingForm({ ...bookingForm, location: e.target.value })} placeholder="Shoot location"
                        className="w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Budget (₦)</label>
                    <div className="relative">
                      <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input type="text" value={bookingForm.budget} onChange={(e) => setBookingForm({ ...bookingForm, budget: e.target.value })} placeholder="e.g. 150,000"
                        className="w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]" />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Additional Notes</label>
                  <textarea rows={3} value={bookingForm.notes} onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })} placeholder="Describe the project, requirements, wardrobe, etc."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37] resize-none" />
                </div>
                <div className="border-t border-gray-100 pt-5">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Contact Information</p>
                  <div className="space-y-3">
                    <input type="text" value={bookingForm.contactName} onChange={(e) => setBookingForm({ ...bookingForm, contactName: e.target.value })} placeholder="Your name *"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input type="email" value={bookingForm.contactEmail} onChange={(e) => setBookingForm({ ...bookingForm, contactEmail: e.target.value })} placeholder="Email address *"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]" />
                      <input type="tel" value={bookingForm.contactPhone} onChange={(e) => setBookingForm({ ...bookingForm, contactPhone: e.target.value })} placeholder="Phone number"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex items-center justify-end gap-3 rounded-b-2xl">
                <button onClick={() => setShowBookingModal(false)} className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-all">Cancel</button>
                <button onClick={handleSendBooking} className="px-6 py-2.5 bg-[#D4AF37] text-white rounded-xl text-sm font-semibold hover:bg-[#C5A028] transition-all flex items-center gap-2">
                  <Send className="w-4 h-4" /> Send Booking Request
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
