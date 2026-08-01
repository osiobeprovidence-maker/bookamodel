/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, type ElementType } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  User, Shield, Bell, CreditCard, Link as LinkIcon,
  Palette, HelpCircle, AlertTriangle, Eye, EyeOff,
  Lock, Smartphone, Globe, Mail, MessageSquare,
  Wallet, Download, Trash2, Power, ChevronRight,
  Check, X, Loader2, Sun, Moon, Monitor,
  CheckCircle2, AlertCircle,   Image as ImageIcon, Instagram, Twitter, Music2, KeyRound, FileText,
} from 'lucide-react';
import { useQuery, useMutation } from 'convex/react';
import { updatePassword, reauthenticateWithCredential, linkWithCredential, EmailAuthProvider, deleteUser } from 'firebase/auth';
import { api } from '../../../convex/_generated/api';
import { auth } from '../../lib/firebase';
import { useUser } from '../../contexts/UserContext';
import {
  isPushSupported,
  requestPushPermission,
  subscribeToPush,
  unsubscribeFromPush,
  subscriptionToArgs,
} from '../../lib/push';

type Tab = 'General' | 'Account' | 'Security' | 'Privacy' | 'Notifications' | 'Wallet & Payments' | 'Connected Accounts' | 'Appearance' | 'Support' | 'Danger Zone';

const tabs: { label: Tab; icon: ElementType; color: string }[] = [
  { label: 'General', icon: User, color: 'text-blue-600 bg-blue-50' },
  { label: 'Account', icon: Eye, color: 'text-purple-600 bg-purple-50' },
  { label: 'Security', icon: Shield, color: 'text-green-600 bg-green-50' },
  { label: 'Privacy', icon: Lock, color: 'text-orange-600 bg-orange-50' },
  { label: 'Notifications', icon: Bell, color: 'text-yellow-600 bg-yellow-50' },
  { label: 'Wallet & Payments', icon: CreditCard, color: 'text-pink-600 bg-pink-50' },
  { label: 'Connected Accounts', icon: LinkIcon, color: 'text-indigo-600 bg-indigo-50' },
  { label: 'Appearance', icon: Palette, color: 'text-teal-600 bg-teal-50' },
  { label: 'Support', icon: HelpCircle, color: 'text-cyan-600 bg-cyan-50' },
  { label: 'Danger Zone', icon: AlertTriangle, color: 'text-red-600 bg-red-50' },
];

const inputClass = 'w-full px-4 py-3 bg-white rounded-xl border border-gray-100 focus:border-[#D4AF37] outline-none transition-all text-sm font-medium';

const fieldLabel = 'block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2';

