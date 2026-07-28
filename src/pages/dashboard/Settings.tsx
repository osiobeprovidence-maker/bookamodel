/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, type ElementType } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  User, Shield, Bell, CreditCard, Link as LinkIcon,
  Palette, HelpCircle, AlertTriangle, Eye, EyeOff,
  Lock, Smartphone, Globe, Mail, MessageSquare,
  Wallet, Download, Trash2, Power, ChevronRight,
  Check, X, Loader2, Sun, Moon, Monitor,
  CheckCircle2, AlertCircle,
} from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useUser } from '../../contexts/UserContext';

type Tab = 'General' | 'Account' | 'Security' | 'Privacy' | 'Notifications' | 'Billing' | 'Connected Accounts' | 'Appearance' | 'Support' | 'Danger Zone';

const tabs: { label: Tab; icon: ElementType; color: string }[] = [
  { label: 'General', icon: User, color: 'text-blue-600 bg-blue-50' },
  { label: 'Account', icon: Eye, color: 'text-purple-600 bg-purple-50' },
  { label: 'Security', icon: Shield, color: 'text-green-600 bg-green-50' },
  { label: 'Privacy', icon: Lock, color: 'text-orange-600 bg-orange-50' },
  { label: 'Notifications', icon: Bell, color: 'text-yellow-600 bg-yellow-50' },
  { label: 'Billing', icon: CreditCard, color: 'text-pink-600 bg-pink-50' },
  { label: 'Connected Accounts', icon: LinkIcon, color: 'text-indigo-600 bg-indigo-50' },
  { label: 'Appearance', icon: Palette, color: 'text-teal-600 bg-teal-50' },
  { label: 'Support', icon: HelpCircle, color: 'text-cyan-600 bg-cyan-50' },
  { label: 'Danger Zone', icon: AlertTriangle, color: 'text-red-600 bg-red-50' },
];

const inputClass = 'w-full px-4 py-3 bg-white rounded-xl border border-gray-100 focus:border-[#D4AF37] outline-none transition-all text-sm font-medium';

function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${enabled ? 'bg-[#D4AF37]' : 'bg-gray-200'}`}
      aria-label="Toggle"
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${enabled ? 'translate-x-5' : ''}`} />
    </button>
  );
}

function ConfirmModal({ open, title, message, onConfirm, onCancel }: {
  open: boolean; title: string; message: string; onConfirm: () => void; onCancel: () => void;
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
        <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-6 h-6 text-red-500" />
        </div>
        <h3 className="text-lg font-bold text-[#111111] text-center mb-2">{title}</h3>
        <p className="text-xs text-gray-400 text-center mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-gray-200 transition-all">
            Cancel
          </button>
          <button onClick={onConfirm} className="flex-1 bg-red-500 text-white py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-red-600 transition-all">
            Confirm
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
      className="fixed bottom-8 right-8 bg-[#111111] text-white px-6 py-4 rounded-xl shadow-xl text-sm font-bold flex items-center gap-3 z-50"
    >
      <CheckCircle2 className="w-4 h-4 text-green-400" />
      {message}
      <button onClick={onClose} className="text-gray-400 hover:text-white ml-2"><X className="w-4 h-4" /></button>
    </motion.div>
  );
}

