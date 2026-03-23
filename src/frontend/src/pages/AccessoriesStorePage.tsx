import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Search, ShoppingCart, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

interface Product {
  id: string;
  name: string;
  origPrice: number;
  salePrice: number;
  emoji: string;
  category: string;
  description: string;
  compatibility: string;
}

const PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Leather MagSafe Case for iPhone 17",
    origPrice: 1999,
    salePrice: 999,
    emoji: "🛡️",
    category: "MagSafe",
    description:
      "Premium genuine leather case with MagSafe charging support. Develops a beautiful patina over time.",
    compatibility: "Fits iPhone 16 & 17",
  },
  {
    id: "2",
    name: "Clear Slim Case iPhone 16 Pro",
    origPrice: 799,
    salePrice: 499,
    emoji: "📱",
    category: "Leather",
    description:
      "Ultra-clear polycarbonate case. Show off your phone's design while keeping it protected.",
    compatibility: "Fits iPhone 16 Pro",
  },
  {
    id: "3",
    name: "Premium Screen Guard 9H",
    origPrice: 499,
    salePrice: 299,
    emoji: "🪟",
    category: "Screen Guards",
    description:
      "9H hardness tempered glass. Anti-fingerprint coating and oleophobic layer.",
    compatibility: "Fits iPhone 15 & 16 series",
  },
  {
    id: "4",
    name: "MagSafe Wallet Card Holder",
    origPrice: 1299,
    salePrice: 699,
    emoji: "💳",
    category: "MagSafe",
    description:
      "Snap-on magnetic wallet holds 3 cards. Detaches easily when wireless charging.",
    compatibility: "Fits all MagSafe iPhones (iPhone 12 and later)",
  },
  {
    id: "5",
    name: "Wireless Charging Pad 15W",
    origPrice: 2499,
    salePrice: 1499,
    emoji: "⚡",
    category: "Wireless Charging",
    description:
      "15W fast wireless charging pad compatible with all Qi-enabled devices. LED indicator.",
    compatibility: "Universal Qi — iPhone, Samsung, OnePlus",
  },
  {
    id: "6",
    name: "AirTag Silicone Case 4-Pack",
    origPrice: 899,
    salePrice: 549,
    emoji: "🔍",
    category: "AirTag Cases",
    description:
      "Durable silicone cases for Apple AirTag. Keyring loop included. 8 colours.",
    compatibility: "Fits Apple AirTag (all generations)",
  },
];

const FILTERS = [
  "All",
  "MagSafe",
  "Leather",
  "Screen Guards",
  "AirTag Cases",
  "Wireless Charging",
];

const formatPrice = (n: number) => `₹${n.toLocaleString("en-IN")}`;
const discountPct = (orig: number, sale: number) =>
  Math.round((1 - sale / orig) * 100);

interface CartItem extends Product {
  qty: number;
}

