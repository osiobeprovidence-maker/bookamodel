import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCheck, Settings, Send, Mail, Wallet, MessageSquare, Bell, X, Briefcase, UserCheck, UserX, CreditCard, Info, Image as ImageIcon } from 'lucide-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useUser } from '../../contexts/UserContext';
import { useToast } from '../../components/ui/Toast';
import { EmptyState, ListSkeleton } from '../../components/ui/EmptyState';

type Category = 'All' | 'jobs' | 'applications' | 'invitations' | 'payments' | 'messages' | 'system';

const categories: Category[] = ['All', 'jobs', 'applications', 'invitations', 'payments', 'messages', 'system'];

const categoryIconMap: Record<string, typeof Bell> = {
  All: Bell,
  jobs: Briefcase,
  applications: Send,
  invitations: Mail,
  payments: Wallet,
  messages: MessageSquare,
  system: Bell,
};

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

const notificationCategories = [
  { label: 'Jobs', icon: Briefcase, desc: 'New modelling opportunities' },
  { label: 'Applications', icon: Send, desc: 'Status updates on your applications' },
  { label: 'Invitations', icon: Mail, desc: 'Invitations from businesses' },
  { label: 'Messages', icon: MessageSquare, desc: 'Direct messages from businesses' },
  { label: 'Payments', icon: Wallet, desc: 'Wallet credits and payouts' },
  { label: 'System Updates', icon: Bell, desc: 'Account and platform news' },
];

