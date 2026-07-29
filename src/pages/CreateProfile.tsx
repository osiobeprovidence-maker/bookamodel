/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Ruler, Grid, Image as ImageIcon, Calendar, 
  ChevronRight, ChevronLeft, Upload, Check, Camera
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { categories } from '../data/mockData';
import { cn } from '../lib/utils';

export const CreateProfile = () => {
  const [step, setStep] = useState(1);
  const totalSteps = 5;

  const nextStep = () => setStep(s => Math.min(s + 1, totalSteps));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  return (
    <div className="bg-white min-h-screen pt-32 pb-24 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-16">
          <div className="flex justify-between items-end mb-6">
            <div>
              <div className="text-[10px] uppercase font-bold text-gray-400 tracking-[0.3em] mb-2">Step {step} of {totalSteps}</div>
              <h1 className="text-4xl font-extrabold tracking-tighter uppercase">Create Profile</h1>
            </div>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[#D4AF37]"
              initial={{ width: 0 }}
              animate={{ width: `${(step / totalSteps) * 100}%` }}
              transition={{ duration: 0.5, ease: "circOut" }}
            />
          </div>
        </div>

        <div className="bg-[#FBFBFB] rounded-3xl p-12 border border-gray-100 shadow-sm">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold tracking-tight uppercase">Identity</h2>
                </div>
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Legal Name</label>
                    <input type="text" className="w-full px-6 py-4 bg-white rounded-xl border border-gray-100 focus:border-[#D4AF37] outline-none transition-all text-sm font-medium" placeholder="Enter your full name" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Stage Name</label>
                    <input type="text" className="w-full px-6 py-4 bg-white rounded-xl border border-gray-100 focus:border-[#D4AF37] outline-none transition-all text-sm font-medium" placeholder="Optional" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Gender</label>
                    <select className="w-full px-6 py-4 bg-white rounded-xl border border-gray-100 focus:border-[#D4AF37] outline-none transition-all appearance-none text-sm font-medium">
                      <option>Female</option>
                      <option>Male</option>
                      <option>Non-binary</option>
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Primary Location</label>
                    <input type="text" className="w-full px-6 py-4 bg-white rounded-xl border border-gray-100 focus:border-[#D4AF37] outline-none transition-all text-sm font-medium" placeholder="City, State" />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Biography</label>
                  <textarea className="w-full px-6 py-4 bg-white rounded-xl border border-gray-100 focus:border-[#D4AF37] outline-none transition-all h-40 resize-none text-sm font-medium leading-relaxed" placeholder="Tell us about your professional experience..."></textarea>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center">
                    <Ruler className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold tracking-tight uppercase">Specs</h2>
                </div>
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Height (cm)</label>
                    <input type="number" className="w-full px-6 py-4 bg-white rounded-xl border border-gray-100 focus:border-[#D4AF37] outline-none transition-all text-sm font-medium" placeholder="e.g. 175" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Skin Tone</label>
                    <select className="w-full px-6 py-4 bg-white rounded-xl border border-gray-100 focus:border-[#D4AF37] outline-none transition-all appearance-none text-sm font-medium">
                      <option>Fair</option>
                      <option>Medium</option>
                      <option>Deep</option>
                      <option>Ebony</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Bust</label>
                    <input type="text" className="w-full px-6 py-4 bg-white rounded-xl border border-gray-100 focus:border-[#D4AF37] outline-none transition-all text-sm font-medium" placeholder='32"' />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Waist</label>
                    <input type="text" className="w-full px-6 py-4 bg-white rounded-xl border border-gray-100 focus:border-[#D4AF37] outline-none transition-all text-sm font-medium" placeholder='24"' />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Hips</label>
                    <input type="text" className="w-full px-6 py-4 bg-white rounded-xl border border-gray-100 focus:border-[#D4AF37] outline-none transition-all text-sm font-medium" placeholder='36"' />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center">
                    <Grid className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold tracking-tight uppercase">Specialization</h2>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {categories.map(cat => (
                    <label key={cat.id} className="relative group cursor-pointer">
                      <input type="checkbox" className="peer sr-only" />
                      <div className="p-5 bg-white rounded-xl border border-gray-100 peer-checked:border-[#D4AF37] peer-checked:bg-[#D4AF37]/5 transition-all flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-widest">{cat.name}</span>
                        <div className="w-4 h-4 rounded border border-gray-200 flex items-center justify-center peer-checked:bg-[#D4AF37] peer-checked:border-[#D4AF37] transition-all">
                          <Check className="w-2.5 h-2.5 text-white" />
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center">
                    <Camera className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold tracking-tight uppercase">Media</h2>
                </div>
                <div className="border border-dashed border-gray-200 rounded-2xl p-16 text-center hover:border-[#D4AF37] transition-all cursor-pointer group bg-white">
                  <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                    <Upload className="w-6 h-6 text-[#D4AF37]" />
                  </div>
                  <h3 className="text-sm font-bold uppercase tracking-widest mb-2">Upload Portfolio</h3>
                  <p className="text-gray-400 text-xs tracking-tight">Minimum 5 high-resolution captures (JPG, PNG)</p>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="aspect-[3/4] bg-white rounded-xl border border-gray-100 flex items-center justify-center">
                      <ImageIcon className="w-5 h-5 text-gray-100" />
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold tracking-tight uppercase">Logistics</h2>
                </div>
                <div className="space-y-12">
                  <div className="space-y-4">
                    <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Travel Availability</label>
                    <div className="flex gap-4">
                      {['National & International', 'Local Only'].map(opt => (
                        <label key={opt} className="flex-1 cursor-pointer">
                          <input type="radio" name="travel" className="peer sr-only" />
                          <div className="p-5 text-center bg-white rounded-xl border border-gray-100 peer-checked:border-[#D4AF37] peer-checked:bg-[#D4AF37]/5 text-xs font-bold uppercase tracking-widest transition-all">
                            {opt}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Standard Response Time</label>
                    <select className="w-full px-6 py-4 bg-white rounded-xl border border-gray-100 focus:border-[#D4AF37] outline-none transition-all appearance-none text-sm font-medium">
                      <option>Under 1 hour</option>
                      <option>Under 24 hours</option>
                      <option>1-3 working days</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-16 flex justify-between gap-4">
            {step > 1 ? (
              <Button variant="ghost" onClick={prevStep} className="flex items-center gap-2 uppercase text-[10px] tracking-widest font-bold">
                <ChevronLeft className="w-4 h-4" /> Back
              </Button>
            ) : <div />}
            
            {step < totalSteps ? (
              <Button onClick={nextStep} className="flex items-center gap-2 px-10 rounded-xl uppercase text-[10px] tracking-widest font-bold">
                Continue <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button variant="gold" onClick={() => window.location.href = '/model-dashboard'} className="px-10 rounded-xl font-bold uppercase text-[10px] tracking-widest py-4 shadow-xl shadow-[#D4AF37]/20">
                Finish & Go Live
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
