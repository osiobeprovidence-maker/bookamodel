/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import {
  User,
  Ruler,
  Instagram,
  FileText,
  Eye,
  Camera,
} from 'lucide-react';
import { profileData } from '../../data/dashboardData';

const inputClass =
  'w-full px-6 py-4 bg-white rounded-xl border border-gray-100 focus:border-[#D4AF37] outline-none transition-all text-sm font-medium';

const selectClass =
  'w-full px-6 py-4 bg-white rounded-xl border border-gray-100 focus:border-[#D4AF37] outline-none transition-all text-sm font-medium appearance-none';

export default function MyProfile() {
  const [form, setForm] = useState({ ...profileData });
  const [showToast, setShowToast] = useState(false);

  const update = (key: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleCancel = () => {
    setForm({ ...profileData });
  };

  return (
    <div className="p-10">
      {/* Header */}
      <header className="mb-10">
        <h1 className="text-3xl font-black tracking-tight text-[#111111]">
          My Profile
        </h1>
        <p className="text-gray-400 font-medium text-sm mt-1">
          Manage your personal information and modeling details.
        </p>
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

          {/* Profile Photo */}
          <div className="flex items-center gap-6 mb-8">
            <div className="relative group">
              <img
                src={form.profileImage}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-2 border-white shadow-sm"
              />
              <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                <Camera className="w-5 h-5 text-white" />
              </div>
            </div>
            <div>
              <p className="text-sm font-bold text-[#111111]">{form.fullName}</p>
              <p className="text-xs text-gray-400 mt-1">Click photo to change</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={form.fullName}
                onChange={(e) => update('fullName', e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                className={inputClass}
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
                <option>Female</option>
                <option>Male</option>
                <option>Non-binary</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                Nationality
              </label>
              <input
                type="text"
                value={form.nationality}
                onChange={(e) => update('nationality', e.target.value)}
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
              <select
                value={form.category}
                onChange={(e) => update('category', e.target.value)}
                className={selectClass}
              >
                <option>Fashion Model</option>
                <option>Commercial Model</option>
                <option>Runway Model</option>
                <option>Fitness Model</option>
                <option>Product Model</option>
                <option>Bridal Model</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                Agency
              </label>
              <input
                type="text"
                value={form.agency}
                onChange={(e) => update('agency', e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                Years of Experience
              </label>
              <input
                type="number"
                value={form.yearsOfExperience}
                onChange={(e) => update('yearsOfExperience', e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                Height (cm)
              </label>
              <input
                type="number"
                value={form.height}
                onChange={(e) => update('height', e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                Weight (kg)
              </label>
              <input
                type="number"
                value={form.weight}
                onChange={(e) => update('weight', e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                Bust
              </label>
              <input
                type="text"
                value={form.bust}
                onChange={(e) => update('bust', e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                Waist
              </label>
              <input
                type="text"
                value={form.waist}
                onChange={(e) => update('waist', e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                Hip
              </label>
              <input
                type="text"
                value={form.hip}
                onChange={(e) => update('hip', e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                Shoe Size
              </label>
              <input
                type="text"
                value={form.shoeSize}
                onChange={(e) => update('shoeSize', e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                Hair Color
              </label>
              <select
                value={form.hairColor}
                onChange={(e) => update('hairColor', e.target.value)}
                className={selectClass}
              >
                <option>Black</option>
                <option>Brown</option>
                <option>Blonde</option>
                <option>Red</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                Eye Color
              </label>
              <select
                value={form.eyeColor}
                onChange={(e) => update('eyeColor', e.target.value)}
                className={selectClass}
              >
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
                <option>Fair</option>
                <option>Light</option>
                <option>Medium</option>
                <option>Deep</option>
                <option>Ebony</option>
              </select>
            </div>
          </div>
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
                Facebook
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">
                  f
                </span>
                <input
                  type="text"
                  value={form.facebook}
                  onChange={(e) => update('facebook', e.target.value)}
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
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                YouTube
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">
                  YT
                </span>
                <input
                  type="text"
                  value={form.youtube}
                  onChange={(e) => update('youtube', e.target.value)}
                  className={`${inputClass} pl-12`}
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                Website
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Eye className="w-4 h-4" />
                </span>
                <input
                  type="url"
                  value={form.website}
                  onChange={(e) => update('website', e.target.value)}
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
              onClick={() => update('visibleToBrands', !form.visibleToBrands)}
              className={`relative w-12 h-7 rounded-full transition-colors ${
                form.visibleToBrands ? 'bg-[#D4AF37]' : 'bg-gray-200'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                  form.visibleToBrands ? 'translate-x-5' : ''
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

      {/* Success Toast */}
      {showToast && (
        <div className="fixed bottom-8 right-8 bg-[#111111] text-white px-6 py-4 rounded-xl shadow-xl text-sm font-bold flex items-center gap-3 z-50">
          <div className="w-2 h-2 bg-green-500 rounded-full" />
          Profile saved successfully!
        </div>
      )}
    </div>
  );
}
