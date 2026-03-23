export interface BannerSlide {
  id: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaUrl: string;
  bgFrom: string;
  bgTo: string;
  accentColor: string;
  productImage: string;
}

export const BANNER_SLIDES: BannerSlide[] = [
  {
    id: "slide-sell-device",
    title: "Sell Your Device",
    subtitle: "Get instant cash — free pickup, best price guaranteed",
    ctaText: "Sell Now",
    ctaUrl: "/instant-buy",
    bgFrom: "#f97316",
    bgTo: "#fb923c",
    accentColor: "#c2410c",
    productImage: "/assets/generated/banner-slide-sell-device.dim_600x300.png",
  },
  {
    id: "slide-find-phone",
    title: "Let's Find a Phone for You",
    subtitle: "Browse 30+ brands — phones at every budget, all verified",
    ctaText: "Browse Phones",
    ctaUrl: "/?category=phones",
    bgFrom: "#1d4ed8",
    bgTo: "#3b82f6",
    accentColor: "#1e3a8a",
    productImage: "/assets/generated/banner-slide-find-phone.dim_600x300.png",
  },
  {
    id: "slide-accessories",
    title: "Premium Covers & Accessories",
    subtitle: "Cases, cables, earbuds & more — top brands, best prices",
    ctaText: "Shop Accessories",
    ctaUrl: "/",
    bgFrom: "#7c3aed",
    bgTo: "#a855f7",
    accentColor: "#5b21b6",
    productImage: "/assets/generated/banner-slide-accessories.dim_600x300.png",
  },
  {
    id: "slide-1",
    title: "Price Crash Zone",
    subtitle: "Get the devices you want at lowest-ever prices",
    ctaText: "Order Now",
    ctaUrl: "/",
    bgFrom: "#0ea5e9",
    bgTo: "#38bdf8",
    accentColor: "#0369a1",
    productImage: "/assets/generated/banner-slide-1.dim_600x300.png",
  },
  {
    id: "slide-2",
    title: "Smartphone Bonanza",
    subtitle: "Top flagship phones at unbeatable prices — all brands",
    ctaText: "Shop Phones",
    ctaUrl: "/?category=phones",
    bgFrom: "#7c3aed",
    bgTo: "#a78bfa",
    accentColor: "#5b21b6",
    productImage: "/assets/generated/banner-slide-2.dim_600x300.png",
  },
  {
    id: "slide-3",
    title: "MacBook Deals",
    subtitle: "Premium Apple laptops & accessories at great prices",
    ctaText: "Shop MacBooks",
    ctaUrl: "/?category=macbooks",
    bgFrom: "#f97316",
    bgTo: "#fb923c",
    accentColor: "#c2410c",
    productImage: "/assets/generated/banner-slide-3.dim_600x300.png",
  },
  {
    id: "slide-4",
    title: "Wearables & Audio",
    subtitle: "Watches, earphones & headphones — curated collection",
    ctaText: "Explore Now",
    ctaUrl: "/?category=watches",
    bgFrom: "#059669",
    bgTo: "#34d399",
    accentColor: "#047857",
    productImage: "/assets/generated/banner-slide-4.dim_600x300.png",
  },
  {
    id: "slide-5",
    title: "Gaming Extravaganza",
    subtitle: "Consoles & gaming gear — buy, sell, trade locally",
    ctaText: "Shop Gaming",
    ctaUrl: "/",
    bgFrom: "#4338ca",
    bgTo: "#818cf8",
    accentColor: "#3730a3",
    productImage: "/assets/generated/banner-slide-5.dim_600x300.png",
  },
];
