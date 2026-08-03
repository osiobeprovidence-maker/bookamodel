import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import {
  Search, X, BadgeCheck, MapPin, Bookmark, ExternalLink, Send,
  Briefcase, Camera, Play,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useUser } from '../contexts/UserContext';
import { useToast } from '../components/ui/Toast';

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1488161628813-04466f872be2?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1200&auto=format&fit=crop',
];

function hashSeed(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

const fallbackFor = (seed: string, index = 0) =>
  FALLBACK_IMAGES[Math.abs(hashSeed(seed) + index) % FALLBACK_IMAGES.length];

const FILLER_NAMES = [
  'Amara', 'Zainab', 'Chioma', 'Temiloluwa', 'Fatima', 'Efe',
  'Ngozi', 'Hauwa', 'Simi', 'Yemisi', 'Kemi', 'Blessing',
];
const FILLER_CITIES = ['Lagos', 'Abuja', 'Port Harcourt', 'Enugu', 'Ibadan', 'Kano'];

const STYLES = [
  'Fashion', 'Beauty', 'Commercial', 'Fitness', 'Editorial',
  'Bridal', 'Lifestyle', 'Streetwear', 'Jewellery', 'Product',
];

const SHOOT_CATEGORIES = [
  'fashion', 'beauty', 'editorial', 'commercial', 'fitness',
  'runway', 'lifestyle', 'portrait', 'swimwear', 'product',
];

const capitalize = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

const ASPECTS = [
  'aspect-[3/4]',
  'aspect-[2/3]',
  'aspect-square',
  'aspect-[4/5]',
  'aspect-[3/5]',
  'aspect-[9/16]',
  'aspect-[11/12]',
];

const aspectFor = (seed: string) => ASPECTS[Math.abs(hashSeed(seed)) % ASPECTS.length];

const STATIC_FILTERS = [
  'All', 'Women', 'Men', 'Photographers', 'Agencies', 'Castings',
] as const;

type FeedItem = {
  key: string;
  kind: 'model' | 'business' | 'casting' | 'content';
  _id: string;
  name: string;
  location: string;
  image?: string;
  categories: string[];
  isVerified?: boolean;
  isAvailable?: boolean;
  rating?: number;
  aspect: string;
  subline?: string;
  mediaType?: 'image' | 'video';
};

export const Discover = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { convexUser } = useUser();
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get('q') ?? '';
  const f = searchParams.get('f') ?? 'All';

  const [query, setQuery] = useState(q);
  const [filter, setFilter] = useState<string>(f || 'All');
  const [visibleCount, setVisibleCount] = useState(24);
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => setQuery(q), [q]);

  const categoriesQuery = useQuery(api.categories.listActive);

  const genderArg = filter === 'Women' ? 'Female' : filter === 'Men' ? 'Male' : undefined;
  const isBusinessFilter = filter === 'Photographers' || filter === 'Agencies';
  const isCastingFilter = filter === 'Castings';
  const categoryArg = useMemo(() => {
    if (filter === 'All' || filter === 'Women' || filter === 'Men' || isBusinessFilter || isCastingFilter) return undefined;
    return (categoriesQuery ?? []).find((c: any) => c.name === filter)?.slug;
  }, [filter, categoriesQuery, isBusinessFilter, isCastingFilter]);

  const modelsQuery = useQuery(api.explore.listFeed, {
    gender: genderArg,
    category: categoryArg,
    limit: 60,
  });
  const businessesQuery = useQuery(api.explore.listBusinesses, { limit: 40 });
  const castingsQuery = useQuery(api.jobRequests.listOpen);
  const contentQuery = useQuery(api.explore.listContent, { limit: 60 });

  const filters = useMemo(() => {
    const names = (categoriesQuery ?? []).map((c: any) => c.name);
    return [...STATIC_FILTERS.slice(0, 3), ...names, ...STATIC_FILTERS.slice(3)];
  }, [categoriesQuery]);

  useEffect(() => {
    if (categoriesQuery === undefined) return;
    const known = new Set([...STATIC_FILTERS, ...(categoriesQuery ?? []).map((c: any) => c.name)]);
    if (!known.has(filter)) setFilter('All');
  }, [filter, categoriesQuery]);

  const updateParams = (nextQ: string, nextF: string) => {
    const params: Record<string, string> = {};
    if (nextQ) params.q = nextQ;
    if (nextF !== 'All') params.f = nextF;
    setSearchParams(params, { replace: true });
  };

  const onFilter = (f: string) => {
    setFilter(f);
    setVisibleCount(24);
    updateParams(query, f);
  };

  const onSearch = (v: string) => {
    setQuery(v);
    setVisibleCount(24);
    updateParams(v, filter);
  };

  const clearSearch = () => {
    setQuery('');
    setVisibleCount(24);
    updateParams('', filter);
    inputRef.current?.focus();
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const typing =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;
      if (e.key === '/' && !typing) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const items = useMemo<FeedItem[]>(() => {
    const search = query.trim().toLowerCase();

    const matches = (name: string, location: string, categories: string[]) => {
      if (!search) return true;
      return (
        name.toLowerCase().includes(search) ||
        location.toLowerCase().includes(search) ||
        categories.join(' ').toLowerCase().includes(search)
      );
    };

    if (isBusinessFilter) {
      const real: FeedItem[] = (businessesQuery?.businesses ?? []).map((b: any, i: number) => ({
        key: b._id,
        kind: 'business' as const,
        _id: b._id,
        name: b.companyName || b.user?.name || 'Studio',
        location: [b.city, b.state, b.country].filter(Boolean)[0] || 'Nigeria',
        image: b.logoUrl || undefined,
        categories: [b.industry || b.businessCategory || 'Creative Studio'],
        isVerified: b.isVerified,
        aspect: aspectFor(b._id),
        subline: b.industry || b.businessCategory || '',
      }));
      const combined = [...real];
      let i = 0;
      while (combined.length < 24) {
        const name = [
          'Slate Studio', 'Omu Photography', 'Gidi Visuals', 'Altitude Agency',
          'Bloom Creative', 'Kaduna Lens', 'Heritage Models', 'Vector Media',
        ][i % 8];
        const city = FILLER_CITIES[i % FILLER_CITIES.length];
        if (matches(name, city, ['Studio'])) {
          combined.push({
            key: `filler-b-${i}`,
            kind: 'business',
            _id: `filler-b-${i}`,
            name,
            location: city,
            image: fallbackFor(`biz-${i}`, i),
            categories: ['Creative Studio'],
            isVerified: i % 3 === 0,
            aspect: aspectFor(`filler-b-${i}`),
            subline: filter === 'Photographers' ? 'Photography' : 'Agency',
          });
        }
        i++;
      }
      return combined;
    }

    if (isCastingFilter) {
      const real: FeedItem[] = (castingsQuery ?? []).map((j: any, i: number) => ({
        key: j._id,
        kind: 'casting' as const,
        _id: j._id,
        name: j.title || 'Casting',
        location: j.location || 'Nigeria',
        categories: [j.category || 'Casting'],
        aspect: aspectFor(j._id),
        subline: j.budget || j.date || '',
      }));
      const combined = [...real];
      let i = 0;
      while (combined.length < 12) {
        const title = [
          'Editorial Campaign', 'Runway — Lagos Fashion Week', 'Beauty Lookbook',
          'Bridal Collection Shoot', 'Commercial TV Spot', 'Fitness Brand Campaign',
        ][i % 6];
        const city = FILLER_CITIES[i % FILLER_CITIES.length];
        if (matches(title, city, [STYLES[i % STYLES.length]])) {
          combined.push({
            key: `filler-c-${i}`,
            kind: 'casting',
            _id: `filler-c-${i}`,
            name: title,
            location: city,
            image: fallbackFor(`cast-${i}`, i),
            categories: [STYLES[i % STYLES.length]],
            aspect: aspectFor(`filler-c-${i}`),
          });
        }
        i++;
      }
      return combined;
    }

    const real: FeedItem[] = (modelsQuery?.models ?? []).map((m: any, i: number) => ({
      key: m._id,
      kind: 'model' as const,
      _id: m._id,
      name: m.displayName || m.user?.name || 'Model',
      location: [m.city, m.state, m.country].filter(Boolean)[0] || 'Nigeria',
      image: m.imageUrl || fallbackFor(m._id, i),
      categories: m.categories?.length ? m.categories : ['Editorial'],
      isVerified: m.isVerified,
      isAvailable: m.isAvailable,
      rating: m.rating,
      aspect: aspectFor(m._id),
    }));
    const combined = [...real];
    let i = 0;
    while (combined.length < 36) {
      const name = FILLER_NAMES[i % FILLER_NAMES.length];
      const city = FILLER_CITIES[i % FILLER_CITIES.length];
      const style = categoryArg ? filter : STYLES[i % STYLES.length];
      if (matches(name, city, [style])) {
        combined.push({
          key: `filler-${i}`,
          kind: 'model',
          _id: `filler-${i}`,
          name,
          location: city,
          image: fallbackFor(name + i, i),
          categories: [style],
          isVerified: i % 3 === 0,
          isAvailable: i % 2 === 0,
          aspect: aspectFor(`filler-${i}`),
        });
      }
      i++;
    }

    const contentItems: FeedItem[] = [];
    for (const c of contentQuery ?? []) {
      if (categoryArg && c.category !== categoryArg) continue;
      if (genderArg && (c.gender || '').toLowerCase() !== genderArg.toLowerCase()) continue;
      if (!matches(c.modelName || '', c.city || '', [c.category || ''])) continue;
      contentItems.push({
        key: c._id,
        kind: 'content' as const,
        _id: c.modelProfileId,
        name: c.modelName || 'Model',
        location: [c.city, c.state, c.country].filter(Boolean)[0] || 'Nigeria',
        image: c.imageUrl,
        categories: [c.category || 'shoot'],
        isVerified: c.isVerified,
        isAvailable: c.isAvailable,
        aspect: aspectFor(c._id),
        subline: c.category,
        mediaType: c.type === 'video' ? 'video' : 'image',
      });
    }
    if (!categoryArg || SHOOT_CATEGORIES.includes(categoryArg)) {
      let ci = 0;
      while (contentItems.length < 12) {
        const cat = categoryArg || SHOOT_CATEGORIES[ci % SHOOT_CATEGORIES.length];
        const name = FILLER_NAMES[ci % FILLER_NAMES.length];
        const city = FILLER_CITIES[ci % FILLER_CITIES.length];
        if (matches(name, city, [cat])) {
          contentItems.push({
            key: `filler-content-${ci}`,
            kind: 'content',
            _id: `filler-content-${ci}`,
            name,
            location: city,
            image: fallbackFor(`shoot-${ci}`, ci),
            categories: [cat],
            isVerified: ci % 3 === 0,
            isAvailable: ci % 2 === 0,
            aspect: aspectFor(`shoot-${ci}`),
            subline: cat,
            mediaType: ci % 5 === 0 ? 'video' : 'image',
          });
        }
        ci++;
      }
    }

    const interleave = (models: FeedItem[], content: FeedItem[], every = 5): FeedItem[] => {
      if (!content.length) return models;
      const out: FeedItem[] = [];
      let cIdx = 0;
      for (let mIdx = 0; mIdx < models.length; mIdx++) {
        out.push(models[mIdx]);
        if ((mIdx + 1) % every === 0 && cIdx < content.length) {
          out.push(content[cIdx++]);
        }
      }
      while (cIdx < content.length) out.push(content[cIdx++]);
      return out;
    };

    return interleave(combined, contentItems, 5);
  }, [modelsQuery, businessesQuery, castingsQuery, contentQuery, filter, query, categoryArg, isBusinessFilter, isCastingFilter]);

  const visibleItems = items.slice(0, visibleCount);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((c) => Math.min(c + 12, items.length));
        }
      },
      { rootMargin: '600px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [items.length]);

  const isLoading = modelsQuery === undefined || businessesQuery === undefined || castingsQuery === undefined || categoriesQuery === undefined || contentQuery === undefined;

  const toggleSave = (item: FeedItem) => {
    if (item.kind !== 'model' || item._id.startsWith('filler-')) {
      toast('Shortlist is available for real profiles', 'info');
      return;
    }
    setSaved((prev) => {
      const next = new Set(prev);
      if (next.has(item._id)) {
        next.delete(item._id);
        toast('Removed from shortlist', 'info');
      } else {
        next.add(item._id);
        toast('Saved to shortlist', 'success');
      }
      return next;
    });
  };

  const openProfile = (item: FeedItem) => {
    if (item._id.startsWith('filler-')) {
      toast('Profile preview coming soon', 'info');
      return;
    }
    navigate(`/profile/${item._id}`);
  };

  const openCastings = (item: FeedItem) => {
    if (item._id.startsWith('filler-')) {
      toast('Casting details coming soon', 'info');
      return;
    }
    navigate(`/models?q=${encodeURIComponent(item.name)}`);
  };

  return (
    <div className="bg-[#F8F7F4] min-h-screen text-[#111111] overflow-x-hidden pt-[56px]">
      {/* Category / filter bar — in normal flow, directly under the header */}
      <div className="mt-6 py-3 mb-5">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-8">
          <div className="flex items-center gap-4">
            <div className="flex-1 min-w-0 overflow-x-auto scrollbar-hide flex items-center gap-4">
              {filters.map((fl) => (
                <button
                  key={fl}
                  onClick={() => onFilter(fl)}
                  className={cn(
                    'shrink-0 text-sm transition-colors duration-200 whitespace-nowrap',
                    filter === fl
                      ? 'text-[#111111] font-semibold'
                      : 'text-gray-500 hover:text-[#111111]'
                  )}
                >
                  {fl}
                </button>
              ))}
            </div>
            <div className="hidden sm:flex items-center shrink-0 w-56">
              <div className="flex-1 flex items-center gap-2 bg-gray-50 border border-gray-200/80 rounded-full px-4 h-10 focus-within:bg-white focus-within:border-[#D4AF37] transition-colors">
                <Search className="w-4 h-4 text-gray-400 shrink-0" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => onSearch(e.target.value)}
                  placeholder="Search talent..."
                  className="flex-1 bg-transparent text-sm placeholder:text-gray-400 outline-none min-w-0"
                />
                {query && (
                  <button onClick={clearSearch} className="text-gray-400 hover:text-gray-600 shrink-0">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
          {/* Mobile search row */}
          <div className="sm:hidden mt-2.5 flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 bg-gray-50 border border-gray-200/80 rounded-full px-4 h-10 focus-within:bg-white focus-within:border-[#D4AF37] transition-colors">
              <Search className="w-4 h-4 text-gray-400 shrink-0" />
              <input
                value={query}
                onChange={(e) => onSearch(e.target.value)}
                placeholder="Search talent..."
                className="flex-1 bg-transparent text-sm placeholder:text-gray-400 outline-none min-w-0"
              />
              {query && (
                <button onClick={clearSearch} className="text-gray-400 hover:text-gray-600 shrink-0">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <kbd className="shrink-0 px-2 py-1 rounded-md bg-white border border-gray-200 text-[10px] font-semibold text-gray-500">/</kbd>
          </div>
        </div>
      </div>

      <main className="max-w-[1600px] mx-auto px-4 sm:px-8 pb-20">
        {isLoading ? (
          <div className="flex items-center justify-center py-32">
            <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : visibleItems.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-2xl font-serif italic text-gray-400">No matches found.</p>
            <button
              onClick={() => onSearch('')}
              className="mt-4 text-sm text-[#D4AF37] font-semibold uppercase tracking-widest"
            >
              Clear search
            </button>
          </div>
        ) : (
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-6">
            {visibleItems.map((item, i) =>
              item.kind === 'casting' ? (
                <CastingCard key={item.key} item={item} index={i} onOpen={() => openCastings(item)} />
              ) : item.kind === 'content' ? (
                <ContentCard key={item.key} item={item} index={i} onOpen={() => openProfile(item)} />
              ) : (
                <PortfolioCard
                  key={item.key}
                  item={item}
                  index={i}
                  isSaved={saved.has(item._id)}
                  onSave={() => toggleSave(item)}
                  onOpen={() => openProfile(item)}
                  canInvite={convexUser?.role === 'business'}
                  onInvite={() => toast('Invitation flow coming soon', 'info')}
                />
              )
            )}
          </div>
        )}

        {/* Infinite scroll sentinel */}
        <div ref={sentinelRef} className="h-2" />
        {!isLoading && visibleCount < items.length && (
          <div className="flex justify-center py-10">
            <div className="w-6 h-6 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </main>
    </div>
  );
};

const PortfolioCard = ({
  item,
  index,
  isSaved,
  onSave,
  onOpen,
  onInvite,
  canInvite,
}: {
  item: FeedItem;
  index: number;
  isSaved: boolean;
  onSave: () => void;
  onOpen: () => void;
  onInvite: () => void;
  canInvite: boolean;
}) => {
  const isBusiness = item.kind === 'business';
  const role = isBusiness
    ? item.subline || 'Creative Studio'
    : item.categories[0] || 'Model';
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: (index % 4) * 0.05 }}
      className="group relative w-full break-inside-avoid mb-6"
    >
      <div
        className={cn(
          'relative w-full overflow-hidden rounded-3xl bg-[#E8E6E0] cursor-pointer active:scale-[0.99]',
          'shadow-[0_1px_2px_rgba(17,17,17,0.04),0_8px_24px_-12px_rgba(17,17,17,0.1)]',
          'hover:shadow-[0_24px_48px_-16px_rgba(17,17,17,0.28)] transition-[box-shadow,transform] duration-300',
          item.aspect
        )}
        onClick={onOpen}
      >
        <img
          src={item.image || fallbackFor(item._id, index)}
          alt={item.name}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-[220ms] ease-out group-hover:scale-[1.02] brightness-[0.97] contrast-[1.03] saturate-[0.95]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-70 transition-opacity duration-[220ms] group-hover:opacity-100" />

        {/* Availability */}
        {item.kind === 'model' && item.isAvailable && (
          <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 text-[13px] font-medium text-[#111111] shadow-[0_2px_8px_rgba(0,0,0,0.15)]">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Available
          </span>
        )}

        {/* Quick actions on hover */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-[220ms]">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSave();
            }}
            className={cn(
              'w-9 h-9 rounded-full flex items-center justify-center backdrop-blur transition-colors shadow-[0_2px_8px_rgba(0,0,0,0.15)]',
              isSaved ? 'bg-[#D4AF37] text-white' : 'bg-white/95 text-[#111111] hover:bg-white'
            )}
            aria-label="Save"
          >
            <Bookmark className={cn('w-4 h-4', isSaved && 'fill-current')} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpen();
            }}
            className="w-9 h-9 rounded-full bg-white/95 text-[#111111] flex items-center justify-center backdrop-blur hover:bg-white transition-colors shadow-[0_2px_8px_rgba(0,0,0,0.15)]"
            aria-label="View profile"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
          {canInvite && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onInvite();
              }}
              className="w-9 h-9 rounded-full bg-white/95 text-[#111111] flex items-center justify-center backdrop-blur hover:bg-white transition-colors shadow-[0_2px_8px_rgba(0,0,0,0.15)]"
              aria-label="Invite"
            >
              <Send className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Name + role + location */}
        <div className="absolute bottom-0 left-0 right-0 p-4 text-left">
          <div className="flex items-center gap-1.5">
            <p className="text-white text-[15px] font-semibold leading-tight tracking-tight drop-shadow">
              {item.name}
            </p>
            {item.isVerified && <BadgeCheck className="w-4 h-4 text-[#D4AF37] shrink-0 drop-shadow" />}
          </div>
          <p className="text-white/85 text-[11px] font-medium mt-1 flex items-center gap-1">
            <span className="uppercase tracking-[0.12em]">{role}</span>
            <span className="opacity-50">•</span>
            <span>{item.location}</span>
          </p>
        </div>
      </div>
    </motion.div>
  );
};

