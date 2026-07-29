/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, type ElementType } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, Shield, Bell, CreditCard, Users, Code,
  Palette, HelpCircle, AlertTriangle, Eye, EyeOff,
  Lock, Globe, Mail, MessageSquare, CheckCircle2, X,
  Upload, Trash2, Power, Key,
} from 'lucide-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useUser } from '../../contexts/UserContext';

type Tab = 'General' | 'Company' | 'Security' | 'Notifications' | 'Billing' | 'Team Members' | 'API' | 'Appearance' | 'Support' | 'Danger Zone';

const tabs: { label: Tab; icon: ElementType }[] = [
  { label: 'General', icon: Building2 },
  { label: 'Company', icon: Building2 },
  { label: 'Security', icon: Shield },
  { label: 'Notifications', icon: Bell },
  { label: 'Billing', icon: CreditCard },
  { label: 'Team Members', icon: Users },
  { label: 'API', icon: Code },
  { label: 'Appearance', icon: Palette },
  { label: 'Support', icon: HelpCircle },
  { label: 'Danger Zone', icon: AlertTriangle },
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

export default function BusinessSettings() {
  const { convexUser } = useUser();
  const businessProfile = useQuery(
    api.users.getBusinessProfile,
    convexUser ? { userId: convexUser._id as any } : 'skip'
  );
  const saveBusinessProfile = useMutation(api.users.saveBusinessProfile);
  const [saving, setSaving] = useState(false);

  const [activeTab, setActiveTab] = useState<Tab>('General');
  const [toast, setToast] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ title: string; message: string; onConfirm: () => void } | null>(null);

  const [generalForm, setGeneralForm] = useState({
    businessName: '',
    businessEmail: '',
    phone: '',
    website: '',
    address: '',
    industry: 'Fashion',
    description: '',
  });

  const [company, setCompany] = useState({
    verified: false,
    cacNumber: '',
    taxId: '',
  });

  useEffect(() => {
    if (convexUser) {
      setGeneralForm(prev => ({ ...prev, businessEmail: convexUser.email || '' }));
    }
    if (businessProfile) {
      setGeneralForm(prev => ({
        ...prev,
        businessName: businessProfile.companyName || '',
        phone: businessProfile.phone || businessProfile.contactPhone || '',
        website: businessProfile.website || '',
        address: businessProfile.address || '',
        industry: businessProfile.industry || 'Fashion',
        description: businessProfile.description || '',
      }));
      setCompany(prev => ({
        ...prev,
        verified: businessProfile.isVerified || false,
      }));
    }
  }, [convexUser, businessProfile]);

  const [passwordForm, setPasswordForm] = useState({ current: '', newPass: '', confirm: '' });
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);
  const [twoFactorMethod, setTwoFactorMethod] = useState('sms');

  const activeSessions = [
    { device: 'MacBook Pro', browser: 'Chrome', location: 'Lagos, Nigeria', time: '2 min ago', current: true },
    { device: 'iPhone 15 Pro', browser: 'Safari', location: 'Lagos, Nigeria', time: '3 hours ago', current: false },
    { device: 'Samsung Galaxy S24', browser: 'Chrome', location: 'Abuja, Nigeria', time: '2 days ago', current: false },
  ];

  const loginHistory = [
    { device: 'MacBook Pro', browser: 'Chrome', ip: '102.89.xx.xx', location: 'Lagos', date: '2026-07-27 10:30', status: 'Success' },
    { device: 'iPhone 15 Pro', browser: 'Safari', ip: '102.89.xx.xx', location: 'Lagos', date: '2026-07-27 07:15', status: 'Success' },
    { device: 'Unknown', browser: 'Firefox', ip: '41.204.xx.xx', location: 'Abuja', date: '2026-07-25 14:22', status: 'Failed' },
    { device: 'Samsung Galaxy S24', browser: 'Chrome', ip: '102.89.xx.xx', location: 'Lagos', date: '2026-07-24 09:00', status: 'Success' },
  ];

  const [notifications, setNotifications] = useState({
    email: true, sms: false, push: true, invitationUpdates: true,
    applicationUpdates: true, marketingEmails: false, paymentAlerts: true,
  });

  const [teamMembers, setTeamMembers] = useState([
    { name: 'Adaeze Okonkwo', email: 'adaeze@nike.ng', role: 'Admin' },
    { name: 'Emeka Nwosu', email: 'emeka@nike.ng', role: 'Recruiter' },
    { name: 'Fatima Bello', email: 'fatima@nike.ng', role: 'Viewer' },
  ]);

  const [apiKeyVisible, setApiKeyVisible] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('https://nike.ng/webhooks/bookamodel');

  const [appearance, setAppearance] = useState({ theme: 'light', accent: 'gold' });

  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const toggleNotifications = (key: keyof typeof notifications) => {
    setNotifications((n) => ({ ...n, [key]: !n[key] }));
  };

  const renderToggleRow = (label: string, description: string, enabled: boolean, onToggle: () => void) => (
    <div className="flex items-center justify-between py-4 border-b border-gray-50 last:border-0">
      <div>
        <p className="text-sm font-bold text-[#111111]">{label}</p>
        <p className="text-xs text-gray-400 mt-0.5">{description}</p>
      </div>
      <Toggle enabled={enabled} onToggle={onToggle} />
    </div>
  );

  const roleBadge = (role: string) => {
    const colors: Record<string, string> = {
      Admin: 'bg-red-50 text-red-600',
      Recruiter: 'bg-blue-50 text-blue-600',
      Manager: 'bg-purple-50 text-purple-600',
      Viewer: 'bg-gray-100 text-gray-600',
    };
    return (
      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${colors[role] || 'bg-gray-100 text-gray-600'}`}>
        {role}
      </span>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'General':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-bold tracking-tight text-[#111111]">General Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[
                { label: 'Business Name', key: 'businessName', type: 'text' },
                { label: 'Business Email', key: 'businessEmail', type: 'email' },
                { label: 'Phone', key: 'phone', type: 'tel' },
                { label: 'Website', key: 'website', type: 'url' },
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
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Address</label>
                <input
                  type="text"
                  value={generalForm.address}
                  onChange={(e) => setGeneralForm({ ...generalForm, address: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Industry</label>
                <select
                  value={generalForm.industry}
                  onChange={(e) => setGeneralForm({ ...generalForm, industry: e.target.value })}
                  className={`${inputClass} appearance-none`}
                >
                  <option>Fashion</option>
                  <option>Sportswear</option>
                  <option>Beauty</option>
                  <option>Tech</option>
                  <option>Retail</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Company Description</label>
                <textarea
                  value={generalForm.description}
                  onChange={(e) => setGeneralForm({ ...generalForm, description: e.target.value.slice(0, 500) })}
                  className={`${inputClass} min-h-[100px] resize-none`}
                  placeholder="Tell models about your brand..."
                />
                <p className="text-[10px] text-gray-400 mt-1 text-right">{generalForm.description.length}/500</p>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={async () => {
                  if (!convexUser) return;
                  setSaving(true);
                  try {
                    await saveBusinessProfile({
                      userId: convexUser._id as any,
                      businessName: generalForm.businessName,
                      contactPerson: convexUser.name || '',
                      phone: generalForm.phone || undefined,
                      website: generalForm.website || undefined,
                      description: generalForm.description || undefined,
                    });
                    showToast('Changes saved successfully');
                  } catch (err) {
                    console.error('Save error:', err);
                    showToast('Failed to save changes');
                  } finally {
                    setSaving(false);
                  }
                }}
                disabled={saving}
                className="bg-[#111111] text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-black transition-all active:scale-95 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={() => {
                  setGeneralForm({
                    businessName: businessProfile?.companyName || '',
                    businessEmail: convexUser?.email || '',
                    phone: businessProfile?.phone || businessProfile?.contactPhone || '',
                    website: businessProfile?.website || '',
                    address: businessProfile?.address || '',
                    industry: businessProfile?.industry || 'Fashion',
                    description: businessProfile?.description || '',
                  });
                }}
                className="bg-gray-100 text-gray-600 px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-gray-200 transition-all"
              >
                Reset
              </button>
            </div>
          </div>
        );

      case 'Company':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-bold tracking-tight text-[#111111]">Company Information</h3>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-sm font-bold text-[#111111]">Verification Status</h4>
                {company.verified ? (
                  <span className="px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3" /> Verified
                  </span>
                ) : (
                  <span className="px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                    <AlertTriangle className="w-3 h-3" /> Pending Verification
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">CAC Number</label>
                  <input
                    type="text"
                    value={company.cacNumber}
                    onChange={(e) => setCompany({ ...company, cacNumber: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Tax ID</label>
                  <input
                    type="text"
                    value={company.taxId}
                    onChange={(e) => setCompany({ ...company, taxId: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h4 className="text-sm font-bold text-[#111111] mb-4">Upload Documents</h4>
              <p className="text-xs text-gray-400 mb-4">Upload business registration, tax clearance, or other verification documents.</p>
              <button className="flex items-center gap-2 bg-[#111111] text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-black transition-all active:scale-95">
                <Upload className="w-4 h-4" /> Upload Document
              </button>
            </div>

            <button onClick={() => showToast('Company information saved')} className="bg-[#111111] text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-black transition-all active:scale-95">
              Save Changes
            </button>
          </div>
        );

      case 'Security':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-bold tracking-tight text-[#111111]">Security</h3>

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

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-blue-50"><Shield className="w-4 h-4 text-blue-600" /></div>
                  <div>
                    <h4 className="text-sm font-bold text-[#111111]">Two-Factor Authentication</h4>
                    <p className="text-xs text-gray-400 mt-0.5">Add an extra layer of security to your business account</p>
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
                        <Globe className="w-4 h-4 text-gray-400" />
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

      case 'Notifications':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-bold tracking-tight text-[#111111]">Notification Preferences</h3>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 divide-y divide-gray-50">
              {([
                { key: 'email' as const, title: 'Email Notifications', desc: 'Receive notifications via email' },
                { key: 'sms' as const, title: 'SMS Notifications', desc: 'Receive notifications via SMS' },
                { key: 'push' as const, title: 'Push Notifications', desc: 'Receive push notifications in browser' },
                { key: 'invitationUpdates' as const, title: 'Invitation Updates', desc: 'Get notified about new invitations and responses' },
                { key: 'applicationUpdates' as const, title: 'Application Updates', desc: 'Get notified about application status changes' },
                { key: 'marketingEmails' as const, title: 'Marketing Emails', desc: 'Receive marketing and promotional emails' },
                { key: 'paymentAlerts' as const, title: 'Payment Alerts', desc: 'Get notified about payments and invoices' },
              ]).map((n) => (
                renderToggleRow(n.title, n.desc, notifications[n.key], () => toggleNotifications(n.key))
              ))}
            </div>
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
                    <p className="text-sm font-bold text-[#111111]">Free</p>
                    <p className="text-xs text-gray-400">No renewal date</p>
                  </div>
                </div>
                <button className="w-full bg-[#D4AF37] text-white py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#c9a430] transition-all active:scale-95">Upgrade Plan</button>
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
              <input type="text" defaultValue="14 Adeola Odeku, Victoria Island, Lagos" className={`${inputClass} max-w-md`} />
              <button onClick={() => showToast('Invoice downloaded')} className="mt-4 bg-gray-100 text-gray-600 px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-gray-200 transition-all">Download Invoice</button>
            </div>
          </div>
        );

      case 'Team Members':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold tracking-tight text-[#111111]">Team Members</h3>
              <button className="flex items-center gap-2 bg-[#111111] text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-black transition-all active:scale-95">
                <Users className="w-3.5 h-3.5" /> Invite Team Member
              </button>
            </div>
            <div className="space-y-3">
              {teamMembers.map((member, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 bg-[#D4AF37]/10 rounded-full flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-[#D4AF37]">{member.name.split(' ').map((n) => n[0]).join('')}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[#111111] truncate">{member.name}</p>
                      <p className="text-xs text-gray-400 truncate">{member.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {roleBadge(member.role)}
                    <button
                      onClick={() => { setTeamMembers(teamMembers.filter((_, idx) => idx !== i)); showToast('Team member removed'); }}
                      className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'API':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-bold tracking-tight text-[#111111]">API Settings</h3>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-[#D4AF37]/10"><Key className="w-4 h-4 text-[#D4AF37]" /></div>
                  <h4 className="text-sm font-bold text-[#111111]">API Key</h4>
                </div>
                <button onClick={() => showToast('New API key generated')} className="bg-[#111111] text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-black transition-all active:scale-95">
                  Generate API Key
                </button>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 text-sm font-mono text-gray-500">
                  {apiKeyVisible ? 'bmk_live_9f8e7d6c5b4a3e2f1d0c9b8a7f6e5d4c' : '\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022'}
                </div>
                <button onClick={() => setApiKeyVisible(!apiKeyVisible)} className="p-3 text-gray-400 hover:text-gray-600 bg-gray-50 rounded-xl transition-all">
                  {apiKeyVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 rounded-xl bg-purple-50"><Globe className="w-4 h-4 text-purple-600" /></div>
                <h4 className="text-sm font-bold text-[#111111]">Webhook URL</h4>
              </div>
              <input
                type="url"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className={inputClass}
                placeholder="https://your-domain.com/webhooks"
              />
              <button onClick={() => showToast('Webhook URL saved')} className="mt-4 bg-gray-100 text-gray-600 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-gray-200 transition-all">Save Webhook</button>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h4 className="text-sm font-bold text-[#111111] mb-4">API Usage</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: 'Requests Today', value: '1,247' },
                  { label: 'This Month', value: '34,891' },
                  { label: 'Rate Limit', value: '10,000/day' },
                ].map((stat) => (
                  <div key={stat.label} className="bg-gray-50 rounded-xl p-4 text-center">
                    <p className="text-lg font-black text-[#111111]">{stat.value}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-50"><HelpCircle className="w-4 h-4 text-blue-600" /></div>
                <div>
                  <p className="text-sm font-bold text-[#111111]">API Documentation</p>
                  <p className="text-xs text-gray-400">Read our API docs to get started</p>
                </div>
              </div>
              <a href="#" className="text-xs font-bold text-[#D4AF37] hover:underline uppercase tracking-widest">View Docs</a>
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
                    { key: 'light', label: 'Light', icon: '\u2600\uFE0F' },
                    { key: 'dark', label: 'Dark', icon: '\uD83C\uDF19' },
                    { key: 'system', label: 'System', icon: '\uD83D\uDCBB' },
                  ].map((t) => (
                    <button key={t.key} onClick={() => setAppearance({ ...appearance, theme: t.key })} className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${appearance.theme === t.key ? 'border-[#D4AF37] bg-[#D4AF37]/5' : 'border-gray-100 hover:border-gray-200'}`}>
                      <span className="text-lg">{t.icon}</span>
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
                    { key: 'green', color: 'bg-green-500', label: 'Green' },
                    { key: 'purple', color: 'bg-purple-500', label: 'Purple' },
                  ].map((c) => (
                    <button key={c.key} onClick={() => setAppearance({ ...appearance, accent: c.key })} className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${appearance.accent === c.key ? 'border-[#111111]' : 'border-gray-100 hover:border-gray-200'}`}>
                      <div className={`w-4 h-4 rounded-full ${c.color}`} />
                      <span className="text-xs font-bold">{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h4 className="text-sm font-bold text-[#111111] mb-4">Live Preview</h4>
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#D4AF37] rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-white">NN</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#111111]">Nike Nigeria</p>
                    <p className="text-xs text-gray-400">Fashion & Sportswear</p>
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
                { title: 'Report Bug', desc: 'Found a bug? Let us know', icon: AlertTriangle, color: 'bg-red-50 text-red-600' },
                { title: 'Feedback', desc: 'Share your suggestions with us', icon: MessageSquare, color: 'bg-yellow-50 text-yellow-600' },
                { title: 'Contact Support', desc: 'Get in touch with our support team', icon: Mail, color: 'bg-green-50 text-green-600' },
                { title: 'Live Chat', desc: 'Chat with our support team in real time', icon: MessageSquare, color: 'bg-purple-50 text-purple-600' },
              ].map((s) => (
                <button key={s.title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center gap-4 hover:border-[#D4AF37]/30 transition-colors text-left">
                  <div className={`p-2.5 rounded-xl ${s.color}`}><s.icon className="w-4 h-4" /></div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-[#111111]">{s.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{s.desc}</p>
                  </div>
                  <span className="text-gray-300">{'\u276F'}</span>
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
                  <p className="text-xs text-gray-400 mt-0.5">Temporarily disable your business account. You can reactivate anytime.</p>
                </div>
                <button
                  onClick={() => setShowDeactivateModal(true)}
                  className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-orange-600 transition-all shrink-0"
                >
                  <Power className="w-3 h-3" /> Deactivate
                </button>
              </div>
              <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl">
                <div>
                  <p className="text-sm font-bold text-[#111111]">Delete Business Account</p>
                  <p className="text-xs text-gray-400 mt-0.5">Permanently delete your account and all data. This cannot be undone.</p>
                </div>
                <button
                  onClick={() => setShowDeleteModal(true)}
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
          Manage your business account, security, and preferences.
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

      <AnimatePresence>
        {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      </AnimatePresence>

      <AnimatePresence>
        {showDeactivateModal && (
          <ConfirmModal
            open={true}
            title="Deactivate Business Account?"
            message="Your account will be temporarily disabled. You can reactivate it anytime by logging back in."
            onConfirm={() => { setShowDeactivateModal(false); showToast('Business account deactivated'); }}
            onCancel={() => setShowDeactivateModal(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDeleteModal && (
          <ConfirmModal
            open={true}
            title="Delete Business Account?"
            message="This action is permanent and cannot be undone. All your data, listings, team members, and history will be permanently deleted."
            onConfirm={() => { setShowDeleteModal(false); showToast('Business account deleted'); }}
            onCancel={() => setShowDeleteModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
