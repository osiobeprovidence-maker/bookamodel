import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { Mail, MessageSquare, MapPin, Phone, Send, Instagram, Twitter, Linkedin } from 'lucide-react';

export const ContactPage = () => {
  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <section className="pt-40 pb-20 px-6 border-b border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-[10px] uppercase font-bold text-[#D4AF37] tracking-[0.4em] mb-4">Contact</div>
          <h1 className="text-6xl md:text-8xl font-extrabold tracking-tighter uppercase mb-6">Let's Connect</h1>
          <p className="text-xl text-gray-400 max-w-xl font-medium leading-relaxed">
            Our support team is active 24/7. Reach out for assistance, partnership inquiries, or media requests.
          </p>
        </div>
      </section>

      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-24">
          {/* Info */}
          <div className="lg:col-span-5 space-y-16">
            <div className="space-y-10">
              <div className="flex items-start gap-6">
                <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Email</h3>
                  <p className="text-xl font-bold">hello@bookamodel.ng</p>
                </div>
              </div>
              <div className="flex items-start gap-6">
                <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center shrink-0">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">WhatsApp Support</h3>
                  <p className="text-xl font-bold">+234 (0) 800 555 1234</p>
                </div>
              </div>
              <div className="flex items-start gap-6">
                <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Studio Office</h3>
                  <p className="text-xl font-bold">Level 4, Creative Hub, <br />Victoria Island, Lagos</p>
                </div>
              </div>
            </div>

            <div className="pt-10 border-t border-gray-100">
              <h3 className="text-[10px] uppercase font-bold text-gray-400 tracking-[0.4em] mb-8">Follow Our Story</h3>
              <div className="flex gap-6">
                {[Instagram, Twitter, Linkedin].map((Icon, i) => (
                  <a key={i} href="#" className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center hover:bg-[#D4AF37] hover:text-white transition-all">
                    <Icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-7">
            <div className="bg-[#FBFBFB] rounded-3xl p-12 border border-gray-100 shadow-sm">
              <form className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Your Name</label>
                    <input type="text" className="w-full px-6 py-4 bg-white rounded-xl border border-gray-100 focus:border-[#D4AF37] outline-none transition-all text-sm font-medium" placeholder="Full name" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Email Address</label>
                    <input type="email" className="w-full px-6 py-4 bg-white rounded-xl border border-gray-100 focus:border-[#D4AF37] outline-none transition-all text-sm font-medium" placeholder="name@company.com" />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Inquiry Type</label>
                  <select className="w-full px-6 py-4 bg-white rounded-xl border border-gray-100 focus:border-[#D4AF37] outline-none transition-all appearance-none text-sm font-medium">
                    <option>General Support</option>
                    <option>Talent Verification</option>
                    <option>Business Partnership</option>
                    <option>Media & Press</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Message</label>
                  <textarea className="w-full px-6 py-4 bg-white rounded-xl border border-gray-100 focus:border-[#D4AF37] outline-none transition-all h-48 resize-none text-sm font-medium leading-relaxed" placeholder="How can we help?"></textarea>
                </div>
                <Button className="w-full py-5 rounded-xl font-bold uppercase text-xs tracking-[0.2em] group">
                  Send Message <Send className="w-4 h-4 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Map Placeholder */}
      <section className="h-[500px] bg-gray-100 relative grayscale grayscale-hover-none transition-all duration-700">
        <div className="absolute inset-0 bg-black/5 flex items-center justify-center">
          <div className="bg-white px-8 py-4 rounded-xl shadow-2xl flex items-center gap-4">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-ping" />
            <span className="text-xs font-bold uppercase tracking-widest">Our Lagos HQ</span>
          </div>
        </div>
        <img src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5ce?q=80&w=1200&auto=format&fit=crop" className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
      </section>
    </div>
  );
};
