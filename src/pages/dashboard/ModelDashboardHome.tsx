import {
  Send, Eye, Trophy, Wallet, CheckCircle, AlertCircle, ArrowRight, RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useUser } from '../../contexts/UserContext';
import { cn } from '../../lib/utils';

export const ModelDashboardHome = () => {
  const { convexUser } = useUser();
  const dashboardData = useQuery(
    api.dashboard.getModelDashboardData,
    convexUser ? { userId: convexUser._id as any } : 'skip'
  );

  const isLoading = !convexUser || dashboardData === undefined;

  if (isLoading) {
    return <SkeletonLoading />;
  }

  if (convexUser && dashboardData === null) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <AlertCircle className="w-12 h-12 text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-gray-500 mb-2">Unable to load dashboard</h2>
        <p className="text-sm text-gray-400 mb-6">We could not retrieve your dashboard data.</p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 bg-[#111111] text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-black transition-all"
        >
          <RefreshCw className="w-4 h-4" /> Retry
        </button>
      </div>
    );
  }

  const { user, profile, stats, recentInvitations, upcomingBookings, profileCompletion } = dashboardData;

  const formatCurrency = (amount: number) => {
    if (amount >= 1_000_000) return `₦${(amount / 1_000_000).toFixed(1)}M`;
    if (amount >= 1_000) return `₦${(amount / 1_000).toFixed(0)}k`;
    return `₦${amount}`;
  };

  const statCards = [
    { label: 'Profile Views', value: stats.profileViews.toLocaleString(), icon: Eye, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'New Invitations', value: String(stats.pendingInvitations), icon: Send, color: 'text-orange-600', bg: 'bg-orange-50', badge: stats.pendingInvitations > 0 ? `${stats.pendingInvitations} pending` : undefined },
    { label: 'Success Rate', value: `${stats.successRate}%`, icon: Trophy, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'Earnings', value: formatCurrency(stats.totalEarnings), icon: Wallet, color: 'text-green-600', bg: 'bg-green-50' },
  ];

  return (
    <div>
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-black mb-1">Hi, {user.name}!</h1>
          <p className="text-gray-500 font-medium">
            {profile
              ? profile.isAvailable
                ? 'Your profile is visible to brands.'
                : 'Your profile is hidden from searches.'
              : 'Complete your profile to get discovered.'}
          </p>
        </div>
        <div className="flex items-center gap-6">
          {profile?.isAvailable && (
            <div className="hidden md:flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-black/5">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs font-bold">Visible to Brands</span>
            </div>
          )}
        </div>
      </header>

      {!profile?.profileCompleted && (
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className={cn('p-2.5 rounded-xl', stat.bg)}>
                <stat.icon className={cn('w-4 h-4', stat.color)} />
              </div>
              {stat.badge && (
                <div className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {stat.badge}
                </div>
              )}
            </div>
            <p className="text-gray-400 text-[10px] uppercase font-bold tracking-widest mb-1">{stat.label}</p>
            <h3 className="text-2xl font-extrabold tracking-tight">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm overflow-hidden relative">
            <div className="relative z-10">
              <h3 className="text-lg font-bold tracking-tight mb-2">Profile Strength</h3>
              <p className="text-gray-400 text-sm mb-6">
                {profile ? 'Complete your profile to appear higher in search results.' : 'Create your model profile to start receiving invitations.'}
              </p>
              <div className="flex items-center gap-4 mb-2">
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#D4AF37] rounded-full transition-all duration-500" style={{ width: `${profileCompletion}%` }} />
                </div>
                <span className="text-xs font-extrabold text-[#D4AF37]">{profileCompletion}%</span>
              </div>
              {profile && (
                <div className="flex flex-wrap items-center gap-6 mt-6">
                  {stats.portfolioCount > 0 && (
                    <div className="flex items-center gap-2 text-[10px] text-green-600 font-bold uppercase tracking-wider">
                      <CheckCircle className="w-4 h-4" /> Portfolio ({stats.portfolioCount})
                    </div>
                  )}
                  {profile.isVerified && (
                    <div className="flex items-center gap-2 text-[10px] text-green-600 font-bold uppercase tracking-wider">
                      <CheckCircle className="w-4 h-4" /> Identity Verified
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold tracking-tight mb-8">Recent Activity</h3>
            {recentInvitations.length > 0 ? (
              <div className="space-y-6">
                {recentInvitations.map((invite) => (
                  <div key={invite._id} className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 shadow-sm">
                      <Send className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-sm tracking-tight">{invite.title}</h4>
                        <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                          {new Date(invite.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Status: {invite.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Send className="w-8 h-8 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-400 text-sm font-medium">No invitations yet</p>
                <p className="text-gray-300 text-xs mt-1">Complete your profile to start receiving invitations.</p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#111111] text-white rounded-2xl p-8 shadow-xl shadow-black/10">
            <h3 className="text-lg font-bold tracking-tight mb-6">Upcoming Jobs</h3>
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
          </div>

          <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold tracking-tight mb-6">Tips for Success</h3>
            <ul className="space-y-4">
              {[
                'Update your portfolio regularly with high-res photos.',
                'Respond to invitations quickly to build your reputation.',
                'Complete all profile sections to rank higher in searches.',
              ].map((tip) => (
                <li key={tip} className="flex items-start gap-3 group cursor-pointer">
                  <div className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full mt-2 shrink-0" />
                  <p className="text-xs text-gray-500 font-medium leading-relaxed group-hover:text-black">{tip}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

function SkeletonLoading() {
  return (
    <div className="animate-pulse space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <div className="h-8 w-48 bg-gray-200 rounded-lg mb-2" />
          <div className="h-4 w-72 bg-gray-200 rounded" />
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
          <div className="h-6 w-32 bg-gray-200 rounded mb-6" />
          <div className="h-2 bg-gray-200 rounded-full mb-2" />
          <div className="h-20 bg-gray-100 rounded-xl mt-6" />
          <div className="h-20 bg-gray-100 rounded-xl mt-4" />
        </div>
        <div className="bg-white rounded-2xl p-8 border border-gray-100">
          <div className="h-6 w-28 bg-gray-200 rounded mb-6" />
          <div className="h-24 bg-gray-100 rounded-xl mb-4" />
          <div className="h-24 bg-gray-100 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
