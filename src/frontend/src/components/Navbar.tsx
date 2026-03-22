import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  ChevronDown,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  PlusCircle,
  Search,
  Settings,
  Store,
  User,
  X,
} from "lucide-react";
import { useState } from "react";
import { useDealerMode } from "../hooks/useDealerMode";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetCallerUserProfile,
  useGetCallerUserRole,
} from "../hooks/useQueries";

export default function Navbar() {
  const [searchValue, setSearchValue] = useState("");
  const navigate = useNavigate();
  const { identity, login, clear, loginStatus } = useInternetIdentity();
  const qc = useQueryClient();
  const { data: profile } = useGetCallerUserProfile();
  const { data: role } = useGetCallerUserRole();
  const { dealerMode, setDealerMode } = useDealerMode();
  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === "logging-in";
  const isAdmin = role === "admin";

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({
      to: "/",
      search: (prev) => ({ ...prev, q: searchValue }),
    } as any);
  };

  const handleLogout = async () => {
    await clear();
    qc.clear();
  };

  const handleEnableDealerMode = () => {
    setDealerMode(true);
    navigate({ to: "/dealer" } as any);
  };

  const handleDisableDealerMode = () => {
    setDealerMode(false);
  };

  const displayName =
    profile?.name ?? identity?.getPrincipal().toString().slice(0, 8);
  const initials = profile?.name
    ? profile.name.slice(0, 2).toUpperCase()
    : "??";

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

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {isAuthenticated && (
              <Link to="/messages">
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

            <Link to="/post">
              <Button
                size="sm"
                className="gap-1.5 bg-primary text-primary-foreground hover:opacity-90 font-semibold transition-all duration-300"
                data-ocid="nav.primary_button"
              >
                <PlusCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Post Ad</span>
              </Button>
            </Link>

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 px-2 hover:bg-primary/10"
                    data-ocid="nav.dropdown_menu"
                  >
                    <div className="relative">
                      <Avatar className="h-7 w-7">
                        <AvatarFallback
                          className={`text-xs ${
                            dealerMode
                              ? "bg-amber-500 text-black"
                              : "bg-primary text-primary-foreground"
                          }`}
                        >
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      {dealerMode && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 border border-background" />
                      )}
                    </div>
                    <div className="hidden sm:flex items-center gap-1">
                      <span className="text-sm font-medium max-w-[80px] truncate">
                        {displayName}
                      </span>
                      {dealerMode && (
                        <Badge className="text-[9px] px-1 py-0 h-4 bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                          Dealer
                        </Badge>
                      )}
                    </div>
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
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
                      <User className="h-4 w-4" />
                      My Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      to="/messages"
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <MessageSquare className="h-4 w-4" />
                      Messages
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link
                        to="/admin"
                        className="flex items-center gap-2 cursor-pointer"
                        data-ocid="nav.link"
                      >
                        <Settings className="h-4 w-4" />
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  )}

                  {/* Dealer Mode Toggle */}
                  {dealerMode ? (
                    <DropdownMenuItem
                      onClick={handleDisableDealerMode}
                      className="flex items-center gap-2 cursor-pointer text-amber-400 hover:text-amber-300 focus:text-amber-300"
                      data-ocid="nav.toggle"
                    >
                      <X className="h-4 w-4" />
                      Exit Dealer Mode
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem
                      onClick={handleEnableDealerMode}
                      className="flex items-center gap-2 cursor-pointer text-amber-400 hover:text-amber-300 focus:text-amber-300"
                      data-ocid="nav.toggle"
                    >
                      <Store className="h-4 w-4" />
                      Switch to Dealer Mode
                    </DropdownMenuItem>
                  )}

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
            ) : (
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

      {/* B2B Bar — changes based on dealer mode */}
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
    </div>
  );
}
