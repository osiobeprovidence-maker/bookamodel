/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Linkedin, Github } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-black text-white py-20 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1 md:col-span-1">
          <div className="flex items-center mb-6">
            <span className="text-xl font-bold tracking-tighter uppercase">BookAModel</span>
          </div>
          <p className="text-gray-400 text-sm mb-8 leading-relaxed">
            The easiest way to find and book professional models in Nigeria. Connecting brands with exceptional talent.
          </p>
          <div className="flex gap-4">
            <a href="#" className="p-2 bg-white/10 rounded-xl hover:bg-[#D4AF37] transition-colors"><Instagram className="w-5 h-5" /></a>
            <a href="#" className="p-2 bg-white/10 rounded-xl hover:bg-[#D4AF37] transition-colors"><Twitter className="w-5 h-5" /></a>
            <a href="#" className="p-2 bg-white/10 rounded-xl hover:bg-[#D4AF37] transition-colors"><Facebook className="w-5 h-5" /></a>
            <a href="#" className="p-2 bg-white/10 rounded-xl hover:bg-[#D4AF37] transition-colors"><Linkedin className="w-5 h-5" /></a>
          </div>
        </div>

        <div>
          <h4 className="font-bold text-lg mb-6">Discovery</h4>
          <ul className="space-y-4 text-sm text-gray-400">
            <li><Link to="/explore" className="hover:text-white transition-colors">Find Models</Link></li>
            <li><Link to="/categories" className="hover:text-white transition-colors">Browse Categories</Link></li>
            <li><Link to="/explore?pro=true" className="hover:text-white transition-colors">Pro Models</Link></li>
            <li><Link to="/explore?verified=true" className="hover:text-white transition-colors">Verified Talent</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-lg mb-6">For Models</h4>
          <ul className="space-y-4 text-sm text-gray-400">
            <li><Link to="/create-profile" className="hover:text-white transition-colors">Become a Model</Link></li>
            <li><Link to="/pricing" className="hover:text-white transition-colors">Pricing Plans</Link></li>
            <li><Link to="/model-dashboard" className="hover:text-white transition-colors">Model Dashboard</Link></li>
            <li><Link to="/help" className="hover:text-white transition-colors">Success Stories</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-lg mb-6">Company</h4>
          <ul className="space-y-4 text-sm text-gray-400">
            <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
            <li><Link to="/contact" className="hover:text-white transition-colors">Contact Support</Link></li>
            <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-20 pt-10 border-t border-white/10 text-center text-sm text-gray-500">
        © 2024 BookAModel Nigeria. All rights reserved.
      </div>
    </footer>
  );
};
