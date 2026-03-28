import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import {
  AlertCircle,
  MapPin,
  Navigation,
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
  { id: ListingCategory.phones, label: "Phones", emoji: "\ud83d\udcf1" },
  { id: ListingCategory.macbooks, label: "MacBooks", emoji: "\ud83d\udcbb" },
  { id: ListingCategory.watches, label: "Watches", emoji: "\u231a" },
  { id: ListingCategory.earphones, label: "Earphones", emoji: "\ud83c\udfa7" },
] as const;

type CategoryId = (typeof CATEGORIES)[number]["id"];

interface GeoFilter {
  lat: number;
  lon: number;
  radiusKm: number;
}

// ── Tech Hub Slider ───────────────────────────────────────────────────────────
const NEWS_ARTICLES = [
  {
    id: "1",
    headline:
      "Samsung Galaxy S26 Ultra: First Leaked Specs Reveal 200MP Camera",
    author: "Rohit Sharma",
    timeAgo: "2h ago",
    bg: "from-blue-600 to-indigo-800",
  },
  {
    id: "2",
    headline:
      "iPhone 17 Pro Display: Revolutionary Under-Screen Camera Confirmed",
    author: "Priya Mehta",
    timeAgo: "4h ago",
    bg: "from-gray-800 to-gray-900",
  },
  {
    id: "3",
    headline: "Snapdragon 8 Gen 4: Qualcomm's Next Flagship Chip Details Leak",
    author: "Arjun Das",
    timeAgo: "6h ago",
    bg: "from-violet-700 to-purple-900",
  },
  {
    id: "4",
    headline: "Google Pixel 10 Pro: Tensor G5 Chip to Challenge Apple Silicon",
    author: "Neha Singh",
    timeAgo: "8h ago",
    bg: "from-green-700 to-teal-900",
  },
  {
    id: "5",
    headline: "OnePlus 13T: Leaked Renders Show Triple Periscope Camera System",
    author: "Vikram Rao",
    timeAgo: "12h ago",
    bg: "from-red-700 to-orange-800",
  },
  {
    id: "6",
    headline:
      "Sell Your Device Now: Get Best Price for Used Phones in Hyderabad",
    author: "77mobiles Team",
    timeAgo: "1d ago",
    bg: "from-blue-500 to-cyan-600",
    isSellSlide: true,
  },
];

function TechHubSlider() {
  const navigate = useNavigate();
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(
      () => setIdx((i) => (i + 1) % NEWS_ARTICLES.length),
      5000,
    );
    return () => clearInterval(t);
  }, []);

  const article = NEWS_ARTICLES[idx];

  return (
    <div className="px-4 pb-3 bg-white">
      <button
        type="button"
        onClick={() => navigate({ to: "/news" })}
        className="relative w-full rounded-2xl overflow-hidden shadow-md"
        style={{ height: 160 }}
        data-ocid="home.link"
      >
        <div className={`absolute inset-0 bg-gradient-to-br ${article.bg}`} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        {/* NEWS badge */}
        <div className="absolute top-3 left-3">
          <span className="bg-blue-500 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wide">
            NEWS
          </span>
        </div>
        {/* Content bottom */}
        <div className="absolute bottom-3 left-3 right-3">
          <p className="text-white font-bold text-sm leading-snug line-clamp-2 drop-shadow">
            {article.headline}
          </p>
          <p className="text-white/70 text-[11px] mt-1">
            {article.author} &bull; {article.timeAgo}
          </p>
          {(article as any).isSellSlide && (
            <span className="inline-block mt-1 bg-white text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
              Check Price →
            </span>
          )}
        </div>
      </button>
      {/* Dots */}
      <div className="flex justify-center gap-1.5 mt-2">
        {NEWS_ARTICLES.map((a, i) => (
          <button
            key={a.id}
            type="button"
            onClick={() => setIdx(i)}
            className={`h-1.5 rounded-full transition-all ${i === idx ? "w-4 bg-blue-500" : "w-1.5 bg-gray-300"}`}
          />
        ))}
      </div>
    </div>
  );
}

