import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Clock, Edit, Trash2, Zap } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function B2BListingDetailPage() {
  const navigate = useNavigate();
  const [carouselIdx, setCarouselIdx] = useState(0);

  const GRADIENTS = [
    "from-blue-700 to-indigo-900",
    "from-gray-600 to-gray-800",
    "from-violet-700 to-purple-900",
  ];

  const specs = [
    { label: "Model", value: "iPhone 17 Pro" },
    { label: "Storage", value: "256GB" },
    { label: "Battery Health", value: "92%" },
    { label: "Warranty", value: "3 Months" },
    { label: "Condition", value: "Like New" },
    { label: "Color", value: "Natural Titanium" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-24" data-ocid="b2b_detail.panel">
      {/* Photo Carousel */}
      <div className="relative" style={{ height: 260 }}>
        <div
          className={`w-full h-full bg-gradient-to-br ${GRADIENTS[carouselIdx]} flex items-center justify-center`}
        >
          <span className="text-7xl">📱</span>
        </div>
        <button
          type="button"
          onClick={() => navigate({ to: "/b2b-seller" })}
          className="absolute top-4 left-4 p-2 rounded-full bg-black/40 text-white z-10"
          data-ocid="b2b_detail.close_button"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {GRADIENTS.map((g, idx) => (
            <button
              key={g}
              type="button"
              onClick={() => setCarouselIdx(idx)}
              className={`h-1.5 rounded-full transition-all ${idx === carouselIdx ? "w-4 bg-white" : "w-1.5 bg-white/50"}`}
            />
          ))}
        </div>
      </div>

      <div className="px-4 py-4">
        {/* Status Bar */}
        <div className="flex gap-2 mb-4 flex-wrap">
          <span className="text-xs font-bold bg-green-100 text-green-700 px-3 py-1.5 rounded-full">
            ✓ Like New
          </span>
          <span className="text-xs font-bold bg-orange-100 text-orange-700 px-3 py-1.5 rounded-full flex items-center gap-1">
            <Clock className="h-3 w-3" /> Live 20min
          </span>
          <span className="text-xs font-bold bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full">
            Bids: 3
          </span>
          <span className="text-xs font-bold bg-purple-100 text-purple-700 px-3 py-1.5 rounded-full flex items-center gap-1">
            <Zap className="h-3 w-3" /> 77mobiles Pro Certified
          </span>
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
          <p className="text-xs text-gray-400 mb-1">Base Price</p>
          <p className="text-3xl font-bold text-gray-900">₹1,10,000</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-gray-500">Current High Bid:</span>
            <span className="text-sm font-bold text-blue-600">₹1,12,500</span>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
            Description
          </p>
          <p className="text-sm text-gray-700 leading-relaxed">
            iPhone 17 Pro in Like New condition. Minor scuff on back glass near
            camera bump — fully functional, 100% screen pass. Original charger
            and box included. iCloud removed and factory reset. USB-verified by
            77mobiles Pro diagnostic system.
          </p>
        </div>

        {/* Specs Table */}
        <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
            Product Specs
          </p>
          <div className="grid grid-cols-2 gap-2">
            {specs.map((s) => (
              <div key={s.label} className="bg-gray-50 rounded-xl p-3">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">
                  {s.label}
                </p>
                <p className="text-sm font-bold text-gray-900 mt-0.5">
                  {s.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fixed Bottom Bar */}
      <div
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 flex gap-2"
        data-ocid="b2b_detail.panel"
      >
        <Button
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl gap-1.5"
          onClick={() => toast.success("Edit listing dialog would open")}
          data-ocid="b2b_detail.edit_button"
        >
          <Edit className="h-4 w-4" /> Edit Listing
        </Button>
        <Button
          variant="outline"
          className="flex-1 border-gray-200 rounded-xl text-xs"
          onClick={() => toast.success("Moving to 7-day auction")}
          data-ocid="b2b_detail.secondary_button"
        >
          Move to 7-Day Auction
        </Button>
        <Button
          variant="outline"
          className="border-red-200 text-red-600 hover:bg-red-50 rounded-xl px-3"
          onClick={() => toast.error("Delete confirmation would appear")}
          data-ocid="b2b_detail.delete_button"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
