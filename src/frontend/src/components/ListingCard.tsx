import type { Listing } from "@/backend";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import { Clock, MapPin } from "lucide-react";
import { motion } from "motion/react";
import {
  conditionClass,
  conditionLabel,
  formatPrice,
  formatTimeAgo,
} from "../utils/format";

interface Props {
  listing: Listing;
  index?: number;
  featured?: boolean;
}

export default function ListingCard({
  listing,
  index = 0,
  featured = false,
}: Props) {
  const imageUrl = listing.images[0]?.getDirectURL();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.4) }}
      className="h-full"
    >
      <Link
        to="/listing/$listingId"
        params={{ listingId: listing.id }}
        data-ocid={`listing.item.${index + 1}`}
        className="block h-full"
      >
        <article
          className={`bg-card rounded-3xl border border-border overflow-hidden shadow-card card-hover cursor-pointer h-full flex flex-col ${
            featured ? "md:flex-row" : ""
          }`}
        >
          {/* Image */}
          <div
            className={`relative bg-muted overflow-hidden ${
              featured
                ? "md:w-1/2 aspect-square md:aspect-auto md:min-h-[220px]"
                : "aspect-[4/3]"
            }`}
          >
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={listing.title}
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <CategoryPlaceholder
                  category={listing.category}
                  featured={featured}
                />
              </div>
            )}
            {/* Condition badge */}
            <span
              className={`absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-full ${conditionClass(listing.condition)}`}
            >
              {conditionLabel(listing.condition)}
            </span>
          </div>

          {/* Content */}
          <div
            className={`p-4 flex flex-col gap-1.5 flex-1 ${featured ? "md:justify-center" : ""}`}
          >
            <h3
              className={`font-semibold text-foreground leading-snug ${
                featured ? "text-lg line-clamp-3" : "text-sm line-clamp-2"
              }`}
            >
              {listing.title}
            </h3>
            <p
              className={`font-bold text-primary mt-0.5 ${featured ? "text-2xl" : "text-xl"}`}
            >
              {formatPrice(listing.price)}
            </p>
            <div className="flex items-center gap-3 mt-auto pt-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1 truncate">
                <MapPin className="h-3 w-3 shrink-0" />
                <span className="truncate">{listing.location}</span>
              </span>
              <span className="flex items-center gap-1 shrink-0">
                <Clock className="h-3 w-3" />
                {formatTimeAgo(listing.timestamp)}
              </span>
            </div>
          </div>
        </article>
      </Link>
    </motion.div>
  );
}

function CategoryPlaceholder({
  category,
  featured,
}: { category: string; featured?: boolean }) {
  const icons: Record<string, string> = {
    phones: "📱",
    macbooks: "💻",
    watches: "⌚",
    earphones: "🎧",
  };
  return (
    <span className={`opacity-30 ${featured ? "text-7xl" : "text-5xl"}`}>
      {icons[category] ?? "📦"}
    </span>
  );
}

export function ListingCardSkeleton() {
  return (
    <div className="bg-card rounded-3xl border border-border overflow-hidden shadow-card">
      <Skeleton className="aspect-[4/3] w-full" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}
