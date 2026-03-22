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
  MapPin,
  MessageCircle,
  Send,
  User,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
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

export default function ListingDetailPage() {
  const { listingId } = useParams({ strict: false }) as { listingId: string };
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
  const cleanDescription = listing.description.replace(/^\[Model: .+?\]\n/, "");

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
        {/* Images */}
        <div className="md:col-span-3 space-y-3">
          <div className="relative aspect-square bg-muted rounded-3xl overflow-hidden border border-border">
            {images.length > 0 ? (
              <img
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
                  <img
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
            <Button
              onClick={() => {
                if (!isAuthenticated) {
                  toast.error("Please login to message the seller");
                  login();
                  return;
                }
                setChatOpen(true);
              }}
              className="w-full gap-2 text-base rounded-2xl"
              size="lg"
              data-ocid="listing.primary_button"
            >
              <MessageCircle className="h-5 w-5" />
              Message Seller
            </Button>
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