const Notifications = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { convexUser } = useUser();
  const [activeCategory, setActiveCategory] = useState<Category>('All');
  const [showSettings, setShowSettings] = useState(false);

  const notifications = useQuery(
    api.notifications.listByUser,
    convexUser ? { userId: convexUser._id as any } : 'skip'
  );
  const markAsRead = useMutation(api.notifications.markAsRead);
  const markAllAsRead = useMutation(api.notifications.markAllAsRead);
  const prefs = useQuery(
    api.notifications.getPreferences,
    convexUser ? { userId: convexUser._id as any } : 'skip'
  );
  const upsertPrefs = useMutation(api.notifications.upsertPreferences);

  const [localPrefs, setLocalPrefs] = useState<any>(null);

  const filteredNotifications = useMemo(() => {
    const list = notifications ?? [];
    if (activeCategory === 'All') return list;
    const typeMap: Record<string, string[]> = {
      jobs: ['new_job'],
      applications: ['new_application', 'application_status_changed'],
      invitations: ['job_invitation', 'invitation_accepted', 'invitation_declined'],
      payments: ['payment_received', 'payment_status_changed'],
      messages: ['new_message'],
      system: ['system'],
    };
    const types = typeMap[activeCategory] || [];
    return list.filter((n: any) => types.includes(n.type));
  }, [notifications, activeCategory]);

  const unreadCount = useMemo(() => (notifications ?? []).filter((n: any) => !n.isRead).length, [notifications]);
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const n of notifications ?? []) {
      if (!n.isRead) {
        counts[n.type] = (counts[n.type] || 0) + 1;
      }
    }
    return counts;
  }, [notifications]);

  const handleMarkAllRead = async () => {
    if (!convexUser) return;
    try {
      await markAllAsRead({ userId: convexUser._id as any });
      toast('All notifications marked as read', 'success');
    } catch {
      toast('Failed to mark all as read', 'error');
    }
  };

  const handleMarkRead = async (notificationId: any) => {
    try {
      await markAsRead({ notificationId });
    } catch { /* ignore */ }
  };

  const handleNotificationClick = async (n: any) => {
    if (!n.isRead) await handleMarkRead(n._id);
    if (n.entityType === 'job' && n.entityId) {
      navigate(`/model-dashboard/jobs`);
    } else if (n.entityType === 'invitation') {
      navigate(`/model-dashboard/invitations`);
    } else if (n.entityType === 'application') {
      navigate(`/model-dashboard/applications`);
    } else if (n.type === 'new_message') {
      navigate(`/model-dashboard/messages`);
    }
  };

  const handleSavePrefs = async () => {
    if (!convexUser || !localPrefs) return;
    try {
      await upsertPrefs({ userId: convexUser._id as any, ...localPrefs });
      toast('Notification preferences saved', 'success');
      setShowSettings(false);
    } catch {
      toast('Failed to save preferences', 'error');
    }
  };

  const openSettings = () => {
    setLocalPrefs({
      inApp: prefs?.inApp ?? true,
      push: prefs?.push ?? false,
      email: prefs?.email ?? false,
      newJobs: prefs?.newJobs ?? true,
      applications: prefs?.applications ?? true,
      invitations: prefs?.invitations ?? true,
      payments: prefs?.payments ?? true,
      messages: prefs?.messages ?? true,
      system: prefs?.system ?? true,
    });
    setShowSettings(true);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#111111]">Notifications</h1>
          <p className="text-gray-400 mt-1">Stay updated on your platform activity.</p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button onClick={handleMarkAllRead} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-100 text-gray-600 text-xs font-medium hover:bg-gray-200 transition-colors">
              <CheckCheck className="w-3.5 h-3.5" /> Mark All Read
            </button>
          )}
          <button onClick={openSettings} className="p-2 rounded-xl bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-[#111111] transition-colors">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
        className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => {
          const Icon = categoryIconMap[cat];
          const count = cat === 'All' ? unreadCount : categoryCounts[cat] || 0;
          return (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeCategory === cat ? 'bg-black text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {cat === 'All' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
              {count > 0 && <span className="ml-1 w-5 h-5 rounded-full bg-[#D4AF37] text-white text-[10px] font-bold flex items-center justify-center">{count}</span>}
            </button>
          );
        })}
      </motion.div>

      {/* Notifications List */}
      {notifications === undefined ? (
        <ListSkeleton rows={5} />
      ) : filteredNotifications.length === 0 ? (
        <EmptyState
          icon={<Bell className="w-7 h-7" />}
          title="You're All Caught Up 🎉"
          description="We'll notify you when businesses send invitations, messages, payments or application updates."
          actions={[
            { label: 'Browse Jobs', primary: true, icon: <Briefcase className="w-4 h-4" />, onClick: () => navigate('/model-dashboard/jobs') },
            { label: 'Go to Portfolio', icon: <ImageIcon className="w-4 h-4" />, onClick: () => navigate('/model-dashboard/portfolio') },
          ]}
          footer={
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-5">Notification Categories</p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 text-left max-w-2xl mx-auto">
                {notificationCategories.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <div key={cat.label} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                      <div className="p-2 rounded-lg bg-white border border-gray-100 shadow-sm shrink-0">
                        <Icon className="w-4 h-4 text-[#D4AF37]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#111111]">{cat.label}</p>
                        <p className="text-xs text-gray-500">{cat.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          }
        />
      ) : (
        <div className="space-y-2">
          {filteredNotifications.map((n: any) => {
            const Icon = typeIconMap[n.type] || Bell;
            return (
              <motion.div key={n._id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                onClick={() => handleNotificationClick(n)}
                className={`flex items-start gap-4 p-4 rounded-xl cursor-pointer transition-all ${
                  n.isRead ? 'bg-white border border-gray-100 shadow-sm' : 'bg-[#D4AF37]/[0.03] border border-[#D4AF37]/20'
                } hover:bg-gray-50 hover:shadow-md`}
              >
                <div className={`p-2 rounded-lg shrink-0 ${n.isRead ? 'bg-gray-100 text-gray-500' : 'bg-[#D4AF37]/10 text-[#D4AF37]'}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${n.isRead ? 'text-gray-500' : 'text-[#111111] font-medium'}`}>{n.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                  <p className="text-[10px] text-gray-400 mt-1">{new Date(n._creationTime).toLocaleDateString()}</p>
                </div>
                {!n.isRead && <span className="w-2 h-2 rounded-full bg-[#D4AF37] shrink-0 mt-2" />}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && localPrefs && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={() => setShowSettings(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="w-full max-w-md bg-white border border-gray-100 rounded-2xl p-6 shadow-xl" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-[#111111]">Notification Settings</h2>
                <button onClick={() => setShowSettings(false)} className="p-1 text-gray-400 hover:text-[#111111]"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Channels</h3>
                  {(['inApp', 'push', 'email'] as const).map(key => (
                    <label key={key} className="flex items-center justify-between py-2">
                      <span className="text-sm text-gray-600 capitalize">{key === 'inApp' ? 'In-App' : key}</span>
                      <button onClick={() => setLocalPrefs({ ...localPrefs, [key]: !localPrefs[key] })}
                        className={`relative inline-flex h-6 w-10 items-center rounded-full transition-colors ${localPrefs[key] ? 'bg-[#D4AF37]' : 'bg-gray-200'}`}>
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${localPrefs[key] ? 'translate-x-5' : 'translate-x-1'}`} />
                      </button>
                    </label>
                  ))}
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Categories</h3>
                  {(['newJobs', 'applications', 'invitations', 'payments', 'messages', 'system'] as const).map(key => (
                    <label key={key} className="flex items-center justify-between py-2">
                      <span className="text-sm text-gray-600 capitalize">{key === 'newJobs' ? 'New Jobs' : key}</span>
                      <button onClick={() => setLocalPrefs({ ...localPrefs, [key]: !localPrefs[key] })}
                        className={`relative inline-flex h-6 w-10 items-center rounded-full transition-colors ${localPrefs[key] ? 'bg-[#D4AF37]' : 'bg-gray-200'}`}>
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${localPrefs[key] ? 'translate-x-5' : 'translate-x-1'}`} />
                      </button>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowSettings(false)} className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm">Cancel</button>
                <button onClick={handleSavePrefs} className="flex-1 px-4 py-2.5 bg-[#D4AF37] text-white rounded-xl text-sm font-bold">Save</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Notifications;
