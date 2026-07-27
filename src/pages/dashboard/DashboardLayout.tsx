/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, type ReactNode } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, User, Image, FileText, Send,
  Bell, Settings, Trophy, Menu, X, Crown, Sparkles
} from 'lucide-react';
import { cn } from '../../lib/utils';

const navLinks = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/model-dashboard' },
  { label: 'My Profile', icon: User, path: '/model-dashboard/profile' },
  { label: 'Portfolio', icon: Image, path: '/model-dashboard/portfolio' },
  { label: 'Applications', icon: FileText, path: '/model-dashboard/applications' },
  { label: 'Invitations', icon: Send, path: '/model-dashboard/invitations', badge: '8' },
  { label: 'Notifications', icon: Bell, path: '/model-dashboard/notifications' },
  { label: 'Go Pro', icon: Crown, path: '/model-dashboard/go-pro', highlight: true },
  { label: 'Settings', icon: Settings, path: '/model-dashboard/settings' },
];

export const DashboardLayout = ({ children }: { children: ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/model-dashboard') {
      return location.pathname === '/model-dashboard';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="bg-[#F8F8F8] min-h-screen flex">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-screen w-64 bg-white border-r border-black/5 flex flex-col p-6 z-50 transition-transform duration-300",
          "lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Mobile Close Button */}
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
                "w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all",
                isActive(item.path)
                  ? "bg-[#D4AF37] text-white shadow-xl shadow-[#D4AF37]/20"
                  : "text-gray-500 hover:bg-gray-50 hover:text-black"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-4 h-4" />
                {item.label}
              </div>
              {item.badge && (
                <span className="bg-orange-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">
                  {item.badge}
                </span>
              )}
              {'highlight' in item && item.highlight && (
                <Sparkles className="w-3 h-3 text-[#D4AF37]" />
              )}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64">
        {/* Mobile Header */}
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
