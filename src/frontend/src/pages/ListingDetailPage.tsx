import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Heart,
  MapPin,
  MessageCircle,
  Phone,
  Play,
  Share2,
  ShieldCheck,
  User,
} from "lucide-react";
import { useState } from "react";
import ReactDOM from "react-dom";
import { toast } from "sonner";
import { DEMO_LISTINGS, DEMO_SELLER_NAME } from "../data/demoListings";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetListing, useGetSellerProfile } from "../hooks/useQueries";
import {
  conditionClass,
  conditionLabel,
  formatPriceFull,
  formatTimeAgo,
} from "../utils/format";

const CATEGORY_LABELS: Record<string, string> = {
  phones: "Phones",
  macbooks: "MacBooks",
  watches: "Watches",
  earphones: "Earphones",
};

// City -> approx lat/lon for Indian cities
const CITY_COORDS: Record<string, [number, number]> = {
  hyderabad: [17.385, 78.4867],
  mumbai: [19.076, 72.8777],
  delhi: [28.6139, 77.209],
  bangalore: [12.9716, 77.5946],
  bengaluru: [12.9716, 77.5946],
  chennai: [13.0827, 80.2707],
  kolkata: [22.5726, 88.3639],
  pune: [18.5204, 73.8567],
  ahmedabad: [23.0225, 72.5714],
  jaipur: [26.9124, 75.7873],
  lucknow: [26.8467, 80.9462],
  surat: [21.1702, 72.8311],
  kochi: [9.9312, 76.2673],
  chandigarh: [30.7333, 76.7794],
  bhopal: [23.2599, 77.4126],
  indore: [22.7196, 75.8577],
  nagpur: [21.1458, 79.0882],
  coimbatore: [11.0168, 76.9558],
  vizag: [17.6868, 83.2185],
  visakhapatnam: [17.6868, 83.2185],
};

function getCityCoords(locationStr: string): [number, number] {
  const lower = locationStr.toLowerCase();
  for (const [key, coords] of Object.entries(CITY_COORDS)) {
    if (lower.includes(key)) return coords;
  }
  return [17.385, 78.4867];
}

