/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, type ReactNode } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Search, Send, Heart, Briefcase,
  MessageSquare, Settings, LogOut, Menu, X, Wallet
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useUser } from '../../contexts/UserContext';
import { useNavigate } from 'react-router-dom';

const navLinks = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/business-dashboard' },
  { label: 'Search Models', icon: Search, path: '/business-dashboard/search' },
  { label: 'Invitations', icon: Send, path: '/business-dashboard/invitations' },
  { label: 'Saved Models', icon: Heart, path: '/business-dashboard/saved' },
  { label: 'Job Requests', icon: Briefcase, path: '/business-dashboard/jobs' },
  { label: 'Messages', icon: MessageSquare, path: '/business-dashboard/messages' },
  { label: 'Wallet', icon: Wallet, path: '/business-dashboard/wallet' },
];

export const BusinessLayout = ({ children }: { children: ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { logout } = useUser();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    if (path === '/business-dashboard') {
      return location.pathname === '/business-dashboard';
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="bg-[#F8F8F8] min-h-screen flex overflow-x-hidden">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 h-screen w-64 bg-white border-r border-black/5 flex flex-col p-6 z-50 transition-transform duration-300",
          "lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <button
          className="lg:hidden absolute top-4 right-4 p-1 text-gray-400 hover:text-black"
          onClick={() => setSidebarOpen(false)}
        >
          <X className="w-5 h-5" />
        </button>

        <Link to="/" className="flex items-center mb-12">
          <span className="font-bold tracking-tighter text-black uppercase">BookAModel</span>
        </Link>

        <nav className="flex-1 space-y-2">
          {navLinks.map((item) => (
            <NavLink
              key={item.label}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all",
                isActive(item.path)
                  ? "bg-[#111111] text-white shadow-xl shadow-black/10"
                  : "text-gray-500 hover:bg-gray-50 hover:text-black"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto space-y-2 pt-6 border-t border-gray-100">
          <NavLink
            to="/business-dashboard/settings"
            onClick={() => setSidebarOpen(false)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all",
              isActive('/business-dashboard/settings')
                ? "bg-[#111111] text-white shadow-xl shadow-black/10"
                : "text-gray-500 hover:bg-gray-50 hover:text-black"
            )}
          >
            <Settings className="w-4 h-4" /> Settings
          </NavLink>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all"
          >
            <LogOut className="w-4 h-4" /> Log Out
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 lg:ml-64">
        <div className="lg:hidden sticky top-0 z-30 bg-white border-b border-black/5 px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-gray-500 hover:text-black hover:bg-gray-50 rounded-xl transition-all"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link to="/" className="font-bold tracking-tighter text-black uppercase text-sm">
            BookAModel
          </Link>
        </div>

        <div className="p-4 sm:p-6 lg:p-10">
          {children}
        </div>
      </main>
    </div>
  );
};
