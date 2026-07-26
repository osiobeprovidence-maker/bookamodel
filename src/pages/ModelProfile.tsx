/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useParams, Link } from 'react-router-dom';
import { 
  MapPin, Star, MessageSquare, Instagram, Twitter, 
  CheckCircle2, Share2, Heart, ShieldAlert, Award,
  Check, Mail, Calendar, Phone, Globe
} from 'lucide-react';
import { models, reviews } from '../data/mockData';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export const ModelProfile = () => {
  const { id } = useParams();
  const model = models.find(m => m.id === id) || models[0];
  const modelReviews = reviews.filter(r => r.modelId === model.id);

  return (
    <div className="bg-white min-h-screen pt-20">
      {/* Header Section */}
      <section className="px-6 py-12 border-b border-gray-100">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-12 items-start">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full md:w-1/3 lg:w-1/4"
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

          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <Badge variant="gold" className="rounded-full">Verified Talent</Badge>
              {model.isAvailableToday && <Badge variant="success">Available Today</Badge>}
            </div>
            
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-black mb-4 uppercase">
              {model.name}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 text-gray-400 mb-8">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span className="text-sm font-bold uppercase tracking-widest">{model.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-[#D4AF37] fill-[#D4AF37]" />
                <span className="text-sm font-bold">{model.rating} <span className="opacity-50 font-medium">({modelReviews.length} Reviews)</span></span>
              </div>
            </div>

            <p className="text-lg text-gray-500 max-w-2xl leading-relaxed mb-10">
              {model.bio}
            </p>

            <div className="flex flex-wrap gap-4">
              <Link to={`/invite/${model.id}`}>
                <Button size="lg" className="rounded-xl px-10 py-4 font-bold uppercase text-xs tracking-[0.2em] shadow-xl shadow-black/5">
                  Book Model
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="rounded-xl px-8 font-bold uppercase text-xs tracking-widest">
                <MessageSquare className="w-4 h-4 mr-2" /> Message
              </Button>
              <Button variant="ghost" size="icon" className="w-14 h-14 rounded-xl border border-gray-100">
                <Heart className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-24">
            {/* Portfolio */}
            <section>
              <div className="flex items-end justify-between mb-12">
                <div>
                  <div className="text-[10px] uppercase font-bold text-gray-400 tracking-[0.3em] mb-2">Visuals</div>
                  <h2 className="text-3xl font-extrabold tracking-tight uppercase">Portfolio</h2>
                </div>
                <div className="text-xs font-bold text-gray-300 uppercase tracking-widest">
                  {model.portfolio.length} High-Res Captures
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {model.portfolio.map((img, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className={cn(
                      "rounded-2xl overflow-hidden bg-gray-50 cursor-zoom-in group",
                      i % 3 === 0 ? "md:col-span-2 aspect-video" : "aspect-[4/5]"
                    )}
                  >
                    <img
                      src={img}
                      alt="Portfolio"
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Reviews */}
            <section>
              <div className="flex items-end justify-between mb-12">
                <div>
                  <div className="text-[10px] uppercase font-bold text-gray-400 tracking-[0.3em] mb-2">Feedback</div>
                  <h2 className="text-3xl font-extrabold tracking-tight uppercase">Client Reviews</h2>
                </div>
              </div>

              <div className="space-y-8">
                {modelReviews.map((review) => (
                  <div key={review.id} className="pb-8 border-b border-gray-100 last:border-0">
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
                      "{review.comment}"
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar Stats */}
          <aside className="lg:col-span-4 space-y-12">
            <div className="sticky top-32">
              <div className="mb-12">
                <div className="text-[10px] uppercase font-bold text-gray-400 tracking-[0.3em] mb-6 border-b border-gray-100 pb-2">Physical Attributes</div>
                <div className="grid grid-cols-2 gap-y-6 gap-x-12">
                  {[
                    { label: 'Height', value: model.height },
                    { label: 'Eyes', value: 'Dark Brown' },
                    { label: 'Hair', value: 'Black' },
                    { label: 'Age', value: model.age },
                    { label: 'Waist', value: '24"' },
                    { label: 'Hips', value: '34"' },
                  ].map((stat) => (
                    <div key={stat.label}>
                      <div className="text-[9px] uppercase font-bold text-gray-300 tracking-widest mb-1">{stat.label}</div>
                      <div className="text-sm font-extrabold text-black">{stat.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-12">
                <div className="text-[10px] uppercase font-bold text-gray-400 tracking-[0.3em] mb-6 border-b border-gray-100 pb-2">Expertise</div>
                <div className="flex flex-wrap gap-2">
                  {model.categories.map(cat => (
                    <span key={cat} className="px-3 py-1.5 bg-gray-100 rounded-lg text-[10px] font-bold text-gray-600 uppercase tracking-widest">
                      {cat}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-8 bg-[#111111] rounded-2xl text-white">
                <Award className="w-8 h-8 text-[#D4AF37] mb-4" />
                <h3 className="text-lg font-bold tracking-tight mb-2">Book with Confidence</h3>
                <p className="text-xs text-gray-400 leading-relaxed mb-6">
                  This talent has completed over {model.completedJobs} projects with a 98% on-time arrival rate.
                </p>
                <Link to={`/invite/${model.id}`} className="block">
                  <Button variant="gold" className="w-full rounded-xl py-4 font-bold uppercase text-[10px] tracking-widest">
                    Request Booking
                  </Button>
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};
