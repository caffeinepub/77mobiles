import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Link, useSearch } from "@tanstack/react-router";
import {
  AlertCircle,
  MapPin,
  PlusCircle,
  Search,
  Truck,
  X,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import FiltersBar from "../components/FiltersBar";
import ListingCard, { ListingCardSkeleton } from "../components/ListingCard";
import PromoBannerCarousel from "../components/PromoBannerCarousel";
import { ListingCategory, useListings } from "../hooks/useQueries";
import type { Listing } from "../hooks/useQueries";
import { haversine, parseGeoLocation } from "../utils/geo";

// SVG icons matching the line-art style of Phones/Watches
function GridIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-label="All categories"
      role="img"
    >
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

const CATEGORIES = [
  { id: "all", label: "All", useGridIcon: true },
  { id: ListingCategory.phones, label: "Phones", emoji: "📱" },
  { id: ListingCategory.macbooks, label: "MacBooks", emoji: "💻" },
  { id: ListingCategory.watches, label: "Watches", emoji: "⌚" },
  { id: ListingCategory.earphones, label: "Earphones", emoji: "🎧" },
] as const;

type CategoryId = (typeof CATEGORIES)[number]["id"];

interface GeoFilter {
  lat: number;
  lon: number;
  radiusKm: number;
}

// ── Sell Instant Banner (white + blue) ────────────────────────────────────────
function SellInstantBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative rounded-2xl overflow-hidden mb-3 bg-white border border-blue-100 shadow-sm px-4 py-3"
      data-ocid="sell77.panel"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-bold text-sm sm:text-base leading-tight text-gray-900">
            Check Your <span className="text-blue-600">Phone's Value</span>
          </h2>
          <p className="text-gray-500 text-xs mt-0.5">
            Get the best price for your device
          </p>
          <div className="flex items-center gap-3 mt-1.5">
            {[
              { icon: Zap, label: "Instant Payment" },
              { icon: Truck, label: "Free Pickup" },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-1 text-[10px] font-medium text-gray-400"
              >
                <Icon className="h-3 w-3 text-blue-500" />
                {label}
              </div>
            ))}
          </div>
        </div>
        <Link to="/instant-buy" className="shrink-0">
          <Button
            type="button"
            size="sm"
            className="bg-blue-600 text-white hover:bg-blue-700 font-bold rounded-xl px-5 text-xs h-9 border-0 shadow-sm"
            data-ocid="sell77.primary_button"
          >
            Check Price
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}

