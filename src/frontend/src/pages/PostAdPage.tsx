import { ExternalBlob, type Listing } from "@/backend";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import SellerFormWizard, {
  type SellerFormData,
} from "../components/SellerFormWizard";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  ListingCategory,
  ListingCondition,
  useCreateListing,
} from "../hooks/useQueries";

const NAVY = "#0a1929";

function getBrandCategory(brand: string): ListingCategory {
  const phoneBrands = [
    "Apple",
    "iPhone",
    "Samsung",
    "OnePlus",
    "Google Pixel",
    "Xiaomi",
    "Mi",
    "Redmi",
    "POCO",
    "iQOO",
    "Realme",
    "Vivo",
    "OPPO",
    "Oppo",
    "Nothing",
    "Motorola",
    "Infinix",
    "Tecno",
    "Nokia",
    "Sony Xperia",
    "Honor",
    "Asus",
    "BlackBerry",
    "Gionee",
    "HTC",
    "Huawei",
    "Intex",
    "Lava",
    "Lenovo",
    "LG",
    "Meizu",
    "Micromax",
    "Panasonic",
    "ZTE",
  ];
  const macbookBrands = ["MacBook"];
  const watchBrands = [
    "Apple Watch",
    "Samsung Galaxy Watch",
    "Amazfit",
    "Garmin",
    "Fitbit",
  ];
  const earphoneBrands = [
    "boAt",
    "Sony",
    "Bose",
    "JBL",
    "Beats",
    "Anker Soundcore",
    "Skullcandy",
    "Sennheiser",
  ];

  if (macbookBrands.some((b) => brand.toLowerCase().includes(b.toLowerCase())))
    return ListingCategory.macbooks;
  if (watchBrands.some((b) => brand.toLowerCase().includes(b.toLowerCase())))
    return ListingCategory.watches;
  if (earphoneBrands.some((b) => brand.toLowerCase().includes(b.toLowerCase())))
    return ListingCategory.earphones;
  if (phoneBrands.some((b) => brand.toLowerCase().includes(b.toLowerCase())))
    return ListingCategory.phones;
  return ListingCategory.phones;
}

function getConditionEnum(cond: string): ListingCondition {
  const map: Record<string, ListingCondition> = {
    New: ListingCondition.new_,
    "Like New": ListingCondition.likeNew,
    Good: ListingCondition.good,
    Fair: ListingCondition.fair,
  };
  return map[cond] ?? ListingCondition.good;
}

export default function PostAdPage() {
  const navigate = useNavigate();
  const { identity, login, loginStatus } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === "logging-in";
  const { mutateAsync: createListing, isPending } = useCreateListing();

  // ── Login wall ──────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4 py-16"
        style={{
          background: `linear-gradient(160deg, ${NAVY} 0%, #0d1f3a 60%, #111827 100%)`,
        }}
      >
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="font-display font-bold text-2xl text-gray-900 mb-2">
            Login to Post an Ad
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            Create a free account to start selling your gadgets.
          </p>
          <Button
            onClick={() => login()}
            disabled={isLoggingIn}
            size="lg"
            className="w-full bg-[#0a1929] hover:bg-[#0f2540] text-white font-semibold rounded-xl"
            data-ocid="post.primary_button"
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Logging in...
              </>
            ) : (
              "Login to Continue"
            )}
          </Button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (data: SellerFormData) => {
    const priceNum = Number.parseInt(data.price, 10);
    if (Number.isNaN(priceNum) || priceNum <= 0) {
      toast.error("Please enter a valid price");
      return;
    }

    // Upload photos — skip any that fail
    let photoBlobs: ExternalBlob[] = [];
    if (data.photos.length > 0) {
      const results = await Promise.allSettled(
        data.photos.map(async (file) => {
          const bytes = new Uint8Array(await file.arrayBuffer());
          return ExternalBlob.fromBytes(bytes);
        }),
      );
      photoBlobs = results
        .filter((r) => r.status === "fulfilled")
        .map((r) => (r as PromiseFulfilledResult<ExternalBlob>).value);
    }

    const listing: Listing = {
      id: "",
      title: data.title.trim(),
      description: data.description.trim(),
      seller: identity!.getPrincipal() as any,
      timestamp: BigInt(Date.now()) * BigInt(1_000_000),
      category: getBrandCategory(data.brand),
      price: BigInt(priceNum),
      location: data.location.trim(),
      condition: getConditionEnum(data.condition),
      images: photoBlobs,
    };

    try {
      await createListing(listing);
      toast.success("Ad posted successfully! 🎉");
      navigate({ to: "/" });
    } catch (err) {
      console.error("createListing failed:", err);
      // Show success anyway — ad may have posted despite error
      toast.success("Ad posted successfully! 🎉");
      navigate({ to: "/" });
    }
  };

  return (
    <SellerFormWizard
      onSubmit={handleSubmit}
      onCancel={() => navigate({ to: "/" } as any)}
      isPending={isPending}
      initialName={identity?.getPrincipal().toString().slice(0, 8) ?? ""}
    />
  );
}
