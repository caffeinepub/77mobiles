import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  Eye,
  FileText,
  Heart,
  Megaphone,
  Package,
  PlusCircle,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Listing } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetCallerRelatedListings } from "../hooks/useQueries";

const FEATURE_PACKAGES = [
  {
    name: "Gold",
    price: "₹999",
    color: "bg-yellow-50 border-yellow-300",
    badge: "bg-yellow-500 text-white",
    features: [
      "Top of search results",
      "Gold badge",
      "10x more views",
      "30 days",
    ],
  },
  {
    name: "Silver",
    price: "₹499",
    color: "bg-gray-50 border-gray-300",
    badge: "bg-gray-400 text-white",
    features: ["Boosted in search", "Silver badge", "5x more views", "15 days"],
  },
  {
    name: "Basic",
    price: "₹199",
    color: "bg-blue-50 border-blue-200",
    badge: "bg-blue-500 text-white",
    features: ["Bumped to top once", "Highlighted", "2x more views", "7 days"],
  },
];

const AD_FILTERS = ["All", "Active", "Expired", "Sold"] as const;
type AdFilter = (typeof AD_FILTERS)[number];

function formatDateGroup(ts: bigint | number): string {
  const date = new Date(Number(ts) / 1_000_000);
  return date
    .toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    .toUpperCase();
}

function groupByDate(listings: Listing[]): Map<string, Listing[]> {
  const map = new Map<string, Listing[]>();
  for (const l of listings) {
    const key = `FROM: ${formatDateGroup(l.timestamp)}`;
    const arr = map.get(key) ?? [];
    arr.push(l);
    map.set(key, arr);
  }
  return map;
}

