import type { Listing } from "@/backend";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  AlertCircle,
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
  ExternalBlob,
  ListingCategory,
  ListingCondition,
  useCreateListing,
} from "../hooks/useQueries";
import { encodeGeoLocation, reverseGeocode } from "../utils/geo";

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

    // Build video blobs — skip gracefully if upload/encoding fails
    let videoBlobs: ExternalBlob[] = [];
    if (videoFile) {
      try {
        const buffer = await videoFile.arrayBuffer();
        videoBlobs = [ExternalBlob.fromBytes(new Uint8Array(buffer))];
      } catch {
        // video upload failed — proceed without it
        toast("Video could not be processed — ad will be posted without it.");
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
      navigate({ to: "/" });
      toast.error("Failed to post ad. Please try again.");
    }
  };

  const locationDisplay = location.includes("|")
    ? location.split("|")[1]
    : location;

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-md text-center">
        <span className="text-6xl mb-4 block">🔒</span>
        <h2 className="font-display font-bold text-2xl mb-2">
          Login to Post an Ad
        </h2>
        <p className="text-muted-foreground text-sm mb-6">
          Create a free account to start selling your gadgets.
        </p>
        <Button
          onClick={() => login()}
          disabled={isLoggingIn}
          size="lg"
          className="w-full"
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
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl">Post a Free Ad</h1>
        <p className="text-muted-foreground text-sm mt-1">
          List your gadget in minutes
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5"
        data-ocid="post.panel"
      >
        {/* Category + Condition */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="category">
              Category <span className="text-destructive">*</span>
            </Label>
            <Select
              value={category}
              onValueChange={(v) => {
                setCategory(v as ListingCategory);
                setModel("");
              }}
            >
              <SelectTrigger data-ocid="post.select">
                <SelectValue placeholder="Select category" />
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
            <Label htmlFor="condition">
              Condition <span className="text-destructive">*</span>
            </Label>
            <Select
              value={condition}
              onValueChange={(v) => setCondition(v as ListingCondition)}
            >
              <SelectTrigger data-ocid="post.select">
                <SelectValue placeholder="Select condition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ListingCondition.new_}>🟢 New</SelectItem>
                <SelectItem value={ListingCondition.likeNew}>
                  🔵 Like New
                </SelectItem>
                <SelectItem value={ListingCondition.good}>🟡 Good</SelectItem>
                <SelectItem value={ListingCondition.fair}>🟠 Fair</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Model selector — appears when category is set */}
        {category && (
          <div className="space-y-1.5">
            <Label>
              Model <span className="text-destructive">*</span>
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
          <Label htmlFor="title">
            Title <span className="text-destructive">*</span>
          </Label>
          <Input
            id="title"
            placeholder="e.g. iPhone 15 Pro 256GB Space Black"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
            data-ocid="post.input"
          />
        </div>

        {/* Price + Location */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="price">
              Price (₹) <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                ₹
              </span>
              <Input
                id="price"
                type="number"
                placeholder="e.g. 45000"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="pl-7"
                min="1"
                data-ocid="post.input"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="location">
              Location <span className="text-destructive">*</span>
            </Label>
            <div className="flex gap-1.5">
              <Input
                ref={locationInputRef}
                id="location"
                placeholder="e.g. Mumbai, Maharashtra"
                value={locationDisplay}
                onChange={(e) => setLocation(e.target.value)}
                className="flex-1 min-w-0"
                data-ocid="post.input"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleDetectLocation}
                disabled={detectingLocation}
                className="shrink-0 px-2 h-10 text-muted-foreground hover:text-primary"
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

        {/* Location Help Panel */}
        {showLocationHelp && locationError && (
          <div
            className="rounded-xl border border-primary/30 bg-primary/5 p-4 relative"
            style={{ boxShadow: "0 0 12px oklch(0.72 0.2 220 / 0.1)" }}
            data-ocid="post.panel"
          >
            <button
              type="button"
              onClick={() => setShowLocationHelp(false)}
              className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Dismiss"
              data-ocid="post.close_button"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="flex items-start gap-2 mb-3">
              <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <p className="text-sm font-medium text-foreground">
                Location access is blocked
              </p>
            </div>
            <p className="text-xs text-muted-foreground mb-2 ml-6">
              To enable location access:
            </p>
            <ul className="text-xs text-muted-foreground space-y-1 ml-6 mb-4">
              <li>
                <span className="text-foreground font-medium">
                  Chrome/Edge:
                </span>{" "}
                Click the lock icon in the address bar → Site settings →
                Location → Allow
              </li>
              <li>
                <span className="text-foreground font-medium">Safari:</span>{" "}
                Settings → Safari → Location → Allow
              </li>
              <li>
                <span className="text-foreground font-medium">Firefox:</span>{" "}
                Click the lock icon → Clear permissions → Reload
              </li>
            </ul>
            <div className="flex gap-2 ml-6">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleDetectLocation}
                disabled={detectingLocation}
                className="text-xs border-primary/40 hover:bg-primary/10 hover:border-primary"
                data-ocid="post.secondary_button"
              >
                {detectingLocation ? (
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                ) : null}
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
                className="text-xs hover:text-primary"
                data-ocid="post.secondary_button"
              >
                Enter Manually
              </Button>
            </div>
          </div>
        )}

        {/* Description */}
        <div className="space-y-1.5">
          <Label htmlFor="description">
            Description <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="description"
            placeholder="Describe the device, any accessories included, reason for selling..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            maxLength={1000}
            data-ocid="post.textarea"
          />
          <p className="text-xs text-muted-foreground text-right">
            {description.length}/1000
          </p>
        </div>

        {/* WhatsApp Number */}
        <div className="space-y-2">
          <Label
            htmlFor="whatsapp"
            className="flex items-center gap-2 text-sm font-medium"
          >
            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-[#25D366] text-white text-[10px] font-bold">
              W
            </span>
            WhatsApp Number{" "}
            <span className="text-muted-foreground font-normal">
              (optional)
            </span>
          </Label>
          <Input
            id="whatsapp"
            placeholder="+91 98765 43210"
            value={whatsappNumber}
            onChange={(e) => setWhatsappNumber(e.target.value)}
            className="rounded-xl"
            data-ocid="post.input"
          />
          <p className="text-xs text-muted-foreground">
            Buyers can reach you directly on WhatsApp
          </p>
        </div>

        {/* Featured Listing Toggle */}
        <div className="rounded-xl border border-border bg-card p-4 space-y-2">
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
                className="flex items-center gap-2 cursor-pointer font-semibold text-sm"
              >
                <Star className="h-4 w-4 text-amber-500" />
                Feature my listing — ₹100
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                Featured listings appear at the top of search results for 7 days
              </p>
            </div>
          </div>
          {isFeatured && (
            <Badge
              variant="secondary"
              className="ml-7 bg-amber-50 text-amber-700 border border-amber-200 text-xs"
            >
              ₹100 will be collected at our office or via UPI before activation
            </Badge>
          )}
        </div>

        {/* 360° Video Upload — optional */}
        <div className="space-y-2">
          <Label>
            360° Device Video{" "}
            <span className="text-muted-foreground font-normal">
              (optional)
            </span>
          </Label>
          <p className="text-xs text-muted-foreground">
            Upload a complete 360° walkthrough video of your device
          </p>
          {!videoFile ? (
            <button
              type="button"
              onClick={() => videoInputRef.current?.click()}
              className="w-full flex flex-col items-center justify-center gap-2 py-8 rounded-2xl border-2 border-dashed border-border/60 hover:border-primary/50 bg-muted/50 hover:bg-primary/5 transition-colors text-muted-foreground hover:text-primary"
              data-ocid="post.upload_button"
            >
              <Video className="h-8 w-8" />
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
                  className="w-full rounded-xl max-h-56 bg-black"
                >
                  <track kind="captions" />
                </video>
              )}
              <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-muted/60 border border-border">
                <div className="flex items-center gap-2 min-w-0">
                  <Video className="h-4 w-4 shrink-0 text-primary" />
                  <span className="text-sm truncate text-foreground">
                    {videoFile.name}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={removeVideo}
                  className="shrink-0 p-1 rounded-full hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-colors"
                  aria-label="Remove video"
                  data-ocid="post.close_button"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
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

        {/* Notice */}
        <Alert className="border-primary/20 bg-primary/5">
          <Upload className="h-4 w-4 text-primary" />
          <AlertDescription className="text-sm">
            Your listing is <strong>100% free</strong> with no hidden fees or
            commissions.
          </AlertDescription>
        </Alert>

        {/* Auth error */}
        {!isAuthenticated && (
          <Alert variant="destructive" data-ocid="post.error_state">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Please login to post an ad.</AlertDescription>
          </Alert>
        )}

        <Button
          type="submit"
          size="lg"
          className="w-full font-semibold shadow-glow-sm hover:shadow-glow-primary transition-all duration-300"
          disabled={isPending}
          data-ocid="post.submit_button"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Posting Ad...
            </>
          ) : (
            "Post Ad for Free"
          )}
        </Button>

        {/* Beadaholique Notice */}
        <p className="text-xs text-muted-foreground text-center pb-2">
          Go to{" "}
          <a
            href="https://www.beadaholique.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline"
          >
            Beadaholique.com
          </a>{" "}
          for all of your beading supply needs!
        </p>
      </form>
    </div>
  );
}
