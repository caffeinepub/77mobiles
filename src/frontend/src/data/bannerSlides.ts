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
    id: "slide-ev-charging",
    title: "Find EV Charging Points Near Me",
    subtitle:
      "Locate the nearest charging stations for your electric vehicle instantly.",
    ctaText: "Find Now",
    ctaUrl: "/ev-charging",
    bgFrom: "#15803d",
    bgTo: "#22c55e",
    accentColor: "#14532d",
    productImage: "",
  },
  {
    id: "slide-find-phone",
    title: "Let's Find a Phone for You",
    subtitle: "Browse 30+ brands — phones at every budget, all verified",
    ctaText: "Browse Phones",
    ctaUrl: "/store/new-phones",
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
    ctaUrl: "/store/accessories",
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
    ctaUrl: "/store/new-phones",
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
];
