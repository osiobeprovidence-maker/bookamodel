/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogIn, Search, Grid } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { cn } from '../lib/utils';
import { useUser } from '../contexts/UserContext';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useUser();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Find Models', path: '/explore', icon: Search },
    { name: 'Categories', path: '/categories', icon: Grid },
    { name: 'Pricing', path: '/pricing', icon: Grid },
    { name: 'Become a Model', path: '/create-profile', icon: User },
  ];

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 py-4',
        scrolled ? 'bg-white/80 backdrop-blur-xl shadow-sm py-3' : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <span className="text-xl font-bold tracking-tighter text-black uppercase">BookAModel</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={cn(
                'text-sm font-medium transition-colors hover:text-[#D4AF37]',
                location.pathname === link.path ? 'text-[#D4AF37]' : 'text-gray-600'
              )}
            >
              {link.name}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <Link to={user.role === 'business' ? '/business-dashboard' : '/model-dashboard'}>
                <Button variant="ghost" size="sm" className="font-bold">Dashboard</Button>
              </Link>
              <Button 
                variant="outline" 
                size="sm" 
                className="font-bold"
                onClick={() => { logout(); navigate('/'); }}
              >
                Logout
              </Button>
            </div>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm" className="font-bold">Login</Button>
              </Link>
              <Link to="/signup">
                <Button variant="primary" size="sm" className="rounded-2xl shadow-lg shadow-black/10">Sign Up</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden p-2 text-black"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-t border-gray-100 p-6 flex flex-col gap-6 shadow-2xl animate-in slide-in-from-top-4 duration-300">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className="flex items-center gap-4 text-lg font-bold text-gray-900"
              onClick={() => setIsOpen(false)}
            >
              <link.icon className="w-5 h-5 text-[#D4AF37]" />
              {link.name}
            </Link>
          ))}
          <div className="h-px bg-gray-100 my-2" />
          <div className="grid grid-cols-2 gap-4">
            <Link to="/login" onClick={() => setIsOpen(false)}>
              <Button variant="secondary" className="w-full font-bold">Login</Button>
            </Link>
            <Link to="/signup" onClick={() => setIsOpen(false)}>
              <Button variant="primary" className="w-full font-bold">Sign Up</Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};
