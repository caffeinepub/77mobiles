import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowLeft,
  Clock,
  ShieldCheck,
  Smartphone,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";

function fmt(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

const SECOND_BID = 23200;
const SOURCING_FEE = 400;
const GST_AMT = 72;
const TOTAL = SECOND_BID + SOURCING_FEE + GST_AMT;

export default function SecondChancePage() {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(900);
  const [declined, setDeclined] = useState(false);
  const [showDeclineDialog, setShowDeclineDialog] = useState(false);
  const [claimed, setClaimed] = useState(false);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const id = setInterval(() => setTimeLeft((t) => Math.max(0, t - 1)), 1000);
    return () => clearInterval(id);
  }, [timeLeft]);

  const mins = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const secs = String(timeLeft % 60).padStart(2, "0");

  if (declined)
    return (
      <div className="fixed inset-0 z-[80] bg-white flex flex-col items-center justify-center gap-5 px-6 text-center">
        <span className="text-5xl">📦</span>
        <h2 className="text-xl font-black text-gray-900">Offer Declined</h2>
        <p className="text-gray-500 text-sm max-w-xs">
          This device has been returned to the auction pool for the next cycle.
        </p>
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-8"
          onClick={() => navigate({ to: "/b2b-buyer" })}
          data-ocid="second.primary_button"
        >
          Browse Auctions
        </Button>
      </div>
    );

  if (claimed)
    return (
      <div className="fixed inset-0 z-[80] bg-white flex flex-col items-center justify-center gap-5 px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
          <ShieldCheck className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-xl font-black text-gray-900">Stock Claimed!</h2>
        <p className="text-gray-500 text-sm max-w-xs">
          Proceed to payment to secure your device.
        </p>
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-8"
          onClick={() =>
            navigate({
              to: "/dealer/checkout/$auctionId",
              params: { auctionId: "second" },
            })
          }
          data-ocid="second.submit_button"
        >
          Proceed to Payment
        </Button>
      </div>
    );

  return (
    <>
      <div
        className="fixed inset-0 z-[80] bg-white flex flex-col overflow-y-auto"
        data-ocid="second.panel"
      >
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-4 shrink-0">
          <div className="flex items-center gap-3 mb-1">
            <button
              type="button"
              onClick={() => navigate({ to: "/dealer" })}
              className="p-1.5 rounded-full bg-white/20"
              data-ocid="second.close_button"
            >
              <ArrowLeft className="h-5 w-5 text-white" />
            </button>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-300" />
              <h1 className="text-white font-black text-lg">
                Second Chance Offer
              </h1>
            </div>
          </div>
          <p className="text-blue-100 text-sm pl-10">
            77mobiles.pro · Exclusive for you
          </p>
        </div>

        <div
          className="px-4 py-3 bg-red-50 border-b border-red-200 flex items-center gap-3"
          data-ocid="second.loading_state"
        >
          <Clock className="h-5 w-5 text-red-500 animate-pulse" />
          <div>
            <p className="text-sm font-black text-red-700">
              Offer expires in: {mins}:{secs}
            </p>
            <p className="text-xs text-gray-500">
              This stock is locked exclusively for you
            </p>
          </div>
        </div>

        <div className="flex-1 px-4 py-5 space-y-5">
          <div className="relative bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden">
            <div className="bg-yellow-400 text-center py-1">
              <span className="text-xs font-black text-yellow-900 uppercase tracking-widest">
                ⚡ Second Chance — Exclusive Flash Offer
              </span>
            </div>
            <div className="flex items-center gap-4 p-4">
              <div className="w-16 h-16 rounded-xl bg-gray-200 flex items-center justify-center">
                <Smartphone className="h-8 w-8 text-gray-500" />
              </div>
              <div>
                <p className="font-black text-gray-900">iPhone 13 128GB</p>
                <p className="text-sm text-gray-500">Grade A · Space Gray</p>
                <p className="text-sm font-bold text-blue-600 mt-0.5">
                  Your last bid: {fmt(SECOND_BID)}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 bg-amber-50 border border-amber-200 rounded-2xl">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800">
              <strong>Original winner flagged</strong> for non-payment. Stock is
              now exclusively yours for 15 minutes.
            </p>
          </div>

          <div>
            <h2 className="font-bold text-gray-900 mb-3">
              Fair Play Financials
            </h2>
            <div className="border border-gray-200 rounded-2xl overflow-hidden">
              <div className="divide-y divide-gray-100">
                {[
                  { label: "Your Last Bid", amount: fmt(SECOND_BID) },
                  {
                    label: "Sourcing Fee (Recalculated)",
                    amount: `+${fmt(SOURCING_FEE)}`,
                  },
                  { label: "GST (18% on Fee)", amount: `+${fmt(GST_AMT)}` },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex justify-between px-4 py-3 text-sm"
                  >
                    <span className="text-gray-600">{row.label}</span>
                    <span className="font-semibold text-gray-900">
                      {row.amount}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between px-4 py-3 bg-blue-50">
                  <span className="font-black text-gray-900">
                    Total Payable
                  </span>
                  <span className="font-black text-blue-600 text-lg">
                    {fmt(TOTAL)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 pb-8 pt-3 border-t border-gray-100 bg-white shrink-0 space-y-3">
          <Button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-base rounded-2xl h-14"
            onClick={() => setClaimed(true)}
            data-ocid="second.confirm_button"
          >
            <Zap className="h-4 w-4 mr-2" /> Claim Stock & Pay: {fmt(TOTAL)}
          </Button>
          <button
            type="button"
            className="w-full text-sm text-gray-400 hover:text-gray-600 py-2"
            onClick={() => setShowDeclineDialog(true)}
            data-ocid="second.cancel_button"
          >
            Decline this offer
          </button>
        </div>
      </div>

      <Dialog open={showDeclineDialog} onOpenChange={setShowDeclineDialog}>
        <DialogContent className="max-w-sm" data-ocid="second.dialog">
          <DialogHeader>
            <DialogTitle>Decline Second Chance?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            This device will be returned to the general auction pool. This
            cannot be undone.
          </p>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDeclineDialog(false)}
              data-ocid="second.close_button"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setShowDeclineDialog(false);
                setDeclined(true);
              }}
              data-ocid="second.confirm_button"
            >
              Yes, Decline
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
