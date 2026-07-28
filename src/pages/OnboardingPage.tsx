import { useState, useRef, useEffect, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mail, Lock, User, Check, ChevronLeft, Upload,
  Phone, Calendar, Ruler, ChevronRight, Camera,
  AlertCircle, Loader2, Globe, Building2, X,
} from 'lucide-react';
import { createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { useQuery, useMutation } from 'convex/react';
import { auth, googleProvider } from '../lib/firebase';
import { api } from '../../convex/_generated/api';
import { useUser } from '../contexts/UserContext';
import { cn } from '../lib/utils';

type AccountType = 'model' | 'business' | null;

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const modelCategories = [
  'Fashion', 'Commercial', 'Beauty', 'Fitness', 'Editorial',
  'Runway', 'Swimwear', 'Lingerie', 'Plus Size', 'Petite',
  'Parts', 'Promotional', 'Art', 'Other',
];

const businessCategories = [
  'Fashion Brand', 'Advertising Agency', 'Event Management',
  'Media & Entertainment', 'E-commerce', 'Retail',
  'Beauty & Cosmetics', 'Film & TV', 'Music Industry',
  'Real Estate', 'Hospitality', 'Other',
];

const countries = ['Nigeria', 'Ghana', 'South Africa', 'Kenya', 'Other'];
const genders = ['Male', 'Female', 'Non-binary', 'Prefer not to say'];

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-10">
      {Array.from({ length: total }, (_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all",
              i < current
                ? "bg-[#D4AF37] text-white"
                : i === current
                ? "bg-[#D4AF37]/10 text-[#D4AF37] border-2 border-[#D4AF37]"
                : "bg-gray-100 text-gray-400"
            )}
          >
            {i < current ? <Check className="w-4 h-4" /> : i + 1}
          </div>
          {i < total - 1 && (
            <div className={cn("w-8 sm:w-16 h-0.5 rounded", i < current ? "bg-[#D4AF37]" : "bg-gray-100")} />
          )}
        </div>
      ))}
    </div>
  );
}

interface StepProps {
  onNext: () => void;
  onBack?: () => void;
}

