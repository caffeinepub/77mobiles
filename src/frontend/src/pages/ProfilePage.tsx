import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  BarChart2,
  CheckCircle2,
  ChevronRight,
  Crown,
  Edit2,
  Globe,
  Heart,
  HelpCircle,
  Loader2,
  LogOut,
  Mail,
  MessageCircle,
  Phone,
  Settings,
  ShoppingBag,
  Star,
  Trash2,
  Unlink,
  User,
  UserPlus,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useDeleteListing,
  useGetCallerRelatedListings,
  useGetCallerUserProfile,
  useSaveUserProfile,
} from "../hooks/useQueries";
import {
  conditionClass,
  conditionLabel,
  formatPrice,
  formatTimeAgo,
} from "../utils/format";

// ─── My Account Section ───────────────────────────────────────────────────────
interface AccountCardProps {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  subtitle: string;
  badge?: string;
  badgeColor?: string;
  onClick?: () => void;
  "data-ocid"?: string;
}

function AccountCard({
  icon,
  iconBg,
  title,
  subtitle,
  badge,
  badgeColor,
  onClick,
  ...rest
}: AccountCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-4 p-4 bg-card border border-border rounded-2xl hover:bg-muted/50 transition-colors text-left"
      {...rest}
    >
      <div
        className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-sm">{title}</p>
          {badge && (
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${badgeColor}`}
            >
              {badge}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
    </button>
  );
}

function MyAccountSection({ onLogout }: { onLogout: () => void }) {
  const [showEliteModal, setShowEliteModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <div className="mt-6">
        <h2 className="font-display font-bold text-lg mb-4">My Account</h2>

        {/* Network & Social */}
        <div className="space-y-2 mb-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-2">
            Social
          </p>
          <AccountCard
            icon={<Users className="h-5 w-5 text-blue-600" />}
            iconBg="bg-blue-100"
            title="My Network"
            subtitle="Followers, following and find friends"
            onClick={() => toast.info("Network feature coming soon!")}
            data-ocid="profile.network.button"
          />
          <AccountCard
            icon={<Heart className="h-5 w-5 text-rose-600" />}
            iconBg="bg-rose-100"
            title="Wishlist"
            subtitle="View your liked items here"
            badge="0 items"
            badgeColor="bg-rose-100 text-rose-600"
            onClick={() => toast.info("Wishlist feature coming soon!")}
            data-ocid="profile.wishlist.button"
          />
        </div>

        {/* Commerce */}
        <div className="space-y-2 mb-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-2">
            Commerce
          </p>
          <AccountCard
            icon={<ShoppingBag className="h-5 w-5 text-violet-600" />}
            iconBg="bg-violet-100"
            title="Buy Packages & My Orders"
            subtitle="Packages, orders, invoices & billing"
            onClick={() => toast.info("Orders feature coming soon!")}
            data-ocid="profile.orders.button"
          />
          <AccountCard
            icon={<BarChart2 className="h-5 w-5 text-blue-600" />}
            iconBg="bg-blue-100"
            title="Vendor Dashboard (PRO)"
            subtitle="Manage listings, analytics & inventory"
            badge="PRO"
            badgeColor="bg-amber-100 text-amber-700"
            onClick={() => navigate({ to: "/vendor" })}
            data-ocid="profile.vendor.button"
          />
          <AccountCard
            icon={<Crown className="h-5 w-5 text-amber-600" />}
            iconBg="bg-amber-100"
            title="Become an Elite Seller"
            subtitle="Feature your ad in minutes"
            badge="PRO"
            badgeColor="bg-amber-100 text-amber-700"
            onClick={() => setShowEliteModal(true)}
            data-ocid="profile.elite.button"
          />
        </div>

        {/* Support & Settings */}
        <div className="space-y-2 mb-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-2">
            General
          </p>
          <AccountCard
            icon={<Settings className="h-5 w-5 text-gray-600" />}
            iconBg="bg-gray-100"
            title="Settings"
            subtitle="Privacy and logout"
            onClick={onLogout}
            data-ocid="profile.settings.button"
          />
          <AccountCard
            icon={<HelpCircle className="h-5 w-5 text-teal-600" />}
            iconBg="bg-teal-100"
            title="Help & Support"
            subtitle="Help center, Terms and conditions, Privacy policy"
            onClick={() => toast.info("Help center coming soon!")}
            data-ocid="profile.help.button"
          />
          <AccountCard
            icon={<Globe className="h-5 w-5 text-indigo-600" />}
            iconBg="bg-indigo-100"
            title="Language"
            subtitle="English (default)"
            onClick={() => setShowLanguageModal(true)}
            data-ocid="profile.language.button"
          />
        </div>
      </div>

      {/* Elite Seller Modal */}
      <Dialog open={showEliteModal} onOpenChange={setShowEliteModal}>
        <DialogContent data-ocid="profile.elite.dialog">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-amber-500" />
              Become an Elite Seller
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              Feature your advertisement and get noticed by thousands of buyers
              instantly.
            </p>
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Contact Options for Elite Ads
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-1.5 border-green-500 text-green-600"
                  data-ocid="profile.elite.call_button"
                >
                  <Phone className="h-3.5 w-3.5" /> Direct Call
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-1.5 border-[#25D366] text-[#25D366]"
                  data-ocid="profile.elite.whatsapp_button"
                >
                  <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-1.5 border-blue-500 text-blue-600"
                  data-ocid="profile.elite.email_button"
                >
                  <Mail className="h-3.5 w-3.5" /> Email
                </Button>
              </div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
              <p className="text-sm font-semibold text-amber-800">
                Elite Seller — ₹100/featured ad
              </p>
              <p className="text-xs text-amber-700 mt-0.5">
                Your ad appears at the top of search results with a ★ Featured
                badge.
              </p>
            </div>
            <Button
              className="w-full bg-amber-500 hover:bg-amber-600 text-white"
              onClick={() => {
                setShowEliteModal(false);
                toast.success("Elite feature coming soon! We'll notify you.");
              }}
              data-ocid="profile.elite.primary_button"
            >
              <Star className="h-4 w-4 mr-2" /> Upgrade to Elite
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Language Modal */}
      <Dialog open={showLanguageModal} onOpenChange={setShowLanguageModal}>
        <DialogContent data-ocid="profile.language.dialog">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" /> Select Language
            </DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <Select defaultValue="en">
              <SelectTrigger data-ocid="profile.language.select">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">🇬🇧 English</SelectItem>
                <SelectItem value="hi">🇮🇳 हिन्दी (Hindi)</SelectItem>
                <SelectItem value="te">తెలుగు (Telugu)</SelectItem>
                <SelectItem value="ta">தமிழ் (Tamil)</SelectItem>
                <SelectItem value="kn">ಕನ್ನಡ (Kannada)</SelectItem>
                <SelectItem value="mr">मराठी (Marathi)</SelectItem>
                <SelectItem value="gu">ગુજરાતી (Gujarati)</SelectItem>
              </SelectContent>
            </Select>
            <Button
              className="w-full mt-4"
              onClick={() => {
                setShowLanguageModal(false);
                toast.success("Language preference saved!");
              }}
              data-ocid="profile.language.save_button"
            >
              Save Preference
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ─── Main Profile Page ────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { identity, login, loginStatus, clear } = useInternetIdentity();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === "logging-in";

  const { data: profile, isLoading: profileLoading } =
    useGetCallerUserProfile();
  const { data: listings, isLoading: listingsLoading } =
    useGetCallerRelatedListings();
  const { mutateAsync: saveProfile, isPending: savingProfile } =
    useSaveUserProfile();
  const { mutateAsync: deleteListing, isPending: deleting } =
    useDeleteListing();

  const [nameEdit, setNameEdit] = useState("");
  const [phoneEdit, setPhoneEdit] = useState("");
  const [whatsappEdit, setWhatsappEdit] = useState("");
  const [emailEdit, setEmailEdit] = useState("");
  const [googleLinked, setGoogleLinked] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (profile?.name) setNameEdit(profile.name);
    if (profile?.phone) setPhoneEdit(profile.phone);
    if (identity) {
      const pid = identity.getPrincipal().toString();
      setWhatsappEdit(localStorage.getItem(`whatsapp_${pid}`) ?? "");
      setEmailEdit(localStorage.getItem(`email_${pid}`) ?? "");
      setGoogleLinked(localStorage.getItem(`google_linked_${pid}`) === "true");
    }
  }, [profile?.name, profile?.phone, identity]);

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-md text-center">
        <span className="text-6xl mb-4 block">👤</span>
        <h2 className="font-display font-bold text-2xl mb-2">Your Profile</h2>
        <p className="text-muted-foreground text-sm mb-6">
          Login to manage your listings and profile.
        </p>
        <Button
          onClick={() => login()}
          disabled={isLoggingIn}
          size="lg"
          className="w-full"
          data-ocid="profile.primary_button"
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

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameEdit.trim()) return;
    try {
      await saveProfile({
        name: nameEdit.trim(),
        isVerified: profile?.isVerified ?? false,
        aadhaarHash: profile?.aadhaarHash ?? "",
        phone: phoneEdit.trim(),
      });
      if (identity) {
        const pid = identity.getPrincipal().toString();
        localStorage.setItem(`whatsapp_${pid}`, whatsappEdit.trim());
        localStorage.setItem(`email_${pid}`, emailEdit.trim());
      }
      setEditing(false);
      toast.success("Profile updated!");
    } catch {
      toast.error("Failed to update profile");
    }
  };

  const handleDelete = async (listingId: string, title: string) => {
    try {
      await deleteListing(listingId);
      toast.success(`"${title}" deleted`);
    } catch {
      toast.error("Failed to delete listing");
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await clear();
      qc.clear();
      navigate({ to: "/" } as any);
      toast.success("Account deleted successfully");
    } catch {
      toast.error("Failed to delete account");
    }
  };

  const handleLogout = async () => {
    await clear();
    qc.clear();
  };

  const handleLinkGoogle = () => {
    if (identity) {
      const pid = identity.getPrincipal().toString();
      localStorage.setItem(`google_linked_${pid}`, "true");
      setGoogleLinked(true);
      toast.success("Google account linked!");
    }
  };

  const handleUnlinkGoogle = () => {
    if (identity) {
      const pid = identity.getPrincipal().toString();
      localStorage.removeItem(`google_linked_${pid}`);
      setGoogleLinked(false);
      toast.success("Google account unlinked");
    }
  };

  const myListings =
    listings?.filter(
      (l) => l.seller.toString() === identity?.getPrincipal().toString(),
    ) ?? [];

  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl">
      <h1 className="font-display font-bold text-2xl mb-6">My Profile</h1>

      {/* Profile card */}
      <div className="bg-card border border-border rounded-2xl p-5 mb-4 shadow-card">
        <div className="flex items-center gap-4 mb-4">
          <div className="h-14 w-14 rounded-full bg-primary/20 flex items-center justify-center">
            <User className="h-7 w-7 text-primary" />
          </div>
          <div className="flex-1">
            {profileLoading ? (
              <Skeleton className="h-5 w-32 mb-1" />
            ) : (
              <p className="font-semibold text-lg">
                {profile?.name ?? "No name set"}
              </p>
            )}
            {/* Followers/Following row */}
            <div className="flex items-center gap-3 mt-0.5">
              <span className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">124</span>{" "}
                Followers
              </span>
              <span className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">38</span>{" "}
                Following
              </span>
              <button
                type="button"
                onClick={() => toast.info("Find friends coming soon!")}
                className="text-xs text-primary flex items-center gap-1 hover:underline"
                data-ocid="profile.network.button"
              >
                <UserPlus className="h-3 w-3" /> Find Friends
              </button>
            </div>
            <p className="text-xs text-muted-foreground font-mono mt-0.5">
              {identity.getPrincipal().toString().slice(0, 20)}...
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="ml-auto gap-1.5"
            onClick={() => setEditing(!editing)}
            data-ocid="profile.edit_button"
          >
            <Edit2 className="h-3.5 w-3.5" />
            Edit
          </Button>
        </div>

        {editing && (
          <form
            onSubmit={handleSaveProfile}
            className="space-y-3 border-t border-border pt-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="name-edit" className="text-xs">
                  Display Name
                </Label>
                <Input
                  id="name-edit"
                  value={nameEdit}
                  onChange={(e) => setNameEdit(e.target.value)}
                  placeholder="Your display name"
                  autoFocus
                  data-ocid="profile.input"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="phone-edit" className="text-xs">
                  Phone Number
                </Label>
                <Input
                  id="phone-edit"
                  type="tel"
                  value={phoneEdit}
                  onChange={(e) => setPhoneEdit(e.target.value)}
                  placeholder="+91 98765 43210"
                  data-ocid="profile.input"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="whatsapp-edit" className="text-xs">
                  WhatsApp Number
                </Label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-xs text-muted-foreground">
                    +91
                  </span>
                  <Input
                    id="whatsapp-edit"
                    type="tel"
                    value={whatsappEdit}
                    onChange={(e) => setWhatsappEdit(e.target.value)}
                    placeholder="9876543210"
                    className="rounded-l-none"
                    data-ocid="profile.input"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="email-edit" className="text-xs">
                  Contact Email for Buyers (hidden from public)
                </Label>
                <Input
                  id="email-edit"
                  type="email"
                  value={emailEdit}
                  onChange={(e) => setEmailEdit(e.target.value)}
                  placeholder="you@example.com"
                  data-ocid="profile.input"
                />
              </div>
            </div>

            {/* Google Link/Unlink */}
            <div className="flex items-center gap-3 p-3 bg-muted rounded-xl">
              <div className="h-7 w-7 rounded-full bg-white border border-gray-200 flex items-center justify-center text-sm">
                G
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Google Account</p>
                <p className="text-xs text-muted-foreground">
                  {googleLinked ? "Linked" : "Not linked"}
                </p>
              </div>
              {googleLinked ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleUnlinkGoogle}
                  className="gap-1.5 border-destructive text-destructive hover:bg-destructive/10"
                  data-ocid="profile.unlink.button"
                >
                  <Unlink className="h-3.5 w-3.5" /> Unlink
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleLinkGoogle}
                  className="gap-1.5 border-blue-500 text-blue-600 hover:bg-blue-50"
                  data-ocid="profile.link.button"
                >
                  Link Google
                </Button>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                type="submit"
                size="sm"
                disabled={savingProfile}
                data-ocid="profile.save_button"
              >
                {savingProfile ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    Save Profile
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setEditing(false)}
                data-ocid="profile.cancel_button"
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </div>

      {/* My Account Section */}
      <MyAccountSection onLogout={handleLogout} />

      {/* Listings tabs */}
      <Tabs defaultValue="listings" className="mt-6">
        <TabsList className="mb-4" data-ocid="profile.tab">
          <TabsTrigger value="listings" data-ocid="profile.listings.tab">
            Active Listings ({myListings.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="listings">
          {listingsLoading ? (
            <div className="space-y-3" data-ocid="profile.loading_state">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full rounded-xl" />
              ))}
            </div>
          ) : myListings.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
              data-ocid="profile.empty_state"
            >
              <span className="text-5xl mb-3 block">📦</span>
              <p className="text-muted-foreground text-sm mb-4">
                You haven't posted any listings yet.
              </p>
              <Link to="/post">
                <Button data-ocid="profile.primary_button">
                  Post Your First Ad
                </Button>
              </Link>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {myListings.map((listing, i) => (
                <motion.div
                  key={listing.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-card border border-border rounded-xl p-4 flex gap-4 items-start shadow-card"
                  data-ocid={`profile.item.${i + 1}`}
                >
                  <div className="h-16 w-16 rounded-lg overflow-hidden bg-muted shrink-0">
                    {listing.images[0] ? (
                      <img
                        src={listing.images[0].getDirectURL()}
                        alt={listing.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">
                        📱
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <Link
                      to="/listing/$listingId"
                      params={{ listingId: listing.id }}
                      className="font-semibold text-sm hover:text-primary transition-colors line-clamp-1"
                    >
                      {listing.title}
                    </Link>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="font-bold text-primary text-sm">
                        {formatPrice(listing.price)}
                      </span>
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${conditionClass(listing.condition)}`}
                      >
                        {conditionLabel(listing.condition)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatTimeAgo(listing.timestamp)}
                    </p>
                  </div>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0 text-muted-foreground hover:text-destructive"
                        data-ocid={`profile.delete_button.${i + 1}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent data-ocid="profile.dialog">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Listing?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete{" "}
                          <strong>{listing.title}</strong>? This action cannot
                          be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel data-ocid="profile.cancel_button">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() =>
                            handleDelete(listing.id, listing.title)
                          }
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          disabled={deleting}
                          data-ocid="profile.confirm_button"
                        >
                          {deleting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Delete"
                          )}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </motion.div>
              ))}
            </div>
          )}

          {myListings.length > 0 && (
            <Alert className="mt-4 border-primary/20 bg-primary/5">
              <AlertCircle className="h-4 w-4 text-primary" />
              <AlertDescription className="text-sm">
                You have <strong>{myListings.length}</strong> active listing
                {myListings.length !== 1 ? "s" : ""}.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>
      </Tabs>

      {/* Danger Zone */}
      <div className="mt-8 border border-destructive/30 rounded-2xl p-4">
        <p className="text-sm font-semibold text-destructive mb-1">
          Danger Zone
        </p>
        <p className="text-xs text-muted-foreground mb-3">
          Deleting your account is permanent and cannot be undone.
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="gap-1.5"
            data-ocid="profile.logout.button"
          >
            <LogOut className="h-3.5 w-3.5" /> Logout
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 border-destructive text-destructive hover:bg-destructive/10"
                data-ocid="profile.delete_button"
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent data-ocid="profile.delete.dialog">
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Account?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete your account and all your
                  listings. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel data-ocid="profile.cancel_button">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  data-ocid="profile.confirm_button"
                >
                  Delete My Account
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}
