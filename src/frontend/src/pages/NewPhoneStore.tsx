import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Heart,
  Search,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

export interface AffiliateProduct {
  id: number;
  product_name: string;
  image: string;
  original_price: number;
  sale_price: number;
  discount_pct: number;
  retailer_tag: string;
  affiliate_url: string;
  is_active: boolean;
  show_low_stock_badge: boolean;
  category: string;
}

const SEED_PRODUCTS: AffiliateProduct[] = [
  {
    id: 1,
    product_name: "Apple iPhone 15 - Refurbished",
    image: "",
    original_price: 89999,
    sale_price: 34999,
    discount_pct: 61,
    retailer_tag: "Amazon",
    affiliate_url: "https://www.amazon.in/dp/B0CHX1W1XY",
    is_active: true,
    show_low_stock_badge: true,
    category: "Flagship",
  },
  {
    id: 2,
    product_name: "Samsung Galaxy S24 - Refurbished",
    image: "",
    original_price: 79999,
    sale_price: 29999,
    discount_pct: 63,
    retailer_tag: "Flipkart",
    affiliate_url: "https://www.flipkart.com/samsung-galaxy-s24",
    is_active: true,
    show_low_stock_badge: false,
    category: "Flagship",
  },
  {
    id: 3,
    product_name: "OnePlus 12R - New",
    image: "",
    original_price: 39999,
    sale_price: 28999,
    discount_pct: 28,
    retailer_tag: "Amazon",
    affiliate_url: "https://www.amazon.in/dp/oneplus12r",
    is_active: true,
    show_low_stock_badge: true,
    category: "Budget",
  },
  {
    id: 4,
    product_name: "Apple iPhone 14 - Refurbished",
    image: "",
    original_price: 69999,
    sale_price: 24999,
    discount_pct: 64,
    retailer_tag: "Amazon",
    affiliate_url: "https://www.amazon.in/dp/iphone14",
    is_active: true,
    show_low_stock_badge: false,
    category: "Flagship",
  },
  {
    id: 5,
    product_name: "Poco X6 Pro - New",
    image: "",
    original_price: 26999,
    sale_price: 19999,
    discount_pct: 26,
    retailer_tag: "Flipkart",
    affiliate_url: "https://www.flipkart.com/poco-x6-pro",
    is_active: true,
    show_low_stock_badge: true,
    category: "Gaming",
  },
];

const AFFILIATE_TAG = "77mobiles-21";
const STORAGE_KEY = "affiliateProducts";
const CLICKS_KEY = "affiliateClicks";

export function getAffiliateProducts(): AffiliateProduct[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored) as AffiliateProduct[];
  } catch {
    // ignore
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_PRODUCTS));
  return SEED_PRODUCTS;
}

