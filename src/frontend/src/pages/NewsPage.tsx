import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";

interface Article {
  id: string;
  title: string;
  author: string;
  timeAgo: string;
  category: "News" | "Phones" | "Reviews" | "Deals" | "Videos";
  is_sponsored?: boolean;
  gradient: string;
  linked_device_model?: string;
}

const ARTICLES: Article[] = [
  {
    id: "1",
    title:
      "Samsung Galaxy S26 Ultra: First Leaked Specs Reveal 200MP Camera and 8000mAh Battery",
    author: "Rohit Sharma",
    timeAgo: "2h ago",
    category: "News",
    gradient: "from-blue-600 to-indigo-800",
    linked_device_model: "Samsung Galaxy S26",
  },
  {
    id: "2",
    title:
      "iPhone 17 Pro Display: Revolutionary Under-Screen Camera Finally Confirmed by Apple",
    author: "Priya Mehta",
    timeAgo: "4h ago",
    category: "Phones",
    is_sponsored: false,
    gradient: "from-gray-700 to-gray-900",
  },
  {
    id: "3",
    title:
      "Snapdragon 8 Gen 4: Qualcomm's Next Flagship Chip Benchmarks Shatter Records",
    author: "Arjun Das",
    timeAgo: "6h ago",
    category: "News",
    gradient: "from-violet-700 to-purple-900",
  },
  {
    id: "4",
    title:
      "Google Pixel 10 Pro Review: Tensor G5 Chip Finally Challenges Apple Silicon",
    author: "Neha Singh",
    timeAgo: "8h ago",
    category: "Reviews",
    gradient: "from-green-700 to-teal-900",
  },
  {
    id: "5",
    title:
      "OnePlus 13T: Leaked Renders Show Triple Periscope Camera and 100W Wireless Charging",
    author: "Vikram Rao",
    timeAgo: "12h ago",
    category: "Phones",
    gradient: "from-red-700 to-orange-800",
  },
  {
    id: "6",
    title:
      "Best Deals: Top 5 Refurbished iPhones Under ₹40,000 in Hyderabad This Week",
    author: "77mobiles Team",
    timeAgo: "1d ago",
    category: "Deals",
    is_sponsored: true,
    gradient: "from-blue-500 to-cyan-600",
  },
  {
    id: "7",
    title:
      "Nothing Phone 3a Pro: CMF Design Meets Flagship Performance in ₹25,000 Segment",
    author: "Ankit Joshi",
    timeAgo: "1d ago",
    category: "Phones",
    gradient: "from-zinc-700 to-zinc-900",
  },
  {
    id: "8",
    title:
      "MacBook Air M4: Leaked Benchmarks Show 40% Performance Jump Over M3 Baseline",
    author: "Deepa Reddy",
    timeAgo: "2d ago",
    category: "News",
    gradient: "from-slate-600 to-slate-800",
  },
  {
    id: "9",
    title:
      "Video: Hands-On with Xiaomi 15 Ultra — The Android Camera King for 2026?",
    author: "Ravi Kumar",
    timeAgo: "2d ago",
    category: "Videos",
    gradient: "from-orange-600 to-red-800",
  },
  {
    id: "10",
    title:
      "Apple Watch Ultra 3 vs Galaxy Watch Ultra: Battle of the Premium Smartwatches",
    author: "Sana Mirza",
    timeAgo: "2d ago",
    category: "Reviews",
    gradient: "from-cyan-600 to-blue-800",
  },
  {
    id: "11",
    title:
      "Realme GT 7 Pro Drops to ₹32,999: Best Value Flagship After 6 Months?",
    author: "Karan Tiwari",
    timeAgo: "3d ago",
    category: "Deals",
    is_sponsored: true,
    gradient: "from-yellow-600 to-amber-800",
  },
  {
    id: "12",
    title:
      "BREAKING: OnePlus Merges with OPPO India Division — What This Means for Buyers",
    author: "Tech Desk",
    timeAgo: "3d ago",
    category: "News",
    gradient: "from-rose-600 to-pink-900",
  },
  {
    id: "13",
    title:
      "Video Review: Sony Xperia 1 VII — The Last Bastion of 3.5mm Jack and Flat Display",
    author: "Priya Mehta",
    timeAgo: "4d ago",
    category: "Videos",
    gradient: "from-indigo-600 to-purple-800",
  },
  {
    id: "14",
    title:
      "Xiaomi HyperOS 2.0 Rolling Out: All Supported Devices and New Features Listed",
    author: "Arjun Das",
    timeAgo: "4d ago",
    category: "News",
    gradient: "from-orange-700 to-red-900",
  },
  {
    id: "15",
    title:
      "Top 10 Best Gaming Phones Under ₹50,000 in India — May 2026 Edition",
    author: "Rohit Sharma",
    timeAgo: "5d ago",
    category: "Reviews",
    gradient: "from-green-600 to-emerald-900",
  },
  {
    id: "16",
    title:
      "Exclusive: Samsung Galaxy Z Fold 7 Design Leaked — Thinner and Lighter Than Ever",
    author: "Neha Singh",
    timeAgo: "5d ago",
    category: "Phones",
    gradient: "from-blue-700 to-indigo-900",
  },
  {
    id: "17",
    title:
      "JioBharat 5G Phone at ₹1,999: Could This Be India's Most Affordable 5G Handset?",
    author: "Vikram Rao",
    timeAgo: "6d ago",
    category: "News",
    gradient: "from-teal-600 to-cyan-900",
  },
  {
    id: "18",
    title:
      "77mobiles Sponsored: Certified Refurbished iPhones — Grade A Quality Guaranteed",
    author: "77mobiles Team",
    timeAgo: "6d ago",
    category: "Deals",
    is_sponsored: true,
    gradient: "from-blue-500 to-blue-700",
  },
  {
    id: "19",
    title:
      "iOS 20 Concept: AI-Powered Dynamic Island, Siri 3.0 and Live Transcription",
    author: "Deepa Reddy",
    timeAgo: "1w ago",
    category: "News",
    gradient: "from-gray-600 to-gray-900",
  },
  {
    id: "20",
    title:
      "Samsung Galaxy Buds 4 Pro vs AirPods Pro 3: Which Earbuds Win in 2026?",
    author: "Sana Mirza",
    timeAgo: "1w ago",
    category: "Reviews",
    gradient: "from-violet-600 to-purple-900",
  },
];

