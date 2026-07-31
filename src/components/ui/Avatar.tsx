import { useState, useEffect } from 'react';
import { Building2, type LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

const PALETTE = [
  { bg: '#D4AF37', text: '#111111' },
  { bg: '#111111', text: '#D4AF37' },
  { bg: '#7C3AED', text: '#FFFFFF' },
  { bg: '#2563EB', text: '#FFFFFF' },
  { bg: '#059669', text: '#FFFFFF' },
  { bg: '#DB2777', text: '#FFFFFF' },
  { bg: '#EA580C', text: '#FFFFFF' },
  { bg: '#0F766E', text: '#FFFFFF' },
];

function colorFor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return PALETTE[hash % PALETTE.length];
}

function initialsFor(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '';
  if (words.length === 1) return words[0][0].toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: number;
  icon?: LucideIcon;
  className?: string;
}

export default function Avatar({
  src,
  name,
  size = 40,
  icon: Icon = Building2,
  className,
}: AvatarProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  const showImage = !!src && !failed;

  if (showImage) {
    return (
      <img
        src={src}
        alt={name || 'avatar'}
        onError={() => setFailed(true)}
        style={{ width: size, height: size }}
        className={cn(
          'rounded-full object-cover shrink-0',
          'shadow-md shadow-black/10',
          'ring-2 ring-white/60 dark:ring-gray-800/60',
          className
        )}
      />
    );
  }

  const color = colorFor(name || '');
  const initials = initialsFor(name || '');

  return (
    <div
      style={{
        width: size,
        height: size,
        backgroundColor: color.bg,
        color: color.text,
        fontSize: Math.round(size * 0.38),
      }}
      className={cn(
        'rounded-full flex items-center justify-center font-bold select-none shrink-0',
        'shadow-md shadow-black/10',
        'ring-2 ring-white/60 dark:ring-gray-800/60',
        className
      )}
    >
      {initials ? initials : <Icon style={{ width: size * 0.5, height: size * 0.5 }} />}
    </div>
  );
}
