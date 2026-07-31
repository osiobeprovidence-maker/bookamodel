/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Tag, Plus, Pencil, Trash2, ArrowUp, ArrowDown, X, Star, Upload, Image as ImageIcon, Eye, EyeOff, Archive, Save, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useAction } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { cn } from '../../lib/utils';
import { AdminConfirmModal } from '../../components/admin/AdminConfirmModal';
import { useToast } from '../../components/ui/Toast';

const COLOR_SWATCHES = ['#D4AF37', '#111111', '#7C3AED', '#2563EB', '#059669', '#DB2777', '#EA580C', '#0F766E'];

interface CategoryRow {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string | null;
  color?: string;
  status?: string;
  isFeatured?: boolean;
  order?: number;
  modelCount?: number;
  businessCount?: number;
  jobCount?: number;
  createdAt?: number;
}

const slugify = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const AdminCategories = () => {
  const { toast } = useToast();
  const data = useQuery(api.categories.list);
  const createCategory = useMutation(api.categories.create);
  const updateCategory = useMutation(api.categories.update);
  const removeCategory = useMutation(api.categories.remove);
  const setStatus = useMutation(api.categories.setStatus);
  const generateUploadUrl = useAction(api.categories.generateUploadUrl);

  const [categories, setCategories] = useState<CategoryRow[] | null>(null);
  useEffect(() => {
    if (data && categories === null) setCategories(data);
  }, [data, categories]);
  const rows = categories ?? [];

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<CategoryRow | null>(null);
  const [showConfirm, setShowConfirm] = useState<{ type: string; category: CategoryRow } | null>(null);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    imageStorageId: '',
    imagePreview: '',
    color: COLOR_SWATCHES[0],
    status: 'active' as 'active' | 'hidden' | 'archived',
    isFeatured: false,
    order: 1,
  });

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', slug: '', description: '', imageStorageId: '', imagePreview: '', color: COLOR_SWATCHES[0], status: 'active', isFeatured: false, order: rows.length + 1 });
    setShowModal(true);
  };

  const openEdit = (cat: CategoryRow) => {
    setEditing(cat);
    setForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      imageStorageId: '',
      imagePreview: cat.image || '',
      color: cat.color || COLOR_SWATCHES[0],
      status: (cat.status as any) || 'active',
      isFeatured: !!cat.isFeatured,
      order: cat.order ?? 0,
    });
    setShowModal(true);
  };

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      const uploadUrl = await generateUploadUrl();
      const result = await fetch(uploadUrl, {
        method: 'POST',
        headers: { 'Content-Type': file.type },
        body: file,
      });
      const { storageId } = await result.json();
      setForm((f) => ({ ...f, imageStorageId: storageId, imagePreview: URL.createObjectURL(file) }));
      toast('Image uploaded', 'success');
    } catch {
      toast('Image upload failed', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.name.trim()) return toast('Please enter a category name', 'warning');
    const slug = form.slug.trim() || slugify(form.name);
    try {
      if (editing) {
        await updateCategory({
          categoryId: editing._id as any,
          name: form.name.trim(),
          slug,
          description: form.description.trim() || undefined,
          imageStorageId: form.imageStorageId || undefined,
          color: form.color,
          status: form.status,
          isFeatured: form.isFeatured,
          order: form.order,
        });
        toast('Category updated successfully', 'success');
      } else {
        await createCategory({
          name: form.name.trim(),
          slug,
          description: form.description.trim() || undefined,
          imageStorageId: form.imageStorageId || undefined,
          color: form.color,
          status: form.status,
          isFeatured: form.isFeatured,
          order: form.order,
        });
        toast('Category created successfully', 'success');
      }
      setShowModal(false);
    } catch (e: any) {
      toast(e?.message || 'Failed to save category', 'error');
    }
  };

  const handleDelete = async (category: CategoryRow) => {
    const res = await removeCategory({ categoryId: category._id as any });
    if (res && !res.ok) {
      toast(res.message, 'error');
      return;
    }
    setCategories((prev) => (prev ? prev.filter((c) => c._id !== category._id) : prev));
    toast('Category deleted', 'success');
  };

  const handleArchive = async (category: CategoryRow) => {
    await setStatus({ categoryId: category._id as any, status: 'archived' });
    setCategories((prev) => (prev ? prev.map((c) => (c._id === category._id ? { ...c, status: 'archived' } : c)) : prev));
    toast('Category archived. It stays attached to existing records but is hidden everywhere.', 'success');
  };

  const handleToggleFeatured = async (category: CategoryRow) => {
    await updateCategory({ categoryId: category._id as any, isFeatured: !category.isFeatured });
    setCategories((prev) => (prev ? prev.map((c) => (c._id === category._id ? { ...c, isFeatured: !c.isFeatured } : c)) : prev));
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...rows];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    setCategories(updated.map((c, i) => ({ ...c, order: i + 1 })));
    updateCategory({ categoryId: updated[index - 1]._id as any, order: index });
    updateCategory({ categoryId: updated[index]._id as any, order: index + 1 });
  };

  const handleMoveDown = (index: number) => {
    if (index === rows.length - 1) return;
    const updated = [...rows];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    setCategories(updated.map((c, i) => ({ ...c, order: i + 1 })));
    updateCategory({ categoryId: updated[index]._id as any, order: index + 2 });
    updateCategory({ categoryId: updated[index + 1]._id as any, order: index + 1 });
  };

  const statusBadge = (status?: string) => {
    if (status === 'archived') return { label: 'Archived', cls: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400' };
    if (status === 'hidden') return { label: 'Hidden', cls: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400' };
    return { label: 'Active', cls: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#111111] dark:text-white">Categories</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Single source of truth for all categories across the platform
          </p>
        </div>
        <button
          onClick={openCreate}
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
        {rows.map((category, index) => {
          const badge = statusBadge(category.status);
          return (
            <div
              key={category._id}
              className={cn(
                'bg-white dark:bg-gray-900 rounded-2xl',
                'border border-gray-100 dark:border-gray-800',
                'overflow-hidden hover:shadow-lg transition-all duration-300'
              )}
            >
              <div className="relative h-28 bg-gray-100 dark:bg-gray-800">
                {category.image ? (
                  <img
                    src={category.image}
                    alt={category.name}
                    loading="lazy"
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                ) : null}
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ backgroundColor: category.image ? 'rgba(0,0,0,0.25)' : category.color || '#111111' }}
                >
                  {!category.image && (
                    <span className="text-3xl font-black text-white/90 uppercase tracking-tight">
                      {category.name.slice(0, 2)}
                    </span>
                  )}
                </div>
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-bold', badge.cls)}>{badge.label}</span>
                </div>
                <div className="absolute top-3 right-3 flex items-center gap-1.5">
                  <button
                    onClick={() => handleToggleFeatured(category)}
                    title={category.isFeatured ? 'Unfeature' : 'Feature'}
                    className={cn(
                      'p-1.5 rounded-lg transition-colors',
                      category.isFeatured ? 'bg-[#D4AF37] text-white' : 'bg-white/90 text-gray-400 hover:text-[#D4AF37]'
                    )}
                  >
                    <Star className={cn('h-4 w-4', category.isFeatured && 'fill-current')} />
                  </button>
                </div>
              </div>

              <div className="p-5">
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <h3 className="font-bold text-sm text-[#111111] dark:text-white">{category.name}</h3>
                    <p className="text-xs text-gray-400">/{category.slug}</p>
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                    #{category.order}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
                  {category.description || 'No description'}
                </p>
                <div className="flex items-center gap-3 text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-4">
                  <span className="text-[#D4AF37]">{category.modelCount ?? 0} models</span>
                  <span>{category.businessCount ?? 0} businesses</span>
                  <span>{category.jobCount ?? 0} jobs</span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleMoveUp(index)} disabled={index === 0} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-30 disabled:pointer-events-none">
                      <ArrowUp className="h-3.5 w-3.5 text-gray-400" />
                    </button>
                    <button onClick={() => handleMoveDown(index)} disabled={index === rows.length - 1} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-30 disabled:pointer-events-none">
                      <ArrowDown className="h-3.5 w-3.5 text-gray-400" />
                    </button>
                    <button
                      onClick={() => handleArchive(category)}
                      title="Archive"
                      disabled={category.status === 'archived'}
                      className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-30"
                    >
                      <Archive className="h-3.5 w-3.5 text-gray-400" />
                    </button>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(category)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
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
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
              <h3 className="text-lg font-bold text-[#111111] dark:text-white mb-4">
                {editing ? 'Edit Category' : 'Create New Category'}
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Cover Image</label>
                  <div className="relative h-32 rounded-xl overflow-hidden border border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center">
                    {form.imagePreview ? (
                      <img src={form.imagePreview} alt="Cover" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center text-gray-400">
                        <ImageIcon className="h-6 w-6 mx-auto mb-1" />
                        <p className="text-xs">Upload a cover image</p>
                      </div>
                    )}
                    <label className="absolute inset-0 cursor-pointer flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
                      <span className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-xl text-xs font-bold text-[#111111]">
                        {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                        {uploading ? 'Uploading...' : 'Change Image'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file);
                        }}
                      />
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Name</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, slug: editing ? f.slug : slugify(e.target.value) }))}
                      placeholder="e.g. Fashion"
                      className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Slug</label>
                    <input
                      type="text"
                      value={form.slug}
                      onChange={(e) => setForm((f) => ({ ...f, slug: slugify(e.target.value) }))}
                      placeholder="fashion"
                      className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="Short description shown on public pages"
                    rows={2}
                    className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Color</label>
                  <div className="flex items-center gap-2">
                    {COLOR_SWATCHES.map((c) => (
                      <button
                        key={c}
                        onClick={() => setForm((f) => ({ ...f, color: c }))}
                        style={{ backgroundColor: c }}
                        className={cn(
                          'w-7 h-7 rounded-full transition-transform',
                          form.color === c ? 'ring-2 ring-offset-2 ring-[#D4AF37] scale-110' : 'hover:scale-105'
                        )}
                      />
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Display Order</label>
                    <input
                      type="number"
                      min={1}
                      value={form.order}
                      onChange={(e) => setForm((f) => ({ ...f, order: parseInt(e.target.value) || 1 }))}
                      className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Status</label>
                    <select
                      value={form.status}
                      onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as any }))}
                      className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30"
                    >
                      <option value="active">Active</option>
                      <option value="hidden">Hidden</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Featured</label>
                    <button
                      onClick={() => setForm((f) => ({ ...f, isFeatured: !f.isFeatured }))}
                      className={cn(
                        'w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-bold transition-colors',
                        form.isFeatured
                          ? 'bg-[#D4AF37]/10 border-[#D4AF37] text-[#D4AF37]'
                          : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400'
                      )}
                    >
                      <Star className={cn('h-4 w-4', form.isFeatured && 'fill-current')} />
                      {form.isFeatured ? 'Featured' : 'Not Featured'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white bg-[#D4AF37] hover:bg-[#C5A028] transition-colors active:scale-95"
                >
                  <Save className="h-4 w-4" />
                  {editing ? 'Save Changes' : 'Create Category'}
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
        message={`Are you sure you want to permanently delete "${showConfirm?.category.name}"? If it is used by any model, business or job it cannot be deleted and should be archived instead.`}
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
};

export default AdminCategories;
