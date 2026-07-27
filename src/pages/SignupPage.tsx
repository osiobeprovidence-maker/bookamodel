/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Briefcase, Camera, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { cn } from '../lib/utils';
import { useUser } from '../contexts/UserContext';

export const SignupPage = () => {
  const [role, setRole] = useState<'business' | 'model'>('business');
  const [email, setEmail] = useState('');
  const { login } = useUser();
  const navigate = useNavigate();

  const handleSignup = (e: FormEvent) => {
    e.preventDefault();
    login(email || `user@example.com`, role);
    navigate(role === 'business' ? '/business-dashboard' : '/model-dashboard');
  };

  return (
    <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center px-4 sm:px-6 pt-24 pb-12">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-2xl p-6 sm:p-10 border border-gray-100 shadow-sm">
          <div className="text-center mb-10">
            <h1 className="text-2xl font-bold tracking-tight mb-2 uppercase">Create Account</h1>
            <p className="text-sm text-gray-400">Join Nigeria's leading model marketplace</p>
          </div>

          <div className="flex p-1 bg-gray-50 rounded-xl mb-10">
            <button
              onClick={() => setRole('business')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold uppercase tracking-wider rounded-lg transition-all",
                role === 'business' ? "bg-white text-black shadow-sm" : "text-gray-400 hover:text-gray-600"
              )}
            >
              <Briefcase className="w-4 h-4" /> I'm a Business
            </button>
            <button
              onClick={() => setRole('model')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold uppercase tracking-wider rounded-lg transition-all",
                role === 'model' ? "bg-white text-black shadow-sm" : "text-gray-400 hover:text-gray-600"
              )}
            >
              <Camera className="w-4 h-4" /> I'm a Model
            </button>
          </div>

          <form className="space-y-6" onSubmit={handleSignup}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">First Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                  <input 
                    type="text" 
                    placeholder="John" 
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-[#D4AF37] outline-none transition-all text-sm"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Last Name</label>
                <input 
                  type="text" 
                  placeholder="Doe" 
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-[#D4AF37] outline-none transition-all text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                <input 
                  type="email" 
                  placeholder="name@company.com" 
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-[#D4AF37] outline-none transition-all text-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                <input 
                  type="password" 
                  placeholder="At least 8 characters" 
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-[#D4AF37] outline-none transition-all text-sm"
                />
              </div>
            </div>

            <div className="flex items-start gap-3 px-1">
              <input type="checkbox" className="mt-1 rounded border-gray-300 text-[#D4AF37] focus:ring-[#D4AF37]" />
              <p className="text-[10px] leading-relaxed text-gray-400">
                I agree to the <a href="#" className="text-black font-bold underline">Terms of Service</a> and <a href="#" className="text-black font-bold underline">Privacy Policy</a>.
              </p>
            </div>

            <Button className="w-full py-4 rounded-xl font-bold group">
              Create My Account <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </form>
        </div>

        <p className="text-center mt-8 text-sm text-gray-400">
          Already have an account? <Link to="/login" className="text-black font-bold hover:text-[#D4AF37] transition-colors">Login instead</Link>
        </p>
      </div>
    </div>
  );
};
