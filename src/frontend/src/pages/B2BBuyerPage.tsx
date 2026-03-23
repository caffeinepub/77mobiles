import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Gavel,
  Home,
  Lock,
  Printer,
  Search,
  ShoppingBag,
  Tag,
  Timer,
  TrendingUp,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const LISTINGS_KEY = "b2b_listings";
const BIDS_KEY = "b2b_bids";
const DEMO_BUYER_ID = "demo_buyer";

function getPlatformFee(price: number): number {
  if (price <= 10000) return 800;
  if (price <= 30000) return 1000;
  if (price <= 60000) return 1300;
  if (price <= 100000) return 1500;
  return 2000;
}

function getBuyerTotal(bidPrice: number) {
  const fee = getPlatformFee(bidPrice);
  const gstOnFee = Math.round(fee * 0.18);
  const tcs = Math.round(bidPrice * 0.01);
  return {
    bidPrice,
    fee,
    gstOnFee,
    tcs,
    total: bidPrice + fee + gstOnFee + tcs,
  };
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

const DEMO_LISTINGS: B2BListing[] = [
  {
    id: "demo1",
    title: "Samsung Galaxy S24 Ultra 256GB",
    brand: "Samsung",
    model: "S24 Ultra",
    basePrice: 85000,
    condition: "Like New",
    auctionType: "live",
    description: "Purchased 2 months ago, complete box with all accessories.",
    status: "active",
    createdAt: Date.now(),
    expiresAt: Date.now() + 14 * 60 * 1000 + 32 * 1000,
    sellerId: "seller1",
  },
  {
    id: "demo2",
    title: "Apple iPhone 15 Pro Max 512GB",
    brand: "Apple",
    model: "iPhone 15 Pro Max",
    basePrice: 130000,
    condition: "Good",
    auctionType: "7day",
    description: "No scratches, all working. Original charger included.",
    status: "active",
    createdAt: Date.now() - 86400000,
    expiresAt: Date.now() + 6 * 86400000 + 14 * 3600000,
    sellerId: "seller2",
  },
  {
    id: "demo3",
    title: "OnePlus 12 5G 256GB",
    brand: "OnePlus",
    model: "OnePlus 12",
    basePrice: 52000,
    condition: "New",
    auctionType: "live",
    description: "Sealed box, never opened. Bought as backup.",
    status: "active",
    createdAt: Date.now(),
    expiresAt: Date.now() + 8 * 60 * 1000 + 45 * 1000,
    sellerId: "seller3",
  },
  {
    id: "demo4",
    title: "Google Pixel 8 Pro 128GB",
    brand: "Google",
    model: "Pixel 8 Pro",
    basePrice: 76000,
    condition: "Like New",
    auctionType: "7day",
    description: "Minor wear on edges, screen pristine. Comes with case.",
    status: "active",
    createdAt: Date.now() - 2 * 86400000,
    expiresAt: Date.now() + 5 * 86400000 + 9 * 3600000,
    sellerId: "seller4",
  },
  {
    id: "demo5",
    title: "Apple iPhone 14 Pro 256GB",
    brand: "Apple",
    model: "iPhone 14 Pro",
    basePrice: 72000,
    condition: "Like New",
    auctionType: "live",
    description: "Excellent condition, no scratches. Original box included.",
    status: "sold",
    createdAt: Date.now() - 30 * 60 * 1000,
    expiresAt: Date.now() - 5 * 60 * 1000,
    sellerId: "seller5",
    acceptedEarly: true,
  },
];

function getListings(): B2BListing[] {
  try {
    const raw = localStorage.getItem(LISTINGS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
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

function saveBids(bids: B2BBid[]) {
  localStorage.setItem(BIDS_KEY, JSON.stringify(bids));
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

function getMyWinningBid(listingId: string): B2BBid | null {
  const bids = getBids().filter(
    (b) => b.listingId === listingId && b.bidderId === DEMO_BUYER_ID,
  );
  if (!bids.length) return null;
  const highest = getHighestBid(listingId);
  const myHighest = Math.max(...bids.map((b) => b.amount));
  if (myHighest === highest)
    return bids.find((b) => b.amount === myHighest) || null;
  return null;
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
  if (ms <= 0) return "Ended";
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

function AuctionCard({
  listing,
  index,
  onBid,
  onInvoice,
}: {
  listing: B2BListing;
  index: number;
  onBid: (listing: B2BListing) => void;
  onInvoice: (listing: B2BListing) => void;
}) {
  const remaining = useCountdown(listing.expiresAt);
  const highestBid = getHighestBid(listing.id);
  const bidCount = getBidCount(listing.id);
  const isLive = listing.auctionType === "live";
  const isExpired = remaining <= 0;
  const currentPrice = highestBid > 0 ? highestBid : listing.basePrice;
  const myWin = getMyWinningBid(listing.id);
  const isWinner = !!myWin && isExpired;

  return (
    <div
      style={{
        animation: "fadeSlideUp 0.3s ease forwards",
        animationDelay: `${index * 50}ms`,
        opacity: 0,
      }}
      className={`bg-white rounded-2xl border shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden ${
        isWinner ? "border-green-300 ring-1 ring-green-200" : "border-gray-200"
      }`}
      data-ocid={`buyer.item.${index + 1}`}
    >
      {listing.status === "sold" && listing.acceptedEarly && (
        <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border-b border-red-100">
          <Lock className="h-3.5 w-3.5 text-red-500 shrink-0" />
          <span className="text-xs font-semibold text-red-600">
            Seller accepted early — Auction closed
          </span>
        </div>
      )}
      <div className="flex gap-3 p-4">
        {/* Image */}
        <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shrink-0 relative overflow-hidden">
          {listing.photoDataUrls?.[0] ? (
            <img
              src={listing.photoDataUrls[0]}
              alt={listing.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <Tag className="h-8 w-8 text-gray-400" />
          )}
          {isLive && !isExpired && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
              LIVE
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-gray-900 text-sm leading-tight">
              {listing.title}
            </h3>
            {isWinner && (
              <Badge className="bg-green-100 text-green-700 border-0 shrink-0 text-[10px]">
                Won!
              </Badge>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5 mt-1">
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
              {listing.condition}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
              {listing.brand}
            </span>
          </div>

          <div className="mt-2 flex items-end justify-between">
            <div>
              <p className="text-xs text-gray-400 line-through">
                {fmt(listing.basePrice)}
              </p>
              <p
                className={`font-black text-base ${
                  highestBid > 0 ? "text-blue-600" : "text-gray-800"
                }`}
              >
                {fmt(currentPrice)}
              </p>
              <p className="text-xs text-gray-500">{bidCount} bids</p>
            </div>

            <div className="text-right">
              {isLive && !isExpired ? (
                <div className="flex items-center gap-1 justify-end">
                  <Timer className="h-3.5 w-3.5 text-red-500" />
                  <span className="text-sm font-mono font-bold text-red-500">
                    {formatMs(remaining)}
                  </span>
                </div>
              ) : isLive && isExpired ? (
                <span className="text-xs font-bold text-gray-500">Ended</span>
              ) : (
                <div className="flex items-center gap-1 justify-end">
                  <Clock className="h-3.5 w-3.5 text-blue-500" />
                  <span className="text-xs font-semibold text-blue-600">
                    {formatDuration(remaining)}
                  </span>
                </div>
              )}

              {!isExpired && listing.status !== "sold" && (
                <Button
                  size="sm"
                  className="mt-2 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-xl h-8 px-4"
                  onClick={() => onBid(listing)}
                  data-ocid={`buyer.primary_button.${index + 1}`}
                >
                  <Gavel className="h-3.5 w-3.5 mr-1" /> Place Bid
                </Button>
              )}
              {listing.status === "sold" && (
                <Button
                  size="sm"
                  disabled
                  className="mt-2 bg-gray-200 text-gray-500 text-xs rounded-xl h-8 px-4 cursor-not-allowed"
                  data-ocid={`buyer.secondary_button.${index + 1}`}
                >
                  Closed
                </Button>
              )}
              {isWinner && (
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-2 border-green-400 text-green-700 hover:bg-green-50 text-xs rounded-xl h-8 px-3"
                  onClick={() => onInvoice(listing)}
                  data-ocid={`buyer.secondary_button.${index + 1}`}
                >
                  <Printer className="h-3.5 w-3.5 mr-1" /> Invoice
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Escrow badge if won */}
      {isWinner && (
        <div className="mx-4 mb-4 p-2.5 rounded-xl bg-green-50 border border-green-100 flex items-center gap-2">
          <Lock className="h-4 w-4 text-green-600 shrink-0" />
          <div>
            <p className="text-xs font-bold text-green-800">
              Escrow: {fmt(myWin!.amount)} held
            </p>
            <p className="text-[10px] text-green-600">
              Funds released after inspection
            </p>
          </div>
          <Badge className="ml-auto bg-green-100 text-green-700 border-0 text-[10px]">
            Held
          </Badge>
        </div>
      )}
    </div>
  );
}

function BidModal({
  listing,
  onClose,
  onConfirm,
}: {
  listing: B2BListing | null;
  onClose: () => void;
  onConfirm: (listingId: string, amount: number) => void;
}) {
  const [bidAmount, setBidAmount] = useState("");

  if (!listing) return null;

  const highestBid = getHighestBid(listing.id);
  const minBid = Math.max(listing.basePrice, highestBid) + 1;
  const bidNum = Number.parseInt(bidAmount);
  const calc =
    !Number.isNaN(bidNum) && bidNum > 0 ? getBuyerTotal(bidNum) : null;

  const handleConfirm = () => {
    if (Number.isNaN(bidNum) || bidNum < minBid) {
      toast.error(`Bid must be at least ${fmt(minBid)}`);
      return;
    }
    onConfirm(listing.id, bidNum);
    setBidAmount("");
  };

  return (
    <Dialog open={!!listing} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="bg-white max-w-sm max-h-[90vh] overflow-y-auto"
        data-ocid="buyer.dialog"
      >
        <DialogHeader>
          <DialogTitle className="text-gray-900 font-bold">
            Place a Bid
          </DialogTitle>
        </DialogHeader>

        <div className="mt-2">
          {/* Device summary */}
          <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 mb-4">
            <p className="font-bold text-gray-900 text-sm">{listing.title}</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {listing.condition} · {listing.brand}
            </p>
            <div className="mt-2 flex justify-between text-xs">
              <span className="text-gray-500">Current highest bid</span>
              <span className="font-bold text-blue-600">
                {highestBid > 0 ? fmt(highestBid) : fmt(listing.basePrice)}
              </span>
            </div>
          </div>

          {/* Bid input */}
          <div className="mb-4">
            <Label className="text-gray-700 text-sm font-semibold">
              Your Bid Amount (₹)
            </Label>
            <Input
              type="number"
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              placeholder={`Min ${fmt(minBid)}`}
              className="mt-1 border-gray-200 bg-gray-50 focus:border-blue-500 text-lg font-bold"
              data-ocid="buyer.input"
            />
            <p className="text-xs text-gray-400 mt-1">
              Minimum bid: {fmt(minBid)}
            </p>
          </div>

          {/* Fee breakdown */}
          {calc && (
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 mb-4">
              <p className="text-xs font-bold text-blue-800 mb-2">
                Charge Summary
              </p>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-gray-700">
                  <span>Your bid</span>
                  <span className="font-semibold">{fmt(calc.bidPrice)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Platform fee ({fmt(calc.fee)})</span>
                  <span>+{fmt(calc.fee)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>+18% GST on fee (claimable)</span>
                  <span>+{fmt(calc.gstOnFee)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>+1% TCS on device (claimable)</span>
                  <span>+{fmt(calc.tcs)}</span>
                </div>
                <div className="flex justify-between font-black text-blue-900 border-t border-blue-200 pt-1.5 mt-1">
                  <span>Total Payable</span>
                  <span>{fmt(calc.total)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Escrow notice */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-green-50 border border-green-100 mb-4">
            <Lock className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
            <p className="text-xs text-green-800">
              <strong>Payment held in escrow</strong> until device inspection is
              complete. GST and TCS are claimable against your GSTIN.
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl"
              onClick={onClose}
              data-ocid="buyer.cancel_button"
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl"
              onClick={handleConfirm}
              data-ocid="buyer.confirm_button"
            >
              <Gavel className="h-4 w-4 mr-1" /> Confirm Bid
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function InvoiceModal({
  listing,
  onClose,
}: {
  listing: B2BListing | null;
  onClose: () => void;
}) {
  if (!listing) return null;

  const myWin = getMyWinningBid(listing.id);
  if (!myWin) return null;

  const calc = getBuyerTotal(myWin.amount);
  const fee = getPlatformFee(myWin.amount);
  const gstOnFee = Math.round(fee * 0.18);

  return (
    <Dialog open={!!listing} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="bg-white max-w-sm max-h-[90vh] overflow-y-auto"
        data-ocid="buyer.modal"
      >
        <DialogHeader>
          <DialogTitle className="text-gray-900 font-bold flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Buyer Invoice
          </DialogTitle>
        </DialogHeader>

        <div className="mt-2 space-y-4">
          <div className="text-center">
            <p className="text-xl font-black text-blue-600">77mobiles.pro</p>
            <p className="text-xs text-gray-500">B2B Dealer Platform</p>
            <p className="text-xs text-gray-400 mt-1">
              Invoice #{listing.id.slice(-6).toUpperCase()}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
            <p className="font-bold text-gray-900 text-sm">{listing.title}</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Condition: {listing.condition} · Brand: {listing.brand}
            </p>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Winning Bid</span>
              <span className="font-bold text-gray-900">
                {fmt(calc.bidPrice)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Platform Fee</span>
              <span className="font-semibold text-gray-900">{fmt(fee)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">
                + 18% GST on Fee{" "}
                <span className="text-green-600 text-xs">(claimable)</span>
              </span>
              <span className="font-semibold text-gray-900">
                {fmt(gstOnFee)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">
                + 1% TCS on Device{" "}
                <span className="text-green-600 text-xs">(claimable)</span>
              </span>
              <span className="font-semibold text-gray-900">
                {fmt(calc.tcs)}
              </span>
            </div>
            <div className="flex justify-between font-black text-base border-t border-gray-200 pt-2 mt-1 text-gray-900">
              <span>Total Payable</span>
              <span className="text-blue-600">{fmt(calc.total)}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-green-50 border border-green-100">
            <div className="flex items-center gap-2 mb-1">
              <Lock className="h-4 w-4 text-green-600" />
              <p className="text-xs font-bold text-green-800">
                Escrow Status: Held
              </p>
            </div>
            <p className="text-xs text-green-700">
              {fmt(myWin.amount)} held in escrow pending inspection.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
            <p className="text-xs text-blue-800">
              <strong>Note:</strong> GST and TCS are claimable against your
              GSTIN. This invoice is generated post device inspection.
            </p>
          </div>

          <Button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl"
            onClick={() => window.print()}
            data-ocid="buyer.primary_button"
          >
            <Printer className="h-4 w-4 mr-2" /> Print / Download Invoice
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

type FilterTab = "all" | "live" | "7day";
type NavTab = "home" | "auctions" | "won" | "account";

export default function B2BBuyerPage() {
  const [listings, setListings] = useState<B2BListing[]>([]);
  const [filterTab, setFilterTab] = useState<FilterTab>("all");
  const [navTab, setNavTab] = useState<NavTab>("home");
  const [bidTarget, setBidTarget] = useState<B2BListing | null>(null);
  const [invoiceTarget, setInvoiceTarget] = useState<B2BListing | null>(null);
  const [search, setSearch] = useState("");
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    // Seed demo listings if empty
    const existing = getListings();
    if (!existing.some((l) => l.sellerId !== "demo_seller")) {
      const all = [...existing, ...DEMO_LISTINGS];
      saveListings(all);
    }
    setListings(getListings().filter((l) => l.status === "active"));
  }, []);

  const handleBidConfirm = (listingId: string, amount: number) => {
    const bids = getBids();
    const newBid: B2BBid = {
      listingId,
      amount,
      bidderId: DEMO_BUYER_ID,
      bidderName: "Test Buyer",
      createdAt: Date.now(),
    };
    bids.push(newBid);
    saveBids(bids);
    setBidTarget(null);
    forceUpdate((n) => n + 1);
    toast.success(`Bid of ${fmt(amount)} placed! Funds held in escrow.`);
  };

  const filtered = listings.filter((l) => {
    if (filterTab === "live" && l.auctionType !== "live") return false;
    if (filterTab === "7day" && l.auctionType !== "7day") return false;
    if (
      search &&
      !l.title.toLowerCase().includes(search.toLowerCase()) &&
      !l.brand.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  const wonListings = listings.filter(
    (l) => l.expiresAt <= Date.now() && !!getMyWinningBid(l.id),
  );

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
      `}</style>

      <div className="min-h-screen bg-[#f5f7fa] pb-24">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 pt-6 pb-8 text-white">
          <div className="max-w-lg mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-black tracking-tight">
                  77mobiles.pro
                </h1>
                <p className="text-blue-100 text-sm mt-0.5">
                  Live Auctions · Buyer Portal
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-white/20 rounded-full px-2.5 py-1">
                  <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                  <span className="text-xs font-bold text-white">
                    {
                      listings.filter(
                        (l) =>
                          l.auctionType === "live" && l.expiresAt > Date.now(),
                      ).length
                    }{" "}
                    Live
                  </span>
                </div>
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="mt-4 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search devices, brands..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/20 text-white placeholder-white/60 text-sm outline-none focus:bg-white/30 transition-colors"
                data-ocid="buyer.search_input"
              />
            </div>
          </div>
        </div>

        <div className="max-w-lg mx-auto px-4 -mt-4">
          {/* Stats row */}
          <div
            className="grid grid-cols-3 gap-3 mb-4"
            style={{ animation: "fadeSlideUp 0.3s ease forwards" }}
          >
            {[
              {
                label: "Live Now",
                value: listings.filter(
                  (l) => l.auctionType === "live" && l.expiresAt > Date.now(),
                ).length,
                color: "text-red-600",
              },
              {
                label: "7-Day",
                value: listings.filter((l) => l.auctionType === "7day").length,
                color: "text-blue-600",
              },
              {
                label: "My Wins",
                value: wonListings.length,
                color: "text-green-600",
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

          {/* Filter tabs */}
          <div className="flex gap-2 mb-4">
            {(["all", "live", "7day"] as FilterTab[]).map((tab) => (
              <button
                type="button"
                key={tab}
                onClick={() => setFilterTab(tab)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                  filterTab === tab
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-white text-gray-600 border border-gray-200 hover:border-blue-300"
                }`}
                data-ocid={`buyer.${tab}.tab`}
              >
                {tab === "all"
                  ? "All"
                  : tab === "live"
                    ? "⚡ Live"
                    : "📅 7-Day"}
              </button>
            ))}
          </div>

          {/* Listings */}
          {filtered.length === 0 ? (
            <div
              className="text-center py-16 bg-white rounded-2xl border border-gray-200"
              data-ocid="buyer.empty_state"
            >
              <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="font-semibold text-gray-600">No auctions found</p>
              <p className="text-sm text-gray-400 mt-1">
                Try a different filter or check back later
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((listing, i) => (
                <AuctionCard
                  key={listing.id}
                  listing={listing}
                  index={i}
                  onBid={setBidTarget}
                  onInvoice={setInvoiceTarget}
                />
              ))}
            </div>
          )}

          {/* Escrow & compliance info */}
          <div className="mt-6 bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
            <h3 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2">
              <Lock className="h-4 w-4 text-green-600" />
              Escrow & Payment Protection
            </h3>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                <p className="text-xs text-gray-600">
                  All payments held in escrow until device inspection passes.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                <p className="text-xs text-gray-600">
                  <strong>18% GST</strong> on platform fee (claimable against
                  GSTIN).
                </p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                <p className="text-xs text-gray-600">
                  <strong>1% TCS</strong> deducted on device price (claimable).
                </p>
              </div>
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                <p className="text-xs text-gray-600">
                  Invoice generated only after inspection is complete.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-400">
              © {new Date().getFullYear()} 77mobiles.pro · B2B Buyer Portal
            </p>
          </div>
        </div>

        {/* Bottom Nav */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
          <div className="flex items-center max-w-lg mx-auto">
            {[
              { id: "home" as NavTab, icon: Home, label: "Home" },
              { id: "auctions" as NavTab, icon: Gavel, label: "Auctions" },
              { id: "won" as NavTab, icon: TrendingUp, label: "Won" },
              { id: "account" as NavTab, icon: User, label: "Account" },
            ].map((item) => (
              <button
                type="button"
                key={item.id}
                onClick={() => setNavTab(item.id)}
                className={`flex-1 flex flex-col items-center py-3 gap-0.5 transition-colors relative ${
                  navTab === item.id
                    ? "text-blue-600"
                    : "text-gray-400 hover:text-gray-600"
                }`}
                data-ocid={`buyer.${item.id}.tab`}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
                {item.id === "won" && wonListings.length > 0 && (
                  <span className="absolute top-2 right-1/4 w-4 h-4 bg-red-500 rounded-full text-white text-[9px] font-bold flex items-center justify-center">
                    {wonListings.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </nav>
      </div>

      <BidModal
        listing={bidTarget}
        onClose={() => setBidTarget(null)}
        onConfirm={handleBidConfirm}
      />
      <InvoiceModal
        listing={invoiceTarget}
        onClose={() => setInvoiceTarget(null)}
      />
    </>
  );
}
