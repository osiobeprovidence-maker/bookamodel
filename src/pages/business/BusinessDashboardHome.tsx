import { motion } from 'framer-motion';
import { Search, Plus, Heart, Send, MessageSquare, CheckCircle, ArrowRight, AlertCircle } from 'lucide-react';
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

  if (!convexUser || !dashboardData) return <SkeletonLoading />;

  const { user, businessProfile, stats } = dashboardData;
  const isNewUser = !businessProfile || (
    stats.activeInvitations === 0 &&
    stats.savedModelsCount === 0 &&
    stats.completedJobs === 0 &&
    stats.totalSpent === 0
  );

  const profileChecks = [
    { label: 'Company Name', done: !!businessProfile?.companyName },
    { label: 'Logo', done: false },
    { label: 'Industry', done: false },
    { label: 'Contact Information', done: false },
    { label: 'Verification', done: false },
  ];
  const profileProgress = Math.round((profileChecks.filter(c => c.done).length / profileChecks.length) * 100);

  const quickActions = [
    { label: 'Search Models', icon: Search, path: '/business-dashboard/search', color: 'bg-[#D4AF37]', desc: 'Find the perfect talent' },
    { label: 'Create Job', icon: Plus, path: '/business-dashboard/jobs', color: 'bg-blue-600', desc: 'Post a new casting request' },
    { label: 'Saved Models', icon: Heart, path: '/business-dashboard/saved', color: 'bg-pink-500', desc: 'View your favorites' },
    { label: 'Invitations', icon: Send, path: '/business-dashboard/invitations', color: 'bg-purple-600', desc: 'Manage sent invitations' },
    { label: 'Messages', icon: MessageSquare, path: '/business-dashboard/messages', color: 'bg-emerald-600', desc: 'Chat with models' },
  ];

  return (
    <div>
      <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-black mb-1">
            {isNewUser ? 'Welcome to BookAModel' : `Welcome back, ${user.name}!`}
          </h1>
          <p className="text-gray-500 font-medium">
            {isNewUser
              ? 'Your business account is ready. Start by completing your profile and posting your first casting request.'
              : "Here's what's happening with your bookings today."}
          </p>
        </div>
        {!isNewUser && (
          <div className="flex items-center gap-4">
            <Link to="/business-dashboard/search" className="bg-[#D4AF37] text-white px-5 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-[#c9a430] transition-all flex items-center gap-2">
              <Search className="w-4 h-4" /> Find Models
            </Link>
          </div>
        )}
      </header>

      {isNewUser ? (
        <>
          {!businessProfile?.profileCompleted && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 mb-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 rounded-xl bg-[#D4AF37]/10">
                  <CheckCircle className="w-4 h-4 text-[#D4AF37]" />
                </div>
                <h2 className="text-lg font-bold tracking-tight">Complete your business profile</h2>
              </div>

              <div className="space-y-3 mb-6">
                {profileChecks.map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <div className={cn('w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0', item.done ? 'bg-green-500 border-green-500' : 'border-gray-300')}>
                      {item.done && <CheckCircle className="w-3 h-3 text-white" />}
                    </div>
                    <span className={cn('text-sm', item.done ? 'text-gray-400 line-through' : 'text-[#111111] font-medium')}>{item.label}</span>
                  </div>
                ))}
              </div>

              <div className="mb-6">
                <div className="flex justify-between text-xs text-gray-400 mb-2">
                  <span className="font-bold uppercase tracking-wider">Progress</span>
                  <span className="font-bold">{profileProgress}%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#D4AF37] rounded-full transition-all duration-500" style={{ width: `${profileProgress}%` }} />
                </div>
              </div>

              <Link
                to="/business-dashboard/settings"
                className="inline-flex items-center gap-2 bg-[#111111] text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-black transition-all"
              >
                Complete Profile <ArrowRight className="w-3 h-3" />
              </Link>
            </motion.div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {[
              { label: 'Search Models', icon: Search, path: '/business-dashboard/search', color: 'bg-[#D4AF37]', desc: 'Find the perfect talent' },
              { label: 'Create Job', icon: Plus, path: '/business-dashboard/jobs', color: 'bg-blue-600', desc: 'Post a new casting request' },
              { label: 'Saved Models', icon: Heart, path: '/business-dashboard/saved', color: 'bg-pink-500', desc: 'View your favorites' },
              { label: 'Invitations', icon: Send, path: '/business-dashboard/invitations', color: 'bg-purple-600', desc: 'Manage sent invitations' },
              { label: 'Messages', icon: MessageSquare, path: '/business-dashboard/messages', color: 'bg-emerald-600', desc: 'Chat with models' },
            ].map((action) => (
              <motion.button
                key={action.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                onClick={() => navigate(action.path)}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-left hover:shadow-md transition-all group"
              >
                <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center mb-4', action.color)}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-base font-bold text-[#111111] mb-1">{action.label}</h3>
                <p className="text-sm text-gray-400">{action.desc}</p>
              </motion.button>
            ))}
          </div>
        </>
      ) : (
        <>
          {!businessProfile?.profileCompleted && (
            <div className="bg-gradient-to-r from-[#D4AF37]/10 to-[#D4AF37]/5 border border-[#D4AF37]/20 rounded-2xl p-5 mb-8 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-[#D4AF37] shrink-0" />
                <p className="text-sm font-medium text-[#111111]">Complete your business profile to attract more models.</p>
              </div>
              <Link to="/business-dashboard/settings" className="shrink-0 bg-[#D4AF37] text-white px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-[#c9a430] transition-all flex items-center gap-1.5">
                Complete Profile <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {[
              { label: 'Active Invitations', value: String(stats.activeInvitations), icon: Send, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Saved Models', value: String(stats.savedModelsCount), icon: Heart, color: 'text-pink-600', bg: 'bg-pink-50' },
              { label: 'Jobs Completed', value: String(stats.completedJobs), icon: Search, color: 'text-green-600', bg: 'bg-green-50' },
              { label: 'Total Spent', value: formatCurrency(stats.totalSpent), icon: Search, color: 'text-purple-600', bg: 'bg-purple-50' },
            ].map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.06 }}
                className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className={cn('p-2.5 rounded-xl inline-flex mb-4', stat.bg)}><stat.icon className={cn('w-4 h-4', stat.color)} /></div>
                <p className="text-gray-400 text-[10px] uppercase font-bold tracking-widest mb-1">{stat.label}</p>
                <h3 className="text-2xl font-extrabold tracking-tight">{stat.value}</h3>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {quickActions.map((action) => (
              <motion.button key={action.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
                onClick={() => navigate(action.path)} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-left hover:shadow-md transition-all group">
                <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center mb-4', action.color)}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-base font-bold text-[#111111] mb-1">{action.label}</h3>
                <p className="text-sm text-gray-400">{action.desc}</p>
              </motion.button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

function formatCurrency(amount: number) {
  if (amount >= 1_000_000) return `₦${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `₦${(amount / 1_000).toFixed(0)}k`;
  return `₦${amount}`;
}

function SkeletonLoading() {
  return (
    <div className="animate-pulse space-y-8">
      <div className="flex justify-between items-center">
        <div><div className="h-8 w-64 bg-gray-200 rounded-lg mb-2" /><div className="h-4 w-80 bg-gray-200 rounded" /></div>
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
    </div>
  );
}
