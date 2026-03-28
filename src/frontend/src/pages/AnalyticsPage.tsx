import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Lock, TrendingUp } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

function PriceGauge() {
  const marketLow = 68000;
  const marketHigh = 95000;
  const yourPrice = 79000;
  const pct = ((yourPrice - marketLow) / (marketHigh - marketLow)) * 100;

  return (
    <div
      className="bg-gray-900 rounded-2xl p-4 mb-3"
      data-ocid="analytics.panel"
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-bold text-white">📊 Price Benchmarking</p>
        <span className="text-xs font-bold bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">
          Fair Price
        </span>
      </div>
      <div className="relative h-8 mb-2">
        <div className="absolute inset-y-1/2 -translate-y-1/2 left-0 right-0 h-2 rounded-full bg-gray-700 overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-green-500 via-yellow-400 to-red-500" />
        </div>
        <div
          className="absolute top-0 -translate-x-1/2 flex flex-col items-center"
          style={{ left: `${pct}%` }}
        >
          <div className="w-4 h-4 rounded-full border-2 border-white bg-blue-500 shadow-lg" />
          <span className="text-[9px] text-white font-bold mt-0.5 whitespace-nowrap">
            Your ₹79K
          </span>
        </div>
      </div>
      <div className="flex justify-between text-[10px] text-gray-500 mb-3">
        <span>₹68K Underpriced</span>
        <span>Competitive</span>
        <span>Overpriced ₹95K</span>
      </div>
      <p className="text-xs text-yellow-300 bg-yellow-500/10 rounded-lg px-3 py-2">
        💡 Your price is 8% above local average. Drop to ₹75,000 for 3x more
        leads.
      </p>
      <p className="text-xs text-gray-400 mt-2">
        ⏱ Estimated Sale:{" "}
        <span className="text-white font-semibold">3–5 Days</span>
      </p>
    </div>
  );
}

