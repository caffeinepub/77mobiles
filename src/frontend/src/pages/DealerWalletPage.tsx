import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  BadgeCheck,
  BarChart2,
  FileText,
  Plus,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useState } from "react";

function fmt(n: number) {
  return `₹${Math.abs(n).toLocaleString("en-IN")}`;
}

type FilterTab = "all" | "received" | "paid" | "fees";

const TRANSACTIONS = [
  {
    id: 1,
    type: "in",
    label: "Sale of iPhone 13 128GB",
    amount: 23500,
    date: "Today, 2:15 PM",
    hasPdf: true,
  },
  {
    id: 2,
    type: "out",
    label: "Sourcing Fee · Order #7782",
    amount: -450,
    date: "Today, 2:15 PM",
    hasPdf: true,
  },
  {
    id: 3,
    type: "fee",
    label: "GST (18%) on Sourcing Fee",
    amount: -81,
    date: "Today, 2:15 PM",
    hasPdf: false,
  },
  {
    id: 4,
    type: "in",
    label: "Sale of Samsung S23 Ultra",
    amount: 62000,
    date: "Yesterday, 11:30 AM",
    hasPdf: true,
  },
  {
    id: 5,
    type: "out",
    label: "Sourcing Fee · Order #7781",
    amount: -1300,
    date: "Yesterday, 11:30 AM",
    hasPdf: true,
  },
  {
    id: 6,
    type: "fee",
    label: "TCS (1%) · Order #7781",
    amount: -620,
    date: "Yesterday, 11:30 AM",
    hasPdf: false,
  },
  {
    id: 7,
    type: "in",
    label: "Sale of OnePlus 12 5G",
    amount: 38000,
    date: "22 Mar, 3:00 PM",
    hasPdf: true,
  },
  {
    id: 8,
    type: "out",
    label: "Sourcing Fee · Order #7780",
    amount: -1000,
    date: "22 Mar, 3:00 PM",
    hasPdf: true,
  },
  {
    id: 9,
    type: "fee",
    label: "GST (18%) on Sourcing Fee",
    amount: -180,
    date: "22 Mar, 3:00 PM",
    hasPdf: false,
  },
];

