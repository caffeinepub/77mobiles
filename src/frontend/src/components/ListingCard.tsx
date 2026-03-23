import type { Listing } from "@/backend";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import { Calendar, Heart, MapPin } from "lucide-react";
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
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.04, 0.3) }}
    >
      <Link
        to="/listing/$listingId"
        params={{ listingId: listing.id }}
        data-ocid={`listing.item.${index + 1}`}
        className="block"
      >
        <article className="bg-white px-4 py-3 flex gap-3 items-start cursor-pointer hover:bg-gray-50 transition-colors relative">
          {/* Square product image */}
          <div className="w-[100px] h-[100px] rounded-lg overflow-hidden bg-gray-100 shrink-0 relative">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={listing.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <CategoryPlaceholder category={listing.category} />
              </div>
            )}
            {/* Condition badge */}
            <span
              className={`absolute bottom-1 left-1 text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${conditionClass(listing.condition)}`}
            >
              {conditionLabel(listing.condition)}
            </span>
          </div>

          {/* Right content */}
          <div className="flex flex-col justify-between flex-1 min-w-0 h-[100px] py-0.5">
            {/* Price — bold blue, top */}
            <p className="text-base font-bold text-blue-600 leading-tight">
              {formatPrice(listing.price)}
            </p>

            {/* Title — dark, 2 lines */}
            <h3 className="text-sm font-medium text-gray-800 leading-snug line-clamp-2 mt-0.5">
              {listing.title}
            </h3>

            {/* Location + date — small grey, bottom */}
            <div className="flex items-center gap-2 mt-auto text-[11px] text-gray-400">
              <span className="flex items-center gap-0.5 truncate">
                <MapPin className="h-3 w-3 shrink-0" />
                <span className="truncate">{listing.location}</span>
              </span>
              <span className="flex items-center gap-0.5 shrink-0">
                <Calendar className="h-3 w-3" />
                {formatTimeAgo(listing.timestamp)}
              </span>
            </div>
          </div>

          {/* Heart */}
          <button
            type="button"
            onClick={(e) => e.preventDefault()}
            className="absolute top-3 right-3 p-1 text-gray-300 hover:text-red-400 transition-colors"
          >
            <Heart className="h-4 w-4" />
          </button>

          {/* Featured badge */}
          {featured && (
            <span className="absolute top-3 left-4 text-[9px] font-bold px-1.5 py-0.5 rounded-sm bg-amber-400 text-amber-900 tracking-wide">
              FEATURED
            </span>
          )}
        </article>
      </Link>
    </motion.div>
  );
}

function CategoryPlaceholder({ category }: { category: string }) {
  const icons: Record<string, string> = {
    phones: "📱",
    macbooks: "💻",
    watches: "⌚",
    earphones: "🎧",
  };
  return <span className="opacity-30 text-3xl">{icons[category] ?? "📦"}</span>;
}

export function ListingCardSkeleton() {
  return (
    <div className="bg-white px-4 py-3 flex gap-3">
      <Skeleton className="w-[100px] h-[100px] rounded-lg shrink-0" />
      <div className="flex-1 space-y-2 py-1">
        <Skeleton className="h-5 w-1/2" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </div>
  );
}
