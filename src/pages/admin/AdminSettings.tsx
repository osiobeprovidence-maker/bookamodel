/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  Globe,
  Link2,
  CreditCard,
  FileText,
  AlertTriangle,
  Trash2,
  Save,
  Upload,
  X,
} from 'lucide-react';
import { useToast } from '../../components/ui/Toast';
import { cn } from '../../lib/utils';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

interface SettingsState {
  platformName: string;
  contactEmail: string;
  instagramUrl: string;
  twitterUrl: string;
  tiktokUrl: string;
  bookingFee: string;
  termsOfService: string;
  privacyPolicy: string;
  maintenanceMode: boolean;
}

function SectionCard({
  icon: Icon,
  title,
  children,
  onSave,
}: {
  icon: any;
  title: string;
  children: ReactNode;
  onSave: () => void;
}) {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center">
          <Icon className="h-4 w-4 text-[#D4AF37]" />
        </div>
        <h2 className="text-sm font-bold text-[#111111] dark:text-white">{title}</h2>
      </div>
      <div className="p-6 space-y-5">{children}</div>
      <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex justify-end">
        <button
          onClick={onSave}
          className={cn(
            'inline-flex items-center gap-2 px-5 py-2.5 rounded-xl',
            'bg-[#111111] dark:bg-white text-white dark:text-[#111111]',
            'text-sm font-medium hover:opacity-90 transition-opacity'
          )}
        >
          <Save className="h-4 w-4" />
          Save Changes
        </button>
      </div>
    </div>
  );
}