// ── EV Station Card ───────────────────────────────────────────────────────────
function EVStationCard() {
  const navigate = useNavigate();
  const launchNav = () => {
    const url =
      "https://www.google.com/maps/dir/?api=1&destination=17.428,78.455";
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      className="relative mx-0 bg-gradient-to-br from-green-600 to-teal-700 rounded-[12px] overflow-hidden"
      data-ocid="home.card"
    >
      {/* Available badge */}
      <div className="absolute top-3 right-3 bg-white/90 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
        3/4 Available
      </div>

      <div className="p-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">⚡</span>
          <div>
            <p className="font-bold text-white text-sm leading-tight">
              Tata Power EZ Charge
            </p>
            <p className="text-white/70 text-xs">Somajiguda, Hyderabad</p>
          </div>
        </div>

        {/* Connector icons */}
        <div className="flex gap-2 mb-3">
          <span className="bg-white/20 text-white text-[10px] font-semibold px-2 py-1 rounded-full flex items-center gap-1">
            ⚡ CCS2 (60kW)
          </span>
          <span className="bg-white/20 text-white text-[10px] font-semibold px-2 py-1 rounded-full flex items-center gap-1">
            🔌 Type 2
          </span>
        </div>

        {/* 77 Rewards banner */}
        <div className="bg-white/15 rounded-xl px-3 py-2 mb-3 flex items-center gap-2">
          <span className="text-yellow-300 text-sm">🪙</span>
          <p className="text-white text-xs font-semibold">
            77 Rewards: Report Status — Earn +10 Points
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={launchNav}
            className="flex-1 bg-white text-green-700 text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1.5"
            data-ocid="home.primary_button"
          >
            <Navigation className="h-3.5 w-3.5" /> Get Directions
          </button>
          <button
            type="button"
            onClick={() => navigate({ to: "/ev-charging" })}
            className="flex-1 bg-white/20 text-white text-xs font-bold py-2 rounded-xl"
            data-ocid="home.secondary_button"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Demo Listing Card ─────────────────────────────────────────────────────────
interface DemoItem {
  id: string;
  title: string;
  price: number;
  location: string;
  isVerified?: boolean;
  battery?: number;
  isFeatured?: boolean;
  isAuctionLive?: boolean;
  isProScout?: boolean;
  emoji: string;
  timeAgo: string;
}

const DEMO_LISTINGS: DemoItem[] = [
  {
    id: "d1",
    title: "iPhone 15 Pro 256GB Natural Titanium",
    price: 79000,
    location: "Ward 32, Patthergatti, Hyderabad",
    isVerified: true,
    battery: 94,
    isFeatured: true,
    emoji: "\ud83d\udcf1",
    timeAgo: "2h ago",
  },
  {
    id: "d2",
    title: "Samsung Galaxy S24 Ultra 512GB",
    price: 95000,
    location: "Ward 32, Patthergatti, Hyderabad",
    isVerified: true,
    battery: 91,
    isAuctionLive: true,
    isProScout: true,
    emoji: "\ud83d\udcf1",
    timeAgo: "3h ago",
  },
  {
    id: "d3",
    title: "Google Pixel 8 Pro 128GB",
    price: 52000,
    location: "Ward 32, Patthergatti, Hyderabad",
    emoji: "\ud83d\udcf1",
    timeAgo: "5h ago",
  },
  {
    id: "d5",
    title: "MacBook Air M3 16GB/512GB",
    price: 105000,
    location: "Ward 32, Patthergatti, Hyderabad",
    isVerified: true,
    isFeatured: true,
    isProScout: true,
    emoji: "\ud83d\udcbb",
    timeAgo: "6h ago",
  },
  {
    id: "d6",
    title: "iPhone 15 Pro 128GB",
    price: 74500,
    location: "Ward 32, Patthergatti, Hyderabad",
    emoji: "\ud83d\udcf1",
    timeAgo: "8h ago",
  },
  {
    id: "d7",
    title: "Apple Watch Ultra 2",
    price: 78000,
    location: "Ward 32, Patthergatti, Hyderabad",
    isVerified: true,
    battery: 98,
    emoji: "\u231a",
    timeAgo: "10h ago",
  },
  {
    id: "d8",
    title: 'MacBook Pro M2 14" 16GB',
    price: 135000,
    location: "Ward 32, Patthergatti, Hyderabad",
    emoji: "\ud83d\udcbb",
    timeAgo: "12h ago",
  },
  {
    id: "d9",
    title: "Samsung Galaxy S24 Ultra 256GB",
    price: 88000,
    location: "Ward 32, Patthergatti, Hyderabad",
    isAuctionLive: true,
    isProScout: true,
    emoji: "\ud83d\udcf1",
    timeAgo: "1d ago",
  },
  {
    id: "d10",
    title: "Apple Watch Ultra 2 (Used 3 months)",
    price: 68000,
    location: "Ward 32, Patthergatti, Hyderabad",
    emoji: "\u231a",
    timeAgo: "1d ago",
  },
  {
    id: "d11",
    title: "Google Pixel 8 256GB",
    price: 44000,
    location: "Ward 32, Patthergatti, Hyderabad",
    isVerified: true,
    battery: 96,
    emoji: "\ud83d\udcf1",
    timeAgo: "2d ago",
  },
];

function DemoListingCard({ item, index }: { item: DemoItem; index: number }) {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      className="flex gap-3 px-4 py-3 bg-white hover:bg-gray-50 transition-colors w-full text-left"
      onClick={() => navigate({ to: "/" })}
      data-ocid={`home.item.${index + 1}`}
    >
      <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shrink-0 relative">
        <span className="text-3xl">{item.emoji}</span>
        {item.isFeatured && (
          <span className="absolute -top-1 -left-1 bg-amber-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full">
            Featured
          </span>
        )}
        {item.isAuctionLive && (
          <span className="absolute -top-1 -left-1 bg-red-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full animate-pulse">
            🔴 Live
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2">
          {item.title}
        </p>
        <p className="text-base font-bold text-gray-900 mt-0.5">
          ₹{item.price.toLocaleString("en-IN")}
        </p>
        {item.isVerified && (
          <div className="flex items-center gap-1 mt-0.5">
            <span className="text-[10px] font-bold bg-yellow-100 text-yellow-700 border border-yellow-200 px-1.5 py-0.5 rounded-full">
              ✨ Verified{item.battery ? ` • Battery ${item.battery}%` : ""}
            </span>
          </div>
        )}
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[11px] text-gray-400">{item.location}</span>
          {item.isProScout && (
            <span className="text-[10px] font-bold bg-gray-800 text-gray-200 px-1.5 py-0.5 rounded-full">
              🛡 Pro Scout
            </span>
          )}
          <span className="text-[11px] text-gray-400 ml-auto">
            {item.timeAgo}
          </span>
        </div>
      </div>
    </button>
  );
}

// ── Sell Instant Banner ───────────────────────────────────────────────────────
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
  const [selectedCity, setSelectedCity] = useState<string>(
    () => localStorage.getItem("userLocation") ?? "",
  );
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
    const handler = () =>
      setSelectedCity(localStorage.getItem("userLocation") ?? "");
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
    if (selectedCity)
      result = result.filter(
        (l) =>
          !l.location ||
          l.location.toLowerCase().includes(selectedCity.toLowerCase()),
      );
    if (geoFilter)
      result = result.filter((l) => {
        const p = parseGeoLocation(l.location);
        return p
          ? haversine(geoFilter.lat, geoFilter.lon, p.lat, p.lon) <=
              geoFilter.radiusKm
          : true;
      });
    return result;
  }, [listings, geoFilter, selectedCity]);

  const allItems = useMemo(() => {
    let items: Listing[] = [...(filteredListings ?? [])];
    if (brandFilter) {
      const b = brandFilter.toLowerCase();
      items = items.filter(
        (i) =>
          i.title.toLowerCase().includes(b) ||
          i.description.toLowerCase().includes(b),
      );
    }
    if (conditionFilter)
      items = items.filter((i) => {
        const c = (i as any).condition;
        return !c || c.toLowerCase().includes(conditionFilter.toLowerCase());
      });
    if (budgetFilter)
      items = items.filter((i) => {
        const p = Number(String(i.price).replace(/[^0-9.]/g, ""));
        return (
          Number.isNaN(p) ||
          (p >= budgetFilter.min &&
            p <=
              (budgetFilter.max === Number.POSITIVE_INFINITY
                ? Number.MAX_SAFE_INTEGER
                : budgetFilter.max))
        );
      });
    if (sortOrder === "price_asc")
      items = [...items].sort(
        (a, b) =>
          Number(String(a.price).replace(/[^0-9.]/g, "")) -
          Number(String(b.price).replace(/[^0-9.]/g, "")),
      );
    else if (sortOrder === "price_desc")
      items = [...items].sort(
        (a, b) =>
          Number(String(b.price).replace(/[^0-9.]/g, "")) -
          Number(String(a.price).replace(/[^0-9.]/g, "")),
      );
    return items;
  }, [filteredListings, brandFilter, conditionFilter, budgetFilter, sortOrder]);

  const hasItems = !isLoading && allItems.length > 0;
  const showDemo = !isLoading && allItems.length < 3;

  if (skeletonVisible) {
    return (
      <div className="min-h-screen bg-[#f5f5f5]" data-ocid="home.loading_state">
        <div className="bg-white sticky top-0 z-40 px-4 pt-3 pb-3 space-y-3">
          <div className="h-10 bg-gray-200 rounded-xl animate-pulse" />
          <div className="h-8 bg-gray-100 rounded-lg animate-pulse" />
          <div className="flex gap-2 overflow-hidden pb-1">
            {["a", "b", "c", "d", "e"].map((id) => (
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
          {["x", "y", "z"].map((id) => (
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
      {/* Top section — sticky */}
      <div className="bg-white sticky top-0 z-40">
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
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl border transition-all duration-200 shrink-0 min-w-[64px] ${category === cat.id ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700"}`}
              >
                {(cat as any).useGridIcon ? (
                  <GridIcon
                    className={`w-5 h-5 ${category === cat.id ? "text-blue-600" : "text-gray-400"}`}
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

      {/* Sell Instant Banner */}
      <div className="px-4 pb-2 bg-white">
        <SellInstantBanner />
      </div>

      {/* Promo Banner Carousel */}
      <div className="bg-white pb-3">
        <PromoBannerCarousel />
      </div>

      {/* Tech Hub Slider */}
      <TechHubSlider />

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
            <PlusCircle className="h-3.5 w-3.5" /> Post Free Ad
          </Button>
        </Link>
      </div>

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

      {isLoading ? (
        <div className="bg-white" data-ocid="home.loading_state">
          {["a", "b", "c", "d", "e", "f", "g", "h"].map((c) => (
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
      ) : showDemo ? (
        <div className="bg-white">
          {DEMO_LISTINGS.slice(0, 3).map((item, i) => (
            <div key={item.id} className="border-b border-gray-100">
              <DemoListingCard item={item} index={i} />
            </div>
          ))}
          {/* EV Station Card as 4th item */}
          <div className="border-b border-gray-100 px-4 py-3">
            <EVStationCard />
          </div>
          {DEMO_LISTINGS.slice(3).map((item, i) => (
            <div key={item.id} className="border-b border-gray-100">
              <DemoListingCard item={item} index={i + 4} />
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
          <span className="text-6xl mb-4">
            {selectedCity ? "\ud83d\udccd" : "\ud83d\udcad"}
          </span>
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
              <PlusCircle className="h-4 w-4" /> Post First Ad
            </Button>
          </Link>
        </motion.div>
      )}
    </div>
  );
}
