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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  CheckCircle2,
  Edit2,
  Loader2,
  Trash2,
  User,
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

export default function ProfilePage() {
  const { identity, login, loginStatus } = useInternetIdentity();
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
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (profile?.name) setNameEdit(profile.name);
  }, [profile?.name]);

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

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameEdit.trim()) return;
    try {
      await saveProfile({
        name: nameEdit.trim(),
        isVerified: profile?.isVerified ?? false,
        aadhaarHash: profile?.aadhaarHash ?? "",
        phone: profile?.phone ?? "",
      });
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

  // Split listings: seller = user's own listings
  const myListings =
    listings?.filter(
      (l) => l.seller.toString() === identity?.getPrincipal().toString(),
    ) ?? [];

  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl">
      <h1 className="font-display font-bold text-2xl mb-6">My Profile</h1>

      {/* Profile card */}
      <div className="bg-card border border-border rounded-2xl p-5 mb-6 shadow-card">
        <div className="flex items-center gap-4 mb-4">
          <div className="h-14 w-14 rounded-full bg-primary/20 flex items-center justify-center">
            <User className="h-7 w-7 text-primary" />
          </div>
          <div>
            {profileLoading ? (
              <Skeleton className="h-5 w-32 mb-1" />
            ) : (
              <p className="font-semibold text-lg">
                {profile?.name ?? "No name set"}
              </p>
            )}
            <p className="text-xs text-muted-foreground font-mono">
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
          <form onSubmit={handleSaveName} className="flex gap-2">
            <div className="flex-1 space-y-1">
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
            <div className="flex gap-1.5 items-end">
              <Button
                type="submit"
                size="sm"
                disabled={savingProfile}
                data-ocid="profile.save_button"
              >
                {savingProfile ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
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

      {/* Listings tabs */}
      <Tabs defaultValue="listings">
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
                  {/* Thumbnail */}
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

                  {/* Info */}
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

                  {/* Actions */}
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
    </div>
  );
}
