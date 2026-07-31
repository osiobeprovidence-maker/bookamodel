/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'framer-motion';
import { Search, MapPin, Grid, ArrowRight, Star, CheckCircle, Zap } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { models } from '../data/mockData';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { ProfileCard } from '../components/ui/ProfileCard';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

export const LandingPage = () => {
  const navigate = useNavigate();
  const categories = useQuery(api.categories.listFeatured);
  const allCategories = useQuery(api.categories.listActive);
  const featuredModels = models.slice(0, 4);
  const availableToday = models.filter(m => m.isAvailableToday).slice(0, 4);
  const popularCategories = (categories ?? []).slice(0, 8);
  const heroChips = (allCategories ?? []).slice(0, 7);

  return (
    <div className="bg-[#F8F8F8] min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-black mb-4">
              Find the perfect model in minutes.
            </h1>
            <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mb-12">
              BookAModel is the easiest way to find models in Nigeria. Discover and connect with beauty, fashion, commercial, and lifestyle models for your next project.
            </p>

            {/* Search Bar */}
            <div className="bg-white rounded-full h-16 md:h-20 shadow-xl shadow-black/5 ring-1 ring-black/5 flex items-center p-2 max-w-3xl mx-auto mb-8">
              <div className="flex-1 px-6 text-left border-r border-gray-100">
                <div className="text-[10px] uppercase font-bold text-gray-400">Category</div>
                <input 
                  type="text" 
                  placeholder="Fashion, Beauty..." 
                  className="text-sm font-medium w-full bg-transparent border-none focus:ring-0 p-0 placeholder-gray-300"
                />
              </div>
              <div className="flex-1 px-6 text-left border-r border-gray-100 hidden sm:block">
                <div className="text-[10px] uppercase font-bold text-gray-400">Location</div>
                <div className="text-sm font-medium">Lagos, Nigeria</div>
              </div>
              <div className="flex-1 px-6 text-left hidden sm:block">
                <div className="text-[10px] uppercase font-bold text-gray-400">Price</div>
                <div className="text-sm font-medium">Any budget</div>
              </div>
              <Button size="icon" className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-black text-white hover:bg-black/90">
                <Search className="w-5 h-5 md:w-6 md:h-6" />
              </Button>
            </div>

            <div className="flex flex-wrap justify-center gap-2">
              {heroChips.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => navigate('/models')}
                  className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-xs font-semibold text-gray-700 transition-colors"
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-24 bg-white px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-4xl font-black mb-4">Popular Categories</h2>
              <p className="text-gray-500">Whatever your project, we have the right talent.</p>
            </div>
            <Link to="/categories">
              <Button variant="outline" className="rounded-2xl flex items-center gap-2">
                View All <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {popularCategories.map((cat) => (
              <motion.div
                key={cat._id}
                whileHover={{ y: -5 }}
                className="group cursor-pointer"
                onClick={() => navigate('/models')}
              >
                <div
                  className="aspect-square rounded-2xl overflow-hidden mb-4 relative"
                  style={cat.image ? undefined : { backgroundColor: cat.color || '#111111' }}
                >
                  {cat.image ? (
                    <img
                      src={cat.image}
                      alt={cat.name}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform group-hover:scale-110"
                      referrerPolicy="no-referrer"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  ) : null}
                  {!cat.image && (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-2xl font-black text-white/90 uppercase tracking-tight">{cat.name.slice(0, 2)}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-black/60 text-[10px] font-bold text-white">
                    {cat.modelCount ?? 0} models
                  </div>
                </div>
                <h4 className="font-bold text-center group-hover:text-[#D4AF37] transition-colors">{cat.name}</h4>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Available Today */}
      <section className="py-24 px-6 bg-[#F8F8F8]">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-12">
            <div className="p-3 bg-green-100 rounded-2xl">
              <Zap className="w-6 h-6 text-green-600 fill-current" />
            </div>
            <div>
              <h2 className="text-4xl font-black">Available Today</h2>
              <p className="text-gray-500">Book these models for last-minute shoots.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {availableToday.map(model => (
              <ProfileCard key={model.id} model={model as any} onViewProfile={(id) => navigate(`/profile/${id}`)} onInvite={(id) => navigate(`/invite/${id}`)} />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6 bg-[#111111] text-white rounded-2xl mx-6 my-12 overflow-hidden relative">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <h2 className="text-5xl font-black mb-6">Simple Booking Flow</h2>
            <p className="text-gray-400">Our platform streamlines the entire process from discovery to booking.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            {[
              { step: '01', title: 'Discover', desc: 'Browse through thousands of verified models and use advanced filters to find your match.' },
              { step: '02', title: 'Invite', desc: 'Send a direct invitation with your job details, date, and budget. No middle-man.' },
              { step: '03', title: 'Confirm', desc: 'Model accepts your invite, you chat, and get ready for a successful project.' }
            ].map((item) => (
              <div key={item.step} className="relative">
                <span className="text-8xl font-black text-white/5 absolute -top-12 -left-8">{item.step}</span>
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                  <CheckCircle className="text-[#D4AF37] w-6 h-6" /> {item.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-20 text-center">
            <Link to="/signup">
              <Button size="lg" variant="gold" className="rounded-2xl px-12 py-5 font-bold text-lg">
                Get Started Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-black text-center mb-16">What businesses say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Adelola Fashion', role: 'Creative Director', quote: 'BookAModel has revolutionized how we find talent for our seasonal lookbooks. Fast, reliable, and premium models.' },
              { name: 'Glow Skincare', role: 'Marketing Manager', quote: 'The ability to filter by skin tone and specific categories saved us hours of casting. Highly recommend for any brand.' },
              { name: 'Vibe Media', role: 'Producer', quote: 'Professional models, clear communication, and easy payment tracking. This is the future of modeling in Nigeria.' }
            ].map((t, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -5 }}
                className="p-8 rounded-2xl bg-white border border-gray-100 shadow-sm"
              >
                <div className="flex gap-1 mb-6">
                  {[1, 2, 3, 4, 5].map(s => <Star key={s} className="w-4 h-4 text-[#D4AF37] fill-[#D4AF37]" />)}
                </div>
                <p className="text-gray-700 italic mb-8">"{t.quote}"</p>
                <div>
                  <h4 className="font-bold">{t.name}</h4>
                  <p className="text-sm text-gray-500">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
