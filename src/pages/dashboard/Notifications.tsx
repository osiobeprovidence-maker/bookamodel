import { useState, type ElementType } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CheckCheck,
  Settings,
  Send,
  Mail,
  Wallet,
  MessageSquare,
  Bell,
  X,
} from 'lucide-react';
import { notifications } from '../../data/dashboardData';

type Category = 'All' | 'Applications' | 'Invitations' | 'Payments' | 'Messages' | 'System';

const categories: Category[] = ['All', 'Applications', 'Invitations', 'Payments', 'Messages', 'System'];

const categoryIconMap: Record<Category, ElementType> = {
  All: Bell,
  Applications: Send,
  Invitations: Mail,
  Payments: Wallet,
  Messages: MessageSquare,
  System: Bell,
};

const categoryColorMap: Record<string, string> = {
  Applications: 'bg-blue-50 text-blue-600',
  Invitations: 'bg-green-50 text-green-600',
  Payments: 'bg-purple-50 text-purple-600',
  Messages: 'bg-amber-50 text-amber-600',
  System: 'bg-gray-100 text-gray-600',
};

const settingsOptions = [
  { key: 'emailNotifications', label: 'Email Notifications' },
  { key: 'smsNotifications', label: 'SMS Notifications' },
  { key: 'pushNotifications', label: 'Push Notifications' },
  { key: 'applicationUpdates', label: 'Application Updates' },
  { key: 'invitationUpdates', label: 'Invitation Updates' },
  { key: 'paymentAlerts', label: 'Payment Alerts' },
  { key: 'marketingEmails', label: 'Marketing Emails' },
] as const;

export default function Notifications() {
  const [activeCategory, setActiveCategory] = useState<Category>('All');
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<Record<string, boolean>>({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    applicationUpdates: true,
    invitationUpdates: true,
    paymentAlerts: false,
    marketingEmails: false,
  });

  const isRead = (id: string) => readIds.has(id);
  const markAsRead = (id: string) => setReadIds((prev) => new Set(prev).add(id));
  const markAllAsRead = () => setReadIds(new Set(notifications.map((n) => n.id)));

  const filteredNotifications =
    activeCategory === 'All'
      ? notifications
      : notifications.filter((n) => n.category === activeCategory);

  const toggleSetting = (key: string) =>
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="p-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#111111]">Notifications</h1>
        <p className="text-sm text-gray-400 mt-1">
          Stay updated with your account activity.
        </p>
      </div>

      {/* Top Controls */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={markAllAsRead}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
        >
          <CheckCheck size={14} />
          Mark all as Read
        </button>
        <button
          onClick={() => setSettingsOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl text-gray-500 hover:bg-gray-100 transition-colors"
        >
          <Settings size={14} />
          Notification Settings
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-[10px] font-semibold uppercase tracking-widest transition-colors ${
              activeCategory === cat
                ? 'bg-black text-white'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Notification List */}
      <div className="flex flex-col gap-3">
        <AnimatePresence mode="popLayout">
          {filteredNotifications.map((notification, index) => {
            const read = isRead(notification.id);
            const IconComponent = categoryIconMap[notification.category] || Bell;
            const colorClass =
              categoryColorMap[notification.category] || 'bg-gray-100 text-gray-600';

            return (
              <motion.div
                key={notification.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25, delay: index * 0.04 }}
                onClick={() => markAsRead(notification.id)}
                className={`flex items-start gap-4 p-4 rounded-xl border border-gray-100 cursor-pointer transition-colors hover:shadow-sm ${
                  read
                    ? 'border-l-4 border-l-transparent bg-white'
                    : 'border-l-4 border-l-[#D4AF37] bg-[#FBFBFB]'
                }`}
              >
                {/* Icon */}
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${colorClass}`}
                >
                  <IconComponent size={18} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-sm text-[#111111]">
                      {notification.title}
                    </p>
                    {!read && (
                      <span className="w-2 h-2 rounded-full bg-[#D4AF37] flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {notification.description}
                  </p>
                </div>

                {/* Timestamp */}
                <span className="text-[10px] text-gray-300 uppercase tracking-widest whitespace-nowrap flex-shrink-0 pt-0.5">
                  {notification.timestamp}
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Settings Modal */}
      <AnimatePresence>
        {settingsOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-50"
              onClick={() => setSettingsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div
                className="bg-white rounded-2xl p-8 w-full max-w-md shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-[#111111]">
                    Notification Settings
                  </h2>
                  <button
                    onClick={() => setSettingsOpen(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="flex flex-col gap-4 mb-8">
                  {settingsOptions.map(({ key, label }) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-sm text-[#111111]">{label}</span>
                      <button
                        onClick={() => toggleSetting(key)}
                        className={`relative w-11 h-6 rounded-full transition-colors ${
                          settings[key] ? 'bg-[#D4AF37]' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                            settings[key] ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={() => setSettingsOpen(false)}
                    className="px-5 py-2 text-xs font-semibold rounded-xl text-gray-500 hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setSettingsOpen(false)}
                    className="px-5 py-2 text-xs font-semibold rounded-xl bg-black text-white hover:bg-gray-800 transition-colors"
                  >
                    Save
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}