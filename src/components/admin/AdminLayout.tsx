/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, type ReactNode, type ComponentType } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Calendar,
  Tag,
  Star,
  ShieldCheck,
  MessageSquare,
  DollarSign,
  Bell,
  FileText,
  Settings,
  ScrollText,
  Headphones,
  ChevronDown,
  Menu,
  X,
  Search,
  Sun,
  Moon,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface NavItem {
  label: string;
  path: string;
  icon: ComponentType;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: 'MAIN',
    items: [
      { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
      { label: 'Models', path: '/admin/models', icon: Users },
      { label: 'Businesses', path: '/admin/businesses', icon: Briefcase },
      { label: 'Bookings', path: '/admin/bookings', icon: Calendar },
    ],
  },
  {
    title: 'MANAGE',
    items: [
      { label: 'Categories', path: '/admin/categories', icon: Tag },
      { label: 'Featured Models', path: '/admin/featured', icon: Star },
      { label: 'Verification Centre', path: '/admin/verification', icon: ShieldCheck },
      { label: 'Reviews', path: '/admin/reviews', icon: MessageSquare },
    ],
  },
  {
    title: 'FINANCE',
    items: [
      { label: 'Payments', path: '/admin/payments', icon: DollarSign },
    ],
  },
  {
    title: 'ENGAGE',
    items: [
      { label: 'Notifications', path: '/admin/notifications', icon: Bell },
      { label: 'Reports', path: '/admin/reports', icon: FileText },
    ],
  },
  {
    title: 'CONTENT',
    items: [
      { label: 'CMS', path: '/admin/cms', icon: ScrollText },
      { label: 'Support', path: '/admin/support', icon: Headphones },
    ],
  },
  {
    title: 'SYSTEM',
    items: [
      { label: 'Admin Management', path: '/admin/admins', icon: Users },
      { label: 'Audit Logs', path: '/admin/audit', icon: ScrollText },
      { label: 'Settings', path: '/admin/settings', icon: Settings },
    ],
  },
];

interface AdminLayoutProps {
  children: ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const location = useLocation();

  const toggleSection = (title: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#0a0a0a] text-white">
      {/* Branding */}
      <div className="px-6 py-6 border-b border-white/5">
        <Link to="/admin" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#D4AF37] to-[#B8962E] flex items-center justify-center">
            <span className="text-black text-sm font-bold">B</span>
          </div>
          <div>
            <span className="text-sm font-bold tracking-tight">BOOKAMODEL</span>
            <span className="text-[10px] block text-white/40 font-medium tracking-wider uppercase">Admin</span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navSections.map((section) => (
          <div key={section.title}>
            {/* Section Label */}
            <button
              onClick={() => toggleSection(section.title)}
              className="w-full flex items-center justify-between px-3 py-2 text-[10px] font-semibold tracking-widest uppercase text-white/30 hover:text-white/50 transition-colors"
            >
              {section.title}
              <ChevronDown
                className={cn(
                  'w-3 h-3 transition-transform duration-200',
                  collapsedSections[section.title] ? '-rotate-90' : ''
                )}
              />
            </button>

            {/* Section Links */}
            {!collapsedSections[section.title] && (
              <div className="mt-0.5 space-y-0.5">
                {section.items.map((item) => {
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                        active
                          ? 'bg-[#D4AF37]/10 text-[#D4AF37]'
                          : 'text-white/50 hover:text-white hover:bg-white/5'
                      )}
                    >
                      <item.icon className={cn('w-4 h-4 flex-shrink-0', active ? 'text-[#D4AF37]' : '')} />
                      {item.label}
                      {active && (
                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                      )}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Bottom Section - Admin Profile */}
      <div className="border-t border-white/5 p-4">
        <div className="flex items-center gap-3 px-2">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#B8962E] flex items-center justify-center flex-shrink-0">
            <span className="text-black text-xs font-bold">JD</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">John Doe</p>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-[#D4AF37]/20 text-[#D4AF37]">
              Super Admin
            </span>
          </div>
        </div>
        <button
          className="mt-3 w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 bottom-0 w-[260px] z-50 transition-transform duration-300 ease-in-out',
          'lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <div className="lg:pl-[260px] min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-200/50">
          <div className="flex items-center justify-between h-16 px-4 lg:px-8">
            {/* Left - Mobile Menu + Breadcrumb */}
            <div className="flex items-center gap-4">
              <button
                className="lg:hidden p-2 -ml-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="hidden sm:flex items-center gap-1.5 text-sm text-gray-400">
                <Link to="/admin" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Admin
                </Link>
                {location.pathname !== '/admin' && (
                  <>
                    <ChevronRight className="w-3.5 h-3.5" />
                    <span className="text-gray-900 font-medium">
                      {navSections
                        .flatMap((s) => s.items)
                        .find((item) => isActive(item.path))?.label || ''}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Right - Actions */}
            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-gray-100/80 rounded-lg text-sm text-gray-400 min-w-[200px]">
                <Search className="w-4 h-4" />
                <span>Search...</span>
                <kbd className="ml-auto px-1.5 py-0.5 text-[10px] font-medium bg-white rounded border border-gray-200 text-gray-400">
                  /
                </kbd>
              </div>

              {/* Dark Mode Toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {darkMode ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
              </button>

              {/* Notifications */}
              <button className="relative p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell className="w-4.5 h-4.5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#D4AF37] rounded-full ring-2 ring-white" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};
