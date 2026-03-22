export const DEMO_SELLER_NAME = "Demo Seller";
export const DEMO_SELLER_ID = "demo-seller";

export interface DemoListing {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  category: string;
  condition: string;
  emoji: string;
  isDemo: true;
  timestamp: bigint;
  seller: { toString: () => string };
  images: never[];
}

const now = BigInt(Date.now()) * 1_000_000n;

export const DEMO_LISTINGS: DemoListing[] = [
  {
    id: "demo-1",
    title: "iPhone 15 Pro Max – 256GB Natural Titanium",
    description:
      "Barely used, purchased 3 months ago. Comes with original box, charger, and extra case. No scratches. Battery health 98%. Open to negotiation.",
    price: 109000,
    location: "Bandra West, Mumbai",
    category: "phones",
    condition: "likeNew",
    emoji: "📱",
    isDemo: true,
    timestamp: now - 3_600_000_000_000n,
    seller: { toString: () => DEMO_SELLER_ID },
    images: [],
  },
  {
    id: "demo-2",
    title: 'MacBook Pro 14" M3 Pro – Space Black',
    description:
      "M3 Pro chip, 18GB RAM, 512GB SSD. Used for 4 months for college work. Apple Care+ active till 2026. Selling due to upgrade.",
    price: 178000,
    location: "Koramangala, Bengaluru",
    category: "macbooks",
    condition: "good",
    emoji: "💻",
    isDemo: true,
    timestamp: now - 7_200_000_000_000n,
    seller: { toString: () => DEMO_SELLER_ID },
    images: [],
  },
  {
    id: "demo-3",
    title: "Apple Watch Ultra 2 – Ocean Band",
    description:
      "49mm, titanium case, ocean band included. Used for trekking – perfect condition. Comes with all original accessories.",
    price: 72000,
    location: "Connaught Place, Delhi",
    category: "watches",
    condition: "likeNew",
    emoji: "⌚",
    isDemo: true,
    timestamp: now - 10_800_000_000_000n,
    seller: { toString: () => DEMO_SELLER_ID },
    images: [],
  },
  {
    id: "demo-4",
    title: "AirPods Pro (2nd Gen) – MagSafe Case",
    description:
      "Bought last month, selling because I prefer over-ear headphones. ANC works perfectly. Full battery health. Minor wear on case.",
    price: 18500,
    location: "Salt Lake, Kolkata",
    category: "earphones",
    condition: "good",
    emoji: "🎧",
    isDemo: true,
    timestamp: now - 14_400_000_000_000n,
    seller: { toString: () => DEMO_SELLER_ID },
    images: [],
  },
];

export const DEMO_AUTO_REPLIES = [
  "Hi! Yes, it's still available. When would you like to meet?",
  "The condition is exactly as described. I can share more photos if needed.",
  "I'm flexible on price, but not by too much. Best I can do is a small discount.",
  "Located in the area mentioned. Cash or UPI both work for me.",
  "Sure, you can inspect it before paying. No problem!",
];
