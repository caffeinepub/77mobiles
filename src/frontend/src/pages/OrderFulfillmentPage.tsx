import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Circle,
  Download,
  ExternalLink,
  Package,
  QrCode,
  Smartphone,
  Truck,
} from "lucide-react";

const steps = [
  {
    id: 1,
    label: "Payment Confirmed",
    sub: "Payment of ₹24,031 received.",
    time: "Today, 11:42 AM",
    done: true,
  },
  {
    id: 2,
    label: "QC Verified",
    sub: "Device passed 55-point AI check at Warehouse.",
    time: "Today, 12:15 PM",
    done: true,
  },
  {
    id: 3,
    label: "Dispatched",
    sub: "Handed over to Delhivery · Tracking: 77A8B23X",
    time: "Today, 1:30 PM",
    done: true,
  },
  {
    id: 4,
    label: "Out for Delivery",
    sub: "Arriving at your shop today between 4–6 PM.",
    time: "Today, 3:45 PM",
    done: false,
  },
  {
    id: 5,
    label: "Delivered",
    sub: "Requires OTP or dealer signature on delivery.",
    time: "Pending",
    done: false,
  },
];

export default function OrderFulfillmentPage() {
  const navigate = useNavigate();

  return (
    <div
      className="fixed inset-0 z-[80] bg-[#f5f7fa] flex flex-col overflow-y-auto"
      data-ocid="order.panel"
    >
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-4 shrink-0">
        <div className="flex items-center gap-3 mb-2">
          <button
            type="button"
            onClick={() => navigate({ to: "/dealer" })}
            className="p-1.5 rounded-full bg-white/20"
            data-ocid="order.close_button"
          >
            <ArrowLeft className="h-5 w-5 text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-white font-black text-lg">Order #ORD-779821</h1>
            <p className="text-blue-100 text-xs">77mobiles.pro · Fulfillment</p>
          </div>
          <span className="bg-blue-400/40 text-white text-xs font-bold px-3 py-1.5 rounded-full">
            IN TRANSIT
          </span>
        </div>
      </div>

      <div className="flex-1 px-4 py-5 space-y-5 max-w-lg mx-auto w-full pb-8">
        <div className="bg-white rounded-2xl border border-gray-200 p-4 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center">
            <Smartphone className="h-7 w-7 text-gray-500" />
          </div>
          <div className="flex-1">
            <p className="font-black text-gray-900">iPhone 13 128GB</p>
            <p className="text-sm text-gray-500">IMEI: 35XXXXX0000X**1</p>
            <p className="text-xs text-blue-600 font-semibold mt-0.5">
              Winning Bid: ₹23,500
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Button
              size="sm"
              variant="outline"
              className="text-xs gap-1 rounded-xl"
              onClick={() => window.alert("PDF download simulated")}
              data-ocid="order.primary_button"
            >
              <Download className="h-3.5 w-3.5" /> GST Invoice
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-xs gap-1 rounded-xl"
              onClick={() => window.alert("QC report simulated")}
              data-ocid="order.secondary_button"
            >
              <ExternalLink className="h-3.5 w-3.5" /> QC Report
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Truck className="h-5 w-5 text-blue-600" /> Order Progress
          </h2>
          <div className="relative">
            <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-gray-200" />
            <div className="space-y-5">
              {steps.map((step) => (
                <div key={step.id} className="flex items-start gap-4">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 border-2 ${step.done ? "bg-green-500 border-green-500" : "bg-white border-gray-300"}`}
                    data-ocid={`order.item.${step.id}`}
                  >
                    {step.done ? (
                      <CheckCircle2 className="h-4 w-4 text-white" />
                    ) : (
                      <Circle className="h-4 w-4 text-gray-300" />
                    )}
                  </div>
                  <div className="flex-1 pt-0.5">
                    <p
                      className={`text-sm font-bold ${step.done ? "text-gray-900" : "text-gray-400"}`}
                    >
                      {step.label}
                    </p>
                    <p
                      className={`text-xs mt-0.5 ${step.done ? "text-gray-500" : "text-gray-300"}`}
                    >
                      {step.sub}
                    </p>
                    <p
                      className={`text-[10px] mt-0.5 font-semibold ${step.done ? "text-blue-500" : "text-gray-300"}`}
                    >
                      {step.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <QrCode className="h-5 w-5 text-blue-600" /> Pickup QR Code
          </h2>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center border border-gray-200">
              <QrCode className="h-10 w-10 text-gray-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-700">
                Present this QR at the 77mobiles Hub
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Begumpet Hub, Hyderabad · 9AM – 7PM
              </p>
              <Button
                size="sm"
                className="mt-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl gap-1 text-xs"
                onClick={() =>
                  window.open(
                    "https://maps.google.com/?q=Begumpet+Hyderabad",
                    "_blank",
                  )
                }
                data-ocid="order.map_marker"
              >
                <Package className="h-3.5 w-3.5" /> Navigate to Hub
              </Button>
            </div>
          </div>
        </div>

        <div className="border-2 border-red-400 rounded-2xl p-4 bg-red-50">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-black text-red-800 mb-1">
                ⚠️ IMPORTANT: Unboxing Video Required
              </p>
              <p className="text-xs text-red-700 leading-relaxed">
                You{" "}
                <strong>must record a continuous 360° unboxing video</strong> to
                claim any transit damage.{" "}
                <strong>No claims without video proof.</strong>
              </p>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 pb-4">
          © {new Date().getFullYear()} 77mobiles.pro
        </p>
      </div>
    </div>
  );
}
