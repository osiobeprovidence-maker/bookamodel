import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin, Star, MessageSquare, CheckCircle2, Heart, Award,
  Check, Mail, Calendar, Phone, Globe, X, ChevronLeft, ChevronRight,
  ZoomIn, ZoomOut, Share2, ShieldCheck, Clock, Wallet, Send,
} from 'lucide-react';
import { models, reviews } from '../data/mockData';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useUser } from '../contexts/UserContext';
import { useToast } from '../components/ui/Toast';

const bookingTypes = ['Fashion', 'Commercial', 'Runway', 'Editorial', 'Beauty', 'Fitness', 'Lifestyle'];

export const ModelProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const { toast } = useToast();
  const model = models.find(m => m.id === id) || models[0];
  const modelReviews = reviews.filter(r => r.modelId === model.id);

  const [isSaved, setIsSaved] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [lightboxZoom, setLightboxZoom] = useState(false);
  const [showVerifyTooltip, setShowVerifyTooltip] = useState(false);
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
      toast(`Opening chat with ${model.name}`, 'success');
      navigate('/business-dashboard/messages');
    });
  };

  const handleSendBooking = () => {
    if (!bookingForm.type || !bookingForm.date || !bookingForm.contactName || !bookingForm.contactEmail) {
      toast('Please fill in all required fields', 'warning');
      return;
    }
    toast(`Booking request sent to ${model.name}!`, 'success');
    setShowBookingModal(false);
    setBookingForm({ type: '', date: '', startTime: '', endTime: '', location: '', budget: '', notes: '', contactName: '', contactEmail: '', contactPhone: '' });
  };

  const avgRating = modelReviews.length > 0
    ? (modelReviews.reduce((sum, r) => sum + r.rating, 0) / modelReviews.length).toFixed(1)
    : model.rating.toFixed(1);

  const ratingDistribution = [5, 4, 3, 2, 1].map(stars => ({
    stars,
    count: modelReviews.filter(r => r.rating === stars).length,
    pct: modelReviews.length > 0 ? (modelReviews.filter(r => r.rating === stars).length / modelReviews.length) * 100 : 0,
  }));

  return (
    <div className="bg-white min-h-screen pt-20">
      {/* Header Section */}
      <section className="px-4 sm:px-6 py-8 sm:py-12 border-b border-gray-100">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8 md:gap-12 items-start">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full md:w-1/3 lg:w-1/4 shrink-0"
          >
            <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl shadow-black/5 ring-1 ring-black/5">
              <img
                src={model.profileImage}
                alt={model.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </motion.div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <div
                className="relative"
                onMouseEnter={() => setShowVerifyTooltip(true)}
                onMouseLeave={() => setShowVerifyTooltip(false)}
              >
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
              {model.isAvailableToday && <Badge variant="success">Available Today</Badge>}
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold tracking-tight text-black mb-4 uppercase">
              {model.name}
            </h1>

            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-gray-400 mb-6 sm:mb-8">
              <button
                onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(model.location + ', Nigeria')}`, '_blank')}
                className="flex items-center gap-2 hover:text-[#D4AF37] transition-colors"
              >
                <MapPin className="w-4 h-4" />
                <span className="text-sm font-bold uppercase tracking-widest">{model.location}</span>
              </button>
              <button
                onClick={() => setShowReviewModal(true)}
                className="flex items-center gap-2 hover:text-[#D4AF37] transition-colors"
              >
                <Star className="w-4 h-4 text-[#D4AF37] fill-[#D4AF37]" />
                <span className="text-sm font-bold">{avgRating} <span className="opacity-50 font-medium">({modelReviews.length} Reviews)</span></span>
              </button>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span className="text-sm font-bold">{model.completedJobs} Jobs Done</span>
              </span>
            </div>

            <p className="text-base sm:text-lg text-gray-500 max-w-2xl leading-relaxed mb-8 sm:mb-10">
              {model.bio}
            </p>

            <div className="flex flex-wrap gap-3 sm:gap-4">
              <Button onClick={handleBookModel} size="lg" className="rounded-xl px-6 sm:px-10 py-4 font-bold uppercase text-xs tracking-[0.2em] shadow-xl shadow-black/5">
                <Calendar className="w-4 h-4 mr-2" /> Book Model
              </Button>
              <Button variant="outline" size="lg" onClick={handleSendMessage} className="rounded-xl px-6 sm:px-8 font-bold uppercase text-xs tracking-widest">
                <MessageSquare className="w-4 h-4 mr-2" /> Message
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSave}
                className={cn(
                  "w-14 h-14 rounded-xl border transition-all",
                  isSaved ? "bg-red-50 border-red-200 text-red-500" : "border-gray-100 hover:text-red-500 hover:border-red-200"
                )}
              >
                <Heart className={cn("w-5 h-5", isSaved && "fill-current")} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast('Profile link copied!', 'success');
                }}
                className="w-14 h-14 rounded-xl border border-gray-100 hover:border-[#D4AF37] hover:text-[#D4AF37]"
              >
                <Share2 className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-16 sm:space-y-24">
            {/* Portfolio */}
            <section>
              <div className="flex items-end justify-between mb-8 sm:mb-12">
                <div>
                  <div className="text-[10px] uppercase font-bold text-gray-400 tracking-[0.3em] mb-2">Visuals</div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight uppercase">Portfolio</h2>
                </div>
                <div className="text-xs font-bold text-gray-300 uppercase tracking-widest">
                  {model.portfolio.length} High-Res Captures
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {model.portfolio.map((img, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    onClick={() => { setLightboxIndex(i); setLightboxZoom(false); }}
                    className={cn(
                      "rounded-2xl overflow-hidden bg-gray-50 cursor-pointer group relative",
                      i % 3 === 0 ? "sm:col-span-2 aspect-video" : "aspect-[4/5]"
                    )}
                  >
                    <img
                      src={img}
                      alt="Portfolio"
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="bg-white/90 backdrop-blur-sm rounded-full p-3">
                        <ZoomIn className="w-5 h-5 text-[#111111]" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Reviews */}
            <section>
              <div className="flex items-end justify-between mb-8 sm:mb-12">
                <div>
                  <div className="text-[10px] uppercase font-bold text-gray-400 tracking-[0.3em] mb-2">Feedback</div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight uppercase">Client Reviews</h2>
                </div>
                <button
                  onClick={() => setShowReviewModal(true)}
                  className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest hover:underline"
                >
                  View All
                </button>
              </div>

              <div className="space-y-6 sm:space-y-8">
                {modelReviews.slice(0, 4).map((review) => (
                  <div key={review.id} className="pb-6 sm:pb-8 border-b border-gray-100 last:border-0">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <img src={review.userImage} className="w-10 h-10 rounded-full object-cover" alt="" referrerPolicy="no-referrer" />
                        <div>
                          <h4 className="text-sm font-bold uppercase tracking-tight">{review.userName}</h4>
                          <div className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">{review.date}</div>
                        </div>
                      </div>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map(s => (
                          <Star key={s} className={cn("w-3 h-3", s <= review.rating ? "text-[#D4AF37] fill-[#D4AF37]" : "text-gray-100")} />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-500 text-sm leading-relaxed max-w-2xl italic">
                      &ldquo;{review.comment}&rdquo;
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar Stats */}
          <aside className="lg:col-span-4 space-y-8 sm:space-y-12">
            <div className="lg:sticky lg:top-32">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <Clock className="w-5 h-5 text-[#D4AF37] mx-auto mb-1" />
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Response</p>
                  <p className="text-sm font-bold">{model.responseRate}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <Globe className="w-5 h-5 text-[#D4AF37] mx-auto mb-1" />
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Travel</p>
                  <p className="text-sm font-bold">{model.travelAvailability ? 'Available' : 'Local Only'}</p>
                </div>
              </div>

              <div className="mb-8 sm:mb-12">
                <div className="text-[10px] uppercase font-bold text-gray-400 tracking-[0.3em] mb-4 sm:mb-6 border-b border-gray-100 pb-2">Physical Attributes</div>
                <div className="grid grid-cols-2 gap-y-4 sm:gap-y-6 gap-x-8 sm:gap-x-12">
                  {[
                    { label: 'Height', value: model.height },
                    { label: 'Eyes', value: 'Dark Brown' },
                    { label: 'Hair', value: 'Black' },
                    { label: 'Age', value: `${model.age}` },
                    { label: 'Measurements', value: model.measurements },
                    { label: 'Skin Tone', value: model.skinTone },
                  ].map((stat) => (
                    <div key={stat.label}>
                      <div className="text-[9px] uppercase font-bold text-gray-300 tracking-widest mb-1">{stat.label}</div>
                      <div className="text-sm font-extrabold text-black">{stat.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-8 sm:mb-12">
                <div className="text-[10px] uppercase font-bold text-gray-400 tracking-[0.3em] mb-4 sm:mb-6 border-b border-gray-100 pb-2">Expertise</div>
                <div className="flex flex-wrap gap-2">
                  {model.categories.map(cat => (
                    <span key={cat} className="px-3 py-1.5 bg-gray-100 rounded-lg text-[10px] font-bold text-gray-600 uppercase tracking-widest">
                      {cat}
                    </span>
                  ))}
                </div>
              </div>

              {/* Social Links */}
              <div className="mb-8 sm:mb-12">
                <div className="text-[10px] uppercase font-bold text-gray-400 tracking-[0.3em] mb-4 sm:mb-6 border-b border-gray-100 pb-2">Connect</div>
                <div className="space-y-2">
                  {model.instagram && (
                    <a href={`https://instagram.com/${model.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-sm text-gray-600 font-medium">
                      <Mail className="w-4 h-4 text-[#D4AF37]" /> {model.instagram}
                    </a>
                  )}
                  {model.tiktok && (
                    <a href={`https://tiktok.com/${model.tiktok.replace('@', '')}`} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-sm text-gray-600 font-medium">
                      <Phone className="w-4 h-4 text-[#D4AF37]" /> {model.tiktok}
                    </a>
                  )}
                </div>
              </div>

              <div className="p-6 sm:p-8 bg-[#111111] rounded-2xl text-white">
                <Award className="w-8 h-8 text-[#D4AF37] mb-4" />
                <h3 className="text-lg font-bold tracking-tight mb-2">Book with Confidence</h3>
                <p className="text-xs text-gray-400 leading-relaxed mb-6">
                  This talent has completed over {model.completedJobs} projects with a {model.responseRate} response rate.
                </p>
                <Button variant="gold" onClick={handleBookModel} className="w-full rounded-xl py-4 font-bold uppercase text-[10px] tracking-widest">
                  Request Booking
                </Button>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-black/95 flex items-center justify-center"
            onClick={() => { setLightboxIndex(null); setLightboxZoom(false); }}
          >
            <button
              onClick={(e) => { e.stopPropagation(); setLightboxIndex(null); setLightboxZoom(false); }}
              className="absolute top-6 right-6 p-2 text-white/70 hover:text-white transition-colors z-10"
            >
              <X className="w-6 h-6" />
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); setLightboxZoom(false); setLightboxIndex((prev) => prev !== null ? (prev - 1 + model.portfolio.length) % model.portfolio.length : 0); }}
              className="absolute left-4 sm:left-6 p-3 text-white/70 hover:text-white bg-white/10 rounded-full transition-all z-10"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <div className="absolute top-6 left-1/2 -translate-x-1/2 text-white/60 text-sm font-medium z-10">
              {lightboxIndex + 1} / {model.portfolio.length}
            </div>

            <button
              onClick={(e) => { e.stopPropagation(); setLightboxZoom(false); setLightboxIndex((prev) => prev !== null ? (prev + 1) % model.portfolio.length : 0); }}
              className="absolute right-4 sm:right-6 p-3 text-white/70 hover:text-white bg-white/10 rounded-full transition-all z-10"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); setLightboxZoom(!lightboxZoom); }}
              className="absolute bottom-6 left-1/2 -translate-x-1/2 p-3 text-white/70 hover:text-white bg-white/10 rounded-full transition-all z-10"
            >
              {lightboxZoom ? <ZoomOut className="w-5 h-5" /> : <ZoomIn className="w-5 h-5" />}
            </button>

            <motion.img
              key={lightboxIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: lightboxZoom ? 1.5 : 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              src={model.portfolio[lightboxIndex]}
              alt="Portfolio"
              className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg cursor-zoom-in"
              onClick={(e) => { e.stopPropagation(); setLightboxZoom(!lightboxZoom); }}
              referrerPolicy="no-referrer"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Review Modal */}
      <AnimatePresence>
        {showReviewModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={() => setShowReviewModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-white rounded-2xl p-6 sm:p-8 shadow-2xl max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[#111111]">Reviews &amp; Ratings</h2>
                <button onClick={() => setShowReviewModal(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Rating Summary */}
              <div className="flex items-center gap-6 mb-6 p-4 bg-gray-50 rounded-xl">
                <div className="text-center">
                  <p className="text-4xl font-extrabold text-[#111111]">{avgRating}</p>
                  <div className="flex gap-0.5 mt-1">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} className={cn("w-4 h-4", s <= Math.round(parseFloat(avgRating)) ? "text-[#D4AF37] fill-[#D4AF37]" : "text-gray-200")} />
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{modelReviews.length} reviews</p>
                </div>
                <div className="flex-1 space-y-1.5">
                  {ratingDistribution.map(r => (
                    <div key={r.stars} className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-400 w-3">{r.stars}</span>
                      <Star className="w-3 h-3 text-[#D4AF37] fill-[#D4AF37]" />
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-[#D4AF37] rounded-full" style={{ width: `${r.pct}%` }} />
                      </div>
                      <span className="text-xs text-gray-400 w-6 text-right">{r.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reviews List */}
              <div className="space-y-4">
                {modelReviews.map((review) => (
                  <div key={review.id} className="pb-4 border-b border-gray-100 last:border-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <img src={review.userImage} className="w-8 h-8 rounded-full object-cover" alt="" referrerPolicy="no-referrer" />
                        <span className="text-sm font-bold">{review.userName}</span>
                      </div>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map(s => (
                          <Star key={s} className={cn("w-3 h-3", s <= review.rating ? "text-[#D4AF37] fill-[#D4AF37]" : "text-gray-200")} />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 italic">&ldquo;{review.comment}&rdquo;</p>
                    <p className="text-[10px] text-gray-300 mt-1 uppercase tracking-widest">{review.date}</p>
                  </div>
                ))}
              </div>

              {/* Leave Review */}
              <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Leave a Review</p>
                <p className="text-xs text-gray-500">You can leave a review after completing a booking with this model.</p>
                <button
                  onClick={() => toast('Review feature available after completing a booking', 'info')}
                  className="mt-3 px-4 py-2 bg-[#D4AF37] text-white rounded-xl text-xs font-bold hover:bg-[#C5A028] transition-colors"
                >
                  Write Review
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Booking Modal */}
      <AnimatePresence>
        {showBookingModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={() => setShowBookingModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-6 py-5 border-b border-gray-100 rounded-t-2xl">
                <div className="flex items-center gap-3">
                  <img src={model.profileImage} alt={model.name} className="w-12 h-12 rounded-xl object-cover" referrerPolicy="no-referrer" />
                  <div>
                    <h2 className="text-lg font-bold text-[#111111]">Book {model.name}</h2>
                    <p className="text-xs text-gray-400">{model.categories.join(' · ')}</p>
                  </div>
                </div>
                <button onClick={() => setShowBookingModal(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="px-6 py-6 space-y-5">
                {/* Booking Type */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Booking Type *</label>
                  <div className="flex flex-wrap gap-2">
                    {bookingTypes.map((type) => (
                      <button
                        key={type}
                        onClick={() => setBookingForm({ ...bookingForm, type })}
                        className={cn(
                          "px-4 py-2 rounded-xl text-xs font-bold transition-all",
                          bookingForm.type === type ? "bg-[#D4AF37] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        )}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date & Time */}
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

                {/* Location & Budget */}
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

                {/* Notes */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Additional Notes</label>
                  <textarea rows={3} value={bookingForm.notes} onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })} placeholder="Describe the project, requirements, wardrobe, etc."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37] resize-none" />
                </div>

                {/* Contact Info */}
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

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex items-center justify-end gap-3 rounded-b-2xl">
                <button onClick={() => setShowBookingModal(false)} className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-all">
                  Cancel
                </button>
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
