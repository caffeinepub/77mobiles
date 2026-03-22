import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link, useSearch } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  PlusCircle,
  Sparkles,
  Truck,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import GeoFilterBar from "../components/GeoFilterBar";
import ListingCard, { ListingCardSkeleton } from "../components/ListingCard";
import { DEMO_LISTINGS, type DemoListing } from "../data/demoListings";
import { ListingCategory, useListings } from "../hooks/useQueries";
import type { Listing } from "../hooks/useQueries";
import { haversine, parseGeoLocation } from "../utils/geo";

const CATEGORIES = [
  { id: "all", label: "All", icon: "🗂️", emoji: "🗂️" },
  { id: ListingCategory.phones, label: "Phones", icon: "📱", emoji: "📱" },
  { id: ListingCategory.macbooks, label: "MacBooks", icon: "💻", emoji: "💻" },
  { id: ListingCategory.watches, label: "Watches", icon: "⌚", emoji: "⌚" },
  {
    id: ListingCategory.earphones,
    label: "Earphones",
    icon: "🎧",
    emoji: "🎧",
  },
] as const;

type CategoryId = (typeof CATEGORIES)[number]["id"];

interface GeoFilter {
  lat: number;
  lon: number;
  radiusKm: number;
}

function SellTo77Section() {
  const badges = [
    { icon: Zap, label: "Instant Payment" },
    { icon: Truck, label: "Free Pickup" },
    { icon: BadgeCheck, label: "Best Price" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55 }}
      className="relative rounded-3xl overflow-hidden mb-6 bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 shadow-xl shadow-indigo-300 p-5 sm:p-6 text-center"
      data-ocid="sell77.panel"
    >
      {/* Decorative blobs */}
      <div className="absolute -top-16 -right-16 h-36 w-36 rounded-full bg-white/20 blur-3xl" />
      <div className="absolute -bottom-12 -left-12 h-28 w-28 rounded-full bg-violet-300/30 blur-3xl" />

      <div className="relative">
        {/* Badge */}
        <span className="inline-flex items-center gap-1.5 bg-white/25 text-white text-[11px] font-semibold px-4 py-1.5 rounded-full mb-3">
          <Sparkles className="h-3 w-3" /> Instant Buy-Back
        </span>

        <h2 className="font-display font-bold text-xl sm:text-2xl text-white leading-tight mb-2">
          Sell Your Device to <span className="text-indigo-200">77mobiles</span>
          <br />
          in 30 Mins
        </h2>
        <p className="text-white/90 text-sm mb-4">
          Get an instant price offer — no haggling, no waiting
        </p>

        <Link to="/instant-buy">
          <Button
            type="button"
            size="sm"
            className="bg-white text-indigo-700 hover:bg-indigo-50 font-bold rounded-2xl px-6 shadow-lg gap-2"
            data-ocid="sell77.primary_button"
          >
            <Sparkles className="h-4 w-4" />
            Sell Now
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>

        <div className="flex flex-wrap justify-center gap-3 mt-4">
          {badges.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 bg-white/25 backdrop-blur-sm rounded-full px-3 py-1.5 text-xs font-medium text-white"
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default function HomePage() {
  const searchParams = useSearch({ strict: false }) as { q?: string };
  const [category, setCategory] = useState<CategoryId>("all");
  const [searchQuery, setSearchQuery] = useState(searchParams.q ?? "");
  const [geoFilter, setGeoFilter] = useState<GeoFilter | null>(null);

  useEffect(() => {
    setSearchQuery(searchParams.q ?? "");
  }, [searchParams.q]);

  const {
    data: listings,
    isLoading,
    isError,
  } = useListings(searchQuery ? "all" : (category as any), searchQuery);

  const handleGeoFilterChange = useCallback((filter: GeoFilter | null) => {
    setGeoFilter(filter);
  }, []);

  const filteredListings = useMemo(() => {
    if (!listings) return listings;
    if (!geoFilter) return listings;
    return listings.filter((listing) => {
      const parsed = parseGeoLocation(listing.location);
      if (parsed) {
        return (
          haversine(geoFilter.lat, geoFilter.lon, parsed.lat, parsed.lon) <=
          geoFilter.radiusKm
        );
      }
      return true;
    });
  }, [listings, geoFilter]);

  const filteredDemos = useMemo(() => {
    let demos: DemoListing[] = DEMO_LISTINGS;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      demos = demos.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          d.description.toLowerCase().includes(q),
      );
    } else if (category !== "all") {
      demos = demos.filter((d) => d.category === (category as string));
    }
    if (geoFilter) {
      demos = demos.filter((d) => {
        const parsed = parseGeoLocation(d.location);
        if (parsed) {
          return (
            haversine(geoFilter.lat, geoFilter.lon, parsed.lat, parsed.lon) <=
            geoFilter.radiusKm
          );
        }
        return true;
      });
    }
    return demos;
  }, [category, searchQuery, geoFilter]);

  const displayListings = filteredListings;
  const geoFilteredCount =
    geoFilter && listings && filteredListings
      ? listings.length - filteredListings.length
      : 0;

  const allItems = useMemo(
    () => [...(displayListings ?? []), ...filteredDemos],
    [displayListings, filteredDemos],
  );
  const hasItems = !isLoading && allItems.length > 0;

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Sell to 77mobiles Banner */}
      <SellTo77Section />

      {/* Hero Bento Card */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="relative rounded-3xl overflow-hidden mb-6 bg-gradient-to-br from-[oklch(0.92_0.04_220)] via-[oklch(0.95_0.02_240)] to-[oklch(0.96_0.015_258)] p-5 border border-primary/20 shadow-sm"
      >
        {/* Decorative soft circles */}
        <div className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-32 w-32 rounded-full bg-primary/5 blur-2xl" />

        {/* Subtle ring in corner */}
        <div className="absolute top-4 right-4 h-16 w-16 rounded-full border-2 border-primary/20 opacity-60" />
        <div className="absolute top-6 right-6 h-8 w-8 rounded-full border border-primary/30" />

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div>
            <p className="text-primary/70 text-xs font-medium uppercase tracking-widest mb-2 font-mono">
              India's Premier Gadget Marketplace
            </p>
            <h1 className="font-display font-bold text-2xl sm:text-3xl mb-2 leading-tight text-foreground">
              Buy &amp; Sell <span className="text-primary">Gadgets</span>{" "}
              Locally
            </h1>
            <p className="text-muted-foreground text-sm max-w-sm">
              100% free listings · Phones · MacBooks · Watches · Earphones
            </p>
          </div>
          <Link to="/post" className="shrink-0">
            <Button
              size="lg"
              className="gap-2 font-semibold bg-primary text-primary-foreground hover:opacity-90 rounded-2xl transition-all duration-300"
              data-ocid="home.primary_button"
            >
              <PlusCircle className="h-5 w-5" />
              Post Free Ad
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Category Bento Tiles */}
      {!searchQuery && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex gap-3 overflow-x-auto pb-1 mb-5 scrollbar-hide"
          data-ocid="home.tab"
        >
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategory(cat.id as CategoryId)}
              data-ocid={`home.${cat.id}.tab`}
              className={`flex flex-col items-center gap-1.5 px-4 py-2.5 rounded-2xl border transition-all duration-200 shrink-0 min-w-[70px] ${
                category === cat.id
                  ? "bg-primary/10 border-primary/50 text-primary scale-105 shadow-sm"
                  : "bg-card border-border hover:border-primary/30 text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="text-xl">{cat.emoji}</span>
              <span className="text-xs font-medium">{cat.label}</span>
            </button>
          ))}
        </motion.div>
      )}

      {/* Geo Filter Bar */}
      <GeoFilterBar onFilterChange={handleGeoFilterChange} />

      {/* Search results header */}
      {searchQuery && (
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Search results for{" "}
            <span className="font-medium text-foreground">
              &ldquo;{searchQuery}&rdquo;
            </span>
            {!isLoading && ` — ${allItems.length} found`}
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSearchQuery("")}
            className="text-xs hover:text-primary"
          >
            Clear
          </Button>
        </div>
      )}

      {/* Geo filter count notice */}
      {geoFilter && !searchQuery && listings && (
        <p className="text-xs text-muted-foreground mb-3">
          Showing{" "}
          <span className="font-medium text-foreground">{allItems.length}</span>{" "}
          listings within{" "}
          <span className="font-medium text-foreground">
            {geoFilter.radiusKm} km
          </span>
          {geoFilteredCount > 0 && (
            <span> · {geoFilteredCount} hidden outside range</span>
          )}
        </p>
      )}

      {/* Error */}
      {isError && (
        <Alert
          variant="destructive"
          className="mb-4"
          data-ocid="home.error_state"
        >
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load listings. Please refresh.
          </AlertDescription>
        </Alert>
      )}

      {/* Listings Bento Grid */}
      {isLoading ? (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          data-ocid="home.loading_state"
        >
          {[..."12345678"].map((c) => (
            <ListingCardSkeleton key={c} />
          ))}
        </div>
      ) : hasItems ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-auto">
          {allItems.map((item, i) => {
            const isDemo = "isDemo" in item && item.isDemo;
            return (
              <div
                key={item.id}
                className={`relative ${
                  i === 0 ? "sm:col-span-2 sm:row-span-2" : ""
                }`}
              >
                <ListingCard
                  listing={item as unknown as Listing}
                  index={i}
                  featured={i === 0}
                />
                {isDemo && (
                  <Badge className="absolute top-4 left-4 z-10 bg-amber-500/90 text-white text-[10px] font-semibold pointer-events-none">
                    Demo
                  </Badge>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-24 text-center"
          data-ocid="home.empty_state"
        >
          <span className="text-6xl mb-4">{geoFilter ? "📍" : "📭"}</span>
          <h3 className="font-display font-semibold text-lg mb-1">
            {geoFilter ? "No listings nearby" : "No listings yet"}
          </h3>
          <p className="text-muted-foreground text-sm mb-6 max-w-xs">
            {searchQuery
              ? `No results for "${searchQuery}". Try a different search.`
              : geoFilter
                ? `No listings found within ${geoFilter.radiusKm} km. Try expanding the radius.`
                : "Be the first to post a gadget for sale in this category."}
          </p>
          <Link to="/post">
            <Button
              className="gap-1.5 rounded-2xl transition-all"
              data-ocid="home.secondary_button"
            >
              <PlusCircle className="h-4 w-4" />
              Post First Ad
            </Button>
          </Link>
        </motion.div>
      )}
    </div>
  );
}
