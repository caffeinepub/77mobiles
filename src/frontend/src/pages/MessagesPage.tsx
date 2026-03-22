import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Clock, Loader2, MessageCircle, Send } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
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

export default function MessagesPage() {
  const { identity, login, loginStatus } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === "logging-in";

  const [selectedListingId, setSelectedListingId] = useState<string | null>(
    null,
  );
  const [replyText, setReplyText] = useState("");

  const { data: relatedListings, isLoading: loadingListings } =
    useGetCallerRelatedListings();
  const selectedListing =
    relatedListings?.find((l) => l.id === selectedListingId) ?? null;

  const { data: messages, isLoading: loadingMessages } =
    useGetMessagesForListing(selectedListingId ?? "", !!selectedListingId);

  const { mutateAsync: postMessage, isPending: sending } = usePostMessage();

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

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedListing) return;
    const isMySelling =
      selectedListing.seller.toString() === identity?.getPrincipal().toString();
    // Determine recipient: if I'm seller, find the buyer from messages
    let recipient = selectedListing.seller;
    if (isMySelling && messages && messages.length > 0) {
      const buyerMsg = messages.find(
        (m) => m.sender.toString() !== identity?.getPrincipal().toString(),
      );
      if (buyerMsg) recipient = buyerMsg.sender;
    }
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

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <h1 className="font-display font-bold text-2xl mb-6">Messages</h1>

      <div className="grid md:grid-cols-5 gap-4 h-[calc(100vh-220px)] min-h-[400px]">
        {/* Conversations list */}
        <div
          className={`md:col-span-2 bg-card border border-border rounded-2xl overflow-hidden flex flex-col shadow-card ${
            selectedListingId ? "hidden md:flex" : "flex"
          }`}
        >
          <div className="px-4 py-3 border-b border-border">
            <p className="font-semibold text-sm">Conversations</p>
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
                  Browse listings and message sellers to get started
                </p>
                <Link to="/">
                  <Button variant="outline" size="sm" className="mt-4">
                    Browse Listings
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="p-2">
                {relatedListings.map((listing, i) => (
                  <motion.button
                    key={listing.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => setSelectedListingId(listing.id)}
                    className={`w-full text-left p-3 rounded-xl transition-colors flex gap-3 items-center ${
                      selectedListingId === listing.id
                        ? "bg-primary/10 border border-primary/20"
                        : "hover:bg-muted"
                    }`}
                    data-ocid={`messages.item.${i + 1}`}
                  >
                    <div className="h-12 w-12 rounded-lg overflow-hidden bg-muted shrink-0">
                      {listing.images[0] ? (
                        <img
                          src={listing.images[0].getDirectURL()}
                          alt={listing.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl">
                          📱
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {listing.title}
                      </p>
                      <p className="text-xs text-primary font-semibold">
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

        {/* Message thread */}
        <div
          className={`md:col-span-3 bg-card border border-border rounded-2xl overflow-hidden flex flex-col shadow-card ${
            !selectedListingId ? "hidden md:flex" : "flex"
          }`}
        >
          {!selectedListing ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <MessageCircle className="h-12 w-12 text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground text-sm">
                Select a conversation to view messages
              </p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="px-4 py-3 border-b border-border flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden h-8 w-8"
                  onClick={() => setSelectedListingId(null)}
                  data-ocid="messages.button"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="h-9 w-9 rounded-lg overflow-hidden bg-muted shrink-0">
                  {selectedListing.images[0] ? (
                    <img
                      src={selectedListing.images[0].getDirectURL()}
                      alt={selectedListing.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      📱
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">
                    {selectedListing.title}
                  </p>
                  <p className="text-xs text-primary font-medium">
                    {formatPrice(selectedListing.price)}
                  </p>
                </div>
                <Link
                  to="/listing/$listingId"
                  params={{ listingId: selectedListing.id }}
                >
                  <Badge
                    variant="outline"
                    className="text-xs cursor-pointer hover:bg-muted"
                  >
                    View
                  </Badge>
                </Link>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                {loadingMessages ? (
                  <div className="space-y-3" data-ocid="messages.loading_state">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-10 w-2/3 rounded-xl" />
                    ))}
                  </div>
                ) : messages && messages.length === 0 ? (
                  <div
                    className="flex flex-col items-center justify-center h-full py-12"
                    data-ocid="messages.empty_state"
                  >
                    <MessageCircle className="h-10 w-10 text-muted-foreground/30 mb-3" />
                    <p className="text-muted-foreground text-sm">
                      No messages yet
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {messages?.map((msg) => {
                      const isMe =
                        msg.sender.toString() ===
                        identity?.getPrincipal().toString();
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
                              className={`flex items-center gap-1 text-[10px] mt-1 ${
                                isMe
                                  ? "text-primary-foreground/60 justify-end"
                                  : "text-muted-foreground"
                              }`}
                            >
                              <Clock className="h-2.5 w-2.5" />
                              {formatTimeAgo(msg.timestamp)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>

              {/* Reply input */}
              <form
                onSubmit={handleSend}
                className="p-3 border-t border-border flex gap-2"
              >
                <Textarea
                  placeholder="Type a message..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="min-h-0 h-10 resize-none py-2"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend(e);
                    }
                  }}
                  data-ocid="messages.textarea"
                />
                <Button
                  type="submit"
                  size="icon"
                  className="shrink-0 h-10 w-10"
                  disabled={!replyText.trim() || sending}
                  data-ocid="messages.submit_button"
                >
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
