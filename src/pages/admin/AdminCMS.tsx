import React, { useState, useEffect } from 'react';
import { adminCMS, homepageFAQ } from '../../data/adminData';
import { useQuery, useMutation, useAction } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useToast } from '../../components/ui/Toast';
import { cn } from '../../lib/utils';
import {
  Plus, Pencil, Trash2, Eye, EyeOff, Copy, ArrowUp, ArrowDown,
  Star, Upload, X, Loader2, Building2, MessageSquareQuote,
} from 'lucide-react';

const tabs = ['Homepage Hero', 'Testimonials', 'Popular Categories', 'FAQ', 'About Page', 'Footer'];

interface TestimonialRow {
  _id: string;
  companyName: string;
  personName?: string;
  jobTitle?: string;
  companyLogoStorageId?: string | null;
  companyLogoUrl?: string | null;
  testimonial: string;
  rating: number;
  displayOrder: number;
  status?: string;
  createdAt?: number;
  updatedAt?: number;
}

export default function AdminCMS() {
  const { showToast } = useToast();
  const categoriesData = useQuery(api.categories.list);
  const testimonialsQuery = useQuery(api.testimonials.list);
  const createTestimonial = useMutation(api.testimonials.create);
  const updateTestimonial = useMutation(api.testimonials.update);
  const removeTestimonial = useMutation(api.testimonials.remove);
  const setTestimonialStatus = useMutation(api.testimonials.setStatus);
  const duplicateTestimonial = useMutation(api.testimonials.duplicate);
  const removeLogo = useMutation(api.testimonials.removeLogo);
  const generateUploadUrl = useAction(api.testimonials.generateUploadUrl);

  const [activeTab, setActiveTab] = useState('Homepage Hero');
  const [localCMS, setLocalCMS] = useState(adminCMS);
  const [localFAQ, setLocalFAQ] = useState(homepageFAQ);
  const [testimonials, setTestimonials] = useState<TestimonialRow[] | null>(null);
  useEffect(() => {
    if (testimonialsQuery && testimonials === null) setTestimonials(testimonialsQuery);
  }, [testimonialsQuery, testimonials]);

  const [showTestimonialModal, setShowTestimonialModal] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<TestimonialRow | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const [testimonialForm, setTestimonialForm] = useState({
    companyName: '',
    personName: '',
    jobTitle: '',
    testimonial: '',
    rating: 5,
    displayOrder: 1,
    status: 'active' as 'active' | 'hidden',
    logoStorageId: '',
    logoPreview: '',
  });

  const rows = testimonials ?? [];

  const openAddTestimonial = () => {
    setEditingTestimonial(null);
    setTestimonialForm({
      companyName: '', personName: '', jobTitle: '', testimonial: '', rating: 5,
      displayOrder: rows.length + 1, status: 'active', logoStorageId: '', logoPreview: '',
    });
    setShowTestimonialModal(true);
  };

  const openEditTestimonial = (t: TestimonialRow) => {
    setEditingTestimonial(t);
    setTestimonialForm({
      companyName: t.companyName,
      personName: t.personName || '',
      jobTitle: t.jobTitle || '',
      testimonial: t.testimonial,
      rating: t.rating || 5,
      displayOrder: t.displayOrder ?? rows.length + 1,
      status: (t.status === 'hidden' ? 'hidden' : 'active'),
      logoStorageId: t.companyLogoStorageId || '',
      logoPreview: t.companyLogoUrl || '',
    });
    setShowTestimonialModal(true);
  };

  const handleLogoUpload = async (file: File) => {
    setUploadingLogo(true);
    try {
      const uploadUrl = await generateUploadUrl();
      const result = await fetch(uploadUrl, {
        method: 'POST',
        headers: { 'Content-Type': file.type },
        body: file,
      });
      const { storageId } = await result.json();
      setTestimonialForm((f) => ({ ...f, logoStorageId: storageId, logoPreview: URL.createObjectURL(file) }));
      showToast('Logo uploaded', 'success');
    } catch {
      showToast('Logo upload failed', 'error');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleRemoveLogo = async () => {
    if (editingTestimonial && editingTestimonial.companyLogoStorageId) {
      await removeLogo({ testimonialId: editingTestimonial._id as any });
      setTestimonials((prev) =>
        prev ? prev.map((t) => (t._id === editingTestimonial._id ? { ...t, companyLogoUrl: null, companyLogoStorageId: null } : t)) : prev
      );
    }
    setTestimonialForm((f) => ({ ...f, logoStorageId: '', logoPreview: '' }));
    showToast('Logo removed', 'success');
  };

  const handleSaveTestimonial = async () => {
    if (!testimonialForm.companyName.trim()) return showToast('Please enter a company name', 'warning');
    if (!testimonialForm.testimonial.trim()) return showToast('Please enter the testimonial text', 'warning');
    try {
      if (editingTestimonial) {
        await updateTestimonial({
          testimonialId: editingTestimonial._id as any,
          companyName: testimonialForm.companyName.trim(),
          personName: testimonialForm.personName.trim() || undefined,
          jobTitle: testimonialForm.jobTitle.trim() || undefined,
          ...(testimonialForm.logoStorageId ? { companyLogoStorageId: testimonialForm.logoStorageId } : {}),
          testimonial: testimonialForm.testimonial.trim(),
          rating: testimonialForm.rating,
          displayOrder: testimonialForm.displayOrder,
          status: testimonialForm.status,
        });
        setTestimonials((prev) =>
          prev
            ? prev.map((t) =>
                t._id === editingTestimonial._id
                  ? {
                      ...t,
                      companyName: testimonialForm.companyName.trim(),
                      personName: testimonialForm.personName.trim(),
                      jobTitle: testimonialForm.jobTitle.trim(),
                      testimonial: testimonialForm.testimonial.trim(),
                      rating: testimonialForm.rating,
                      displayOrder: testimonialForm.displayOrder,
                      status: testimonialForm.status,
                      companyLogoStorageId: testimonialForm.logoStorageId || t.companyLogoStorageId || null,
                      companyLogoUrl: testimonialForm.logoPreview || t.companyLogoUrl || null,
                      updatedAt: Date.now(),
                    }
                  : t
              )
            : prev
        );
        showToast('Testimonial updated', 'success');
      } else {
        await createTestimonial({
          companyName: testimonialForm.companyName.trim(),
          personName: testimonialForm.personName.trim() || undefined,
          jobTitle: testimonialForm.jobTitle.trim() || undefined,
          ...(testimonialForm.logoStorageId ? { companyLogoStorageId: testimonialForm.logoStorageId } : {}),
          testimonial: testimonialForm.testimonial.trim(),
          rating: testimonialForm.rating,
          displayOrder: testimonialForm.displayOrder,
          status: testimonialForm.status,
        });
        showToast('Testimonial added', 'success');
      }
      setShowTestimonialModal(false);
    } catch (e: any) {
      showToast(e?.message || 'Failed to save testimonial', 'error');
    }
  };

  const handleDeleteTestimonial = async (t: TestimonialRow) => {
    const res = await removeTestimonial({ testimonialId: t._id as any });
    if (res && !res.ok) return showToast(res.message, 'error');
    setTestimonials((prev) => (prev ? prev.filter((row) => row._id !== t._id) : prev));
    showToast('Testimonial deleted', 'success');
  };

  const handleToggleStatus = async (t: TestimonialRow) => {
    const next = t.status === 'hidden' ? 'active' : 'hidden';
    await setTestimonialStatus({ testimonialId: t._id as any, status: next as any });
    setTestimonials((prev) => (prev ? prev.map((row) => (row._id === t._id ? { ...row, status: next } : row)) : prev));
    showToast(next === 'active' ? 'Testimonial shown on homepage' : 'Testimonial hidden', 'success');
  };

  const handleDuplicate = async (t: TestimonialRow) => {
    await duplicateTestimonial({ testimonialId: t._id as any });
    showToast('Testimonial duplicated', 'success');
  };

  const moveRow = (index: number, dir: -1 | 1) => {
    if (!testimonials) return;
    const target = index + dir;
    if (target < 0 || target >= testimonials.length) return;
    const updated = [...testimonials];
    [updated[index], updated[target]] = [updated[target], updated[index]];
    const withOrder = updated.map((row, i) => ({ ...row, displayOrder: i + 1 }));
    setTestimonials(withOrder);
    updateTestimonial({ testimonialId: updated[index]._id as any, displayOrder: index + 1 });
    updateTestimonial({ testimonialId: updated[target]._id as any, displayOrder: target + 1 });
  };

  const handleSave = () => {
    showToast('Changes saved successfully', 'success');
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Content Management</h1>

      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Homepage Hero' && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Homepage Hero</h2>
          <div className="bg-white rounded-lg p-6 border space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hero Title</label>
              <input
                type="text"
                value={localCMS.heroTitle}
                onChange={(e) => setLocalCMS({ ...localCMS, heroTitle: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hero Subtitle</label>
              <input
                type="text"
                value={localCMS.heroSubtitle}
                onChange={(e) => setLocalCMS({ ...localCMS, heroSubtitle: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => showToast('Preview updated', 'success')}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Preview
              </button>
              <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Testimonials' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Testimonials</h2>
              <p className="text-sm text-gray-500">
                Active testimonials appear on the homepage automatically.
              </p>
            </div>
            <button
              onClick={openAddTestimonial}
              className="flex items-center gap-2 px-4 py-2 bg-[#D4AF37] hover:bg-[#C5A028] text-white rounded-lg text-sm font-bold transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Testimonial
            </button>
          </div>

          <div className="bg-white rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b text-left text-xs uppercase tracking-wider text-gray-500">
                  <th className="px-4 py-3 font-semibold">Company</th>
                  <th className="px-4 py-3 font-semibold hidden md:table-cell">Person</th>
                  <th className="px-4 py-3 font-semibold">Rating</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Order</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((t, idx) => (
                  <tr key={t._id} className="border-b last:border-0 hover:bg-gray-50/60">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {t.companyLogoUrl ? (
                          <img src={t.companyLogoUrl} alt={t.companyName} className="w-8 h-8 rounded-lg object-cover" loading="lazy" />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                            <Building2 className="w-4 h-4 text-gray-400" />
                          </div>
                        )}
                        <span className="font-medium">{t.companyName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 hidden md:table-cell">
                      {t.personName || '—'}
                      {t.jobTitle ? <span className="text-gray-400"> · {t.jobTitle}</span> : null}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-0.5">
                        {Array.from({ length: t.rating }).map((_, s) => (
                          <Star key={s} className="w-3.5 h-3.5 text-[#D4AF37] fill-[#D4AF37]" />
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        'px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider',
                        t.status === 'hidden'
                          ? 'bg-yellow-50 text-yellow-600'
                          : 'bg-green-50 text-green-600'
                      )}>
                        {t.status === 'hidden' ? 'Hidden' : 'Active'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <span className="text-gray-500 font-medium">#{t.displayOrder}</span>
                        <div className="flex flex-col">
                          <button onClick={() => moveRow(idx, -1)} disabled={idx === 0} className="text-gray-400 hover:text-[#D4AF37] disabled:opacity-30">
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button onClick={() => moveRow(idx, 1)} disabled={idx === rows.length - 1} className="text-gray-400 hover:text-[#D4AF37] disabled:opacity-30">
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditTestimonial(t)}
                          title="Edit"
                          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-[#D4AF37] transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(t)}
                          title={t.status === 'hidden' ? 'Show on homepage' : 'Hide from homepage'}
                          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-blue-600 transition-colors"
                        >
                          {t.status === 'hidden' ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleDuplicate(t)}
                          title="Duplicate"
                          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-purple-600 transition-colors"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTestimonial(t)}
                          title="Delete"
                          className="p-2 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                      No testimonials yet. Click "Add Testimonial" to create the first one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'Popular Categories' && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Popular Categories</h2>
          <p className="text-sm text-gray-500">Toggle which categories appear on the homepage.</p>
          <div className="bg-white rounded-lg p-6 border space-y-3">
            {(categoriesData ?? []).map((cat: any) => (
              <div key={cat._id} className="flex items-center justify-between py-2 border-b last:border-0">
                <span className="text-sm font-medium">{cat.name}</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600" />
                </label>
              </div>
            ))}
          </div>
          <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Save
          </button>
        </div>
      )}

      {activeTab === 'FAQ' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">FAQ</h2>
            <button
              onClick={() => {
                setEditingItem(null);
                setShowFormModal(true);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              Add FAQ
            </button>
          </div>
          <div className="space-y-3">
            {localFAQ.map((item: any, idx: number) => (
              <div key={idx} className="bg-white rounded-lg border overflow-hidden">
                <div className="p-4">
                  <p className="font-medium text-sm">{item.question}</p>
                  <p className="text-sm text-gray-600 mt-1">{item.answer}</p>
                </div>
                <div className="px-4 pb-3 flex gap-2">
                  <button
                    onClick={() => {
                      setEditingItem({ ...item, index: idx });
                      setShowFormModal(true);
                    }}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setLocalFAQ(localFAQ.filter((_: any, i: number) => i !== idx));
                      showToast('FAQ deleted', 'success');
                    }}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'About Page' && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">About Page</h2>
          <div className="bg-white rounded-lg p-6 border">
            <textarea
              value={localCMS.aboutContent || ''}
              onChange={(e) => setLocalCMS({ ...localCMS, aboutContent: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 h-48 resize-y"
              placeholder="About page content..."
            />
            <button onClick={handleSave} className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Save
            </button>
          </div>
        </div>
      )}

      {activeTab === 'Footer' && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Footer</h2>
          <div className="bg-white rounded-lg p-6 border space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Copyright Text</label>
              <input
                type="text"
                value={localCMS.footerCopyright || ''}
                onChange={(e) => setLocalCMS({ ...localCMS, footerCopyright: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Instagram URL</label>
              <input
                type="text"
                value={localCMS.socialInstagram || ''}
                onChange={(e) => setLocalCMS({ ...localCMS, socialInstagram: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Twitter URL</label>
              <input
                type="text"
                value={localCMS.socialTwitter || ''}
                onChange={(e) => setLocalCMS({ ...localCMS, socialTwitter: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Facebook URL</label>
              <input
                type="text"
                value={localCMS.socialFacebook || ''}
                onChange={(e) => setLocalCMS({ ...localCMS, socialFacebook: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Footer Links</label>
              {(localCMS.footerLinks || []).map((link: any, idx: number) => (
                <div key={idx} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={link.label}
                    onChange={(e) => {
                      const links = [...(localCMS.footerLinks || [])];
                      links[idx] = { ...links[idx], label: e.target.value };
                      setLocalCMS({ ...localCMS, footerLinks: links });
                    }}
                    placeholder="Label"
                    className="flex-1 border rounded-lg px-3 py-2 text-sm"
                  />
                  <input
                    type="text"
                    value={link.url}
                    onChange={(e) => {
                      const links = [...(localCMS.footerLinks || [])];
                      links[idx] = { ...links[idx], url: e.target.value };
                      setLocalCMS({ ...localCMS, footerLinks: links });
                    }}
                    placeholder="URL"
                    className="flex-1 border rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              ))}
            </div>
            <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Save
            </button>
          </div>
        </div>
      )}

      {showTestimonialModal && activeTab === 'Testimonials' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">
                {editingTestimonial ? 'Edit Testimonial' : 'Add Testimonial'}
              </h3>
              <button
                onClick={() => setShowTestimonialModal(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Company Name</label>
                  <input
                    type="text"
                    value={testimonialForm.companyName}
                    onChange={(e) => setTestimonialForm((f) => ({ ...f, companyName: e.target.value }))}
                    placeholder="e.g. Adelola Fashion"
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Person Name</label>
                  <input
                    type="text"
                    value={testimonialForm.personName}
                    onChange={(e) => setTestimonialForm((f) => ({ ...f, personName: e.target.value }))}
                    placeholder="Optional"
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Job Title</label>
                <input
                  type="text"
                  value={testimonialForm.jobTitle}
                  onChange={(e) => setTestimonialForm((f) => ({ ...f, jobTitle: e.target.value }))}
                  placeholder="e.g. Creative Director"
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Company Logo (optional)</label>
                <div className="relative h-20 rounded-xl border border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                  {testimonialForm.logoPreview ? (
                    <img src={testimonialForm.logoPreview} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center text-gray-400">
                      <Building2 className="h-5 w-5 mx-auto mb-0.5" />
                      <p className="text-[11px]">Upload a logo</p>
                    </div>
                  )}
                  <label className="absolute inset-0 cursor-pointer flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
                    <span className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-xl text-[11px] font-bold text-[#111111]">
                      {uploadingLogo ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                      {uploadingLogo ? 'Uploading...' : 'Change Logo'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleLogoUpload(file);
                      }}
                    />
                  </label>
                  {testimonialForm.logoPreview && (
                    <button
                      onClick={handleRemoveLogo}
                      className="absolute bottom-1.5 right-1.5 px-2.5 py-1 bg-red-600/90 hover:bg-red-600 text-white rounded-lg text-[10px] font-bold transition-colors"
                    >
                      Remove Logo
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Rating</label>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setTestimonialForm((f) => ({ ...f, rating: n }))}
                      className="transition-transform hover:scale-110"
                    >
                      <Star className={cn(
                        'w-6 h-6',
                        n <= testimonialForm.rating ? 'text-[#D4AF37] fill-[#D4AF37]' : 'text-gray-300'
                      )} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Testimonial</label>
                <textarea
                  value={testimonialForm.testimonial}
                  onChange={(e) => setTestimonialForm((f) => ({ ...f, testimonial: e.target.value }))}
                  placeholder="What do they say about BookAModel?"
                  rows={3}
                  className="w-full border rounded-lg px-3 py-2 text-sm resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Display Order</label>
                  <input
                    type="number"
                    min={1}
                    value={testimonialForm.displayOrder}
                    onChange={(e) => setTestimonialForm((f) => ({ ...f, displayOrder: parseInt(e.target.value) || 1 }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Status</label>
                  <select
                    value={testimonialForm.status}
                    onChange={(e) => setTestimonialForm((f) => ({ ...f, status: e.target.value as any }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="active">Active</option>
                    <option value="hidden">Hidden</option>
                  </select>
                </div>
              </div>

              {editingTestimonial && (
                <p className="text-[10px] text-gray-400">
                  Created {new Date(editingTestimonial.createdAt || 0).toLocaleDateString()} · Last updated {new Date(editingTestimonial.updatedAt || 0).toLocaleDateString()}
                </p>
              )}

              <div className="flex gap-2 justify-end pt-2">
                <button
                  onClick={() => setShowTestimonialModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveTestimonial}
                  className="flex items-center gap-2 px-5 py-2 bg-[#D4AF37] hover:bg-[#C5A028] text-white rounded-lg text-sm font-bold transition-colors"
                >
                  <MessageSquareQuote className="w-4 h-4" />
                  {editingTestimonial ? 'Save Changes' : 'Add Testimonial'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showFormModal && activeTab === 'FAQ' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {editingItem ? 'Edit FAQ' : 'Add FAQ'}
            </h3>
            <FAQForm
              initial={editingItem}
              onSave={(data) => {
                if (editingItem !== null) {
                  const updated = [...localFAQ];
                  updated[editingItem.index] = data;
                  setLocalFAQ(updated);
                } else {
                  setLocalFAQ([...localFAQ, data]);
                }
                setShowFormModal(false);
                showToast(editingItem ? 'FAQ updated' : 'FAQ added', 'success');
              }}
              onCancel={() => setShowFormModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function FAQForm({
  initial,
  onSave,
  onCancel,
}: {
  initial: any;
  onSave: (data: any) => void;
  onCancel: () => void;
}) {
  const [question, setQuestion] = useState(initial?.question || '');
  const [answer, setAnswer] = useState(initial?.answer || '');

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
        <input value={question} onChange={(e) => setQuestion(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Answer</label>
        <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} className="w-full border rounded-lg px-3 py-2 h-24" />
      </div>
      <div className="flex gap-2 justify-end">
        <button onClick={onCancel} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
          Cancel
        </button>
        <button
          onClick={() => onSave({ question, answer })}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Save
        </button>
      </div>
    </div>
  );
}