export default function AdminSettings() {
  const { toast } = useToast();
  const [showConfirm, setShowConfirm] = useState(false);
  const [settings, setSettings] = useState<SettingsState>({
    platformName: 'BookAModel',
    contactEmail: 'support@bookamodel.ng',
    instagramUrl: 'https://instagram.com/bookamodel',
    twitterUrl: 'https://twitter.com/bookamodel',
    tiktokUrl: 'https://tiktok.com/@bookamodel',
    bookingFee: '10',
    termsOfService:
      'By using BookAModel, you agree to our terms of service. All bookings are subject to our cancellation and refund policies. Models and businesses must maintain professional standards at all times.',
    privacyPolicy:
      'We collect personal information to facilitate bookings and improve our platform. Your data is stored securely and never shared with third parties without your consent.',
    maintenanceMode: false,
  });

  const update = (key: keyof SettingsState, value: string | boolean) =>
    setSettings((prev) => ({ ...prev, [key]: value }));

  const handleSave = () => {
    toast('Settings saved successfully!', 'success');
  };

  const inputClasses = cn(
    'w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm',
    'text-[#111111] placeholder:text-gray-400',
    'focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37]',
    'transition-all',
    'dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder:text-gray-500'
  );

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold text-[#111111] dark:text-white flex items-center gap-3">
          <Settings className="h-6 w-6 text-[#D4AF37]" />
          Platform Settings
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Manage your platform configuration
        </p>
      </motion.div>

      <motion.div variants={item}>
        <SectionCard icon={Globe} title="General" onSave={handleSave}>
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Platform Name
            </label>
            <input
              type="text"
              value={settings.platformName}
              onChange={(e) => update('platformName', e.target.value)}
              className={inputClasses}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Contact Email
            </label>
            <input
              type="email"
              value={settings.contactEmail}
              onChange={(e) => update('contactEmail', e.target.value)}
              className={inputClasses}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Platform Logo
            </label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center">
                <Upload className="h-5 w-5 text-gray-400" />
              </div>
              <button
                type="button"
                className={cn(
                  'px-4 py-2.5 rounded-xl text-sm font-medium',
                  'border border-gray-200 dark:border-gray-700',
                  'text-[#111111] dark:text-white',
                  'hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors'
                )}
              >
                Upload Logo
              </button>
            </div>
          </div>
        </SectionCard>
      </motion.div>

      <motion.div variants={item}>
        <SectionCard icon={Link2} title="Social Links" onSave={handleSave}>
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Instagram URL
            </label>
            <input
              type="url"
              placeholder="https://instagram.com/..."
              value={settings.instagramUrl}
              onChange={(e) => update('instagramUrl', e.target.value)}
              className={inputClasses}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Twitter URL
            </label>
            <input
              type="url"
              placeholder="https://twitter.com/..."
              value={settings.twitterUrl}
              onChange={(e) => update('twitterUrl', e.target.value)}
              className={inputClasses}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
              TikTok URL
            </label>
            <input
              type="url"
              placeholder="https://tiktok.com/@..."
              value={settings.tiktokUrl}
              onChange={(e) => update('tiktokUrl', e.target.value)}
              className={inputClasses}
            />
          </div>
        </SectionCard>
      </motion.div>

      <motion.div variants={item}>
        <SectionCard icon={CreditCard} title="Booking" onSave={handleSave}>
          <div className="space-y-2 max-w-xs">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Booking Fee Percentage
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="100"
                value={settings.bookingFee}
                onChange={(e) => update('bookingFee', e.target.value)}
                className={cn(inputClasses, 'pr-10')}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                %
              </span>
            </div>
          </div>
        </SectionCard>
      </motion.div>

      <motion.div variants={item}>
        <SectionCard icon={FileText} title="Legal" onSave={handleSave}>
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Terms of Service
            </label>
            <textarea
              rows={5}
              value={settings.termsOfService}
              onChange={(e) => update('termsOfService', e.target.value)}
              className={cn(inputClasses, 'resize-none')}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Privacy Policy
            </label>
            <textarea
              rows={5}
              value={settings.privacyPolicy}
              onChange={(e) => update('privacyPolicy', e.target.value)}
              className={cn(inputClasses, 'resize-none')}
            />
          </div>
        </SectionCard>
      </motion.div>

      <motion.div variants={item}>
        <SectionCard icon={AlertTriangle} title="Maintenance" onSave={handleSave}>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-[#111111] dark:text-white">
                Maintenance Mode
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                When enabled, the platform will display a maintenance message to all users.
              </p>
            </div>
            <button
              onClick={() => update('maintenanceMode', !settings.maintenanceMode)}
              className={cn(
                'relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200',
                settings.maintenanceMode ? 'bg-[#D4AF37]' : 'bg-gray-200 dark:bg-gray-700'
              )}
            >
              <span
                className={cn(
                  'pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200',
                  settings.maintenanceMode ? 'translate-x-5' : 'translate-x-0'
                )}
              />
            </button>
          </div>
          {settings.maintenanceMode && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                  Maintenance mode is active
                </p>
                <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                  All users except admins will see a maintenance page. Ensure all critical tasks
                  are completed before enabling.
                </p>
              </div>
            </div>
          )}
        </SectionCard>
      </motion.div>

      <motion.div variants={item}>
        <div className="bg-white dark:bg-gray-900 border border-red-200 dark:border-red-900/50 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-red-100 dark:border-red-900/50 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
              <Trash2 className="h-4 w-4 text-red-500" />
            </div>
            <h2 className="text-sm font-bold text-red-600 dark:text-red-400">Danger Zone</h2>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-[#111111] dark:text-white">
                  Reset All Data
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Permanently delete all platform data. This action cannot be undone.
                </p>
              </div>
              <button
                onClick={() => setShowConfirm(true)}
                className={cn(
                  'inline-flex items-center gap-2 px-5 py-2.5 rounded-xl',
                  'bg-red-600 text-white text-sm font-medium',
                  'hover:bg-red-700 transition-colors'
                )}
              >
                <Trash2 className="h-4 w-4" />
                Reset All Data
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowConfirm(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-2xl max-w-md w-full p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-[#111111] dark:text-white">
                  Confirm Reset
                </h3>
              </div>
              <button
                onClick={() => setShowConfirm(false)}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              This will permanently delete all models, businesses, bookings, reviews, transactions,
              and settings data. This action is irreversible.
            </p>
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Type <span className="font-bold text-red-500">RESET</span> to confirm
              </label>
              <input
                type="text"
                placeholder='Type "RESET"'
                className={cn(
                  'w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm',
                  'text-[#111111] placeholder:text-gray-400',
                  'focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500',
                  'transition-all',
                  'dark:bg-gray-800 dark:border-gray-700 dark:text-white'
                )}
              />
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button
                onClick={() => setShowConfirm(false)}
                className={cn(
                  'px-4 py-2.5 rounded-xl text-sm font-medium',
                  'border border-gray-200 dark:border-gray-700',
                  'text-[#111111] dark:text-white',
                  'hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors'
                )}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  toast('This feature is disabled in demo mode.', 'warning');
                  setShowConfirm(false);
                }}
                className={cn(
                  'px-4 py-2.5 rounded-xl text-sm font-medium',
                  'bg-red-600 text-white',
                  'hover:bg-red-700 transition-colors'
                )}
              >
                Reset Everything
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
