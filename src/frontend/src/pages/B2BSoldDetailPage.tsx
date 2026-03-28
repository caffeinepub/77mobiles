import { Button } from "@/components/ui/button";
import { useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle, MessageSquare, Shield } from "lucide-react";
import { toast } from "sonner";

export default function B2BSoldDetailPage() {
  const navigate = useNavigate();
  const { listingId } = useParams({ strict: false }) as { listingId: string };
  void listingId;

  return (
    <div className="min-h-screen bg-gray-50 pb-24" data-ocid="b2b_sold.panel">
      {/* Header */}
      <div className="sticky top-0 z-40 flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100">
        <button
          type="button"
          onClick={() => navigate({ to: "/b2b-seller" })}
          className="p-1.5 rounded-full hover:bg-gray-100"
          data-ocid="b2b_sold.close_button"
        >
          <ArrowLeft className="h-5 w-5 text-gray-700" />
        </button>
        <h1 className="font-bold text-gray-900 text-lg">Sale Details</h1>
      </div>

      {/* Success Banner */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-6 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white shadow-lg mb-3">
          <CheckCircle className="h-8 w-8 text-green-500" />
        </div>
        <p className="text-white font-bold text-lg">SOLD ✓</p>
        <p className="text-4xl font-bold text-white mt-1">₹1,08,500</p>
        <p className="text-green-100 text-sm mt-1">Final Sale Price</p>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Buyer Info */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
            Winning Buyer / Dealer
          </p>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
              R
            </div>
            <div className="flex-1">
              <p className="font-bold text-gray-900">Rajesh Kumar</p>
              <div className="flex items-center gap-1.5">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <span key={n} className="text-yellow-400 text-xs">
                      ★
                    </span>
                  ))}
                </div>
                <span className="text-xs text-gray-500">4.8</span>
                <span className="flex items-center gap-0.5 text-[10px] text-green-600 bg-green-100 px-1.5 py-0.5 rounded-full">
                  <Shield className="h-2.5 w-2.5" /> Verified
                </span>
              </div>
            </div>
          </div>
          <Button
            className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl gap-2"
            onClick={() => toast.success("Chat opening…")}
            data-ocid="b2b_sold.primary_button"
          >
            <MessageSquare className="h-4 w-4" /> Message Buyer
          </Button>
        </div>

        {/* Auction Timeline */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
            Auction Timeline
          </p>
          <div className="space-y-2">
            {[
              {
                label: "Starting Price",
                value: "₹1,00,000",
                color: "text-gray-600",
              },
              { label: "Total Bids", value: "14 Bids", color: "text-blue-600" },
              {
                label: "Final Bid",
                value: "₹1,08,500",
                color: "text-green-600 font-bold",
              },
              {
                label: "Sold Date",
                value: "Mar 27, 2026",
                color: "text-gray-500",
              },
            ].map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
              >
                <span className="text-sm text-gray-500">{row.label}</span>
                <span className={`text-sm ${row.color}`}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Handover Instructions */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <p className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-2">
            Handover Instructions
          </p>
          <p className="text-sm text-amber-800 leading-relaxed">
            Please coordinate with the buyer for pickup. Ensure the device is
            factory reset and all accounts (iCloud/Google) are removed. Document
            the handover with a photo.
          </p>
        </div>

        {/* Payment Status */}
        <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
            <span className="text-xl">🔒</span>
          </div>
          <div>
            <p className="text-sm font-bold text-green-700">Escrow Secured</p>
            <p className="text-xs text-gray-400">
              Funds held securely until device handover
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