export function saveAffiliateProducts(products: AffiliateProduct[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

export interface AffiliateClick {
  productId: number;
  productName: string;
  retailer: string;
  timestamp: string;
}

function logAffiliateClick(product: AffiliateProduct) {
  try {
    const existing: AffiliateClick[] = JSON.parse(
      localStorage.getItem(CLICKS_KEY) ?? "[]",
    );
    existing.unshift({
      productId: product.id,
      productName: product.product_name,
      retailer: product.retailer_tag,
      timestamp: new Date().toISOString(),
    });
    localStorage.setItem(CLICKS_KEY, JSON.stringify(existing.slice(0, 200)));
  } catch {
    // ignore
  }
}

const CATEGORY_COLORS: Record<string, string> = {
  Flagship: "#6366f1",
  Budget: "#10b981",
  Gaming: "#f59e0b",
  "Mid-Range": "#3b82f6",
};

const RETAILER_COLORS: Record<string, string> = {
  Amazon: "#ff9900",
  Flipkart: "#2874f0",
  Meesho: "#f43397",
  Croma: "#1dad2b",
};

function PhonePlaceholder({
  category,
}: {
  category: string;
}) {
  const bg = CATEGORY_COLORS[category] ?? "#4f46e5";
  return (
    <div
      className="w-full h-full rounded-xl flex items-center justify-center"
      style={{ background: `linear-gradient(135deg, ${bg}22, ${bg}44)` }}
    >
      <span className="text-4xl">📱</span>
    </div>
  );
}

function ProductCard({ product }: { product: AffiliateProduct }) {
  const handleBuyClick = () => {
    logAffiliateClick(product);
    const url = product.affiliate_url.includes("?")
      ? `${product.affiliate_url}&tag=${AFFILIATE_TAG}`
      : `${product.affiliate_url}?tag=${AFFILIATE_TAG}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-3 p-3 rounded-2xl"
      style={{
        background: "rgba(255,255,255,0.08)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.15)",
      }}
      data-ocid="phones.card"
    >
      {/* Left: Image */}
      <div className="relative shrink-0 w-24 h-24 bg-white rounded-xl overflow-hidden">
        {product.image ? (
          <img
            src={product.image}
            alt={product.product_name}
            className="w-full h-full object-cover"
          />
        ) : (
          <PhonePlaceholder category={product.category} />
        )}
        {product.show_low_stock_badge && (
          <div className="absolute bottom-1 left-1 right-1">
            <span className="block text-center text-[9px] font-bold text-white bg-red-500 rounded-full px-1 py-0.5 leading-tight">
              Only 1 left
            </span>
          </div>
        )}
      </div>

      {/* Right: Details */}
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        {/* Top row: discount + retailer */}
        <div className="flex items-center gap-2">
          <span className="bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">
            {product.discount_pct}% OFF
          </span>
          <span
            className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
            style={{
              background: `${RETAILER_COLORS[product.retailer_tag] ?? "#6366f1"}22`,
              color: RETAILER_COLORS[product.retailer_tag] ?? "#a5b4fc",
              border: `1px solid ${RETAILER_COLORS[product.retailer_tag] ?? "#6366f1"}44`,
            }}
          >
            {product.retailer_tag}
          </span>
        </div>

        {/* Title */}
        <p className="text-white text-sm font-semibold leading-snug truncate">
          {product.product_name}
        </p>

        {/* Prices */}
        <div className="flex items-baseline gap-2">
          <span className="text-white text-lg font-bold">
            ₹{product.sale_price.toLocaleString("en-IN")}
          </span>
          <span className="text-gray-400 text-xs line-through">
            ₹{product.original_price.toLocaleString("en-IN")}
          </span>
        </div>

        {/* CTA */}
        <button
          type="button"
          onClick={handleBuyClick}
          className="mt-auto self-start px-3 py-1.5 rounded-full text-xs font-bold bg-blue-500 text-white hover:bg-blue-400 transition-colors"
          data-ocid="phones.primary_button"
        >
          Check Best Price
        </button>
      </div>
    </motion.div>
  );
}

const CATEGORIES = ["All", "Flagship", "Budget", "Gaming", "Mid-Range"];

export default function NewPhoneStore() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<AffiliateProduct[]>([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [cartCount] = useState(0);

  useEffect(() => {
    setProducts(getAffiliateProducts());
  }, []);

  const filtered = products.filter((p) => {
    if (!p.is_active) return false;
    const matchesCategory =
      activeCategory === "All" || p.category === activeCategory;
    const matchesSearch =
      search === "" ||
      p.product_name.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <motion.div
      initial={{ x: "100%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "100%", opacity: 0 }}
      transition={{ type: "spring", damping: 28, stiffness: 280 }}
      className="fixed inset-0 z-[70] flex flex-col overflow-hidden"
      style={{
        background: "linear-gradient(160deg, #001A3D 0%, #003070 100%)",
      }}
      data-ocid="phones.page"
    >
      {/* Top Bar */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3 shrink-0">
        <button
          type="button"
          onClick={() => navigate({ to: "/" })}
          className="p-2 rounded-xl hover:bg-white/10 transition-colors"
          data-ocid="phones.close_button"
        >
          <ArrowLeft className="h-5 w-5 text-white" />
        </button>
        <h1 className="flex-1 text-white font-bold text-lg">New Phones</h1>
        <button
          type="button"
          className="p-2 rounded-xl hover:bg-white/10 transition-colors"
          data-ocid="phones.button"
        >
          <Search className="h-5 w-5 text-white" />
        </button>
        <button
          type="button"
          className="p-2 rounded-xl hover:bg-white/10 transition-colors"
          data-ocid="phones.button"
        >
          <Heart className="h-5 w-5 text-white" />
        </button>
        <button
          type="button"
          className="relative p-2 rounded-xl hover:bg-white/10 transition-colors"
          data-ocid="phones.button"
        >
          <ShoppingCart className="h-5 w-5 text-white" />
          {cartCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-red-500 rounded-full text-[10px] text-white font-bold flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </button>
      </div>

      {/* Search Input */}
      <div className="px-4 pb-3 shrink-0">
        <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-xl px-3 py-2">
          <Search className="h-4 w-4 text-white/60 shrink-0" />
          <input
            type="text"
            placeholder="Search phones..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-white placeholder-white/50 text-sm outline-none"
            data-ocid="phones.search_input"
          />
        </div>
      </div>

      {/* Category Filters */}
      <div className="px-4 pb-3 shrink-0">
        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeCategory === cat
                  ? "bg-blue-500 text-white shadow-lg"
                  : "bg-white/10 text-white/70 border border-white/20"
              }`}
              data-ocid="phones.tab"
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product List */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3">
        {filtered.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-16 gap-3"
            data-ocid="phones.empty_state"
          >
            <TrendingUp className="h-12 w-12 text-white/30" />
            <p className="text-white/60 text-sm">No phones found</p>
          </div>
        ) : (
          <AnimatePresence>
            {filtered.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
}
