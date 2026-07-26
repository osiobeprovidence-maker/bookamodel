/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  LayoutDashboard, Search, Send, Heart, MessageSquare, 
  Settings, LogOut, Bell, TrendingUp, Users, Calendar, 
  ArrowUpRight, MoreHorizontal
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { models, invitations } from '../data/mockData';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { cn } from '../lib/utils';
import { useUser } from '../contexts/UserContext';

export const BusinessDashboard = () => {
  const { user, logout } = useUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };
  const stats = [
    { label: 'Active Invitations', value: '12', change: '+2', icon: Send, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Saved Models', value: '45', change: '+12', icon: Heart, color: 'text-pink-600', bg: 'bg-pink-50' },
    { label: 'Jobs Completed', value: '28', change: '+5', icon: Calendar, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Total Spent', value: '₦4.2M', change: '+₦800k', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  const recentInvites = invitations.slice(0, 5);
  const recommendedModels = models.slice(10, 14);

  return (
    <div className="bg-[#F8F8F8] min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-black/5 flex flex-col p-6 fixed h-screen z-10">
        <Link to="/" className="flex items-center mb-12">
          <span className="font-bold tracking-tighter text-black uppercase">BookAModel</span>
        </Link>

        <nav className="flex-1 space-y-2">
          {[
            { label: 'Dashboard', icon: LayoutDashboard, active: true, path: '/business-dashboard' },
            { label: 'Search Models', icon: Search, path: '/explore' },
            { label: 'Invitations', icon: Send, path: '#' },
            { label: 'Saved Models', icon: Heart, path: '#' },
            { label: 'Job Requests', icon: Calendar, path: '#' },
            { label: 'Messages', icon: MessageSquare, path: '#' },
          ].map((item) => (
            <Link
              key={item.label}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all",
                item.active ? "bg-black text-white shadow-xl shadow-black/10" : "text-gray-500 hover:bg-gray-50 hover:text-black"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto space-y-2 pt-6 border-t border-gray-100">
          <Link to="#" className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-gray-500 hover:bg-gray-50 hover:text-black">
            <Settings className="w-4 h-4" /> Settings
          </Link>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all"
          >
            <LogOut className="w-4 h-4" /> Log Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-10">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-black mb-1">Welcome back, {user?.name || 'Nike'}!</h1>
            <p className="text-gray-500 font-medium">Here's what's happening with your bookings today.</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-black/5 relative hover:shadow-md transition-all">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <img src="https://i.pravatar.cc/100?u=brand" className="w-10 h-10 rounded-full object-cover" alt="Profile" />
              <div>
                <p className="text-sm font-black">{user?.email || 'Nike Nigeria'}</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Business Account</p>
              </div>
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
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
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Invitations */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-bold tracking-tight">Recent Invitations</h3>
              <Button variant="ghost" size="sm" className="text-[#D4AF37] font-bold text-xs uppercase tracking-widest">View All</Button>
            </div>
            <div className="space-y-4">
              {recentInvites.map((invite) => {
                const model = models.find(m => m.id === invite.modelId);
                return (
                  <div key={invite.id} className="flex items-center justify-between p-4 rounded-xl border border-transparent hover:border-gray-100 hover:bg-gray-50 transition-all group">
                    <div className="flex items-center gap-4">
                      <img src={model?.profileImage} className="w-12 h-12 rounded-lg object-cover shadow-sm" alt={model?.name} />
                      <div>
                        <h4 className="font-bold text-sm tracking-tight">{model?.name}</h4>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{invite.category} • {invite.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm font-bold tracking-tight">{invite.payment}</p>
                        <Badge 
                          variant={invite.status === 'Accepted' ? 'success' : invite.status === 'Pending' ? 'warning' : 'default'}
                        >
                          {invite.status}
                        </Badge>
                      </div>
                      <button className="p-2 text-gray-300 hover:text-black transition-colors">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recommended Models */}
          <div className="lg:col-span-1 bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold tracking-tight mb-8">Recommended</h3>
            <div className="space-y-6">
              {recommendedModels.map((model) => (
                <div key={model.id} className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <img src={model.profileImage} className="w-10 h-10 rounded-lg object-cover shadow-sm" alt={model.name} />
                    <div>
                      <h4 className="text-xs font-bold tracking-tight">{model.name}</h4>
                      <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{model.location}</p>
                    </div>
                  </div>
                  <Link to={`/profile/${model.id}`}>
                    <Button variant="outline" size="sm" className="rounded-lg px-3 py-1 text-[10px] font-bold uppercase">View</Button>
                  </Link>
                </div>
              ))}
              <Button variant="primary" className="w-full rounded-xl py-3 font-bold mt-4 shadow-md uppercase text-[11px] tracking-widest">
                Discover More
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
