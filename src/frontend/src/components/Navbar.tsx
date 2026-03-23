import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Bell,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  MapPin,
  MessageSquare,
  Search,
  Settings,
  Store,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDealerMode } from "../hooks/useDealerMode";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetCallerUserProfile,
  useGetCallerUserRole,
} from "../hooks/useQueries";
import LocationGateModal from "./LocationGateModal";

interface Notification {
  id: string;
  text: string;
  time: string;
  read: boolean;
}

const DEMO_NOTIFICATIONS: Notification[] = [
  {
    id: "n1",
    text: "New message from Ravi about iPhone 14 Pro",
    time: "2 min ago",
    read: false,
  },
  {
    id: "n2",
    text: "Your ad was viewed 12 times today",
    time: "1 hr ago",
    read: false,
  },
  {
    id: "n3",
    text: "Price drop alert: MacBook Pro M2",
    time: "3 hr ago",
    read: false,
  },
  { id: "n4", text: "New bid on your listing", time: "5 hr ago", read: false },
];

function NotificationBell() {
  const [notifications, setNotifications] =
    useState<Notification[]>(DEMO_NOTIFICATIONS);
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleOpen = () => {
    setOpen((prev) => !prev);
    if (!open) {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={handleOpen}
        className="relative flex items-center justify-center h-9 w-9 rounded-full hover:bg-primary/10 transition-colors"
        aria-label="Notifications"
        data-ocid="nav.notification.button"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-80 bg-popover border border-border rounded-2xl shadow-lg z-50 overflow-hidden"
          data-ocid="nav.notification.popover"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <p className="font-semibold text-sm">Notifications</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-muted-foreground hover:text-foreground"
              data-ocid="nav.notification.close_button"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="max-h-72 overflow-y-auto">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`px-4 py-3 border-b border-border/50 last:border-0 ${
                  n.read ? "" : "bg-primary/5"
                }`}
              >
                <p className="text-sm text-foreground">{n.text}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {n.time}
                </p>
              </div>
            ))}
          </div>
          <div className="px-4 py-2.5 border-t border-border">
            <button
              type="button"
              className="text-xs text-primary hover:underline font-medium w-full text-center"
              onClick={() => setOpen(false)}
              data-ocid="nav.notification.link"
            >
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const [searchValue, setSearchValue] = useState("");
  const [userLocation, setUserLocation] = useState<string>(
    () => localStorage.getItem("userLocation") || "",
  );
  const [showLocationModal, setShowLocationModal] = useState(false);
  const navigate = useNavigate();
  const { identity, login, loginStatus } = useInternetIdentity();
  const qc = useQueryClient();
  const { data: role } = useGetCallerUserRole();
  const { dealerMode, setDealerMode } = useDealerMode();
  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === "logging-in";
  const isAdmin = role === "admin";

  useEffect(() => {
    const handler = (e: Event) => {
      const custom = e as CustomEvent<string>;
      setUserLocation(custom.detail);
    };
    window.addEventListener("locationChanged", handler);
    return () => window.removeEventListener("locationChanged", handler);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({
      to: "/",
      search: (prev) => ({ ...prev, q: searchValue }),
    } as any);
  };

  const handleLogout = async () => {
    await qc.clear();
  };

  const handleEnableDealerMode = () => {
    setDealerMode(true);
    navigate({ to: "/dealer" } as any);
  };

  const handleDisableDealerMode = () => {
    setDealerMode(false);
  };

  return (
    <div className="sticky top-0 z-50">
      <header className="w-full border-b border-border/40 backdrop-blur-xl bg-background/80 supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-14 flex items-center gap-3">
          {/* Logo */}
          <Link
            to="/"
            className="font-display font-black text-xl tracking-tight shrink-0"
            data-ocid="nav.link"
          >
            <span className="text-foreground">77</span>
            <span className="text-primary">mobiles</span>
          </Link>

          {/* Search */}
          <form
            onSubmit={handleSearch}
            className="flex-1 max-w-md mx-auto hidden sm:flex items-center gap-2"
          >
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search phones, MacBooks..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="pl-9 h-9 rounded-xl bg-muted/50 border-transparent focus:border-primary/40"
                data-ocid="nav.search_input"
              />
            </div>
          </form>

          {/* Actions — right side: location + bell (if auth) + login (if unauth) */}
          <div className="flex items-center gap-2 shrink-0 ml-auto">
            {isAuthenticated && (
              <Link to="/messages" search={{}}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hidden sm:flex hover:text-primary hover:bg-primary/10"
                  data-ocid="nav.link"
                >
                  <MessageSquare className="h-5 w-5" />
                </Button>
              </Link>
            )}

            {isAdmin && (
              <Link to="/admin">
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden sm:flex gap-1.5 hover:text-primary hover:bg-primary/10 text-muted-foreground"
                  data-ocid="nav.link"
                >
                  <Settings className="h-4 w-4" />
                  <span className="hidden md:inline text-xs font-semibold">
                    Admin
                  </span>
                </Button>
              </Link>
            )}

            {/* Location pill */}
            <button
              type="button"
              onClick={() => setShowLocationModal(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-border/60 text-xs text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors shrink-0"
              data-ocid="nav.button"
            >
              <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
              <span className="inline truncate max-w-[80px]">
                {userLocation || "Set location"}
              </span>
            </button>

            {/* Notification Bell */}
            {isAuthenticated && <NotificationBell />}

            {/* Dealer mode badge / dropdown */}
            {isAuthenticated && dealerMode && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 px-2 hover:bg-amber-500/10"
                    data-ocid="nav.dropdown_menu"
                  >
                    <Badge className="text-[9px] px-1.5 py-0 h-5 bg-amber-500/20 text-amber-600 border border-amber-500/40 font-bold">
                      Dealer
                    </Badge>
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-52 bg-popover border-border shadow-md"
                >
                  <DropdownMenuItem asChild>
                    <Link
                      to="/dealer"
                      className="flex items-center gap-2 cursor-pointer"
                      data-ocid="nav.link"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Dealer Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleDisableDealerMode}
                    className="flex items-center gap-2 cursor-pointer text-amber-500"
                    data-ocid="nav.toggle"
                  >
                    <X className="h-4 w-4" />
                    Exit Dealer Mode
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-destructive cursor-pointer"
                    data-ocid="nav.button"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {isAuthenticated && !dealerMode && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 px-2 hover:bg-primary/10 text-muted-foreground text-xs"
                    data-ocid="nav.dropdown_menu"
                  >
                    ···
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-52 bg-popover border-border shadow-md"
                >
                  <DropdownMenuItem asChild>
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      My Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleEnableDealerMode}
                    className="flex items-center gap-2 cursor-pointer text-amber-500"
                    data-ocid="nav.toggle"
                  >
                    <Store className="h-4 w-4" />
                    Switch to Dealer Mode
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-destructive cursor-pointer"
                    data-ocid="nav.button"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {!isAuthenticated && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => login()}
                disabled={isLoggingIn}
                className="border-primary/40 hover:bg-primary/10 hover:border-primary"
                data-ocid="nav.button"
              >
                {isLoggingIn ? "Logging in..." : "Login"}
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* B2B Bar */}
      {dealerMode ? (
        <div className="w-full border-b border-green-500/30 bg-gradient-to-r from-green-950/90 via-green-900/80 to-green-950/90 backdrop-blur-sm">
          <div className="container mx-auto px-4 h-8 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[10px] font-bold text-green-300 tracking-wide">
                Dealer Mode Active
              </span>
              <span className="h-3 w-px bg-green-700" />
              <span className="text-[10px] text-green-400/70">
                Verified Dealer
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/dealer"
                className="text-[10px] font-semibold text-green-300 hover:text-green-200 transition-colors flex items-center gap-1"
                data-ocid="nav.link"
              >
                <LayoutDashboard className="h-3 w-3" />
                Dashboard
              </Link>
              <span className="h-3 w-px bg-green-700" />
              <Link
                to="/post"
                className="text-[10px] font-semibold text-green-300 hover:text-green-200 transition-colors"
                data-ocid="nav.link"
              >
                Post Bulk Ad
              </Link>
              <span className="h-3 w-px bg-green-700" />
              <Link
                to="/profile"
                className="text-[10px] font-semibold text-green-300 hover:text-green-200 transition-colors"
                data-ocid="nav.link"
              >
                My Listings
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full border-b border-border/30 bg-gradient-to-r from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-sm">
          <div className="container mx-auto px-4 h-8 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                B2B / Dealer Zone
              </span>
              <span className="h-3 w-px bg-slate-600" />
              <span className="text-[10px] text-slate-400">
                Verified dealers &amp; bulk buyers
              </span>
            </div>
            <Link
              to="/b2b"
              className="text-[10px] font-semibold text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1"
              data-ocid="nav.link"
            >
              Register as Dealer <span>→</span>
            </Link>
          </div>
        </div>
      )}
      <LocationGateModal
        forceOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
      />
    </div>
  );
}