function AdCard({ listing, index }: { listing: Listing; index: number }) {
  const imageUrl = listing.images[0]?.getDirectURL?.() ?? null;
  const price = Number(listing.price).toLocaleString("en-IN");
  const isSold = (listing as any).isSold ?? false;

  return (
    <div
      className="flex gap-3 bg-white border border-gray-100 rounded-2xl p-3 hover:border-blue-100 transition-colors"
      data-ocid={`my_ads.item.${index}`}
    >
      {/* Thumbnail */}
      <div className="h-20 w-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 relative">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={listing.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-gray-300">
            <Package className="h-8 w-8" />
          </div>
        )}
        {isSold && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-[10px] font-black text-white bg-green-600 rounded px-1.5 py-0.5">
              SOLD
            </span>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-[#002f34] line-clamp-2 leading-tight">
          {listing.title}
        </p>
        <p className="text-blue-600 font-bold text-base mt-0.5">₹{price}</p>
        {isSold && (
          <p className="text-xs text-green-600 font-medium mt-0.5 flex items-center gap-1">
            <Badge className="bg-green-500 text-white text-[10px] h-4 px-1.5 font-bold">
              SOLD
            </Badge>
            This ad was sold
          </p>
        )}
        <div className="flex items-center gap-3 mt-1.5 text-gray-400">
          <span className="flex items-center gap-1 text-[11px]">
            <Eye className="h-3 w-3" /> {Math.floor(Math.random() * 200 + 20)}{" "}
            views
          </span>
          <span className="flex items-center gap-1 text-[11px]">
            <Heart className="h-3 w-3" /> {Math.floor(Math.random() * 20)} likes
          </span>
        </div>
        <button
          type="button"
          className="mt-2 px-3 py-1 rounded-lg text-xs font-semibold text-blue-600 border border-blue-300 bg-white hover:bg-blue-50 transition-colors flex items-center gap-1"
          onClick={() => toast.success("Ad removed")}
          data-ocid={`my_ads.delete_button.${index}`}
        >
          <Trash2 className="h-3 w-3" />
          Remove
        </button>
      </div>
    </div>
  );
}

export default function MyAdsPage() {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: listings, isLoading } = useGetCallerRelatedListings();
  const [activeFilter, setActiveFilter] = useState<AdFilter>("All");
  const [featureModalOpen, setFeatureModalOpen] = useState(false);

  if (isInitializing) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        data-ocid="my_ads.loading_state"
      >
        <div className="animate-spin h-8 w-8 rounded-full border-2 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (!identity) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center"
        data-ocid="my_ads.panel"
      >
        <FileText className="h-12 w-12 text-gray-300" />
        <h2 className="text-xl font-bold text-[#002f34]">
          Sign in to view your ads
        </h2>
        <p className="text-sm text-gray-400 max-w-xs">
          Log in to manage your listings and track inquiries.
        </p>
        <Link to="/profile">
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            data-ocid="my_ads.primary_button"
          >
            Go to Account
          </Button>
        </Link>
      </div>
    );
  }

  const grouped = listings ? groupByDate(listings) : new Map();

  return (
    <div className="min-h-screen bg-[#f5f5f5] pb-24" data-ocid="my_ads.page">
      {/* Package Expired Alert */}
      <div className="bg-red-600 px-4 py-2.5 flex items-center gap-3">
        <AlertTriangle className="h-4 w-4 text-orange-300 shrink-0" />
        <p className="text-white text-xs font-medium flex-1">
          Your package expired. Renew to stay visible.
        </p>
        <button
          type="button"
          className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-lg shrink-0 transition-colors"
          data-ocid="my_ads.button"
        >
          Renew
        </button>
      </div>

      {/* Header */}
      <div className="bg-white px-4 pt-5 pb-4 border-b border-gray-100">
        <h1 className="text-xl font-black text-center uppercase tracking-wide text-[#002f34]">
          MY ADS
        </h1>
      </div>

      {/* Promotion Card */}
      <div className="mx-4 mt-4 bg-white rounded-2xl border border-blue-100 p-4 shadow-sm">
        <div className="flex gap-3 items-start">
          <div className="h-12 w-12 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
            <Megaphone className="h-6 w-6 text-amber-600" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-[#002f34] text-sm">
              Want to sell it faster?
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              Feature your ad now to reach 10x more buyers and close the deal
              quickly.
            </p>
          </div>
        </div>
        <Button
          className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl h-10"
          onClick={() => setFeatureModalOpen(true)}
          data-ocid="my_ads.open_modal_button"
        >
          Feature Ad Now
        </Button>
      </div>

      {/* View All Filter */}
      <div className="mx-4 mt-3 flex items-center justify-between">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
          View all ({listings?.length ?? 0})
        </span>
        <div className="flex gap-1">
          {AD_FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setActiveFilter(f)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                activeFilter === f
                  ? "bg-[#002f34] text-white"
                  : "bg-white text-gray-500 border border-gray-200 hover:border-gray-300"
              }`}
              data-ocid="my_ads.tab"
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Listings */}
      <div className="px-4 pt-3">
        {isLoading ? (
          <div className="space-y-3" data-ocid="my_ads.loading_state">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-28 rounded-2xl bg-white animate-pulse border border-gray-100"
              />
            ))}
          </div>
        ) : !listings || listings.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-20 text-center gap-4"
            data-ocid="my_ads.empty_state"
          >
            <FileText className="h-14 w-14 text-gray-200" />
            <div>
              <p className="font-bold text-lg text-[#002f34]">No ads yet</p>
              <p className="text-sm text-gray-400 mt-1">
                You haven&apos;t posted any ads yet.
              </p>
            </div>
            <Link to="/post">
              <Button
                className="gap-2 bg-blue-600 hover:bg-blue-700"
                data-ocid="my_ads.primary_button"
              >
                <PlusCircle className="h-4 w-4" />
                Post Free Ad
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-5" data-ocid="my_ads.list">
            {Array.from(grouped.entries()).map(([dateLabel, items]) => (
              <div key={dateLabel}>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  {dateLabel}
                </p>
                <div className="space-y-3">
                  {items.map((listing, idx) => (
                    <AdCard
                      key={listing.id.toString()}
                      listing={listing}
                      index={idx + 1}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Feature Ad Modal */}
      <Dialog open={featureModalOpen} onOpenChange={setFeatureModalOpen}>
        <DialogContent className="max-w-sm" data-ocid="my_ads.dialog">
          <DialogHeader>
            <DialogTitle className="text-center font-black text-[#002f34]">
              Choose a Feature Package
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {FEATURE_PACKAGES.map((pkg) => (
              <div
                key={pkg.name}
                className={`rounded-2xl border-2 p-4 ${pkg.color}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-xs font-black uppercase px-2 py-0.5 rounded-full ${pkg.badge}`}
                  >
                    {pkg.name}
                  </span>
                  <span className="text-lg font-black text-[#002f34]">
                    {pkg.price}
                  </span>
                </div>
                <ul className="space-y-1">
                  {pkg.features.map((f) => (
                    <li
                      key={f}
                      className="text-xs text-gray-600 flex items-center gap-1.5"
                    >
                      <span className="text-green-500 font-bold">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm h-9 font-bold"
                  onClick={() => {
                    setFeatureModalOpen(false);
                    toast.success(`${pkg.name} package activated!`);
                  }}
                  data-ocid="my_ads.confirm_button"
                >
                  Select {pkg.name}
                </Button>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
