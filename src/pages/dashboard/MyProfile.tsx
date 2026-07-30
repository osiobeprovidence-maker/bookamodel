import { useState, useEffect, useRef, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User,
  Ruler,
  Instagram,
  FileText,
  Eye,
  Camera,
  Loader2,
} from 'lucide-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useUser } from '../../contexts/UserContext';

const inputClass =
  'w-full px-6 py-4 bg-white rounded-xl border border-gray-100 focus:border-[#D4AF37] outline-none transition-all text-sm font-medium';

const selectClass =
  'w-full px-6 py-4 bg-white rounded-xl border border-gray-100 focus:border-[#D4AF37] outline-none transition-all text-sm font-medium appearance-none';

const FEMALE_FIELDS = [
  { key: 'height', label: 'Height (cm)', type: 'number' },
  { key: 'bust', label: 'Bust (cm)', type: 'number' },
  { key: 'waist', label: 'Waist (cm)', type: 'number' },
  { key: 'hips', label: 'Hips (cm)', type: 'number' },
  { key: 'dressSize', label: 'Dress Size', type: 'text' },
  { key: 'shoeSize', label: 'Shoe Size', type: 'text' },
];

const MALE_FIELDS = [
  { key: 'height', label: 'Height (cm)', type: 'number' },
  { key: 'chest', label: 'Chest (cm)', type: 'number' },
  { key: 'waist', label: 'Waist (cm)', type: 'number' },
  { key: 'suitSize', label: 'Suit Size', type: 'text' },
  { key: 'collarSize', label: 'Collar / Neck Size', type: 'text' },
  { key: 'inseam', label: 'Inseam (cm)', type: 'number' },
  { key: 'shoeSize', label: 'Shoe Size', type: 'text' },
];

const COMMON_FIELDS = [
  { key: 'weight', label: 'Weight (kg, optional)', type: 'number' },
];

