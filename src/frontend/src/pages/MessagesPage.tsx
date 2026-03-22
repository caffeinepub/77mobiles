import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  CheckCheck,
  Handshake,
  ImageIcon,
  Loader2,
  MapPin,
  MessageCircle,
  Mic,
  Paperclip,
  Pause,
  Play,
  Send,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetCallerRelatedListings,
  useGetMessagesForListing,
  usePostMessage,
} from "../hooks/useQueries";
import {
  conditionClass,
  conditionLabel,
  formatPrice,
  formatTimeAgo,
} from "../utils/format";

const WAVEFORM_BARS = [
  { id: "a", h: 3 },
  { id: "b", h: 5 },
  { id: "c", h: 8 },
  { id: "d", h: 6 },
  { id: "e", h: 9 },
  { id: "f", h: 7 },
  { id: "g", h: 4 },
  { id: "j", h: 6 },
  { id: "k", h: 8 },
  { id: "l", h: 5 },
  { id: "m", h: 3 },
  { id: "n", h: 7 },
  { id: "o", h: 9 },
  { id: "p", h: 5 },
  { id: "q", h: 4 },
];

// ── helpers ───────────────────────────────────────────────────────────────────
function parseMessageType(content: string) {
  if (content === "[DEAL_CONFIRMED]") return { type: "deal" as const };
  if (content.startsWith("[AUDIO:")) {
    const b64 = content.slice(7, -1);
    return { type: "audio" as const, b64 };
  }
  if (content.startsWith("[LOCATION:")) {
    const coords = content.slice(10, -1);
    const [lat, lng] = coords.split(",");
    return { type: "location" as const, lat, lng };
  }
  if (content.startsWith("[IMAGE:")) {
    const dataUrl = content.slice(7, -1);
    return { type: "image" as const, dataUrl };
  }
  return { type: "text" as const };
}

function formatDuration(secs: number) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// ── Audio Player component ────────────────────────────────────────────────────
function AudioBubble({ b64, isMe }: { b64: string; isMe: boolean }) {
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [current, setCurrent] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const src = `data:audio/webm;base64,${b64}`;
    const a = new Audio(src);
    audioRef.current = a;
    a.onloadedmetadata = () => setDuration(Math.round(a.duration) || 0);
    a.ontimeupdate = () => setCurrent(Math.round(a.currentTime));
    a.onended = () => setPlaying(false);
    return () => {
      a.pause();
      a.src = "";
    };
  }, [b64]);

  const toggle = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play();
      setPlaying(true);
    }
  };

  return (
    <div className="flex items-center gap-2 min-w-[160px]">
      <button
        onClick={toggle}
        className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
          isMe
            ? "bg-white/20 hover:bg-white/30"
            : "bg-black/10 hover:bg-black/15"
        } transition-colors`}
        type="button"
      >
        {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </button>
      {/* Waveform bars */}
      <div className="flex items-end gap-0.5 h-6">
        {WAVEFORM_BARS.map((bar) => (
          <div
            key={bar.id}
            className={`w-0.5 rounded-full ${
              isMe ? "bg-white/60" : "bg-black/30"
            }`}
            style={{ height: `${bar.h * 2}px` }}
          />
        ))}
      </div>
      <span className="text-xs opacity-70 shrink-0">
        {formatDuration(playing ? current : duration)}
      </span>
    </div>
  );
}

// ── Location Bubble ───────────────────────────────────────────────────────────
function LocationBubble({
  lat,
  lng,
  isMe,
}: {
  lat: string;
  lng: string;
  isMe: boolean;
}) {
  const mapsUrl = `https://maps.google.com/?q=${lat},${lng}`;
  return (
    <div className="min-w-[180px]">
      <div
        className={`flex items-center gap-2 mb-1 font-semibold text-sm ${
          isMe ? "text-white" : "text-foreground"
        }`}
      >
        <MapPin className="h-4 w-4 shrink-0" />
        Shared Location
      </div>
      <p className="text-xs mb-2 opacity-70">
        {Number.parseFloat(lat).toFixed(5)}, {Number.parseFloat(lng).toFixed(5)}
      </p>
      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`text-xs underline font-medium ${
          isMe ? "text-white/90" : "text-blue-600"
        }`}
      >
        Open in Maps →
      </a>
    </div>
  );
}