export default function Settings() {
  const { convexUser } = useUser();
  const modelProfile = useQuery(
    api.users.getModelProfile,
    convexUser ? { userId: convexUser._id as any } : 'skip'
  );
  const [activeTab, setActiveTab] = useState<Tab>('General');
  const [toast, setToast] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ title: string; message: string; onConfirm: () => void } | null>(null);

  // General
  const [generalForm, setGeneralForm] = useState({
    fullName: '', username: '', email: '',
    phone: '', language: 'English', timezone: 'WAT (UTC+1)', country: '',
  });

  useEffect(() => {
    if (convexUser) {
      setGeneralForm(prev => ({
        ...prev,
        fullName: convexUser.name || '',
        email: convexUser.email || '',
        phone: convexUser.phone || '',
      }));
    }
    if (modelProfile) {
      setGeneralForm(prev => ({
        ...prev,
        fullName: modelProfile.displayName || prev.fullName,
        country: modelProfile.country || prev.country,
      }));
    }
  }, [convexUser, modelProfile]);

  // Account
  const [accountSettings, setAccountSettings] = useState({
    profileVisibility: true, publicPortfolio: true, brandDiscovery: true, autoAccept: false,
  });

  // Security
  const [passwordForm, setPasswordForm] = useState({ current: '', newPass: '', confirm: '' });
  const [twoFactor, setTwoFactor] = useState(false);
  const [twoFactorMethod, setTwoFactorMethod] = useState('sms');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  const activeSessions = [
    { device: 'iPhone 15 Pro', browser: 'Safari', location: 'Lagos, Nigeria', time: '2 min ago', current: true },
    { device: 'MacBook Pro', browser: 'Chrome', location: 'Lagos, Nigeria', time: '3 hours ago', current: false },
    { device: 'Samsung Galaxy S24', browser: 'Chrome', location: 'Abuja, Nigeria', time: '2 days ago', current: false },
  ];

  const loginHistory = [
    { device: 'iPhone 15 Pro', browser: 'Safari', ip: '102.89.xx.xx', location: 'Lagos', date: '2026-07-27 10:30', status: 'Success' },
    { device: 'MacBook Pro', browser: 'Chrome', ip: '102.89.xx.xx', location: 'Lagos', date: '2026-07-27 07:15', status: 'Success' },
    { device: 'Unknown', browser: 'Firefox', ip: '41.204.xx.xx', location: 'Abuja', date: '2026-07-25 14:22', status: 'Failed' },
    { device: 'Samsung Galaxy S24', browser: 'Chrome', ip: '102.89.xx.xx', location: 'Lagos', date: '2026-07-24 09:00', status: 'Success' },
  ];

  // Privacy
  const [privacy, setPrivacy] = useState({
    showEmail: false, showPhone: false, brandMessages: true, profileSearch: true,
    hideMeasurements: false, hideAge: true, showSocialLinks: true,
  });

  // Notifications
  const [notifications, setNotifications] = useState({
    email: true, sms: false, push: true, applicationUpdates: true,
    invitationUpdates: true, paymentAlerts: true, marketingEmails: false,
    weeklySummary: true, reminderNotifications: true,
  });

  // Billing
  const [billing] = useState({
    plan: 'Free', paymentMethod: '-', nextRenewal: '-', address: '123 Lekki Phase 1, Lagos',
  });

  // Connected Accounts
  const [connected, setConnected] = useState({
    google: false, apple: true, facebook: false, instagram: true, tiktok: false,
  });

  // Appearance
  const [appearance, setAppearance] = useState({ theme: 'light', accent: 'gold', fontSize: 'medium' });

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const togglePrivacy = (key: keyof typeof privacy) => {
    setPrivacy((p) => ({ ...p, [key]: !p[key] }));
  };

  const toggleNotifications = (key: keyof typeof notifications) => {
    setNotifications((n) => ({ ...n, [key]: !n[key] }));
  };

  const toggleConnected = (key: keyof typeof connected) => {
    setConnected((c) => ({ ...c, [key]: !c[key] }));
    const name = String(key);
    showToast(`${name.charAt(0).toUpperCase() + name.slice(1)} ${connected[key] ? 'disconnected' : 'connected'} successfully`);
  };

  const renderToggleRow = (
    label: string, description: string, enabled: boolean, onToggle: () => void,
  ) => (
    <div className="flex items-center justify-between py-4 border-b border-gray-50 last:border-0">
      <div>
        <p className="text-sm font-bold text-[#111111]">{label}</p>
        <p className="text-xs text-gray-400 mt-0.5">{description}</p>
      </div>
      <Toggle enabled={enabled} onToggle={onToggle} />
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'General':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-bold tracking-tight text-[#111111]">General Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[
                { label: 'Full Name', key: 'fullName', type: 'text' },
                { label: 'Username', key: 'username', type: 'text' },
                { label: 'Email', key: 'email', type: 'email' },
                { label: 'Phone Number', key: 'phone', type: 'tel' },
              ].map((f) => (
                <div key={f.key}>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{f.label}</label>
                  <input
                    type={f.type}
                    value={(generalForm as Record<string, string>)[f.key]}
                    onChange={(e) => setGeneralForm({ ...generalForm, [f.key]: e.target.value })}
                    className={inputClass}
                  />
                </div>
              ))}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Language</label>
                <select
                  value={generalForm.language}
                  onChange={(e) => setGeneralForm({ ...generalForm, language: e.target.value })}
                  className={`${inputClass} appearance-none`}
                >
                  <option>English</option>
                  <option>Pidgin</option>
                  <option>Yoruba</option>
                  <option>Igbo</option>
                  <option>Hausa</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Time Zone</label>
                <select
                  value={generalForm.timezone}
                  onChange={(e) => setGeneralForm({ ...generalForm, timezone: e.target.value })}
                  className={`${inputClass} appearance-none`}
                >
                  <option>WAT (UTC+1)</option>
                  <option>CET (UTC+1)</option>
                  <option>GMT (UTC+0)</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Country</label>
                <select
                  value={generalForm.country}
                  onChange={(e) => setGeneralForm({ ...generalForm, country: e.target.value })}
                  className={`${inputClass} appearance-none`}
                >
                  <option>Nigeria</option>
                  <option>Ghana</option>
                  <option>South Africa</option>
                  <option>Kenya</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => showToast('Changes saved successfully')}
                className="bg-[#111111] text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-black transition-all active:scale-95"
              >
                Save Changes
              </button>
              <button
                onClick={() => {
                  if (!convexUser) return;
                  setGeneralForm({ fullName: convexUser.name || '', username: '', email: convexUser.email || '', phone: convexUser.phone || '', language: 'English', timezone: 'WAT (UTC+1)', country: modelProfile?.country || '' });
                }}
                className="bg-gray-100 text-gray-600 px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-gray-200 transition-all"
              >
                Reset
              </button>
            </div>
          </div>
        );

      case 'Account':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-bold tracking-tight text-[#111111]">Account Settings</h3>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 divide-y divide-gray-50">
              {renderToggleRow('Profile Visibility', 'Allow brands to see your profile in search results', accountSettings.profileVisibility, () => setAccountSettings({ ...accountSettings, profileVisibility: !accountSettings.profileVisibility }))}
              {renderToggleRow('Public Portfolio', 'Make your portfolio visible to everyone', accountSettings.publicPortfolio, () => setAccountSettings({ ...accountSettings, publicPortfolio: !accountSettings.publicPortfolio }))}
              {renderToggleRow('Brand Discovery', 'Allow brands to discover you through search', accountSettings.brandDiscovery, () => setAccountSettings({ ...accountSettings, brandDiscovery: !accountSettings.brandDiscovery }))}
              {renderToggleRow('Auto Accept Invitations', 'Automatically accept all casting invitations', accountSettings.autoAccept, () => setAccountSettings({ ...accountSettings, autoAccept: !accountSettings.autoAccept }))}
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h4 className="text-sm font-bold text-[#111111] mb-3">Profile Completion</h4>
              <div className="flex items-center gap-4 mb-2">
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#D4AF37] w-[85%]" />
                </div>
                <span className="text-xs font-extrabold text-[#D4AF37]">85%</span>
              </div>
              <p className="text-xs text-gray-400">Add measurements to reach 100%</p>
            </div>
          </div>
        );

      case 'Security':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-bold tracking-tight text-[#111111]">Security</h3>

            {/* Change Password */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 rounded-xl bg-green-50"><Lock className="w-4 h-4 text-green-600" /></div>
                <h4 className="text-sm font-bold text-[#111111]">Change Password</h4>
              </div>
              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Current Password</label>
                  <div className="relative">
                    <input type={showCurrentPass ? 'text' : 'password'} value={passwordForm.current} onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })} className={`${inputClass} pr-10`} />
                    <button type="button" onClick={() => setShowCurrentPass(!showCurrentPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">New Password</label>
                  <div className="relative">
                    <input type={showNewPass ? 'text' : 'password'} value={passwordForm.newPass} onChange={(e) => setPasswordForm({ ...passwordForm, newPass: e.target.value })} className={`${inputClass} pr-10`} />
                    <button type="button" onClick={() => setShowNewPass(!showNewPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Confirm Password</label>
                  <input type="password" value={passwordForm.confirm} onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })} className={inputClass} />
                </div>
                <button onClick={() => { setPasswordForm({ current: '', newPass: '', confirm: '' }); showToast('Password updated successfully'); }} className="bg-[#111111] text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-black transition-all active:scale-95">
                  Update Password
                </button>
              </div>
            </div>

            {/* Two-Factor */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-blue-50"><Smartphone className="w-4 h-4 text-blue-600" /></div>
                  <div>
                    <h4 className="text-sm font-bold text-[#111111]">Two-Factor Authentication</h4>
                    <p className="text-xs text-gray-400 mt-0.5">Add an extra layer of security to your account</p>
                  </div>
                </div>
                <Toggle enabled={twoFactor} onToggle={() => setTwoFactor(!twoFactor)} />
              </div>
              {twoFactor && (
                <div className="flex gap-3 sm:ml-12 flex-wrap">
                  {['sms', 'authenticator', 'email'].map((m) => (
                    <button key={m} onClick={() => setTwoFactorMethod(m)} className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${twoFactorMethod === m ? 'bg-[#D4AF37] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                      {m === 'authenticator' ? 'Authenticator App' : m.toUpperCase()}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Active Sessions */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 rounded-xl bg-purple-50"><Globe className="w-4 h-4 text-purple-600" /></div>
                <h4 className="text-sm font-bold text-[#111111]">Active Sessions</h4>
              </div>
              <div className="space-y-4">
                {activeSessions.map((s, i) => (
                  <div key={i} className="flex items-center justify-between gap-3 p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-gray-100 shrink-0">
                        <Smartphone className="w-4 h-4 text-gray-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-[#111111] truncate">{s.device} \u2022 {s.browser}</p>
                        <p className="text-xs text-gray-400 truncate">{s.location} \u2022 {s.time}</p>
                      </div>
                    </div>
                    {s.current ? (
                      <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-[10px] font-bold uppercase tracking-widest">Current</span>
                    ) : (
                      <button onClick={() => showToast('Device logged out')} className="text-[10px] font-bold text-red-500 uppercase tracking-widest hover:text-red-600">Log Out</button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Login History */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 rounded-xl bg-orange-50"><Shield className="w-4 h-4 text-orange-600" /></div>
                <h4 className="text-sm font-bold text-[#111111]">Login History</h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-100">
                      {['Device', 'Browser', 'IP', 'Location', 'Date', 'Status'].map((h) => (
                        <th key={h} className="pb-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loginHistory.map((row, i) => (
                      <tr key={i} className="border-b border-gray-50 last:border-0">
                        <td className="py-3 text-xs text-gray-500">{row.device}</td>
                        <td className="py-3 text-xs text-gray-500">{row.browser}</td>
                        <td className="py-3 text-xs text-gray-500">{row.ip}</td>
                        <td className="py-3 text-xs text-gray-500">{row.location}</td>
                        <td className="py-3 text-xs text-gray-500">{row.date}</td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${row.status === 'Success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'Privacy':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-bold tracking-tight text-[#111111]">Privacy Settings</h3>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 divide-y divide-gray-50">
              {renderToggleRow('Show Email', 'Display your email on your public profile', privacy.showEmail, () => togglePrivacy('showEmail'))}
              {renderToggleRow('Show Phone Number', 'Display your phone number on your public profile', privacy.showPhone, () => togglePrivacy('showPhone'))}
              {renderToggleRow('Allow Brand Messages', 'Allow brands to message you directly', privacy.brandMessages, () => togglePrivacy('brandMessages'))}
              {renderToggleRow('Allow Profile Search', 'Make your profile discoverable in search engines', privacy.profileSearch, () => togglePrivacy('profileSearch'))}
              {renderToggleRow('Hide Measurements', 'Hide your body measurements from public profiles', privacy.hideMeasurements, () => togglePrivacy('hideMeasurements'))}
              {renderToggleRow('Hide Age', 'Hide your age from your public profile', privacy.hideAge, () => togglePrivacy('hideAge'))}
              {renderToggleRow('Show Social Links', 'Display social media links on your profile', privacy.showSocialLinks, () => togglePrivacy('showSocialLinks'))}
            </div>
          </div>
        );

      case 'Notifications':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-bold tracking-tight text-[#111111]">Notification Preferences</h3>
            {[
              { key: 'email' as const, title: 'Email Notifications', desc: 'Receive notifications via email' },
              { key: 'sms' as const, title: 'SMS Notifications', desc: 'Receive notifications via SMS' },
              { key: 'push' as const, title: 'Push Notifications', desc: 'Receive push notifications in browser' },
              { key: 'applicationUpdates' as const, title: 'Application Updates', desc: 'Get notified about application status changes' },
              { key: 'invitationUpdates' as const, title: 'Invitation Updates', desc: 'Get notified about new invitations' },
              { key: 'paymentAlerts' as const, title: 'Payment Alerts', desc: 'Get notified about payments and earnings' },
              { key: 'marketingEmails' as const, title: 'Marketing Emails', desc: 'Receive marketing and promotional emails' },
              { key: 'weeklySummary' as const, title: 'Weekly Summary', desc: 'Get a weekly summary of your activity' },
              { key: 'reminderNotifications' as const, title: 'Reminder Notifications', desc: 'Receive reminders about upcoming jobs and deadlines' },
            ].map((n) => (
              <div key={n.key} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                {renderToggleRow(n.title, n.desc, notifications[n.key], () => toggleNotifications(n.key))}
              </div>
            ))}
            <button onClick={() => showToast('Notification preferences saved')} className="bg-[#111111] text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-black transition-all active:scale-95">
              Save Preferences
            </button>
          </div>
        );

      case 'Billing':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-bold tracking-tight text-[#111111]">Billing</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                <h4 className="text-sm font-bold text-[#111111]">Current Plan</h4>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center"><span className="text-sm font-black text-gray-400">F</span></div>
                  <div>
                    <p className="text-sm font-bold text-[#111111]">{billing.plan}</p>
                    <p className="text-xs text-gray-400">No renewal date</p>
                  </div>
                </div>
                <button className="w-full bg-[#D4AF37] text-white py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#c9a430] transition-all active:scale-95">Change Plan</button>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                <h4 className="text-sm font-bold text-[#111111]">Payment Method</h4>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center"><CreditCard className="w-5 h-5 text-gray-400" /></div>
                  <div>
                    <p className="text-sm font-bold text-[#111111]">No payment method</p>
                    <p className="text-xs text-gray-400">Add a payment method to upgrade</p>
                  </div>
                </div>
                <button className="w-full bg-[#111111] text-white py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-black transition-all active:scale-95">Update Payment Method</button>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h4 className="text-sm font-bold text-[#111111] mb-4">Billing Address</h4>
              <input type="text" defaultValue={billing.address} className={`${inputClass} max-w-md`} />
              <button onClick={() => showToast('Billing address updated')} className="mt-4 bg-gray-100 text-gray-600 px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-gray-200 transition-all">Download Invoice</button>
            </div>
          </div>
        );

      case 'Connected Accounts':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-bold tracking-tight text-[#111111]">Connected Accounts</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {([
                { key: 'google' as const, name: 'Google', color: 'bg-red-50 text-red-600' },
                { key: 'apple' as const, name: 'Apple', color: 'bg-gray-100 text-gray-700' },
                { key: 'facebook' as const, name: 'Facebook', color: 'bg-blue-50 text-blue-600' },
                { key: 'instagram' as const, name: 'Instagram', color: 'bg-pink-50 text-pink-600' },
                { key: 'tiktok' as const, name: 'TikTok', color: 'bg-gray-100 text-black' },
              ]).map((acc) => (
                <div key={acc.key} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${acc.color}`}>
                      <span className="text-sm font-black">{acc.name.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#111111]">{acc.name}</p>
                      <p className={`text-xs font-medium ${connected[acc.key] ? 'text-green-600' : 'text-gray-400'}`}>
                        {connected[acc.key] ? 'Connected' : 'Not connected'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleConnected(acc.key)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                      connected[acc.key]
                        ? 'bg-red-50 text-red-600 hover:bg-red-100'
                        : 'bg-[#111111] text-white hover:bg-black'
                    }`}
                  >
                    {connected[acc.key] ? 'Disconnect' : 'Connect'}
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
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Theme</label>
                <div className="flex gap-3">
                  {[
                    { key: 'light', label: 'Light', icon: Sun },
                    { key: 'dark', label: 'Dark', icon: Moon },
                    { key: 'system', label: 'System', icon: Monitor },
                  ].map((t) => (
                    <button key={t.key} onClick={() => setAppearance({ ...appearance, theme: t.key })} className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${appearance.theme === t.key ? 'border-[#D4AF37] bg-[#D4AF37]/5' : 'border-gray-100 hover:border-gray-200'}`}>
                      <t.icon className={`w-5 h-5 ${appearance.theme === t.key ? 'text-[#D4AF37]' : 'text-gray-400'}`} />
                      <span className="text-xs font-bold">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Accent Color</label>
                <div className="flex gap-3">
                  {[
                    { key: 'gold', color: 'bg-[#D4AF37]', label: 'Gold' },
                    { key: 'blue', color: 'bg-blue-500', label: 'Blue' },
                    { key: 'purple', color: 'bg-purple-500', label: 'Purple' },
                    { key: 'green', color: 'bg-green-500', label: 'Green' },
                  ].map((c) => (
                    <button key={c.key} onClick={() => setAppearance({ ...appearance, accent: c.key })} className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${appearance.accent === c.key ? 'border-[#111111]' : 'border-gray-100 hover:border-gray-200'}`}>
                      <div className={`w-4 h-4 rounded-full ${c.color}`} />
                      <span className="text-xs font-bold">{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Font Size</label>
                <div className="flex gap-3">
                  {[
                    { key: 'small', label: 'Small' },
                    { key: 'medium', label: 'Medium' },
                    { key: 'large', label: 'Large' },
                  ].map((f) => (
                    <button key={f.key} onClick={() => setAppearance({ ...appearance, fontSize: f.key })} className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest border-2 transition-all ${appearance.fontSize === f.key ? 'border-[#111111] bg-[#111111] text-white' : 'border-gray-100 text-gray-500 hover:border-gray-200'}`}>
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {/* Live Preview */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h4 className="text-sm font-bold text-[#111111] mb-4">Live Preview</h4>
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#D4AF37] rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-white">{(convexUser?.name || '??').split(' ').map(n => n[0]).join('')}</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#111111]">{convexUser?.name || 'Model'}</p>
                    <p className="text-xs text-gray-400">{modelProfile?.tagline || 'Model'}</p>
                  </div>
                </div>
                <button className="bg-[#D4AF37] text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest">Preview Button</button>
              </div>
            </div>
            <button onClick={() => showToast('Appearance saved')} className="bg-[#111111] text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-black transition-all active:scale-95">
              Save Appearance
            </button>
          </div>
        );

      case 'Support':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-bold tracking-tight text-[#111111]">Support</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: 'Help Center', desc: 'Browse our help articles and guides', icon: HelpCircle, color: 'bg-blue-50 text-blue-600' },
                { title: 'Contact Support', desc: 'Get in touch with our support team', icon: Mail, color: 'bg-green-50 text-green-600' },
                { title: 'FAQs', desc: 'Frequently asked questions', icon: Globe, color: 'bg-purple-50 text-purple-600' },
                { title: 'Report a Bug', desc: 'Found a bug? Let us know', icon: AlertTriangle, color: 'bg-red-50 text-red-600' },
                { title: 'Submit Feedback', desc: 'Share your suggestions with us', icon: MessageSquare, color: 'bg-yellow-50 text-yellow-600' },
              ].map((s) => (
                <button key={s.title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center gap-4 hover:border-[#D4AF37]/30 transition-colors text-left">
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
            <div className="bg-white rounded-2xl border-2 border-red-200 shadow-sm p-8 space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 rounded-xl bg-red-50"><AlertTriangle className="w-4 h-4 text-red-600" /></div>
                <h4 className="text-sm font-bold text-red-600">Danger Zone</h4>
              </div>
              <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl">
                <div>
                  <p className="text-sm font-bold text-[#111111]">Deactivate Account</p>
                  <p className="text-xs text-gray-400 mt-0.5">Temporarily disable your account. You can reactivate anytime.</p>
                </div>
                <button
                  onClick={() => setConfirmModal({ title: 'Deactivate Account?', message: 'Your account will be temporarily disabled. You can reactivate it anytime by logging back in.', onConfirm: () => { setConfirmModal(null); showToast('Account deactivated'); } })}
                  className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-orange-600 transition-all shrink-0"
                >
                  <Power className="w-3 h-3" /> Deactivate
                </button>
              </div>
              <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl">
                <div>
                  <p className="text-sm font-bold text-[#111111]">Delete Account Permanently</p>
                  <p className="text-xs text-gray-400 mt-0.5">Permanently delete your account and all data. This cannot be undone.</p>
                </div>
                <button
                  onClick={() => setConfirmModal({ title: 'Delete Account?', message: 'This action is permanent and cannot be undone. All your data, portfolio, and history will be deleted.', onConfirm: () => { setConfirmModal(null); showToast('Account deleted'); } })}
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
      {/* Header */}
      <header className="mb-10">
        <h1 className="text-3xl font-black tracking-tight text-[#111111]">Settings</h1>
        <p className="text-gray-400 font-medium text-sm mt-1">
          Manage your account preferences and security.
        </p>
      </header>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Tabs */}
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

        {/* Content */}
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

      {/* Toast */}
      <AnimatePresence>
        {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      </AnimatePresence>

      {/* Confirm Modal */}
      <AnimatePresence>
        {confirmModal && (
          <ConfirmModal
            open={true}
            title={confirmModal.title}
            message={confirmModal.message}
            onConfirm={confirmModal.onConfirm}
            onCancel={() => setConfirmModal(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
