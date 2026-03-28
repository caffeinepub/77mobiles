import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Clock,
  Home,
  IndianRupee,
  LayoutList,
  Plus,
  Tag,
  Timer,
  TrendingUp,
  User,
  Video,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import SellerFormWizard, {
  type SellerFormData,
} from "../components/SellerFormWizard";

const LISTINGS_KEY = "b2b_listings";
const BIDS_KEY = "b2b_bids";

type NavTab = "home" | "listings" | "post" | "account";

function getPlatformFee(price: number): number {
  if (price <= 10000) return 800;
  if (price <= 30000) return 1000;
  if (price <= 60000) return 1300;
  if (price <= 100000) return 1500;
  return 2000;
}

function getSellerPayout(bidPrice: number) {
  const fee = getPlatformFee(bidPrice);
  const tcs = Math.round(bidPrice * 0.01);
  return { bidPrice, fee, tcs, payout: bidPrice - fee - tcs };
}

function fmt(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

type AuctionType = "live" | "7day";
type ListingStatus = "active" | "sold" | "expired" | "moved";

interface B2BListing {
  id: string;
  title: string;
  brand: string;
  model: string;
  basePrice: number;
  condition: string;
  auctionType: AuctionType;
  description: string;
  status: ListingStatus;
  createdAt: number;
  expiresAt: number;
  sellerId: string;
  acceptedEarly?: boolean;
  photoDataUrls?: string[];
}

interface B2BBid {
  listingId: string;
  amount: number;
  bidderId: string;
  bidderName: string;
  createdAt: number;
}

function getListings(): B2BListing[] {
  try {
    return JSON.parse(localStorage.getItem(LISTINGS_KEY) || "[]");
  } catch {
    return [];
  }
}

function getBids(): B2BBid[] {
  try {
    return JSON.parse(localStorage.getItem(BIDS_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveListings(listings: B2BListing[]) {
  localStorage.setItem(LISTINGS_KEY, JSON.stringify(listings));
}

function getHighestBid(listingId: string): number {
  const bids = getBids().filter((b) => b.listingId === listingId);
  if (!bids.length) return 0;
  return Math.max(...bids.map((b) => b.amount));
}

function getBidCount(listingId: string): number {
  return getBids().filter((b) => b.listingId === listingId).length;
}

function useCountdown(expiresAt: number) {
  const [remaining, setRemaining] = useState(
    Math.max(0, expiresAt - Date.now()),
  );
  useEffect(() => {
    const id = setInterval(() => {
      setRemaining(Math.max(0, expiresAt - Date.now()));
    }, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);
  return remaining;
}

function formatMs(ms: number) {
  if (ms <= 0) return "00:00";
  const secs = Math.floor(ms / 1000);
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function formatDuration(ms: number) {
  if (ms <= 0) return "Ended";
  const secs = Math.floor(ms / 1000);
  const days = Math.floor(secs / 86400);
  const hrs = Math.floor((secs % 86400) / 3600);
  if (days > 0) return `${days}d ${hrs}h left`;
  const mins = Math.floor((secs % 3600) / 60);
  return `${hrs}h ${mins}m left`;
}

const FEE_TIERS = [
  { range: "₹0 – ₹10,000", fee: "₹800" },
  { range: "₹10,001 – ₹30,000", fee: "₹1,000" },
  { range: "₹30,001 – ₹60,000", fee: "₹1,300" },
  { range: "₹60,001 – ₹1,00,000", fee: "₹1,500" },
  { range: "₹1,00,001+", fee: "₹2,000" },
];

function AcceptDealModal({
  listing,
  onClose,
  onConfirm,
}: {
  listing: B2BListing;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const highestBid = getHighestBid(listing.id);
  const payout = getSellerPayout(highestBid);

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="p-0 border border-gray-200 max-w-sm bg-white shadow-xl rounded-2xl"
        data-ocid="seller.dialog"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <DialogTitle className="font-bold text-gray-900 text-base">
              Accept Deal Now?
            </DialogTitle>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            data-ocid="seller.close_button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Device summary */}
          <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
            <p className="font-semibold text-gray-900 text-sm">
              {listing.title}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {listing.condition} · {listing.brand}
            </p>
          </div>

          {/* Payout breakdown */}
          <div className="bg-blue-50 rounded-xl p-3.5 border border-blue-100">
            <p className="text-xs font-bold text-blue-800 mb-2 flex items-center gap-1.5">
              <IndianRupee className="h-3 w-3" />
              Payout Breakdown
            </p>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-gray-700">
                <span>Winning bid</span>
                <span className="font-semibold">{fmt(payout.bidPrice)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>− Platform fee</span>
                <span>−{fmt(payout.fee)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>− 1% TCS (claimable)</span>
                <span>−{fmt(payout.tcs)}</span>
              </div>
              <div className="flex justify-between font-bold border-t border-blue-200 pt-1.5 mt-1 text-blue-800">
                <span>Net payout</span>
                <span>{fmt(payout.payout)}</span>
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-500 text-center">
            The auction will close immediately and the device will be marked as
            sold.
          </p>
        </div>

        {/* Actions */}
        <div className="px-5 pb-5 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
            data-ocid="seller.cancel_button"
          >
            Keep Bidding
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-green-600 hover:bg-green-700 text-white transition-colors shadow-md"
            data-ocid="seller.confirm_button"
          >
            Accept Deal
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ListingCard({
  listing,
  index,
  onMove,
  onAcceptDeal,
}: {
  listing: B2BListing;
  index: number;
  onMove: (id: string) => void;
  onAcceptDeal: (listing: B2BListing) => void;
}) {
  const remaining = useCountdown(listing.expiresAt);
  const highestBid = getHighestBid(listing.id);
  const bidCount = getBidCount(listing.id);
  const isExpired = remaining <= 0;
  const canMove =
    listing.auctionType === "live" &&
    isExpired &&
    listing.status === "active" &&
    highestBid === 0;

  const canAcceptDeal =
    listing.status === "active" && highestBid > 0 && remaining > 0;

  const auctionLabel =
    listing.auctionType === "live" ? "Live 20min" : "7-Day Auction";
  const auctionColor =
    listing.auctionType === "live"
      ? "bg-red-100 text-red-600"
      : "bg-blue-100 text-blue-600";

  const statusColor =
    listing.status === "sold"
      ? "bg-green-100 text-green-700"
      : listing.status === "expired"
        ? "bg-gray-100 text-gray-500"
        : listing.status === "moved"
          ? "bg-purple-100 text-purple-700"
          : "bg-emerald-100 text-emerald-700";

  return (
    <div
      style={{
        animation: "fadeSlideUp 0.3s ease forwards",
        animationDelay: `${index * 50}ms`,
        opacity: 0,
      }}
      className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
      data-ocid={`seller.item.${index + 1}`}
    >
      <div className="flex gap-3 p-4">
        <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shrink-0 overflow-hidden">
          {listing.photoDataUrls?.[0] ? (
            <img
              src={listing.photoDataUrls[0]}
              alt={listing.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <Tag className="h-8 w-8 text-gray-400" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-gray-900 text-sm leading-tight">
              {listing.title}
            </h3>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${statusColor}`}
            >
              {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
              {listing.condition}
            </span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${auctionColor}`}
            >
              {auctionLabel}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Base</p>
              <p className="font-bold text-gray-900 text-sm">
                {fmt(listing.basePrice)}
              </p>
            </div>
            {highestBid > 0 && (
              <div className="text-right">
                <p className="text-xs text-gray-500">Top Bid</p>
                <p className="font-bold text-blue-600 text-sm">
                  {fmt(highestBid)}
                </p>
              </div>
            )}
            <div className="text-right">
              <p className="text-xs text-gray-500">Bids</p>
              <p className="font-bold text-gray-700 text-sm">{bidCount}</p>
            </div>
          </div>

          {listing.auctionType === "live" && !isExpired && (
            <div className="mt-2 flex items-center gap-1.5">
              <Timer className="h-3.5 w-3.5 text-red-500" />
              <span className="text-sm font-mono font-bold text-red-500">
                {formatMs(remaining)}
              </span>
              <span className="text-xs text-gray-500">remaining</span>
            </div>
          )}
          {listing.auctionType === "7day" && !isExpired && (
            <div className="mt-2 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-blue-500" />
              <span className="text-xs font-semibold text-blue-600">
                {formatDuration(remaining)}
              </span>
            </div>
          )}

          {canAcceptDeal && (
            <button
              type="button"
              onClick={() => onAcceptDeal(listing)}
              className="mt-2 w-full text-xs font-bold px-3 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              data-ocid={`seller.primary_button.${index + 1}`}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Accept Deal Now
            </button>
          )}

          {canMove && (
            <button
              type="button"
              onClick={() => onMove(listing.id)}
              className="mt-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition-colors"
              data-ocid={`seller.secondary_button.${index + 1}`}
            >
              Move to 7-Day Auction
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function B2BSellerPage() {
  const [activeTab, setActiveTab] = useState<NavTab>("home");
  const [listings, setListings] = useState<B2BListing[]>([]);
  const [postOpen, setPostOpen] = useState(false);
  const [acceptTarget, setAcceptTarget] = useState<B2BListing | null>(null);
  const [demoMode, setDemoMode] = useState(false);
  const [activeStatFilter, setActiveStatFilter] = useState<
    "all" | "active" | "sold"
  >("all");
  const navigate = useNavigate();
  const listingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setListings(getListings().filter((l) => l.sellerId === "demo_seller"));
  }, []);

  const handlePost = (listing: B2BListing) => {
    const all = getListings();
    all.unshift(listing);
    saveListings(all);
    setListings(all.filter((l) => l.sellerId === "demo_seller"));
    toast.success("Auction started! Your listing is now live.");
  };

  const handleMove = (id: string) => {
    const all = getListings().map((l) => {
      if (l.id === id) {
        const now = Date.now();
        return {
          ...l,
          auctionType: "7day" as AuctionType,
          status: "active" as ListingStatus,
          expiresAt: now + 7 * 24 * 60 * 60 * 1000,
          createdAt: now,
        };
      }
      return l;
    });
    saveListings(all);
    setListings(all.filter((l) => l.sellerId === "demo_seller"));
    toast.success("Moved to 7-Day Auction!");
  };

  const handleAcceptDeal = () => {
    if (!acceptTarget) return;
    const all = getListings().map((l) =>
      l.id === acceptTarget.id
        ? {
            ...l,
            status: "sold" as ListingStatus,
            expiresAt: Date.now(),
            acceptedEarly: true,
          }
        : l,
    );
    saveListings(all);
    setListings(all.filter((l) => l.sellerId === "demo_seller"));
    setAcceptTarget(null);
    toast.success("Deal accepted! Auction closed and device marked as sold.");
  };

  const scrollToListings = () => {
    listingsRef.current?.scrollIntoView({ behavior: "smooth" });
    setActiveTab("listings");
  };

  return (
    <>
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-ring {
          0% { box-shadow: 0 0 0 0 rgba(37,99,235,0.4); }
          70% { box-shadow: 0 0 0 10px rgba(37,99,235,0); }
          100% { box-shadow: 0 0 0 0 rgba(37,99,235,0); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        .fab-pulse { animation: pulse-ring 2s infinite; }
        .scrollbar-none::-webkit-scrollbar { display: none; }
      `}</style>

      <div className="min-h-screen bg-[#f5f7fa] pb-24">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 pt-6 pb-8 text-white">
          <div className="max-w-lg mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-black tracking-tight">
                  77mobiles.pro
                </h1>
                <p className="text-blue-100 text-sm mt-0.5">Seller Portal</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-lg mx-auto px-4 -mt-4">
          {/* Summary stats */}
          <div
            className="grid grid-cols-3 gap-3 mb-6"
            style={{ animation: "fadeSlideUp 0.3s ease forwards" }}
          >
            {[
              {
                label: "Active",
                value: listings.filter((l) => l.status === "active").length,
                color: "text-blue-600",
              },
              {
                label: "Sold",
                value: listings.filter((l) => l.status === "sold").length,
                color: "text-green-600",
              },
              {
                label: "Total",
                value: listings.length,
                color: "text-gray-700",
              },
            ].map((s) => (
              <Card
                key={s.label}
                className={`bg-white shadow-sm rounded-2xl cursor-pointer transition-all ${activeStatFilter === s.label.toLowerCase() ? "border-2 border-blue-500 shadow-blue-200" : "border-gray-200"}`}
                onClick={() =>
                  setActiveStatFilter(
                    (s.label.toLowerCase() === "total"
                      ? "all"
                      : s.label.toLowerCase()) as any,
                  )
                }
              >
                <CardContent className="p-3 text-center">
                  <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Demo Mode Toggle */}
          <div className="flex items-center justify-between bg-white rounded-2xl border border-blue-100 shadow-sm px-4 py-3 mb-4">
            <div>
              <p className="text-sm font-bold text-gray-900">Demo Mode</p>
              <p className="text-xs text-gray-500">Preview Verified listings</p>
            </div>
            <button
              type="button"
              onClick={() => setDemoMode((v) => !v)}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${demoMode ? "bg-blue-600" : "bg-gray-300"}`}
              data-ocid="seller.toggle"
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${demoMode ? "translate-x-6" : "translate-x-1"}`}
              />
            </button>
          </div>

          {/* Demo Verified Listings */}
          {demoMode && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-base font-bold text-gray-900">
                  ✓ Verified Demo Listings
                </span>
                <span className="text-xs bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full">
                  DEMO
                </span>
              </div>
              <div className="space-y-3">
                {[
                  {
                    name: "iPhone 14 Pro 256GB",
                    score: 91,
                    price: "₹72,000",
                    brand: "Apple",
                    storage: "256GB",
                  },
                  {
                    name: "Samsung Galaxy S23 Ultra",
                    score: 88,
                    price: "₹58,500",
                    brand: "Samsung",
                    storage: "512GB",
                  },
                  {
                    name: "OnePlus 12 256GB",
                    score: 94,
                    price: "₹41,000",
                    brand: "OnePlus",
                    storage: "256GB",
                  },
                  {
                    name: "Google Pixel 8 Pro",
                    score: 87,
                    price: "₹63,000",
                    brand: "Google",
                    storage: "128GB",
                  },
                  {
                    name: "Xiaomi 14 Ultra 512GB",
                    score: 92,
                    price: "₹49,500",
                    brand: "Xiaomi",
                    storage: "512GB",
                  },
                ].map((item, i) => (
                  <div
                    key={item.name}
                    className="bg-white rounded-2xl border border-green-100 shadow-sm p-4 flex gap-3 items-center"
                    data-ocid={`seller.item.${i + 1}`}
                  >
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-100 to-teal-100 flex items-center justify-center shrink-0">
                      <span className="text-2xl">📱</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-bold text-gray-900 truncate">
                          {item.name}
                        </p>
                        <span className="shrink-0 text-[10px] font-bold bg-green-500 text-white rounded-full px-2 py-0.5">
                          ✓ VERIFIED
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Health:</span>
                        <span className="text-xs font-bold text-[#1A56DB]">
                          {item.score}/100
                        </span>
                        <span className="text-[10px] text-green-600">🔋✓</span>
                        <span className="text-[10px] text-green-600">📱✓</span>
                        <span className="text-[10px] text-green-600">👆✓</span>
                      </div>
                    </div>
                    <p className="text-base font-black text-[#1A56DB] shrink-0">
                      {item.price}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* My Listings */}
          <div ref={listingsRef}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-gray-900">My Listings</h2>
              <Badge className="bg-blue-100 text-blue-700 border-0 text-xs">
                {listings.length} total
              </Badge>
            </div>

            {listings.length === 0 ? (
              <div
                className="text-center py-16 bg-white rounded-2xl border border-gray-200"
                data-ocid="seller.empty_state"
              >
                <LayoutList className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="font-semibold text-gray-600">No listings yet</p>
                <p className="text-sm text-gray-400 mt-1">
                  Tap the + button to start your first auction
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {(activeStatFilter === "all"
                  ? listings
                  : listings.filter((l) => l.status === activeStatFilter)
                ).map((listing, i) => (
                  <button
                    key={listing.id}
                    type="button"
                    onClick={() =>
                      navigate({
                        to: "/b2b-seller/$listingId",
                        params: { listingId: listing.id },
                      })
                    }
                    className="w-full text-left"
                  >
                    <ListingCard
                      listing={listing}
                      index={i}
                      onMove={handleMove}
                      onAcceptDeal={setAcceptTarget}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Platform Fee Info */}
          <div className="mt-8 bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
            <h3 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2">
              <IndianRupee className="h-4 w-4 text-blue-600" />
              Platform Fee Structure
            </h3>
            <div className="space-y-1.5">
              {FEE_TIERS.map((tier) => (
                <div
                  key={tier.range}
                  className="flex justify-between text-xs py-1.5 border-b border-gray-50 last:border-0"
                >
                  <span className="text-gray-600">{tier.range}</span>
                  <span className="font-bold text-gray-900">{tier.fee}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 p-2 rounded-lg bg-yellow-50 border border-yellow-100">
              <p className="text-xs text-yellow-800">
                <strong>+18% GST</strong> on platform fee ·{" "}
                <strong>+1% TCS</strong> on transaction amount (claimable)
              </p>
            </div>
            <div className="mt-2 p-2 rounded-lg bg-blue-50 border border-blue-100">
              <p className="text-xs text-blue-800 flex items-start gap-1.5">
                <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                <span>
                  Seller pays <strong>1% TCS</strong> on every transaction.
                  Invoice generated after device inspection is complete.
                </span>
              </p>
            </div>
          </div>

          {/* Earnings estimate */}
          {listings.some((l) => l.status === "active") && (
            <div className="mt-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <p className="text-sm font-bold text-blue-900">
                  Active Auctions
                </p>
              </div>
              <p className="text-xs text-blue-700">
                You have {listings.filter((l) => l.status === "active").length}{" "}
                active auction(s). Tap &lsquo;Accept Deal Now&rsquo; on any
                listing with bids to close it early.
              </p>
            </div>
          )}

          <div className="mt-8 text-center">
            <p className="text-xs text-gray-400">
              © {new Date().getFullYear()} 77mobiles.pro · B2B Dealer Platform
            </p>
          </div>
        </div>

        {/* FAB */}
        <button
          type="button"
          onClick={() => {
            setPostOpen(true);
            setActiveTab("post");
          }}
          className="fab-pulse fixed bottom-20 right-4 w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:scale-110 transition-transform duration-200 flex items-center justify-center z-40"
          data-ocid="seller.open_modal_button"
        >
          <Plus className="h-6 w-6" />
        </button>

        {/* Bottom Nav */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
          <div className="flex items-center max-w-lg mx-auto">
            {[
              { id: "home" as NavTab, icon: Home, label: "Home" },
              {
                id: "listings" as NavTab,
                icon: LayoutList,
                label: "My Listings",
                onClick: scrollToListings,
              },
              {
                id: "post" as NavTab,
                icon: Plus,
                label: "Post",
                onClick: () => setPostOpen(true),
                primary: true,
              },
              { id: "account" as NavTab, icon: User, label: "Account" },
            ].map((item) => (
              <button
                type="button"
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  item.onClick?.();
                }}
                className={`flex-1 flex flex-col items-center py-3 gap-0.5 transition-colors ${
                  item.primary
                    ? "text-blue-600"
                    : activeTab === item.id
                      ? "text-blue-600"
                      : "text-gray-400 hover:text-gray-600"
                }`}
                data-ocid={`seller.${item.id}.tab`}
              >
                <item.icon
                  className={`h-5 w-5 ${item.primary ? "text-blue-600" : ""}`}
                />
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </nav>

        {postOpen && (
          <SellerFormWizard
            isB2B
            onSubmit={(data: SellerFormData) => {
              const priceNum = Number.parseInt(data.price);
              if (Number.isNaN(priceNum) || priceNum <= 0) {
                toast.error("Enter a valid price");
                return;
              }
              const now = Date.now();
              const duration =
                data.auctionType === "live"
                  ? 20 * 60 * 1000
                  : 7 * 24 * 60 * 60 * 1000;
              const listing: B2BListing = {
                id: String(now),
                title: data.title,
                brand: data.brand,
                model: "",
                basePrice: priceNum,
                condition: data.condition,
                auctionType: data.auctionType,
                description: data.description,
                status: "active",
                createdAt: now,
                expiresAt: now + duration,
                sellerId: "demo_seller",
                photoDataUrls: data.photoDataUrls,
              };
              handlePost(listing);
              setPostOpen(false);
            }}
            onCancel={() => setPostOpen(false)}
          />
        )}

        {acceptTarget && (
          <AcceptDealModal
            listing={acceptTarget}
            onClose={() => setAcceptTarget(null)}
            onConfirm={handleAcceptDeal}
          />
        )}
      </div>
    </>
  );
}