const CastingCard = ({ item, index, onOpen }: { item: FeedItem; index: number; onOpen: () => void }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: (index % 4) * 0.05 }}
      className="group relative w-full break-inside-avoid mb-6"
    >
      <div
        className={cn(
          'relative w-full overflow-hidden rounded-3xl bg-white cursor-pointer active:scale-[0.99]',
          'shadow-[0_1px_2px_rgba(17,17,17,0.04),0_8px_24px_-12px_rgba(17,17,17,0.1)]',
          'hover:shadow-[0_24px_48px_-16px_rgba(17,17,17,0.28)] transition-[box-shadow,transform] duration-300',
          item.aspect
        )}
        onClick={onOpen}
      >
        {item.image && (
          <img
            src={item.image}
            alt={item.name}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-[220ms] ease-out group-hover:scale-[1.02] brightness-[0.97] contrast-[1.03] saturate-[0.95]"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent opacity-80 transition-opacity duration-[220ms] group-hover:opacity-100" />
        <div className="absolute inset-0 p-5 flex flex-col justify-end text-left">
          <span className="inline-flex items-center gap-1.5 self-start px-3 py-1 rounded-full bg-white/95 text-[13px] font-medium text-[#111111] shadow-[0_2px_8px_rgba(0,0,0,0.15)]">
            <Briefcase className="w-3.5 h-3.5 text-[#D4AF37]" /> {item.categories[0] || 'Casting'}
          </span>
          <h3 className="mt-3 text-white font-serif text-2xl italic leading-tight drop-shadow">
            {item.name}
          </h3>
          <p className="mt-1.5 text-white/85 text-[11px] font-medium flex items-center gap-1.5">
            <MapPin className="w-3 h-3 opacity-70" /> {item.location}
            {item.subline && (
              <span className="ml-1 px-2 py-0.5 rounded-md bg-[#D4AF37] text-[#111111] font-semibold text-[11px]">
                {item.subline}
              </span>
            )}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

const ContentCard = ({ item, index, onOpen }: { item: FeedItem; index: number; onOpen: () => void }) => {
  const category = item.subline || item.categories[0] || 'Shoot';
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: (index % 4) * 0.05 }}
      className="group relative w-full break-inside-avoid mb-6"
    >
      <div
        className={cn(
          'relative w-full overflow-hidden rounded-3xl bg-[#E8E6E0] cursor-pointer active:scale-[0.99]',
          'shadow-[0_1px_2px_rgba(17,17,17,0.04),0_8px_24px_-12px_rgba(17,17,17,0.1)]',
          'hover:shadow-[0_24px_48px_-16px_rgba(17,17,17,0.28)] transition-[box-shadow,transform] duration-300',
          item.aspect
        )}
        onClick={onOpen}
      >
        <img
          src={item.image || fallbackFor(item._id, index)}
          alt={item.name}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-[220ms] ease-out group-hover:scale-[1.02] brightness-[0.97] contrast-[1.03] saturate-[0.95]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-70 transition-opacity duration-[220ms] group-hover:opacity-90" />

        {item.mediaType === 'video' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-[0_4px_16px_rgba(0,0,0,0.25)] transition-transform duration-[220ms] group-hover:scale-110">
              <Play className="w-5 h-5 text-[#111111] fill-current ml-0.5" />
            </span>
          </div>
        )}

        {/* Shoot category badge */}
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#D4AF37] text-[#111111] text-[11px] font-bold uppercase tracking-wider shadow-[0_2px_8px_rgba(0,0,0,0.15)]">
            <Camera className="w-3.5 h-3.5" />
            {capitalize(category)}
          </span>
        </div>

        {/* Model name */}
        <div className="absolute bottom-0 left-0 right-0 p-4 text-left">
          <div className="flex items-center gap-1.5">
            <p className="text-white text-[15px] font-semibold leading-tight tracking-tight drop-shadow">
              {item.name}
            </p>
            {item.isVerified && <BadgeCheck className="w-4 h-4 text-[#D4AF37] shrink-0 drop-shadow" />}
          </div>
          <p className="text-white/85 text-[11px] font-medium mt-1 uppercase tracking-[0.12em]">{item.location}</p>
        </div>
      </div>
    </motion.div>
  );
};
