import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Gavel,
  IndianRupee,
  Layers,
  ShoppingBag,
  Store,
  TrendingUp,
  X,
  XCircle,
} from "lucide-react";
import {
  DealerKycStatus,
  useGetMyDealerRegistration,
} from "../hooks/useQueries";

const DEALER_MODE_KEY = "77mobiles_dealer_mode";
const DEMO_KEY = "77mobiles_demo_dealer";

interface DemoDealer {
  type: string;
  name: string;
  mobile: string;
  kycStatus: string;
  isDemoUser: boolean;
}

function getDemoDealer(): DemoDealer | null {
  try {
    const raw = localStorage.getItem(DEMO_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.isDemoUser) return parsed as DemoDealer;
    return null;
  } catch {
    return null;
  }
}

const stats = [
  {
    label: "Total Listings",
    value: "12",
    icon: Layers,
    color: "text-blue-600",
  },
  {
    label: "Active Deals",
    value: "3",
    icon: TrendingUp,
    color: "text-green-600",
  },
  {
    label: "Devices Sold",
    value: "47",
    icon: ShoppingBag,
    color: "text-blue-500",
  },
  {
    label: "Earnings",
    value: "₹2.4L",
    icon: IndianRupee,
    color: "text-indigo-600",
  },
];

const recentActivity = [
  {
    device: "iPhone 15 Pro 256GB",
    buyer: "Rahul M.",
    status: "Deal Done",
    price: "₹89,000",
    statusColor: "text-green-600",
  },
  {
    device: "Samsung S24 Ultra",
    buyer: "Priya K.",
    status: "In Negotiation",
    price: "₹1,05,000",
    statusColor: "text-amber-600",
  },
  {
    device: "MacBook Air M2",
    buyer: "Arjun S.",
    status: "Awaiting Pickup",
    price: "₹92,000",
    statusColor: "text-blue-600",
  },
  {
    device: "OnePlus 12R 128GB",
    buyer: "Neha R.",
    status: "Listed",
    price: "₹38,500",
    statusColor: "text-gray-500",
  },
];

function KycStatusBanner({ demo }: { demo: DemoDealer | null }) {
  const { data: registration, isLoading } = useGetMyDealerRegistration();

  if (demo) {
    return (
      <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl p-4">
        <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-green-800">
            KYC Approved — Dealer account active
          </p>
          <p className="text-xs text-green-600 mt-0.5">
            Your dealer account has been verified and is fully active.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl p-4">
        <div className="h-5 w-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
        <p className="text-sm text-gray-500">Loading KYC status...</p>
      </div>
    );
  }

  if (!registration) {
    return (
      <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4">
        <AlertCircle className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-blue-800">
            Complete Your Dealer Registration
          </p>
          <p className="text-xs text-blue-600 mt-0.5">
            You haven't submitted a dealer registration yet.{" "}
            <Link
              to="/b2b"
              className="underline hover:text-blue-800 transition-colors"
            >
              Register at /b2b
            </Link>{" "}
            to activate your dealer account.
          </p>
        </div>
      </div>
    );
  }

  if (registration.kycStatus === DealerKycStatus.approved) {
    return (
      <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl p-4">
        <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-green-800">
            KYC Approved — Dealer account active
          </p>
          <p className="text-xs text-green-600 mt-0.5">
            Your dealer account has been verified and is fully active.
          </p>
        </div>
      </div>
    );
  }

  if (registration.kycStatus === DealerKycStatus.rejected) {
    return (
      <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
        <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-red-800">KYC Rejected</p>
          <p className="text-xs text-red-600 mt-0.5">
            Your KYC was rejected. Please contact support at
            support@77mobiles.in.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
      <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-semibold text-amber-800">
          KYC Verification Pending
        </p>
        <p className="text-xs text-amber-600 mt-0.5">
          Our team will verify within 24 hrs. You can still list devices.
        </p>
      </div>
    </div>
  );
}

export default function DealerDashboardPage() {
  const demo = getDemoDealer();

  const handleExit = () => {
    localStorage.setItem(DEALER_MODE_KEY, "false");
    localStorage.removeItem(DEMO_KEY);
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-[#f5f7fa] text-gray-900">
      {/* Top Banner */}
      <div className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-4">
        <div className="container mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-6 w-6 text-white" />
            <h1 className="text-xl font-black text-white tracking-tight">
              77mobiles.pro
            </h1>
            <Badge className="bg-white/20 text-white border border-white/30 font-semibold text-xs">
              ✦ Dealer Dashboard
            </Badge>
            {demo && (
              <Badge className="bg-white/20 text-white border border-white/30 font-semibold text-xs">
                Demo: {demo.name}
              </Badge>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExit}
            className="border-white/40 text-white hover:bg-white/10 hover:border-white/60 gap-1.5 bg-transparent"
            data-ocid="dealer.close_button"
          >
            <X className="h-3.5 w-3.5" />
            Exit Dealer Mode
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8 max-w-4xl">
        {/* KYC Notice */}
        <KycStatusBanner demo={demo} />

        {/* Portal Access Cards */}
        <div>
          <h2 className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-4">
            Your Portals
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link to="/b2b-seller">
              <Card
                className="group bg-white border-gray-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer h-full rounded-2xl"
                data-ocid="dealer.seller.card"
              >
                <CardContent className="p-6 flex flex-col gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center">
                    <Store className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-black text-gray-900 text-lg">
                      Seller Portal
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Post auction listings, track your bids, manage inventory
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-blue-600 text-sm font-semibold">
                    Open Seller Portal{" "}
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link to="/b2b-buyer">
              <Card
                className="group bg-white border-gray-200 hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer h-full rounded-2xl"
                data-ocid="dealer.buyer.card"
              >
                <CardContent className="p-6 flex flex-col gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center">
                    <Gavel className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-black text-gray-900 text-lg">
                      Buyer Portal
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Browse live auctions, place bids, win devices at best
                      prices
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-indigo-600 text-sm font-semibold">
                    Open Buyer Portal{" "}
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div>
          <h2 className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-4">
            Overview
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <Card
                key={stat.label}
                className="bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all rounded-2xl"
                data-ocid={`dealer.item.${i + 1}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                    <CheckCircle2 className="h-3 w-3 text-green-400" />
                  </div>
                  <p className={`text-2xl font-black ${stat.color}`}>
                    {stat.value}
                  </p>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    {stat.label}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-4">
            Recent Activity
          </h2>
          <Card className="bg-white border-gray-200 rounded-2xl shadow-sm">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm text-gray-700">
                Latest Transactions
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="space-y-3">
                {recentActivity.map((item, i) => (
                  <div
                    key={item.device}
                    className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                    data-ocid={`dealer.row.${i + 1}`}
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-gray-900">
                        {item.device}
                      </span>
                      <span className="text-xs text-gray-400">
                        Buyer: {item.buyer}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-blue-600">
                        {item.price}
                      </p>
                      <span
                        className={`text-[11px] font-semibold ${item.statusColor}`}
                      >
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
