import { motion } from 'framer-motion';
import { CheckCircle2, User } from 'lucide-react';
import { Badge } from './Badge';
import { Button } from './Button';
import { cn } from '../../lib/utils';

export interface ExploreModel {
  _id: string;
  userId: string;
  displayName: string;
  imageUrl?: string;
  gender?: string;
  city?: string;
  state?: string;
  country?: string;
  height?: string;
  categories: string[];
  bio?: string;
  tagline?: string;
  isVerified: boolean;
  isFeatured?: boolean;
  isPro?: boolean;
  isAvailable: boolean;
  rating?: number;
  reviewCount?: number;
  completedJobs?: number;
  hourlyRate?: string;
  dailyRate?: string;
  user: {
    _id: string;
    name: string;
    email: string;
  } | null;
}

interface ProfileCardProps {
  model: ExploreModel;
  className?: string;
  onInvite?: (id: string) => void;
  onViewProfile?: (id: string) => void;
}

export const ProfileCard = ({ model, className, onInvite, onViewProfile }: ProfileCardProps) => {
  const displayName = model.displayName || model.user?.name || 'Model';
  const initial = displayName.charAt(0).toUpperCase();
  const location = [model.city, model.state, model.country].filter(Boolean).join(', ') || 'Nigeria';
  const categoryTags = model.categories.slice(0, 2);

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={cn(
        "group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300",
        className
      )}
    >
      <div className="aspect-[3/4] relative overflow-hidden">
        {model.imageUrl ? (
          <img
            src={model.imageUrl}
            alt={displayName}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <User className="w-16 h-16 text-gray-300" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {model.isAvailable && (
            <Badge variant="success">Available Now</Badge>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 flex justify-end p-4 bg-gradient-to-t from-black/60 to-transparent">
          <span className="text-[10px] font-medium text-white opacity-90">{location}</span>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-bold text-sm text-gray-900 leading-tight mb-1">{displayName}</h3>
            <div className="flex flex-wrap gap-1">
              {categoryTags.map((cat) => (
                <span key={cat} className="text-[10px] text-gray-400 font-medium">#{cat}</span>
              ))}
            </div>
          </div>
          {model.isVerified && <CheckCircle2 className="w-4 h-4 text-blue-500" />}
        </div>

        <div className="grid grid-cols-2 gap-2 mt-4">
          <Button
            size="sm"
            variant="secondary"
            className="w-full text-[10px] py-2 rounded-xl"
            onClick={() => onViewProfile?.(model._id)}
          >
            Profile
          </Button>
          <Button
            size="sm"
            variant="primary"
            className="w-full text-[10px] py-2 rounded-xl"
            onClick={() => onInvite?.(model._id)}
          >
            Invite
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
