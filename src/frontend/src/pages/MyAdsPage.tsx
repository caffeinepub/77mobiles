import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { FileText, PlusCircle } from "lucide-react";
import type { Listing } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetCallerRelatedListings } from "../hooks/useQueries";

function ListingCard({ listing }: { listing: Listing }) {
  const imageUrl = listing.images[0]
    ? typeof listing.images[0] === "string"
      ? listing.images[0]
      : null
    : null;

  return (
    <Link
      to="/listing/$listingId"
      params={{ listingId: listing.id.toString() }}
      className="flex gap-3 bg-card border border-border/60 rounded-2xl p-3 hover:border-primary/40 transition-colors"
      data-ocid="my_ads.item"
    >
      <div className="h-20 w-20 rounded-xl overflow-hidden bg-muted flex-shrink-0">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={listing.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-muted-foreground">
            <FileText className="h-8 w-8" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm line-clamp-2 text-foreground">
          {listing.title}
        </p>
        <p className="text-primary font-bold text-base mt-1">
          ₹{Number(listing.price).toLocaleString("en-IN")}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {listing.location || "Location not set"}
        </p>
      </div>
    </Link>
  );
}

export default function MyAdsPage() {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: listings, isLoading } = useGetCallerRelatedListings();

  if (isInitializing) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        data-ocid="my_ads.loading_state"
      >
        <div className="animate-spin h-8 w-8 rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!identity) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center"
        data-ocid="my_ads.panel"
      >
        <FileText className="h-12 w-12 text-muted-foreground" />
        <h2 className="text-xl font-bold">Sign in to view your ads</h2>
        <p className="text-sm text-muted-foreground max-w-xs">
          Log in to manage your listings and track inquiries.
        </p>
        <Link to="/profile">
          <Button data-ocid="my_ads.primary_button">Go to Account</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24" data-ocid="my_ads.page">
      <div className="px-4 pt-6 pb-4 border-b border-border/60">
        <h1 className="text-2xl font-bold">My Ads</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your posted listings
        </p>
      </div>

      <div className="px-4 pt-4">
        {isLoading ? (
          <div className="space-y-3" data-ocid="my_ads.loading_state">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-28 rounded-2xl bg-muted animate-pulse"
              />
            ))}
          </div>
        ) : !listings || listings.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-20 text-center gap-4"
            data-ocid="my_ads.empty_state"
          >
            <FileText className="h-14 w-14 text-muted-foreground/50" />
            <div>
              <p className="font-semibold text-lg">No ads yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                You haven&apos;t posted any ads yet.
              </p>
            </div>
            <Link to="/post">
              <Button className="gap-2" data-ocid="my_ads.primary_button">
                <PlusCircle className="h-4 w-4" />
                Post Free Ad
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3" data-ocid="my_ads.list">
            {listings.map((listing) => (
              <ListingCard key={listing.id.toString()} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
