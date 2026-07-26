/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { categories } from '../data/mockData';

export const CategoriesPage = () => {
  return (
    <div className="pt-32 pb-20 px-6 min-h-screen bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="mb-20">
          <div className="text-[10px] uppercase font-bold text-[#D4AF37] tracking-[0.4em] mb-4">Discovery</div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-black uppercase mb-8">Model Categories</h1>
          <p className="text-lg text-gray-400 max-w-2xl font-medium leading-relaxed">
            Explore diverse talent across specialized sectors. From high-fashion editorial to lifestyle and commercial modeling, find the specific aesthetic for your vision.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {categories.map((cat, idx) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05, duration: 0.5 }}
              className="group"
            >
              <Link to="/models" className="block relative overflow-hidden rounded-3xl aspect-[4/5] bg-gray-100">
                <img 
                  src={cat.image} 
                  alt={cat.name} 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 group-hover:rotate-1"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent transition-opacity group-hover:opacity-80" />
                <div className="absolute bottom-0 left-0 right-0 p-10">
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-[#D4AF37] tracking-[0.3em] mb-2">{cat.count} Profiles</div>
                      <h3 className="text-3xl font-extrabold text-white uppercase tracking-tighter">{cat.name}</h3>
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20 group-hover:bg-[#D4AF37] group-hover:border-[#D4AF37] transition-all duration-500">
                      <ArrowRight className="w-6 h-6" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Specialized Filters */}
        <div className="mt-40 p-16 bg-[#FBFBFB] rounded-[3rem] border border-gray-100">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div>
              <div className="text-[10px] uppercase font-bold text-gray-400 tracking-[0.3em] mb-4">Can't find what you're looking for?</div>
              <h2 className="text-4xl font-extrabold tracking-tight uppercase mb-8 leading-tight">Niche Talent <br /> Scouting</h2>
              <p className="text-gray-500 mb-10 leading-relaxed font-medium">
                Our elite talent scouts can help you secure specialized models for niche projects, including body parts, fit modeling, and diverse character acting.
              </p>
              <div className="flex flex-wrap gap-3">
                {['Fitness', 'Maturity', 'Body Parts', 'Hand Models', 'Voice Acting'].map(tag => (
                  <span key={tag} className="px-5 py-2.5 bg-white border border-gray-100 rounded-xl text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:border-[#D4AF37] hover:text-[#D4AF37] cursor-pointer transition-all">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="bg-white p-12 rounded-3xl shadow-xl shadow-black/[0.02] border border-gray-50">
              <h3 className="font-bold mb-4 uppercase text-[10px] tracking-[0.3em] text-[#D4AF37]">Request Consultant</h3>
              <p className="text-sm text-gray-400 font-medium mb-10 leading-relaxed">Describe your specific requirements and our team will curate a high-precision selection of talent for your approval.</p>
              <button className="w-full py-5 bg-black text-white rounded-xl font-bold uppercase text-[11px] tracking-[0.2em] hover:bg-[#D4AF37] transition-all flex items-center justify-center gap-3 active:scale-[0.98]">
                Initiate Scouting <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
