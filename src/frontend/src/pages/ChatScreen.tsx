import { useNavigate, useSearch } from "@tanstack/react-router";
import { ArrowLeft, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetListing,
  useGetMessagesForListing,
  useGetSellerProfile,
  usePostMessage,
} from "../hooks/useQueries";
import { formatTimeAgo } from "../utils/format";

const QUICK_REPLIES = [
  "Is this available?",
  "What's your best price?",
  "Can we meet today?",
  "Still for sale?",
  "Can you share more photos?",
];

export default function ChatScreen() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/chat" }) as { listingId?: string };
  const listingId = search.listingId ?? "";

  const { identity, login } = useInternetIdentity();
  const myPrincipal = identity?.getPrincipal().toString();

  const { data: listing, isLoading: listingLoading } = useGetListing(listingId);
  const sellerPrincipalStr = listing?.seller.toString() ?? "";
  const { data: sellerProfile } = useGetSellerProfile(sellerPrincipalStr);
  const { data: messages = [], isLoading: msgsLoading } =
    useGetMessagesForListing(listingId, !!listingId);
  const { mutateAsync: postMessage, isPending } = usePostMessage();

  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when the end marker mounts or messages container changes
  const scrollToBottom = (node: HTMLDivElement | null) => {
    if (node) node.scrollIntoView({ behavior: "smooth" });
    messagesEndRef.current = node;
  };

  const sellerName =
    sellerProfile?.name ||
    (sellerPrincipalStr ? `${sellerPrincipalStr.slice(0, 10)}…` : "Seller");

  const productImage = listing?.images[0]?.getDirectURL?.() ?? null;
  const productTitle = listing?.title ?? "";
  const productPrice = listing
    ? new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }).format(Number(listing.price))
    : "";

  const handleSend = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content) return;
    if (!identity) {
      login();
      return;
    }
    if (!listing) return;
    try {
      await postMessage({
        listingId,
        recipient: listing.seller,
        content,
      });
      setInput("");
      inputRef.current?.focus();
    } catch {
      /* ignore */
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] bg-white flex flex-col"
      data-ocid="chat.panel"
    >
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 shadow-sm shrink-0">
        <button
          type="button"
          onClick={() => navigate({ to: -1 as any })}
          className="p-1.5 -ml-1 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Go back"
          data-ocid="chat.close_button"
        >
          <ArrowLeft className="h-5 w-5 text-gray-700" />
        </button>

        {/* Seller avatar + info */}
        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0 text-blue-700 font-bold text-base select-none">
          {sellerName.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm truncate">
            {sellerName}
          </p>
          <span className="flex items-center gap-1 text-xs text-green-600">
            <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
            Online
          </span>
        </div>
      </div>

      {/* Product mini-bar */}
      {!listingLoading && listing && (
        <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 flex items-center gap-3 shrink-0">
          <div className="h-10 w-10 rounded-lg bg-gray-200 overflow-hidden shrink-0 flex items-center justify-center text-2xl">
            {productImage ? (
              <img
                src={productImage}
                alt={productTitle}
                className="w-full h-full object-cover"
              />
            ) : (
              "📱"
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-600 truncate leading-snug">
              {productTitle}
            </p>
            <p className="text-sm font-bold text-blue-600 leading-snug">
              {productPrice}
            </p>
          </div>
        </div>
      )}

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50">
        {msgsLoading && (
          <p
            className="text-center text-sm text-gray-400 pt-12"
            data-ocid="chat.loading_state"
          >
            Loading messages…
          </p>
        )}
        {!msgsLoading && messages.length === 0 && (
          <div
            className="flex flex-col items-center justify-center h-full pt-16 gap-3"
            data-ocid="chat.empty_state"
          >
            <div className="h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center text-2xl">
              💬
            </div>
            <p className="text-gray-500 text-sm text-center">
              Start the conversation
            </p>
            <p className="text-gray-400 text-xs text-center">
              Say hi to {sellerName} about this listing
            </p>
          </div>
        )}
        {messages.map((msg) => {
          const isMe = msg.sender.toString() === myPrincipal;
          return (
            <div
              key={msg.id}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] px-4 py-2.5 text-sm shadow-sm ${
                  isMe
                    ? "bg-blue-600 text-white rounded-2xl rounded-br-sm"
                    : "bg-white text-gray-900 rounded-2xl rounded-bl-sm border border-gray-100"
                }`}
              >
                <p className="leading-relaxed break-words">{msg.content}</p>
                <p
                  className={`text-[10px] mt-1 ${
                    isMe ? "text-blue-200 text-right" : "text-gray-400"
                  }`}
                >
                  {formatTimeAgo(msg.timestamp)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={scrollToBottom} />
      </div>

      {/* Quick reply chips */}
      <div className="bg-white border-t border-gray-100 px-3 py-2 flex gap-2 overflow-x-auto shrink-0 no-scrollbar">
        {QUICK_REPLIES.map((reply) => (
          <button
            key={reply}
            type="button"
            onClick={() => setInput(reply)}
            className="shrink-0 border border-blue-200 text-blue-700 bg-blue-50 rounded-full px-3 py-1 text-xs font-medium hover:bg-blue-100 transition-colors whitespace-nowrap"
            data-ocid="chat.button"
          >
            {reply}
          </button>
        ))}
      </div>

      {/* Input bar */}
      <div className="bg-white border-t border-gray-200 px-3 py-3 flex items-center gap-2 shrink-0">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message…"
          className="flex-1 px-4 py-2.5 text-sm bg-gray-100 rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-shadow"
          data-ocid="chat.input"
        />
        <button
          type="button"
          onClick={() => handleSend()}
          disabled={isPending || !input.trim()}
          className="h-10 w-10 rounded-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 flex items-center justify-center transition-colors shadow-sm shrink-0"
          aria-label="Send message"
          data-ocid="chat.submit_button"
        >
          <Send className="h-4 w-4 text-white" />
        </button>
      </div>
    </div>
  );
}