function SellerLocationMap({ location }: { location: string }) {
  const [lat, lon] = getCityCoords(location);
  const bbox = `${lon - 0.08},${lat - 0.06},${lon + 0.08},${lat + 0.06}`;
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lon}`;

  return (
    <div className="mt-6">
      <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-3 flex items-center gap-1.5">
        <MapPin className="h-4 w-4 text-primary" />
        Seller's Location
      </h2>
      <div
        className="rounded-2xl overflow-hidden border border-border shadow-sm"
        style={{ height: 250 }}
      >
        <iframe
          title="Seller location map"
          width="100%"
          height="250"
          src={mapUrl}
          style={{ border: 0 }}
          loading="lazy"
        />
      </div>
      <div className="mt-2 flex items-center justify-between">
        <p className="text-sm font-medium flex items-center gap-1.5">
          <MapPin className="h-4 w-4 text-primary" />
          {location}, India
        </p>
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <ShieldCheck className="h-3.5 w-3.5 text-green-600" />
          Meet safely in a public place
        </p>
      </div>
    </div>
  );
}

function MediaItem({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [isVideo, setIsVideo] = useState(false);

  if (isVideo) {
    return (
      // biome-ignore lint/a11y/useMediaCaption: user-generated video content without captions
      <video
        src={src}
        controls
        className={className}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          background: "#000",
        }}
      />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setIsVideo(true)}
    />
  );
}

function MediaThumbnail({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [isVideo, setIsVideo] = useState(false);

  if (isVideo) {
    return (
      <div
        className={`${className} bg-black flex items-center justify-center relative`}
      >
        <Play className="h-5 w-5 text-white opacity-80" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setIsVideo(true)}
    />
  );
}

/** Mobile-style top header: back arrow left, share + heart right */
function MobileDetailHeader({
  onBack,
  category,
}: {
  onBack: () => void;
  category?: string;
}) {
  const [hearted, setHearted] = useState(false);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied!");
    }
  };

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[75] bg-white border-b border-gray-100"
      style={{ minHeight: 56 }}
    >
      <div className="flex items-center justify-between h-14 px-4">
        {/* Back button */}
        <button
          type="button"
          onClick={onBack}
          className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Go back"
          data-ocid="listing.secondary_button"
        >
          <ArrowLeft className="h-5 w-5 text-gray-900" />
        </button>

        {/* Optional category label */}
        {category && (
          <span className="text-sm font-semibold text-gray-700 truncate max-w-[40%]">
            {category}
          </span>
        )}

        {/* Right actions: Share + Heart */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleShare}
            className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Share listing"
          >
            <Share2 className="h-5 w-5 text-gray-900" />
          </button>
          <button
            type="button"
            onClick={() => {
              setHearted((h) => !h);
              toast.success(
                hearted ? "Removed from wishlist" : "Saved to wishlist",
              );
            }}
            className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Save to wishlist"
          >
            <Heart
              className={`h-5 w-5 transition-colors ${
                hearted ? "fill-red-500 text-red-500" : "text-gray-900"
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Demo listing detail ───────────────────────────────────────────────────────
function DemoListingDetail({ listingId }: { listingId: string }) {
  const navigate = useNavigate();
  const listing = DEMO_LISTINGS.find((d) => d.id === listingId);

  if (!listing) {
    return (
      <>
        <MobileDetailHeader onBack={() => navigate({ to: "/" })} />
        <div className="fixed inset-0 z-[60] bg-white overflow-y-auto">
          <div className="container mx-auto px-4 py-12 max-w-xl text-center pt-20">
            <Alert variant="destructive" data-ocid="listing.error_state">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Demo listing not found.</AlertDescription>
            </Alert>
            <Button onClick={() => navigate({ to: "/" })} className="mt-4">
              Back to Browse
            </Button>
          </div>
        </div>
      </>
    );
  }

  const demoPhone = "9876543210";
  const _demoEmail = "seller@77mobiles.com";

  return (
    <>
      {/* Mobile header — sits globally above the content wrapper */}
      <MobileDetailHeader
        onBack={() => navigate({ to: -1 as any })}
        category={CATEGORY_LABELS[listing.category] ?? listing.category}
      />

      {/* Scrollable content wrapper */}
      <div className="fixed inset-0 z-[60] bg-white overflow-y-auto">
        <div className="container mx-auto px-4 py-6 max-w-5xl pb-28 pt-16">
          <div className="grid md:grid-cols-5 gap-8">
            {/* Image placeholder — no map inside this column */}
            <div className="md:col-span-3 space-y-3">
              <div className="relative aspect-square bg-muted rounded-3xl overflow-hidden border border-border flex items-center justify-center">
                <span className="text-[7rem] select-none">{listing.emoji}</span>
                <Badge className="absolute top-3 left-3 bg-blue-500/90 text-white text-xs">
                  Demo
                </Badge>
              </div>
            </div>

            {/* Details */}
            <div className="md:col-span-2 space-y-5">
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h1 className="font-display font-bold text-2xl leading-tight">
                    {listing.title}
                  </h1>
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 mt-1 ${conditionClass(listing.condition as any)}`}
                  >
                    {conditionLabel(listing.condition as any)}
                  </span>
                </div>
                <p className="text-3xl font-bold text-primary">
                  {formatPriceFull(BigInt(listing.price))}
                </p>
              </div>

              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-primary" />
                  {listing.location}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-primary" />
                  {formatTimeAgo(listing.timestamp)}
                </span>
              </div>

              <Badge variant="secondary" className="text-xs">
                {CATEGORY_LABELS[listing.category] ?? listing.category}
              </Badge>

              <Separator />

              {/* Description */}
              <div>
                <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-2">
                  Description
                </h2>
                <p className="text-sm leading-relaxed text-foreground whitespace-pre-line">
                  {listing.description}
                </p>
              </div>

              <Separator />

              {/* Seller */}
              <div className="flex items-center gap-3 p-3 bg-muted rounded-2xl">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Seller</p>
                  <div className="flex items-center gap-1.5">
                    <p className="font-medium text-sm truncate">
                      {DEMO_SELLER_NAME}
                    </p>
                    <span
                      className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0"
                      title="Identity Verified"
                    >
                      <CheckCircle2 className="h-3 w-3" />
                      Verified
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    124 Followers · 38 Following
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Seller's Location — placed after the Contact/Email block */}
          <SellerLocationMap location={listing.location} />

          {/* Divider above sticky footer */}
          <div className="mt-6 border-t border-gray-200" />
        </div>
      </div>

      {/* Sticky action footer */}
      {ReactDOM.createPortal(
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 9999,
            backgroundColor: "#ffffff",
            borderTop: "1px solid #e5e7eb",
            padding: "12px",
            display: "flex",
            gap: "8px",
            paddingBottom: "calc(12px + env(safe-area-inset-bottom))",
          }}
          data-ocid="listing.panel"
        >
          <button
            type="button"
            onClick={() =>
              navigate({
                to: "/chat",
                search: { listingId: listing.id },
              } as any)
            }
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              backgroundColor: "#2563eb",
              color: "#fff",
              borderRadius: "12px",
              padding: "14px 0",
              fontSize: "15px",
              fontWeight: 700,
              border: "none",
              cursor: "pointer",
            }}
            data-ocid="listing.primary_button"
          >
            <MessageCircle
              className="h-5 w-5 text-white"
              style={{ color: "#ffffff" }}
            />
            Chat
          </button>
          <a
            href={`tel:+91${demoPhone}`}
            style={{ flex: 1, textDecoration: "none" }}
          >
            <button
              type="button"
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                backgroundColor: "#2563eb",
                color: "#fff",
                borderRadius: "12px",
                padding: "14px 0",
                fontSize: "15px",
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
              }}
              data-ocid="listing.secondary_button"
            >
              <Phone className="h-5 w-5" />
              Call
            </button>
          </a>
          <a
            href={`https://wa.me/91${demoPhone}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ flex: 1, textDecoration: "none" }}
          >
            <button
              type="button"
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                backgroundColor: "#16a34a",
                color: "#fff",
                borderRadius: "12px",
                padding: "14px 0",
                fontSize: "15px",
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
              }}
              data-ocid="listing.toast"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5 fill-current"
                xmlns="http://www.w3.org/2000/svg"
                aria-label="WhatsApp"
                role="img"
              >
                <title>{"WhatsApp"}</title>
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              WhatsApp
            </button>
          </a>
        </div>,
        document.body,
      )}
    </>
  );
}

