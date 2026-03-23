import { Camera, ChevronRight, Image, MapPin, X } from "lucide-react";
import { useRef, useState } from "react";
import LocationPickerModal from "./LocationPickerModal";

export interface SellerFormData {
  brand: string;
  title: string;
  description: string;
  price: string;
  location: string;
  photos: File[];
  name: string;
  condition: string;
  auctionType: "live" | "7day";
  photoDataUrls?: string[];
}

const POPULAR_BRANDS = ["iPhone", "Samsung", "Mi", "Vivo", "Oppo", "Realme"];
const ALL_BRANDS = [
  "Apple",
  "Asus",
  "BlackBerry",
  "Gionee",
  "Google Pixel",
  "Honor",
  "HTC",
  "Huawei",
  "Infinix",
  "Intex",
  "Lava",
  "Lenovo",
  "LG",
  "Meizu",
  "Micromax",
  "Motorola",
  "Nokia",
  "OnePlus",
  "OPPO",
  "Panasonic",
  "POCO",
  "Realme",
  "Samsung",
  "Sony",
  "Tecno",
  "Vivo",
  "Xiaomi",
  "ZTE",
];

const CONDITIONS = ["New", "Like New", "Good", "Fair"];

interface BrandPickerProps {
  onSelect: (brand: string) => void;
  onClose: () => void;
}

