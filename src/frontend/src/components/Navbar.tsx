import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  LogOut,
  MessageSquare,
  PlusCircle,
  Search,
  User,
} from "lucide-react";
import { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetCallerUserProfile } from "../hooks/useQueries";

export default function Navbar() {
  const [searchValue, setSearchValue] = useState("");
  const navigate = useNavigate();
  const { identity, login, clear, loginStatus } = useInternetIdentity();
  const qc = useQueryClient();
  const { data: profile } = useGetCallerUserProfile();
  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === "logging-in";

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

  const displayName =
    profile?.name ?? identity?.getPrincipal().toString().slice(0, 8);
  const initials = profile?.name
    ? profile.name.slice(0, 2).toUpperCase()
    : "??";

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border shadow-xs">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3 h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 shrink-0"
            data-ocid="nav.link"
          >
            <img
              src="/assets/generated/logo-77mobiles-transparent.dim_120x40.png"
              alt="77mobiles"
              className="h-7 w-auto"
            />
            <span className="font-display font-bold text-xl text-primary hidden sm:block">
              77mobiles
            </span>
          </Link>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search phones, MacBooks, watches..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="pl-9 bg-muted border-0 focus-visible:ring-1 focus-visible:ring-primary h-9"
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
                  className="hidden sm:flex"
                  data-ocid="nav.link"
                >
                  <MessageSquare className="h-5 w-5" />
                </Button>
              </Link>
            )}

            <Link to="/post">
              <Button
                size="sm"
                className="gap-1.5 bg-primary text-primary-foreground hover:opacity-90 font-semibold"
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
                    className="gap-1.5 px-2"
                    data-ocid="nav.dropdown_menu"
                  >
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:block text-sm font-medium max-w-[80px] truncate">
                      {displayName}
                    </span>
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
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
                data-ocid="nav.button"
              >
                {isLoggingIn ? "Logging in..." : "Login"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