function Step1Auth({ onNext }: StepProps) {
  const [mode, setMode] = useState<'choose' | 'email'>('choose');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const createUser = useMutation(api.users.createUser);
  const updateOnboardingStep = useMutation(api.users.updateOnboardingStep);

  const handleGoogle = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;
      const convexUserId = await createUser({
        firebaseUid: firebaseUser.uid,
        email: firebaseUser.email!,
        name: firebaseUser.displayName || firebaseUser.email!.split('@')[0],
        imageUrl: firebaseUser.photoURL || undefined,
      });
      await updateOnboardingStep({ userId: convexUserId as any, onboardingStep: 1 });
      onNext();
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') return;
      setError(err.message || 'Failed to sign in with Google.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignup = async (e: FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) { setError('Please enter your full name'); return; }
    if (!agree) { setError('Please accept the Terms of Service'); return; }
    setLoading(true);
    setError('');
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = result.user;
      const convexUserId = await createUser({
        firebaseUid: firebaseUser.uid,
        email: firebaseUser.email!,
        name: `${firstName} ${lastName}`,
      });
      await updateOnboardingStep({ userId: convexUserId as any, onboardingStep: 1 });
      onNext();
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please log in.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password must be at least 6 characters.');
      } else {
        setError(err.message || 'Failed to create account.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-black tracking-tight text-[#111111]">Create Your Account</h1>
        <p className="text-sm text-gray-400 mt-1">Join Nigeria's leading model marketplace</p>
      </div>

      <AnimatePresence mode="wait">
        {mode === 'choose' ? (
          <motion.div key="choose" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <button
              onClick={handleGoogle}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-4 bg-white border-2 border-gray-100 rounded-xl hover:border-gray-200 transition-all text-sm font-bold text-[#111111] disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Continue with Google
            </button>
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">or</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>
            <button
              onClick={() => setMode('email')}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-4 bg-[#111111] rounded-xl hover:bg-black transition-all text-sm font-bold text-white disabled:opacity-50"
            >
              <Mail className="w-5 h-5" /> Continue with Email
            </button>
            <p className="text-center text-xs text-gray-400 mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-[#D4AF37] font-bold hover:underline">Sign in</Link>
            </p>
          </motion.div>
        ) : (
          <motion.form key="email" onSubmit={handleEmailSignup} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">First Name</label>
                <input type="text" placeholder="John" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-[#D4AF37] outline-none text-sm transition-all" required />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Last Name</label>
                <input type="text" placeholder="Doe" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-[#D4AF37] outline-none text-sm transition-all" required />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email Address</label>
              <input type="email" placeholder="name@example.com" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-[#D4AF37] outline-none text-sm transition-all" required />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Password</label>
              <input type="password" placeholder="At least 6 characters" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-[#D4AF37] outline-none text-sm transition-all" required minLength={6} />
            </div>
            <div className="flex items-start gap-3">
              <input type="checkbox" checked={agree} onChange={e => setAgree(e.target.checked)} className="mt-1 rounded border-gray-300 text-[#D4AF37] focus:ring-[#D4AF37] shrink-0" />
              <p className="text-[10px] leading-relaxed text-gray-400">
                I agree to the <a href="/terms" className="text-black font-bold underline">Terms of Service</a> and <a href="/privacy" className="text-black font-bold underline">Privacy Policy</a>.
              </p>
            </div>
            {error && <p className="text-xs text-red-500 font-medium flex items-center gap-1"><AlertCircle className="w-3 h-3" />{error}</p>}
            <div className="flex gap-3">
              <button type="button" onClick={() => setMode('choose')} className="px-6 py-3 bg-gray-100 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-200 transition-all">Back</button>
              <button type="submit" disabled={loading} className="flex-1 bg-[#D4AF37] text-white py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#c9a430] transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

function Step2AccountType({ onNext }: StepProps) {
  const [selected, setSelected] = useState<AccountType>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const setUserRole = useMutation(api.users.setUserRole);
  const updateOnboardingStep = useMutation(api.users.updateOnboardingStep);
  const { convexUser } = useUser();

  const handleContinue = async () => {
    if (!selected || !convexUser?._id) return;
    setLoading(true);
    setError('');
    try {
      await setUserRole({ userId: convexUser._id as any, role: selected });
      await updateOnboardingStep({ userId: convexUser._id as any, onboardingStep: 2 });
      onNext();
    } catch (err: any) {
      setError('Failed to set account type. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-black tracking-tight text-[#111111]">How will you use BookAModel?</h1>
        <p className="text-sm text-gray-400 mt-1">Choose how you want to get started</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => setSelected('model')}
          className={cn(
            "relative p-6 sm:p-8 bg-white rounded-2xl border-2 text-left transition-all text-center sm:text-left",
            selected === 'model' ? "border-[#D4AF37] shadow-lg shadow-[#D4AF37]/10" : "border-gray-100 hover:border-gray-200"
          )}
        >
          {selected === 'model' && (
            <div className="absolute top-3 right-3 w-6 h-6 bg-[#D4AF37] rounded-full flex items-center justify-center">
              <Check className="w-3.5 h-3.5 text-white" />
            </div>
          )}
          <div className="w-14 h-14 bg-[#D4AF37]/10 rounded-2xl flex items-center justify-center mb-4 mx-auto sm:mx-0">
            <Camera className="w-7 h-7 text-[#D4AF37]" />
          </div>
          <h2 className="text-lg font-bold text-[#111111] mb-2 text-center sm:text-left">I'm a Model</h2>
          <p className="text-xs text-gray-400 leading-relaxed text-center sm:text-left">
            Create your portfolio, showcase your work, and get booked by businesses.
          </p>
          <div className="flex flex-wrap gap-1.5 mt-4 justify-center sm:justify-start">
            {['Get Discovered', 'Show Your Work', 'Get Booked'].map(tag => (
              <span key={tag} className="px-2.5 py-1 bg-[#D4AF37]/5 text-[#D4AF37] rounded-full text-[9px] font-bold uppercase tracking-wider">{tag}</span>
            ))}
          </div>
        </button>

        <button
          onClick={() => setSelected('business')}
          className={cn(
            "relative p-6 sm:p-8 bg-white rounded-2xl border-2 text-left transition-all text-center sm:text-left",
            selected === 'business' ? "border-[#D4AF37] shadow-lg shadow-[#D4AF37]/10" : "border-gray-100 hover:border-gray-200"
          )}
        >
          {selected === 'business' && (
            <div className="absolute top-3 right-3 w-6 h-6 bg-[#D4AF37] rounded-full flex items-center justify-center">
              <Check className="w-3.5 h-3.5 text-white" />
            </div>
          )}
          <div className="w-14 h-14 bg-[#111111]/5 rounded-2xl flex items-center justify-center mb-4 mx-auto sm:mx-0">
            <Building2 className="w-7 h-7 text-[#111111]" />
          </div>
          <h2 className="text-lg font-bold text-[#111111] mb-2 text-center sm:text-left">I'm a Business</h2>
          <p className="text-xs text-gray-400 leading-relaxed text-center sm:text-left">
            Find, contact, and book professional models for your projects.
          </p>
          <div className="flex flex-wrap gap-1.5 mt-4 justify-center sm:justify-start">
            {['Find Talent', 'Book Instantly', 'Campaigns'].map(tag => (
              <span key={tag} className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-[9px] font-bold uppercase tracking-wider">{tag}</span>
            ))}
          </div>
        </button>
      </div>

      {error && <p className="text-xs text-red-500 font-medium mt-4 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{error}</p>}

      <button
        onClick={handleContinue}
        disabled={!selected || loading}
        className="w-full mt-8 bg-[#D4AF37] text-white py-4 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#c9a430] transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {loading ? 'Setting up...' : 'Continue'}
      </button>
    </div>
  );
}

function PhotoUpload({ storageId, onUpload }: { storageId: string | null; onUpload: (id: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Only JPG, JPEG, PNG, and WebP files are allowed.');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError('File must be under 5MB.');
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setUploading(true);

    try {
      const uploadUrl = await generateUploadUrl();
      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: { 'Content-Type': file.type },
        body: file,
      });
      if (!response.ok) throw new Error('Upload failed');
      const { storageId } = await response.json();
      onUpload(storageId);
    } catch (err) {
      setError('Upload failed. Please try again.');
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex justify-center mb-6">
      <div className="relative">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-200 hover:border-[#D4AF37] transition-all disabled:opacity-50"
        >
          {preview || storageId ? (
            <img src={preview || undefined} alt="Preview" className="w-full h-full object-cover" />
          ) : uploading ? (
            <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
          ) : (
            <Camera className="w-8 h-8 text-gray-400" />
          )}
        </button>
        {!uploading && !storageId && !preview && (
          <div className="absolute bottom-0 right-0 w-8 h-8 bg-[#D4AF37] rounded-full flex items-center justify-center">
            <Upload className="w-4 h-4 text-white" />
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          className="hidden"
          onChange={handleFile}
        />
      </div>
      {error && <p className="absolute mt-28 text-[10px] text-red-500 font-medium">{error}</p>}
    </div>
  );
}

function Step3ModelProfile({ onNext, onBack }: StepProps) {
  const [form, setForm] = useState({
    username: '', phone: '', country: 'Nigeria', state: '',
    city: '', gender: '', dob: '', height: '',
    categories: [] as string[], bio: '',
  });
  const [photoStorageId, setPhotoStorageId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const saveModelProfile = useMutation(api.users.saveModelProfile);
  const completeOnboarding = useMutation(api.users.completeOnboarding);
  const { convexUser } = useUser();

  const toggleCategory = (cat: string) => {
    setForm(prev => ({
      ...prev,
      categories: prev.categories.includes(cat)
        ? prev.categories.filter(c => c !== cat)
        : [...prev.categories, cat],
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.username.trim()) { setError('Username is required'); return; }
    if (!convexUser?._id) { setError('Not authenticated. Please restart.'); return; }
    setLoading(true);
    setError('');
    try {
      await saveModelProfile({
        userId: convexUser._id as any,
        username: form.username.trim(),
        phone: form.phone || undefined,
        gender: form.gender || undefined,
        country: form.country || undefined,
        state: form.state || undefined,
        city: form.city || undefined,
        dateOfBirth: form.dob || undefined,
        height: form.height || undefined,
        bio: form.bio || undefined,
        categories: form.categories.length > 0 ? form.categories : undefined,
        profilePhotoStorageId: photoStorageId || undefined,
      });
      await completeOnboarding({ userId: convexUser._id as any });
      onNext();
    } catch (err: any) {
      setError(err.message || 'Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-black tracking-tight text-[#111111]">Set Up Your Model Profile</h1>
        <p className="text-sm text-gray-400 mt-1">Tell brands who you are. You can always edit later.</p>
      </div>

      <div className="space-y-4 max-w-lg mx-auto">
        <PhotoUpload storageId={photoStorageId} onUpload={setPhotoStorageId} />

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Username <span className="text-red-400">*</span>
          </label>
          <input type="text" placeholder="@john.doe" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-[#D4AF37] outline-none text-sm transition-all" required />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Phone</label>
            <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-xl border border-transparent focus-within:bg-white focus-within:border-[#D4AF37] transition-all">
              <Phone className="w-4 h-4 text-gray-300 shrink-0" />
              <input type="tel" placeholder="+234" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="bg-transparent outline-none text-sm flex-1" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Gender</label>
            <select value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })} className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-[#D4AF37] outline-none text-sm transition-all">
              <option value="">Select</option>
              {genders.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Country</label>
            <select value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} className="w-full px-3 py-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-[#D4AF37] outline-none text-sm transition-all">
              {countries.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">State</label>
            <input type="text" placeholder="Lagos" value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} className="w-full px-3 py-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-[#D4AF37] outline-none text-sm transition-all" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">City</label>
            <input type="text" placeholder="Ikeja" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className="w-full px-3 py-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-[#D4AF37] outline-none text-sm transition-all" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date of Birth</label>
            <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-xl border border-transparent focus-within:bg-white focus-within:border-[#D4AF37] transition-all">
              <Calendar className="w-4 h-4 text-gray-300 shrink-0" />
              <input type="date" value={form.dob} onChange={e => setForm({ ...form, dob: e.target.value })} className="bg-transparent outline-none text-sm flex-1" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Height</label>
            <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-xl border border-transparent focus-within:bg-white focus-within:border-[#D4AF37] transition-all">
              <Ruler className="w-4 h-4 text-gray-300 shrink-0" />
              <input type="text" placeholder={"5'7\""} value={form.height} onChange={e => setForm({ ...form, height: e.target.value })} className="bg-transparent outline-none text-sm flex-1" />
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Categories</label>
          <div className="flex flex-wrap gap-2">
            {modelCategories.map(cat => (
              <button key={cat} type="button" onClick={() => toggleCategory(cat)} className={cn("px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all", form.categories.includes(cat) ? "bg-[#D4AF37] text-white" : "bg-gray-50 text-gray-500 hover:bg-gray-100")}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Short Bio</label>
          <textarea placeholder="Tell brands about yourself..." value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} rows={3} className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-[#D4AF37] outline-none text-sm transition-all resize-none" />
        </div>

        {error && <p className="text-xs text-red-500 font-medium flex items-center gap-1"><AlertCircle className="w-3 h-3" />{error}</p>}

        <div className="flex gap-3 pt-4">
          <button type="button" onClick={onBack} disabled={loading} className="px-6 py-3 bg-gray-100 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-200 transition-all flex items-center gap-1">
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          <button type="submit" disabled={loading} className="flex-1 bg-[#D4AF37] text-white py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#c9a430] transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? 'Saving...' : 'Continue'} <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </form>
  );
}

function Step3BusinessProfile({ onNext, onBack }: StepProps) {
  const [form, setForm] = useState({
    businessName: '', contactPerson: '', phone: '',
    country: 'Nigeria', state: '', category: '',
    website: '', description: '',
  });
  const [logoStorageId, setLogoStorageId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const saveBusinessProfile = useMutation(api.users.saveBusinessProfile);
  const completeOnboarding = useMutation(api.users.completeOnboarding);
  const { convexUser } = useUser();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.businessName.trim()) { setError('Business name is required'); return; }
    if (!form.contactPerson.trim()) { setError('Contact person is required'); return; }
    if (!convexUser?._id) { setError('Not authenticated. Please restart.'); return; }
    setLoading(true);
    setError('');
    try {
      await saveBusinessProfile({
        userId: convexUser._id as any,
        businessName: form.businessName.trim(),
        contactPerson: form.contactPerson.trim(),
        phone: form.phone || undefined,
        country: form.country || undefined,
        state: form.state || undefined,
        businessCategory: form.category || undefined,
        website: form.website || undefined,
        description: form.description || undefined,
        logoStorageId: logoStorageId || undefined,
      });
      await completeOnboarding({ userId: convexUser._id as any });
      onNext();
    } catch (err: any) {
      setError(err.message || 'Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-black tracking-tight text-[#111111]">Set Up Your Business Profile</h1>
        <p className="text-sm text-gray-400 mt-1">Tell models about your company. You can always edit later.</p>
      </div>

      <div className="space-y-4 max-w-lg mx-auto">
        <PhotoUpload storageId={logoStorageId} onUpload={setLogoStorageId} />

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Business Name <span className="text-red-400">*</span>
            </label>
            <input type="text" placeholder="Your Brand Ltd" value={form.businessName} onChange={e => setForm({ ...form, businessName: e.target.value })} className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-[#D4AF37] outline-none text-sm transition-all" required />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Contact Person <span className="text-red-400">*</span>
            </label>
            <input type="text" placeholder="Jane Doe" value={form.contactPerson} onChange={e => setForm({ ...form, contactPerson: e.target.value })} className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-[#D4AF37] outline-none text-sm transition-all" required />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Phone Number</label>
          <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-xl border border-transparent focus-within:bg-white focus-within:border-[#D4AF37] transition-all">
            <Phone className="w-4 h-4 text-gray-300 shrink-0" />
            <input type="tel" placeholder="+234 800 000 0000" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="bg-transparent outline-none text-sm flex-1" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Country</label>
            <select value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} className="w-full px-3 py-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-[#D4AF37] outline-none text-sm transition-all">
              {countries.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">State</label>
            <input type="text" placeholder="Lagos" value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} className="w-full px-3 py-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-[#D4AF37] outline-none text-sm transition-all" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Category</label>
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-[#D4AF37] outline-none text-sm transition-all">
              <option value="">Select</option>
              {businessCategories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Website</label>
          <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-xl border border-transparent focus-within:bg-white focus-within:border-[#D4AF37] transition-all">
            <Globe className="w-4 h-4 text-gray-300 shrink-0" />
            <input type="url" placeholder="https://yourcompany.com" value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} className="bg-transparent outline-none text-sm flex-1" />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Description</label>
          <textarea placeholder="Tell models what your company does..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-[#D4AF37] outline-none text-sm transition-all resize-none" />
        </div>

        {error && <p className="text-xs text-red-500 font-medium flex items-center gap-1"><AlertCircle className="w-3 h-3" />{error}</p>}

        <div className="flex gap-3 pt-4">
          <button type="button" onClick={onBack} disabled={loading} className="px-6 py-3 bg-gray-100 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-200 transition-all flex items-center gap-1">
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          <button type="submit" disabled={loading} className="flex-1 bg-[#D4AF37] text-white py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#c9a430] transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? 'Saving...' : 'Complete Setup'} <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </form>
  );
}

function Step4Success({ accountType }: { accountType: AccountType }) {
  const navigate = useNavigate();

  return (
    <div className="text-center">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15 }} className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
        <Check className="w-10 h-10 text-green-500" />
      </motion.div>
      <h1 className="text-2xl font-black tracking-tight text-[#111111] mb-2">You're All Set!</h1>
      <p className="text-sm text-gray-400 mb-2">
        Your {accountType === 'model' ? 'model' : 'business'} profile has been created.
      </p>
      <p className="text-xs text-gray-400 mb-10">
        Welcome to BookAModel — Nigeria's premier model marketplace.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={() => navigate(accountType === 'model' ? '/model-dashboard' : '/business-dashboard')}
          className="bg-[#D4AF37] text-white px-8 py-4 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#c9a430] transition-all active:scale-95"
        >
          Go to {accountType === 'model' ? 'Model' : 'Business'} Dashboard
        </button>
        <button
          onClick={() => navigate('/')}
          className="bg-gray-100 text-gray-600 px-8 py-4 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-gray-200 transition-all"
        >
          Go to Homepage
        </button>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [accountType, setAccountType] = useState<AccountType>(null);
  const [initialized, setInitialized] = useState(false);
  const navigate = useNavigate();
  const { firebaseUser, convexUser, isLoading } = useUser();

  const totalSteps = 4;

  useEffect(() => {
    if (!isLoading && convexUser) {
      if (convexUser.profileCompleted) {
        navigate(convexUser.role === 'business' ? '/business-dashboard' : '/model-dashboard', { replace: true });
        return;
      }
      if (!initialized && convexUser.onboardingStep > 0) {
        setStep(convexUser.onboardingStep);
        if (convexUser.role) {
          setAccountType(convexUser.role as AccountType);
        }
        setInitialized(true);
      } else if (!initialized) {
        setInitialized(true);
      }
    }
  }, [isLoading, convexUser, initialized, navigate]);

  const handleStep0Complete = () => {
    setStep(1);
  };

  const handleStep1Complete = () => {
    setStep(2);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F8F8] flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl">
        {firebaseUser && <StepIndicator current={step} total={totalSteps} />}

        <div className="bg-white rounded-2xl p-6 sm:p-10 border border-gray-100 shadow-sm">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {!firebaseUser && <Step1Auth onNext={handleStep0Complete} />}
              {firebaseUser && !convexUser && (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin mx-auto mb-4" />
                  <p className="text-sm text-gray-400">Loading your profile...</p>
                </div>
              )}
              {firebaseUser && convexUser && step === 1 && (
                <Step2AccountType onNext={handleStep1Complete} />
              )}
              {firebaseUser && convexUser && step === 2 && accountType === 'model' && (
                <Step3ModelProfile onNext={() => setStep(3)} onBack={() => setStep(1)} />
              )}
              {firebaseUser && convexUser && step === 2 && accountType === 'business' && (
                <Step3BusinessProfile onNext={() => setStep(3)} onBack={() => setStep(1)} />
              )}
              {step === 3 && <Step4Success accountType={accountType} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