export default function AccessoriesStorePage() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showCart, setShowCart] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [orderSuccess, setOrderSuccess] = useState(false);

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const cartTotal = cart.reduce((s, i) => s + i.salePrice * i.qty, 0);

  const addToCart = (p: Product) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === p.id);
      if (existing)
        return prev.map((c) => (c.id === p.id ? { ...c, qty: c.qty + 1 } : c));
      return [...prev, { ...p, qty: 1 }];
    });
  };

  const removeFromCart = (id: string) =>
    setCart((prev) => prev.filter((c) => c.id !== id));

  const filteredProducts = PRODUCTS.filter((p) => {
    const matchFilter = activeFilter === "All" || p.category === activeFilter;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const handleConfirmOrder = () => {
    setOrderSuccess(true);
    setTimeout(() => {
      setOrderSuccess(false);
      setCart([]);
      setShowCart(false);
    }, 2500);
  };

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 28, stiffness: 300 }}
      className="fixed inset-0 z-[70] bg-white flex flex-col"
      data-ocid="store.page"
    >
      {/* Store Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button
          type="button"
          onClick={() => navigate({ to: "/" })}
          className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
          data-ocid="store.close_button"
        >
          <ArrowLeft className="h-5 w-5 text-gray-700" />
        </button>
        <div className="flex-1">
          <h1 className="font-bold text-lg text-gray-900">77mobiles Store</h1>
          <p className="text-xs text-gray-500">Premium Accessories</p>
        </div>
        <button
          type="button"
          onClick={() => setShowCart(true)}
          className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors"
          data-ocid="store.open_modal_button"
        >
          <ShoppingCart className="h-6 w-6 text-gray-700" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </button>
      </div>

      {/* Search */}
      <div className="px-4 pt-3 pb-2 bg-white">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search accessories..."
            className="pl-9 rounded-xl bg-gray-50 border-gray-200"
            data-ocid="store.search_input"
          />
        </div>
      </div>

      {/* Filter Bar */}
      <div className="px-4 pb-3 bg-white">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setActiveFilter(f)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeFilter === f
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              data-ocid="store.tab"
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <div className="flex-1 overflow-y-auto px-4 pb-8">
        {filteredProducts.length === 0 ? (
          <div
            className="text-center py-16 text-gray-400"
            data-ocid="store.empty_state"
          >
            <p className="text-4xl mb-3">📦</p>
            <p className="font-semibold">No products found</p>
            <p className="text-sm mt-1">Try a different search or filter</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredProducts.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedProduct(p)}
                data-ocid={`store.item.${i + 1}`}
              >
                <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center relative">
                  <span className="text-5xl">{p.emoji}</span>
                  <Badge className="absolute top-2 right-2 bg-orange-500 text-white text-[10px] px-1.5 py-0.5">
                    {discountPct(p.origPrice, p.salePrice)}% off
                  </Badge>
                </div>
                <div className="p-3">
                  <p className="text-xs font-semibold text-gray-800 leading-tight line-clamp-2 mb-1">
                    {p.name}
                  </p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-blue-600 text-sm">
                        {formatPrice(p.salePrice)}
                      </p>
                      <p className="text-[11px] text-gray-400 line-through">
                        {formatPrice(p.origPrice)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(p);
                      }}
                      className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-lg font-bold hover:bg-blue-700 transition-colors"
                      data-ocid={`store.primary_button.${i + 1}`}
                    >
                      +
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Product Detail Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <Dialog open onOpenChange={() => setSelectedProduct(null)}>
            <DialogContent
              className="max-w-sm rounded-2xl"
              data-ocid="store.dialog"
            >
              <DialogHeader>
                <DialogTitle className="text-left">
                  {selectedProduct.name}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="aspect-video bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center">
                  <span className="text-7xl">{selectedProduct.emoji}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-2xl font-bold text-blue-600">
                      {formatPrice(selectedProduct.salePrice)}
                    </p>
                    <p className="text-sm text-gray-400 line-through">
                      {formatPrice(selectedProduct.origPrice)}
                    </p>
                    <Badge className="bg-orange-100 text-orange-700">
                      {discountPct(
                        selectedProduct.origPrice,
                        selectedProduct.salePrice,
                      )}
                      % off
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed mb-2">
                    {selectedProduct.description}
                  </p>
                  <p className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
                    <span className="font-medium">Compatible: </span>
                    {selectedProduct.compatibility}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      addToCart(selectedProduct);
                      setSelectedProduct(null);
                      setShowCart(true);
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    data-ocid="store.primary_button"
                  >
                    Buy Now
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      addToCart(selectedProduct);
                      setSelectedProduct(null);
                    }}
                    className="flex-1"
                    data-ocid="store.secondary_button"
                  >
                    Add to Cart
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>

      {/* Cart Modal */}
      <AnimatePresence>
        {showCart && (
          <Dialog
            open
            onOpenChange={() => {
              if (!orderSuccess) setShowCart(false);
            }}
          >
            <DialogContent
              className="max-w-sm rounded-2xl"
              data-ocid="store.modal"
            >
              <DialogHeader>
                <DialogTitle className="text-left flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" /> Your Cart
                </DialogTitle>
              </DialogHeader>

              {orderSuccess ? (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center py-8"
                  data-ocid="store.success_state"
                >
                  <p className="text-5xl mb-3">🎉</p>
                  <p className="font-bold text-lg text-green-700">
                    Order Placed!
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Thank you for your purchase
                  </p>
                </motion.div>
              ) : cart.length === 0 ? (
                <div
                  className="text-center py-8 text-gray-400"
                  data-ocid="store.empty_state"
                >
                  <ShoppingCart className="h-10 w-10 mx-auto mb-2 opacity-40" />
                  <p className="font-medium">Your cart is empty</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {cart.map((item, i) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 bg-gray-50 rounded-xl p-3"
                        data-ocid={`store.item.${i + 1}`}
                      >
                        <span className="text-2xl">{item.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold truncate">
                            {item.name}
                          </p>
                          <p className="text-xs text-blue-600 font-bold">
                            {formatPrice(item.salePrice)} × {item.qty}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          className="p-1 text-gray-400 hover:text-red-500"
                          data-ocid={`store.delete_button.${i + 1}`}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-3">
                    <div className="flex justify-between font-bold text-lg mb-4">
                      <span>Total</span>
                      <span className="text-blue-600">
                        {formatPrice(cartTotal)}
                      </span>
                    </div>
                    <div className="space-y-2 mb-4">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Payment Method
                      </p>
                      <RadioGroup
                        value={paymentMethod}
                        onValueChange={setPaymentMethod}
                        className="space-y-2"
                        data-ocid="store.radio"
                      >
                        {[
                          { value: "upi", label: "UPI (GPay, PhonePe, Paytm)" },
                          { value: "card", label: "Credit / Debit Card" },
                          { value: "netbanking", label: "Net Banking" },
                        ].map((opt) => (
                          <div
                            key={opt.value}
                            className="flex items-center gap-2 bg-gray-50 rounded-xl p-3"
                          >
                            <RadioGroupItem
                              value={opt.value}
                              id={opt.value}
                              data-ocid="store.radio"
                            />
                            <Label
                              htmlFor={opt.value}
                              className="text-sm cursor-pointer"
                            >
                              {opt.label}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                    <Button
                      onClick={handleConfirmOrder}
                      className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-base font-semibold"
                      data-ocid="store.confirm_button"
                    >
                      Confirm Order
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
