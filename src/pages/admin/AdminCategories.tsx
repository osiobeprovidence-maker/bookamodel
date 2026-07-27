/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Tag, Plus, GripVertical, Pencil, Trash2, ArrowUp, ArrowDown, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { adminCategories } from '../../data/adminData';
import { AdminConfirmModal } from '../../components/admin/AdminConfirmModal';
import { useToast } from '../../components/ui/Toast';

const AdminCategories = () => {
  const { toast } = useToast();
  const [localCategories, setLocalCategories] = useState(adminCategories);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState<{ type: string; category: any } | null>(null);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [newName, setNewName] = useState('');

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    setLocalCategories((prev) => {
      const updated = [...prev];
      [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
      return updated.map((c, i) => ({ ...c, order: i + 1 }));
    });
    toast('Category moved up');
  };

  const handleMoveDown = (index: number) => {
    if (index === localCategories.length - 1) return;
    setLocalCategories((prev) => {
      const updated = [...prev];
      [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
      return updated.map((c, i) => ({ ...c, order: i + 1 }));
    });
    toast('Category moved down');
  };

  const handleCreate = () => {
    if (!newName.trim()) return toast('Please enter a category name', 'warning');
    const newCategory = {
      id: String(Date.now()),
      name: newName.trim(),
      icon: 'Tag',
      count: 0,
      order: localCategories.length + 1,
    };
    setLocalCategories((prev) => [...prev, newCategory]);
    setNewName('');
    setShowCreateModal(false);
    toast('Category created successfully');
  };

  const handleEdit = () => {
    if (!editingCategory || !newName.trim()) return toast('Please enter a category name', 'warning');
    setLocalCategories((prev) =>
      prev.map((c) => (c.id === editingCategory.id ? { ...c, name: newName.trim() } : c))
    );
    setEditingCategory(null);
    setNewName('');
    toast('Category updated successfully');
  };

  const handleDelete = (category: any) => {
    setLocalCategories((prev) => prev.filter((c) => c.id !== category.id));
    toast('Category deleted successfully');
  };

  const openEditModal = (category: any) => {
    setEditingCategory(category);
    setNewName(category.name);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#111111] dark:text-white">Categories</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage model categories</p>
        </div>
        <button
          onClick={() => { setNewName(''); setShowCreateModal(true); }}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-xl',
            'bg-[#D4AF37] hover:bg-[#C5A028]',
            'text-white text-sm font-bold',
            'transition-colors active:scale-95'
          )}
        >
          <Plus className="h-4 w-4" />
          Create New Category
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {localCategories.map((category, index) => (
          <div
            key={category.id}
            className={cn(
              'bg-white dark:bg-gray-900 rounded-2xl',
              'border border-gray-100 dark:border-gray-800',
              'p-5',
              'hover:shadow-lg transition-all duration-300'
            )}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-[#D4AF37]/10 text-[#D4AF37]">
                  <Tag className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#111111] dark:text-white">{category.name}</h3>
                  <p className="text-xs text-gray-400">{category.count} models</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-bold text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                  #{category.order}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleMoveUp(index)}
                  disabled={index === 0}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-30 disabled:pointer-events-none"
                >
                  <ArrowUp className="h-3.5 w-3.5 text-gray-400" />
                </button>
                <button
                  onClick={() => handleMoveDown(index)}
                  disabled={index === localCategories.length - 1}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-30 disabled:pointer-events-none"
                >
                  <ArrowDown className="h-3.5 w-3.5 text-gray-400" />
                </button>
                <GripVertical className="h-3.5 w-3.5 text-gray-300 dark:text-gray-600 ml-1" />
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEditModal(category)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <Pencil className="h-3.5 w-3.5 text-gray-400" />
                </button>
                <button
                  onClick={() => setShowConfirm({ type: 'delete', category })}
                  className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5 text-red-400" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowCreateModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-2xl"
            >
              <button
                onClick={() => setShowCreateModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
              <h3 className="text-lg font-bold text-[#111111] dark:text-white mb-4">Create New Category</h3>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Category name"
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                className={cn(
                  'w-full px-4 py-3 rounded-xl',
                  'bg-gray-50 dark:bg-gray-800',
                  'border border-gray-200 dark:border-gray-700',
                  'text-sm text-[#111111] dark:text-white',
                  'placeholder:text-gray-400',
                  'focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37]',
                  'transition-all mb-4'
                )}
              />
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-[#D4AF37] hover:bg-[#C5A028] transition-colors active:scale-95"
                >
                  Create
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editingCategory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => { setEditingCategory(null); setNewName(''); }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-2xl"
            >
              <button
                onClick={() => { setEditingCategory(null); setNewName(''); }}
                className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
              <h3 className="text-lg font-bold text-[#111111] dark:text-white mb-4">Edit Category</h3>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Category name"
                onKeyDown={(e) => e.key === 'Enter' && handleEdit()}
                className={cn(
                  'w-full px-4 py-3 rounded-xl',
                  'bg-gray-50 dark:bg-gray-800',
                  'border border-gray-200 dark:border-gray-700',
                  'text-sm text-[#111111] dark:text-white',
                  'placeholder:text-gray-400',
                  'focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37]',
                  'transition-all mb-4'
                )}
              />
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => { setEditingCategory(null); setNewName(''); }}
                  className="px-4 py-2 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEdit}
                  className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-[#D4AF37] hover:bg-[#C5A028] transition-colors active:scale-95"
                >
                  Save
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AdminConfirmModal
        isOpen={!!showConfirm}
        onClose={() => setShowConfirm(null)}
        onConfirm={() => {
          if (showConfirm) handleDelete(showConfirm.category);
        }}
        title="Delete Category"
        message={`Are you sure you want to delete "${showConfirm?.category.name}"? This may affect models in this category.`}
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
};

export default AdminCategories;
