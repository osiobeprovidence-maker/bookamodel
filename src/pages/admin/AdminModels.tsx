/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  X,
  Eye,
  Edit3,
  ShieldCheck,
  ShieldOff,
  Trash2,
  Star,
  MoreVertical,
  Check,
  ExternalLink,
  MapPin,
  Calendar,
  Award,
  Users,
  CheckCircle2,
  Clock,
  Ban,
  CalendarCheck,
} from 'lucide-react';
import { adminModels } from '../../data/adminData';
import { AdminDataTable } from '../../components/admin/AdminDataTable';
import { AdminConfirmModal } from '../../components/admin/AdminConfirmModal';
import { useToast } from '../../components/ui/Toast';
import { cn } from '../../lib/utils';

type Model = (typeof adminModels)[number];

export default function AdminModels() {
  const { toast } = useToast();
  const [localModels, setLocalModels] = useState<Model[]>([...adminModels]);
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    type: 'suspend' | 'delete' | 'reactivate';
    modelId: string;
  } | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const stats = useMemo(() => {
    const total = localModels.length;
    const verified = localModels.filter((m) => m.isVerified).length;
    const pending = localModels.filter((m) => !m.isVerified && !m.isSuspended).length;
    const suspended = localModels.filter((m) => m.isSuspended).length;
    const available = localModels.filter((m) => m.isAvailable && !m.isSuspended).length;
    return { total, verified, pending, suspended, available };
  }, [localModels]);

  const handleAction = (
    type: 'suspend' | 'delete' | 'reactivate' | 'verify' | 'feature',
    modelId: string
  ) => {
    setOpenDropdown(null);
    if (type === 'suspend') {
      setConfirmAction({ type: 'suspend', modelId });
      setShowConfirm(true);
    } else if (type === 'delete') {
      setConfirmAction({ type: 'delete', modelId });
      setShowConfirm(true);
    } else if (type === 'reactivate') {
      setConfirmAction({ type: 'reactivate', modelId });
      setShowConfirm(true);
    } else if (type === 'verify') {
      setLocalModels((prev) =>
        prev.map((m) => (m.id === modelId ? { ...m, isVerified: true } : m))
      );
      toast('Model verified successfully');
    } else if (type === 'feature') {
      toast('Model featured on homepage');
    }
  };

  const confirmHandler = () => {
    if (!confirmAction) return;
    const model = localModels.find((m) => m.id === confirmAction.modelId);
    if (confirmAction.type === 'delete') {
      setLocalModels((prev) => prev.filter((m) => m.id !== confirmAction.modelId));
      toast(`${model?.name} has been deleted`, 'error');
    } else if (confirmAction.type === 'suspend') {
      setLocalModels((prev) =>
        prev.map((m) =>
          m.id === confirmAction.modelId
            ? { ...m, isSuspended: true, isAvailable: false }
            : m
        )
      );
      toast(`${model?.name} has been suspended`, 'warning');
    } else if (confirmAction.type === 'reactivate') {
      setLocalModels((prev) =>
        prev.map((m) =>
          m.id === confirmAction.modelId
            ? { ...m, isSuspended: false, isAvailable: true }
            : m
        )
      );
      toast(`${model?.name} has been reactivated`);
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Photo & Name',
      sortable: true,
      render: (_: any, row: Model) => (
        <div className="flex items-center gap-3">
          <img
            src={row.image}
            alt={row.name}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100 dark:ring-gray-800"
          />
          <div>
            <p className="font-medium text-[#111111] dark:text-white">{row.name}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'username',
      label: 'Username',
      sortable: true,
      render: (val: string) => (
        <span className="text-gray-500 dark:text-gray-400">{val}</span>
      ),
    },
    {
      key: 'city',
      label: 'City',
      sortable: true,
    },
    {
      key: 'categories',
      label: 'Categories',
      render: (val: string[]) => (
        <div className="flex flex-wrap gap-1">
          {val.slice(0, 2).map((cat) => (
            <span
              key={cat}
              className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
            >
              {cat}
            </span>
          ))}
          {val.length > 2 && (
            <span className="text-[10px] text-gray-400 dark:text-gray-500">
              +{val.length - 2}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'isVerified',
      label: 'Verified',
      sortable: true,
      render: (val: boolean) =>
        val ? (
          <Check className="h-4 w-4 text-green-500" />
        ) : (
          <X className="h-4 w-4 text-red-400" />
        ),
    },
    {
      key: 'isAvailable',
      label: 'Available',
      sortable: true,
      render: (val: boolean, row: Model) => {
        if (row.isSuspended) {
          return (
            <span className="inline-flex items-center px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400">
              Suspended
            </span>
          );
        }
        return val ? (
          <span className="inline-flex items-center px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400">
            Available
          </span>
        ) : (
          <span className="inline-flex items-center px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
            Unavailable
          </span>
        );
      },
    },
    {
      key: 'rating',
      label: 'Rating',
      sortable: true,
      render: (val: number) => (
        <div className="flex items-center gap-1">
          <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
          <span className="text-sm font-medium text-[#111111] dark:text-white">{val}</span>
        </div>
      ),
    },
    {
      key: 'totalBookings',
      label: 'Bookings',
      sortable: true,
      render: (val: number) => (
        <span className="font-medium text-[#111111] dark:text-white">{val}</span>
      ),
    },
    {
      key: 'actions',
      label: '',
      className: 'w-10',
      render: (_: any, row: Model) => (
        <div className="relative">
          <button
            onClick={() => setOpenDropdown(openDropdown === row.id ? null : row.id)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
          <AnimatePresence>
            {openDropdown === row.id && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -5 }}
                transition={{ duration: 0.15 }}
                className={cn(
                  'absolute right-0 top-full mt-1 z-50 w-48',
                  'bg-white dark:bg-gray-900',
                  'border border-gray-100 dark:border-gray-800',
                  'rounded-xl shadow-xl overflow-hidden'
                )}
              >
                <button
                  onClick={() => {
                    setSelectedModel(row);
                    setOpenDropdown(null);
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <Eye className="h-4 w-4" />
                  View Profile
                </button>
                <button
                  onClick={() => handleAction('feature', row.id)}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <Star className="h-4 w-4" />
                  Feature Model
                </button>
                {!row.isVerified && (
                  <button
                    onClick={() => handleAction('verify', row.id)}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-green-600 hover:bg-green-50 dark:hover:bg-green-900/10 transition-colors"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    Verify Model
                  </button>
                )}
                {row.isSuspended ? (
                  <button
                    onClick={() => handleAction('reactivate', row.id)}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors"
                  >
                    <ShieldOff className="h-4 w-4" />
                    Reactivate
                  </button>
                ) : (
                  <button
                    onClick={() => handleAction('suspend', row.id)}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-colors"
                  >
                    <Ban className="h-4 w-4" />
                    Suspend
                  </button>
                )}
                <div className="border-t border-gray-100 dark:border-gray-800" />
                <button
                  onClick={() => handleAction('delete', row.id)}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-[#111111] dark:text-white">Models</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Manage all registered models
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-5 gap-3"
      >
        {[
          { label: 'Total', value: stats.total, icon: Users, color: 'text-[#D4AF37]' },
          { label: 'Verified', value: stats.verified, icon: CheckCircle2, color: 'text-green-500' },
          { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-orange-500' },
          { label: 'Suspended', value: stats.suspended, icon: Ban, color: 'text-red-500' },
          { label: 'Available', value: stats.available, icon: CalendarCheck, color: 'text-blue-500' },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <s.icon className={cn('h-4 w-4', s.color)} />
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                {s.label}
              </span>
            </div>
            <p className="text-2xl font-bold text-[#111111] dark:text-white">{s.value}</p>
          </div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <AdminDataTable
          columns={columns}
          data={localModels}
          searchPlaceholder="Search models by name or city..."
          searchKey="name"
        />
      </motion.div>

      <AnimatePresence>
        {selectedModel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex justify-end"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setSelectedModel(null)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="relative w-full max-w-md bg-white dark:bg-gray-900 h-full overflow-y-auto shadow-2xl"
            >
              <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 px-6 py-4 flex items-center justify-between">
                <h3 className="text-lg font-bold text-[#111111] dark:text-white">
                  Model Profile
                </h3>
                <button
                  onClick={() => setSelectedModel(null)}
                  className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="flex flex-col items-center text-center">
                  <img
                    src={selectedModel.profileImage}
                    alt={selectedModel.name}
                    className="w-24 h-24 rounded-full object-cover ring-4 ring-gray-100 dark:ring-gray-800"
                  />
                  <h2 className="text-xl font-bold text-[#111111] dark:text-white mt-3">
                    {selectedModel.name}
                  </h2>
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    {selectedModel.username}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    {selectedModel.isVerified && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400">
                        <CheckCircle2 className="h-3 w-3" />
                        Verified
                      </span>
                    )}
                    {selectedModel.isSuspended && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400">
                        <Ban className="h-3 w-3" />
                        Suspended
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mx-auto" />
                    <p className="text-lg font-bold text-[#111111] dark:text-white mt-1">
                      {selectedModel.rating}
                    </p>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Rating
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-center">
                    <Calendar className="h-4 w-4 text-[#D4AF37] mx-auto" />
                    <p className="text-lg font-bold text-[#111111] dark:text-white mt-1">
                      {selectedModel.totalBookings}
                    </p>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Bookings
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-center">
                    <Award className="h-4 w-4 text-purple-500 mx-auto" />
                    <p className="text-lg font-bold text-[#111111] dark:text-white mt-1">
                      {selectedModel.categories.length}
                    </p>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Categories
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-300">
                      {selectedModel.city}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-300">
                      Joined {new Date(selectedModel.joinedDate).toLocaleDateString('en-NG', { month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-300">
                      {selectedModel.isAvailable ? 'Available for bookings' : 'Currently unavailable'}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400 tracking-[0.3em] mb-3">
                    Categories
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedModel.categories.map((cat) => (
                      <span
                        key={cat}
                        className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AdminConfirmModal
        isOpen={showConfirm}
        onClose={() => {
          setShowConfirm(false);
          setConfirmAction(null);
        }}
        onConfirm={confirmHandler}
        title={
          confirmAction?.type === 'delete'
            ? 'Delete Model'
            : confirmAction?.type === 'suspend'
              ? 'Suspend Model'
              : 'Reactivate Model'
        }
        message={
          confirmAction?.type === 'delete'
            ? 'Are you sure you want to delete this model? This action cannot be undone.'
            : confirmAction?.type === 'suspend'
              ? 'This model will be unable to receive bookings until reactivated.'
              : 'This model will be restored and able to receive bookings again.'
        }
        confirmLabel={
          confirmAction?.type === 'delete'
            ? 'Delete'
            : confirmAction?.type === 'suspend'
              ? 'Suspend'
              : 'Reactivate'
        }
        variant={
          confirmAction?.type === 'delete'
            ? 'danger'
            : confirmAction?.type === 'suspend'
              ? 'warning'
              : 'info'
        }
      />
    </div>
  );
}
