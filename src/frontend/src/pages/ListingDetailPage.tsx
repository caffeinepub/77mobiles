import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  FlaskConical,
  MapPin,
  MessageCircle,
  Phone,
  Play,
  Send,
  User,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  DEMO_AUTO_REPLIES,
  DEMO_LISTINGS,
  DEMO_SELLER_NAME,
} from "../data/demoListings";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetListing,
  useGetMessagesForListing,
  useGetSellerProfile,
  usePostMessage,
} from "../hooks/useQueries";
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

// ────────────────────────────────────────────────────────────
// MediaItem: renders image, falls back to video on load error
// ────────────────────────────────────────────────────────────
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

// Thumbnail version: shows play icon overlay for videos
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

// ────────────────────────────────────────────────────────────
// Demo listing detail — all local state, no backend calls
// ────────────────────────────────────────────────────────────
interface DemoMessage {
  id: string;
  content: string;
  fromMe: boolean;
  timestamp: number;
}

function DemoListingDetail({ listingId }: { listingId: string }) {
  const navigate = useNavigate();
  const listing = DEMO_LISTINGS.find((d) => d.id === listingId);
  const [messages, setMessages] = useState<DemoMessage[]>([]);
  const [message, setMessage] = useState("");
  const [replying, setReplying] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional scroll trigger
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  if (!listing) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-xl text-center">
        <Alert variant="destructive" data-ocid="listing.error_state">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Demo listing not found.</AlertDescription>
        </Alert>
        <Button onClick={() => navigate({ to: "/" })} className="mt-4">
          Back to Browse
        </Button>
      </div>
    );
  }

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || replying) return;
    const userMsg: DemoMessage = {
      id: `msg-${Date.now()}`,
      content: message.trim(),
      fromMe: true,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setMessage("");
    setReplying(true);
    setTimeout(() => {
      const reply =
        DEMO_AUTO_REPLIES[Math.floor(Math.random() * DEMO_AUTO_REPLIES.length)];
      const sellerMsg: DemoMessage = {
        id: `msg-${Date.now()}-reply`,
        content: reply,
        fromMe: false,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, sellerMsg]);
      setReplying(false);
    }, 1000);
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">
      {/* Demo banner */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 mb-5 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-2xl text-amber-700 text-sm"
        data-ocid="listing.panel"
      >
        <FlaskConical className="h-4 w-4 shrink-0" />
        <span>
          This is a <strong>demo listing</strong> for testing purposes. Chat
          responses are automated.
        </span>
      </motion.div>

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
        <Link to="/" className="hover:text-primary transition-colors">
          Browse
        </Link>
        <span>/</span>
        <span className="text-muted-foreground">
          {CATEGORY_LABELS[listing.category] ?? listing.category}
        </span>
        <span>/</span>
        <span className="text-foreground line-clamp-1">{listing.title}</span>
      </nav>

      <div className="grid md:grid-cols-5 gap-8">
        {/* Image placeholder */}
        <div className="md:col-span-3 space-y-3">
          <div className="relative aspect-square bg-muted rounded-3xl overflow-hidden border border-border flex items-center justify-center">
            <span className="text-[7rem] select-none">{listing.emoji}</span>
            <Badge className="absolute top-3 left-3 bg-amber-500/90 text-white text-xs">
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
            </div>
          </div>

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
        </div>
      </div>

      {/* Embedded Chat */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="mt-8 border border-border rounded-3xl overflow-hidden bg-card shadow-card"
        data-ocid="listing.panel"
      >
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted">
          <MessageCircle className="h-4 w-4 text-primary" />
          <span className="font-semibold text-sm">Chat with Seller</span>
          <Badge
            variant="outline"
            className="ml-auto text-[10px] text-amber-600 border-amber-300"
          >
            Demo Mode
          </Badge>
        </div>

        {/* Messages */}
        <div className="h-72 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && (
            <p className="text-center text-sm text-muted-foreground pt-8">
              Send a message to test the chat! The seller will auto-reply.
            </p>
          )}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.fromMe ? "justify-end" : "justify-start"}`}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.15 }}
                className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${
                  msg.fromMe
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-muted text-foreground rounded-bl-sm"
                }`}
              >
                {!msg.fromMe && (
                  <p className="text-[10px] font-semibold text-muted-foreground mb-1">
                    {DEMO_SELLER_NAME}
                  </p>
                )}
                {msg.content}
                <p
                  className={`text-[10px] mt-1 ${
                    msg.fromMe
                      ? "text-primary-foreground/60"
                      : "text-muted-foreground"
                  }`}
                >
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </motion.div>
            </div>
          ))}
          {replying && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-2xl rounded-bl-sm px-3.5 py-2 text-sm text-muted-foreground">
                <span className="inline-flex gap-1">
                  <span className="animate-bounce">·</span>
                  <span className="animate-bounce [animation-delay:0.15s]">
                    ·
                  </span>
                  <span className="animate-bounce [animation-delay:0.3s]">
                    ·
                  </span>
                </span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form
          onSubmit={handleSend}
          className="p-3 border-t border-border flex gap-2"
        >
          <Textarea
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-0 h-10 resize-none py-2"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}
            data-ocid="listing.textarea"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!message.trim() || replying}
            className="shrink-0 h-10 w-10"
            data-ocid="listing.submit_button"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </motion.div>

      {/* Call Seller */}
      <div className="mt-4">
        <a href="tel:+919876543210" data-ocid="listing.secondary_button">
          <Button
            variant="outline"
            size="lg"
            className="w-full gap-2 text-base rounded-2xl border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700"
          >
            <Phone className="h-5 w-5" />
            Call Seller · +91 98765 43210
          </Button>
        </a>
        <a
          href="https://wa.me/919876543210"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button
            variant="outline"
            size="lg"
            className="w-full gap-2 text-base rounded-2xl border-[#25D366] text-[#25D366] hover:bg-green-50 mt-2"
          >
            <MessageCircle className="h-5 w-5" />
            WhatsApp Seller
          </Button>
        </a>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Real listing detail
