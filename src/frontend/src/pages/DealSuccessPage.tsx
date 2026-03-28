import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { CheckCircle, MapPin, MessageSquare, Shield } from "lucide-react";
import { useEffect, useState } from "react";

function ConfettiPiece({
  color,
  style,
}: { color: string; style: React.CSSProperties }) {
  return (
    <div
      className="absolute w-2 h-2 rounded-sm animate-bounce"
      style={{ background: color, ...style }}
    />
  );
}

export default function DealSuccessPage() {
  const navigate = useNavigate();
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowContent(true), 300);
    return () => clearTimeout(t);
  }, []);

  const confettiPieces = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    color: ["#FFD700", "#3B82F6", "#10B981", "#F59E0B", "#8B5CF6"][i % 5],
    style: {
      top: `${Math.random() * 40}%`,
      left: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 1}s`,
      animationDuration: `${0.8 + Math.random() * 0.6}s`,
    },
  }));

  return (
    <div
      className="min-h-screen bg-white overflow-hidden"
      data-ocid="deal.panel"
    >
      {/* Gradient Header */}
      <div className="relative bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-500 px-4 pt-12 pb-8 text-center overflow-hidden">
        {confettiPieces.map((p) => (
          <ConfettiPiece key={p.id} color={p.color} style={p.style} />
        ))}
        <div
          className={`transition-all duration-500 ${showContent ? "opacity-100 scale-100" : "opacity-0 scale-90"}`}
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white shadow-2xl mb-3">
            <CheckCircle className="h-10 w-10 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-white drop-shadow">
            Match Found by 77AI!
          </h1>
          <p className="text-white/80 text-sm mt-1">
            Your AI negotiator closed the deal
          </p>
        </div>
      </div>

      <div className="px-4 py-5">
        {/* Deal Breakdown */}
        <div className="bg-gray-50 rounded-2xl p-4 mb-4" data-ocid="deal.card">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">
            Deal Breakdown
          </p>
          <div className="text-3xl font-bold text-gray-900 mb-1">₹24,000</div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            Final agreed price
          </div>
          <div className="mt-3 bg-blue-50 rounded-xl p-3">
            <p className="text-xs text-blue-700">
              🤖 Our AI handled <strong>12 messages</strong> and rejected{" "}
              <strong>3 low-ball offers</strong> to get you this deal.
            </p>
          </div>
        </div>

        {/* Buyer Profile */}
        <div className="bg-gray-50 rounded-2xl p-4 mb-4">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">
            Winning Buyer
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
                  <Shield className="h-2.5 w-2.5" /> Verified Buyer
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2 mb-6">
          <Button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl gap-2"
            onClick={() => navigate({ to: "/messages" })}
            data-ocid="deal.primary_button"
          >
            <MessageSquare className="h-4 w-4" /> Open Chat to Coordinate
            Meeting
          </Button>
          <Button
            variant="outline"
            className="w-full rounded-xl gap-2 border-gray-200"
            onClick={() => navigate({ to: "/ev-charging" })}
            data-ocid="deal.secondary_button"
          >
            <MapPin className="h-4 w-4" /> View Safe Meeting Points
          </Button>
        </div>

        {/* Trust Footer */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
          <span className="font-bold">🔒 Stay Safe:</span> Keep your transaction
          safe. Never share OTPs or payment links outside of 77mobiles.
        </div>
      </div>
    </div>
  );
}
