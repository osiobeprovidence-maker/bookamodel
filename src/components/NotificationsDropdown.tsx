/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, Briefcase, Mail, Send, UserCheck, UserX, MessageSquare, CreditCard, Info } from 'lucide-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useUser } from '../contexts/UserContext';
import { cn } from '../lib/utils';

const typeIconMap: Record<string, typeof Bell> = {
  new_job: Briefcase,
  job_invitation: Mail,
  new_application: Send,
  application_status_changed: UserCheck,
  invitation_accepted: UserCheck,
  invitation_declined: UserX,
  new_message: MessageSquare,
  payment_received: CreditCard,
  payment_status_changed: CreditCard,
  system: Info,
};

export const NotificationsDropdown = ({ mobile = false }: { mobile?: boolean }) => {
  const navigate = useNavigate();
  const { convexUser } = useUser();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const notifications = useQuery(
    api.notifications.listByUser,
    convexUser ? { userId: convexUser._id as any } : 'skip'
  );
  const unreadCount = useQuery(
    api.notifications.getUnreadCount,
    convexUser ? { userId: convexUser._id as any } : 'skip'
  );
  const markAsRead = useMutation(api.notifications.markAsRead);
  const markAllAsRead = useMutation(api.notifications.markAllAsRead);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const recent = (notifications ?? []).slice(0, 8);

  const handleMarkAll = async () => {
    if (!convexUser) return;
    try {
      await markAllAsRead({ userId: convexUser._id as any });
    } catch { /* ignore */ }
  };

  const handleOpenItem = async (n: any) => {
    if (!n.isRead) {
      try { await markAsRead({ notificationId: n._id }); } catch { /* ignore */ }
    }
    setOpen(false);
    const isModel = convexUser?.role === 'model';
    if (n.entityType === 'job') navigate('/model-dashboard/jobs');
    else if (n.entityType === 'invitation') navigate('/model-dashboard/invitations');
    else if (n.entityType === 'application') navigate(isModel ? '/model-dashboard/applications' : '/business-dashboard/applications');
    else if (n.type === 'new_message') navigate('/messages');
    else if (n.type === 'payment_received' || n.type === 'payment_status_changed') navigate('/model-dashboard/wallet');
  };

  const viewAllPath = convexUser?.role === 'model' ? '/model-dashboard/notifications' : '/business-dashboard';

  if (mobile) {
    return (
      <button
        onClick={() => navigate(viewAllPath)}
        className="flex items-center gap-4 text-lg font-bold text-gray-900 text-left"
      >
        <span className="relative">
          <Bell className="w-5 h-5 text-[#D4AF37]" />
          {!!unreadCount && unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-[16px] px-1 rounded-full bg-[#D4AF37] text-white text-[9px] font-bold flex items-center justify-center">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </span>
        Notifications
      </button>
    );
  }

  return (
    <div className="relative" ref={wrapRef}>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'relative p-2 rounded-full transition-colors',
          open ? 'bg-gray-100 text-[#111111]' : 'text-gray-600 hover:bg-gray-50 hover:text-[#111111]'
        )}
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {!!unreadCount && unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#D4AF37] text-white text-[10px] font-bold flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl border border-gray-100 shadow-2xl overflow-hidden z-50">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-bold text-[#111111]">Notifications</h3>
            {!!unreadCount && unreadCount > 0 && (
              <button
                onClick={handleMarkAll}
                className="text-xs text-[#D4AF37] font-semibold flex items-center gap-1 hover:opacity-70 transition-opacity"
              >
                <CheckCheck className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {recent.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <Bell className="w-6 h-6 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-400">No notifications yet</p>
              </div>
            ) : (
              recent.map((n: any) => {
                const Icon = typeIconMap[n.type] ?? Bell;
                return (
                  <button
                    key={n._id}
                    onClick={() => handleOpenItem(n)}
                    className={cn(
                      'w-full text-left px-5 py-4 border-b border-gray-50 hover:bg-gray-50 transition-colors',
                      !n.isRead && 'bg-[#D4AF37]/5'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                        !n.isRead ? 'bg-[#D4AF37]/10 text-[#D4AF37]' : 'bg-gray-100 text-gray-400'
                      )}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={cn('text-sm truncate', n.isRead ? 'text-gray-600' : 'text-[#111111] font-semibold')}>
                          {n.title}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{n.message}</p>
                        <p className="text-[10px] text-gray-300 mt-1">
                          {new Date(n.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      {!n.isRead && <span className="w-2 h-2 rounded-full bg-[#D4AF37] shrink-0 mt-1" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          <div className="px-5 py-3 border-t border-gray-100">
            <Link to={viewAllPath} onClick={() => setOpen(false)} className="block text-center text-xs font-bold text-gray-500 hover:text-[#111111] transition-colors">
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
