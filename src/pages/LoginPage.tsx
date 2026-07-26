/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Github } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useUser } from '../contexts/UserContext';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const { login } = useUser();
  const navigate = useNavigate();

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    // Simulate login
    const role = email === 'riderezzy@gmail.com' ? 'business' : 'model';
    login(email, role);
    navigate(role === 'business' ? '/business-dashboard' : '/model-dashboard');
  };

  return (
    <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center px-6 pt-20">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl p-10 border border-gray-100 shadow-sm">
          <div className="text-center mb-10">
            <h1 className="text-2xl font-bold tracking-tight mb-2 uppercase">Welcome Back</h1>
            <p className="text-sm text-gray-400">Enter your credentials to access your account</p>
          </div>

          <form className="space-y-6" onSubmit={handleLogin}>
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
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Password</label>
                <a href="#" className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest">Forgot?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-[#D4AF37] outline-none transition-all text-sm"
                />
              </div>
            </div>

            <Button className="w-full py-4 rounded-xl font-bold group">
              Login to Account <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold text-gray-300 bg-white px-4">
                Or continue with
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button variant="secondary" className="rounded-xl flex items-center gap-2">
                <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" /> Google
              </Button>
              <Button variant="secondary" className="rounded-xl flex items-center gap-2">
                <Github className="w-4 h-4" /> Github
              </Button>
            </div>
          </form>
        </div>

        <p className="text-center mt-8 text-sm text-gray-400">
          Don't have an account? <Link to="/signup" className="text-black font-bold hover:text-[#D4AF37] transition-colors">Sign up for free</Link>
        </p>
      </div>
    </div>
  );
};