function Toggle({ enabled, onToggle, disabled }: { enabled: boolean; onToggle: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${enabled ? 'bg-[#D4AF37]' : 'bg-gray-200'} ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
      aria-label="Toggle"
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${enabled ? 'translate-x-5' : ''}`} />
    </button>
  );
}

function ConfirmModal({ open, title, message, onConfirm, onCancel, confirmLabel = 'Confirm', danger }: {
  open: boolean; title: string; message: string; onConfirm: () => void; onCancel: () => void; confirmLabel?: string; danger?: boolean;
}) {
  if (!open) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onCancel}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="mx-4 w-full max-w-sm bg-white rounded-2xl p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`w-12 h-12 ${danger ? 'bg-red-50' : 'bg-gray-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
          <AlertTriangle className={`w-6 h-6 ${danger ? 'text-red-500' : 'text-gray-500'}`} />
        </div>
        <h3 className="text-lg font-bold text-[#111111] text-center mb-2">{title}</h3>
        <p className="text-xs text-gray-400 text-center mb-6 whitespace-pre-line">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-gray-200 transition-all">
            Cancel
          </button>
          <button onClick={onConfirm} className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${danger ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-[#111111] text-white hover:bg-black'}`}>
            {confirmLabel}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-8 right-8 bg-[#111111] text-white px-6 py-4 rounded-xl shadow-xl text-sm font-bold flex items-center gap-3 z-[60]"
    >
      <CheckCircle2 className="w-4 h-4 text-green-400" />
      {message}
      <button onClick={onClose} className="text-gray-400 hover:text-white ml-2"><X className="w-4 h-4" /></button>
    </motion.div>
  );
}

function parseUserAgent(ua: string) {
  let browser = 'Unknown';
  if (/edg/i.test(ua)) browser = 'Edge';
  else if (/chrome|crios/i.test(ua)) browser = 'Chrome';
  else if (/firefox|fxios/i.test(ua)) browser = 'Firefox';
  else if (/safari/i.test(ua)) browser = 'Safari';
  else if (/opera|opr/i.test(ua)) browser = 'Opera';
  let os = 'Unknown';
  if (/windows/i.test(ua)) os = 'Windows';
  else if (/android/i.test(ua)) os = 'Android';
  else if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS';
  else if (/mac os x|macintosh/i.test(ua)) os = 'macOS';
  else if (/linux/i.test(ua)) os = 'Linux';
  let device = 'Desktop';
  if (/android|iphone|ipod/i.test(ua)) device = 'Mobile';
  else if (/ipad|tablet/i.test(ua)) device = 'Tablet';
  return { browser, os, device };
}

const currentSession = parseUserAgent(typeof navigator !== 'undefined' ? navigator.userAgent : '');

export default function Settings() {
  const { convexUser, firebaseUser, logout } = useUser();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('General');
  const [toast, setToast] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ title: string; message: string; onConfirm: () => void; danger?: boolean } | null>(null);

  const userId = convexUser?._id as any | undefined;
  const settingsData = useQuery(api.settings.getSettings, userId ? { userId } : 'skip');
  const notifPrefs = useQuery(api.notifications.getPreferences, userId ? { userId } : 'skip');
  const loginHistory = useQuery(api.settings.getLoginHistory, userId ? { userId } : 'skip');
  const modelProfile = useQuery(api.users.getModelProfile, userId ? { userId } : 'skip');
  const walletData = useQuery(api.wallets.getWallet, userId ? { userId } : 'skip');
  const exportData = useQuery(api.settings.exportMyData, userId ? { userId } : 'skip');
  const categoryOptions = useQuery(api.categories.listActive);

  const updateSettings = useMutation(api.settings.updateSettings);
  const upsertPrefs = useMutation(api.notifications.upsertPreferences);
  const savePushSub = useMutation(api.push.saveSubscription);
  const removePushSub = useMutation(api.push.removeSubscription);
  const saveProfile = useMutation(api.users.saveModelProfile);
  const signOutAllSessions = useMutation(api.settings.signOutAllSessions);
  const deactivateAccount = useMutation(api.settings.deactivateAccount);
  const deleteAccount = useMutation(api.settings.deleteAccount);
  const cancelSubscription = useMutation(api.subscriptions.cancelSubscription);
  const createTicket = useMutation(api.support.createTicket);
  const genRecoveryCodes = useMutation(api.settings.generateRecoveryCodes);

  const settings = settingsData?.settings ?? null;
  const completion = settingsData?.completion ?? null;
  const plan = settingsData?.plan ?? { isPro: false, planName: 'Free', expiresAt: null };
  const wallet = walletData ?? null;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // ---------- General ----------
  const [generalForm, setGeneralForm] = useState({
    displayName: '', username: '', bio: '', country: '', state: '', city: '',
    language: 'English', timezone: 'WAT (UTC+1)', defaultCategory: '',
  });
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [usernameBlurred, setUsernameBlurred] = useState('');
  const usernameTaken = useQuery(
    api.settings.isUsernameTaken,
    userId && usernameBlurred ? { userId, username: usernameBlurred } : 'skip'
  );

  useEffect(() => {
    if (!settings || !settingsData) return;
    setGeneralForm((prev) => ({
      ...prev,
      displayName: modelProfile?.displayName || settingsData.user?.name || prev.displayName,
      username: settings.general.username || modelProfile?.username || prev.username,
      bio: modelProfile?.bio || prev.bio,
      country: settings.general.country || modelProfile?.country || prev.country,
      state: modelProfile?.state || prev.state,
      city: modelProfile?.city || prev.city,
      language: settings.general.language || prev.language,
      timezone: settings.general.timezone || prev.timezone,
      defaultCategory: settings.general.defaultCategory || prev.defaultCategory,
    }));
  }, [settings, settingsData, modelProfile]);

  const saveGeneral = async () => {
    if (!userId) return;
    if (!generalForm.displayName.trim()) {
      setGeneralError('Display name is required');
      return;
    }
    const username = generalForm.username.trim();
    if (username && !/^[a-zA-Z0-9_.]{3,20}$/.test(username)) {
      setGeneralError('Username must be 3-20 characters (letters, numbers, _ or .)');
      return;
    }
    if (usernameBlurred && usernameTaken) {
      setGeneralError('That username is already taken');
      return;
    }
    setSaving(true);
    setGeneralError(null);
    try {
      await saveProfile({
        userId,
        displayName: generalForm.displayName.trim(),
        username: username || undefined,
        bio: generalForm.bio.trim() || undefined,
        country: generalForm.country || undefined,
        state: generalForm.state || undefined,
        city: generalForm.city || undefined,
        phone: convexUser?.phone || undefined,
      });
      await updateSettings({
        userId,
        general: {
          username: username || undefined,
          language: generalForm.language,
          timezone: generalForm.timezone,
          country: generalForm.country,
          defaultCategory: generalForm.defaultCategory || undefined,
        },
      });
      showToast('Changes saved successfully');
    } catch (err) {
      console.error(err);
      setGeneralError('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  // ---------- Account / Privacy / Appearance sections ----------
  const [account, setAccount] = useState({ profileVisibility: true, publicPortfolio: true, brandDiscovery: true, autoAcceptVerifiedOnly: false });
  const [privacy, setPrivacy] = useState({ showEmail: false, showPhone: false, allowBrandMessages: true, allowProfileSearch: true, hideMeasurements: false, hideAge: true, showSocialLinks: true });
  const [appearance, setAppearance] = useState({ theme: 'light', density: 'comfortable', cardRadius: 'default', animations: true });

  useEffect(() => {
    if (settings) {
      setAccount(settings.account);
      setPrivacy(settings.privacy);
      setAppearance(settings.appearance);
    }
  }, [settings]);

  const persistSection = async (section: 'account' | 'privacy' | 'appearance', values: any, successMsg: string) => {
    if (!userId) return;
    try {
      await updateSettings({ userId, [section]: values });
      showToast(successMsg);
    } catch (err) {
      console.error(err);
      showToast('Failed to save. Please try again.');
      if (settings) {
        if (section === 'account') setAccount(settings.account);
        else if (section === 'privacy') setPrivacy(settings.privacy);
        else setAppearance(settings.appearance);
      }
    }
  };

  const toggleAccount = (key: keyof typeof account) => {
    const next = { ...account, [key]: !account[key] };
    setAccount(next);
    persistSection('account', next, 'Account settings saved');
  };

  const togglePrivacy = (key: keyof typeof privacy) => {
    const next = { ...privacy, [key]: !privacy[key] };
    setPrivacy(next);
    persistSection('privacy', next, 'Privacy settings saved');
  };

  const selectAppearance = (key: string, value: string) => {
    const next = { ...appearance, [key]: value };
    setAppearance(next);
    persistSection('appearance', next, 'Appearance saved');
  };

  // ---------- Security ----------
  const [passwordForm, setPasswordForm] = useState({ current: '', newPass: '', confirm: '' });
  const [twoFactor, setTwoFactor] = useState(false);
  const [twoFactorMethod, setTwoFactorMethod] = useState('email');
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null);
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    if (settings) {
      setTwoFactor(settings.twoFactorEnabled);
      setTwoFactorMethod(settings.twoFactorMethod);
    }
  }, [settings]);

  const hasPasswordProvider = (firebaseUser?.providerData ?? []).some((p) => p.providerId === 'password');

  const handlePasswordSubmit = async () => {
    const user = auth.currentUser;
    if (!user) return;
    const pass = passwordForm.newPass;
    if (pass.length < 8 || !/[A-Z]/.test(pass) || !/[a-z]/.test(pass) || !/[0-9]/.test(pass) || !/[^A-Za-z0-9]/.test(pass)) {
      setPasswordError('Password must be 8+ chars with uppercase, lowercase, number and special character');
      return;
    }
    if (pass !== passwordForm.confirm) {
      setPasswordError('Passwords do not match');
      return;
    }
    setPasswordLoading(true);
    setPasswordError(null);
    try {
      if (hasPasswordProvider) {
        await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email || '', passwordForm.current));
        await updatePassword(user, pass);
        showToast('Password updated successfully');
      } else {
        await linkWithCredential(user, EmailAuthProvider.credential(user.email || '', pass));
        showToast('Password set successfully. You can now sign in with email and password.');
      }
      setPasswordForm({ current: '', newPass: '', confirm: '' });
    } catch (err: any) {
      const code = err?.code || '';
      if (code === 'auth/wrong-password' || code === 'auth/invalid-credential' || code === 'auth/invalid-login-credentials') {
        setPasswordError('Current password is incorrect');
      } else if (code === 'auth/requires-recent-login') {
        setPasswordError('Please sign out and sign back in, then try again');
      } else if (code === 'auth/email-already-in-use' || code === 'auth/credential-already-in-use') {
        setPasswordError('This email already has a password set');
      } else {
        setPasswordError(err?.message || 'Failed to update password');
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleToggleTwoFactor = async () => {
    if (!userId) return;
    if (twoFactor) {
      setTwoFactor(false);
      try {
        await updateSettings({ userId, twoFactorEnabled: false });
        showToast('Two-factor authentication disabled');
      } catch {
        setTwoFactor(true);
        showToast('Failed to disable 2FA');
      }
    } else {
      setConfirmModal({
        title: 'Enable Two-Factor Authentication?',
        message: `Codes will be delivered via ${twoFactorMethod === 'email' ? 'email (once the email delivery service is configured)' : 'your authenticator app'}. You will also receive recovery codes — keep them safe.`,
        onConfirm: async () => {
          setConfirmModal(null);
          try {
            const res = await genRecoveryCodes({ userId });
            setRecoveryCodes(res.codes);
            setTwoFactor(true);
            showToast('2FA enabled — save your recovery codes');
          } catch {
            showToast('Failed to enable 2FA');
          }
        },
      });
    }
  };

  // ---------- Notifications ----------
  const [notifications, setNotifications] = useState<Record<string, boolean>>({});
  useEffect(() => {
    if (notifPrefs) {
      const next: Record<string, boolean> = {};
      const keys = ['inApp', 'push', 'email', 'sms', 'whatsapp', 'newJobs', 'applications', 'invitations', 'payments', 'messages', 'system', 'marketing', 'verificationUpdates', 'systemUpdates', 'weeklySummary', 'monthlyInsights'];
      for (const k of keys) next[k] = notifPrefs[k] ?? false;
      setNotifications(next);
    }
  }, [notifPrefs]);

  const toggleNotification = async (key: string) => {
    if (!userId) return;
    let enabled = !notifications[key];
    if (key === 'push') {
      if (!isPushSupported()) {
        showToast('Push notifications are not supported by this browser', 'error');
        return;
      }
      if (enabled) {
        const perm = await requestPushPermission();
        if (perm !== 'granted') {
          showToast('Push permission was not granted by the browser', 'error');
          return;
        }
        try {
          const subscription = await subscribeToPush();
          if (!subscription) {
            showToast('Could not create a push subscription', 'error');
            return;
          }
          await savePushSub({
            userId,
            ...subscriptionToArgs(subscription, 'browser'),
            userAgent: navigator.userAgent.slice(0, 300),
          });
        } catch {
          showToast('Could not register this device for push notifications', 'error');
          return;
        }
      } else {
        try {
          const subscription = await unsubscribeFromPush();
          if (subscription) {
            await removePushSub({ endpoint: subscription.endpoint });
          }
        } catch {
          showToast('Could not remove the push subscription', 'error');
          return;
        }
      }
    }
    setNotifications((n) => ({ ...n, [key]: enabled }));
    try {
      await upsertPrefs({ userId, [key]: enabled });
      showToast(enabled ? 'Push notifications enabled' : 'Push notifications disabled');
    } catch {
      showToast('Failed to save preference');
    }
  };

  // ---------- Danger zone ----------
  const [deleteInput, setDeleteInput] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [dangerBusy, setDangerBusy] = useState(false);

  const handleDeactivate = async () => {
    if (!userId) return;
    setDangerBusy(true);
    try {
      const user = auth.currentUser;
      if (user && hasPasswordProvider) {
        await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email || '', deletePassword));
      }
      await deactivateAccount({ userId });
      showToast('Account deactivated. You can reactivate by signing back in.');
      setTimeout(async () => {
        await logout();
        navigate('/');
      }, 1200);
    } catch (err: any) {
      showToast(err?.code === 'auth/wrong-password' || err?.code === 'auth/invalid-credential' ? 'Password is incorrect' : 'Failed to deactivate account');
    } finally {
      setDangerBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!userId) return;
    if (deleteInput !== 'DELETE') {
      showToast('Type DELETE to confirm');
      return;
    }
    setDangerBusy(true);
    try {
      const user = auth.currentUser;
      if (user && hasPasswordProvider) {
        await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email || '', deletePassword));
      }
      await deleteAccount({ userId });
      if (user) {
        try {
          await deleteUser(user);
        } catch {
          // Convex data is already removed; firebase session is cleared below
        }
      }
      await logout();
      navigate('/');
    } catch (err: any) {
      setDangerBusy(false);
      showToast(err?.code === 'auth/wrong-password' || err?.code === 'auth/invalid-credential' ? 'Password is incorrect' : 'Failed to delete account');
    }
  };

  const downloadData = async (scope: 'all' | 'portfolio') => {
    if (!exportData) {
      showToast('Data is still loading — try again in a moment');
      return;
    }
    try {
      const payload = scope === 'portfolio' ? { exportedAt: exportData.exportedAt, portfolioItems: exportData.portfolioItems } : exportData;
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = scope === 'portfolio' ? 'bookamodel-portfolio.json' : 'bookamodel-my-data.json';
      a.click();
      URL.revokeObjectURL(url);
      showToast(scope === 'portfolio' ? 'Portfolio exported' : 'Your data is being downloaded');
    } catch {
      showToast('Failed to export data');
    }
  };

  // ---------- Support ----------
  const [ticketModal, setTicketModal] = useState<{ subject: string } | null>(null);
  const [ticketForm, setTicketForm] = useState({ subject: '', message: '', priority: 'medium' });
  const [ticketBusy, setTicketBusy] = useState(false);

  const submitTicket = async () => {
    if (!userId) return;
    if (!ticketForm.subject.trim() || !ticketForm.message.trim()) {
      showToast('Subject and message are required');
      return;
    }
    setTicketBusy(true);
    try {
      await createTicket({ userId, subject: ticketForm.subject.trim(), message: ticketForm.message.trim(), priority: ticketForm.priority as any });
      showToast('Ticket submitted — our team will follow up');
      setTicketModal(null);
      setTicketForm({ subject: '', message: '', priority: 'medium' });
    } catch {
      showToast('Failed to submit ticket');
    } finally {
      setTicketBusy(false);
    }
  };

  const renderToggleRow = (
    label: string, description: string, enabled: boolean, onToggle: () => void, disabled?: boolean,
  ) => (
    <div className="flex items-center justify-between py-4 border-b border-gray-50 last:border-0">
      <div>
        <p className="text-sm font-bold text-[#111111]">{label}</p>
        <p className="text-xs text-gray-400 mt-0.5">{description}</p>
      </div>
      <Toggle enabled={enabled} onToggle={onToggle} disabled={disabled} />
    </div>
  );

  const socialConnections = [
    { key: 'instagram', label: 'Instagram', icon: Instagram, color: 'bg-pink-50 text-pink-600', value: modelProfile?.socials?.instagram || '' },
    { key: 'twitter', label: 'X (Twitter)', icon: Twitter, color: 'bg-gray-100 text-gray-700', value: modelProfile?.socials?.twitter || '' },
    { key: 'tiktok', label: 'TikTok', icon: Music2, color: 'bg-gray-100 text-black', value: modelProfile?.socials?.tiktok || '' },
  ];
  const [socialModal, setSocialModal] = useState<{ key: string; label: string; value: string } | null>(null);

  const saveSocial = async () => {
    if (!userId || !socialModal) return;
    const socials = {
      instagram: socialModal.key === 'instagram' ? socialModal.value.trim() : modelProfile?.socials?.instagram,
      twitter: socialModal.key === 'twitter' ? socialModal.value.trim() : modelProfile?.socials?.twitter,
      tiktok: socialModal.key === 'tiktok' ? socialModal.value.trim() : modelProfile?.socials?.tiktok,
    };
    try {
      await saveProfile({
        userId,
        displayName: modelProfile?.displayName || convexUser?.name || '',
        socials: socials as any,
      });
      showToast(`${socialModal.label} ${socialModal.value.trim() ? 'connected' : 'disconnected'}`);
      setSocialModal(null);
    } catch {
      showToast('Failed to update social link');
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'General':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-bold tracking-tight text-[#111111]">General Settings</h3>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={fieldLabel}>Display Name *</label>
                  <input type="text" value={generalForm.displayName} onChange={(e) => setGeneralForm({ ...generalForm, displayName: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={fieldLabel}>Username</label>
                  <input
                    type="text"
                    value={generalForm.username}
                    onBlur={() => setUsernameBlurred(generalForm.username.trim())}
                    onChange={(e) => setGeneralForm({ ...generalForm, username: e.target.value })}
                    className={inputClass}
                    placeholder="your-username"
                  />
                  {usernameBlurred && usernameTaken && (
                    <p className="text-xs font-semibold text-red-500 mt-1">This username is already taken</p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className={fieldLabel}>Bio</label>
                  <textarea value={generalForm.bio} onChange={(e) => setGeneralForm({ ...generalForm, bio: e.target.value })} rows={3} className={`${inputClass} resize-none`} placeholder="Short bio shown on your public profile" />
                </div>
                <div>
                  <label className={fieldLabel}>Country</label>
                  <select value={generalForm.country} onChange={(e) => setGeneralForm({ ...generalForm, country: e.target.value })} className={`${inputClass} appearance-none`}>
                    <option value="">Select country</option>
                    <option>Nigeria</option>
                    <option>Ghana</option>
                    <option>South Africa</option>
                    <option>Kenya</option>
                    <option>United Kingdom</option>
                    <option>United States</option>
                  </select>
                </div>
                <div>
                  <label className={fieldLabel}>State</label>
                  <input type="text" value={generalForm.state} onChange={(e) => setGeneralForm({ ...generalForm, state: e.target.value })} className={inputClass} placeholder="e.g. Delta" />
                </div>
                <div>
                  <label className={fieldLabel}>City</label>
                  <input type="text" value={generalForm.city} onChange={(e) => setGeneralForm({ ...generalForm, city: e.target.value })} className={inputClass} placeholder="e.g. Warri" />
                </div>
                <div>
                  <label className={fieldLabel}>Language</label>
                  <select value={generalForm.language} onChange={(e) => setGeneralForm({ ...generalForm, language: e.target.value })} className={`${inputClass} appearance-none`}>
                    <option>English</option>
                    <option>Pidgin</option>
                    <option>Yoruba</option>
                    <option>Igbo</option>
                    <option>Hausa</option>
                  </select>
                </div>
                <div>
                  <label className={fieldLabel}>Time Zone</label>
                  <select value={generalForm.timezone} onChange={(e) => setGeneralForm({ ...generalForm, timezone: e.target.value })} className={`${inputClass} appearance-none`}>
                    <option>WAT (UTC+1)</option>
                    <option>GMT (UTC+0)</option>
                    <option>CET (UTC+1)</option>
                    <option>EST (UTC-5)</option>
                  </select>
                </div>
                <div>
                  <label className={fieldLabel}>Default Category</label>
                  <select value={generalForm.defaultCategory} onChange={(e) => setGeneralForm({ ...generalForm, defaultCategory: e.target.value })} className={`${inputClass} appearance-none`}>
                    <option value="">No default</option>
                    {(categoryOptions ?? []).map((c: any) => (
                      <option key={c._id} value={c.slug}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              {generalError && <p className="text-xs font-semibold text-red-500 mt-4">{generalError}</p>}
              <div className="flex gap-3 mt-6">
                <button onClick={saveGeneral} disabled={saving} className="bg-[#111111] text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-black transition-all active:scale-95 disabled:opacity-50">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin inline" /> : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        );

      case 'Account':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-bold tracking-tight text-[#111111]">Account Settings</h3>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 divide-y divide-gray-50">
              {renderToggleRow('Profile Visibility', 'Hide your profile from searches, brands and recommendations', account.profileVisibility, () => toggleAccount('profileVisibility'))}
              {renderToggleRow('Public Portfolio', 'When off, only you can view your portfolio', account.publicPortfolio, () => toggleAccount('publicPortfolio'))}
              {renderToggleRow('Brand Discovery', 'Exclude yourself from search, recommendations and filters', account.brandDiscovery, () => toggleAccount('brandDiscovery'))}
              {renderToggleRow('Auto Accept Invitations', 'Automatically accept collaboration requests from verified brands only', account.autoAcceptVerifiedOnly, () => toggleAccount('autoAcceptVerifiedOnly'))}
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h4 className="text-sm font-bold text-[#111111] mb-3">Profile Completion</h4>
              <div className="flex items-center gap-4 mb-3">
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#D4AF37] transition-all duration-500" style={{ width: `${completion?.percent ?? 0}%` }} />
                </div>
                <span className="text-xs font-extrabold text-[#D4AF37]">{completion?.percent ?? 0}%</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(completion?.items ?? []).map((item) => (
                  <div key={item.label} className="flex items-center gap-2 text-xs text-gray-500">
                    {item.done ? <Check className="w-3.5 h-3.5 text-green-500" /> : <AlertCircle className="w-3.5 h-3.5 text-gray-300" />}
                    {item.label}
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-3">Completion updates automatically as your profile grows.</p>
            </div>
          </div>
        );

      case 'Security':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-bold tracking-tight text-[#111111]">Security</h3>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 rounded-xl bg-green-50"><Lock className="w-4 h-4 text-green-600" /></div>
                <div>
                  <h4 className="text-sm font-bold text-[#111111]">{hasPasswordProvider ? 'Change Password' : 'Set Password'}</h4>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {hasPasswordProvider ? 'Update the password you use to sign in' : 'You signed up with Google. Set a password to also sign in with email and password.'}
                  </p>
                </div>
              </div>
              <div className="space-y-4 max-w-md">
                {hasPasswordProvider && (
                  <div>
                    <label className={fieldLabel}>Current Password</label>
                    <div className="relative">
                      <input type={showCurrentPass ? 'text' : 'password'} value={passwordForm.current} onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })} className={`${inputClass} pr-10`} />
                      <button type="button" onClick={() => setShowCurrentPass(!showCurrentPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}
                <div>
                  <label className={fieldLabel}>New Password</label>
                  <div className="relative">
                    <input type={showNewPass ? 'text' : 'password'} value={passwordForm.newPass} onChange={(e) => setPasswordForm({ ...passwordForm, newPass: e.target.value })} className={`${inputClass} pr-10`} />
                    <button type="button" onClick={() => setShowNewPass(!showNewPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">Minimum 8 characters with uppercase, lowercase, number and special character.</p>
                </div>
                <div>
                  <label className={fieldLabel}>Confirm Password</label>
                  <input type="password" value={passwordForm.confirm} onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })} className={inputClass} />
                </div>
                {passwordError && <p className="text-xs font-semibold text-red-500">{passwordError}</p>}
                <button onClick={handlePasswordSubmit} disabled={passwordLoading} className="bg-[#111111] text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-black transition-all active:scale-95 disabled:opacity-50">
                  {passwordLoading ? <Loader2 className="w-4 h-4 animate-spin inline" /> : hasPasswordProvider ? 'Update Password' : 'Set Password'}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-blue-50"><Smartphone className="w-4 h-4 text-blue-600" /></div>
                  <div>
                    <h4 className="text-sm font-bold text-[#111111]">Two-Factor Authentication</h4>
                    <p className="text-xs text-gray-400 mt-0.5">Protect your account with a second verification step</p>
                  </div>
                </div>
                <Toggle enabled={twoFactor} onToggle={handleToggleTwoFactor} />
              </div>
              {twoFactor && (
                <div className="space-y-4">
                  <div className="flex gap-3 flex-wrap">
                    {[
                      { key: 'email', label: 'Email OTP' },
                      { key: 'authenticator', label: 'Authenticator App (soon)' },
                    ].map((m) => (
                      <button key={m.key} onClick={() => m.key !== 'authenticator' && setTwoFactorMethod(m.key)} disabled={m.key === 'authenticator'}
                        className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${twoFactorMethod === m.key ? 'bg-[#D4AF37] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'} ${m.key === 'authenticator' ? 'opacity-40 cursor-not-allowed' : ''}`}>
                        {m.label}
                      </button>
                    ))}
                  </div>
                  {recoveryCodes && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-xs font-bold text-[#111111] mb-2">Recovery codes — save these somewhere safe. Each can be used once.</p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {recoveryCodes.map((c) => (
                          <code key={c} className="text-xs font-mono bg-white border border-gray-100 rounded-lg px-2 py-1.5 text-center">{c}</code>
                        ))}
                      </div>
                    </div>
                  )}
                  <p className="text-xs text-gray-400">Email OTP codes are delivered to your account email. Delivery activates when the platform email service is configured — recovery codes work immediately.</p>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 rounded-xl bg-purple-50"><Globe className="w-4 h-4 text-purple-600" /></div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-[#111111]">Active Sessions</h4>
                  <p className="text-xs text-gray-400 mt-0.5">Sign out every other device where you are signed in</p>
                </div>
                <button
                  onClick={() => setConfirmModal({
                    title: 'Sign out all devices?',
                    message: 'You will be signed out everywhere, including this device.',
                    danger: true,
                    onConfirm: async () => {
                      setConfirmModal(null);
                      if (!userId) return;
                      try {
                        await signOutAllSessions({ userId });
                        showToast('All sessions signed out');
                        setTimeout(async () => { await logout(); navigate('/login'); }, 800);
                      } catch { showToast('Failed to sign out sessions'); }
                    },
                  })}
                  className="text-[10px] font-bold text-red-500 uppercase tracking-widest hover:text-red-600 shrink-0"
                >
                  Sign out all devices
                </button>
              </div>
              <div className="flex items-center justify-between gap-3 p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-gray-100 shrink-0">
                    <Smartphone className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[#111111] truncate">{currentSession.device} • {currentSession.browser}</p>
                    <p className="text-xs text-gray-400 truncate">{currentSession.os} • {Intl.DateTimeFormat().resolvedOptions().timeZone || 'Unknown location'}</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-[10px] font-bold uppercase tracking-widest shrink-0">Current</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 rounded-xl bg-orange-50"><Shield className="w-4 h-4 text-orange-600" /></div>
                <h4 className="text-sm font-bold text-[#111111]">Login History</h4>
              </div>
              {(!loginHistory || loginHistory.length === 0) ? (
                <p className="text-xs text-gray-400 py-4 text-center">No login events recorded yet. Logins will appear here automatically.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-gray-100">
                        {['Device', 'Browser', 'OS', 'Location', 'Time', 'Status'].map((h) => (
                          <th key={h} className="pb-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(loginHistory ?? []).map((row: any, i: number) => (
                        <tr key={row._id || i} className="border-b border-gray-50 last:border-0">
                          <td className="py-3 text-xs text-gray-500">{row.device}</td>
                          <td className="py-3 text-xs text-gray-500">{row.browser}</td>
                          <td className="py-3 text-xs text-gray-500">{row.os}</td>
                          <td className="py-3 text-xs text-gray-500">{row.location || '—'}</td>
                          <td className="py-3 text-xs text-gray-500">{new Date(row.createdAt).toLocaleString()}</td>
                          <td className="py-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${row.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                              {row.success ? 'Success' : 'Failed'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        );

      case 'Privacy':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-bold tracking-tight text-[#111111]">Privacy Settings</h3>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 divide-y divide-gray-50">
              {renderToggleRow('Show Email', 'Display your email on your public profile', privacy.showEmail, () => togglePrivacy('showEmail'))}
              {renderToggleRow('Show Phone Number', 'Hide your phone number from everyone except Pro members and verified clients', privacy.showPhone, () => togglePrivacy('showPhone'))}
              {renderToggleRow('Allow Brand Messages', 'When off, brands cannot message you directly', privacy.allowBrandMessages, () => togglePrivacy('allowBrandMessages'))}
              {renderToggleRow('Allow Profile Search', 'Remove your profile from internal search and recommendations', privacy.allowProfileSearch, () => togglePrivacy('allowProfileSearch'))}
              {renderToggleRow('Hide Measurements', 'Height, bust, waist, hips, dress and shoe size disappear from your public profile', privacy.hideMeasurements, () => togglePrivacy('hideMeasurements'))}
              {renderToggleRow('Hide Age', 'Hide your age from your public profile', privacy.hideAge, () => togglePrivacy('hideAge'))}
              {renderToggleRow('Show Social Links', 'Hide Instagram, TikTok and X links from your public profile', privacy.showSocialLinks, () => togglePrivacy('showSocialLinks'))}
            </div>
          </div>
        );

      case 'Notifications':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-bold tracking-tight text-[#111111]">Notification Preferences</h3>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Channels</h4>
              {renderToggleRow('In-App Notifications', 'Show notifications inside BookAModel', !!notifications.inApp, () => toggleNotification('inApp'))}
              {renderToggleRow('Push Notifications', 'Browser notifications — requests permission when enabled', !!notifications.push, () => toggleNotification('push'))}
              {renderToggleRow('Email Notifications', 'Receive notifications via email', !!notifications.email, () => toggleNotification('email'))}
              {renderToggleRow('SMS Notifications', 'Receive notifications via SMS (provider integration)', !!notifications.sms, () => toggleNotification('sms'))}
              {renderToggleRow('WhatsApp Notifications', 'Receive notifications via WhatsApp', !!notifications.whatsapp, () => toggleNotification('whatsapp'))}
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Topics</h4>
              {renderToggleRow('Application Updates', 'Application viewed, shortlisted, accepted or rejected', !!notifications.applications, () => toggleNotification('applications'))}
              {renderToggleRow('Job Invites', 'New invitations, accepted, expired or cancelled', !!notifications.invitations, () => toggleNotification('invitations'))}
              {renderToggleRow('New Jobs', 'New casting opportunities matching your profile', !!notifications.newJobs, () => toggleNotification('newJobs'))}
              {renderToggleRow('Payment Alerts', 'Withdrawals, deposits, completed payments and refunds', !!notifications.payments, () => toggleNotification('payments'))}
              {renderToggleRow('Messages', 'New direct messages', !!notifications.messages, () => toggleNotification('messages'))}
              {renderToggleRow('Verification Updates', 'Verification approved or rejected', !!notifications.verificationUpdates, () => toggleNotification('verificationUpdates'))}
              {renderToggleRow('System Updates', 'Important platform announcements', !!notifications.system, () => toggleNotification('system'))}
              {renderToggleRow('Marketing Emails', 'Newsletters, promotions and campaigns', !!notifications.marketing, () => toggleNotification('marketing'))}
              {renderToggleRow('Weekly Summary', 'Monday digest of applications, views, messages and earnings', !!notifications.weeklySummary, () => toggleNotification('weeklySummary'))}
              {renderToggleRow('Monthly Insights', 'Monthly performance insights', !!notifications.monthlyInsights, () => toggleNotification('monthlyInsights'))}
            </div>
          </div>
        );

      case 'Wallet & Payments':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-bold tracking-tight text-[#111111]">Wallet & Payments</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                <h4 className="text-sm font-bold text-[#111111]">Current Plan</h4>
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 ${plan.isPro ? 'bg-[#D4AF37]/10' : 'bg-gray-100'} rounded-xl flex items-center justify-center`}>
                    <span className={`text-sm font-black ${plan.isPro ? 'text-[#D4AF37]' : 'text-gray-400'}`}>{plan.isPro ? 'P' : 'F'}</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#111111]">{plan.planName}</p>
                    <p className="text-xs text-gray-400">
                      {plan.expiresAt ? `Renews ${new Date(plan.expiresAt).toLocaleDateString('en-GB')}` : 'No renewal date'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => navigate('/model-dashboard/go-pro')} className="flex-1 bg-[#D4AF37] text-white py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#c9a430] transition-all active:scale-95">
                    {plan.isPro ? 'Upgrade Plan' : 'Upgrade to Pro'}
                  </button>
                  {plan.isPro && (
                    <button
                      onClick={() => setConfirmModal({
                        title: 'Cancel subscription?',
                        message: `Your ${plan.planName} subscription will be cancelled. Pro benefits remain active until ${plan.expiresAt ? new Date(plan.expiresAt).toLocaleDateString('en-GB') : 'the renewal date'}.`,
                        danger: true,
                        onConfirm: async () => {
                          setConfirmModal(null);
                          if (!userId) return;
                          try {
                            await cancelSubscription({ userId });
                            showToast('Subscription cancelled');
                          } catch { showToast('Failed to cancel subscription'); }
                        },
                      })}
                      className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-red-100 transition-all"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                <h4 className="text-sm font-bold text-[#111111]">Wallet Balance</h4>
                <p className="text-3xl font-black text-[#111111]">₦{(wallet?.balance ?? 0).toLocaleString()}</p>
                <p className="text-xs text-gray-400">Funds, bookings and payouts are managed in your wallet.</p>
                <div className="flex gap-3">
                  <button onClick={() => navigate('/model-dashboard/wallet')} className="flex-1 bg-[#111111] text-white py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-black transition-all active:scale-95">
                    Open Wallet
                  </button>
                </div>
                <p className="text-[10px] text-gray-400">Cards and bank accounts are handled securely at checkout via Paystack.</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h4 className="text-sm font-bold text-[#111111] mb-4">Recent Transactions</h4>
              {(!wallet?.transactions || wallet.transactions.length === 0) ? (
                <p className="text-xs text-gray-400 py-4 text-center">No transactions yet. Fund your wallet to get started.</p>
              ) : (
                <div className="divide-y divide-gray-50">
                  {(wallet.transactions as any[]).slice(0, 5).map((tx: any) => (
                    <div key={tx._id} className="flex items-center justify-between py-3">
                      <div>
                        <p className="text-sm font-bold text-[#111111] capitalize">{tx.description || tx.type}</p>
                        <p className="text-xs text-gray-400">{new Date(tx.createdAt).toLocaleDateString('en-GB')}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-extrabold ${tx.direction === 'credit' ? 'text-green-600' : 'text-gray-500'}`}>
                          {tx.direction === 'credit' ? '+' : '−'}₦{tx.amount.toLocaleString()}
                        </p>
                        <span className={`text-[10px] font-bold uppercase ${tx.status === 'completed' ? 'text-green-600' : tx.status === 'failed' ? 'text-red-500' : 'text-yellow-600'}`}>{tx.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 'Connected Accounts':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-bold tracking-tight text-[#111111]">Connected Accounts</h3>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center"><span className="text-sm font-black">G</span></div>
                  <div>
                    <p className="text-sm font-bold text-[#111111]">Google</p>
                    <p className={`text-xs font-medium ${hasPasswordProvider ? 'text-gray-400' : 'text-green-600'}`}>
                      {hasPasswordProvider ? 'Connected (primary sign-in)' : 'Connected'}
                    </p>
                  </div>
                </div>
                <button disabled className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest bg-gray-100 text-gray-400 cursor-not-allowed">
                  Primary
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center"><KeyRound className="w-5 h-5" /></div>
                  <div>
                    <p className="text-sm font-bold text-[#111111]">Email & Password</p>
                    <p className={`text-xs font-medium ${hasPasswordProvider ? 'text-green-600' : 'text-gray-400'}`}>
                      {hasPasswordProvider ? 'Connected' : 'Not set — add one in Security'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="border-t border-gray-100" />
              <p className="text-xs text-gray-400">Social profiles below are shown on your public page.</p>
              {socialConnections.map((acc) => (
                <div key={acc.key} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${acc.color}`}><acc.icon className="w-5 h-5" /></div>
                    <div>
                      <p className="text-sm font-bold text-[#111111]">{acc.label}</p>
                      <p className={`text-xs font-medium ${acc.value ? 'text-green-600' : 'text-gray-400'}`}>
                        {acc.value ? `Connected • @${acc.value.replace('@', '')}` : 'Not connected'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSocialModal({ key: acc.key, label: acc.label, value: acc.value })}
                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${acc.value ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-[#111111] text-white hover:bg-black'}`}
                  >
                    {acc.value ? 'Disconnect' : 'Connect'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        );

      case 'Appearance':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-bold tracking-tight text-[#111111]">Appearance</h3>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
              <div>
                <label className={fieldLabel}>Theme</label>
                <div className="flex gap-3">
                  {[
                    { key: 'light', label: 'Light', icon: Sun },
                    { key: 'dark', label: 'Dark', icon: Moon },
                    { key: 'system', label: 'System', icon: Monitor },
                  ].map((t) => (
                    <button key={t.key} onClick={() => selectAppearance('theme', t.key)} className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${appearance.theme === t.key ? 'border-[#D4AF37] bg-[#D4AF37]/5' : 'border-gray-100 hover:border-gray-200'}`}>
                      <t.icon className={`w-5 h-5 ${appearance.theme === t.key ? 'text-[#D4AF37]' : 'text-gray-400'}`} />
                      <span className="text-xs font-bold">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className={fieldLabel}>Dashboard Density</label>
                <div className="flex gap-3">
                  {['comfortable', 'compact'].map((d) => (
                    <button key={d} onClick={() => selectAppearance('density', d)} className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest border-2 transition-all ${appearance.density === d ? 'border-[#111111] bg-[#111111] text-white' : 'border-gray-100 text-gray-500 hover:border-gray-200'}`}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className={fieldLabel}>Card Radius</label>
                <div className="flex gap-3">
                  {[{ key: 'default', label: 'Default' }, { key: 'rounded', label: 'Rounded' }, { key: 'rounder', label: 'Rounder' }].map((r) => (
                    <button key={r.key} onClick={() => selectAppearance('cardRadius', r.key)} className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest border-2 transition-all ${appearance.cardRadius === r.key ? 'border-[#D4AF37] bg-[#D4AF37]/5 text-[#111111]' : 'border-gray-100 text-gray-500 hover:border-gray-200'}`}>
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
              {renderToggleRow('Animations', 'Enable motion and transition effects', appearance.animations, () => {
                const next = { ...appearance, animations: !appearance.animations };
                setAppearance(next);
                persistSection('appearance', next, 'Appearance saved');
              })}
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h4 className="text-sm font-bold text-[#111111] mb-4">Live Preview</h4>
              <div className={`${appearance.cardRadius === 'rounded' ? 'rounded-2xl' : appearance.cardRadius === 'rounder' ? 'rounded-3xl' : 'rounded-xl'} bg-gray-50 p-6`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#D4AF37] rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-white">{(convexUser?.name || '??').split(' ').map(n => n[0]).join('')}</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#111111]">{convexUser?.name || 'Model'}</p>
                    <p className="text-xs text-gray-400">{modelProfile?.tagline || 'Model'}</p>
                  </div>
                </div>
                <button className={`bg-[#D4AF37] text-white px-4 py-2 text-xs font-bold uppercase tracking-widest ${appearance.cardRadius === 'rounded' ? 'rounded-xl' : appearance.cardRadius === 'rounder' ? 'rounded-2xl' : 'rounded-lg'}`}>
                  Preview Button
                </button>
                <p className="text-[10px] text-gray-400 mt-3">Theme: {appearance.theme} • Density: {appearance.density} • Animations: {appearance.animations ? 'On' : 'Off'}</p>
              </div>
            </div>
          </div>
        );

      case 'Support':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-bold tracking-tight text-[#111111]">Support</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: 'Help Center', desc: 'Browse help articles and guides', icon: HelpCircle, color: 'bg-blue-50 text-blue-600', action: () => navigate('/help') },
                { title: 'Contact Support', desc: 'Open a support ticket', icon: Mail, color: 'bg-green-50 text-green-600', action: () => { setTicketForm({ subject: '', message: '', priority: 'medium' }); setTicketModal({ subject: 'Support request' }); } },
                { title: 'FAQs', desc: 'Frequently asked questions', icon: Globe, color: 'bg-purple-50 text-purple-600', action: () => navigate('/help') },
                { title: 'Report a Bug', desc: 'Report a bug with your browser details', icon: AlertTriangle, color: 'bg-red-50 text-red-600', action: () => { setTicketForm({ subject: 'Bug report', message: `Browser: ${currentSession.browser} • Device: ${currentSession.device} • OS: ${currentSession.os}\n\n`, priority: 'high' }); setTicketModal({ subject: 'Bug report' }); } },
                { title: 'Feature Request', desc: 'Suggest a feature you would love', icon: MessageSquare, color: 'bg-yellow-50 text-yellow-600', action: () => { setTicketForm({ subject: 'Feature request', message: '', priority: 'low' }); setTicketModal({ subject: 'Feature request' }); } },
                { title: 'Delete Data Request', desc: 'Request deletion of your data', icon: Trash2, color: 'bg-red-50 text-red-600', action: () => { setTicketForm({ subject: 'Delete data request', message: '', priority: 'medium' }); setTicketModal({ subject: 'Delete data request' }); } },
                { title: 'Terms of Service', desc: 'Platform terms and conditions', icon: FileText, color: 'bg-gray-100 text-gray-600', action: () => navigate('/terms') },
                { title: 'Privacy Policy', desc: 'How we handle your data', icon: Lock, color: 'bg-gray-100 text-gray-600', action: () => navigate('/privacy') },
              ].map((s) => (
                <button key={s.title} onClick={s.action} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center gap-4 hover:border-[#D4AF37]/30 transition-colors text-left">
                  <div className={`p-2.5 rounded-xl ${s.color}`}><s.icon className="w-4 h-4" /></div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-[#111111]">{s.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{s.desc}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        );

      case 'Danger Zone':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-bold tracking-tight text-[#111111]">Danger Zone</h3>
            <div className="bg-white rounded-2xl border-2 border-red-200 shadow-sm p-6 space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 rounded-xl bg-red-50"><AlertTriangle className="w-4 h-4 text-red-600" /></div>
                <h4 className="text-sm font-bold text-red-600">Danger Zone</h4>
              </div>

              <div className="flex items-center justify-between gap-4 p-4 bg-gray-50 rounded-xl flex-wrap">
                <div>
                  <p className="text-sm font-bold text-[#111111]">Download My Data</p>
                  <p className="text-xs text-gray-400 mt-0.5">Export all your BookAModel data as JSON</p>
                </div>
                <button onClick={() => downloadData('all')} className="flex items-center gap-2 bg-[#111111] text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-black transition-all shrink-0">
                  <Download className="w-3 h-3" /> Export
                </button>
              </div>

              <div className="flex items-center justify-between gap-4 p-4 bg-gray-50 rounded-xl flex-wrap">
                <div>
                  <p className="text-sm font-bold text-[#111111]">Export Portfolio</p>
                  <p className="text-xs text-gray-400 mt-0.5">Download your portfolio items and metadata</p>
                </div>
                <button onClick={() => downloadData('portfolio')} className="flex items-center gap-2 bg-[#111111] text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-black transition-all shrink-0">
                  <ImageIcon className="w-3 h-3" /> Export
                </button>
              </div>

              <div className="flex items-center justify-between gap-4 p-4 bg-gray-50 rounded-xl flex-wrap">
                <div>
                  <p className="text-sm font-bold text-[#111111]">Remove All Sessions</p>
                  <p className="text-xs text-gray-400 mt-0.5">Sign out every device, including this one</p>
                </div>
                <button
                  onClick={() => setConfirmModal({
                    title: 'Sign out all devices?',
                    message: 'You will be signed out everywhere and must sign in again.',
                    danger: true,
                    onConfirm: async () => {
                      setConfirmModal(null);
                      if (!userId) return;
                      await signOutAllSessions({ userId });
                      await logout();
                      navigate('/login');
                    },
                  })}
                  className="flex items-center gap-2 bg-[#111111] text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-black transition-all shrink-0"
                >
                  <Power className="w-3 h-3" /> Sign out
                </button>
              </div>

              <div className="flex items-center justify-between gap-4 p-4 bg-orange-50 rounded-xl flex-wrap">
                <div>
                  <p className="text-sm font-bold text-[#111111]">Deactivate Account</p>
                  <p className="text-xs text-gray-400 mt-0.5">Temporarily disable your account. Data is kept and you can reactivate by signing back in.</p>
                </div>
                <button
                  onClick={() => setConfirmModal({
                    title: 'Deactivate Account?',
                    message: 'Your account will be hidden from the platform. You can reactivate anytime by logging back in.',
                    danger: true,
                    onConfirm: () => setConfirmModal({
                      title: 'Confirm with password',
                      message: hasPasswordProvider ? 'Enter your password to deactivate your account.' : 'Confirm to deactivate your account.',
                      danger: true,
                      onConfirm: handleDeactivate,
                    }),
                  })}
                  className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-orange-600 transition-all shrink-0"
                >
                  <Power className="w-3 h-3" /> Deactivate
                </button>
              </div>

              <div className="flex items-center justify-between gap-4 p-4 bg-red-50 rounded-xl flex-wrap">
                <div>
                  <p className="text-sm font-bold text-[#111111]">Delete Account Permanently</p>
                  <p className="text-xs text-gray-400 mt-0.5">Permanently delete your account, portfolio, messages and all data. This cannot be undone.</p>
                </div>
                <button
                  onClick={() => setConfirmModal({
                    title: 'Delete Account?',
                    message: 'Type DELETE below, then confirm. This permanently removes your account and all associated data.',
                    danger: true,
                    onConfirm: () => setConfirmModal({
                      title: 'Delete Account Permanently',
                      message: '',
                      danger: true,
                      onConfirm: handleDelete,
                    }),
                  })}
                  className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-red-600 transition-all shrink-0"
                >
                  <Trash2 className="w-3 h-3" /> Delete
                </button>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div>
      <header className="mb-10">
        <h1 className="text-3xl font-black tracking-tight text-[#111111]">Settings</h1>
        <p className="text-gray-400 font-medium text-sm mt-1">
          Manage your account, preferences and security. Changes save to your profile instantly.
        </p>
      </header>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-64 shrink-0">
          <nav className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 flex lg:flex-col gap-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.label}
                onClick={() => setActiveTab(tab.label)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeTab === tab.label
                    ? 'bg-[#111111] text-white'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-black'
                }`}
              >
                <tab.icon className="w-4 h-4 shrink-0" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Social link modal */}
      {socialModal && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setSocialModal(null)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="mx-4 w-full max-w-sm bg-white rounded-2xl p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-[#111111] mb-4">{socialModal.value ? `Disconnect ${socialModal.label}?` : `Connect ${socialModal.label}`}</h3>
            {socialModal.value ? (
              <p className="text-xs text-gray-400 mb-6">Your {socialModal.label} handle will be removed from your public profile.</p>
            ) : (
              <input
                type="text"
                value={socialModal.value}
                onChange={(e) => setSocialModal({ ...socialModal, value: e.target.value })}
                placeholder="your-handle"
                className={`${inputClass} mb-4`}
              />
            )}
            <div className="flex gap-3">
              <button onClick={() => setSocialModal(null)} className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-gray-200 transition-all">Cancel</button>
              <button onClick={saveSocial} className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${socialModal.value ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-[#111111] text-white hover:bg-black'}`}>
                {socialModal.value ? 'Disconnect' : 'Connect'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Ticket modal */}
      {ticketModal && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setTicketModal(null)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="mx-4 w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-[#111111] mb-1">{ticketModal.subject}</h3>
            <p className="text-xs text-gray-400 mb-4">Your message is stored and reviewed by the support team.</p>
            <div className="space-y-4">
              <div>
                <label className={fieldLabel}>Subject</label>
                <input type="text" value={ticketForm.subject} onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={fieldLabel}>Priority</label>
                <select value={ticketForm.priority} onChange={(e) => setTicketForm({ ...ticketForm, priority: e.target.value })} className={`${inputClass} appearance-none`}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className={fieldLabel}>Message</label>
                <textarea rows={4} value={ticketForm.message} onChange={(e) => setTicketForm({ ...ticketForm, message: e.target.value })} className={`${inputClass} resize-none`} placeholder="Describe the issue or request..." />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setTicketModal(null)} className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-gray-200 transition-all">Cancel</button>
                <button onClick={submitTicket} disabled={ticketBusy} className="flex-1 bg-[#111111] text-white py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-black transition-all disabled:opacity-50">
                  {ticketBusy ? <Loader2 className="w-4 h-4 animate-spin inline" /> : 'Submit'}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Delete confirm content */}
      {confirmModal?.title === 'Delete Account Permanently' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="mx-4 w-full max-w-sm bg-white rounded-2xl p-6 shadow-2xl">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-[#111111] text-center mb-2">Delete Account Permanently</h3>
            <p className="text-xs text-gray-400 text-center mb-6">
              Type <span className="font-mono font-bold text-[#111111]">DELETE</span> to confirm. {hasPasswordProvider ? 'Enter your password.' : ''} This cannot be undone.
            </p>
            <input
              type="text"
              value={deleteInput}
              onChange={(e) => setDeleteInput(e.target.value)}
              placeholder="DELETE"
              className={`${inputClass} mb-3 text-center font-mono font-bold`}
            />
            {hasPasswordProvider && (
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Password"
                className={`${inputClass} mb-3`}
              />
            )}
            <div className="flex gap-3">
              <button onClick={() => { setConfirmModal(null); setDeleteInput(''); setDeletePassword(''); }} className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-gray-200 transition-all">Cancel</button>
              <button onClick={handleDelete} disabled={dangerBusy || deleteInput !== 'DELETE'} className="flex-1 bg-red-500 text-white py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-red-600 transition-all disabled:opacity-40">
                {dangerBusy ? <Loader2 className="w-4 h-4 animate-spin inline" /> : 'Delete Forever'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Deactivate password prompt */}
      {confirmModal?.title === 'Confirm with password' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="mx-4 w-full max-w-sm bg-white rounded-2xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-[#111111] text-center mb-2">Deactivate Account</h3>
            <p className="text-xs text-gray-400 text-center mb-6">Enter your password to confirm.</p>
            <input type="password" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} placeholder="Password" className={`${inputClass} mb-3`} />
            <div className="flex gap-3">
              <button onClick={() => { setConfirmModal(null); setDeletePassword(''); }} className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-gray-200 transition-all">Cancel</button>
              <button onClick={handleDeactivate} disabled={dangerBusy} className="flex-1 bg-orange-500 text-white py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-orange-600 transition-all disabled:opacity-50">
                {dangerBusy ? <Loader2 className="w-4 h-4 animate-spin inline" /> : 'Deactivate'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Generic confirm modal */}
      {confirmModal && confirmModal.title !== 'Delete Account Permanently' && confirmModal.title !== 'Confirm with password' && (
        <ConfirmModal
          open={true}
          title={confirmModal.title}
          message={confirmModal.message}
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal(null)}
          danger={confirmModal.danger}
        />
      )}

      <AnimatePresence>
        {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      </AnimatePresence>
    </div>
  );
}
