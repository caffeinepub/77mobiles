import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { useNavigate } from "@tanstack/react-router";
import { AlertTriangle, ArrowLeft, Download, Shield } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface BoostItem {
  id: string;
  title: string;
  status: "active" | "paused";
  daysLeft: number;
  totalDays: number;
  autoRenew: boolean;
}

const BOOSTS: BoostItem[] = [
  {
    id: "1",
    title: "iPhone 15 Pro 256GB",
    status: "active",
    daysLeft: 4,
    totalDays: 7,
    autoRenew: false,
  },
  {
    id: "2",
    title: "Samsung Galaxy S24 Ultra",
    status: "active",
    daysLeft: 11,
    totalDays: 15,
    autoRenew: true,
  },
  {
    id: "3",
    title: "MacBook Air M3",
    status: "paused",
    daysLeft: 3,
    totalDays: 7,
    autoRenew: false,
  },
];

const TRANSACTIONS = [
  { date: "Mar 20, 2026", amount: 299, package: "7-Day Premium Boost" },
  { date: "Mar 10, 2026", amount: 499, package: "15-Day Featured Listing" },
];

export default function WalletPage() {
  const navigate = useNavigate();
  const [boosts, setBoosts] = useState(BOOSTS);

  const toggleAutoRenew = (id: string) => {
    setBoosts((prev) =>
      prev.map((b) => (b.id === id ? { ...b, autoRenew: !b.autoRenew } : b)),
    );
  };

  const activeCount = boosts.filter((b) => b.status === "active").length;

  return (
    <div className="min-h-screen bg-gray-50 pb-24" data-ocid="wallet.panel">
      {/* Header */}
      <div className="sticky top-0 z-40 flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100 shadow-sm">
        <button
          type="button"
          onClick={() => navigate({ to: "/profile" })}
          className="p-1.5 rounded-full hover:bg-gray-100"
          data-ocid="wallet.close_button"
        >
          <ArrowLeft className="h-5 w-5 text-gray-700" />
        </button>
        <div className="flex items-center gap-2 flex-1">
          <Shield className="h-5 w-5 text-blue-600" />
          <h1 className="font-bold text-gray-900 text-lg">
            My Wallet & Subscriptions
          </h1>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Active Boosts Summary */}
        <div className="bg-blue-600 rounded-2xl p-4 text-white">
          <p className="text-xs text-blue-200 uppercase tracking-wider">
            Active Boosts
          </p>
          <p className="text-3xl font-bold mt-1">{activeCount}</p>
          <p className="text-sm text-blue-200">Listings Currently Featured</p>
        </div>

        {/* Remaining Days List */}
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
            Boost Status
          </p>
          <div className="space-y-3">
            {boosts.map((b) => {
              const pct = Math.round((b.daysLeft / b.totalDays) * 100);
              const isWarning = b.daysLeft <= 1 && b.status === "active";
              return (
                <div
                  key={b.id}
                  className={`bg-white rounded-2xl p-4 border-2 ${isWarning ? "border-amber-300" : b.status === "paused" ? "border-gray-200" : "border-transparent"}`}
                  data-ocid={`wallet.item.${b.id}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-lg shrink-0">
                      📱
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-bold text-gray-900 truncate">
                          {b.title}
                        </p>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${b.status === "active" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}
                        >
                          {b.status === "active" ? "Active" : "Boost Paused"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {b.status === "paused"
                          ? "Repost listing to resume boost"
                          : `${b.daysLeft} Days ${b.daysLeft <= 1 ? "12 Hours" : ""} left`}
                      </p>
                      <div className="mt-2">
                        <Progress value={pct} className="h-1.5" />
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1.5">
                          <Switch
                            checked={b.autoRenew}
                            onCheckedChange={() => toggleAutoRenew(b.id)}
                            data-ocid="wallet.switch"
                          />
                          <span className="text-xs text-gray-400">
                            Auto-renew
                          </span>
                        </div>
                        {b.status === "paused" && (
                          <Button
                            size="sm"
                            className="h-6 text-[10px] bg-amber-500 hover:bg-amber-600 text-white px-2"
                            data-ocid="wallet.primary_button"
                          >
                            Renew Now
                          </Button>
                        )}
                        {isWarning && b.status === "active" && (
                          <div className="flex items-center gap-1 text-[10px] text-amber-600">
                            <AlertTriangle className="h-3 w-3" /> Expiring soon!
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Wallet Balance */}
        <div className="bg-white rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider">
              77Coins Balance
            </p>
            <p className="text-2xl font-bold text-gray-900">
              280 <span className="text-sm text-yellow-500">🪙</span>
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="rounded-xl border-blue-200 text-blue-600"
            onClick={() => toast.success("Top-up flow coming soon!")}
            data-ocid="wallet.secondary_button"
          >
            Top Up
          </Button>
        </div>

        {/* Transaction History */}
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
            Recent Activity
          </p>
          <div className="space-y-2">
            {TRANSACTIONS.map((tx) => (
              <div
                key={tx.package}
                className="bg-white rounded-2xl p-4 flex items-center justify-between"
                data-ocid="wallet.item.tx"
              >
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {tx.package}
                  </p>
                  <p className="text-xs text-gray-400">{tx.date}</p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-sm font-bold text-gray-900">
                    ₹{tx.amount}
                  </p>
                  <button
                    type="button"
                    onClick={() => toast.success("Invoice downloading…")}
                    className="p-1.5 rounded-full hover:bg-gray-100"
                    data-ocid="wallet.button"
                  >
                    <Download className="h-4 w-4 text-gray-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
