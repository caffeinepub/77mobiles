import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link, useSearch } from "@tanstack/react-router";
import { AlertCircle, PlusCircle } from "lucide-react";
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

  // Filter demo listings by category, search, and geo
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
      {/* Hero Bento Card */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative rounded-3xl overflow-hidden mb-6 bg-gradient-to-br from-primary via-primary to-primary/80 p-7 text-primary-foreground shadow-bento"
      >
        {/* Decorative circles (iOS widget aesthetic) */}
        <div className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute bottom-0 left-1/3 h-32 w-32 rounded-full bg-white/5 blur-xl" />

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div>
            <p className="text-primary-foreground/70 text-xs font-medium uppercase tracking-widest mb-2">
              India's Premier Gadget Marketplace
            </p>
            <h1 className="font-display font-bold text-3xl sm:text-4xl mb-2 leading-tight">
              Buy &amp; Sell Gadgets Locally
            </h1>
            <p className="text-primary-foreground/75 text-sm max-w-sm">
              100% free listings · Phones · MacBooks · Watches · Earphones
            </p>
          </div>
          <Link to="/post" className="shrink-0">
            <Button
              size="lg"
              className="gap-2 font-semibold bg-white text-primary hover:bg-white/90 rounded-2xl shadow-md"
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
              className={`flex flex-col items-center gap-1.5 px-5 py-3.5 rounded-2xl border transition-all duration-200 shrink-0 min-w-[80px] ${
                category === cat.id
                  ? "bg-primary text-primary-foreground border-primary shadow-md scale-105"
                  : "bg-card border-border hover:border-primary/40 hover:bg-muted text-foreground"
              }`}
            >
              <span className="text-2xl">{cat.emoji}</span>
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
            className="text-xs"
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
              className="gap-1.5 rounded-2xl"
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
