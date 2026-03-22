import type { Listing } from "@/backend";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
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
  ImagePlus,
  Loader2,
  MapPin,
  Upload,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
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

interface ImagePreview {
  file: File;
  previewUrl: string;
}

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
  const [images, setImages] = useState<ImagePreview[]>([]);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleModelChange = (m: string) => {
    setModel(m);
    // Auto-suggest title only if user hasn't typed anything yet
    setTitle((prev) => (prev ? prev : m));
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }
    setDetectingLocation(true);
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
          toast.error(
            "Location access denied. Please allow it in browser settings.",
          );
        } else {
          toast.error("Could not get your location.");
        }
      },
      { timeout: 10000 },
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const newPreviews: ImagePreview[] = files.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...newPreviews].slice(0, 6));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (index: number) => {
    setImages((prev) => {
      URL.revokeObjectURL(prev[index].previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error("Please login to post an ad");
      return;
    }
    if (
      !title ||
      !category ||
      !condition ||
      !price ||
      !location ||
      !description
    ) {
      toast.error("Please fill in all required fields");
      return;
    }
    const priceNum = Number.parseInt(price, 10);
    if (Number.isNaN(priceNum) || priceNum <= 0) {
      toast.error("Please enter a valid price");
      return;
    }

    try {
      const externalBlobs = await Promise.all(
        images.map(async (img) => {
          const buffer = await img.file.arrayBuffer();
          return ExternalBlob.fromBytes(new Uint8Array(buffer));
        }),
      );

      const modelPrefix = model ? `[Model: ${model}]\n` : "";

      const listing: Listing = {
        id: "",
        title: title.trim(),
        description: `${modelPrefix}${description.trim()}`,
        seller: identity!.getPrincipal() as any,
        timestamp: BigInt(Date.now()) * BigInt(1_000_000),
        category: category as ListingCategory,
        price: BigInt(priceNum),
        location: location.trim(),
        condition: condition as ListingCondition,
        images: externalBlobs,
      };

      const newId = await createListing(listing);
      for (const img of images) {
        URL.revokeObjectURL(img.previewUrl);
      }
      toast.success("Ad posted successfully! 🎉");
      navigate({ to: "/listing/$listingId", params: { listingId: newId } });
    } catch {
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

        {/* Images */}
        <div className="space-y-2">
          <Label>Photos (up to 6)</Label>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {images.map((img, i) => (
              <div
                key={img.previewUrl}
                className="relative aspect-square rounded-2xl overflow-hidden border border-border"
              >
                <img
                  src={img.previewUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute top-1 right-1 bg-black/50 hover:bg-black/70 text-white rounded-full p-0.5 transition-colors"
                  aria-label="Remove image"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            {images.length < 6 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square rounded-2xl border-2 border-dashed border-border hover:border-primary bg-muted/50 hover:bg-muted transition-colors flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary"
                data-ocid="post.upload_button"
              >
                <ImagePlus className="h-6 w-6" />
                <span className="text-xs font-medium">Add Photo</span>
              </button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileChange}
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

        {/* Error */}
        {!isAuthenticated && (
          <Alert variant="destructive" data-ocid="post.error_state">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Please login to post an ad.</AlertDescription>
          </Alert>
        )}

        <Button
          type="submit"
          size="lg"
          className="w-full font-semibold"
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
      </form>
    </div>
  );
}
