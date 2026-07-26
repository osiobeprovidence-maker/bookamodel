import { motion } from 'motion/react';
import { Search, ChevronRight, BookOpen, Star, Shield, HelpCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const HelpPage = () => {
  const categories = [
    { icon: Star, name: 'Getting Started', desc: 'New to BookAModel? Start here.' },
    { icon: Shield, name: 'Trust & Safety', desc: 'Learn about our escrow and verification.' },
    { icon: BookOpen, name: 'Booking Guide', desc: 'How to hire and get hired successfully.' },
    { icon: HelpCircle, name: 'Account Help', desc: 'Managing your profile and settings.' },
  ];

  const faqs = [
    { q: "How do I get verified?", a: "To get verified, you need to upload at least 5 professional photos and complete your Spec sheet. Our team reviews profiles within 48 hours." },
    { q: "How does the payment system work?", a: "Brands pay into our secure escrow system when booking. Funds are released to the model 24 hours after the job is successfully completed." },
    { q: "What are the platform fees?", a: "Models on the Pro plan pay 0% commission. Free tier models have a small 5% service fee per booking." },
  ];

  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
      <section className="pt-40 pb-24 px-6 bg-[#FBFBFB] border-b border-gray-100">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-[10px] uppercase font-bold text-[#D4AF37] tracking-[0.4em] mb-6">Support Center</div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter uppercase mb-12">How can we <br /> help you?</h1>
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search for articles, guides..." 
              className="w-full pl-16 pr-8 py-6 bg-white rounded-2xl border border-gray-100 shadow-xl shadow-black/5 outline-none focus:border-[#D4AF37] transition-all font-medium"
            />
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((cat) => (
            <div key={cat.name} className="p-10 bg-white border border-gray-100 rounded-3xl hover:border-[#D4AF37] hover:shadow-xl transition-all group cursor-pointer">
              <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-[#D4AF37]/10 group-hover:scale-110 transition-all">
                <cat.icon className="w-6 h-6 text-black group-hover:text-[#D4AF37]" />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-widest mb-4">{cat.name}</h3>
              <p className="text-xs text-gray-400 font-medium leading-relaxed mb-6">{cat.desc}</p>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]">
                Learn More <ChevronRight className="w-3 h-3" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-6 bg-[#FBFBFB]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight uppercase">Common Questions</h2>
          </div>
          <div className="space-y-6">
            {faqs.map((faq) => (
              <div key={faq.q} className="bg-white p-8 rounded-2xl border border-gray-100">
                <h4 className="text-sm font-bold uppercase tracking-tight mb-4">{faq.q}</h4>
                <p className="text-xs text-gray-400 font-medium leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-32 px-6 text-center">
        <div className="max-w-xl mx-auto">
          <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto mb-8">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight uppercase mb-6">Still need help?</h2>
          <p className="text-gray-400 font-medium mb-10">Our specialists are available for real-time consultation.</p>
          <Button variant="outline" className="px-10 py-5 rounded-xl uppercase text-[10px] tracking-widest font-bold">Contact Support</Button>
        </div>
      </section>
    </div>
  );
};

const MessageSquare = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
);