// ────────────────────────────────────────────────────────────
export default function ListingDetailPage() {
  const { listingId } = useParams({ strict: false }) as { listingId: string };

  // Render demo branch without any backend calls
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
  const [chatOpen, setChatOpen] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: messages } = useGetMessagesForListing(listingId, chatOpen);
  const { data: sellerProfile } = useGetSellerProfile(
    listing?.seller.toString() ?? "",
  );
  const { mutateAsync: postMessage, isPending: sending } = usePostMessage();

  const isMySelling =
    isAuthenticated &&
    listing?.seller.toString() === identity?.getPrincipal().toString();

  useEffect(() => {
    if (chatOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !listing) return;
    if (!isAuthenticated) {
      toast.error("Please login to send messages");
      return;
    }
    try {
      await postMessage({
        listingId: listing.id,
        recipient: listing.seller,
        content: message.trim(),
      });
      setMessage("");
    } catch {
      toast.error("Failed to send message");
    }
  };

  const handleCallSeller = () => {
    const phone = sellerProfile?.phone;
    if (!phone || phone.trim() === "") {
      toast.info("Phone number not available");
      return;
    }
    const normalized = phone.replace(/\D/g, "");
    window.location.href = `tel:+${normalized.startsWith("91") ? normalized : `91${normalized}`}`;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <Skeleton className="h-6 w-32 mb-6" />
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
    );
  }

  if (isError || !listing) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-xl text-center">
        <Alert variant="destructive" data-ocid="listing.error_state">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Listing not found or unavailable.</AlertDescription>
        </Alert>
        <Button onClick={() => navigate({ to: "/" })} className="mt-4">
          Back to Browse
        </Button>
      </div>
    );
  }

  const images = listing.images.map((img) => img.getDirectURL());

  // Extract model prefix from description if present
  const modelMatch = listing.description.match(/^\[Model: (.+?)\]\n/);
  const modelLabel = modelMatch ? modelMatch[1] : null;
  const whatsappMatch = listing.description.match(/\[WhatsApp: (.+?)\]\n/);
  const whatsappNumber = whatsappMatch ? whatsappMatch[1] : null;
  const cleanDescription = listing.description
    .replace(/^\[Model: .+?\]\n/, "")
    .replace(/^\[Featured\]\n/, "")
    .replace(/\[WhatsApp: .+?\]\n/, "");

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
        <Link to="/" className="hover:text-primary transition-colors">
          Browse
        </Link>
        <span>/</span>
        <span className="text-muted-foreground">
          {CATEGORY_LABELS[listing.category] ?? listing.category}
        </span>
        <span>/</span>
        <span className="text-foreground line-clamp-1">{listing.title}</span>
      </nav>

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
                    setActiveImage((i) => Math.min(images.length - 1, i + 1))
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
            </div>
          </div>

          <Separator />

          {/* Description */}
          <div>
            <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-2">
              Description
            </h2>
            <p className="text-sm leading-relaxed text-foreground whitespace-pre-line">
              {cleanDescription}
            </p>
          </div>

          {/* CTA */}
          {!isMySelling && (
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => {
                  if (!isAuthenticated) {
                    toast.error("Please login to message the seller");
                    login();
                    return;
                  }
                  setChatOpen(true);
                }}
                className="flex-1 gap-2 text-base rounded-2xl"
                size="lg"
                data-ocid="listing.primary_button"
              >
                <MessageCircle className="h-5 w-5" />
                Message Seller
              </Button>
              <Button
                variant="outline"
                onClick={handleCallSeller}
                className="flex-1 gap-2 text-base rounded-2xl border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700"
                size="lg"
                data-ocid="listing.secondary_button"
              >
                <Phone className="h-5 w-5" />
                Call Seller
              </Button>
            </div>
          )}
          {whatsappNumber && (
            <a
              href={`https://wa.me/${whatsappNumber.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              data-ocid="listing.secondary_button"
            >
              <Button
                variant="outline"
                size="lg"
                className="w-full gap-2 text-base rounded-2xl border-[#25D366] text-[#25D366] hover:bg-green-50 mt-2"
              >
                <MessageCircle className="h-5 w-5" />
                WhatsApp Seller
              </Button>
            </a>
          )}
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

      {/* Chat Panel */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.3 }}
            className="mt-8 border border-border rounded-3xl overflow-hidden bg-card shadow-card"
            data-ocid="listing.panel"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-primary" />
                <span className="font-semibold text-sm">Chat with Seller</span>
              </div>
              <button
                type="button"
                onClick={() => setChatOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close chat"
                data-ocid="listing.close_button"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="h-72 overflow-y-auto p-4 space-y-3">
              {messages && messages.length === 0 && (
                <p className="text-center text-sm text-muted-foreground pt-8">
                  No messages yet. Say hello!
                </p>
              )}
              {messages?.map((msg) => {
                const isMe =
                  msg.sender.toString() === identity?.getPrincipal().toString();
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${
                        isMe
                          ? "bg-primary text-primary-foreground rounded-br-sm"
                          : "bg-muted text-foreground rounded-bl-sm"
                      }`}
                    >
                      {msg.content}
                      <p
                        className={`text-[10px] mt-1 ${
                          isMe
                            ? "text-primary-foreground/60"
                            : "text-muted-foreground"
                        }`}
                      >
                        {formatTimeAgo(msg.timestamp)}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form
              onSubmit={handleSendMessage}
              className="p-3 border-t border-border flex gap-2"
            >
              <Textarea
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-0 h-10 resize-none py-2"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
                data-ocid="listing.textarea"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!message.trim() || sending}
                className="shrink-0 h-10 w-10"
                data-ocid="listing.submit_button"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