// ── Image Bubble ──────────────────────────────────────────────────────────────
function ImageBubble({
  dataUrl,
  onOpen,
}: {
  dataUrl: string;
  onOpen: (url: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen(dataUrl)}
      className="block rounded-lg overflow-hidden max-w-[200px] focus:outline-none focus:ring-2 focus:ring-[#075E54]"
      aria-label="View photo"
    >
      <img
        src={dataUrl}
        alt="Shared media"
        className="w-full h-auto object-cover rounded-lg hover:opacity-90 transition-opacity"
      />
    </button>
  );
}

// ── Lightbox ──────────────────────────────────────────────────────────────────
function Lightbox({
  url,
  onClose,
}: {
  url: string;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      <motion.div
        key="lightbox"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
        onClick={onClose}
      >
        <motion.img
          src={url}
          alt="Full size"
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.85, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          className="max-w-[90vw] max-h-[90vh] rounded-xl object-contain shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        />
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 h-10 w-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          aria-label="Close"
          data-ocid="messages.close_button"
        >
          <X className="h-5 w-5" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function MessagesPage() {
  const { identity, login, loginStatus } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === "logging-in";

  const [selectedListingId, setSelectedListingId] = useState<string | null>(
    null,
  );
  const [replyText, setReplyText] = useState("");
  const [attachOpen, setAttachOpen] = useState(false);
  const [dealDialogOpen, setDealDialogOpen] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  // Voice recording state
  const [recording, setRecording] = useState(false);
  const [recordingSecs, setRecordingSecs] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  const { data: relatedListings, isLoading: loadingListings } =
    useGetCallerRelatedListings();
  const selectedListing =
    relatedListings?.find((l) => l.id === selectedListingId) ?? null;

  const { data: messages, isLoading: loadingMessages } =
    useGetMessagesForListing(selectedListingId ?? "", !!selectedListingId);

  const { mutateAsync: postMessage, isPending: sending } = usePostMessage();

  // Auto-scroll to bottom on new messages
  const msgCount = messages?.length ?? 0;
  // biome-ignore lint/correctness/useExhaustiveDependencies: msgCount drives scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgCount]);

  // ── Recipient helper ──────────────────────────────────────────────────────
  const getRecipient = useCallback(() => {
    if (!selectedListing || !identity) return null;
    const isMySelling =
      selectedListing.seller.toString() === identity.getPrincipal().toString();
    if (isMySelling && messages && messages.length > 0) {
      const buyerMsg = messages.find(
        (m) => m.sender.toString() !== identity.getPrincipal().toString(),
      );
      return buyerMsg ? buyerMsg.sender : null;
    }
    return selectedListing.seller;
  }, [selectedListing, identity, messages]);

  // ── Send text ─────────────────────────────────────────────────────────────
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedListing) return;
    const recipient = getRecipient();
    if (!recipient) return;
    try {
      await postMessage({
        listingId: selectedListing.id,
        recipient,
        content: replyText.trim(),
      });
      setReplyText("");
    } catch {
      toast.error("Failed to send message");
    }
  };

  // ── Voice recording ───────────────────────────────────────────────────────
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "audio/ogg";
      const mr = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mr.start(100);
      mediaRecorderRef.current = mr;
      setRecording(true);
      setRecordingSecs(0);
      timerRef.current = setInterval(
        () => setRecordingSecs((s) => s + 1),
        1000,
      );
    } catch {
      toast.error("Microphone access denied");
    }
  };

  const stopRecording = useCallback(() => {
    if (!mediaRecorderRef.current || !recording) return;
    const mr = mediaRecorderRef.current;
    mr.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: mr.mimeType });
      for (const track of mr.stream.getTracks()) track.stop();
      const reader = new FileReader();
      reader.onloadend = async () => {
        const result = reader.result as string;
        const b64 = result.split(",")[1];
        const recipient = getRecipient();
        if (!recipient || !selectedListing) return;
        try {
          await postMessage({
            listingId: selectedListing.id,
            recipient,
            content: `[AUDIO:${b64}]`,
          });
        } catch {
          toast.error("Failed to send voice note");
        }
      };
      reader.readAsDataURL(blob);
    };
    mr.stop();
    setRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  }, [recording, selectedListing, getRecipient, postMessage]);

  // ── Location sharing ──────────────────────────────────────────────────────
  const shareLocation = () => {
    setAttachOpen(false);
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const recipient = getRecipient();
        if (!recipient || !selectedListing) return;
        try {
          await postMessage({
            listingId: selectedListing.id,
            recipient,
            content: `[LOCATION:${latitude},${longitude}]`,
          });
          toast.success("Location shared!");
        } catch {
          toast.error("Failed to share location");
        }
      },
      () =>
        toast.error(
          "Location access denied. Please enable location in browser settings.",
        ),
    );
  };

  // ── Photo sharing ─────────────────────────────────────────────────────────
  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (imageInputRef.current) imageInputRef.current.value = "";

    const recipient = getRecipient();
    if (!recipient || !selectedListing) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const dataUrl = reader.result as string;
      try {
        await postMessage({
          listingId: selectedListing.id,
          recipient,
          content: `[IMAGE:${dataUrl}]`,
        });
      } catch {
        toast.error("Failed to send photo");
      }
    };
    reader.readAsDataURL(file);
  };

  const triggerPhotoUpload = () => {
    setAttachOpen(false);
    imageInputRef.current?.click();
  };

  // ── Deal confirmed ────────────────────────────────────────────────────────
  const confirmDeal = async () => {
    const recipient = getRecipient();
    if (!recipient || !selectedListing) return;
    try {
      await postMessage({
        listingId: selectedListing.id,
        recipient,
        content: "[DEAL_CONFIRMED]",
      });
      toast.success("Deal confirmed! Both parties notified.");
    } catch {
      toast.error("Failed to confirm deal");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-md text-center">
        <span className="text-6xl mb-4 block">💬</span>
        <h2 className="font-display font-bold text-2xl mb-2">Your Messages</h2>
        <p className="text-muted-foreground text-sm mb-6">
          Login to view your conversations.
        </p>
        <Button
          onClick={() => login()}
          disabled={isLoggingIn}
          size="lg"
          className="w-full"
          data-ocid="messages.primary_button"
        >
          {isLoggingIn ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Logging in...
            </>
          ) : (
            "Login"
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <h1 className="font-display font-bold text-2xl mb-6">Messages</h1>

      {/* Hidden photo input */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handlePhotoSelect}
        data-ocid="messages.upload_button"
      />

      {/* Lightbox */}
      {lightboxUrl && (
        <Lightbox url={lightboxUrl} onClose={() => setLightboxUrl(null)} />
      )}

      <div className="grid md:grid-cols-5 gap-0 h-[calc(100vh-220px)] min-h-[500px] rounded-2xl overflow-hidden border border-border shadow-card">
        {/* ── Conversations list ─────────────────────────────────────────── */}
        <div
          className={`md:col-span-2 border-r border-border flex flex-col bg-card ${
            selectedListingId ? "hidden md:flex" : "flex"
          }`}
        >
          <div
            className="px-4 py-3 flex items-center gap-2"
            style={{ background: "#075E54" }}
          >
            <MessageCircle className="h-5 w-5 text-white/80" />
            <p className="font-semibold text-sm text-white">Conversations</p>
          </div>

          <ScrollArea className="flex-1">
            {loadingListings ? (
              <div className="p-3 space-y-3" data-ocid="messages.loading_state">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-lg" />
                ))}
              </div>
            ) : !relatedListings || relatedListings.length === 0 ? (
              <div className="p-8 text-center" data-ocid="messages.empty_state">
                <MessageCircle className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  No conversations yet
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Browse listings and message sellers
                </p>
                <Link to="/">
                  <Button variant="outline" size="sm" className="mt-4">
                    Browse Listings
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {relatedListings.map((listing, i) => (
                  <motion.button
                    key={listing.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => setSelectedListingId(listing.id)}
                    className={`w-full text-left p-3 flex gap-3 items-center transition-colors ${
                      selectedListingId === listing.id
                        ? "bg-[#075E54]/10"
                        : "hover:bg-muted/60"
                    }`}
                    data-ocid={`messages.item.${i + 1}`}
                  >
                    <div
                      className="h-12 w-12 rounded-full overflow-hidden shrink-0 flex items-center justify-center text-white font-bold text-lg"
                      style={{ background: "#075E54" }}
                    >
                      {listing.images[0] ? (
                        <img
                          src={listing.images[0].getDirectURL()}
                          alt={listing.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        (listing.title[0]?.toUpperCase() ?? "📱")
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {listing.title}
                      </p>
                      <p
                        className="text-xs font-semibold"
                        style={{ color: "#075E54" }}
                      >
                        {formatPrice(listing.price)}
                      </p>
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${conditionClass(listing.condition)}`}
                      >
                        {conditionLabel(listing.condition)}
                      </span>
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* ── Message thread ─────────────────────────────────────────────── */}
        <div
          className={`md:col-span-3 flex flex-col ${
            !selectedListingId ? "hidden md:flex" : "flex"
          }`}
        >
          {!selectedListing ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-card">
              <MessageCircle className="h-12 w-12 text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground text-sm">
                Select a conversation to view messages
              </p>
            </div>
          ) : (
            <>
              {/* WA Chat Header */}
              <div
                className="px-3 py-2.5 flex items-center gap-3 shrink-0"
                style={{ background: "#075E54" }}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden h-8 w-8 text-white hover:bg-white/10"
                  onClick={() => setSelectedListingId(null)}
                  data-ocid="messages.button"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div
                  className="h-9 w-9 rounded-full overflow-hidden shrink-0 flex items-center justify-center text-white font-bold"
                  style={{ background: "#128C7E" }}
                >
                  {selectedListing.images[0] ? (
                    <img
                      src={selectedListing.images[0].getDirectURL()}
                      alt={selectedListing.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    (selectedListing.title[0]?.toUpperCase() ?? "📱")
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-white truncate">
                    {selectedListing.title}
                  </p>
                  <p className="text-xs text-white/70">
                    {formatPrice(selectedListing.price)}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-white border-white/40 hover:bg-white/10 text-xs h-7 px-2 shrink-0"
                  onClick={() => setDealDialogOpen(true)}
                  data-ocid="messages.open_modal_button"
                >
                  <Handshake className="h-3.5 w-3.5 mr-1" />
                  Deal Done
                </Button>
                <Link
                  to="/listing/$listingId"
                  params={{ listingId: selectedListing.id }}
                >
                  <Badge
                    variant="outline"
                    className="text-white border-white/40 hover:bg-white/10 text-xs cursor-pointer shrink-0"
                  >
                    View
                  </Badge>
                </Link>
              </div>

              {/* Chat background with dot pattern */}
              <div
                className="flex-1 overflow-hidden relative"
                style={{
                  backgroundImage:
                    "radial-gradient(circle, rgba(0,0,0,0.07) 1px, transparent 1px)",
                  backgroundSize: "20px 20px",
                  backgroundColor: "#ECE5DD",
                }}
              >
                <ScrollArea className="h-full">
                  <div className="p-4 space-y-1.5">
                    {loadingMessages ? (
                      <div
                        className="space-y-3"
                        data-ocid="messages.loading_state"
                      >
                        {[1, 2, 3].map((i) => (
                          <Skeleton key={i} className="h-10 w-2/3 rounded-xl" />
                        ))}
                      </div>
                    ) : messages && messages.length === 0 ? (
                      <div
                        className="flex flex-col items-center justify-center py-16"
                        data-ocid="messages.empty_state"
                      >
                        <div className="bg-white/80 rounded-xl px-5 py-3 text-center shadow">
                          <p className="text-sm text-gray-500">
                            No messages yet
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            Say hello! 👋
                          </p>
                        </div>
                      </div>
                    ) : (
                      <AnimatePresence initial={false}>
                        {messages?.map((msg, idx) => {
                          const isMe =
                            msg.sender.toString() ===
                            identity?.getPrincipal().toString();
                          const parsed = parseMessageType(msg.content);

                          if (parsed.type === "deal") {
                            return (
                              <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex justify-center my-3"
                              >
                                <div
                                  className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-white shadow-md"
                                  style={{ background: "#128C7E" }}
                                  data-ocid={`messages.item.${idx + 1}`}
                                >
                                  ✅ Deal confirmed after device inspection
                                </div>
                              </motion.div>
                            );
                          }

                          return (
                            <motion.div
                              key={msg.id}
                              initial={{ opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.15 }}
                              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                              data-ocid={`messages.item.${idx + 1}`}
                            >
                              <div
                                className={`relative ${
                                  parsed.type === "image" ? "p-1" : "px-3 py-2"
                                } text-sm shadow-sm ${
                                  isMe
                                    ? "rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl rounded-br-sm"
                                    : "rounded-tl-2xl rounded-tr-2xl rounded-br-2xl rounded-bl-sm"
                                }`}
                                style={{
                                  background:
                                    parsed.type === "image"
                                      ? "transparent"
                                      : isMe
                                        ? "#DCF8C6"
                                        : "#FFFFFF",
                                  maxWidth: "72%",
                                }}
                              >
                                {parsed.type === "audio" && (
                                  <AudioBubble b64={parsed.b64} isMe={isMe} />
                                )}
                                {parsed.type === "location" && (
                                  <LocationBubble
                                    lat={parsed.lat}
                                    lng={parsed.lng}
                                    isMe={isMe}
                                  />
                                )}
                                {parsed.type === "image" && (
                                  <ImageBubble
                                    dataUrl={parsed.dataUrl}
                                    onOpen={setLightboxUrl}
                                  />
                                )}
                                {parsed.type === "text" && (
                                  <p className="leading-snug break-words pr-10 text-gray-800">
                                    {msg.content}
                                  </p>
                                )}
                                {parsed.type !== "image" && (
                                  <p className="flex items-center gap-0.5 text-[10px] text-gray-400 mt-1 justify-end">
                                    {formatTimeAgo(msg.timestamp)}
                                    {isMe && (
                                      <CheckCheck className="h-3 w-3 text-[#53BDEB]" />
                                    )}
                                  </p>
                                )}
                              </div>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
              </div>

              {/* ── Input bar ──────────────────────────────────────────────── */}
              <div
                className="px-2 py-2 flex items-end gap-2 shrink-0"
                style={{ background: "#F0F0F0" }}
              >
                <Popover open={attachOpen} onOpenChange={setAttachOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      type="button"
                      className="h-10 w-10 rounded-full text-gray-500 hover:bg-gray-200 shrink-0"
                      data-ocid="messages.button"
                    >
                      <Paperclip className="h-5 w-5" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    side="top"
                    align="start"
                    className="w-48 p-1"
                    data-ocid="messages.popover"
                  >
                    <button
                      type="button"
                      onClick={triggerPhotoUpload}
                      className="w-full flex items-center gap-2 text-sm px-3 py-2 rounded-md hover:bg-muted transition-colors"
                      data-ocid="messages.button"
                    >
                      <ImageIcon className="h-4 w-4 text-blue-500" />
                      Send Photo
                    </button>
                    <button
                      type="button"
                      onClick={shareLocation}
                      className="w-full flex items-center gap-2 text-sm px-3 py-2 rounded-md hover:bg-muted transition-colors"
                      data-ocid="messages.button"
                    >
                      <MapPin className="h-4 w-4 text-red-500" />
                      Share Location
                    </button>
                  </PopoverContent>
                </Popover>

                {recording ? (
                  <div className="flex-1 flex items-center gap-3 bg-white rounded-full px-4 py-2 h-10">
                    <div className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-sm text-gray-600">
                      Recording… {formatDuration(recordingSecs)}
                    </span>
                  </div>
                ) : (
                  <div
                    className="flex-1 bg-white rounded-full px-4 flex items-center"
                    style={{ minHeight: "40px" }}
                  >
                    <textarea
                      placeholder="Type a message"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="flex-1 resize-none bg-transparent text-sm py-2 outline-none max-h-28 leading-snug"
                      rows={1}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSend(e as any);
                        }
                      }}
                      data-ocid="messages.textarea"
                    />
                  </div>
                )}

                {replyText.trim() ? (
                  <Button
                    type="button"
                    size="icon"
                    className="h-10 w-10 rounded-full shrink-0"
                    style={{ background: "#075E54" }}
                    disabled={sending}
                    onClick={handleSend as any}
                    data-ocid="messages.submit_button"
                  >
                    {sending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    size="icon"
                    className={`h-10 w-10 rounded-full shrink-0 transition-colors ${
                      recording ? "bg-red-500 hover:bg-red-600" : ""
                    }`}
                    style={recording ? {} : { background: "#075E54" }}
                    onPointerDown={startRecording}
                    onPointerUp={stopRecording}
                    onPointerLeave={stopRecording}
                    data-ocid="messages.button"
                  >
                    <Mic className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Deal Dialog ─────────────────────────────────────────────────── */}
      <AlertDialog open={dealDialogOpen} onOpenChange={setDealDialogOpen}>
        <AlertDialogContent data-ocid="messages.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deal</AlertDialogTitle>
            <AlertDialogDescription>
              Confirm deal after device inspection? This will notify both
              parties.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="messages.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              style={{ background: "#075E54" }}
              onClick={() => {
                setDealDialogOpen(false);
                confirmDeal();
              }}
              data-ocid="messages.confirm_button"
            >
              🤝 Yes, Deal Done!
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
