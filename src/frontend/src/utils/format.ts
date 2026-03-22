import { ListingCondition } from "@/backend";

export function formatPrice(price: bigint): string {
  const num = Number(price);
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)}Cr`;
  if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
  if (num >= 1000) return `₹${(num / 1000).toFixed(num % 1000 === 0 ? 0 : 1)}k`;
  return `₹${num.toLocaleString("en-IN")}`;
}

export function formatPriceFull(price: bigint): string {
  return `₹${Number(price).toLocaleString("en-IN")}`;
}

export function formatTimeAgo(timestamp: bigint): string {
  const ms = Number(timestamp) / 1_000_000;
  const now = Date.now();
  const diff = now - ms;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);

  if (months > 0) return `${months}mo ago`;
  if (weeks > 0) return `${weeks}w ago`;
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "Just now";
}

export function conditionLabel(condition: ListingCondition): string {
  const labels: Record<ListingCondition, string> = {
    [ListingCondition.new_]: "New",
    [ListingCondition.likeNew]: "Like New",
    [ListingCondition.good]: "Good",
    [ListingCondition.fair]: "Fair",
  };
  return labels[condition] ?? condition;
}

export function conditionClass(condition: ListingCondition): string {
  switch (condition) {
    case ListingCondition.new_:
      return "badge-new";
    case ListingCondition.likeNew:
      return "badge-like-new";
    case ListingCondition.good:
      return "badge-good";
    case ListingCondition.fair:
      return "badge-fair";
    default:
      return "badge-good";
  }
}