function BrandPicker({ onSelect, onClose }: BrandPickerProps) {
  const [search, setSearch] = useState("");

  const filteredPopular =
    search.length > 0
      ? POPULAR_BRANDS.filter((b) =>
          b.toLowerCase().includes(search.toLowerCase()),
        )
      : POPULAR_BRANDS;

  const filteredAll =
    search.length > 0
      ? ALL_BRANDS.filter((b) => b.toLowerCase().includes(search.toLowerCase()))
      : ALL_BRANDS;

  return (
    <div
      className="fixed inset-0 z-[160] bg-black/50 flex items-end sm:items-center justify-center"
      data-ocid="seller_form.dialog"
    >
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <h3 className="font-bold text-gray-900 text-lg">Brand</h3>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-500"
            data-ocid="seller_form.close_button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-5 py-3 border-b border-gray-100 shrink-0">
          <input
            type="text"
            placeholder="Search by Brand"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400"
            autoComplete="off"
          />
        </div>

        <div className="overflow-y-auto flex-1">
          {filteredPopular.length > 0 && (
            <>
              <div className="px-5 py-2 bg-gray-50">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Popular
                </span>
              </div>
              {filteredPopular.map((brand) => (
                <button
                  key={`popular-${brand}`}
                  type="button"
                  onClick={() => onSelect(brand)}
                  className="w-full px-5 py-4 text-left hover:bg-blue-50 border-b border-gray-50 text-sm text-gray-800 font-medium transition-colors"
                  data-ocid="seller_form.button"
                >
                  {brand}
                </button>
              ))}
            </>
          )}

          {filteredAll.length > 0 && (
            <>
              <div className="px-5 py-2 bg-gray-50">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  All
                </span>
              </div>
              {filteredAll.map((brand) => (
                <button
                  key={`all-${brand}`}
                  type="button"
                  onClick={() => onSelect(brand)}
                  className="w-full px-5 py-4 text-left hover:bg-blue-50 border-b border-gray-50 text-sm text-gray-800 transition-colors"
                  data-ocid="seller_form.button"
                >
                  {brand}
                </button>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

interface SellerFormWizardProps {
  onSubmit: (data: SellerFormData) => void;
  onCancel: () => void;
  isB2B?: boolean;
  isPending?: boolean;
  initialName?: string;
  initialPhone?: string;
}

const TOTAL_STEPS = 5;

export default function SellerFormWizard({
  onSubmit,
  onCancel,
  isB2B = false,
  isPending = false,
  initialName = "",
  initialPhone = "",
}: SellerFormWizardProps) {
  const [step, setStep] = useState(1);
  const [brand, setBrand] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState(
    () => localStorage.getItem("userLocation") || "",
  );
  const [photos, setPhotos] = useState<File[]>([]);
  const [name, setName] = useState(initialName);
  const [condition, setCondition] = useState("Like New");
  const [auctionType, setAuctionType] = useState<"live" | "7day">("live");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showBrandPicker, setShowBrandPicker] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const btnCls =
    "w-full py-4 rounded-xl font-bold text-white text-base transition-all";
  const disabledBtnCls = "bg-gray-200 text-gray-400 cursor-not-allowed";
  const activeBtnCls = "bg-blue-700 hover:bg-blue-800";

  const goNext = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  const goBack = () => {
    if (step === 1) {
      onCancel();
    } else {
      setStep((s) => Math.max(s - 1, 1));
    }
  };

  const validateStep1 = () => {
    const errs: Record<string, string> = {};
    if (!brand) errs.brand = "Please select a brand";
    if (!title.trim()) errs.title = "Ad title is required";
    if (!description.trim())
      errs.description = "Additional information is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = () => {
    const errs: Record<string, string> = {};
    if (!price.trim() || Number.isNaN(Number(price)) || Number(price) <= 0)
      errs.price = "Please enter a valid price";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext1 = () => {
    if (validateStep1()) goNext();
  };

  const handleNext2 = () => {
    if (validateStep2()) goNext();
  };

  const handlePhotoAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setPhotos((prev) => [...prev, ...files].slice(0, 5));
    if (photoInputRef.current) photoInputRef.current.value = "";
  };

  const handleSubmit = async () => {
    let photoDataUrls: string[] | undefined;
    if (photos.length > 0) {
      photoDataUrls = await Promise.all(
        photos.map(
          (file) =>
            new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onload = (e) => resolve(e.target?.result as string);
              reader.readAsDataURL(file);
            }),
        ),
      );
    }
    onSubmit({
      brand,
      title,
      description,
      price,
      location,
      photos,
      name,
      condition,
      auctionType,
      photoDataUrls,
    });
  };

  const stepLabel = [
    "",
    "Include some details",
    "Set a price",
    "Set a location",
    "Upload your photos",
    "Review your details",
  ][step];

  return (
    <>
      <div
        className="fixed inset-0 z-[100] bg-white overflow-y-auto flex flex-col"
        data-ocid="seller_form.modal"
      >
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-100">
          <div className="flex items-center gap-3 px-4 py-3">
            <button
              type="button"
              onClick={goBack}
              className="flex items-center gap-1.5 text-blue-600 font-semibold text-sm"
              data-ocid="seller_form.secondary_button"
            >
              ← Back
            </button>
            <div className="flex-1 text-center">
              <h2 className="font-bold text-gray-900 text-base">{stepLabel}</h2>
            </div>
            <div className="text-xs text-gray-400 font-medium">
              {step}/{TOTAL_STEPS}
            </div>
          </div>
          {/* Progress bar */}
          <div className="h-0.5 bg-gray-100">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
            />
          </div>
        </div>

        <div className="flex-1 max-w-lg mx-auto w-full px-4 py-6 space-y-0">
          {/* ── Step 1: Details ── */}
          {step === 1 && (
            <div className="space-y-5">
              {/* Brand */}
              <div>
                <p className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Brand <span className="text-red-500">*</span>
                </p>
                <button
                  type="button"
                  onClick={() => setShowBrandPicker(true)}
                  className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl border text-left transition-colors ${
                    errors.brand
                      ? "border-red-400 bg-red-50"
                      : "border-gray-200 bg-gray-50 hover:border-blue-400"
                  }`}
                  data-ocid="seller_form.select"
                >
                  <span
                    className={
                      brand ? "text-gray-900 font-medium" : "text-gray-400"
                    }
                  >
                    {brand || "Select Brand"}
                  </span>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </button>
                {errors.brand && (
                  <p
                    className="text-red-500 text-xs mt-1"
                    data-ocid="seller_form.error_state"
                  >
                    {errors.brand}
                  </p>
                )}
              </div>

              {/* Ad title */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-semibold text-gray-700">
                    Ad title <span className="text-red-500">*</span>
                  </span>
                  <span className="text-xs text-gray-400">
                    {title.length}/70
                  </span>
                </div>
                <input
                  type="text"
                  placeholder="Key features of your item"
                  value={title}
                  onChange={(e) => setTitle(e.target.value.slice(0, 70))}
                  className={`w-full px-4 py-3.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 transition-colors ${
                    errors.title
                      ? "border-red-400 bg-red-50 focus:border-red-400"
                      : "border-gray-200 bg-gray-50 focus:border-blue-400"
                  }`}
                  data-ocid="seller_form.input"
                />
                {errors.title && (
                  <p
                    className="text-red-500 text-xs mt-1"
                    data-ocid="seller_form.error_state"
                  >
                    {errors.title}
                  </p>
                )}
              </div>

              {/* Condition */}
              <div>
                <p className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Condition <span className="text-red-500">*</span>
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {CONDITIONS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCondition(c)}
                      className={`py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                        condition === c
                          ? "border-blue-600 bg-blue-50 text-blue-700"
                          : "border-gray-200 text-gray-600 hover:border-blue-300"
                      }`}
                      data-ocid="seller_form.toggle"
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* B2B Auction Type */}
              {isB2B && (
                <div>
                  <p className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Auction Type
                  </p>
                  <div className="flex p-1 rounded-full bg-gray-100">
                    {(["live", "7day"] as const).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setAuctionType(type)}
                        className={`flex-1 text-xs font-semibold py-2 rounded-full transition-all duration-200 ${
                          auctionType === type
                            ? "bg-blue-600 text-white shadow-sm"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                        data-ocid="seller_form.toggle"
                      >
                        {type === "live"
                          ? "⚡ Live 20 min"
                          : "📅 7-Day Auction"}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional information */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-semibold text-gray-700">
                    Additional information{" "}
                    <span className="text-red-500">*</span>
                  </span>
                  <span className="text-xs text-gray-400">
                    {description.length}/4096
                  </span>
                </div>
                <textarea
                  placeholder="Include condition, features and reasons for selling"
                  value={description}
                  onChange={(e) =>
                    setDescription(e.target.value.slice(0, 4096))
                  }
                  rows={4}
                  className={`w-full px-4 py-3.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 resize-none transition-colors ${
                    errors.description
                      ? "border-red-400 bg-red-50 focus:border-red-400"
                      : "border-gray-200 bg-gray-50 focus:border-blue-400"
                  }`}
                  data-ocid="seller_form.textarea"
                />
                {errors.description && (
                  <p
                    className="text-red-500 text-xs mt-1"
                    data-ocid="seller_form.error_state"
                  >
                    {errors.description}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={handleNext1}
                className={`${btnCls} ${activeBtnCls}`}
                data-ocid="seller_form.primary_button"
              >
                Next
              </button>
            </div>
          )}

          {/* ── Step 2: Price ── */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <p className="block text-sm font-semibold text-gray-700 mb-3">
                  Price
                </p>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold text-lg">
                    ₹
                  </span>
                  <input
                    type="number"
                    placeholder="Enter price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className={`w-full pl-9 pr-4 py-5 rounded-xl border text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-100 ${
                      errors.price
                        ? "border-red-400 bg-red-50"
                        : "border-gray-200 bg-gray-50 focus:border-blue-400"
                    }`}
                    min="1"
                    data-ocid="seller_form.input"
                  />
                </div>
                {errors.price && (
                  <p
                    className="text-red-500 text-xs mt-1"
                    data-ocid="seller_form.error_state"
                  >
                    {errors.price}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={handleNext2}
                className={`${btnCls} ${activeBtnCls}`}
                data-ocid="seller_form.primary_button"
              >
                Next
              </button>
            </div>
          )}

          {/* ── Step 3: Location ── */}
          {step === 3 && (
            <div className="space-y-5">
              <button
                type="button"
                onClick={() => setShowLocationPicker(true)}
                className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-blue-400 bg-gray-50 hover:bg-blue-50 transition-colors text-left"
                data-ocid="seller_form.select"
              >
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-gray-400 shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">
                      Location
                    </p>
                    <p
                      className={`text-sm ${
                        location ? "text-blue-600 font-medium" : "text-gray-400"
                      }`}
                    >
                      {location || "City, Area or Suburb"}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-300" />
              </button>

              <button
                type="button"
                onClick={goNext}
                disabled={!location}
                className={`${btnCls} ${
                  location ? activeBtnCls : disabledBtnCls
                }`}
                data-ocid="seller_form.primary_button"
              >
                Next
              </button>
            </div>
          )}

          {/* ── Step 4: Photos ── */}
          {step === 4 && (
            <div className="space-y-5">
              {/* Upload buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  className="flex flex-col items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed border-blue-300 bg-blue-50 hover:bg-blue-100 transition-colors text-blue-600"
                  data-ocid="seller_form.upload_button"
                >
                  <Camera className="h-7 w-7" />
                  <span className="text-xs font-semibold">Camera</span>
                </button>
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  className="flex flex-col items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed border-blue-300 bg-blue-50 hover:bg-blue-100 transition-colors text-blue-600"
                  data-ocid="seller_form.upload_button"
                >
                  <Image className="h-7 w-7" />
                  <span className="text-xs font-semibold">Gallery</span>
                </button>
              </div>

              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handlePhotoAdd}
              />

              {/* Selected photos strip */}
              {photos.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-2">
                    Selected photos ({photos.length}/5)
                  </p>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {photos.map((photo, i) => (
                      <div
                        key={`${photo.name}-${photo.size}-${i}`}
                        className="relative shrink-0 w-20 h-20 rounded-xl overflow-hidden border border-gray-200"
                        data-ocid={`seller_form.item.${i + 1}`}
                      >
                        <img
                          src={URL.createObjectURL(photo)}
                          alt={`Selected item ${i + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setPhotos((prev) =>
                              prev.filter((_, idx) => idx !== i),
                            )
                          }
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center"
                          data-ocid={`seller_form.delete_button.${i + 1}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    {/* Empty placeholders */}
                    {["a", "b", "c", "d", "e"]
                      .slice(0, Math.max(0, 5 - photos.length))
                      .map((k) => (
                        <div
                          key={k}
                          className="shrink-0 w-20 h-20 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50"
                        />
                      ))}
                  </div>
                </div>
              )}

              {photos.length === 0 && (
                <div className="flex gap-2">
                  {["s1", "s2", "s3", "s4", "s5"].map((k) => (
                    <div
                      key={k}
                      className="shrink-0 w-16 h-16 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50"
                    />
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={goNext}
                className={`${btnCls} ${activeBtnCls}`}
                data-ocid="seller_form.primary_button"
              >
                Next
              </button>
            </div>
          )}

          {/* ── Step 5: Review ── */}
          {step === 5 && (
            <div className="space-y-5">
              {/* Profile avatar */}
              <div className="flex flex-col items-center py-4">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-gray-100 border-2 border-gray-200 flex items-center justify-center text-3xl">
                    👤
                  </div>
                  <button
                    type="button"
                    className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center shadow"
                    data-ocid="seller_form.edit_button"
                  >
                    <Camera className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Name */}
              <div>
                <p className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Name
                </p>
                <input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  data-ocid="seller_form.input"
                />
              </div>

              {/* Phone */}
              <div>
                <p className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Verified phone number
                </p>
                <div className="flex items-center gap-2 px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50">
                  <span className="text-sm text-gray-700 flex-1">
                    {initialPhone || "+91 XXXXX XXXXX"}
                  </span>
                  <span className="text-blue-600 text-xs font-semibold flex items-center gap-1">
                    ✓ Verified
                  </span>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-gray-50 rounded-xl border border-gray-100 p-4 space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Listing Summary
                </p>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Brand</span>
                  <span className="font-medium text-gray-900">{brand}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Price</span>
                  <span className="font-medium text-gray-900">
                    ₹{Number(price).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Location</span>
                  <span className="font-medium text-gray-900">{location}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Condition</span>
                  <span className="font-medium text-gray-900">{condition}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={isPending}
                className={`${btnCls} ${isPending ? disabledBtnCls : activeBtnCls}`}
                data-ocid="seller_form.submit_button"
              >
                {isPending ? "Posting…" : "Post now"}
              </button>
            </div>
          )}
        </div>
      </div>

      {showBrandPicker && (
        <BrandPicker
          onSelect={(b) => {
            setBrand(b);
            setErrors((prev) => ({ ...prev, brand: "" }));
            setShowBrandPicker(false);
          }}
          onClose={() => setShowBrandPicker(false)}
        />
      )}

      <LocationPickerModal
        open={showLocationPicker}
        onClose={() => setShowLocationPicker(false)}
        onSelect={(loc) => setLocation(loc)}
      />
    </>
  );
}
