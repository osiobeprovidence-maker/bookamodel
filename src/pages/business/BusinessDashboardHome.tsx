/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { Send, Heart, Calendar, TrendingUp, Bell, Users, Wallet, Trophy, Clock, ArrowUpRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { businessInvitations, businessModels, monthlyData, recentActivity } from '../../data/businessData';
import { cn } from '../../lib/utils';
import { useUser } from '../../contexts/UserContext';

export const BusinessDashboardHome = () => {
  const { user } = useUser();

  const stats = [
    { label: 'Active Invitations', value: '12', change: '+2', icon: Send, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Saved Models', value: '45', change: '+12', icon: Heart, color: 'text-pink-600', bg: 'bg-pink-50' },
    { label: 'Jobs Completed', value: '28', change: '+5', icon: Calendar, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Total Spent', value: '\u20A64.2M', change: '+\u20A6800k', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  const recentInvites = businessInvitations.slice(0, 5);
  const recommendedModels = businessModels.slice(0, 4);

  const upcomingJobs = [
    { name: 'GTBank Fashion Week', date: 'Aug 15, 2026', location: 'Eko Hotel, Lagos', models: 8 },
    { name: 'Nike Air Max Launch', date: 'Sep 1, 2026', location: 'Abuja Convention Center', models: 5 },
  ];

  return (
    <div>
      <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-black mb-1">Welcome back, {user?.name || 'Nike'}!</h1>
          <p className="text-gray-500 font-medium">Here&apos;s what&apos;s happening with your bookings today.</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-black/5 relative hover:shadow-md transition-all">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
          </button>
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.06 }}
            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={cn("p-2.5 rounded-xl", stat.bg)}>
                <stat.icon className={cn("w-4 h-4", stat.color)} />
              </div>
              <div className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                {stat.change}
              </div>
            </div>
            <p className="text-gray-400 text-[10px] uppercase font-bold tracking-widest mb-1">{stat.label}</p>
            <h3 className="text-2xl font-extrabold tracking-tight">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        {/* Recent Invitations */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="lg:col-span-2 bg-white rounded-2xl p-8 border border-gray-100 shadow-sm"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold tracking-tight">Recent Invitations</h3>
            <button className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest">View All</button>
          </div>
          <div className="space-y-4">
            {recentInvites.map((invite) => (
              <div key={invite.id} className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-all">
                <div className="flex items-center gap-4">
                  <img src={invite.modelImage} className="w-12 h-12 rounded-lg object-cover shadow-sm" alt={invite.modelName} />
                  <div>
                    <h4 className="font-bold text-sm tracking-tight">{invite.modelName}</h4>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{invite.campaign} \u2022 {invite.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm font-bold tracking-tight">{invite.payment}</p>
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                      invite.status === 'Accepted' ? 'bg-green-50 text-green-700' :
                      invite.status === 'Pending' ? 'bg-yellow-50 text-yellow-700' :
                      'bg-gray-100 text-gray-500'
                    )}>
                      {invite.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recommended Models */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="lg:col-span-1 bg-white rounded-2xl p-8 border border-gray-100 shadow-sm"
        >
          <h3 className="text-lg font-bold tracking-tight mb-8">Recommended</h3>
          <div className="space-y-6">
            {recommendedModels.map((model) => (
              <div key={model.id} className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <img src={model.image} className="w-10 h-10 rounded-lg object-cover shadow-sm" alt={model.name} />
                  <div>
                    <h4 className="text-xs font-bold tracking-tight">{model.name}</h4>
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{model.location} \u2022 {model.category}</p>
                  </div>
                </div>
                <button className="px-4 py-2 text-[10px] font-bold uppercase border border-gray-200 rounded-lg hover:bg-gray-50 transition-all min-h-[44px]">
                  View
                </button>
              </div>
            ))}
            <button className="w-full bg-[#D4AF37] text-white py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#c9a430] transition-all active:scale-95 shadow-md">
              Discover More
            </button>
          </div>
        </motion.div>
      </div>

      {/* Charts */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.35 }}
        className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm mb-10"
      >
        <h3 className="text-lg font-bold tracking-tight mb-6">Analytics Overview</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fontWeight: 700 }} />
            <YAxis tick={{ fontSize: 12, fontWeight: 700 }} />
            <Tooltip
              contentStyle={{ borderRadius: '12px', border: '1px solid #f0f0f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
            />
            <Line type="monotone" dataKey="invitations" stroke="#D4AF37" strokeWidth={2} dot={{ r: 4 }} name="Invitations" />
            <Line type="monotone" dataKey="hires" stroke="#111111" strokeWidth={2} dot={{ r: 4 }} name="Hires" />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm"
        >
          <h3 className="text-lg font-bold tracking-tight mb-8">Recent Activity</h3>
          <div className="space-y-6">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                  activity.icon === 'check' ? 'bg-green-50 text-green-600' :
                  activity.icon === 'users' ? 'bg-blue-50 text-blue-600' :
                  activity.icon === 'wallet' ? 'bg-purple-50 text-purple-600' :
                  activity.icon === 'send' ? 'bg-orange-50 text-orange-600' :
                  'bg-yellow-50 text-yellow-600'
                )}>
                  {activity.icon === 'check' && <Trophy className="w-4 h-4" />}
                  {activity.icon === 'users' && <Users className="w-4 h-4" />}
                  {activity.icon === 'wallet' && <Wallet className="w-4 h-4" />}
                  {activity.icon === 'send' && <Send className="w-4 h-4" />}
                  {activity.icon === 'trophy' && <Trophy className="w-4 h-4" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#111111]">{activity.message}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Upcoming Jobs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.45 }}
          className="bg-[#111111] text-white rounded-2xl p-8 shadow-xl"
        >
          <h3 className="text-lg font-bold tracking-tight mb-8">Upcoming Jobs</h3>
          <div className="space-y-4">
            {upcomingJobs.map((job, i) => (
              <div key={i} className="p-4 bg-white/5 rounded-xl border border-white/5">
                <p className="text-[10px] text-[#D4AF37] font-bold uppercase tracking-[0.2em] mb-1">{job.date}</p>
                <h4 className="font-bold text-sm tracking-tight">{job.name}</h4>
                <p className="text-xs text-gray-400 mt-1">{job.location} \u2022 {job.models} models</p>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 bg-[#D4AF37] text-white py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#c9a430] transition-all active:scale-95">
            View Calendar
          </button>
        </motion.div>
      </div>
    </div>
  );
};
