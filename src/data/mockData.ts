/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Model, Category, Review, Invitation } from '../types';

export const categories: Category[] = [
  { id: '1', name: 'Lash Model', icon: 'Eye', image: 'https://images.unsplash.com/photo-1583001809224-28a649367440?w=400&h=400&fit=crop', count: 12 },
  { id: '2', name: 'Makeup Model', icon: 'Sparkles', image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=400&fit=crop', count: 18 },
  { id: '3', name: 'Hair Model', icon: 'Scissors', image: 'https://images.unsplash.com/photo-1560869713-7d0a29430803?w=400&h=400&fit=crop', count: 9 },
  { id: '4', name: 'Fashion Model', icon: 'Shirt', image: 'https://images.unsplash.com/photo-1539109132304-39155021aa39?w=400&h=400&fit=crop', count: 24 },
  { id: '5', name: 'Commercial Model', icon: 'Camera', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop', count: 15 },
  { id: '6', name: 'Product Model', icon: 'Package', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=400&fit=crop', count: 7 },
  { id: '7', name: 'Jewellery Model', icon: 'Gem', image: 'https://images.unsplash.com/photo-1515562141207-7a1891ce32c3?w=400&h=400&fit=crop', count: 11 },
  { id: '8', name: 'Skincare Model', icon: 'Droplets', image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=400&fit=crop', count: 14 },
  { id: '9', name: 'Native Wear Model', icon: 'MapPin', image: 'https://images.unsplash.com/photo-1523464862212-d6631d073194?w=400&h=400&fit=crop', count: 8 },
  { id: '10', name: 'Fitness Model', icon: 'Dumbbell', image: 'https://images.unsplash.com/photo-1583454110551-21f2fa200c01?w=400&h=400&fit=crop', count: 16 },
  { id: '11', name: 'Bridal Model', icon: 'Heart', image: 'https://images.unsplash.com/photo-1544120190-275d3f242341?w=400&h=400&fit=crop', count: 10 },
  { id: '12', name: 'Runway Model', icon: 'Zap', image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&h=400&fit=crop', count: 20 },
];

const skinTones = ['Fair', 'Medium', 'Deep', 'Ebony', 'Light'];
const locations = ['Lagos', 'Abuja', 'Port Harcourt', 'Enugu', 'Ibadan', 'Kano'];

export const models: Model[] = Array.from({ length: 30 }).map((_, i) => ({
  id: `${i + 1}`,
  name: i % 2 === 0 ? `Chioma Adebayo ${i + 1}` : `Emeka Okafor ${i + 1}`,
  age: 18 + (i % 12),
  gender: i % 3 === 0 ? 'Male' : 'Female',
  location: locations[i % locations.length],
  height: `${170 + (i % 20)}cm`,
  measurements: i % 2 === 0 ? '34-24-36' : '38-32-40',
  categories: [categories[i % categories.length].name, categories[(i + 1) % categories.length].name],
  languages: ['English', 'Yoruba', 'Igbo'],
  travelAvailability: i % 4 !== 0,
  bio: 'Professional model with experience in high fashion and commercial projects. Passionate about bringing creative visions to life.',
  profileImage: `https://images.unsplash.com/photo-${1500000000000 + i * 1000}?w=400&h=400&fit=crop&crop=faces`,
  coverImage: `https://images.unsplash.com/photo-${1510000000000 + i * 1000}?w=1200&h=400&fit=crop`,
  portfolio: [
    `https://images.unsplash.com/photo-${1520000000000 + i * 2000}?w=800&h=1000&fit=crop`,
    `https://images.unsplash.com/photo-${1530000000000 + i * 2000}?w=800&h=1000&fit=crop`,
    `https://images.unsplash.com/photo-${1540000000000 + i * 2000}?w=800&h=1000&fit=crop`,
    `https://images.unsplash.com/photo-${1550000000000 + i * 2000}?w=800&h=1000&fit=crop`,
  ],
  isVerified: i % 3 === 0,
  isPro: i % 5 === 0,
  isAvailableToday: i % 4 === 0,
  rating: 4.5 + (i % 5) / 10,
  completedJobs: 10 + (i % 50),
  responseRate: '98%',
  skinTone: skinTones[i % skinTones.length],
  instagram: `@model_${i + 1}`,
  tiktok: `@model_tiktok_${i + 1}`,
}));

export const reviews: Review[] = Array.from({ length: 20 }).map((_, i) => ({
  id: `${i + 1}`,
  modelId: `${(i % 30) + 1}`,
  userName: `Business Owner ${i + 1}`,
  userImage: `https://i.pravatar.cc/150?u=${i}`,
  rating: 4 + (i % 2),
  comment: 'Amazing experience working together. Very professional and followed directions perfectly. Would definitely book again!',
  date: '2024-05-15',
}));

export const invitations: Invitation[] = Array.from({ length: 10 }).map((_, i) => ({
  id: `${i + 1}`,
  businessName: `Brand ${i + 1}`,
  modelId: `${(i % 30) + 1}`,
  category: 'Fashion Model',
  date: '2024-06-20',
  time: '10:00 AM',
  payment: '₦150,000',
  location: 'Lagos Island',
  description: 'Full day shoot for new collection launch.',
  status: i % 3 === 0 ? 'Accepted' : i % 3 === 1 ? 'Pending' : 'Declined',
}));