export default function HomePage() {
  const searchParams = useSearch({ strict: false }) as { q?: string };
  const [skeletonVisible, setSkeletonVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setSkeletonVisible(false), 1200);
    return () => clearTimeout(t);
  }, []);

  const [category, setCategory] = useState<CategoryId>("all");
  const [searchQuery, setSearchQuery] = useState(searchParams.q ?? "");
  const [inputValue, setInputValue] = useState(searchParams.q ?? "");
  const [geoFilter] = useState<GeoFilter | null>(null);
  const [selectedCity, setSelectedCity] = useState<string>(() => {
    return localStorage.getItem("userLocation") ?? "";
  });

  const [brandFilter, setBrandFilter] = useState<string | null>(null);
  const [conditionFilter, setConditionFilter] = useState<string | null>(null);
  const [budgetFilter, setBudgetFilter] = useState<{
    min: number;
    max: number;
  } | null>(null);
  const [sortOrder, setSortOrder] = useState<
    "newest" | "price_asc" | "price_desc"
  >("newest");

  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSearchQuery(searchParams.q ?? "");
    setInputValue(searchParams.q ?? "");
  }, [searchParams.q]);

  useEffect(() => {
    const handler = () => {
      setSelectedCity(localStorage.getItem("userLocation") ?? "");
    };
    window.addEventListener("locationChanged", handler);
    return () => window.removeEventListener("locationChanged", handler);
  }, []);

  const {
    data: listings,
    isLoading,
    isError,
  } = useListings(searchQuery ? "all" : (category as any), searchQuery);

  const handleGeoFilterChange = useCallback(() => {}, []);
  void handleGeoFilterChange;

  const filteredListings = useMemo(() => {
    if (!listings) return listings;
    let result = listings;
    if (selectedCity) {
      result = result.filter((listing) => {
        if (!listing.location) return true;
        return listing.location
          .toLowerCase()
          .includes(selectedCity.toLowerCase());
      });
    }
    if (geoFilter) {
      result = result.filter((listing) => {
        const parsed = parseGeoLocation(listing.location);
        if (parsed) {
          return (
            haversine(geoFilter.lat, geoFilter.lon, parsed.lat, parsed.lon) <=
            geoFilter.radiusKm
          );
        }
        return true;
      });
    }
    return result;
  }, [listings, geoFilter, selectedCity]);

  const allItems = useMemo(() => {
    let items: Listing[] = [...(filteredListings ?? [])];

    if (brandFilter) {
      const bLower = brandFilter.toLowerCase();
      items = items.filter(
        (item) =>
          item.title.toLowerCase().includes(bLower) ||
          item.description.toLowerCase().includes(bLower),
      );
    }

    if (conditionFilter) {
      items = items.filter((item) => {
        const cond = (item as any).condition;
        if (!cond) return true;
        return cond.toLowerCase().includes(conditionFilter.toLowerCase());
      });
    }

    if (budgetFilter) {
      items = items.filter((item) => {
        const price = Number(String(item.price).replace(/[^0-9.]/g, ""));
        if (Number.isNaN(price)) return true;
        return (
          price >= budgetFilter.min &&
          price <=
            (budgetFilter.max === Number.POSITIVE_INFINITY
              ? Number.MAX_SAFE_INTEGER
              : budgetFilter.max)
        );
      });
    }

    if (sortOrder === "price_asc") {
      items = [...items].sort((a, b) => {
        const pa = Number(String(a.price).replace(/[^0-9.]/g, ""));
        const pb = Number(String(b.price).replace(/[^0-9.]/g, ""));
        return pa - pb;
      });
    } else if (sortOrder === "price_desc") {
      items = [...items].sort((a, b) => {
        const pa = Number(String(a.price).replace(/[^0-9.]/g, ""));
        const pb = Number(String(b.price).replace(/[^0-9.]/g, ""));
        return pb - pa;
      });
    }

    return items;
  }, [filteredListings, brandFilter, conditionFilter, budgetFilter, sortOrder]);

  const hasItems = !isLoading && allItems.length > 0;

  if (skeletonVisible) {
    return (
      <div className="min-h-screen bg-[#f5f5f5]" data-ocid="home.loading_state">
        <div className="bg-white sticky top-0 z-40 px-4 pt-3 pb-3 space-y-3">
          <div className="h-10 bg-gray-200 rounded-xl animate-pulse" />
          <div className="h-8 bg-gray-100 rounded-lg animate-pulse" />
          <div className="flex gap-2 overflow-hidden pb-1">
            {["phones", "macbooks", "watches", "earphones", "all"].map((id) => (
              <div
                key={id}
                className="flex flex-col items-center gap-1 shrink-0"
              >
                <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse" />
                <div className="w-10 h-2.5 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
        <div className="px-4 py-3">
          <div className="h-16 bg-white rounded-2xl border border-gray-100 animate-pulse mb-3" />
          <div className="h-32 bg-white rounded-2xl border border-gray-100 animate-pulse mb-3" />
        </div>
        <div className="bg-white">
          {["card-a", "card-b", "card-c"].map((id) => (
            <div
              key={id}
              className="flex gap-3 px-4 py-3 border-b border-gray-100"
            >
              <div className="w-20 h-20 rounded-xl bg-gray-200 animate-pulse shrink-0" />
              <div className="flex-1 space-y-2 pt-1">
                <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4" />
                <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
                <div className="h-2.5 bg-gray-100 rounded animate-pulse w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* Top section — white bg, sticky */}
      <div className="bg-white sticky top-0 z-40">
        {/* Search Bar */}
        <div className="px-4 pt-3 pb-2">
          <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 h-10">
            <Search className="h-4 w-4 text-gray-400 shrink-0" />
            <input
              ref={searchInputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") setSearchQuery(inputValue);
              }}
              placeholder="Search phones, MacBooks, watches..."
              className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none"
              data-ocid="home.search_input"
            />
            {inputValue && (
              <button
                type="button"
                onClick={() => {
                  setInputValue("");
                  setSearchQuery("");
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Filters Bar — always visible below search */}
        <div className="bg-white border-b border-gray-100 px-0">
          <FiltersBar
            onBrandChange={setBrandFilter}
            onConditionChange={setConditionFilter}
            onBudgetChange={setBudgetFilter}
            onSortChange={setSortOrder}
            selectedBrand={brandFilter}
            selectedCondition={conditionFilter}
            selectedBudget={budgetFilter}
            selectedSort={sortOrder}
          />
        </div>

        {/* Category Tabs */}
        {!searchQuery && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="flex gap-2 overflow-x-auto px-4 pb-3 scrollbar-hide"
            data-ocid="home.tab"
          >
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id as CategoryId)}
                data-ocid={`home.${cat.id}.tab`}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl border transition-all duration-200 shrink-0 min-w-[64px] ${
                  category === cat.id
                    ? "bg-blue-50 border-blue-200 text-blue-700"
                    : "bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}
              >
                {(cat as any).useGridIcon ? (
                  <GridIcon
                    className={`w-5 h-5 ${
                      category === cat.id ? "text-blue-600" : "text-gray-400"
                    }`}
                  />
                ) : (
                  <span className="text-lg">{(cat as any).emoji}</span>
                )}
                <span className="text-[11px] font-medium">{cat.label}</span>
              </button>
            ))}
          </motion.div>
        )}
      </div>

      {/* Sell Instant Banner — below category scroll */}
      <div className="px-4 pb-2 bg-white">
        <SellInstantBanner />
      </div>

      {/* Promo Banner Carousel — edge-to-edge */}
      <div className="bg-white pb-3">
        <PromoBannerCarousel />
      </div>

      {/* Location filter badge */}
      {selectedCity && (
        <div className="flex items-center gap-2 px-4 py-2 bg-white border-b border-gray-100">
          <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-100 rounded-full px-3 py-1 text-xs text-blue-700 font-medium">
            <MapPin className="h-3 w-3" />
            Showing in <span className="font-bold ml-0.5">{selectedCity}</span>
            <button
              type="button"
              onClick={() => setSelectedCity("")}
              className="ml-1 hover:text-blue-900"
              data-ocid="home.toggle"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}

      {/* Search results header */}
      {searchQuery && (
        <div className="px-4 py-2 flex items-center justify-between bg-white border-b border-gray-100">
          <p className="text-sm text-gray-500">
            Results for{" "}
            <span className="font-semibold text-gray-800">
              &ldquo;{searchQuery}&rdquo;
            </span>
            {!isLoading && ` — ${allItems.length} found`}
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setInputValue("");
            }}
            className="text-xs text-blue-600 font-medium"
          >
            Clear
          </button>
        </div>
      )}

      {/* Post Ad CTA row */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-white border-b border-gray-100">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
          {searchQuery
            ? "Search Results"
            : category === "all"
              ? "All Listings"
              : category.charAt(0).toUpperCase() + category.slice(1)}
        </span>
        <Link to="/post">
          <Button
            size="sm"
            className="gap-1.5 font-semibold bg-blue-600 text-white hover:bg-blue-700 rounded-lg h-7 text-xs px-3"
            data-ocid="home.primary_button"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            Post Free Ad
          </Button>
        </Link>
      </div>

      {/* Error */}
      {isError && (
        <Alert
          variant="destructive"
          className="mx-4 my-3"
          data-ocid="home.error_state"
        >
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load listings. Please refresh.
          </AlertDescription>
        </Alert>
      )}

      {/* Listings — OLX vertical list, edge-to-edge */}
      {isLoading ? (
        <div className="bg-white" data-ocid="home.loading_state">
          {[..."12345678"].map((c) => (
            <div key={c} className="border-b border-gray-100 px-4 py-3">
              <ListingCardSkeleton />
            </div>
          ))}
        </div>
      ) : hasItems ? (
        <div className="bg-white">
          {allItems.map((item, i) => (
            <div key={item.id} className="relative border-b border-gray-100">
              <ListingCard
                listing={item as unknown as Listing}
                index={i}
                featured={i === 0}
              />
            </div>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-24 text-center bg-white mx-4 my-4 rounded-2xl"
          data-ocid="home.empty_state"
        >
          <span className="text-6xl mb-4">{selectedCity ? "📍" : "📭"}</span>
          <h3 className="font-bold text-lg mb-1 text-gray-800">
            {selectedCity ? "No listings nearby" : "No listings yet"}
          </h3>
          <p className="text-gray-400 text-sm mb-6 max-w-xs">
            {searchQuery
              ? `No results for "${searchQuery}". Try a different search.`
              : selectedCity
                ? `No listings found in ${selectedCity}.`
                : "Be the first to post a gadget for sale."}
          </p>
          <Link to="/post">
            <Button
              className="gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700"
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
