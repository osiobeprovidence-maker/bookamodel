import { useState, useEffect, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Mail, Check, Camera, AlertCircle, Loader2, Building2,
} from 'lucide-react';
import { createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { useMutation } from 'convex/react';
import { auth, googleProvider } from '../lib/firebase';
import { api } from '../../convex/_generated/api';
import { useUser } from '../contexts/UserContext';
import { cn } from '../lib/utils';

type AccountType = 'model' | 'business';

function AuthScreen() {
  const [mode, setMode] = useState<'choose' | 'email'>('choose');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const createUser = useMutation(api.users.createUser);

  const handleGoogle = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await createUser({
        firebaseUid: result.user.uid,
        email: result.user.email!,
        name: result.user.displayName || result.user.email!.split('@')[0],
        imageUrl: result.user.photoURL || undefined,
      });
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
      await createUser({
        firebaseUid: result.user.uid,
        email: result.user.email!,
        name: `${firstName} ${lastName}`,
      });
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

      {mode === 'choose' ? (
        <div className="space-y-4">
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
        </div>
      ) : (
        <form onSubmit={handleEmailSignup} className="space-y-5">
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
        </form>
      )}
    </div>
  );
}

function AccountTypeSelection() {
  const [selected, setSelected] = useState<AccountType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const setUserRole = useMutation(api.users.setUserRole);
  const { convexUser } = useUser();
  const navigate = useNavigate();

  const handleContinue = async () => {
    if (!selected || !convexUser?._id) return;
    setLoading(true);
    setError('');
    try {
      await setUserRole({ userId: convexUser._id as any, role: selected });
      navigate(selected === 'business' ? '/business-dashboard' : '/model-dashboard', { replace: true });
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

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { firebaseUser, convexUser, isLoading } = useUser();

  useEffect(() => {
    if (convexUser?.role) {
      navigate(convexUser.role === 'business' ? '/business-dashboard' : convexUser.role === 'admin' ? '/admin' : '/model-dashboard', { replace: true });
    }
  }, [convexUser, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
      </div>
    );
  }

  if (!firebaseUser) {
    return (
      <div className="min-h-screen bg-[#F8F8F8] flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-xl">
          <div className="bg-white rounded-2xl p-6 sm:p-10 border border-gray-100 shadow-sm">
            <AuthScreen />
          </div>
        </div>
      </div>
    );
  }

  if (!convexUser) {
    return (
      <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
      </div>
    );
  }

  if (!convexUser.role) {
    return (
      <div className="min-h-screen bg-[#F8F8F8] flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-xl">
          <div className="bg-white rounded-2xl p-6 sm:p-10 border border-gray-100 shadow-sm">
            <AccountTypeSelection />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
    </div>
  );
}