const TABS = ["All", "News", "Phones", "Reviews", "Deals", "Videos"] as const;
type Tab = (typeof TABS)[number];

export default function NewsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("All");

  const filtered =
    activeTab === "All"
      ? ARTICLES
      : ARTICLES.filter((a) => a.category === activeTab);

  return (
    <div className="min-h-screen" style={{ background: "#0D1117" }}>
      {/* Header */}
      <div
        className="sticky top-0 z-40 flex items-center gap-3 px-4 py-3 border-b border-gray-800"
        style={{ background: "#0D1117" }}
      >
        <button
          type="button"
          onClick={() => navigate({ to: "/" })}
          className="p-1.5 rounded-full hover:bg-gray-800 transition-colors"
          data-ocid="news.close_button"
        >
          <ArrowLeft className="h-5 w-5 text-white" />
        </button>
        <div>
          <h1 className="font-bold text-white text-lg leading-tight">
            Tech Hub
          </h1>
          <p className="text-[11px] text-gray-400">Latest mobile tech news</p>
        </div>
      </div>

      {/* Tab Bar */}
      <div
        className="flex gap-1 overflow-x-auto px-3 py-2 border-b border-gray-800 scrollbar-hide"
        style={{ background: "#0D1117" }}
      >
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              activeTab === tab
                ? "bg-blue-600 text-white"
                : "text-gray-400 hover:text-white bg-gray-800/60"
            }`}
            data-ocid="news.tab"
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Article List */}
      <div className="divide-y divide-gray-800/60">
        {filtered.map((article, i) => (
          <button
            key={article.id}
            type="button"
            onClick={() =>
              navigate({
                to: "/news/$articleId",
                params: { articleId: article.id },
              })
            }
            className="w-full text-left px-4 py-3 flex gap-3 items-start hover:bg-gray-800/30 transition-colors"
            data-ocid={`news.item.${i + 1}`}
          >
            {/* Thumbnail */}
            <div className="relative shrink-0">
              <div
                className={`w-20 h-20 rounded-xl bg-gradient-to-br ${article.gradient} flex items-center justify-center`}
              >
                <span className="text-2xl">
                  {article.category === "Videos" ? "▶" : "📱"}
                </span>
              </div>
              {article.is_sponsored && (
                <div className="absolute top-1 left-1 bg-gray-700/90 text-gray-200 text-[9px] font-bold px-1.5 py-0.5 rounded">
                  Sponsored
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p
                className="text-white text-sm font-semibold leading-snug line-clamp-3 mb-1"
                style={{
                  color: article.category === "Deals" ? "#60A5FA" : "white",
                }}
              >
                {article.title}
              </p>
              <p className="text-[11px] text-gray-500">
                {article.author} • {article.timeAgo}
              </p>
              <span className="inline-block mt-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-800 text-gray-400">
                {article.category}
              </span>
            </div>
          </button>
        ))}
      </div>

      <div className="h-8" />
    </div>
  );
}

export { ARTICLES };