export default function DealerWalletPage() {
  const navigate = useNavigate();
  const [filterTab, setFilterTab] = useState<FilterTab>("all");
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");

  const filtered = TRANSACTIONS.filter((t) => {
    if (filterTab === "received") return t.type === "in";
    if (filterTab === "paid") return t.type === "out";
    if (filterTab === "fees") return t.type === "fee";
    return true;
  });

  return (
    <div
      className="fixed inset-0 z-[80] bg-[#f5f7fa] flex flex-col overflow-y-auto"
      data-ocid="wallet.panel"
    >
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-4 pt-4 pb-8 shrink-0">
        <div className="flex items-center gap-3 mb-4">
          <button
            type="button"
            onClick={() => navigate({ to: "/dealer" })}
            className="p-1.5 rounded-full bg-white/20"
            data-ocid="wallet.close_button"
          >
            <ArrowLeft className="h-5 w-5 text-white" />
          </button>
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-white" />
            <h1 className="text-white font-black text-lg">Financial Hub</h1>
          </div>
        </div>
        <div className="text-center">
          <p className="text-blue-200 text-sm">Available to Withdraw</p>
          <p className="text-white font-black text-4xl mt-1">₹1,85,400</p>
          <p className="text-blue-200 text-sm mt-1">
            Pending Escrow:{" "}
            <span className="font-semibold text-white">₹32,000</span>
          </p>
          <p className="text-blue-300 text-xs mt-0.5">
            Held during 24h no-claim window
          </p>
        </div>
        <div className="flex gap-3 mt-5">
          <Button
            className="flex-1 bg-white text-blue-600 hover:bg-blue-50 font-bold rounded-2xl gap-2"
            onClick={() => setShowWithdrawModal(true)}
            data-ocid="wallet.primary_button"
          >
            <ArrowUp className="h-4 w-4" /> Withdraw to Bank
          </Button>
          <Button
            variant="outline"
            className="flex-1 border-white/40 text-white hover:bg-white/10 font-bold rounded-2xl gap-2 bg-transparent"
            data-ocid="wallet.secondary_button"
          >
            <Plus className="h-4 w-4" /> Add Funds
          </Button>
        </div>
      </div>

      <div className="flex-1 px-4 -mt-4 space-y-4 max-w-lg mx-auto w-full pb-8">
        <div className="grid grid-cols-2 gap-3">
          {[
            {
              icon: TrendingUp,
              color: "text-green-600",
              bg: "bg-green-50",
              label: "Total Sales",
              value: "₹4,85,000",
              sub: "+12% this month",
            },
            {
              icon: TrendingDown,
              color: "text-blue-600",
              bg: "bg-blue-50",
              label: "Sourcing Savings",
              value: "₹12,400",
              sub: "vs. market price",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-white rounded-2xl border border-gray-200 p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <item.icon className={`h-4 w-4 ${item.color}`} />
                <span className="text-xs text-gray-500 font-semibold">
                  {item.label}
                </span>
              </div>
              <p className="text-xl font-black text-gray-900">{item.value}</p>
              <p className={`text-xs mt-0.5 ${item.color}`}>{item.sub}</p>
            </div>
          ))}
          <div className="bg-white rounded-2xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart2 className="h-4 w-4 text-indigo-600" />
              <span className="text-xs text-gray-500 font-semibold">
                Auctions
              </span>
            </div>
            <div className="flex items-end gap-2 mt-1">
              <div className="flex flex-col items-center gap-1">
                <div
                  className="w-6 bg-green-400 rounded-t"
                  style={{ height: "32px" }}
                />
                <span className="text-[9px] text-gray-400">Won</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div
                  className="w-6 bg-red-300 rounded-t"
                  style={{ height: "12px" }}
                />
                <span className="text-[9px] text-gray-400">Lost</span>
              </div>
            </div>
            <p className="text-xs text-gray-700 mt-1">
              <strong>23</strong> won · <strong>7</strong> lost
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <BadgeCheck className="h-4 w-4 text-green-600" />
              <span className="text-xs text-gray-500 font-semibold">
                KYC Status
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <ShieldCheck className="h-4 w-4 text-green-600" />
              <span className="text-xs font-bold text-green-700">Verified</span>
            </div>
            <p className="text-[10px] text-gray-400 mt-1">
              Aadhaar & GST Verified
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-4 pt-4 pb-2">
            <h2 className="font-bold text-gray-900 mb-3">
              Transaction History
            </h2>
            <div className="flex gap-2 overflow-x-auto" data-ocid="wallet.tab">
              {(["all", "received", "paid", "fees"] as FilterTab[]).map(
                (tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setFilterTab(tab)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${filterTab === tab ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                    data-ocid={`wallet.${tab}.tab`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ),
              )}
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {filtered.map((tx, i) => (
              <div
                key={tx.id}
                className="flex items-center gap-3 px-4 py-3"
                data-ocid={`wallet.item.${i + 1}`}
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${tx.type === "in" ? "bg-green-100" : "bg-red-100"}`}
                >
                  {tx.type === "in" ? (
                    <ArrowDown className="h-4 w-4 text-green-600" />
                  ) : (
                    <ArrowUp className="h-4 w-4 text-red-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {tx.label}
                  </p>
                  <p className="text-xs text-gray-400">{tx.date}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`font-bold text-sm ${tx.type === "in" ? "text-green-600" : "text-red-500"}`}
                  >
                    {tx.type === "in"
                      ? `+${fmt(tx.amount)}`
                      : `-${fmt(tx.amount)}`}
                  </span>
                  {tx.hasPdf && (
                    <button
                      type="button"
                      onClick={() => window.alert("PDF download simulated")}
                      className="text-gray-300 hover:text-blue-500"
                      data-ocid="wallet.upload_button"
                    >
                      <FileText className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="h-5 w-5 text-green-600" />
            <h2 className="font-bold text-gray-900">Verified Bank Account</h2>
          </div>
          <p className="text-sm text-gray-700 font-semibold">
            HDFC Bank ****4521
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            IFSC: HDFC0001234 · Auto-verified
          </p>
          <div className="flex items-center gap-1.5 mt-2">
            <BadgeCheck className="h-3.5 w-3.5 text-green-600" />
            <span className="text-xs text-green-700 font-semibold">
              Account Verified
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-100">
            Min withdrawal: ₹500 · Processing time: 24 hours
          </p>
        </div>

        <button
          type="button"
          className="w-full flex items-center justify-center gap-2 py-3 border border-red-200 text-red-600 hover:bg-red-50 rounded-2xl text-sm font-semibold transition-colors"
          data-ocid="wallet.delete_button"
        >
          <AlertTriangle className="h-4 w-4" /> Raise a Dispute
        </button>

        <p className="text-center text-xs text-gray-400">
          © {new Date().getFullYear()} 77mobiles.pro · Financial Hub
        </p>
      </div>

      {showWithdrawModal && (
        <div
          className="fixed inset-0 z-[90] bg-black/50 flex items-end"
          onClick={() => setShowWithdrawModal(false)}
          onKeyDown={(e) => e.key === "Escape" && setShowWithdrawModal(false)}
        >
          <div
            className="w-full bg-white rounded-t-3xl p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <h2 className="font-black text-gray-900 text-lg">
              Withdraw to Bank
            </h2>
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200">
              <p className="text-sm text-gray-700">HDFC Bank ****4521</p>
              <p className="text-xs text-gray-400">Verified account</p>
            </div>
            <div className="space-y-1">
              <label
                htmlFor="withdraw-amount"
                className="text-sm font-semibold text-gray-700"
              >
                Amount (min ₹500)
              </label>
              <input
                id="withdraw-amount"
                type="number"
                placeholder="Enter amount"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400"
                data-ocid="wallet.input"
              />
            </div>
            <p className="text-xs text-gray-400">
              Processing time: 24 hours. Funds credited to verified bank
              account.
            </p>
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold"
              onClick={() => setShowWithdrawModal(false)}
              data-ocid="wallet.confirm_button"
            >
              Confirm Withdrawal
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
