/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  Send, Heart, Calendar, Bell,
  TrendingUp, Eye, CheckCircle, 
  Wallet, Trophy, ChevronRight, AlertCircle, ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { cn } from '../../lib/utils';
import { useUser } from '../../contexts/UserContext';

export const ModelDashboardHome = () => {
  const { convexUser } = useUser();
  const stats = [
    { label: 'Profile Views', value: '1,284', change: '+12%', icon: Eye, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'New Invitations', value: '8', change: 'New', icon: Send, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Success Rate', value: '98%', change: '+2%', icon: Trophy, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'Pending Payouts', value: '\u20A685k', change: '+\u20A620k', icon: Wallet, color: 'text-green-600', bg: 'bg-green-50' },
  ];

  return (
    <div>
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-black mb-1">Hi, Chioma!</h1>
          <p className="text-gray-500 font-medium">Your profile is getting <span className="text-green-500 font-bold">24% more views</span> this week.</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-black/5">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs font-bold">Visible to Brands</span>
          </div>
        </div>
      </header>

      {convexUser && !convexUser.profileCompleted && (
        <div className="bg-gradient-to-r from-[#D4AF37]/10 to-[#D4AF37]/5 border border-[#D4AF37]/20 rounded-2xl p-5 mb-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-[#D4AF37] shrink-0" />
            <p className="text-sm font-medium text-[#111111]">Complete your profile to increase your visibility to brands.</p>
          </div>
          <Link
            to="/model-dashboard/profile"
            className="shrink-0 bg-[#D4AF37] text-white px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-[#c9a430] transition-all flex items-center gap-1.5"
          >
            Complete Profile <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className={cn("p-2.5 rounded-xl", stat.bg)}>
                <stat.icon className={cn("w-4 h-4", stat.color)} />
              </div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.change}</div>
            </div>
            <p className="text-gray-400 text-[10px] uppercase font-bold tracking-widest mb-1">{stat.label}</p>
            <h3 className="text-2xl font-extrabold tracking-tight">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Feed */}
        <div className="lg:col-span-2 space-y-8">
          {/* Profile Completion */}
          <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm overflow-hidden relative">
            <div className="relative z-10">
              <h3 className="text-lg font-bold tracking-tight mb-2">Profile Strength</h3>
              <p className="text-gray-400 text-sm mb-6">Complete your profile to appear higher in search results.</p>
              <div className="flex items-center gap-4 mb-2">
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#D4AF37] w-[85%]" />
                </div>
                <span className="text-xs font-extrabold text-[#D4AF37]">85%</span>
              </div>
              <div className="flex flex-wrap items-center gap-6 mt-6">
                <div className="flex items-center gap-2 text-[10px] text-green-600 font-bold uppercase tracking-wider">
                  <CheckCircle className="w-4 h-4" /> Portfolio Uploaded
                </div>
                <div className="flex items-center gap-2 text-[10px] text-green-600 font-bold uppercase tracking-wider">
                  <CheckCircle className="w-4 h-4" /> Identity Verified
                </div>
                <button className="text-[10px] text-black font-bold underline uppercase tracking-wider">Add Measurements (+15%)</button>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold tracking-tight mb-8">Recent Activity</h3>
            <div className="space-y-8">
              {[
                { title: 'New Invitation', desc: 'Zara Nigeria sent you a project invite', time: '2h ago', icon: Send, color: 'bg-blue-50 text-blue-600' },
                { title: 'Profile View', desc: 'A creative director from Lagos viewed your profile', time: '5h ago', icon: Eye, color: 'bg-purple-50 text-purple-600' },
                { title: 'Payment Received', desc: '\u20A645,000 for "Native Wear Shoot" processed', time: '1d ago', icon: Wallet, color: 'bg-green-50 text-green-600' },
              ].map((activity, i) => (
                <div key={i} className="flex gap-4">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm", activity.color)}>
                    <activity.icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-sm tracking-tight">{activity.title}</h4>
                      <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">{activity.time}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{activity.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#111111] text-white rounded-2xl p-8 shadow-xl shadow-black/10">
            <h3 className="text-lg font-bold tracking-tight mb-6">Upcoming Jobs</h3>
            <div className="space-y-4">
              <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                <p className="text-[10px] text-[#D4AF37] font-bold uppercase tracking-[0.2em] mb-1">TOMORROW \u2022 10:00 AM</p>
                <h4 className="font-bold text-sm tracking-tight">Glow Skincare Shoot</h4>
                <p className="text-xs text-gray-400 mt-1">Lekki Phase 1, Lagos</p>
              </div>
              <div className="p-4 bg-white/5 rounded-xl border border-white/5 opacity-50">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mb-1">JUN 24 \u2022 02:00 PM</p>
                <h4 className="font-bold text-sm tracking-tight">Fashion Week Casting</h4>
                <p className="text-xs text-gray-400 mt-1">Eko Hotel, VI</p>
              </div>
            </div>
            <Button variant="gold" className="w-full mt-6 rounded-xl font-bold uppercase text-[10px] tracking-widest py-4">View Calendar</Button>
          </div>

          <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold tracking-tight mb-6">Tips for Success</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 group cursor-pointer">
                <div className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full mt-2 shrink-0" />
                <p className="text-xs text-gray-500 font-medium leading-relaxed group-hover:text-black">Update your portfolio regularly with high-res photos.</p>
              </li>
              <li className="flex items-start gap-3 group cursor-pointer">
                <div className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full mt-2 shrink-0" />
                <p className="text-xs text-gray-500 font-medium leading-relaxed group-hover:text-black">Respond to invitations within 2 hours to get badges.</p>
              </li>
            </ul>
            <button className="mt-8 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all">
              Read all tips <ChevronRight className="w-4 h-4 text-[#D4AF37]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
