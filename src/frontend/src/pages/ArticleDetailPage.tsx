import { Button } from "@/components/ui/button";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  Bookmark,
  ChevronDown,
  ChevronUp,
  Share2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ARTICLES } from "./NewsPage";

export default function ArticleDetailPage() {
  const navigate = useNavigate();
  const { articleId } = useParams({ strict: false }) as { articleId: string };
  const article = ARTICLES.find((a) => a.id === articleId) ?? ARTICLES[0];

  const [carouselIdx, setCarouselIdx] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  const HERO_GRADIENTS = [
    "from-blue-700 to-indigo-900",
    "from-gray-700 to-gray-900",
    "from-violet-700 to-purple-900",
  ];

  const annotations = [
    { label: "50MP Periscope Lens", top: "30%", left: "20%" },
    { label: "Snapdragon 8 Gen 5", top: "55%", right: "15%" },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Carousel */}
      <div className="relative overflow-hidden" style={{ height: 280 }}>
        <div
          className={`w-full h-full bg-gradient-to-br ${HERO_GRADIENTS[carouselIdx]} flex items-center justify-center`}
        >
          <span className="text-6xl">📱</span>
        </div>

        {/* Annotations */}
        {annotations.map((ann) => (
          <div
            key={ann.label}
            className="absolute flex items-center gap-1 z-10"
            style={{
              top: ann.top,
              left: (ann as any).left,
              right: (ann as any).right,
            }}
          >
            <div className="text-[10px] font-bold bg-white/90 text-gray-900 px-2 py-0.5 rounded-full shadow text-nowrap">
              {ann.label}
            </div>
            <div className="w-4 h-px bg-white/80" />
            <div className="w-1.5 h-1.5 rounded-full bg-white" />
          </div>
        ))}

        <button
          type="button"
          onClick={() => navigate({ to: "/news" })}
          className="absolute top-4 left-4 p-2 rounded-full bg-black/40 text-white z-20"
          data-ocid="article.close_button"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="absolute top-4 right-4 flex gap-2 z-20">
          <button
            type="button"
            onClick={() => {
              setBookmarked(!bookmarked);
              toast.success(bookmarked ? "Removed from saved" : "Saved!");
            }}
            className={`p-2 rounded-full ${bookmarked ? "bg-blue-600" : "bg-black/40"} text-white`}
            data-ocid="article.toggle"
          >
            <Bookmark className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => toast.success("Link copied!")}
            className="p-2 rounded-full bg-black/40 text-white"
            data-ocid="article.secondary_button"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>

        {/* Carousel dots */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
          {HERO_GRADIENTS.map((grad, i) => (
            <button
              key={grad}
              type="button"
              onClick={() => setCarouselIdx(i)}
              className={`h-1.5 rounded-full transition-all ${i === carouselIdx ? "w-4 bg-white" : "w-1.5 bg-white/50"}`}
            />
          ))}
        </div>
      </div>

      {/* Content Card */}
      <div className="px-4 py-4">
        <h1 className="text-xl font-bold text-gray-900 leading-snug mb-1">
          {article.title}
        </h1>
        <p className="text-sm text-gray-400 mb-3">
          {article.author} • {article.timeAgo}
        </p>

        {/* Price Block */}
        <div className="flex items-center justify-between gap-3 bg-blue-50 rounded-xl p-3 mb-4">
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Marketplace Price</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-gray-900">₹45,000</span>
              <span className="text-sm text-gray-400 line-through">
                ₹51,000
              </span>
              <span className="text-xs font-bold text-green-600 bg-green-100 px-1.5 py-0.5 rounded">
                12% OFF
              </span>
            </div>
          </div>
          <Button
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shrink-0"
            data-ocid="article.primary_button"
          >
            ADD TO WATCHLIST
          </Button>
        </div>

        {/* Affiliate Cards */}
        <div className="space-y-2 mb-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Payment Offers
          </p>
          <a
            href="https://www.hsbc.co.in/credit-cards/?ref=77mobiles_affiliate"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 rounded-xl border-2 border-gray-100 hover:border-blue-200 transition-colors"
            data-ocid="article.link"
          >
            <div>
              <p className="text-sm font-bold text-gray-900">
                HSBC Credit Card
              </p>
              <p className="text-xs text-gray-500">
                5% cashback up to ₹3,000 on Electronics
              </p>
            </div>
            <span className="text-xs font-bold text-blue-600">Apply →</span>
          </a>
          <a
            href="https://www.swiggy.com/hdfc?ref=77mobiles_affiliate"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 rounded-xl border-2 border-gray-100 hover:border-blue-200 transition-colors"
            data-ocid="article.link"
          >
            <div>
              <p className="text-sm font-bold text-gray-900">
                Swiggy HDFC Card
              </p>
              <p className="text-xs text-gray-500">
                Extra ₹1,500 off on your next purchase
              </p>
            </div>
            <span className="text-xs font-bold text-blue-600">Apply →</span>
          </a>
        </div>

        {/* Article Expand Toggle */}
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 text-sm font-semibold text-blue-600 mb-3"
          data-ocid="article.toggle"
        >
          {expanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
          {expanded ? "Hide product details" : "View full article ▼"}
        </button>

        {expanded && (
          <div className="text-sm text-gray-600 leading-relaxed mb-4">
            <p>
              The upcoming device marks a significant leap in mobile
              photography. Engineering teams from Hyderabad and Bangalore
              collaborated on the new sensor array which combines a 50MP
              periscope module with optical image stabilization rated at 8-stop
              performance.
            </p>
            <br />
            <p>
              The new display architecture introduced this generation features a
              zero-gap bonding process that brings the touch layer within 0.1mm
              of the OLED panel — translating to an unprecedented 2ms stylus
              latency and virtually no parallax effect when writing notes.
            </p>
            <br />
            <p>
              Under the hood, the Snapdragon 8 Gen 5 brings a 12-core CPU
              configuration with an ARM v9.4 ISA upgrade, unlocking substantial
              gains in machine learning inference. Early benchmarks suggest a
              28% uplift in multi-core workloads compared to last year’s
              silicon.
            </p>
          </div>
        )}

        {article.linked_device_model && (
          <Button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl mb-4"
            onClick={() => navigate({ to: "/" })}
            data-ocid="article.primary_button"
          >
            Buy Refurbished {article.linked_device_model} in Hyderabad
          </Button>
        )}
      </div>
    </div>
  );
}
