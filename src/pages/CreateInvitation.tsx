/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Calendar, Clock, Wallet, MapPin, FileText, 
  ChevronRight, ArrowLeft, Send, CheckCircle
} from 'lucide-react';
import { models } from '../data/mockData';
import { Button } from '../components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';

export const CreateInvitation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const model = models.find(m => m.id === id) || models[0];
  const [isSent, setIsSent] = useState(false);

  const handleSend = () => {
    setIsSent(true);
    setTimeout(() => navigate('/business-dashboard'), 2000);
  };

  return (
    <div className="bg-white min-h-screen pt-32 pb-24 px-6">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-12 hover:text-black transition-all">
          <ArrowLeft className="w-4 h-4" /> Return to Talent
        </button>

        <AnimatePresence mode="wait">
          {!isSent ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-16"
            >
              {/* Form */}
              <div className="lg:col-span-8">
                <div className="bg-[#FBFBFB] rounded-3xl p-12 border border-gray-100 shadow-sm">
                  <div className="text-[10px] uppercase font-bold text-gray-400 tracking-[0.3em] mb-4">Request</div>
                  <h1 className="text-4xl font-extrabold tracking-tighter uppercase mb-12">Send Invitation</h1>
                  
                  <div className="space-y-10">
                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1 flex items-center gap-2">
                          <Calendar className="w-3 h-3 text-[#D4AF37]" /> Job Date
                        </label>
                        <input type="date" className="w-full px-6 py-4 bg-white rounded-xl border border-gray-100 focus:border-[#D4AF37] outline-none transition-all text-sm font-medium" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1 flex items-center gap-2">
                          <Clock className="w-3 h-3 text-[#D4AF37]" /> Call Time
                        </label>
                        <input type="time" className="w-full px-6 py-4 bg-white rounded-xl border border-gray-100 focus:border-[#D4AF37] outline-none transition-all text-sm font-medium" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1 flex items-center gap-2">
                          <Wallet className="w-3 h-3 text-[#D4AF37]" /> Offer (₦)
                        </label>
                        <input type="text" className="w-full px-6 py-4 bg-white rounded-xl border border-gray-100 focus:border-[#D4AF37] outline-none transition-all text-sm font-medium" placeholder="e.g. 150,000" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1 flex items-center gap-2">
                          <MapPin className="w-3 h-3 text-[#D4AF37]" /> Location
                        </label>
                        <input type="text" className="w-full px-6 py-4 bg-white rounded-xl border border-gray-100 focus:border-[#D4AF37] outline-none transition-all text-sm font-medium" placeholder="Studio or Shoot Site" />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1 flex items-center gap-2">
                        <FileText className="w-3 h-3 text-[#D4AF37]" /> Job Brief
                      </label>
                      <textarea className="w-full px-6 py-4 bg-white rounded-xl border border-gray-100 focus:border-[#D4AF37] outline-none transition-all h-48 resize-none text-sm font-medium leading-relaxed" placeholder="Describe the creative direction, wardrobe, and deliverables..."></textarea>
                    </div>

                    <Button variant="primary" size="lg" className="w-full py-5 rounded-xl font-bold uppercase text-xs tracking-[0.2em] group" onClick={handleSend}>
                      Dispatch Invitation <Send className="w-4 h-4 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Sidebar / Preview */}
              <div className="lg:col-span-4 space-y-10">
                <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                  <div className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-6 border-b border-gray-50 pb-2">Talent Profile</div>
                  <div className="flex items-center gap-4 mb-8">
                    <img src={model.profileImage} className="w-16 h-16 rounded-xl object-cover shadow-sm" alt={model.name} referrerPolicy="no-referrer" />
                    <div>
                      <h4 className="text-sm font-bold uppercase tracking-tight">{model.name}</h4>
                      <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">{model.location}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-[10px] text-green-600 font-bold uppercase tracking-widest">
                      <CheckCircle className="w-4 h-4" /> Identity Verified
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-green-600 font-bold uppercase tracking-widest">
                      <CheckCircle className="w-4 h-4" /> Pro Responder
                    </div>
                  </div>
                </div>

                <div className="bg-[#111111] text-white rounded-2xl p-8 shadow-xl shadow-black/10">
                  <h3 className="text-sm font-bold uppercase tracking-widest mb-4">Secure Booking</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    BookAModel protects both parties. Payments are secured in escrow and only released after the professional engagement is verified.
                  </p>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl p-24 shadow-2xl text-center border border-gray-100"
            >
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-10">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-4xl font-extrabold tracking-tighter uppercase mb-6">Invitation Sent</h2>
              <p className="text-gray-400 max-w-sm mx-auto text-sm font-medium mb-12">
                Your request has been securely delivered to {model.name}. You'll be notified immediately upon their response.
              </p>
              <div className="flex items-center justify-center gap-2 text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.2em]">
                Returning to Dashboard <ChevronRight className="w-4 h-4 animate-pulse" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
