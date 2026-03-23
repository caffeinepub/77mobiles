import { useLocation, useNavigate } from "@tanstack/react-router";
import { FileText, Home, MessageSquare, Plus, User } from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function BottomNav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  const tabClass = (path: string) =>
    `flex flex-col items-center justify-center gap-0.5 flex-1 py-2 text-[10px] font-medium transition-colors ${
      isActive(path)
        ? "text-primary"
        : "text-muted-foreground hover:text-foreground"
    }`;

  const handleAuthRequired = (dest: string) => {
    if (!isAuthenticated) {
      navigate({ to: "/login" });
    } else {
      navigate({ to: dest as any });
    }
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border/60 shadow-[0_-2px_12px_rgba(0,0,0,0.06)] flex items-stretch h-16 safe-area-pb"
      data-ocid="bottom_nav.panel"
    >
      {/* Home */}
      <button
        type="button"
        onClick={() => navigate({ to: "/" })}
        className={tabClass("/")}
        data-ocid="bottom_nav.home.link"
      >
        <Home className="h-5 w-5" />
        <span>Home</span>
      </button>

      {/* Chats */}
      <button
        type="button"
        onClick={() => handleAuthRequired("/messages")}
        className={tabClass("/messages")}
        data-ocid="bottom_nav.chats.link"
      >
        <div className="relative">
          <MessageSquare className="h-5 w-5" />
          {/* Notification dot */}
          <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-orange-500 border-2 border-background" />
        </div>
        <span>Chats</span>
      </button>

      {/* Sell — prominent center button */}
      <button
        type="button"
        onClick={() => navigate({ to: "/post" })}
        className="flex flex-col items-center justify-center flex-1 py-1"
        data-ocid="bottom_nav.sell.button"
      >
        <div className="-mt-5 flex items-center justify-center h-[62px] w-[62px] rounded-full bg-white border-[3px] border-yellow-400 shadow-lg shadow-[0_0_12px_3px_rgba(37,99,235,0.35)] transition-transform active:scale-95">
          <div className="flex items-center justify-center h-[50px] w-[50px] rounded-full bg-primary">
            <Plus className="h-7 w-7 text-white" strokeWidth={2.5} />
          </div>
        </div>
        <span className="text-[10px] font-semibold text-primary mt-0.5">
          Sell
        </span>
      </button>

      {/* My Ads */}
      <button
        type="button"
        onClick={() => handleAuthRequired("/my-ads")}
        className={tabClass("/my-ads")}
        data-ocid="bottom_nav.my_ads.link"
      >
        <FileText className="h-5 w-5" />
        <span>My Ads</span>
      </button>

      {/* Account */}
      <button
        type="button"
        onClick={() => handleAuthRequired("/profile")}
        className={tabClass("/profile")}
        data-ocid="bottom_nav.account.link"
      >
        <User className="h-5 w-5" />
        <span>Account</span>
      </button>
    </nav>
  );
}
