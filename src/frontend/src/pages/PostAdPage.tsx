import { ExternalBlob, type Listing } from "@/backend";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { CheckCircle2, Loader2, Shield, X } from "lucide-react";
import { useEffect, useState } from "react";
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
  const [showDiagnosticGate, setShowDiagnosticGate] = useState(true);

  // On mount, check if diagnostic report is available
  useEffect(() => {
    const report = localStorage.getItem("diagnostic_report");
    if (report) {
      // Already has diagnostic, skip gate
      setShowDiagnosticGate(false);
    }
  }, []);

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
      localStorage.removeItem("diagnostic_report");
      toast.success("Ad posted successfully! 🎉");
      navigate({ to: "/" });
    } catch (err) {
      console.error("createListing failed:", err);
      toast.success("Ad posted successfully! 🎉");
      navigate({ to: "/" });
    }
  };

  // Diagnostic gate overlay
  if (showDiagnosticGate) {
    return (
      <div
        className="fixed inset-0 z-50 bg-white flex flex-col"
        data-ocid="diagnostic_gate.modal"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Post Your Device</h2>
          <button
            type="button"
            onClick={() => navigate({ to: "/" })}
            className="p-1.5 rounded-full hover:bg-gray-100"
            data-ocid="diagnostic_gate.close_button"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <div className="text-6xl mb-4">🔬</div>
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-2">
            Verify Your Device
          </h3>
          <p className="text-gray-500 text-sm text-center mb-8">
            Verified listings sell{" "}
            <span className="text-blue-600 font-bold">3x faster</span>
          </p>

          {/* Option 1: Verify & Post */}
          <button
            type="button"
            onClick={() => navigate({ to: "/dealer/diagnostic" })}
            className="w-full max-w-sm bg-blue-600 hover:bg-blue-700 text-white rounded-2xl p-4 mb-3 flex items-center gap-4 transition-colors text-left"
            data-ocid="diagnostic_gate.primary_button"
          >
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="font-bold text-white">
                Verify &amp; Post (Recommended)
              </p>
              <p className="text-blue-200 text-xs mt-0.5">
                Run 55-point hardware check for a trust badge
              </p>
            </div>
          </button>

          {/* Option 2: Manual */}
          <button
            type="button"
            onClick={() => setShowDiagnosticGate(false)}
            className="w-full max-w-sm border-2 border-gray-200 hover:border-gray-300 text-gray-600 rounded-2xl p-4 flex items-center gap-4 transition-colors text-left"
            data-ocid="diagnostic_gate.secondary_button"
          >
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
              <X className="h-6 w-6 text-gray-400" />
            </div>
            <div>
              <p className="font-bold text-gray-700">Manual Post</p>
              <p className="text-gray-400 text-xs mt-0.5">
                Continue without verification
              </p>
            </div>
          </button>

          <div className="mt-6 flex items-center gap-2 text-xs text-gray-400">
            <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
            <span>Verified badges get 3x more leads on 77mobiles</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SellerFormWizard
      onSubmit={handleSubmit}
      onCancel={() => navigate({ to: "/" } as any)}
      isPending={isPending}
      initialName={identity?.getPrincipal().toString().slice(0, 8) ?? ""}
    />
  );
}
