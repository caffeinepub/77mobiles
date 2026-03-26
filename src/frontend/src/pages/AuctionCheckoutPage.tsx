import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Lock,
  MapPin,
  ShieldCheck,
  Smartphone,
  Timer,
  Truck,
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";

function fmt(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

const WINNING_BID = 23500;
const SOURCING_FEE = 450;
const GST = 81;
const TOTAL = WINNING_BID + SOURCING_FEE + GST;

export default function AuctionCheckoutPage() {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(1800);
  const [payMethod, setPayMethod] = useState<
    "wallet" | "rtgs" | "upi" | "card"
  >("upi");
  const [shipping, setShipping] = useState<"pickup" | "insured">("pickup");
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const id = setInterval(() => setTimeLeft((t) => Math.max(0, t - 1)), 1000);
    return () => clearInterval(id);
  }, [timeLeft]);

  const mins = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const secs = String(timeLeft % 60).padStart(2, "0");
  const isUrgent = timeLeft < 300;

  if (paid) {
    return (
      <div className="fixed inset-0 z-[80] bg-white flex flex-col items-center justify-center gap-6 px-6">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle2 className="h-10 w-10 text-green-600" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-black text-gray-900">
            Payment Successful!
          </h2>
          <p className="text-gray-500 mt-2 text-sm">
            GST Invoice sent to your email.
          </p>
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-8"
          onClick={() =>
            navigate({
              to: "/dealer/order/$orderId",
              params: { orderId: "ORD-779821" },
            })
          }
          data-ocid="checkout.primary_button"
        >
          Track Order
        </Button>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[80] bg-white flex flex-col overflow-y-auto"
      data-ocid="checkout.panel"
    >
      <div className="bg-green-700 px-4 py-4 shrink-0">
        <div className="flex items-center gap-3 mb-3">
          <button
            type="button"
            onClick={() => navigate({ to: "/dealer" })}
            className="p-1.5 rounded-full bg-white/20"
            data-ocid="checkout.close_button"
          >
            <ArrowLeft className="h-5 w-5 text-white" />
          </button>
          <h1 className="text-white font-black text-lg">Winner Checkout</h1>
        </div>
        <div className="flex items-center gap-4 bg-white/20 rounded-2xl p-4">
          <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
            <Smartphone className="h-8 w-8 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-white" />
              <span className="text-white font-black text-lg">
                Auction Won!
              </span>
            </div>
            <p className="text-green-100 text-sm">iPhone 13 128GB</p>
            <p className="text-white font-bold">{fmt(WINNING_BID)}</p>
          </div>
        </div>
      </div>

      <div
        className={`px-4 py-3 flex items-center gap-3 border-b ${isUrgent ? "bg-red-50 border-red-200" : "bg-amber-50 border-amber-200"}`}
        data-ocid="checkout.loading_state"
      >
        <Timer
          className={`h-5 w-5 ${isUrgent ? "text-red-500 animate-pulse" : "text-amber-600"}`}
        />
        <div className="flex-1">
          <p
            className={`text-sm font-bold ${isUrgent ? "text-red-700" : "text-amber-800"}`}
          >
            Payment window: {mins}:{secs}
          </p>
          <p className="text-xs text-gray-500">
            Failure to pay may result in account suspension
          </p>
        </div>
      </div>

      <div className="flex-1 px-4 py-5 space-y-5">
        <div>
          <h2 className="font-bold text-gray-900 mb-3">Financial Breakdown</h2>
          <div className="border border-gray-200 rounded-2xl overflow-hidden">
            <div className="divide-y divide-gray-100">
              {[
                { label: "Winning Bid", amount: fmt(WINNING_BID) },
                {
                  label: "Sourcing Fee (Tiered)",
                  amount: `+${fmt(SOURCING_FEE)}`,
                },
                { label: "GST (18% on Fee)", amount: `+${fmt(GST)}` },
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
                <span className="font-black text-gray-900">Total Payable</span>
                <span className="font-black text-blue-600 text-lg">
                  {fmt(TOTAL)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="font-bold text-gray-900 mb-3">Payment Method</h2>
          <div className="space-y-2" data-ocid="checkout.select">
            {(
              [
                {
                  id: "wallet" as const,
                  label: "77 Wallet",
                  sub: "Balance: ₹1,85,400",
                  icon: Wallet,
                },
                {
                  id: "rtgs" as const,
                  label: "RTGS / IMPS",
                  sub: "77mobiles Virtual A/C: 9234567890",
                  icon: CreditCard,
                },
                {
                  id: "upi" as const,
                  label: "UPI",
                  sub: "Pay via any UPI app",
                  icon: ShieldCheck,
                },
                {
                  id: "card" as const,
                  label: "Credit / Debit Card",
                  sub: "2% processing fee applies",
                  icon: CreditCard,
                },
              ] as const
            ).map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setPayMethod(m.id)}
                className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border transition-all text-left ${payMethod === m.id ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-white"}`}
                data-ocid={`checkout.${m.id}.radio`}
              >
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${payMethod === m.id ? "border-blue-600" : "border-gray-300"}`}
                >
                  {payMethod === m.id && (
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                  )}
                </div>
                <m.icon className="h-5 w-5 text-gray-500 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {m.label}
                  </p>
                  <p className="text-xs text-gray-500">{m.sub}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-bold text-gray-900 mb-3">Delivery Method</h2>
          <div className="grid grid-cols-2 gap-3">
            {(
              [
                {
                  id: "pickup" as const,
                  label: "Self Pickup",
                  sub: "Free · Visit hub",
                  icon: MapPin,
                },
                {
                  id: "insured" as const,
                  label: "Insured Shipping",
                  sub: "Calculated on distance",
                  icon: Truck,
                },
              ] as const
            ).map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setShipping(s.id)}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${shipping === s.id ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-white"}`}
                data-ocid={`checkout.${s.id}.toggle`}
              >
                <s.icon
                  className={`h-6 w-6 ${shipping === s.id ? "text-blue-600" : "text-gray-400"}`}
                />
                <div className="text-center">
                  <p className="text-sm font-semibold text-gray-900">
                    {s.label}
                  </p>
                  <p className="text-xs text-gray-500">{s.sub}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-bold text-gray-700">
              Registered Shop Address
            </span>
          </div>
          <p className="text-sm text-gray-600">
            Mobile World, Shop 14, Begumpet Market,
          </p>
          <p className="text-sm text-gray-600">Hyderabad — 500016, Telangana</p>
          <p className="text-xs text-gray-400 mt-1">GST: 36XXXXX0000X1Z5</p>
        </div>
      </div>

      <div className="px-4 pb-8 pt-3 border-t border-gray-100 bg-white shrink-0">
        <Button
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-base rounded-2xl h-14"
          onClick={() => setPaid(true)}
          data-ocid="checkout.submit_button"
        >
          <Lock className="h-4 w-4 mr-2" /> PAY NOW: {fmt(TOTAL)}
        </Button>
        <p className="text-center text-xs text-gray-400 mt-2">
          🔒 Secure SSL Encrypted · GST Invoice generated instantly
        </p>
      </div>
    </div>
  );
}