export default function MyProfile() {
  const navigate = useNavigate();
  const { convexUser } = useUser();
  const modelProfile = useQuery(
    api.users.getModelProfile,
    convexUser ? { userId: convexUser._id as any } : 'skip'
  );
  const saveProfile = useMutation(api.users.saveModelProfile);
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    displayName: '',
    phone: '',
    bio: '',
    tagline: '',
    gender: '',
    dateOfBirth: '',
    country: '',
    state: '',
    city: '',
    height: '',
    weight: '',
    bust: '',
    waist: '',
    hips: '',
    dressSize: '',
    suitSize: '',
    collarSize: '',
    inseam: '',
    shoeSize: '',
    eyeColor: '',
    hairColor: '',
    skinTone: '',
    tattoos: '',
    piercings: '',
    categories: '',
    hourlyRate: '',
    dailyRate: '',
    isAvailable: true,
    instagram: '',
    tiktok: '',
    twitter: '',
    imageUrl: '',
  });
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastIsError, setToastIsError] = useState(false);

  useEffect(() => {
    return () => { if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl); };
  }, []);

  const showToastMsg = (msg: string, isError = false) => {
    setToastMessage(msg);
    setToastIsError(isError);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  };

  useEffect(() => {
    if (modelProfile) {
      setForm({
        displayName: modelProfile.displayName || '',
        phone: convexUser?.phone || '',
        bio: modelProfile.bio || '',
        tagline: modelProfile.tagline || '',
        gender: modelProfile.gender || '',
        dateOfBirth: modelProfile.dateOfBirth || '',
        country: modelProfile.country || '',
        state: modelProfile.state || '',
        city: modelProfile.city || '',
        height: modelProfile.height || '',
        weight: (modelProfile as any).weight || '',
        bust: modelProfile.bust || '',
        waist: modelProfile.waist || '',
        hips: modelProfile.hips || '',
        dressSize: (modelProfile as any).dressSize || '',
        suitSize: (modelProfile as any).suitSize || '',
        collarSize: (modelProfile as any).collarSize || '',
        inseam: (modelProfile as any).inseam || '',
        shoeSize: modelProfile.shoeSize || '',
        eyeColor: modelProfile.eyeColor || '',
        hairColor: (modelProfile as any).hairColor || '',
        skinTone: modelProfile.skinTone || '',
        tattoos: (modelProfile as any).tattoos || '',
        piercings: (modelProfile as any).piercings || '',
        categories: (modelProfile.categories || []).join(', '),
        hourlyRate: modelProfile.hourlyRate || '',
        dailyRate: modelProfile.dailyRate || '',
        isAvailable: modelProfile.isAvailable ?? true,
        instagram: modelProfile.socials?.instagram || '',
        tiktok: modelProfile.socials?.tiktok || '',
        twitter: modelProfile.socials?.twitter || '',
        imageUrl: modelProfile.imageUrl || '',
      });
    }
  }, [modelProfile]);

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToastMsg('Please select an image file (JPG, PNG, WebP)', true);
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      showToastMsg('Image must be under 10MB', true);
      return;
    }

    console.log('[Upload] File selected:', file.name, `${(file.size / 1024).toFixed(1)}KB`, file.type);
    setUploading(true);

    const objectUrl = URL.createObjectURL(file);
    setLocalPreviewUrl(objectUrl);

    try {
      console.log('[Upload] Generating upload URL...');
      const uploadUrl = await generateUploadUrl();
      console.log('[Upload] URL generated:', uploadUrl);

      const result = await fetch(uploadUrl, {
        method: 'POST',
        headers: { 'Content-Type': file.type },
        body: file,
      });

      if (!result.ok) {
        const text = await result.text();
        throw new Error(`HTTP ${result.status}: ${text.slice(0, 200)}`);
      }

      const responseBody = await result.json();
      console.log('[Upload] Response:', responseBody);

      const storageId = responseBody.storageId;
      if (!storageId) throw new Error('No storageId in upload response');

      console.log('[Upload] Storage ID received:', storageId);

      setForm((prev) => ({ ...prev, imageUrl: localPreviewUrl || prev.imageUrl }));

      if (convexUser) {
        console.log('[Upload] Auto-saving profile with profilePhotoStorageId...');
        await saveProfile({
          userId: convexUser._id as any,
          displayName: form.displayName,
          phone: form.phone || undefined,
          bio: form.bio || undefined,
          tagline: form.tagline || undefined,
          gender: form.gender || undefined,
          dateOfBirth: form.dateOfBirth || undefined,
          country: form.country || undefined,
          state: form.state || undefined,
          city: form.city || undefined,
          height: form.height || undefined,
          weight: form.weight || undefined,
          bust: form.bust || undefined,
          waist: form.waist || undefined,
          hips: form.hips || undefined,
          dressSize: form.dressSize || undefined,
          suitSize: form.suitSize || undefined,
          collarSize: form.collarSize || undefined,
          inseam: form.inseam || undefined,
          shoeSize: form.shoeSize || undefined,
          eyeColor: form.eyeColor || undefined,
          hairColor: form.hairColor || undefined,
          skinTone: form.skinTone || undefined,
          tattoos: form.tattoos || undefined,
          piercings: form.piercings || undefined,
          categories: form.categories ? form.categories.split(',').map(c => c.trim()).filter(Boolean) : undefined,
          hourlyRate: form.hourlyRate || undefined,
          dailyRate: form.dailyRate || undefined,
          isAvailable: form.isAvailable,
          socials: (form.instagram || form.tiktok || form.twitter) ? {
            instagram: form.instagram || undefined,
            tiktok: form.tiktok || undefined,
            twitter: form.twitter || undefined,
          } : undefined,
          profilePhotoStorageId: storageId,
        });
        console.log('[Upload] Profile saved with profilePhotoStorageId');
      }

      showToastMsg('Profile photo updated');
    } catch (err) {
      console.error('[Upload] Error:', err);
      setLocalPreviewUrl(null);
      showToastMsg(`Upload failed: ${err instanceof Error ? err.message : 'Unknown error'}`, true);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
      setUploading(false);
    }
  };

  const update = (key: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    if (!convexUser) return;
    try {
      await saveProfile({
        userId: convexUser._id as any,
        displayName: form.displayName,
        phone: form.phone || undefined,
        bio: form.bio || undefined,
        tagline: form.tagline || undefined,
        gender: form.gender || undefined,
        dateOfBirth: form.dateOfBirth || undefined,
        country: form.country || undefined,
        state: form.state || undefined,
        city: form.city || undefined,
        height: form.height || undefined,
        weight: form.weight || undefined,
        bust: form.bust || undefined,
        waist: form.waist || undefined,
        hips: form.hips || undefined,
        dressSize: form.dressSize || undefined,
        suitSize: form.suitSize || undefined,
        collarSize: form.collarSize || undefined,
        inseam: form.inseam || undefined,
        shoeSize: form.shoeSize || undefined,
        eyeColor: form.eyeColor || undefined,
        hairColor: form.hairColor || undefined,
        skinTone: form.skinTone || undefined,
        tattoos: form.tattoos || undefined,
        piercings: form.piercings || undefined,
        categories: form.categories ? form.categories.split(',').map(c => c.trim()).filter(Boolean) : undefined,
        hourlyRate: form.hourlyRate || undefined,
        dailyRate: form.dailyRate || undefined,
        isAvailable: form.isAvailable,
        socials: (form.instagram || form.tiktok || form.twitter) ? {
          instagram: form.instagram || undefined,
          tiktok: form.tiktok || undefined,
          twitter: form.twitter || undefined,
        } : undefined,
        imageUrl: form.imageUrl || undefined,
      });
      showToastMsg('Profile saved successfully!');
    } catch (err) {
      console.error('Save profile error:', err);
      showToastMsg('Failed to save profile.', true);
    }
  };

  const handleCancel = () => {
    if (localPreviewUrl) { URL.revokeObjectURL(localPreviewUrl); setLocalPreviewUrl(null); }
    if (modelProfile) {
      setForm({
        displayName: modelProfile.displayName || '',
        phone: convexUser?.phone || '',
        bio: modelProfile.bio || '',
        tagline: modelProfile.tagline || '',
        gender: modelProfile.gender || '',
        dateOfBirth: modelProfile.dateOfBirth || '',
        country: modelProfile.country || '',
        state: modelProfile.state || '',
        city: modelProfile.city || '',
        height: modelProfile.height || '',
        weight: (modelProfile as any).weight || '',
        bust: modelProfile.bust || '',
        waist: modelProfile.waist || '',
        hips: modelProfile.hips || '',
        dressSize: (modelProfile as any).dressSize || '',
        suitSize: (modelProfile as any).suitSize || '',
        collarSize: (modelProfile as any).collarSize || '',
        inseam: (modelProfile as any).inseam || '',
        shoeSize: modelProfile.shoeSize || '',
        eyeColor: modelProfile.eyeColor || '',
        hairColor: (modelProfile as any).hairColor || '',
        skinTone: modelProfile.skinTone || '',
        tattoos: (modelProfile as any).tattoos || '',
        piercings: (modelProfile as any).piercings || '',
        categories: (modelProfile.categories || []).join(', '),
        hourlyRate: modelProfile.hourlyRate || '',
        dailyRate: modelProfile.dailyRate || '',
        isAvailable: modelProfile.isAvailable ?? true,
        instagram: modelProfile.socials?.instagram || '',
        tiktok: modelProfile.socials?.tiktok || '',
        twitter: modelProfile.socials?.twitter || '',
        imageUrl: modelProfile.imageUrl || '',
      });
    }
  };

  const measurementFields = form.gender === 'Female'
    ? FEMALE_FIELDS
    : form.gender === 'Male'
    ? MALE_FIELDS
    : [];

  if (!convexUser) return <SkeletonLoading />;

  return (
    <div className="p-4 sm:p-6 lg:p-10">
      <header className="mb-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-[#111111]">
              My Profile
            </h1>
            <p className="text-gray-400 font-medium text-sm mt-1">
              Manage your personal information and modeling details.
            </p>
          </div>
          {modelProfile && (
            <button
              onClick={() => navigate(`/profile/${modelProfile._id}`)}
              className="shrink-0 flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-gray-600 transition-all hover:border-[#D4AF37] hover:text-[#D4AF37]"
            >
              <Eye size={14} /> View Profile
            </button>
          )}
        </div>
      </header>

      <div className="space-y-8">
        {/* Personal Information */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2.5 rounded-xl bg-blue-50">
              <User className="w-4 h-4 text-blue-600" />
            </div>
            <h2 className="text-lg font-bold tracking-tight text-[#111111]">
              Personal Information
            </h2>
          </div>

          <div className="flex items-center gap-6 mb-8">
            <div className="relative group">
              {uploading ? (
                <div className="relative w-24 h-24">
                  <img src={localPreviewUrl || form.imageUrl || ''} alt="Profile" className="w-24 h-24 rounded-full object-cover border-2 border-white shadow-sm opacity-50" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-[#D4AF37] animate-spin" />
                  </div>
                </div>
              ) : (localPreviewUrl || form.imageUrl) ? (
                <img src={localPreviewUrl || form.imageUrl} alt="Profile" className="w-24 h-24 rounded-full object-cover border-2 border-white shadow-sm" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-white shadow-sm flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-400">{(form.displayName || '?').charAt(0).toUpperCase()}</span>
                </div>
              )}
              <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                <Camera className="w-5 h-5 text-white" />
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </div>
            <div>
              <p className="text-sm font-bold text-[#111111]">{form.displayName || 'Your Name'}</p>
              <p className="text-xs text-gray-400 mt-1">Click photo to upload</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={form.displayName}
                onChange={(e) => update('displayName', e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                Email
              </label>
              <input
                type="email"
                value={convexUser?.email || ''}
                disabled
                className={`${inputClass} opacity-60 cursor-not-allowed`}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => update('phone', e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                Date of Birth
              </label>
              <input
                type="date"
                value={form.dateOfBirth}
                onChange={(e) => update('dateOfBirth', e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                Gender
              </label>
              <select
                value={form.gender}
                onChange={(e) => update('gender', e.target.value)}
                className={selectClass}
              >
                <option value="">Select...</option>
                <option>Female</option>
                <option>Male</option>
                <option>Non-binary</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                Country
              </label>
              <input
                type="text"
                value={form.country}
                onChange={(e) => update('country', e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                State
              </label>
              <input
                type="text"
                value={form.state}
                onChange={(e) => update('state', e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                City
              </label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => update('city', e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
        </motion.div>

        {/* Modeling Details */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2.5 rounded-xl bg-purple-50">
              <Ruler className="w-4 h-4 text-purple-600" />
            </div>
            <h2 className="text-lg font-bold tracking-tight text-[#111111]">
              Modeling Details
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                Category
              </label>
              <input
                type="text"
                value={form.categories}
                onChange={(e) => update('categories', e.target.value)}
                className={inputClass}
                placeholder="Fashion Model, Runway..."
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                Tagline
              </label>
              <input
                type="text"
                value={form.tagline}
                onChange={(e) => update('tagline', e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                Hourly Rate
              </label>
              <input
                type="text"
                value={form.hourlyRate}
                onChange={(e) => update('hourlyRate', e.target.value)}
                className={inputClass}
                placeholder="e.g. ₦50,000/hr"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                Daily Rate
              </label>
              <input
                type="text"
                value={form.dailyRate}
                onChange={(e) => update('dailyRate', e.target.value)}
                className={inputClass}
                placeholder="e.g. ₦200,000/day"
              />
            </div>
          </div>

          {form.gender && (
            <>
              <div className="border-t border-gray-100 my-8" />
              <h3 className="text-sm font-bold text-[#111111] mb-6 uppercase tracking-wider">
                {form.gender === 'Female' ? 'Female Measurements' : form.gender === 'Male' ? 'Male Measurements' : 'Measurements'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {measurementFields.map((field) => (
                  <div key={field.key}>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                      {field.label}
                    </label>
                    <input
                      type={field.type}
                      value={(form as any)[field.key]}
                      onChange={(e) => update(field.key, e.target.value)}
                      className={inputClass}
                    />
                  </div>
                ))}
                {COMMON_FIELDS.map((field) => (
                  <div key={field.key}>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                      {field.label}
                    </label>
                    <input
                      type={field.type}
                      value={(form as any)[field.key]}
                      onChange={(e) => update(field.key, e.target.value)}
                      className={inputClass}
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                    Hair Colour
                  </label>
                  <select
                    value={form.hairColor}
                    onChange={(e) => update('hairColor', e.target.value)}
                    className={selectClass}
                  >
                    <option value="">Select...</option>
                    <option>Black</option>
                    <option>Brown</option>
                    <option>Blonde</option>
                    <option>Red</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                    Eye Colour
                  </label>
                  <select
                    value={form.eyeColor}
                    onChange={(e) => update('eyeColor', e.target.value)}
                    className={selectClass}
                  >
                    <option value="">Select...</option>
                    <option>Brown</option>
                    <option>Black</option>
                    <option>Green</option>
                    <option>Blue</option>
                    <option>Hazel</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                    Skin Tone
                  </label>
                  <select
                    value={form.skinTone}
                    onChange={(e) => update('skinTone', e.target.value)}
                    className={selectClass}
                  >
                    <option value="">Select...</option>
                    <option>Fair</option>
                    <option>Light</option>
                    <option>Medium</option>
                    <option>Deep</option>
                    <option>Ebony</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                    Tattoos
                  </label>
                  <select
                    value={form.tattoos}
                    onChange={(e) => update('tattoos', e.target.value)}
                    className={selectClass}
                  >
                    <option value="">Select...</option>
                    <option>No</option>
                    <option>Yes</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                    Piercings
                  </label>
                  <select
                    value={form.piercings}
                    onChange={(e) => update('piercings', e.target.value)}
                    className={selectClass}
                  >
                    <option value="">Select...</option>
                    <option>No</option>
                    <option>Yes</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {!form.gender && (
            <p className="text-sm text-gray-400 mt-6">
              Select a gender above to show industry-standard measurement fields.
            </p>
          )}
        </motion.div>

        {/* Social Media */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2.5 rounded-xl bg-pink-50">
              <Instagram className="w-4 h-4 text-pink-600" />
            </div>
            <h2 className="text-lg font-bold tracking-tight text-[#111111]">
              Social Media
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                Instagram
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Instagram className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  value={form.instagram}
                  onChange={(e) => update('instagram', e.target.value)}
                  className={`${inputClass} pl-12`}
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                TikTok
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">
                  TT
                </span>
                <input
                  type="text"
                  value={form.tiktok}
                  onChange={(e) => update('tiktok', e.target.value)}
                  className={`${inputClass} pl-12`}
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                X (Twitter)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">
                  X
                </span>
                <input
                  type="text"
                  value={form.twitter}
                  onChange={(e) => update('twitter', e.target.value)}
                  className={`${inputClass} pl-12`}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bio */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2.5 rounded-xl bg-green-50">
              <FileText className="w-4 h-4 text-green-600" />
            </div>
            <h2 className="text-lg font-bold tracking-tight text-[#111111]">
              Bio
            </h2>
          </div>

          <div className="relative">
            <textarea
              maxLength={500}
              value={form.bio}
              onChange={(e) => update('bio', e.target.value)}
              rows={5}
              className={`${inputClass} resize-none pr-16`}
              placeholder="Tell brands about yourself..."
            />
            <span className="absolute bottom-4 right-5 text-[10px] font-bold text-gray-300 uppercase tracking-widest">
              {form.bio.length}/500
            </span>
          </div>
        </motion.div>

        {/* Visibility */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2.5 rounded-xl bg-yellow-50">
              <Eye className="w-4 h-4 text-yellow-600" />
            </div>
            <h2 className="text-lg font-bold tracking-tight text-[#111111]">
              Visibility
            </h2>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-[#111111]">
                Visible to Brands
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Allow brands to discover and contact you for projects.
              </p>
            </div>
            <button
              onClick={() => update('isAvailable', !form.isAvailable)}
              className={`relative w-12 h-7 rounded-full transition-colors ${
                form.isAvailable ? 'bg-[#D4AF37]' : 'bg-gray-200'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                  form.isAvailable ? 'translate-x-5' : ''
                }`}
              />
            </button>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4 pb-10">
          <button
            onClick={handleSave}
            className="bg-[#111111] text-white rounded-xl py-3 px-8 text-xs font-bold uppercase tracking-widest hover:bg-black transition-all active:scale-95"
          >
            Save Changes
          </button>
          <button
            onClick={handleCancel}
            className="bg-transparent text-gray-600 rounded-xl py-3 px-8 text-xs font-bold uppercase tracking-widest hover:bg-gray-50 transition-all"
          >
            Cancel
          </button>
        </div>
      </div>

      {showToast && (
        <div className={`fixed bottom-8 right-8 text-white px-6 py-4 rounded-xl shadow-xl text-sm font-bold flex items-center gap-3 z-50 ${toastIsError ? 'bg-red-600' : 'bg-[#111111]'}`}>
          <div className={`w-2 h-2 rounded-full ${toastIsError ? 'bg-red-300' : 'bg-green-400'}`} />
          {toastMessage}
        </div>
      )}
    </div>
  );
}

function SkeletonLoading() {
  return (
    <div className="p-4 sm:p-6 lg:p-10 animate-pulse">
      <div className="h-8 w-36 bg-gray-200 rounded-lg mb-10" />
      <div className="bg-white rounded-2xl border border-gray-100 p-8 space-y-6">
        <div className="flex gap-6 items-center">
          <div className="w-24 h-24 bg-gray-200 rounded-full" />
          <div><div className="h-4 w-40 bg-gray-200 rounded mb-2" /><div className="h-3 w-24 bg-gray-200 rounded" /></div>
        </div>
        <div className="grid grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-14 bg-gray-100 rounded-xl" />)}
        </div>
      </div>
    </div>
  );
}
