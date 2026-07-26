/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Check, Zap, Star, ShieldCheck, Heart } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { cn } from '../lib/utils';

export const Pricing = () => {
  const plans = [
    {
      name: 'Free',
      price: '₦0',
      description: 'Perfect for getting started and building your presence.',
      features: [
        'Basic profile page',
        'Receive unlimited invitations',
        'Appear in basic search',
        'Upload up to 5 portfolio photos',
        'Email notifications',
        'Standard response time badge'
      ],
      cta: 'Start Free',
      variant: 'secondary'
    },
    {
      name: 'Pro',
      price: '₦15,000',
      period: '/ month',
      description: 'Designed for professionals who want to stand out and earn more.',
      features: [
        'Priority search ranking',
        'Verified PRO badge',
        'Unlimited portfolio uploads',
        'WhatsApp visible to businesses',
        'Featured profile placement',
        'Instant SMS & Push notifications',
        'Advanced analytics & profile views',
        'Highlighted profile card'
      ],
      cta: 'Get Pro Now',
      variant: 'gold',
      popular: true
    }
  ];

  return (
    <div className="bg-white min-h-screen pt-32 pb-24 px-6">
      <div className="max-w-7xl mx-auto text-center mb-32">
        <div className="text-[10px] uppercase font-bold text-[#D4AF37] tracking-[0.4em] mb-4">Investment</div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter uppercase mb-6">Elevate Your Career</h1>
        <p className="text-lg text-gray-400 max-w-xl mx-auto font-medium">
          Professional tools for professional talent. Choose the plan that scales with your ambition.
        </p>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 mb-32">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={cn(
              "p-12 rounded-[2rem] border border-gray-100 flex flex-col transition-all duration-500",
              plan.popular ? "bg-[#111111] text-white shadow-2xl shadow-black/20 ring-1 ring-white/10" : "bg-[#FBFBFB] text-black"
            )}
          >
            <div className="mb-10 flex justify-between items-start">
              <div>
                <div className={cn("text-[10px] uppercase font-bold tracking-[0.2em] mb-4", plan.popular ? "text-[#D4AF37]" : "text-gray-400")}>
                  {plan.name} Membership
                </div>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-5xl font-extrabold tracking-tight">{plan.price}</span>
                  {plan.period && <span className={cn("text-xs font-bold uppercase tracking-widest", plan.popular ? "text-gray-500" : "text-gray-400")}>{plan.period}</span>}
                </div>
              </div>
              {plan.popular && (
                <div className="bg-[#D4AF37] text-white px-3 py-1 rounded-full text-[9px] font-black tracking-tighter uppercase">
                  Featured
                </div>
              )}
            </div>

            <p className={cn("text-sm leading-relaxed mb-12", plan.popular ? "text-gray-400" : "text-gray-500")}>
              {plan.description}
            </p>

            <div className="flex-1 space-y-5 mb-12">
              {plan.features.map((feature) => (
                <div key={feature} className="flex items-center gap-4 group">
                  <div className={cn("w-5 h-5 rounded-full flex items-center justify-center shrink-0", plan.popular ? "bg-white/10 text-[#D4AF37]" : "bg-black/5 text-[#D4AF37]")}>
                    <Check className="w-3 h-3" />
                  </div>
                  <span className={cn("text-xs font-bold uppercase tracking-wider", plan.popular ? "text-gray-200" : "text-gray-600")}>{feature}</span>
                </div>
              ))}
            </div>

            <Button
              variant={plan.variant as any}
              className={cn(
                "w-full py-5 rounded-xl font-bold uppercase text-[11px] tracking-[0.2em] transition-transform active:scale-[0.98]",
                plan.popular ? "bg-[#D4AF37] text-white hover:bg-[#C5A028]" : "bg-black text-white"
              )}
            >
              {plan.cta}
            </Button>
          </div>
        ))}
      </div>

      {/* Comparison Table */}
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h3 className="text-2xl font-extrabold tracking-tight uppercase">Detailed Comparison</h3>
        </div>
        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="p-8 text-[10px] font-bold uppercase tracking-widest text-gray-400">Features</th>
                <th className="p-8 text-center text-[10px] font-bold uppercase tracking-widest text-gray-400">Standard</th>
                <th className="p-8 text-center text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]">Premium</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {[
                { name: 'Profile Visibility', free: 'Basic Search', pro: 'High (Featured)' },
                { name: 'Direct Contact', free: 'Standard', pro: 'Instant WhatsApp' },
                { name: 'Verification Badge', free: 'Basic', pro: 'Gold PRO Shield' },
                { name: 'Booking Commission', free: '5%', pro: '0%' },
                { name: 'Portfolio Uploads', free: '10 Photos', pro: 'Unlimited 4K' },
                { name: 'Response Badges', free: 'Standard', pro: 'Fast Responder' },
              ].map((row) => (
                <tr key={row.name} className="group hover:bg-gray-50/50 transition-all">
                  <td className="p-8 text-xs font-bold uppercase tracking-tight text-gray-700">{row.name}</td>
                  <td className="p-8 text-center text-xs text-gray-400 font-medium">{row.free}</td>
                  <td className="p-8 text-center text-xs font-extrabold text-[#D4AF37]">{row.pro}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