function IntentFunnel() {
  const stages = [
    { label: "Impressions", value: 2840, pct: 100 },
    { label: "Clicks", value: 312, pct: 34 },
    { label: "High Intent", value: 47, pct: 14 },
  ];
  return (
    <div className="bg-gray-900 rounded-2xl p-4 mb-3">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-bold text-white">🎯 Buyer Intent Funnel</p>
        <span className="text-xs font-bold text-green-400 bg-green-500/20 px-2 py-0.5 rounded-full">
          CTR 4.2% — Above Avg
        </span>
      </div>
      <div className="space-y-2">
        {stages.map((s) => (
          <div key={s.label}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-400">{s.label}</span>
              <span className="text-white font-semibold">
                {s.value.toLocaleString()}
              </span>
            </div>
            <div className="h-5 bg-gray-800 rounded-lg overflow-hidden">
              <div
                className="h-full rounded-lg bg-gradient-to-r from-blue-500 to-cyan-400 flex items-center pl-2"
                style={{ width: `${s.pct}%` }}
              >
                <span className="text-[9px] font-bold text-white">
                  {s.pct}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SearchTerms() {
  const terms = [
    "5G",
    "Battery Health 90%",
    "Unused",
    "Titanium",
    "Pro Camera",
  ];
  return (
    <div className="bg-gray-900 rounded-2xl p-4 mb-3">
      <p className="text-sm font-bold text-white mb-3">
        🔍 Search Term Insights
      </p>
      <div className="flex flex-wrap gap-2">
        {terms.map((t) => (
          <span
            key={t}
            className="text-xs bg-blue-500/20 text-blue-300 border border-blue-500/30 px-3 py-1 rounded-full font-medium"
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

function DemandHeatmap() {
  const areas = [
    { name: "Banjara Hills", count: 42 },
    { name: "Hitech City", count: 38 },
    { name: "Jubilee Hills", count: 29 },
  ];
  const colors = ["bg-blue-500", "bg-blue-400", "bg-blue-300"];
  return (
    <div className="bg-gray-900 rounded-2xl p-4 mb-3">
      <p className="text-sm font-bold text-white mb-3">🗺️ Demand Heatmap</p>
      <div className="space-y-2">
        {areas.map((a, i) => (
          <div key={a.name} className="flex items-center gap-3">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${colors[i]} text-white`}
            >
              {i + 1}
            </div>
            <span className="text-sm text-gray-300 flex-1">{a.name}</span>
            <span className="text-xs text-gray-500">{a.count} searches</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TimeToSell() {
  const radius = 40;
  const circ = 2 * Math.PI * radius;
  const pct = 0.6;
  return (
    <div className="bg-gray-900 rounded-2xl p-4 mb-3 flex items-center gap-4">
      <svg
        width="100"
        height="100"
        viewBox="0 0 100 100"
        role="img"
        aria-label="Time to sell progress"
      >
        <title>Time to sell: 3-5 days</title>
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="#1f2937"
          strokeWidth="10"
        />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="10"
          strokeDasharray={`${circ * pct} ${circ * (1 - pct)}`}
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
        />
        <text
          x="50"
          y="45"
          textAnchor="middle"
          fill="white"
          fontSize="9"
          fontWeight="bold"
        >
          3–5
        </text>
        <text x="50" y="57" textAnchor="middle" fill="#9ca3af" fontSize="7">
          Days
        </text>
      </svg>
      <div>
        <p className="text-sm font-bold text-white">⏱ Time-to-Sell Predictor</p>
        <p className="text-xs text-gray-400 mt-1">
          Based on current views and price positioning
        </p>
        <p className="text-xs text-blue-400 mt-2 font-medium">
          Estimated Sale: 3–5 Days
        </p>
      </div>
    </div>
  );
}

const COMPETITORS = [
  { price: 76500, diff: -2500, condition: "Like New", battery: 92, daysAgo: 3 },
  { price: 77000, diff: -2000, condition: "Good", battery: 89, daysAgo: 7 },
  { price: 78500, diff: -500, condition: "Like New", battery: 95, daysAgo: 1 },
];

function MarketComparison() {
  return (
    <div className="bg-gray-900 rounded-2xl p-4 mb-3">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-bold text-white">
          🏆 Top Competitors in Hyderabad
        </p>
        <button
          type="button"
          className="text-xs text-blue-400"
          data-ocid="analytics.link"
        >
          View All
        </button>
      </div>
      <div className="space-y-2 mb-3">
        {COMPETITORS.map((c) => (
          <div
            key={c.price}
            className="flex items-center gap-3 bg-gray-800 rounded-xl p-3"
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-700 to-indigo-900 flex items-center justify-center text-lg shrink-0">
              📱
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">
                  ₹{c.price.toLocaleString()}
                </span>
                <span className="text-[10px] font-bold text-red-400 bg-red-500/20 px-1.5 py-0.5 rounded">
                  ₹{Math.abs(c.diff).toLocaleString()} Cheaper
                </span>
              </div>
              <div className="flex gap-1.5 mt-1 flex-wrap">
                <span className="text-[10px] bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">
                  {c.condition}
                </span>
                <span className="text-[10px] bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">
                  🔋 {c.battery}%
                </span>
                <span className="text-[10px] text-gray-500">
                  {c.daysAgo}d ago
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-400 mb-3">
        Your listing is currently the{" "}
        <span className="text-white font-semibold">4th cheapest</span> iPhone 15
        Pro in Hyderabad. Drop to{" "}
        <span className="text-blue-400 font-semibold">₹76,000</span> to become
        #1.
      </p>
      <div className="flex gap-2">
        <Button
          size="sm"
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
          onClick={() => toast.success("Price update dialog would open")}
          data-ocid="analytics.primary_button"
        >
          Update My Price
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800 rounded-xl"
          onClick={() => toast.success("Boost dialog would open")}
          data-ocid="analytics.secondary_button"
        >
          Boost Listing
        </Button>
      </div>
    </div>
  );
}

function SmartNegotiation() {
  const [aiOn, setAiOn] = useState(false);
  const [floorPrice, setFloorPrice] = useState("72000");
  const [passive, setPassive] = useState(true);
  const [aggressive, setAggressive] = useState(false);
  const strengthPct = Math.max(
    0,
    Math.min(100, ((Number(floorPrice) - 60000) / (90000 - 60000)) * 100),
  );

  return (
    <div
      className={`rounded-2xl p-4 mb-3 transition-all duration-300 ${aiOn ? "bg-gray-900 border-2 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)]" : "bg-gray-900 border-2 border-gray-700"}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm font-bold text-white">🤖 AI Smart Negotiator</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {aiOn
              ? "Auto-Pilot — AI accepts fair offers"
              : "Manual Mode — You handle all chats"}
          </p>
        </div>
        <Switch
          checked={aiOn}
          onCheckedChange={setAiOn}
          data-ocid="analytics.switch"
        />
      </div>

      {aiOn && (
        <div>
          <div className="flex items-center gap-2 bg-gray-800 rounded-xl p-3 mb-3">
            <Lock className="h-4 w-4 text-gray-400" />
            <div className="flex-1">
              <p className="text-xs text-gray-400">
                My Lowest Acceptable Price (Hidden from Buyers)
              </p>
              <input
                type="number"
                value={floorPrice}
                onChange={(e) => setFloorPrice(e.target.value)}
                className="bg-transparent text-white font-bold text-lg outline-none w-full"
                data-ocid="analytics.input"
              />
            </div>
          </div>
          <p className="text-xs text-blue-300 mb-3">
            💡 Based on analytics, ₹72,500 is the most likely closing price.
          </p>
          <div className="space-y-2 mb-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={passive}
                onChange={(e) => setPassive(e.target.checked)}
                className="w-4 h-4"
                data-ocid="analytics.checkbox"
              />
              <span className="text-xs text-gray-300">
                Passive Mode — AI only notifies me of fair offers
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={aggressive}
                onChange={(e) => setAggressive(e.target.checked)}
                className="w-4 h-4"
                data-ocid="analytics.checkbox"
              />
              <span className="text-xs text-gray-300">
                Aggressive Mode — AI auto-accepts first offer at floor price
              </span>
            </label>
          </div>
          <div>
            <div className="flex justify-between text-[10px] text-gray-500 mb-1">
              <span>High Chance Same-Day Sale</span>
              <span>Low Interest 10+ Days</span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-green-500 to-red-500"
                style={{ width: `${strengthPct}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AnalyticsPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-24">
      <div className="sticky top-0 z-40 flex items-center gap-3 px-4 py-3 border-b border-gray-800 bg-[#0a0a0a]">
        <button
          type="button"
          onClick={() => navigate({ to: "/my-ads" })}
          className="p-1.5 rounded-full hover:bg-gray-800"
          data-ocid="analytics.close_button"
        >
          <ArrowLeft className="h-5 w-5 text-white" />
        </button>
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-400" />
          <h1 className="font-bold text-white text-lg">Advanced Analytics</h1>
        </div>
      </div>

      <div className="px-4 py-4">
        <div className="mb-3 bg-gray-900 rounded-2xl p-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-700 to-indigo-900 flex items-center justify-center text-xl">
            📱
          </div>
          <div>
            <p className="text-sm font-bold text-white">iPhone 15 Pro 256GB</p>
            <p className="text-xs text-gray-400">
              Ward 32, Hyderabad • Posted 3 days ago
            </p>
          </div>
        </div>

        <PriceGauge />
        <IntentFunnel />
        <SearchTerms />
        <DemandHeatmap />
        <TimeToSell />
        <MarketComparison />
        <SmartNegotiation />
      </div>
    </div>
  );
}