// ── Real listing detail ───────────────────────────────────────────────────────
export default function ListingDetailPage() {
  const { listingId } = useParams({ strict: false }) as { listingId: string };

  if (listingId?.startsWith("demo-")) {
    return <DemoListingDetail listingId={listingId} />;
  }

  return <RealListingDetail listingId={listingId} />;
}

function RealListingDetail({ listingId }: { listingId: string }) {
  const navigate = useNavigate();
  const { identity, login } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const { data: listing, isLoading, isError } = useGetListing(listingId);
  const [activeImage, setActiveImage] = useState(0);

  const { data: sellerProfile } = useGetSellerProfile(
    listing?.seller.toString() ?? "",
  );

  // Defensive principal comparison — handles both .toText() (IC Principal) and .toString()
  const sellerPrincipal = listing?.seller?.toText
    ? listing.seller.toText()
    : listing?.seller?.toString();
  const myPrincipal = identity?.getPrincipal()?.toText
    ? identity.getPrincipal().toText()
    : identity?.getPrincipal()?.toString();
  const isMySelling =
    isAuthenticated &&
    !!sellerPrincipal &&
    !!myPrincipal &&
    sellerPrincipal === myPrincipal;

  const handleCallSeller = () => {
    if (!isAuthenticated) {
      toast.error("Please login to call the seller");
      login();
      return;
    }
    const phone = sellerProfile?.phone;
    if (!phone || phone.trim() === "") {
      toast.info("Seller hasn't added a phone number yet");
      return;
    }
    const normalized = phone.replace(/\D/g, "");
    window.location.href = `tel:+${normalized.startsWith("91") ? normalized : `91${normalized}`}`;
  };

  const handleWhatsAppSeller = () => {
    if (!isAuthenticated) {
      toast.error("Please login to contact on WhatsApp");
      login();
      return;
    }
    const phone = sellerProfile?.phone;
    if (!phone || phone.trim() === "") {
      toast.info("Seller hasn't added a phone number yet");
      return;
    }
    const normalized = phone.replace(/\D/g, "");
    const waNumber = normalized.startsWith("91")
      ? normalized
      : `91${normalized}`;
    window.open(`https://wa.me/${waNumber}`, "_blank");
  };

  const handleOpenChat = () => {
    if (!isAuthenticated) {
      toast.error("Please login to message the seller");
      login();
      return;
    }
    navigate({ to: "/chat", search: { listingId } } as any);
  };

  if (isLoading) {
    return (
      <>
        <div className="fixed top-0 left-0 right-0 z-[75] bg-white border-b border-gray-100 h-14" />
        <div className="fixed inset-0 z-[60] bg-white overflow-y-auto">
          <div className="container mx-auto px-4 py-6 max-w-5xl pt-20">
            <div className="grid md:grid-cols-2 gap-8">
              <Skeleton className="aspect-square rounded-xl" />
              <div className="space-y-4">
                <Skeleton className="h-7 w-3/4" />
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-24 w-full" />
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (isError || !listing) {
    return (
      <>
        <MobileDetailHeader onBack={() => navigate({ to: "/" })} />
        <div className="fixed inset-0 z-[60] bg-white overflow-y-auto">
          <div className="container mx-auto px-4 py-12 max-w-xl text-center pt-20">
            <Alert variant="destructive" data-ocid="listing.error_state">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Listing not found or unavailable.
              </AlertDescription>
            </Alert>
            <Button onClick={() => navigate({ to: "/" })} className="mt-4">
              Back to Browse
            </Button>
          </div>
        </div>
      </>
    );
  }

  const images = listing.images.map((img) => img.getDirectURL());

  const modelMatch = listing.description.match(/^\[Model: (.+?)\]\n/);
  const modelLabel = modelMatch ? modelMatch[1] : null;
  const cleanDescription = listing.description
    .replace(/^\[Model: .+?\]\n/, "")
    .replace(/^\[Featured\]\n/, "")
    .replace(/\[WhatsApp: .+?\]\n/, "");

  return (
    <>
      {/* Mobile header — globally above content wrapper */}
      <MobileDetailHeader
        onBack={() => navigate({ to: -1 as any })}
        category={CATEGORY_LABELS[listing.category] ?? listing.category}
      />

      {/* Scrollable content wrapper */}
      <div className="fixed inset-0 z-[60] bg-white overflow-y-auto">
        <div className="container mx-auto px-4 py-6 max-w-5xl pb-28 pt-16">
          <div className="grid md:grid-cols-5 gap-8">
            {/* Images / Videos */}
            <div className="md:col-span-3 space-y-3">
              <div className="relative aspect-square bg-muted rounded-3xl overflow-hidden border border-border">
                {images.length > 0 ? (
                  <MediaItem
                    src={images[activeImage]}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-7xl opacity-20">
                    📱
                  </div>
                )}
                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => setActiveImage((i) => Math.max(0, i - 1))}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1.5 transition-colors"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setActiveImage((i) =>
                          Math.min(images.length - 1, i + 1),
                        )
                      }
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1.5 transition-colors"
                      aria-label="Next image"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {images.map((url, i) => (
                    <button
                      type="button"
                      key={url}
                      onClick={() => setActiveImage(i)}
                      className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors ${
                        i === activeImage
                          ? "border-primary"
                          : "border-transparent hover:border-border"
                      }`}
                    >
                      <MediaThumbnail
                        src={url}
                        alt={`Thumbnail ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="md:col-span-2 space-y-5">
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h1 className="font-display font-bold text-2xl leading-tight">
                    {listing.title}
                  </h1>
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 mt-1 ${conditionClass(listing.condition)}`}
                  >
                    {conditionLabel(listing.condition)}
                  </span>
                </div>
                {modelLabel && (
                  <Badge variant="outline" className="mb-2 text-xs">
                    {modelLabel}
                  </Badge>
                )}
                <p className="text-3xl font-bold text-primary">
                  {formatPriceFull(listing.price)}
                </p>
              </div>

              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-primary" />
                  {listing.location}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-primary" />
                  {formatTimeAgo(listing.timestamp)}
                </span>
              </div>

              <Badge variant="secondary" className="text-xs">
                {CATEGORY_LABELS[listing.category] ?? listing.category}
              </Badge>

              {/* Description */}
              <div>
                <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-2">
                  Description
                </h2>
                <p className="text-sm leading-relaxed text-foreground whitespace-pre-line">
                  {cleanDescription}
                </p>
              </div>

              <Separator />

              {/* Seller */}
              <div className="flex items-center gap-3 p-3 bg-muted rounded-2xl">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Seller</p>
                  <div className="flex items-center gap-1.5">
                    <p className="font-medium text-sm truncate">
                      {sellerProfile?.name ||
                        `${listing.seller.toString().slice(0, 12)}...`}
                    </p>
                    {sellerProfile?.isVerified && (
                      <span
                        className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0"
                        title="Identity Verified"
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        Verified
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    87 Followers · 24 Following
                  </p>
                </div>
              </div>

              {isMySelling && (
                <div className="text-center p-3 bg-muted rounded-2xl">
                  <p className="text-sm text-muted-foreground">
                    This is your listing
                  </p>
                  <Link to="/profile">
                    <Button variant="outline" size="sm" className="mt-2">
                      Manage in Profile
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Seller's Location — after Contact/Email block */}
          <SellerLocationMap location={listing.location} />

          {/* Divider above sticky footer */}
          <div className="mt-6 border-t border-gray-200" />
        </div>
      </div>

      {/* Sticky action footer — shown to buyers (!isMySelling) and unauthenticated users */}
      {!isMySelling &&
        ReactDOM.createPortal(
          <div
            style={{
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 9999,
              backgroundColor: "#ffffff",
              borderTop: "1px solid #e5e7eb",
              padding: "12px",
              display: "flex",
              gap: "8px",
              paddingBottom: "calc(12px + env(safe-area-inset-bottom))",
            }}
            data-ocid="listing.panel"
          >
            <button
              type="button"
              onClick={handleOpenChat}
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                backgroundColor: "#2563eb",
                color: "#fff",
                borderRadius: "12px",
                padding: "14px 0",
                fontSize: "15px",
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
              }}
              data-ocid="listing.primary_button"
            >
              <MessageCircle
                className="h-5 w-5 text-white"
                style={{ color: "#ffffff" }}
              />
              Chat
            </button>
            <button
              type="button"
              onClick={handleCallSeller}
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                backgroundColor: "#2563eb",
                color: "#fff",
                borderRadius: "12px",
                padding: "14px 0",
                fontSize: "15px",
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
              }}
              data-ocid="listing.secondary_button"
            >
              <Phone className="h-5 w-5" />
              Call
            </button>
            <button
              type="button"
              onClick={handleWhatsAppSeller}
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                backgroundColor: "#16a34a",
                color: "#fff",
                borderRadius: "12px",
                padding: "14px 0",
                fontSize: "15px",
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
              }}
              data-ocid="listing.toast"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5 fill-current"
                xmlns="http://www.w3.org/2000/svg"
                aria-label="WhatsApp"
                role="img"
              >
                <title>{"WhatsApp"}</title>
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              WhatsApp
            </button>
          </div>,
          document.body,
        )}
    </>
  );
}
