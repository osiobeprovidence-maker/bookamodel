import { useState, type ReactNode } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, User, Image, FileText, Send,
  Bell, Settings, Trophy, Menu, X, Crown, Shield, Wallet
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useUser } from '../../contexts/UserContext';

const navLinks = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/model-dashboard' },
  { label: 'My Profile', icon: User, path: '/model-dashboard/profile' },
  { label: 'Portfolio', icon: Image, path: '/model-dashboard/portfolio' },
  { label: 'Applications', icon: FileText, path: '/model-dashboard/applications' },
  { label: 'Invitations', icon: Send, path: '/model-dashboard/invitations' },
  { label: 'Notifications', icon: Bell, path: '/model-dashboard/notifications' },
  { label: 'Wallet', icon: Wallet, path: '/model-dashboard/wallet' },
  { label: 'Go Pro', icon: Crown, path: '/model-dashboard/go-pro', highlight: true },
  { label: 'Settings', icon: Settings, path: '/model-dashboard/settings' },
];

export const DashboardLayout = ({ children }: { children: ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { convexUser } = useUser();
  const isAdmin = convexUser?.role === 'admin';

  const isActive = (path: string) => {
    if (path === '/model-dashboard') {
      return location.pathname === '/model-dashboard';
    }
    return location.pathname.startsWith(path);
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
          {navLinks.slice(0, 7).map((item) => (
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
            </NavLink>
          ))}

          {isAdmin && (
            <>
              <div className="border-t border-gray-100 my-2" />
              <NavLink
                to="/admin"
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all",
                  location.pathname.startsWith('/admin')
                    ? "bg-[#D4AF37] text-white shadow-xl shadow-[#D4AF37]/20"
                    : "text-gray-500 hover:bg-gray-50 hover:text-black"
                )}
              >
                <div className="flex items-center gap-3">
                  <Shield className="w-4 h-4" />
                  Admin Dashboard
                </div>
              </NavLink>
              <div className="border-t border-gray-100 my-2" />
            </>
          )}

          {navLinks.slice(7).map((item) => (
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
            </NavLink>
          ))}
        </nav>
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
