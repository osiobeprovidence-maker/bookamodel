/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Model {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Non-binary';
  location: string;
  height: string;
  measurements: string;
  categories: string[];
  languages: string[];
  travelAvailability: boolean;
  bio: string;
  portfolio: string[];
  profileImage: string;
  coverImage: string;
  instagram?: string;
  tiktok?: string;
  isVerified: boolean;
  isPro: boolean;
  isAvailableToday: boolean;
  rating: number;
  completedJobs: number;
  responseRate: string;
  skinTone: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  image: string;
  count: number;
}

export interface Review {
  id: string;
  modelId: string;
  userName: string;
  userImage: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Invitation {
  id: string;
  businessName: string;
  modelId: string;
  category: string;
  date: string;
  time: string;
  payment: string;
  location: string;
  description: string;
  status: 'Pending' | 'Accepted' | 'Declined';
}

export interface StatCard {
  label: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
}
