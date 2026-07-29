/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'framer-motion';
import {
  Users,
  Briefcase,
  Calendar,
  DollarSign,
  ShieldCheck,
  CalendarCheck,
  UserPlus,
  Ban,
} from 'lucide-react';
import {
  adminStats,
  adminModels,
  adminBookings,
  categoryStats,
  topCities,
  recentActivity,
  monthlyBookingData,
} from '../../data/adminData';
import { AdminStatsCard } from '../../components/admin/AdminStatsCard';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function AdminDashboard() {
  const maxBookings = Math.max(...monthlyBookingData.map((m) => m.bookings));
  const maxCityCount = Math.max(...topCities.map((c) => c.count));
  const latestModels = [...adminModels]
    .sort((a, b) => new Date(b.joinedDate).getTime() - new Date(a.joinedDate).getTime())
    .slice(0, 5);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold text-[#111111] dark:text-white">Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Overview of your platform performance
        </p>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatsCard
          title="Total Models"
          value={adminStats.totalModels}
          icon={Users}
          change="+12% this month"
          changeType="positive"
        />
        <AdminStatsCard
          title="Total Businesses"
          value={adminStats.totalBusinesses}
          icon={Briefcase}
          change="+8% this month"
          changeType="positive"
        />
        <AdminStatsCard
          title="Total Bookings"
          value={adminStats.totalBookings.toLocaleString()}
          icon={Calendar}
          change="+15% this month"
          changeType="positive"
        />
        <AdminStatsCard
          title="Total Revenue"
          value={adminStats.totalRevenue}
          icon={DollarSign}
          color="bg-green-500/10 text-green-600"
          change="+13% this month"
          changeType="positive"
        />
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatsCard
          title="Pending Verification"
          value={adminStats.pendingVerification}
          icon={ShieldCheck}
          color="bg-orange-500/10 text-orange-500"
          change="Needs review"
          changeType="neutral"
        />
        <AdminStatsCard
          title="Available Today"
          value={adminStats.availableToday}
          icon={CalendarCheck}
          color="bg-blue-500/10 text-blue-500"
          change="Active today"
          changeType="positive"
        />
        <AdminStatsCard
          title="Today's Signups"
          value={adminStats.todaySignups}
          icon={UserPlus}
          color="bg-purple-500/10 text-purple-500"
          change="New users"
          changeType="neutral"
        />
        <AdminStatsCard
          title="Suspended Models"
          value={adminStats.suspendedModels}
          icon={Ban}
          color="bg-red-500/10 text-red-500"
          change="Action taken"
          changeType="negative"
        />
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
          <p className="text-[10px] uppercase font-bold text-gray-400 tracking-[0.3em] mb-6">
            Booking Trends
          </p>
          <div className="flex items-end gap-1.5 h-48">
            {monthlyBookingData.map((m) => (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-[9px] font-bold text-gray-400 dark:text-gray-500">
                  {m.bookings}
                </span>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(m.bookings / maxBookings) * 100}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut', delay: 0.3 }}
                  className="w-full rounded-t-md bg-gradient-to-t from-[#D4AF37] to-[#E8C84A] min-h-[4px]"
                />
                <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500">
                  {m.month}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
          <p className="text-[10px] uppercase font-bold text-gray-400 tracking-[0.3em] mb-6">
            Top Cities
          </p>
          <div className="space-y-4">
            {topCities.map((c, i) => (
              <div key={c.city} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[#111111] dark:text-white">
                    {c.city}
                  </span>
                  <span className="text-xs font-bold text-gray-400 dark:text-gray-500">
                    {c.count} models
                  </span>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(c.count / maxCityCount) * 100}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut', delay: 0.3 + i * 0.08 }}
                    className="h-full rounded-full bg-gradient-to-r from-[#D4AF37] to-[#E8C84A]"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
          <p className="text-[10px] uppercase font-bold text-gray-400 tracking-[0.3em] mb-5">
            Recent Activity
          </p>
          <div className="space-y-4">
            {recentActivity.slice(0, 8).map((a) => (
              <div key={a.id} className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-[#D4AF37] mt-1.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#111111] dark:text-white">
                    <span className="font-medium">{a.action}</span>{' '}
                    <span className="text-gray-500 dark:text-gray-400">{a.target}</span>
                  </p>
                  <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                    {a.admin} &middot;{' '}
                    {new Date(a.timestamp).toLocaleDateString('en-NG', {
                      month: 'short',
                      day: 'numeric',
                    })}{' '}
                    {new Date(a.timestamp).toLocaleTimeString('en-NG', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
          <p className="text-[10px] uppercase font-bold text-gray-400 tracking-[0.3em] mb-5">
            Latest Models
          </p>
          <div className="space-y-4">
            {latestModels.map((m) => (
              <div key={m.id} className="flex items-center gap-3">
                <img
                  src={m.image}
                  alt={m.name}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100 dark:ring-gray-800"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#111111] dark:text-white truncate">
                    {m.name}
                  </p>
                  <p className="text-[11px] text-gray-400 dark:text-gray-500">
                    {m.city} &middot; {m.categories[0]}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-yellow-500">&#9733;</span>
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    {m.rating}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
