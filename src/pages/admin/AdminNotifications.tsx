/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Bell, Plus, X, Send, Mail, Users } from 'lucide-react';
import { adminNotifications } from '../../data/adminData';
import { useToast } from '../../components/ui/Toast';
import { AdminEmptyState } from '../../components/admin/AdminEmptyState';
import { cn } from '../../lib/utils';

type Notification = (typeof adminNotifications)[number];

type RecipientOption = 'All' | 'Models' | 'Businesses' | 'Admin' | 'Super Admin' | 'Moderator' | 'Support';

const recipientBadges: Record<string, string> = {
  All: 'bg-blue-100 text-blue-700',
  Admin: 'bg-purple-100 text-purple-700',
  'Super Admin': 'bg-red-100 text-red-700',
  Businesses: 'bg-green-100 text-green-700',
  Moderator: 'bg-orange-100 text-orange-700',
  Support: 'bg-yellow-100 text-yellow-700',
  Models: 'bg-pink-100 text-pink-700',
};

export default function AdminNotifications() {
  const { toast } = useToast();
  const [localNotifications, setLocalNotifications] = useState<Notification[]>(adminNotifications);
  const [showModal, setShowModal] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [formRecipients, setFormRecipients] = useState<RecipientOption>('All');
  const [inAppEnabled, setInAppEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);

  const resetForm = () => {
    setFormTitle('');
    setFormMessage('');
    setFormRecipients('All');
    setInAppEnabled(true);
    setEmailEnabled(false);
  };

  const handleSend = () => {
    if (!formTitle.trim() || !formMessage.trim()) {
      toast('Please fill in title and message', 'error');
      return;
    }

    const newNotification: Notification = {
      id: String(localNotifications.length + 1),
      title: formTitle.trim(),
      message: formMessage.trim(),
      recipients: formRecipients === 'All' ? 'All' : formRecipients === 'Models' ? 'All' : formRecipients === 'Businesses' ? 'Businesses' : 'Admin',
      date: new Date().toISOString().split('T')[0],
      sent: true,
    };

    setLocalNotifications([newNotification, ...localNotifications]);
    toast('Announcement sent successfully', 'success');
    resetForm();
    setShowModal(false);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#111111] dark:text-white">Notifications & Announcements</h1>
        <button
          onClick={() => setShowModal(true)}
          className={cn(
            'inline-flex items-center gap-2 rounded-xl px-5 py-2.5',
            'bg-[#D4AF37] hover:bg-[#C5A028]',
            'text-sm font-bold text-white uppercase tracking-widest',
            'transition-colors active:scale-95'
          )}
        >
          <Plus className="h-4 w-4" />
          Create Announcement
        </button>
      </div>

      {localNotifications.length === 0 ? (
        <AdminEmptyState icon={Bell} title="No notifications yet" description="Create your first announcement to notify users about important updates." action={{ label: 'Create Announcement', onClick: () => setShowModal(true) }} />
      ) : (
        <div className="space-y-4">
          {localNotifications.map((n) => (
            <div
              key={n.id}
              className={cn(
                'bg-white dark:bg-gray-900 backdrop-blur-sm',
                'border border-gray-100 dark:border-gray-800',
                'rounded-2xl p-6 hover:shadow-lg transition-all duration-300'
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-sm font-bold text-[#111111] dark:text-white">{n.title}</h3>
                    <span className={cn('inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold', recipientBadges[n.recipients] || 'bg-gray-100 text-gray-700')}>
                      {n.recipients}
                    </span>
                    {n.sent ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">Sent</span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">Draft</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{n.message}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">{n.date}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { setShowModal(false); resetForm(); }} />
          <div className={cn(
            'relative w-full max-w-lg',
            'bg-white dark:bg-gray-900',
            'border border-gray-100 dark:border-gray-800',
            'rounded-2xl p-6 shadow-2xl'
          )}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-[#111111] dark:text-white">Create Announcement</h2>
              <button
                onClick={() => { setShowModal(false); resetForm(); }}
                className={cn(
                  'flex items-center justify-center h-8 w-8 rounded-lg',
                  'text-gray-400 hover:text-gray-600',
                  'hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors'
                )}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">Title</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Enter announcement title"
                  className={cn(
                    'w-full px-4 py-2.5 rounded-xl',
                    'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
                    'text-sm text-[#111111] dark:text-white placeholder:text-gray-400',
                    'focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37]',
                    'transition-all'
                  )}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">Message</label>
                <textarea
                  value={formMessage}
                  onChange={(e) => setFormMessage(e.target.value)}
                  placeholder="Write your announcement message..."
                  rows={4}
                  className={cn(
                    'w-full px-4 py-2.5 rounded-xl resize-none',
                    'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
                    'text-sm text-[#111111] dark:text-white placeholder:text-gray-400',
                    'focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37]',
                    'transition-all'
                  )}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">Recipients</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['All', 'Models', 'Businesses', 'Selected Users'] as RecipientOption[]).map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setFormRecipients(opt)}
                      className={cn(
                        'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors',
                        formRecipients === opt
                          ? 'bg-[#D4AF37] text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                      )}
                    >
                      <Users className="h-4 w-4" />
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-center gap-3">
                    <Bell className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-bold text-[#111111] dark:text-white">In-app Notification</span>
                  </div>
                  <button
                    onClick={() => setInAppEnabled(!inAppEnabled)}
                    className={cn(
                      'relative w-11 h-6 rounded-full transition-colors',
                      inAppEnabled ? 'bg-[#D4AF37]' : 'bg-gray-300 dark:bg-gray-600'
                    )}
                  >
                    <div className={cn(
                      'absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform',
                      inAppEnabled && 'translate-x-5'
                    )} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-bold text-[#111111] dark:text-white">Email</span>
                  </div>
                  <button
                    onClick={() => setEmailEnabled(!emailEnabled)}
                    className={cn(
                      'relative w-11 h-6 rounded-full transition-colors',
                      emailEnabled ? 'bg-[#D4AF37]' : 'bg-gray-300 dark:bg-gray-600'
                    )}
                  >
                    <div className={cn(
                      'absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform',
                      emailEnabled && 'translate-x-5'
                    )} />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => { setShowModal(false); resetForm(); }}
                className={cn(
                  'px-4 py-2 rounded-xl text-sm font-bold',
                  'text-gray-600 dark:text-gray-400',
                  'hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors'
                )}
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                className={cn(
                  'inline-flex items-center gap-2 px-5 py-2 rounded-xl',
                  'bg-[#D4AF37] hover:bg-[#C5A028]',
                  'text-sm font-bold text-white',
                  'transition-colors active:scale-95'
                )}
              >
                <Send className="h-4 w-4" />
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
