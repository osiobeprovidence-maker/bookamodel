import { query } from "./_generated/server";
import { v } from "convex/values";

async function toSearchModel(ctx: any, profile: any) {
  const user = await ctx.db.get(profile.userId);
  let imageUrl = profile.imageUrl;
  if (!imageUrl && profile.profilePhotoStorageId) {
    imageUrl = (await ctx.storage.getUrl(profile.profilePhotoStorageId)) ?? null;
  }
  return {
    _id: profile._id,
    userId: profile.userId,
    displayName: profile.displayName,
    imageUrl: imageUrl || undefined,
    city: profile.city,
    state: profile.state,
    country: profile.country,
    categories: profile.categories || [],
    isVerified: profile.isVerified,
    isAvailable: profile.isAvailable,
    rating: profile.rating,
    user: user ? { name: user.name } : null,
  };
}

async function toSearchBusiness(ctx: any, profile: any) {
  const user = await ctx.db.get(profile.userId);
  let logoUrl = profile.logoUrl;
  if (!logoUrl && profile.logoStorageId) {
    logoUrl = (await ctx.storage.getUrl(profile.logoStorageId)) ?? null;
  }
  return {
    _id: profile._id,
    userId: profile.userId,
    companyName: profile.companyName,
    businessCategory: profile.businessCategory,
    industry: profile.industry,
    description: profile.description,
    city: profile.city,
    state: profile.state,
    country: profile.country,
    logoUrl: logoUrl || undefined,
    isVerified: profile.isVerified,
    user: user ? { name: user.name } : null,
  };
}

export const searchAll = query({
  args: {
    searchText: v.optional(v.string()),
    type: v.optional(
      v.union(
        v.literal("all"),
        v.literal("models"),
        v.literal("businesses"),
        v.literal("categories"),
        v.literal("locations")
      )
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const q = (args.searchText || "").trim().toLowerCase();
    const type = args.type || "all";
    const limit = args.limit ?? 12;

    const results: {
      models: any[];
      businesses: any[];
      categories: any[];
      locations: string[];
    } = {
      models: [],
      businesses: [],
      categories: [],
      locations: [],
    };

    if (type === "all" || type === "models") {
      let profiles = await ctx.db.query("modelProfiles").collect();
      profiles = profiles.filter(
        (p) =>
          p.profileCompleted &&
          p.profileVisibility !== "hidden" &&
          p.profileVisibility !== "private" &&
          p.discoverable !== false
      );
      if (q) {
        profiles = profiles.filter((p) => {
          const displayName = p.displayName?.toLowerCase() || "";
          const city = p.city?.toLowerCase() || "";
          const state = p.state?.toLowerCase() || "";
          const categories = (p.categories || []).join(" ").toLowerCase();
          const tags = (p.tags || []).join(" ").toLowerCase();
          return (
            displayName.includes(q) ||
            city.includes(q) ||
            state.includes(q) ||
            categories.includes(q) ||
            tags.includes(q)
          );
        });
      }
      profiles.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      results.models = await Promise.all(
        profiles.slice(0, limit).map((p) => toSearchModel(ctx, p))
      );
    }

    if (type === "all" || type === "businesses") {
      let profiles = await ctx.db.query("businessProfiles").collect();
      profiles = profiles.filter((p) => p.profileCompleted);
      if (q) {
        profiles = profiles.filter((p) => {
          const company = p.companyName?.toLowerCase() || "";
          const category = p.businessCategory?.toLowerCase() || "";
          const industry = p.industry?.toLowerCase() || "";
          const city = p.city?.toLowerCase() || "";
          const state = p.state?.toLowerCase() || "";
          const description = p.description?.toLowerCase() || "";
          return (
            company.includes(q) ||
            category.includes(q) ||
            industry.includes(q) ||
            city.includes(q) ||
            state.includes(q) ||
            description.includes(q)
          );
        });
      }
      results.businesses = await Promise.all(
        profiles.slice(0, limit).map((p) => toSearchBusiness(ctx, p))
      );
    }

    if (type === "all" || type === "categories") {
      let cats = await ctx.db
        .query("categories")
        .withIndex("by_status", (qq) => qq.eq("status", "active"))
        .collect();
      if (q) {
        cats = cats.filter((c) => {
          const name = c.name?.toLowerCase() || "";
          const description = c.description?.toLowerCase() || "";
          return name.includes(q) || description.includes(q);
        });
      }
      cats.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      results.categories = cats.slice(0, limit).map((c) => ({
        _id: c._id,
        name: c.name,
        slug: c.slug,
        description: c.description || "",
        count: c.count ?? 0,
        imageUrl: c.imageUrl || null,
      }));
    }

    if (type === "all" || type === "locations") {
      const [modelProfiles, businessProfiles] = await Promise.all([
        ctx.db.query("modelProfiles").collect(),
        ctx.db.query("businessProfiles").collect(),
      ]);
      const seen = new Set<string>();
      for (const p of modelProfiles) {
        for (const loc of [p.city, p.state]) {
          if (loc && loc.trim().length > 1) seen.add(loc.trim());
        }
      }
      for (const p of businessProfiles) {
        for (const loc of [p.city, p.state]) {
          if (loc && loc.trim().length > 1) seen.add(loc.trim());
        }
      }
      let locations = [...seen].sort();
      if (q) {
        locations = locations.filter((loc) => loc.toLowerCase().includes(q));
      }
      results.locations = locations.slice(0, limit);
    }

    return results;
  },
});
