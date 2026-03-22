import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Home,
  IndianRupee,
  LayoutList,
  Play,
  Plus,
  Sparkles,
  Tag,
  Timer,
  TrendingUp,
  User,
  Video,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const LISTINGS_KEY = "b2b_listings";
const BIDS_KEY = "b2b_bids";

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

const CONDITIONS = ["New", "Like New", "Good", "Fair"];
const BRANDS = [
  "Apple",
  "Samsung",
  "OnePlus",
  "Google",
  "Xiaomi",
  "Realme",
  "Vivo",
  "OPPO",
  "Nothing",
  "Motorola",
  "Sony",
  "Other",
];

const FEE_TIERS = [
  { range: "₹0 – ₹10,000", fee: "₹800" },
  { range: "₹10,001 – ₹30,000", fee: "₹1,000" },
  { range: "₹30,001 – ₹60,000", fee: "₹1,300" },
  { range: "₹60,001 – ₹1,00,000", fee: "₹1,500" },
  { range: "₹1,00,001+", fee: "₹2,000" },
];

const AI_GUIDE_STEPS = [
  {
    icon: "📸",
    title: "Photos",
    tip: "Use good lighting, show all 4 sides. Buyers trust verified photo listings 3× more.",
  },
  {
    icon: "💰",
    title: "Pricing",
    tip: "Set base price 10–15% below market. Competitive prices get 5× more bids.",
  },
  {
    icon: "⭐",
    title: "Condition",
    tip: "Be honest — Like New means <3 months, minimal scratches. Honest listings sell faster.",
  },
  {
    icon: "📝",
    title: "Description",
    tip: "Mention box contents, warranty, purchase date. Details = higher final bids.",
  },
];

