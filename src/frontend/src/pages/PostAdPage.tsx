import { ExternalBlob, type Listing } from "@/backend";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "@tanstack/react-router";
import {
  CheckCircle2,
  Info,
  Loader2,
  MapPin,
  Star,
  Upload,
  Video,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import ModelCombobox from "../components/ModelCombobox";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  ListingCategory,
  ListingCondition,
  useCreateListing,
} from "../hooks/useQueries";
import { encodeGeoLocation, reverseGeocode } from "../utils/geo";

const NAVY = "#0a1929";

export default function PostAdPage() {
  const navigate = useNavigate();
  const { identity, login, loginStatus } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === "logging-in";
  const { mutateAsync: createListing, isPending } = useCreateListing();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<ListingCategory | "">("");
  const [model, setModel] = useState("");
  const [condition, setCondition] = useState<ListingCondition | "">("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [isFeatured, setIsFeatured] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [showLocationHelp, setShowLocationHelp] = useState(false);
  const [videoUploading, setVideoUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const locationInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
    };
  }, [videoPreviewUrl]);

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
    if (file) {
      setVideoFile(file);
      setVideoPreviewUrl(URL.createObjectURL(file));
    } else {
      setVideoFile(null);
      setVideoPreviewUrl(null);
    }
    if (videoInputRef.current) videoInputRef.current.value = "";
  };

  const removeVideo = () => {
    if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
    setVideoFile(null);
    setVideoPreviewUrl(null);
    setUploadProgress(0);
  };

  const handleModelChange = (m: string) => {
    setModel(m);
    setTitle((prev) => (prev ? prev : m));
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }
    setDetectingLocation(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { lat, lon } = {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          };
          const { city, countryName } = await reverseGeocode(lat, lon);
          const label = countryName ? `${city}, ${countryName}` : city;
          setLocation(encodeGeoLocation(lat, lon, label));
          setLocationError(null);
          setShowLocationHelp(false);
          toast.success(`Location set to ${label}`);
        } catch {
          toast.error("Could not determine city name. Please enter manually.");
        } finally {
          setDetectingLocation(false);
        }
      },
      (err) => {
        setDetectingLocation(false);
        if (err.code === err.PERMISSION_DENIED) {
          setLocationError("Location access is blocked by your browser.");
          setShowLocationHelp(true);
        } else {
          toast.error("Could not get your location.");
        }
      },
      { timeout: 10000 },
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error("Please login to post an ad");
      return;
    }
    if (
      !title.trim() ||
      !category ||
      !condition ||
      !price ||
      !location.trim() ||
      !description.trim()
    ) {
      toast.error("Please fill in all required fields");
      return;
    }
    const priceNum = Number.parseInt(price, 10);
    if (Number.isNaN(priceNum) || priceNum <= 0) {
      toast.error("Please enter a valid price");
      return;
    }

    // Upload video to blob storage if present
    let videoBlobs: ExternalBlob[] = [];
    if (videoFile) {
      try {
        setVideoUploading(true);
        setUploadProgress(0);
        const bytes = new Uint8Array(await videoFile.arrayBuffer());
        const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((pct) => {
          setUploadProgress(Math.round(pct));
        });
        videoBlobs = [blob];
      } catch (err) {
        console.warn("Video prep failed, proceeding without video:", err);
        toast.warning(
          "Video could not be prepared — ad will post without video.",
        );
      } finally {
        setVideoUploading(false);
      }
    }

    const modelPrefix = model ? `[Model: ${model}]\n` : "";
    const featuredPrefix = isFeatured ? "[Featured]\n" : "";
    const whatsappPrefix = whatsappNumber.trim()
      ? `[WhatsApp: ${whatsappNumber.trim()}]\n`
      : "";

    const listing: Listing = {
      id: "",
      title: title.trim(),
      description: `${featuredPrefix}${modelPrefix}${whatsappPrefix}${description.trim()}`,
      seller: identity!.getPrincipal() as any,
      timestamp: BigInt(Date.now()) * BigInt(1_000_000),
      category: category as ListingCategory,
      price: BigInt(priceNum),
      location: location.trim(),
      condition: condition as ListingCondition,
      images: videoBlobs,
    };

    try {
      const newId = await createListing(listing);
      if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
      toast.success("Ad posted successfully! 🎉");
      navigate({ to: "/listing/$listingId", params: { listingId: newId } });
    } catch (err) {
      console.error("createListing failed:", err);
      toast.error("Failed to post ad. Please try again.");
    }
  };

  const locationDisplay = location.includes("|")
    ? location.split("|")[1]
    : location;

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

  // ── Main page ────────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen"
      style={{
        background: `linear-gradient(160deg, ${NAVY} 0%, #0d1f3a 60%, #111827 100%)`,
      }}
    >
      {/* Hero Header */}
      <div className="text-center pt-10 pb-6 px-4">
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4 uppercase tracking-widest"
          style={{
            background: "rgba(245,200,66,0.15)",
            color: "#F5C842",
            border: "1px solid rgba(245,200,66,0.3)",
          }}
        >
          ✦ 100% Free · No Commissions
        </div>
        <h1 className="font-display font-bold text-4xl md:text-5xl text-white leading-tight">
          Post a{" "}
          <span
            style={{
              color: "#F5C842",
              textShadow: "0 0 24px rgba(245,200,66,0.4)",
            }}
          >
            Free
          </span>{" "}
          Ad
        </h1>
        <p className="text-blue-200/70 text-base mt-3 max-w-sm mx-auto">
          List your gadget in minutes. Reach thousands of local buyers.
        </p>
      </div>

      {/* Form Card */}
      <div className="max-w-lg mx-auto px-4 pb-16">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Card top accent bar */}
          <div
            className="h-1 w-full"
            style={{
              background: "linear-gradient(90deg, #F5C842, #f59e0b, #F5C842)",
            }}
          />

          <form
            onSubmit={handleSubmit}
            className="p-6 space-y-5"
            data-ocid="post.panel"
          >
            {/* Category + Condition */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label
                  htmlFor="category"
                  className="text-gray-700 font-medium text-sm"
                >
                  Category <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={category}
                  onValueChange={(v) => {
                    setCategory(v as ListingCategory);
                    setModel("");
                  }}
                >
                  <SelectTrigger
                    className="border-gray-200 bg-gray-50 hover:bg-white focus:border-blue-400 transition-colors"
                    data-ocid="post.select"
                  >
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ListingCategory.phones}>
                      📱 Phones
                    </SelectItem>
                    <SelectItem value={ListingCategory.macbooks}>
                      💻 MacBooks
                    </SelectItem>
                    <SelectItem value={ListingCategory.watches}>
                      ⌚ Watches
                    </SelectItem>
                    <SelectItem value={ListingCategory.earphones}>
                      🎧 Earphones
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="condition"
                  className="text-gray-700 font-medium text-sm"
                >
                  Condition <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={condition}
                  onValueChange={(v) => setCondition(v as ListingCondition)}
                >
                  <SelectTrigger
                    className="border-gray-200 bg-gray-50 hover:bg-white focus:border-blue-400 transition-colors"
                    data-ocid="post.select"
                  >
                    <SelectValue placeholder="Condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ListingCondition.new_}>
                      🟢 New
                    </SelectItem>
                    <SelectItem value={ListingCondition.likeNew}>
                      🔵 Like New
                    </SelectItem>
                    <SelectItem value={ListingCondition.good}>
                      🟡 Good
                    </SelectItem>
                    <SelectItem value={ListingCondition.fair}>
                      🟠 Fair
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Model */}
            {category && (
              <div className="space-y-1.5">
                <Label className="text-gray-700 font-medium text-sm">
                  Model <span className="text-red-500">*</span>
                </Label>
                <ModelCombobox
                  category={category}
                  value={model}
                  onChange={handleModelChange}
                />
              </div>
            )}

            {/* Title */}
            <div className="space-y-1.5">
              <Label
                htmlFor="title"
                className="text-gray-700 font-medium text-sm"
              >
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                placeholder="e.g. iPhone 15 Pro 256GB Space Black"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
                className="border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-400"
                data-ocid="post.input"
              />
            </div>

            {/* Price + Location */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label
                  htmlFor="price"
                  className="text-gray-700 font-medium text-sm"
                >
                  Price (₹) <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-sm">
                    ₹
                  </span>
                  <Input
                    id="price"
                    type="number"
                    placeholder="45000"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="pl-7 border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-400"
                    min="1"
                    data-ocid="post.input"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="location"
                  className="text-gray-700 font-medium text-sm"
                >
                  Location <span className="text-red-500">*</span>
                </Label>
                <div className="flex gap-1.5">
                  <Input
                    ref={locationInputRef}
                    id="location"
                    placeholder="Mumbai, Maharashtra"
                    value={locationDisplay}
                    onChange={(e) => setLocation(e.target.value)}
                    className="flex-1 min-w-0 border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-400"
                    data-ocid="post.input"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleDetectLocation}
                    disabled={detectingLocation}
                    className="shrink-0 px-2 h-10 text-gray-400 hover:text-blue-600"
                    title="Detect my location"
                    data-ocid="post.secondary_button"
                  >
                    {detectingLocation ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <MapPin className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Location help */}
            {showLocationHelp && locationError && (
              <div
                className="rounded-xl border border-blue-200 bg-blue-50 p-4 relative"
                data-ocid="post.panel"
              >
                <button
                  type="button"
                  onClick={() => setShowLocationHelp(false)}
                  className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                  aria-label="Dismiss"
                  data-ocid="post.close_button"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="flex items-start gap-2 mb-2">
                  <Info className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <p className="text-sm font-medium text-gray-800">
                    Location access is blocked
                  </p>
                </div>
                <ul className="text-xs text-gray-500 space-y-1 ml-6 mb-3">
                  <li>
                    <span className="font-medium text-gray-700">
                      Chrome/Edge:
                    </span>{" "}
                    Lock icon → Site settings → Location → Allow
                  </li>
                  <li>
                    <span className="font-medium text-gray-700">Safari:</span>{" "}
                    Settings → Safari → Location → Allow
                  </li>
                  <li>
                    <span className="font-medium text-gray-700">Firefox:</span>{" "}
                    Lock icon → Clear permissions → Reload
                  </li>
                </ul>
                <div className="flex gap-2 ml-6">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleDetectLocation}
                    disabled={detectingLocation}
                    className="text-xs"
                    data-ocid="post.secondary_button"
                  >
                    {detectingLocation && (
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    )}
                    Try Again
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setShowLocationHelp(false);
                      locationInputRef.current?.focus();
                    }}
                    className="text-xs"
                    data-ocid="post.secondary_button"
                  >
                    Enter Manually
                  </Button>
                </div>
              </div>
            )}

            {/* Description */}
            <div className="space-y-1.5">
              <Label
                htmlFor="description"
                className="text-gray-700 font-medium text-sm"
              >
                Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Describe the device, accessories included, reason for selling..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                maxLength={1000}
                className="border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-400 resize-none"
                data-ocid="post.textarea"
              />
              <p className="text-xs text-gray-400 text-right">
                {description.length}/1000
              </p>
            </div>

            {/* WhatsApp */}
            <div className="space-y-1.5">
              <Label
                htmlFor="whatsapp"
                className="flex items-center gap-2 text-gray-700 font-medium text-sm"
              >
                <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-[#25D366] text-white text-[10px] font-bold">
                  W
                </span>
                WhatsApp Number
                <span className="text-gray-400 font-normal">(optional)</span>
              </Label>
              <Input
                id="whatsapp"
                placeholder="+91 98765 43210"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                className="border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-400"
                data-ocid="post.input"
              />
              <p className="text-xs text-gray-400">
                Buyers can reach you directly on WhatsApp
              </p>
            </div>

            {/* 360° Video Upload */}
            <div className="space-y-2">
              <Label className="text-gray-700 font-medium text-sm flex items-center gap-2">
                <Video className="h-4 w-4 text-blue-600" />
                360° Device Video
                <span className="text-gray-400 font-normal">(optional)</span>
              </Label>
              <p className="text-xs text-gray-400">
                Upload a walkthrough video — stored securely via blob storage
              </p>

              {!videoFile ? (
                <button
                  type="button"
                  onClick={() => videoInputRef.current?.click()}
                  className="w-full flex flex-col items-center justify-center gap-2 py-7 rounded-xl border-2 border-dashed border-gray-200 hover:border-blue-400 bg-gray-50 hover:bg-blue-50 transition-colors text-gray-400 hover:text-blue-600"
                  data-ocid="post.upload_button"
                >
                  <Video className="h-7 w-7" />
                  <span className="text-sm font-medium">Upload 360° Video</span>
                  <span className="text-xs opacity-70">
                    Click to select a video file
                  </span>
                </button>
              ) : (
                <div className="space-y-2">
                  {videoPreviewUrl && (
                    <video
                      src={videoPreviewUrl}
                      controls
                      className="w-full rounded-xl max-h-52 bg-black"
                    >
                      <track kind="captions" />
                    </video>
                  )}
                  <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-blue-50 border border-blue-100">
                    <div className="flex items-center gap-2 min-w-0">
                      <Video className="h-4 w-4 shrink-0 text-blue-600" />
                      <span className="text-sm truncate text-gray-700">
                        {videoFile.name}
                      </span>
                      {videoUploading && (
                        <Loader2 className="h-3 w-3 animate-spin text-blue-500 shrink-0" />
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={removeVideo}
                      className="shrink-0 p-1 rounded-full hover:bg-red-100 hover:text-red-500 text-gray-400 transition-colors"
                      aria-label="Remove video"
                      data-ocid="post.close_button"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  {/* Upload progress bar */}
                  {(videoUploading || uploadProgress > 0) && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">
                          {videoUploading
                            ? "Uploading video..."
                            : "Video ready"}
                        </span>
                        <span
                          className="font-medium"
                          style={{
                            color:
                              uploadProgress === 100 ? "#16a34a" : "#2563eb",
                          }}
                        >
                          {uploadProgress === 100 ? (
                            <span className="flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" /> Done
                            </span>
                          ) : (
                            `${uploadProgress}%`
                          )}
                        </span>
                      </div>
                      <Progress
                        value={uploadProgress}
                        className="h-1.5"
                        data-ocid="post.loading_state"
                      />
                    </div>
                  )}
                </div>
              )}
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={handleVideoChange}
              />
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100" />

            {/* Featured listing */}
            <div className="rounded-xl border border-amber-100 bg-amber-50 p-4 space-y-2">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="featured"
                  checked={isFeatured}
                  onCheckedChange={(checked) => setIsFeatured(checked === true)}
                  className="mt-0.5"
                  data-ocid="post.checkbox"
                />
                <div className="flex-1">
                  <Label
                    htmlFor="featured"
                    className="flex items-center gap-2 cursor-pointer font-semibold text-sm text-gray-800"
                  >
                    <Star className="h-4 w-4 text-amber-500" />
                    Feature my listing — ₹100
                  </Label>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Featured listings appear at the top of search results for 7
                    days
                  </p>
                </div>
              </div>
              {isFeatured && (
                <Badge className="ml-7 bg-amber-100 text-amber-700 border border-amber-200 text-xs font-normal">
                  ₹100 will be collected at our office or via UPI before
                  activation
                </Badge>
              )}
            </div>

            {/* Free notice */}
            <Alert className="border-green-100 bg-green-50">
              <Upload className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-sm text-green-700">
                Your listing is <strong>100% free</strong> — no hidden fees or
                commissions.
              </AlertDescription>
            </Alert>

            {/* Submit */}
            <Button
              type="submit"
              size="lg"
              className="w-full font-bold rounded-xl text-white py-3 text-base"
              style={{
                background: "linear-gradient(135deg, #0a1929 0%, #1e3a5f 100%)",
                boxShadow: "0 4px 16px rgba(10,25,41,0.35)",
              }}
              disabled={isPending || videoUploading}
              data-ocid="post.submit_button"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {videoUploading ? "Uploading video..." : "Posting Ad..."}
                </>
              ) : (
                "Post Ad for Free →"
              )}
            </Button>

            {/* Beadaholique Notice */}
            <p className="text-xs text-gray-400 text-center pb-2">
              Go to{" "}
              <a
                href="https://www.beadaholique.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline"
              >
                Beadaholique.com
              </a>{" "}
              for all of your beading supply needs!
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
