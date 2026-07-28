import { motion } from 'motion/react';
import { Send, Heart, Calendar, TrendingUp, AlertCircle, ArrowRight, Search } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useUser } from '../../contexts/UserContext';
import { cn } from '../../lib/utils';

export const BusinessDashboardHome = () => {
  const { convexUser } = useUser();
  const navigate = useNavigate();
  const dashboardData = useQuery(
    api.dashboard.getBusinessDashboardData,
    convexUser ? { userId: convexUser._id as any } : 'skip'
  );

  if (!convexUser || !dashboardData) {
    return <SkeletonLoading />;
  }

  const { user, businessProfile, stats, recentInvitations, upcomingBookings } = dashboardData;

  const formatCurrency = (amount: number) => {
    if (amount >= 1_000_000) return `₦${(amount / 1_000_000).toFixed(1)}M`;
    if (amount >= 1_000) return `₦${(amount / 1_000).toFixed(0)}k`;
    return `₦${amount}`;
  };

  const statCards = [
    { label: 'Active Invitations', value: String(stats.activeInvitations), icon: Send, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Saved Models', value: String(stats.savedModelsCount), icon: Heart, color: 'text-pink-600', bg: 'bg-pink-50' },
    { label: 'Jobs Completed', value: String(stats.completedJobs), icon: Calendar, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Total Spent', value: formatCurrency(stats.totalSpent), icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div>
      <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-black mb-1">Welcome back, {user.name}!</h1>
          <p className="text-gray-500 font-medium">Here&apos;s what&apos;s happening with your bookings today.</p>
        </div>
        <div className="flex items-center gap-4">
          <Link
            to="/business-dashboard/search"
            className="bg-[#D4AF37] text-white px-5 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-[#c9a430] transition-all flex items-center gap-2"
          >
            <Search className="w-4 h-4" /> Find Models
          </Link>
        </div>
      </header>

      {!businessProfile?.profileCompleted && (
        <div className="bg-gradient-to-r from-[#D4AF37]/10 to-[#D4AF37]/5 border border-[#D4AF37]/20 rounded-2xl p-5 mb-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-[#D4AF37] shrink-0" />
            <p className="text-sm font-medium text-[#111111]">Complete your business profile to attract more models.</p>
          </div>
          <Link
            to="/business-dashboard/settings"
            className="shrink-0 bg-[#D4AF37] text-white px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-[#c9a430] transition-all flex items-center gap-1.5"
          >
            Complete Profile <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.06 }}
            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={cn('p-2.5 rounded-xl', stat.bg)}>
                <stat.icon className={cn('w-4 h-4', stat.color)} />
              </div>
            </div>
            <p className="text-gray-400 text-[10px] uppercase font-bold tracking-widest mb-1">{stat.label}</p>
            <h3 className="text-2xl font-extrabold tracking-tight">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="lg:col-span-2 bg-white rounded-2xl p-8 border border-gray-100 shadow-sm"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold tracking-tight">Recent Invitations</h3>
            <button onClick={() => navigate('/business-dashboard/invitations')} className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest">
              View All
            </button>
          </div>
          {recentInvitations.length > 0 ? (
            <div className="space-y-4">
              {recentInvitations.map((invite) => (
                <div key={invite._id} className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
                      <Send className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm tracking-tight">{invite.title}</h4>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                        {new Date(invite.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={cn(
                      'px-2 py-0.5 rounded-full text-[10px] font-bold uppercase',
                      invite.status === 'accepted' ? 'bg-green-50 text-green-700' :
                      invite.status === 'pending' ? 'bg-yellow-50 text-yellow-700' :
                      'bg-gray-100 text-gray-500'
                    )}>
                      {invite.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Send className="w-8 h-8 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 text-sm font-medium">No invitations sent yet</p>
              <p className="text-gray-300 text-xs mt-1">Search for models and send your first invitation.</p>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="lg:col-span-1 bg-white rounded-2xl p-8 border border-gray-100 shadow-sm"
        >
          <h3 className="text-lg font-bold tracking-tight mb-8">Quick Actions</h3>
          <div className="space-y-4">
            <button
              onClick={() => navigate('/business-dashboard/search')}
              className="w-full flex items-center gap-3 p-4 rounded-xl bg-[#D4AF37]/5 border border-[#D4AF37]/20 hover:bg-[#D4AF37]/10 transition-all text-left"
            >
              <div className="w-10 h-10 bg-[#D4AF37] rounded-xl flex items-center justify-center">
                <Search className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold">Discover Models</p>
                <p className="text-[10px] text-gray-400">Find the perfect talent</p>
              </div>
            </button>
            <button
              onClick={() => navigate('/business-dashboard/search')}
              className="w-full flex items-center gap-3 p-4 rounded-xl bg-blue-50 border border-blue-100 hover:bg-blue-100 transition-all text-left"
            >
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <Send className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold">Send Invitation</p>
                <p className="text-[10px] text-gray-400">Invite models to your project</p>
              </div>
            </button>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="bg-[#111111] text-white rounded-2xl p-8 shadow-xl"
        >
          <h3 className="text-lg font-bold tracking-tight mb-8">Upcoming Jobs</h3>
          {upcomingBookings.length > 0 ? (
            <div className="space-y-4">
              {upcomingBookings.map((booking) => (
                <div key={booking._id} className="p-4 bg-white/5 rounded-xl border border-white/5">
                  <p className="text-[10px] text-[#D4AF37] font-bold uppercase tracking-[0.2em] mb-1">
                    {booking.date}
                  </p>
                  <h4 className="font-bold text-sm tracking-tight">{booking.title}</h4>
                  {booking.location && (
                    <p className="text-xs text-gray-400 mt-1">{booking.location}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 bg-white/5 rounded-xl border border-white/5 text-center">
              <p className="text-xs text-gray-400">No upcoming jobs scheduled.</p>
            </div>
          )}
          <button
            onClick={() => navigate('/business-dashboard/search')}
            className="w-full mt-6 bg-[#D4AF37] text-white py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#c9a430] transition-all active:scale-95"
          >
            Start a New Job
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.45 }}
          className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm"
        >
          <h3 className="text-lg font-bold tracking-tight mb-6">Tips for Success</h3>
          <ul className="space-y-4">
            {[
              'Complete your business profile to attract quality models.',
              'Send detailed invitations with clear project requirements.',
              'Respond to model inquiries promptly to secure top talent.',
            ].map((tip) => (
              <li key={tip} className="flex items-start gap-3 group cursor-pointer">
                <div className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full mt-2 shrink-0" />
                <p className="text-xs text-gray-500 font-medium leading-relaxed group-hover:text-black">{tip}</p>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </div>
  );
};

function SkeletonLoading() {
  return (
    <div className="animate-pulse space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <div className="h-8 w-64 bg-gray-200 rounded-lg mb-2" />
          <div className="h-4 w-80 bg-gray-200 rounded" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100">
            <div className="h-10 w-10 bg-gray-200 rounded-xl mb-4" />
            <div className="h-3 w-20 bg-gray-200 rounded mb-2" />
            <div className="h-8 w-16 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl p-8 border border-gray-100">
          <div className="h-6 w-36 bg-gray-200 rounded mb-6" />
          <div className="h-16 bg-gray-100 rounded-xl mb-3" />
          <div className="h-16 bg-gray-100 rounded-xl mb-3" />
        </div>
        <div className="bg-white rounded-2xl p-8 border border-gray-100">
          <div className="h-6 w-28 bg-gray-200 rounded mb-6" />
          <div className="h-20 bg-gray-100 rounded-xl mb-4" />
          <div className="h-20 bg-gray-100 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