function VideoGuideModal({ onClose }: { onClose: () => void }) {
  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="p-0 border border-gray-200 max-w-sm bg-white shadow-xl rounded-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-blue-500" />
            <DialogTitle className="font-bold text-gray-900 text-sm">
              360° AI Video Guide
            </DialogTitle>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Animated video placeholder */}
        <div
          className="mx-5 mt-5 rounded-xl overflow-hidden bg-blue-50 relative"
          style={{ height: 180 }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-blue-100 border-2 border-blue-300 flex items-center justify-center shadow-md">
              <Play className="h-7 w-7 fill-blue-600 text-blue-600 ml-1" />
            </div>
          </div>
          <div className="absolute top-3 right-3 text-xs font-bold px-2 py-0.5 rounded-full bg-blue-600 text-white">
            360°
          </div>
        </div>

        {/* Tips */}
        <div className="px-5 py-4 space-y-2.5">
          {[
            "Show all 4 sides of the device with steady hands for 360° coverage",
            "Capture screen, camera, ports, and any scratches clearly in bright light",
            "Speak the model name, storage, and condition aloud for audio verification",
          ].map((tip, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: static list
            <div key={i} className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold mt-0.5 bg-blue-100 text-blue-700">
                {i + 1}
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">{tip}</p>
            </div>
          ))}
        </div>

        <div className="px-5 pb-5">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-md"
          >
            Got it!
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

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
        <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shrink-0">
          <Tag className="h-8 w-8 text-gray-400" />
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

function PostAuctionModal({
  open,
  onClose,
  onPost,
}: {
  open: boolean;
  onClose: () => void;
  onPost: (listing: B2BListing) => void;
}) {
  const [title, setTitle] = useState("");
  const [brand, setBrand] = useState("Apple");
  const [model, setModel] = useState("");
  const [price, setPrice] = useState("");
  const [condition, setCondition] = useState("Like New");
  const [auctionType, setAuctionType] = useState<AuctionType>("live");
  const [desc, setDesc] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [guideOpen, setGuideOpen] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = "Device title is required";
    if (!brand) errs.brand = "Brand is required";
    if (!price) errs.price = "Base price is required";
    else if (
      Number.isNaN(Number.parseInt(price)) ||
      Number.parseInt(price) <= 0
    )
      errs.price = "Enter a valid price";
    if (!condition) errs.condition = "Condition is required";
    return errs;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    const priceNum = Number.parseInt(price);
    const now = Date.now();
    const duration =
      auctionType === "live" ? 20 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;
    const listing: B2BListing = {
      id: String(now),
      title,
      brand,
      model,
      basePrice: priceNum,
      condition,
      auctionType,
      description: desc,
      status: "active",
      createdAt: now,
      expiresAt: now + duration,
      sellerId: "demo_seller",
    };
    onPost(listing);
    setTitle("");
    setBrand("Apple");
    setModel("");
    setPrice("");
    setCondition("Like New");
    setAuctionType("live");
    setDesc("");
    setErrors({});
    setVideoFile(null);
    setGuideOpen(false);
    onClose();
  };

  const labelCls =
    "text-gray-500 text-[11px] font-semibold uppercase tracking-wider mb-1 block";
  const errorCls = "text-red-500 text-xs mt-1";
  const inputCls =
    "w-full px-3.5 py-2.5 text-sm text-gray-900 outline-none transition-all bg-white border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 placeholder:text-gray-400";

  return (
    <>
      <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
        <DialogContent
          className="p-0 border border-gray-200 max-w-md max-h-[92vh] overflow-hidden bg-white shadow-xl rounded-2xl"
          data-ocid="seller.dialog"
        >
          <div className="overflow-y-auto" style={{ maxHeight: "92vh" }}>
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white px-5 pt-5 pb-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <DialogHeader>
                    <DialogTitle className="text-xl font-black tracking-tight text-gray-900">
                      Post New Auction
                    </DialogTitle>
                  </DialogHeader>
                  <p className="text-gray-400 text-xs mt-0.5">
                    77mobiles.pro · B2B Dealer Platform
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="px-5 pb-6 space-y-5 mt-2">
              {/* AI Listing Guide */}
              <div className="rounded-xl overflow-hidden bg-blue-50 border border-blue-100">
                <button
                  type="button"
                  onClick={() => setGuideOpen((p) => !p)}
                  className="w-full flex items-center justify-between px-3.5 py-3 transition-colors hover:bg-blue-100/50"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">🎯</span>
                    <div className="text-left">
                      <span className="text-gray-800 text-xs font-bold">
                        AI Listing Guide
                      </span>
                      <p className="text-gray-500 text-[10px]">
                        Watch how to post perfectly
                      </p>
                    </div>
                  </div>
                  {guideOpen ? (
                    <ChevronUp className="h-4 w-4 text-blue-500" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-blue-500" />
                  )}
                </button>

                {guideOpen && (
                  <div className="pb-3">
                    <div
                      className="flex gap-2.5 overflow-x-auto px-3.5 pb-1 scrollbar-none"
                      style={{ scrollbarWidth: "none" }}
                    >
                      {AI_GUIDE_STEPS.map((step, i) => (
                        <div
                          key={step.title}
                          className="shrink-0 w-36 rounded-xl p-3 bg-white border border-blue-100"
                          style={{
                            animation: "fadeSlideUp 0.25s ease forwards",
                            animationDelay: `${i * 60}ms`,
                            opacity: 0,
                          }}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 bg-blue-100 text-blue-700">
                              {i + 1}
                            </div>
                            <span className="text-sm">{step.icon}</span>
                            <span className="text-gray-900 font-bold text-xs">
                              {step.title}
                            </span>
                          </div>
                          <p className="text-gray-500 text-[10px] leading-relaxed">
                            {step.tip}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="px-3.5 mt-2.5">
                      <button
                        type="button"
                        onClick={() => setVideoOpen(true)}
                        className="w-full py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 transition-all bg-white border border-blue-200 text-blue-600 hover:bg-blue-50"
                        data-ocid="seller.button"
                      >
                        <Play className="h-3.5 w-3.5 text-blue-500" />
                        Watch 360° Video Guide
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Title */}
              <div>
                <label htmlFor="auction-title" className={labelCls}>
                  Device Title *
                </label>
                <input
                  id="auction-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Samsung Galaxy S24 Ultra 256GB"
                  className={inputCls}
                  style={errors.title ? { borderColor: "#ef4444" } : undefined}
                  data-ocid="seller.input"
                />
                {errors.title && <p className={errorCls}>{errors.title}</p>}
              </div>

              {/* Brand + Model */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="auction-brand" className={labelCls}>
                    Brand *
                  </label>
                  <Select value={brand} onValueChange={setBrand}>
                    <SelectTrigger
                      id="auction-brand"
                      className="w-full px-3.5 py-2.5 text-sm text-gray-900 bg-white border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 h-auto"
                      data-ocid="seller.select"
                    >
                      <SelectValue placeholder="Brand" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200">
                      {BRANDS.map((b) => (
                        <SelectItem key={b} value={b} className="text-gray-700">
                          {b}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.brand && <p className={errorCls}>{errors.brand}</p>}
                </div>
                <div>
                  <label htmlFor="auction-model" className={labelCls}>
                    Model
                  </label>
                  <input
                    id="auction-model"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="Model"
                    className={inputCls}
                  />
                </div>
              </div>

              {/* Price + Condition */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="auction-price" className={labelCls}>
                    Base Price (₹) *
                  </label>
                  <input
                    id="auction-price"
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="e.g. 45000"
                    className={inputCls}
                    style={
                      errors.price ? { borderColor: "#ef4444" } : undefined
                    }
                    data-ocid="seller.input"
                  />
                  {errors.price && <p className={errorCls}>{errors.price}</p>}
                </div>
                <div>
                  <label htmlFor="auction-condition" className={labelCls}>
                    Condition *
                  </label>
                  <Select value={condition} onValueChange={setCondition}>
                    <SelectTrigger
                      id="auction-condition"
                      className="w-full px-3.5 py-2.5 text-sm text-gray-900 bg-white border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 h-auto"
                      data-ocid="seller.select"
                    >
                      <SelectValue placeholder="Condition" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200">
                      {CONDITIONS.map((c) => (
                        <SelectItem key={c} value={c} className="text-gray-700">
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.condition && (
                    <p className={errorCls}>{errors.condition}</p>
                  )}
                </div>
              </div>

              {/* Auction Type — iOS pill segmented control */}
              <div>
                <p className={labelCls}>Auction Type</p>
                <div className="flex p-1 rounded-full mt-1 bg-gray-100">
                  {(["live", "7day"] as AuctionType[]).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setAuctionType(type)}
                      className={`flex-1 text-xs font-semibold py-2 rounded-full transition-all duration-200 ${
                        auctionType === type
                          ? "bg-blue-600 text-white shadow-sm"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                      data-ocid="seller.toggle"
                    >
                      {type === "live" ? "⚡ Live 20 min" : "📅 7-Day Auction"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="auction-desc" className={labelCls}>
                  Description (optional)
                </label>
                <textarea
                  id="auction-desc"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Add device details, accessories included, reason for selling..."
                  rows={3}
                  className={`${inputCls} resize-none`}
                  data-ocid="seller.textarea"
                />
              </div>

              {/* Video Upload */}
              <div>
                <div className={labelCls}>
                  Device Video (optional)
                  <span className="ml-1.5 text-blue-500 font-normal normal-case text-[10px]">
                    360° recommended
                  </span>
                </div>
                {videoFile ? (
                  <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                    <Video className="h-4 w-4 text-blue-500 shrink-0" />
                    <span className="text-xs text-blue-700 truncate flex-1">
                      {videoFile.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => setVideoFile(null)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-2 w-full h-20 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all">
                    <Video className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-gray-500">
                      Tap to upload video
                    </span>
                    <input
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) setVideoFile(f);
                      }}
                    />
                  </label>
                )}
              </div>

              {/* Payout preview */}
              {price &&
                !Number.isNaN(Number.parseInt(price)) &&
                Number.parseInt(price) > 0 && (
                  <div className="rounded-xl p-3.5 bg-blue-50 border border-blue-100">
                    <p className="text-xs font-bold text-blue-800 mb-2 flex items-center gap-1.5">
                      <IndianRupee className="h-3 w-3" />
                      Estimated payout
                    </p>
                    {(() => {
                      const p = getSellerPayout(Number.parseInt(price));
                      return (
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between text-blue-700">
                            <span>Winning bid</span>
                            <span>{fmt(p.bidPrice)}</span>
                          </div>
                          <div className="flex justify-between text-blue-600">
                            <span>− Platform fee</span>
                            <span>−{fmt(p.fee)}</span>
                          </div>
                          <div className="flex justify-between text-blue-600">
                            <span>− 1% TCS (claimable)</span>
                            <span>−{fmt(p.tcs)}</span>
                          </div>
                          <div className="flex justify-between font-bold border-t border-blue-200 pt-1.5 mt-1 text-blue-800">
                            <span>Net payout</span>
                            <span>{fmt(p.payout)}</span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

              {/* Submit */}
              <button
                type="submit"
                className="w-full h-12 rounded-2xl font-bold text-white text-sm transition-all hover:scale-[1.02] active:scale-[0.98] bg-blue-600 hover:bg-blue-700 shadow-md"
                data-ocid="seller.submit_button"
              >
                🚀 Start Auction
              </button>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {videoOpen && <VideoGuideModal onClose={() => setVideoOpen(false)} />}
    </>
  );
}

type NavTab = "home" | "listings" | "post" | "account";

export default function B2BSellerPage() {
  const [activeTab, setActiveTab] = useState<NavTab>("home");
  const [listings, setListings] = useState<B2BListing[]>([]);
  const [postOpen, setPostOpen] = useState(false);
  const [acceptTarget, setAcceptTarget] = useState<B2BListing | null>(null);
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
                className="bg-white border-gray-200 shadow-sm rounded-2xl"
              >
                <CardContent className="p-3 text-center">
                  <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

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
                {listings.map((listing, i) => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    index={i}
                    onMove={handleMove}
                    onAcceptDeal={setAcceptTarget}
                  />
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

        <PostAuctionModal
          open={postOpen}
          onClose={() => setPostOpen(false)}
          onPost={handlePost}
        />

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
