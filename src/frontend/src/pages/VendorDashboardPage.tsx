import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "@tanstack/react-router";
import {
  BarChart2,
  ChevronLeft,
  Edit2,
  Eye,
  Package,
  Pause,
  Plus,
  Star,
  Trash2,
  TrendingUp,
  Upload,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";

// ─── Sample Data ──────────────────────────────────────────────────────────────

const DEMO_PRODUCTS = [
  {
    id: "p1",
    name: "iPhone 15 Pro",
    price: 72000,
    category: "Phones",
    condition: "Like New",
    emoji: "📱",
    bg: "from-slate-700 to-slate-900",
    status: "Active" as const,
    views: 342,
  },
  {
    id: "p2",
    name: "MacBook Air M3",
    price: 98000,
    category: "MacBooks",
    condition: "New",
    emoji: "💻",
    bg: "from-blue-600 to-indigo-700",
    status: "Active" as const,
    views: 218,
  },
  {
    id: "p3",
    name: "Sony WH-1000XM5",
    price: 18000,
    category: "Earphones",
    condition: "Good",
    emoji: "🎧",
    bg: "from-amber-500 to-orange-600",
    status: "Sold" as const,
    views: 189,
  },
];

const DEMO_INVENTORY = [
  {
    id: "i1",
    name: "iPhone 15 Pro",
    price: 72000,
    status: "Active" as const,
    views: 342,
  },
  {
    id: "i2",
    name: "MacBook Air M3",
    price: 98000,
    status: "Active" as const,
    views: 218,
  },
  {
    id: "i3",
    name: "Sony WH-1000XM5",
    price: 18000,
    status: "Sold" as const,
    views: 189,
  },
  {
    id: "i4",
    name: "Samsung Galaxy S24 Ultra",
    price: 85000,
    status: "Active" as const,
    views: 97,
  },
  {
    id: "i5",
    name: "Apple Watch Series 9",
    price: 32000,
    status: "Paused" as const,
    views: 54,
  },
];

const WEEKLY_DATA = [
  { day: "Mon", value: 12000 },
  { day: "Tue", value: 35000 },
  { day: "Wed", value: 22000 },
  { day: "Thu", value: 48000 },
  { day: "Fri", value: 38000 },
  { day: "Sat", value: 65000 },
  { day: "Sun", value: 25000 },
];

const MAX_VAL = Math.max(...WEEKLY_DATA.map((d) => d.value));

function inr(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

function StatusBadge({ status }: { status: "Active" | "Sold" | "Paused" }) {
  const styles = {
    Active: "bg-green-100 text-green-700",
    Sold: "bg-gray-100 text-gray-600",
    Paused: "bg-orange-100 text-orange-700",
  };
  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${styles[status]}`}
    >
      {status}
    </span>
  );
}

// ─── New Product Modal ────────────────────────────────────────────────────────

function NewProductModal({ onClose }: { onClose: () => void }) {
  const [featured, setFeatured] = useState(false);
  return (
    <div className="fixed inset-0 z-[80] bg-black/50 flex items-end sm:items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h3 className="font-bold text-lg">Upload New Product</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <Label htmlFor="prod-title">Product Title</Label>
            <Input
              id="prod-title"
              placeholder="e.g. iPhone 15 Pro 256GB"
              className="mt-1"
              data-ocid="vendor.input"
            />
          </div>
          <div>
            <Label htmlFor="prod-price">Price (₹)</Label>
            <Input
              id="prod-price"
              type="number"
              placeholder="e.g. 72000"
              className="mt-1"
              data-ocid="vendor.input"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Category</Label>
              <Select>
                <SelectTrigger className="mt-1" data-ocid="vendor.select">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="phones">Phones</SelectItem>
                  <SelectItem value="macbooks">MacBooks</SelectItem>
                  <SelectItem value="watches">Watches</SelectItem>
                  <SelectItem value="earphones">Earphones</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Condition</Label>
              <Select>
                <SelectTrigger className="mt-1" data-ocid="vendor.select">
                  <SelectValue placeholder="Condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="like-new">Like New</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="fair">Fair</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="prod-desc">Description</Label>
            <Textarea
              id="prod-desc"
              placeholder="Describe your product..."
              className="mt-1 resize-none"
              rows={3}
              data-ocid="vendor.textarea"
            />
          </div>
          <button
            type="button"
            className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors"
            data-ocid="vendor.upload_button"
          >
            <Upload className="h-4 w-4" /> Upload Photos
          </button>
          <div className="flex items-center justify-between p-3 bg-amber-50 rounded-xl border border-amber-200">
            <div>
              <p className="text-sm font-semibold text-amber-800">
                List as Featured
              </p>
              <p className="text-xs text-amber-600">
                Gold badge + top placement
              </p>
            </div>
            <Switch
              checked={featured}
              onCheckedChange={setFeatured}
              data-ocid="vendor.switch"
              className="data-[state=checked]:bg-amber-500"
            />
          </div>
        </div>
        <div className="px-5 pb-5 flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onClose}
            data-ocid="vendor.cancel_button"
          >
            Cancel
          </Button>
          <Button
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            onClick={onClose}
            data-ocid="vendor.submit_button"
          >
            List Product
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function VendorDashboardPage() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="flex items-center gap-3 py-3">
            <button
              type="button"
              onClick={() => navigate({ to: "/profile" })}
              className="p-2 rounded-full hover:bg-gray-100"
              data-ocid="vendor.close_button"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-xl">Vendor Dashboard</h1>
                <span className="px-2 py-0.5 bg-amber-400 text-amber-900 text-xs font-bold rounded-full flex items-center gap-1">
                  <Star className="h-3 w-3" /> PRO
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Manage listings, track sales, grow your business
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-3xl py-5 space-y-6">
        {/* ── Section 1: Featured Product Carousel ───────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-base flex items-center gap-2">
              <Package className="h-4 w-4 text-blue-600" /> Featured Products
            </h2>
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1 text-xs text-blue-600 font-semibold"
              data-ocid="vendor.primary_button"
            >
              <Plus className="h-3.5 w-3.5" /> Add Product
            </button>
          </div>

          <div
            ref={carouselRef}
            className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide"
            style={{ scrollbarWidth: "none" }}
          >
            {DEMO_PRODUCTS.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="shrink-0 w-52 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                data-ocid={`vendor.item.${i + 1}`}
              >
                <div
                  className={`h-32 bg-gradient-to-br ${product.bg} flex items-center justify-center`}
                >
                  <span className="text-5xl">{product.emoji}</span>
                </div>
                <div className="p-3">
                  <p className="font-semibold text-sm leading-tight truncate">
                    {product.name}
                  </p>
                  <p className="text-blue-600 font-bold text-sm mt-0.5">
                    {inr(product.price)}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <StatusBadge status={product.status} />
                    <button
                      type="button"
                      className="p-1.5 rounded-lg bg-gray-100 hover:bg-blue-100 text-gray-600 hover:text-blue-600 transition-colors"
                      data-ocid={`vendor.edit_button.${i + 1}`}
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Add New slide */}
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="shrink-0 w-52 rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-colors min-h-[180px]"
              data-ocid="vendor.upload_button"
            >
              <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                <Plus className="h-6 w-6" />
              </div>
              <span className="text-xs font-semibold">Upload Product</span>
            </button>
          </div>
        </div>

        {/* ── Section 2: Sales Analytics ─────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-bold text-base flex items-center gap-2 mb-4">
            <BarChart2 className="h-4 w-4 text-blue-600" /> Sales Analytics
          </h2>

          {/* Stat Cards */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            {[
              {
                label: "Total Revenue",
                value: "₹2,45,000",
                icon: "💰",
                color: "text-green-600",
              },
              {
                label: "Items Sold",
                value: "12",
                icon: "📦",
                color: "text-blue-600",
              },
              {
                label: "Profile Views",
                value: "1,847",
                icon: "👁️",
                color: "text-purple-600",
              },
              {
                label: "Active Listings",
                value: "8",
                icon: "✅",
                color: "text-amber-600",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-gray-50 rounded-xl p-3 border border-gray-100"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{stat.icon}</span>
                  <span
                    className={`font-bold text-lg leading-none ${stat.color}`}
                  >
                    {stat.value}
                  </span>
                </div>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Bar Chart */}
          <p className="text-xs font-semibold text-gray-500 mb-3">
            Last 7 Days Revenue
          </p>
          <div className="flex items-end gap-2 h-24">
            {WEEKLY_DATA.map((d) => (
              <div
                key={d.day}
                className="flex-1 flex flex-col items-center gap-1 group"
              >
                <div className="relative w-full">
                  <div
                    className="w-full rounded-t-md bg-gradient-to-t from-blue-500 to-blue-400 transition-all group-hover:from-blue-600 group-hover:to-blue-500"
                    style={{ height: `${(d.value / MAX_VAL) * 80}px` }}
                  />
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[9px] rounded px-1.5 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    {inr(d.value)}
                  </div>
                </div>
                <span className="text-[10px] text-gray-400">{d.day}</span>
              </div>
            ))}
          </div>

          {/* Metrics */}
          <div className="flex gap-3 mt-4">
            <div className="flex-1 bg-blue-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">Avg Response Time</p>
              <p className="font-bold text-blue-700 text-sm">12 min</p>
            </div>
            <div className="flex-1 bg-green-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">Conversion Rate</p>
              <p className="font-bold text-green-700 text-sm">8.4%</p>
            </div>
          </div>
        </div>

        {/* ── Section 3: Inventory Management ───────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-bold text-base flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-blue-600" /> Inventory
          </h2>

          <div className="space-y-2" data-ocid="vendor.list">
            {DEMO_INVENTORY.map((item, i) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100"
                data-ocid={`vendor.row.${i + 1}`}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{item.name}</p>
                  <p className="text-xs text-blue-600 font-bold">
                    {inr(item.price)}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Eye className="h-3.5 w-3.5" /> {item.views}
                </div>
                <StatusBadge status={item.status} />
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    className="p-1.5 rounded-lg bg-white border border-gray-200 hover:bg-blue-50 hover:border-blue-300 text-gray-500 hover:text-blue-600 transition-colors"
                    data-ocid={`vendor.edit_button.${i + 1}`}
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    className="p-1.5 rounded-lg bg-white border border-gray-200 hover:bg-orange-50 hover:border-orange-300 text-gray-500 hover:text-orange-600 transition-colors"
                    data-ocid={`vendor.toggle.${i + 1}`}
                  >
                    <Pause className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    className="p-1.5 rounded-lg bg-white border border-gray-200 hover:bg-red-50 hover:border-red-300 text-gray-500 hover:text-red-600 transition-colors"
                    data-ocid={`vendor.delete_button.${i + 1}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* New Product Modal */}
      {showModal && <NewProductModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
