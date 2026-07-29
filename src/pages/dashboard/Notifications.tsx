import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCheck, Settings, Send, Mail, Wallet, MessageSquare, Bell, X } from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useUser } from '../../contexts/UserContext';

type Category = 'All' | 'applications' | 'invitations' | 'payments' | 'messages' | 'system';

const categories: Category[] = ['All', 'applications', 'invitations', 'payments', 'messages', 'system'];

const categoryIconMap: Record<string, typeof Bell> = {
  All: Bell,
  applications: Send,
  invitations: Mail,
  payments: Wallet,
  messages: MessageSquare,
  system: Bell,
};

const categoryColorMap: Record<string, string> = {
  applications: 'bg-blue-50 text-blue-600',
  invitations: 'bg-green-50 text-green-600',
  payments: 'bg-purple-50 text-purple-600',
  messages: 'bg-amber-50 text-amber-600',
  system: 'bg-gray-100 text-gray-600',
};

export default function Notifications() {
  const { convexUser } = useUser();
  const notifications = useQuery(
    api.notifications.listByUser,
    convexUser ? { userId: convexUser._id as any } : 'skip'
  );
  const [activeCategory, setActiveCategory] = useState<Category>('All');
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<Record<string, boolean>>({
    emailNotifications: true, smsNotifications: false, pushNotifications: true,
    applicationUpdates: true, invitationUpdates: true, paymentAlerts: false, marketingEmails: false,
  });

  const notificationList = notifications ?? [];

  const isRead = (id: string) => readIds.has(id);
  const markAsRead = (id: string) => setReadIds((prev) => new Set(prev).add(id));
  const markAllAsRead = () => setReadIds(new Set(notificationList.map((n) => n._id)));

  const filteredNotifications = activeCategory === 'All'
    ? notificationList
    : notificationList.filter((n) => n.type === activeCategory);

  const toggleSetting = (key: string) => setSettings((prev) => ({ ...prev, [key]: !prev[key] }));

  if (!convexUser) return <SkeletonLoading />;

  return (
    <div className="p-4 sm:p-6 lg:p-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#111111]">Notifications</h1>
        <p className="text-sm text-gray-400 mt-1">Stay updated with your account activity.</p>
      </div>

      <div className="flex items-center gap-3 mb-6 flex-wrap">
        {notificationList.length > 0 && (
          <button onClick={markAllAsRead} className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
            <CheckCheck size={14} /> Mark all as Read
          </button>
        )}
        <button onClick={() => setSettingsOpen(true)} className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl text-gray-500 hover:bg-gray-100 transition-colors">
          <Settings size={14} /> Notification Settings
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((cat) => (
          <button key={cat} onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-[10px] font-semibold uppercase tracking-widest capitalize transition-colors ${activeCategory === cat ? 'bg-black text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
            {cat}
          </button>
        ))}
      </div>

      {notificationList.length > 0 ? (
        <div className="flex flex-col gap-3">
          <AnimatePresence mode="popLayout">
            {filteredNotifications.map((notification, index) => {
              const read = isRead(notification._id);
              const IconComponent = categoryIconMap[notification.type] || Bell;
              const colorClass = categoryColorMap[notification.type] || 'bg-gray-100 text-gray-600';
              return (
                <motion.div key={notification._id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25, delay: index * 0.04 }} onClick={() => markAsRead(notification._id)}
                  className={`flex items-start gap-4 p-4 rounded-xl border border-gray-100 cursor-pointer transition-colors hover:shadow-sm ${read ? 'border-l-4 border-l-transparent bg-white' : 'border-l-4 border-l-[#D4AF37] bg-[#FBFBFB]'}`}>
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${colorClass}`}><IconComponent size={18} /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-sm text-[#111111]">{notification.title}</p>
                      {!read && <span className="w-2 h-2 rounded-full bg-[#D4AF37] flex-shrink-0" />}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{notification.message}</p>
                  </div>
                  <span className="text-[10px] text-gray-300 uppercase tracking-widest whitespace-nowrap flex-shrink-0 pt-0.5">
                    {new Date(notification._creationTime).toLocaleDateString()}
                  </span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Bell className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="text-lg font-bold text-[#111111] mb-2">No notifications yet</h3>
          <p className="text-sm text-gray-400">You'll see updates here when brands interact with your profile.</p>
        </div>
      )}

      <AnimatePresence>
        {settingsOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/30 z-50" onClick={() => setSettingsOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-[#111111]">Notification Settings</h2>
                  <button onClick={() => setSettingsOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors"><X size={20} /></button>
                </div>
                <div className="flex flex-col gap-4 mb-8">
                  {[
                    { key: 'emailNotifications', label: 'Email Notifications' },
                    { key: 'smsNotifications', label: 'SMS Notifications' },
                    { key: 'pushNotifications', label: 'Push Notifications' },
                    { key: 'applicationUpdates', label: 'Application Updates' },
                    { key: 'invitationUpdates', label: 'Invitation Updates' },
                    { key: 'paymentAlerts', label: 'Payment Alerts' },
                    { key: 'marketingEmails', label: 'Marketing Emails' },
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-sm text-[#111111]">{label}</span>
                      <button onClick={() => toggleSetting(key)} className={`relative w-11 h-6 rounded-full transition-colors ${settings[key] ? 'bg-[#D4AF37]' : 'bg-gray-200'}`}>
                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${settings[key] ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-end gap-3">
                  <button onClick={() => setSettingsOpen(false)} className="px-5 py-2 text-xs font-semibold rounded-xl text-gray-500 hover:bg-gray-100 transition-colors">Cancel</button>
                  <button onClick={() => setSettingsOpen(false)} className="px-5 py-2 text-xs font-semibold rounded-xl bg-black text-white hover:bg-gray-800 transition-colors">Save</button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function SkeletonLoading() {
  return (
    <div className="p-4 sm:p-6 lg:p-10 animate-pulse">
      <div className="h-8 w-44 bg-gray-200 rounded-lg mb-6" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white p-4 rounded-xl border border-gray-100">
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full shrink-0" />
              <div className="flex-1"><div className="h-4 w-48 bg-gray-200 rounded mb-2" /><div className="h-3 w-64 bg-gray-200 rounded" /></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
