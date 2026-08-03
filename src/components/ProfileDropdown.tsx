/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, ChevronDown, LogOut, Settings, ImageIcon } from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useUser } from '../contexts/UserContext';
import { cn } from '../lib/utils';
import Avatar from './ui/Avatar';

export const ProfileDropdown = ({
  mobile = false,
  onNavigate,
}: {
  mobile?: boolean;
  onNavigate?: () => void;
}) => {
  const navigate = useNavigate();
  const { convexUser, logout } = useUser();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const modelProfile = useQuery(
    api.models.getByUser,
    convexUser && convexUser.role === 'model' ? { userId: convexUser._id as any } : 'skip'
  );

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (!mobile) document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [mobile]);

  const isModel = convexUser?.role === 'model';
  const isBusiness = convexUser?.role === 'business';

  const publicPortfolioPath = isModel
    ? modelProfile?._id
      ? `/profile/${modelProfile._id}`
      : '/model-dashboard/portfolio'
    : '/business-dashboard/settings';

  const go = (path: string) => {
    setOpen(false);
    onNavigate?.();
    navigate(path);
  };

  const handleLogout = async () => {
    setOpen(false);
    onNavigate?.();
    await logout();
    navigate('/');
  };

  const items = [
    isModel
      ? { label: 'My Profile', icon: User, path: '/model-dashboard/profile' }
      : { label: 'My Profile', icon: User, path: '/business-dashboard/settings' },
    { label: 'Public Portfolio', icon: ImageIcon, path: publicPortfolioPath },
    isModel
      ? { label: 'Account Settings', icon: Settings, path: '/model-dashboard/settings' }
      : { label: 'Account Settings', icon: Settings, path: '/business-dashboard/settings' },
  ];

  const name = convexUser?.name || 'Profile';
  const displayName = name.split(' ').map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');

  if (mobile) {
    return (
      <div className="flex flex-col gap-4">
        {items.map((item) => (
          <button
            key={item.label}
            onClick={() => go(item.path)}
            className="flex items-center gap-4 text-lg font-bold text-gray-900 text-left"
          >
            <item.icon className="w-5 h-5 text-[#D4AF37]" />
            {item.label}
          </button>
        ))}
        <button
          onClick={handleLogout}
          className="flex items-center gap-4 text-lg font-bold text-red-500 text-left"
        >
          <LogOut className="w-5 h-5 text-red-500" />
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="relative" ref={wrapRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-full hover:bg-gray-50 transition-colors"
      >
        <Avatar src={convexUser?.imageUrl} name={name} size={32} icon={User} />
        <span className="text-sm font-semibold text-[#111111] hidden lg:block max-w-[120px] truncate">
          {displayName}
        </span>
        <ChevronDown className={cn('w-4 h-4 text-gray-400 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-64 bg-white rounded-2xl border border-gray-100 shadow-2xl overflow-hidden z-50">
          <div className="px-5 py-4 border-b border-gray-100">
            <p className="text-sm font-bold text-[#111111] truncate">{displayName}</p>
            <p className="text-xs text-gray-400 capitalize mt-0.5">
              {convexUser?.role === 'business' ? 'Business' : convexUser?.role === 'model' ? 'Model' : 'Member'}
            </p>
          </div>
          <div className="py-2">
            {items.map((item) => (
              <button
                key={item.label}
                onClick={() => go(item.path)}
                className="w-full flex items-center gap-3 px-5 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
              >
                <item.icon className="w-4 h-4 text-gray-400" />
                {item.label}
              </button>
            ))}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-5 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors text-left"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
