import { motion } from 'motion/react';
import { Button } from '../components/ui/Button';
import { Star, Shield, Users, Globe } from 'lucide-react';

export const AboutPage = () => {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
      <section className="pt-40 pb-24 px-6 border-b border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-[10px] uppercase font-bold text-[#D4AF37] tracking-[0.4em] mb-4">Our Vision</div>
          <h1 className="text-6xl md:text-8xl font-extrabold tracking-tighter uppercase leading-[0.9] mb-12">
            The Future of <br />
            Talent Discovery
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl font-medium leading-relaxed">
            BookAModel is Nigeria's premier digital talent hub. We've eliminated the traditional barriers between world-class talent and global brands, creating a direct, secure, and transparent ecosystem.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-24 px-6 bg-[#FBFBFB]">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12">
          {[
            { label: 'Verified Models', value: '5,000+' },
            { label: 'Active Brands', value: '1,200+' },
            { label: 'Successful Bookings', value: '15,000+' },
            { label: 'Cities Covered', value: '36' },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-4xl font-extrabold tracking-tight mb-2">{stat.value}</div>
              <div className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Mission */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <div>
            <div className="text-[10px] uppercase font-bold text-gray-400 tracking-[0.3em] mb-6">Our Mission</div>
            <h2 className="text-4xl font-extrabold tracking-tight uppercase mb-8">Empowering Creativity</h2>
            <div className="space-y-6 text-gray-500 font-medium">
              <p>
                We believe that talent should be accessible, and opportunities should be merit-based. By providing a platform that handles the complexities of discovery, booking, and payment, we allow models and brands to focus on what they do best: creating.
              </p>
              <p>
                Founded in Lagos, we understand the unique challenges and vibrant opportunities within the African creative industry. Our platform is built to scale these opportunities to the global stage.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="aspect-[3/4] bg-gray-100 rounded-3xl overflow-hidden grayscale hover:grayscale-0 transition-all duration-700">
              <img src="https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=600&auto=format&fit=crop" className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
            </div>
            <div className="aspect-[3/4] bg-gray-100 rounded-3xl overflow-hidden mt-12 grayscale hover:grayscale-0 transition-all duration-700">
              <img src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=600&auto=format&fit=crop" className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-32 px-6 bg-[#111111] text-white overflow-hidden relative">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-[10px] uppercase font-bold text-[#D4AF37] tracking-[0.4em] mb-12">Core Principles</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            {[
              { 
                icon: Shield, 
                title: 'Transparency', 
                desc: 'No hidden fees. No middleman bias. Direct contact between talent and client with clear pricing structures.' 
              },
              { 
                icon: Users, 
                title: 'Diversity', 
                desc: 'Celebrating every look, size, and background. Our categories reflect the true spectrum of Nigerian beauty.' 
              },
              { 
                icon: Globe, 
                title: 'Global Reach', 
                desc: 'Connecting local talent with international opportunities. Lagos to London, Abuja to New York.' 
              }
            ].map((value) => (
              <div key={value.title} className="space-y-6">
                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                  <value.icon className="w-6 h-6 text-[#D4AF37]" />
                </div>
                <h3 className="text-xl font-bold uppercase tracking-tight">{value.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#D4AF37]/5 to-transparent" />
      </section>

      {/* CTA */}
      <section className="py-32 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-extrabold tracking-tighter uppercase mb-8">Ready to transform <br /> your professional journey?</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="px-12 py-6 rounded-xl uppercase text-xs font-bold tracking-[0.2em]">Join as Talent</Button>
            <Button size="lg" variant="secondary" className="px-12 py-6 rounded-xl uppercase text-xs font-bold tracking-[0.2em]">Hire Talent</Button>
          </div>
        </div>
      </section>
    </div>
  );
};
