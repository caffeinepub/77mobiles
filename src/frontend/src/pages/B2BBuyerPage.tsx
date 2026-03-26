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
  ArrowLeft,
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

// ─── Silent Auction Detail View ─────────────────────────────────────────────

function BatteryRing({ percent }: { percent: number }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const dashOffset = circ - (percent / 100) * circ;
  const color = percent >= 80 ? "#22c55e" : "#eab308";
  return (
    <div className="flex flex-col items-center gap-1">
      <svg
        width="72"
        height="72"
        viewBox="0 0 72 72"
        aria-label="Battery health indicator"
        role="img"
      >
        <circle
          cx="36"
          cy="36"
          r={r}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="7"
        />
        <circle
          cx="36"
          cy="36"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="7"
          strokeDasharray={circ}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          transform="rotate(-90 36 36)"
        />
        <text
          x="36"
          y="40"
          textAnchor="middle"
          fontSize="14"
          fontWeight="bold"
          fill={color}
        >
          {percent}%
        </text>
      </svg>
    </div>
  );
}

interface AuctionDetailViewProps {
  listing: B2BListing;
  onBack: () => void;
}

function AuctionDetailView({ listing, onBack }: AuctionDetailViewProps) {
  const [timeLeft, setTimeLeft] = useState(1200); // 20 min
  const [currentBid, setCurrentBid] = useState(
    Math.max(listing.basePrice, getHighestBid(listing.id)) || listing.basePrice,
  );
  const [bidLog, setBidLog] = useState([
    { dealer: "Dealer ***42", amount: currentBid },
    { dealer: "Dealer ***17", amount: currentBid - 500 },
    { dealer: "Dealer ***89", amount: currentBid - 1000 },
    { dealer: "Dealer ***31", amount: currentBid - 1500 },
    { dealer: "Dealer ***55", amount: currentBid - 2000 },
  ]);
  const [bidConfirmed, setBidConfirmed] = useState(false);
  const [extended, setExtended] = useState(false);
  const [showExtendOverlay, setShowExtendOverlay] = useState(false);
  const [timerPulse, setTimerPulse] = useState(false);
  const [auctionClosed, setAuctionClosed] = useState(false);
  const [showWinner, setShowWinner] = useState(false);
  const [confetti, setConfetti] = useState(false);

  useEffect(() => {
    if (timeLeft <= 0) {
      setAuctionClosed(true);
      setConfetti(true);
      setTimeout(() => setShowWinner(true), 800);
      return;
    }
    const id = setInterval(
      () =>
        setTimeLeft((t) => {
          if (t <= 1) {
            setAuctionClosed(true);
            return 0;
          }
          return t - 1;
        }),
      1000,
    );
    return () => clearInterval(id);
  }, [timeLeft]);

  const mins = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const secs = String(timeLeft % 60).padStart(2, "0");
  const isFinalPhase = timeLeft <= 300 && timeLeft > 0;

  const fee = getPlatformFee(currentBid);
  const gstOnFee = Math.round(fee * 0.18);
  const totalPayable = currentBid + fee + gstOnFee;

  const handleBid = (increment: number) => {
    if (auctionClosed) return;
    const newBid = currentBid + increment;
    setCurrentBid(newBid);
    setBidLog((prev) => [
      { dealer: "You (Dealer ***00)", amount: newBid },
      ...prev.slice(0, 4),
    ]);
    setBidConfirmed(true);
    setTimeout(() => setBidConfirmed(false), 2000);
    if (timeLeft < 60) {
      setTimeLeft((t) => t + 60);
      setExtended(true);
      setShowExtendOverlay(true);
      setTimerPulse(true);
      setTimeout(() => setShowExtendOverlay(false), 3000);
      setTimeout(() => setTimerPulse(false), 3000);
    }
  };

  const photos = [
    "Front",
    "Back",
    "Left Side",
    "Right Side",
    "Battery Screen",
    "IMEI Screen",
  ];

  return (
    <div
      className="fixed inset-0 z-[60] bg-white flex flex-col overflow-y-auto"
      data-ocid="auction.panel"
    >
      {/* Confetti */}
      {confetti && (
        <div className="fixed inset-0 z-[70] pointer-events-none overflow-hidden">
          {[
            "c0",
            "c1",
            "c2",
            "c3",
            "c4",
            "c5",
            "c6",
            "c7",
            "c8",
            "c9",
            "c10",
            "c11",
            "c12",
            "c13",
            "c14",
            "c15",
            "c16",
            "c17",
            "c18",
            "c19",
            "c20",
            "c21",
            "c22",
            "c23",
            "c24",
            "c25",
            "c26",
            "c27",
            "c28",
            "c29",
            "c30",
            "c31",
            "c32",
            "c33",
            "c34",
            "c35",
            "c36",
            "c37",
            "c38",
            "c39",
          ].map((id) => (
            <div
              key={id}
              style={{
                position: "absolute",
                left: `${Math.random() * 100}%`,
                top: "-10px",
                width: "10px",
                height: "10px",
                borderRadius: Math.random() > 0.5 ? "50%" : "2px",
                background: [
                  "#3b82f6",
                  "#22c55e",
                  "#f59e0b",
                  "#ec4899",
                  "#8b5cf6",
                ][Math.floor(Math.random() * 5)],
                animation: `confettiFall ${1.5 + Math.random() * 2}s linear ${Math.random() * 1}s forwards`,
              }}
            />
          ))}
        </div>
      )}

      {/* Winner modal */}
      {showWinner && (
        <div className="fixed inset-0 z-[80] bg-black/60 flex items-center justify-center px-6">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm text-center shadow-2xl">
            <div className="text-5xl mb-3">🏆</div>
            <h2 className="text-2xl font-black text-gray-900">You Won!</h2>
            <p className="text-gray-500 text-sm mt-2">
              Congratulations! You won the auction.
            </p>
            <div className="mt-4 p-3 bg-blue-50 rounded-2xl">
              <p className="text-sm text-gray-600">
                Total Payable (Incl. Fees & GST)
              </p>
              <p className="text-2xl font-black text-blue-600">
                {fmt(totalPayable)}
              </p>
            </div>
            <p className="text-xs text-red-500 mt-3 font-semibold">
              Please complete payment within 30 minutes.
            </p>
            <button
              type="button"
              className="mt-4 w-full bg-blue-600 text-white font-bold rounded-2xl py-3 hover:bg-blue-700"
              onClick={onBack}
              data-ocid="auction.primary_button"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}

      {/* Extension overlay */}
      {showExtendOverlay && (
        <div className="fixed inset-0 z-[65] pointer-events-none flex items-center justify-center">
          <div className="bg-black/80 rounded-2xl px-6 py-4 text-center">
            <div className="text-4xl mb-1">⚡</div>
            <p className="text-yellow-300 font-black text-lg">Bid Received!</p>
            <p className="text-white text-sm">Auction Extended +1 Min</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-4 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="p-1.5 rounded-full bg-white/20"
              data-ocid="auction.close_button"
            >
              <ArrowLeft className="h-5 w-5 text-white" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-white font-black text-base leading-tight">
                  {listing.title}
                </h1>
                <span className="bg-green-400/30 border border-green-300 text-green-100 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  ✓ AI Verified
                </span>
              </div>
              <p className="text-blue-100 text-xs">
                77mobiles.pro · Silent Auction
              </p>
            </div>
          </div>
          {/* Timer */}
          <div className={`text-right ${timerPulse ? "animate-pulse" : ""}`}>
            <p
              className={`font-mono font-black text-2xl ${isFinalPhase ? "text-yellow-300" : "text-white"} ${auctionClosed ? "text-red-300" : ""}`}
            >
              {auctionClosed ? "00:00" : `${mins}:${secs}`}
            </p>
            <p className="text-blue-200 text-[10px]">
              {auctionClosed ? "ENDED" : extended ? "⚡ Extended" : "remaining"}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 py-4 space-y-4 max-w-lg mx-auto w-full">
        {/* Bento Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex flex-col items-center gap-2">
            <BatteryRing percent={92} />
            <p className="text-xs font-bold text-gray-700">Battery Health</p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex flex-col items-center justify-center gap-2">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <p className="text-xs font-bold text-gray-700 text-center">
              IMEI Verified
            </p>
            <p className="text-[10px] text-gray-400">35XXXXX0000X**1</p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex flex-col items-center justify-center gap-2">
            <div className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full">
              <span className="text-xs font-black text-white">Grade A</span>
            </div>
            <p className="text-xs font-bold text-gray-700">Cosmetic Grade</p>
            <p className="text-[10px] text-gray-400">Like New</p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex flex-col items-center justify-center gap-2">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-700 font-black text-sm">55/55</span>
            </div>
            <p className="text-xs font-bold text-gray-700 text-center">
              Functional Check
            </p>
            <p className="text-[10px] text-gray-400">All Systems Nominal</p>
          </div>
        </div>

        {/* Photo Carousel */}
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
            Inspection Photos
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {photos.map((label) => (
              <div
                key={label}
                className="shrink-0 w-20 h-20 rounded-xl bg-gray-100 border border-gray-200 flex flex-col items-center justify-center gap-1"
              >
                <div className="w-7 h-7 rounded-full bg-gray-200" />
                <p className="text-[9px] text-gray-400 text-center px-1 leading-tight">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Bidding Engine */}
        <div
          className={`rounded-2xl border p-4 ${isFinalPhase ? "bg-yellow-50 border-yellow-400" : "bg-white border-gray-200"}`}
        >
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
            Current High Bid
          </p>
          <p className="text-3xl font-black text-blue-600">{fmt(currentBid)}</p>
          {isFinalPhase && (
            <p className="text-xs text-yellow-700 font-semibold mt-1">
              ⚡ Final 5 Minutes — Priority Phase
            </p>
          )}

          {/* Bid log */}
          <div className="mt-3 space-y-1.5 max-h-28 overflow-y-auto">
            {bidLog.map((b, i) => (
              <div
                key={`bid-${i}-${b.amount}`}
                className="flex items-center justify-between text-xs"
                data-ocid={`auction.item.${i + 1}`}
              >
                <span className="text-gray-500">{b.dealer}</span>
                <span
                  className={`font-bold ${i === 0 ? "text-blue-600" : "text-gray-600"}`}
                >
                  {fmt(b.amount)}
                </span>
              </div>
            ))}
          </div>

          {/* Quick bid buttons */}
          <div className="flex gap-2 mt-3">
            {[100, 500, 1000].map((inc) => (
              <button
                key={inc}
                type="button"
                onClick={() => handleBid(inc)}
                disabled={auctionClosed}
                className="flex-1 py-2 rounded-xl border border-blue-300 bg-blue-50 text-blue-700 text-xs font-bold hover:bg-blue-100 transition-colors disabled:opacity-40"
                data-ocid="auction.toggle"
              >
                +{fmt(inc)}
              </button>
            ))}
          </div>
        </div>

        {/* Bid confirm overlay */}
        {bidConfirmed && (
          <div className="fixed inset-0 z-[64] pointer-events-none flex items-center justify-center">
            <div className="bg-green-600 text-white font-black px-6 py-3 rounded-2xl shadow-xl text-lg">
              ✓ Bid Confirmed!
            </div>
          </div>
        )}

        {/* Financial Footer */}
        <div className="bg-gray-50 rounded-2xl border border-gray-200 p-4">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
            Cost Breakdown
          </p>
          <div className="space-y-1.5">
            {[
              { label: "Current Bid", val: fmt(currentBid) },
              { label: `Sourcing Fee (~${fmt(fee)})`, val: `+${fmt(fee)}` },
              { label: "GST (18% on Fee)", val: `+${fmt(gstOnFee)}` },
            ].map((row) => (
              <div key={row.label} className="flex justify-between text-xs">
                <span className="text-gray-500">{row.label}</span>
                <span className="text-gray-700 font-semibold">{row.val}</span>
              </div>
            ))}
            <div className="flex justify-between text-sm font-black border-t border-gray-200 pt-2 mt-1">
              <span className="text-gray-900">Total Payable</span>
              <span className="text-blue-600">{fmt(totalPayable)}</span>
            </div>
          </div>
        </div>

        {/* Place Bid button */}
        <button
          type="button"
          onClick={() => handleBid(100)}
          disabled={auctionClosed}
          className={`w-full py-4 rounded-2xl font-black text-base transition-all ${
            auctionClosed
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white shadow-md"
          }`}
          data-ocid="auction.primary_button"
        >
          {auctionClosed ? "AUCTION CLOSED" : "Place Bid (+₹100)"}
        </button>
      </div>
    </div>
  );
}

type FilterTab = "all" | "live" | "7day";
type NavTab = "home" | "auctions" | "won" | "account";

export default function B2BBuyerPage() {
  const [listings, setListings] = useState<B2BListing[]>([]);
  const [filterTab, setFilterTab] = useState<FilterTab>("all");
  const [navTab, setNavTab] = useState<NavTab>("home");
  const [bidTarget, setBidTarget] = useState<B2BListing | null>(null);
  const [auctionDetail, setAuctionDetail] = useState<B2BListing | null>(null);
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

  if (auctionDetail) {
    return (
      <AuctionDetailView
        listing={auctionDetail}
        onBack={() => setAuctionDetail(null)}
      />
    );
  }

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
        @keyframes confettiFall {
          0% { transform: translateY(-10px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
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
                <button
                  key={listing.id}
                  type="button"
                  onClick={() => setAuctionDetail(listing)}
                  className="w-full text-left"
                >
                  <AuctionCard
                    listing={listing}
                    index={i}
                    onBid={(l) => {
                      setBidTarget(l);
                    }}
                    onInvoice={setInvoiceTarget}
                  />
                </button>
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
